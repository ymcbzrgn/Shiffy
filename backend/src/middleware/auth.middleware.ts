/**
 * Authentication Middleware
 *
 * JWT token verification for protected routes
 * Attaches decoded user info to req.user
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, type JWTPayload } from '../utils/jwt.utils';
import { supabase } from '../config/supabase.config';
import { logger } from '../utils/logger';

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
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    logger.auth(`${req.method} ${req.path} - Header: ${authHeader ? 'Present' : 'Missing'}`);

    if (!authHeader) {
      logger.warn('No authorization header provided', 'Auth');
      res.status(401).json({
        success: false,
        error: 'No authorization header provided',
      });
      return;
    }

    // Check Bearer format
    if (!authHeader.startsWith('Bearer ')) {
      logger.warn('Invalid authorization format', 'Auth');
      res.status(401).json({
        success: false,
        error: 'Invalid authorization format. Use: Bearer <token>',
      });
      return;
    }

    // Extract token (NEVER log token content - security risk)
    const token = authHeader.substring(7);

    if (!token) {
      logger.warn('Empty token provided', 'Auth');
      res.status(401).json({
        success: false,
        error: 'No token provided',
      });
      return;
    }

    // Verify token - try custom JWT first (for employees)
    let decoded = verifyToken(token);

    if (!decoded) {
      // If custom JWT fails, try Supabase token (for managers)
      logger.debug('Custom JWT failed, trying Supabase token...', 'Auth');

      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
          logger.warn('Supabase token verification failed', 'Auth');
          res.status(401).json({
            success: false,
            error: 'Invalid or expired token',
          });
          return;
        }

        // Supabase token valid - create JWTPayload format
        logger.auth(`Verified manager: ${user.id}`);
        decoded = {
          user_id: user.id,
          user_type: 'manager',
          manager_id: user.id,
          exp: Math.floor(Date.now() / 1000) + 3600,
        } as JWTPayload;
      } catch (supabaseError) {
        logger.warn('Token verification failed', 'Auth');
        res.status(401).json({
          success: false,
          error: 'Invalid or expired token',
        });
        return;
      }
    } else {
      logger.auth(`Verified ${decoded.user_type}: ${decoded.user_id}`);
    }

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Auth middleware error', error as Error, 'Auth');
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
