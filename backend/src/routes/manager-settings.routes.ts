/**
 * Manager Settings Routes
 * 
 * Manager profile and settings management
 */

import { Router, Request, Response } from 'express';
import { managerAuthMiddleware } from '../middleware/manager-auth.middleware';
import { supabase } from '../config/supabase.config';

const router = Router();

/**
 * GET /api/manager-settings
 * Get current manager's settings
 * Auth: Manager only
 */
router.get('/', managerAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const managerId = req.user!.manager_id;

    const { data: manager, error } = await supabase
      .from('managers')
      .select('id, email, store_name, deadline_day, created_at, updated_at')
      .eq('id', managerId)
      .single();

    if (error || !manager) {
      res.status(404).json({
        success: false,
        error: 'Manager not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: manager,
    });
  } catch (error) {
    console.error('[MANAGER SETTINGS] Get settings error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get settings',
    });
  }
});

/**
 * PATCH /api/manager-settings
 * Update manager settings
 * Auth: Manager only
 */
router.patch('/', managerAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const managerId = req.user!.manager_id;
    const { store_name, deadline_day } = req.body;

    const updates: any = { updated_at: new Date().toISOString() };

    // Validate and add store_name if provided
    if (store_name !== undefined) {
      if (typeof store_name !== 'string' || store_name.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'store_name must be a non-empty string',
        });
        return;
      }
      updates.store_name = store_name.trim();
    }

    // Validate and add deadline_day if provided
    if (deadline_day !== undefined) {
      if (typeof deadline_day !== 'number' || deadline_day < 1 || deadline_day > 7) {
        res.status(400).json({
          success: false,
          error: 'deadline_day must be between 1 (Monday) and 7 (Sunday)',
        });
        return;
      }
      updates.deadline_day = deadline_day;
    }

    // Check if there's anything to update
    if (Object.keys(updates).length === 1) {
      res.status(400).json({
        success: false,
        error: 'No valid fields to update',
      });
      return;
    }

    // Update manager settings
    const { data: manager, error } = await supabase
      .from('managers')
      .update(updates)
      .eq('id', managerId)
      .select('id, email, store_name, deadline_day, created_at, updated_at')
      .single();

    if (error) {
      console.error('[MANAGER SETTINGS] Update error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update settings',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: manager,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('[MANAGER SETTINGS] Update settings error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update settings',
    });
  }
});

export default router;
