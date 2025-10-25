import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { managerAuthMiddleware } from '../middleware/manager-auth.middleware';
import { scheduleService } from '../services/schedule.service';
import type { GenerateScheduleRequest } from '../types/schedule.types';

const router = Router();

// ==========================================
// MANAGER ENDPOINTS
// ==========================================

/**
 * POST /api/schedules/generate
 * Generate AI schedule for a week
 * Auth: Manager only
 */
router.post('/generate', managerAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { week_start }: GenerateScheduleRequest = req.body;
    const managerId = req.user!.manager_id;

    // Validate request body
    if (!week_start) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: week_start',
      });
      return;
    }

    // Generate schedule using AI
    const schedule = await scheduleService.generateSchedule(managerId, week_start);

    res.status(201).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error('Generate schedule error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate schedule',
    });
  }
});

/**
 * POST /api/schedules/:id/approve
 * Approve generated schedule
 * Auth: Manager only
 */
router.post('/:id/approve', managerAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const managerId = req.user!.manager_id;

    // Validate schedule ID
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Missing schedule ID',
      });
      return;
    }

    // Approve schedule
    const schedule = await scheduleService.approveSchedule(managerId, id);

    res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error('Approve schedule error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve schedule',
    });
  }
});

/**
 * GET /api/schedules?week=YYYY-MM-DD
 * Get manager's schedule for a week
 * Auth: Manager only
 */
router.get('/', managerAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { week } = req.query;
    const managerId = req.user!.manager_id;

    // Validate query parameter
    if (!week || typeof week !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Missing required query parameter: week (format: YYYY-MM-DD)',
      });
      return;
    }

    // Get manager's schedule
    const schedule = await scheduleService.getManagerSchedule(managerId, week);

    res.status(200).json({
      success: true,
      data: schedule, // null if not found
    });
  } catch (error) {
    console.error('Get manager schedule error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get schedule',
    });
  }
});

// ==========================================
// EMPLOYEE ENDPOINTS
// ==========================================

/**
 * GET /api/schedules/my-schedule?week=YYYY-MM-DD
 * Get employee's approved schedule for a week
 * Auth: Employee only
 */
router.get('/my-schedule', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { week } = req.query;
    const employeeId = req.user!.user_id;

    // Validate query parameter
    if (!week || typeof week !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Missing required query parameter: week (format: YYYY-MM-DD)',
      });
      return;
    }

    // Get employee's schedule (only approved schedules)
    const schedule = await scheduleService.getMySchedule(employeeId, week);

    res.status(200).json({
      success: true,
      data: schedule, // null if not found or not approved
    });
  } catch (error) {
    console.error('Get my schedule error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get schedule',
    });
  }
});

export default router;
