import type { NextFunction, Request, RequestHandler, Response } from "express";

// Express 4 doesn't forward rejected promises from async route handlers to the error
// middleware on its own — an unhandled rejection would otherwise crash the whole process.
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
