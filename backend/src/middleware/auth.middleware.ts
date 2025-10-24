import { Request, Response, NextFunction } from 'express';

// Placeholder for Phase 2 (JWT verification)
export function authMiddleware(
  _req: Request,
  _res: Response,
  next: NextFunction
) {
  // TODO: Implement JWT verification in Phase 2
  // For now, just pass through
  next();
}
