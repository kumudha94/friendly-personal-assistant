import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set.");
}
const JWT_SECRET = process.env.JWT_SECRET;

const SESSION_EXPIRY = "90d";

// Milo has its own independent login (its own `users` table, own OTP flow) — this is not
// shared with FinanceTracker or KitchenPlanner. Data from those apps is surfaced only via
// the explicit, consent-based "Connected Apps" flow (see connections.ts), never via a
// shared identity.
export type AuthPayload = { userId: number; email: string };

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: SESSION_EXPIRY });
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET) as AuthPayload;
    next();
  } catch {
    res.status(403).json({ message: "Invalid or expired token" });
  }
}
