/**
 * Manager-Only Middleware
 * 
 * Ensures only managers can access certain routes
 * Must be used AFTER authMiddleware
 */

import { Request, Response, NextFunction } from 'express';
import type { JWTPayload } from '../utils/jwt.utils';

/**
 * Manager-Only Middleware
 * 
 * Verifies that authenticated user is a manager
 * 
 * @example
 * router.post('/manager-only', authMiddleware, managerOnlyMiddleware, handler);
 */
export function managerOnlyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const user = req.user as JWTPayload;

  if (!user) {
    console.warn('[ManagerOnly] ⚠️ No user found in request - authMiddleware not run?');
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
    });
    return;
  }

  if (user.user_type !== 'manager') {
    console.warn(`[ManagerOnly] ❌ Access denied - User type: ${user.user_type} (expected: manager)`);
    res.status(403).json({
      success: false,
      error: 'Forbidden: Only managers can access this resource',
    });
    return;
  }

  console.log(`[ManagerOnly] ✅ Manager access granted - User: ${user.user_id}`);
  
  // User is a manager, proceed
  next();
}
