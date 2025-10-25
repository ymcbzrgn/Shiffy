/**
 * Auto Schedule Routes
 * 
 * Manual trigger endpoints for auto-schedule service
 */

import { Router, Request, Response } from 'express';
import { managerAuthMiddleware } from '../middleware/manager-auth.middleware';
import { autoScheduleService } from '../services/auto-schedule.service';

const router = Router();

/**
 * POST /api/auto-schedule/trigger-all
 * Manually trigger schedule generation for ALL managers
 * Auth: Manager only (any manager can trigger for all)
 */
router.post('/trigger-all', managerAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('[AUTO-SCHEDULE API] Manual trigger requested by manager:', req.user!.manager_id);

    const result = await autoScheduleService.generateSchedulesForAllManagers();

    res.status(200).json({
      success: true,
      data: {
        message: 'Auto-schedule generation completed',
        ...result,
      },
    });
  } catch (error) {
    console.error('[AUTO-SCHEDULE API] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to trigger auto-schedule',
    });
  }
});

/**
 * POST /api/auto-schedule/trigger-me
 * Manually trigger schedule generation for current manager only
 * Auth: Manager only
 */
router.post('/trigger-me', managerAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const managerId = req.user!.manager_id;
    console.log('[AUTO-SCHEDULE API] Manual trigger for manager:', managerId);

    const schedule = await autoScheduleService.generateScheduleForManager(managerId);

    res.status(201).json({
      success: true,
      data: {
        message: 'Schedule generated successfully',
        schedule,
      },
    });
  } catch (error) {
    console.error('[AUTO-SCHEDULE API] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate schedule',
    });
  }
});

/**
 * GET /api/auto-schedule/status
 * Get auto-schedule service status
 * Auth: Manager only
 */
router.get('/status', managerAuthMiddleware, async (_req: Request, res: Response): Promise<void> => {
  try {
    const status = autoScheduleService.getStatus();

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('[AUTO-SCHEDULE API] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get status',
    });
  }
});

export default router;
