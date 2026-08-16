import { eq } from "drizzle-orm";
import { db } from "./db";
import { appConnections } from "@shared/schema";

// The registry of apps Milo can optionally read from — extensible, add a row when a new
// sibling app exists. Each app's own backend owns its own OTP/email — Milo never generates
// or sends the "prove you own this account" code itself, it just proxies the request to
// that app's own /api/auth endpoints, so the email a user gets is correctly branded as
// coming from that app.
export type ConnectableAppId = "financetracker" | "kitchenplanner";

type AppDef = {
  id: ConnectableAppId;
  name: string;
  baseUrl: string;
  requestOtpBody: (email: string) => Record<string, unknown>;
  verifyOtpBody: (email: string, code: string) => Record<string, unknown>;
  extractUserId: (verifyResponseBody: any) => number | null;
};

const APPS: AppDef[] = [
  {
    id: "financetracker",
    name: "FinanceTracker",
    baseUrl: "https://financetracker-ckvf.onrender.com",
    requestOtpBody: (email) => ({ email, username: email.split("@")[0] }),
    verifyOtpBody: (email, code) => ({ email, otp: code }),
    extractUserId: (body) => body?.user?.id ?? null,
  },
  {
    id: "kitchenplanner",
    name: "KitchenPlanner",
    baseUrl: "https://kitchenplanner-api.onrender.com",
    requestOtpBody: (email) => ({ email, username: email.split("@")[0] }),
    verifyOtpBody: (email, code) => ({ email, code }),
    extractUserId: (body) => body?.user?.id ?? null,
  },
];

function findApp(appId: string): AppDef {
  const app = APPS.find((a) => a.id === appId);
  if (!app) throw new Error(`Unknown app "${appId}"`);
  return app;
}

export type ConnectionEntry = {
  appId: ConnectableAppId;
  name: string;
  status: "not_installed" | "connectable" | "connected";
  email?: string;
};

async function checkExists(app: AppDef, email: string): Promise<boolean> {
  try {
    const res = await fetch(`${app.baseUrl}/api/auth/exists?email=${encodeURIComponent(email)}`);
    if (!res.ok) return false;
    const body = (await res.json()) as { exists?: boolean };
    return !!body.exists;
  } catch {
    // Target app unreachable (cold-starting free-tier Render instance, etc.) — treat as
    // "can't tell yet" rather than crashing the whole connections list.
    return false;
  }
}

export async function getConnectionsSnapshot(userEmail: string): Promise<ConnectionEntry[]> {
  const links = await db.select().from(appConnections);
  const linkByApp = new Map(links.map((l) => [l.appId, l]));

  return Promise.all(
    APPS.map(async (app): Promise<ConnectionEntry> => {
      const link = linkByApp.get(app.id);
      if (link) {
        return { appId: app.id, name: app.name, status: "connected", email: link.email };
      }
      const exists = await checkExists(app, userEmail);
      return { appId: app.id, name: app.name, status: exists ? "connectable" : "not_installed" };
    })
  );
}

export async function requestConnectOtp(appId: string, email: string): Promise<void> {
  const app = findApp(appId);
  const res = await fetch(`${app.baseUrl}/api/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(app.requestOtpBody(email)),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    throw new Error(body.error ?? body.message ?? `Couldn't send a code from ${app.name}.`);
  }
}

export async function verifyConnectOtp(appId: string, email: string, code: string): Promise<void> {
  const app = findApp(appId);
  const res = await fetch(`${app.baseUrl}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(app.verifyOtpBody(email, code)),
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
  if (!res.ok) {
    throw new Error(body.error ?? body.message ?? "That code didn't work.");
  }

  const externalUserId = app.extractUserId(body);
  await db.delete(appConnections).where(eq(appConnections.appId, appId));
  await db.insert(appConnections).values({ appId, email, externalUserId });
}

export async function disconnectApp(appId: string): Promise<void> {
  await db.delete(appConnections).where(eq(appConnections.appId, appId));
}

export async function getConnection(appId: ConnectableAppId) {
  const [link] = await db.select().from(appConnections).where(eq(appConnections.appId, appId));
  return link;
}
