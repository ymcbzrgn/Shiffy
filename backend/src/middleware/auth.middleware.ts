/**
 * Authentication Middleware
 *
 * JWT token verification for protected routes
 * Attaches decoded user info to req.user
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, type JWTPayload } from '../utils/jwt.utils';
import { supabase } from '../config/supabase.config';

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

    console.log(`[Auth] ${req.method} ${req.path}`);
    console.log(`[Auth] Authorization header: ${authHeader ? 'Present' : 'Missing'}`);

    if (!authHeader) {
      console.warn('[Auth] ❌ No authorization header provided');
      res.status(401).json({
        success: false,
        error: 'No authorization header provided',
      });
      return;
    }

    // Check Bearer format
    if (!authHeader.startsWith('Bearer ')) {
      console.warn('[Auth] ❌ Invalid authorization format');
      res.status(401).json({
        success: false,
        error: 'Invalid authorization format. Use: Bearer <token>',
      });
      return;
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer "
    console.log(`[Auth] Token: ${token.substring(0, 20)}...`);

    if (!token) {
      console.warn('[Auth] ❌ No token provided');
      res.status(401).json({
        success: false,
        error: 'No token provided',
      });
      return;
    }

    // Verify token
    // Try custom JWT first (for employees)
    let decoded = verifyToken(token);

    if (!decoded) {
      // If custom JWT fails, try Supabase token (for managers)
      console.log('[Auth] Custom JWT failed, trying Supabase token...');
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
          console.error('[Auth] ❌ Supabase token verification failed:', error?.message);
          res.status(401).json({
            success: false,
            error: 'Invalid or expired token',
          });
          return;
        }
        
        // Supabase token valid - create JWTPayload format
        console.log(`[Auth] ✅ Supabase token verified - User: ${user.id} (manager)`);
        decoded = {
          user_id: user.id,
          user_type: 'manager',
          manager_id: user.id, // Same as user_id for managers
          exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        } as JWTPayload;
      } catch (supabaseError) {
        console.error('[Auth] ❌ Token verification failed - invalid or expired');
        res.status(401).json({
          success: false,
          error: 'Invalid or expired token',
        });
        return;
      }
    } else {
      console.log(`[Auth] ✅ Token verified - User: ${decoded.user_id} (${decoded.user_type})`);
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
