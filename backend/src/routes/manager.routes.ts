/**
 * Manager Routes
 *
 * All routes for manager employee CRUD operations
 * All routes require manager authentication (JWT with user_type='manager')
 */

import { Router, Request, Response } from 'express';
import { managerAuthMiddleware } from '../middleware/manager-auth.middleware';
import * as managerService from '../services/manager.service';
import type { CreateEmployeeRequest, UpdateNotesRequest } from '../types/manager.types';

const router = Router();

/**
 * GET /employees
 * List all employees for the authenticated manager
 *
 * @returns Array of employees (without password_hash)
 */
router.get('/employees', managerAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const managerId = req.user!.user_id; // From JWT

    const employees = await managerService.getEmployees(managerId);

    return res.json({
      success: true,
      data: employees,
    });
  } catch (error: any) {
    console.error('Get employees error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /employees
 * Create a new employee for the authenticated manager
 *
 * @body full_name - Employee full name
 * @body username - Employee username (must be unique)
 * @returns Created employee + one-time temporary password
 */
router.post('/employees', managerAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const managerId = req.user!.user_id; // From JWT
    const { full_name, username, job_description, max_weekly_hours } = req.body as CreateEmployeeRequest;

    // Validate input
    if (!full_name || !username) {
      return res.status(400).json({
        success: false,
        error: 'full_name ve username alanları gereklidir',
      });
    }

    // Validate max_weekly_hours (if provided)
    if (max_weekly_hours !== undefined && max_weekly_hours !== null) {
      if (!Number.isInteger(max_weekly_hours) || max_weekly_hours < 0 || max_weekly_hours > 60) {
        return res.status(400).json({
          success: false,
          error: 'max_weekly_hours 0 ile 60 arasında bir tam sayı olmalıdır',
        });
      }
    }

    // Create employee
    const result = await managerService.createEmployee(
      managerId,
      full_name,
      username,
      job_description ?? null,
      max_weekly_hours ?? null
    );

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Create employee error:', error);

    // Handle duplicate username error
    if (error.message.includes('zaten kullanılıyor')) {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /employees/:id
 * Get single employee by ID
 *
 * @param id - Employee UUID
 * @returns Employee details
 */
router.get('/employees/:id', managerAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const managerId = req.user!.user_id;

    const employee = await managerService.getEmployeeById(id);

    // Security: Verify employee belongs to this manager
    if ((employee as any).manager_id !== managerId) {
      return res.status(403).json({
        success: false,
        error: 'Bu çalışana erişim yetkiniz yok',
      });
    }

    return res.json({
      success: true,
      data: employee,
    });
  } catch (error: any) {
    console.error('Get employee error:', error);

    if (error.message.includes('bulunamadı')) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PATCH /employees/:id/notes
 * Update manager notes for an employee
 *
 * @param id - Employee UUID
 * @body notes - Manager notes (can be empty string)
 * @returns Updated employee
 */
router.patch('/employees/:id/notes', managerAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const managerId = req.user!.user_id;
    const { notes } = req.body as UpdateNotesRequest;

    // Verify employee belongs to this manager
    const employee = await managerService.getEmployeeById(id);
    if ((employee as any).manager_id !== managerId) {
      return res.status(403).json({
        success: false,
        error: 'Bu çalışana erişim yetkiniz yok',
      });
    }

    // Update notes
    const updated = await managerService.updateEmployeeNotes(id, notes);

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error('Update notes error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PATCH /employees/:id/toggle-status
 * Toggle employee status (active ↔ inactive)
 *
 * @param id - Employee UUID
 * @returns Updated employee with new status
 */
router.patch(
  '/employees/:id/toggle-status',
  managerAuthMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const managerId = req.user!.user_id;

      // Verify employee belongs to this manager
      const employee = await managerService.getEmployeeById(id);
      if ((employee as any).manager_id !== managerId) {
        return res.status(403).json({
          success: false,
          error: 'Bu çalışana erişim yetkiniz yok',
        });
      }

      // Toggle status
      const updated = await managerService.toggleEmployeeStatus(id);

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      console.error('Toggle status error:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

export default router;
