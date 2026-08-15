import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set.");
}
const JWT_SECRET = process.env.JWT_SECRET;

// Milo has no login system of its own — identity is FinanceTracker's (one shared login
// across FinanceTracker/KitchenPlanner/Milo). This just verifies a token FinanceTracker
// issued. This env var is named JWT_SECRET here, but its value must equal FinanceTracker's
// SESSION_SECRET — FinanceTracker's own jwtService.ts falls back to SESSION_SECRET for
// signing since it has no JWT_SECRET set in its own environment. FinanceTracker's payload
// also has a `type: "access" | "refresh"` field this doesn't care about.
export type AuthPayload = { userId: number; email: string };

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
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
