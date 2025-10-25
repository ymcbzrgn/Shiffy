/**
 * Manager Authentication Middleware
 *
 * Verifies JWT token and ensures user is a manager
 *
 * NOTE: For MVP, uses same JWT system as employees
 * In production, this will verify Supabase Auth tokens
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';

/**
 * Manager Auth Middleware
 *
 * Verifies JWT token and checks user_type === 'manager'
 *
 * @example
 * router.get('/employees', managerAuthMiddleware, handler);
 */
export function managerAuthMiddleware(
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
    const token = authHeader.substring(7);

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

    // Check if user is manager
    if (decoded.user_type !== 'manager') {
      res.status(403).json({
        success: false,
        error: 'Access denied. Manager role required.',
      });
      return;
    }

    // Attach user info to request
    req.user = decoded;

    // Proceed to next middleware/handler
    next();
  } catch (error) {
    console.error('Manager auth middleware error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
}
