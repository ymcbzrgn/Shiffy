/**
 * Manager Authentication Middleware
 *
 * Verifies Supabase JWT token and ensures user is a manager
 */

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.config';

/**
 * Manager Auth Middleware
 *
 * Verifies Supabase JWT token and checks if user exists in managers table
 *
 * @example
 * router.get('/employees', managerAuthMiddleware, handler);
 */
export async function managerAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
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

    // Verify Supabase token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
      return;
    }

    // Check if user exists in managers table
    const { data: manager, error: managerError } = await supabase
      .from('managers')
      .select('id, email, store_name')
      .eq('id', user.id)
      .single();

    if (managerError || !manager) {
      res.status(403).json({
        success: false,
        error: 'Access denied. Manager account not found.',
      });
      return;
    }

    // Attach user info to request (matching JWT payload format for compatibility)
    req.user = {
      user_id: user.id,
      user_type: 'manager',
      manager_id: user.id, // For managers, user_id === manager_id
      username: manager.email, // Use email as username for managers
    };

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
