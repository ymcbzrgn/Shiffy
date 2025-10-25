import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { managerAuthMiddleware } from '../middleware/manager-auth.middleware';
import { shiftService } from '../services/shift.service';
import type { SubmitPreferencesRequest } from '../types/shift.types';

const router = Router();

// ==========================================
// EMPLOYEE ENDPOINTS
// ==========================================

/**
 * POST /api/shifts/preferences
 * Submit or update shift preferences for current week
 * Auth: Employee only
 */
router.post('/preferences', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { week_start, slots }: SubmitPreferencesRequest = req.body;
    const employeeId = req.user!.user_id;

    // Validate request body
    if (!week_start || !slots) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: week_start, slots',
      });
      return;
    }

    // Submit preferences
    const preference = await shiftService.submitPreferences(
      employeeId,
      week_start,
      slots
    );

    res.status(201).json({
      success: true,
      data: preference,
    });
  } catch (error) {
    console.error('Submit preferences error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit preferences',
    });
  }
});

/**
 * GET /api/shifts/my-preferences?week=YYYY-MM-DD
 * Get shift preferences for a specific week
 * Auth: Employee only
 */
router.get('/my-preferences', authMiddleware, async (req: Request, res: Response): Promise<void> => {
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

    // Get preferences
    const preference = await shiftService.getMyPreferences(employeeId, week);

    res.status(200).json({
      success: true,
      data: preference, // null if not found
    });
  } catch (error) {
    console.error('Get my preferences error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get preferences',
    });
  }
});

// ==========================================
// MANAGER ENDPOINTS
// ==========================================

/**
 * GET /api/shifts/requests?week=YYYY-MM-DD
 * Get all shift requests from employees for a specific week
 * Auth: Manager only
 */
router.get('/requests', managerAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
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

    // Get shift requests
    const requests = await shiftService.getShiftRequests(managerId, week);

    res.status(200).json({
      success: true,
      data: requests, // empty array if no requests
    });
  } catch (error) {
    console.error('Get shift requests error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get shift requests',
    });
  }
});

export default router;
