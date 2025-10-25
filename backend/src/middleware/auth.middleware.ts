/**
 * Authentication Middleware
 *
 * JWT token verification for protected routes
 * Attaches decoded user info to req.user
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, type JWTPayload } from '../utils/jwt.utils';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication Middleware
 *
 * Verifies JWT token from Authorization header
 * Attaches decoded payload to req.user
 *
 * @example
 * router.post('/protected', authMiddleware, handler);
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: 'No authorization header provided',
      });
      return;
    }

    // Check Bearer format
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Invalid authorization format. Use: Bearer <token>',
      });
      return;
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer "

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'No token provided',
      });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
      return;
    }

    // Attach user info to request
    req.user = decoded;

    // Proceed to next middleware/handler
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
}

/**
 * Optional: Manager-only middleware
 * (For future use when manager endpoints are added)
 */
export function managerOnly(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.user_type !== 'manager') {
    res.status(403).json({
      success: false,
      error: 'Access denied. Manager role required.',
    });
    return;
  }
  next();
}

/**
 * Optional: Employee-only middleware
 */
export function employeeOnly(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.user_type !== 'employee') {
    res.status(403).json({
      success: false,
      error: 'Access denied. Employee role required.',
    });
    return;
  }
  next();
}
