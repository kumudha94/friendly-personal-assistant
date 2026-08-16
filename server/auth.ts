import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, emailOtps, type User } from "@shared/schema";
import { sendOtpEmail } from "./emailjs";
import { signToken } from "./authMiddleware";

const OTP_TTL_MS = 5 * 60 * 1000;

function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// One-step signup: request-otp creates the account immediately if it doesn't exist yet, so
// verify-otp can always just return a token directly — no separate signup step.
export async function requestOtp(email: string, name: string): Promise<void> {
  let [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    [user] = await db.insert(users).values({ email, name }).returning();
  }

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  await db.delete(emailOtps).where(eq(emailOtps.email, email));
  await db.insert(emailOtps).values({ email, code, expiresAt });
  await sendOtpEmail(email, code, expiresAt);
}

export async function verifyOtp(email: string, code: string): Promise<{ token: string; user: User }> {
  const [otp] = await db.select().from(emailOtps).where(eq(emailOtps.email, email));
  if (!otp || otp.code !== code) {
    throw new Error("That code doesn't match.");
  }
  if (otp.expiresAt.getTime() < Date.now()) {
    throw new Error("That code has expired — request a new one.");
  }
  await db.delete(emailOtps).where(eq(emailOtps.email, email));

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    throw new Error("Account not found — request a new code.");
  }

  const token = signToken({ userId: user.id, email: user.email });
  return { token, user };
}

// Read-only existence check for the cross-app "Connected Apps" flow (KitchenPlanner asking
// "does an account with this email exist in Milo") — never creates an account.
export async function userExists(email: string): Promise<boolean> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return !!user;
}

export async function findUserById(id: number): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function deleteUser(id: number): Promise<void> {
  await db.delete(users).where(eq(users.id, id));
}
