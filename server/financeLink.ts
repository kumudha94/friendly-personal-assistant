import { eq } from "drizzle-orm";
import { db } from "./db";
import { emailOtps, financeLink } from "@shared/schema";
import { findFinanceUserIdByEmail, getAccountBalance, getBillsDueThisMonth, type FinanceBillItem } from "./financeDb";
import { sendOtpEmail } from "./emailjs";

const OTP_TTL_MS = 5 * 60 * 1000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function requestOtp(email: string): Promise<void> {
  if (!EMAIL_REGEX.test(email)) {
    throw new Error("Enter a valid email address.");
  }

  const financeUserId = await findFinanceUserIdByEmail(email);
  if (!financeUserId) {
    throw new Error("No FinanceTracker account found for that email.");
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  await db.delete(emailOtps).where(eq(emailOtps.email, email));
  await db.insert(emailOtps).values({ email, code, expiresAt });

  await sendOtpEmail(email, code, expiresAt);
}

export async function verifyOtp(email: string, code: string): Promise<{ email: string }> {
  const [otp] = await db.select().from(emailOtps).where(eq(emailOtps.email, email));
  if (!otp || otp.code !== code) {
    throw new Error("That code doesn't match.");
  }
  if (otp.expiresAt.getTime() < Date.now()) {
    throw new Error("That code has expired — request a new one.");
  }

  const financeUserId = await findFinanceUserIdByEmail(email);
  if (!financeUserId) {
    throw new Error("No FinanceTracker account found for that email.");
  }

  await db.delete(financeLink);
  await db.insert(financeLink).values({ email, financeUserId });
  await db.delete(emailOtps).where(eq(emailOtps.email, email));

  return { email };
}

export async function unlink(): Promise<void> {
  await db.delete(financeLink);
}

export type FinanceSnapshot =
  | { linked: false }
  | { linked: true; email: string; balance: number; totalDue: number; items: FinanceBillItem[] };

export async function getSnapshot(): Promise<FinanceSnapshot> {
  const [link] = await db.select().from(financeLink);
  if (!link) return { linked: false };

  const [balance, items] = await Promise.all([
    getAccountBalance(link.financeUserId),
    getBillsDueThisMonth(link.financeUserId),
  ]);

  return {
    linked: true,
    email: link.email,
    balance,
    totalDue: items.reduce((sum, item) => sum + item.amount, 0),
    items,
  };
}
