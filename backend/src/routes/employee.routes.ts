/**
 * Employee Authentication Routes
 *
 * Public and protected endpoints for employee auth
 * Mounted at: /api/employee
 */

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as authService from '../services/auth.service';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponseData,
  ChangePasswordRequest,
} from '../types/api.types';

const router = Router();

/**
 * POST /api/employee/login
 *
 * Employee login endpoint
 * Public route (no auth required)
 *
 * Body: { username, password }
 * Response: { success, data: { token, employee } }
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as LoginRequest;

    // Validate input
    if (!username || !password) {
      const response: ApiResponse = {
        success: false,
        error: 'Username and password are required',
      };
      return res.status(400).json(response);
    }

    // Attempt login
    const loginData = await authService.loginEmployee(username, password);

    // Success response
    const response: ApiResponse<LoginResponseData> = {
      success: true,
      data: loginData,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    console.error('Login error:', error);

    // Check if it's a credentials error
    if (
      error.message === 'Kullanıcı adı veya şifre hatalı' ||
      error.message.includes('Kullanıcı adı veya şifre')
    ) {
      const response: ApiResponse = {
        success: false,
        error: error.message,
      };
      return res.status(401).json(response);
    }

    // Generic server error
    const response: ApiResponse = {
      success: false,
      error: 'Login failed. Please try again.',
    };
    return res.status(500).json(response);
  }
});

/**
 * POST /api/employee/change-password
 *
 * Change employee password
 * Protected route (requires JWT)
 *
 * Body: { current_password?, new_password, is_first_login }
 * Response: { success, message }
 */
router.post(
  '/change-password',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { current_password, new_password, is_first_login } =
        req.body as ChangePasswordRequest;

      // Validate input
      if (!new_password) {
        const response: ApiResponse = {
          success: false,
          error: 'New password is required',
        };
        return res.status(400).json(response);
      }

      // Validate password strength (basic)
      if (new_password.length < 8) {
        const response: ApiResponse = {
          success: false,
          error: 'Password must be at least 8 characters long',
        };
        return res.status(400).json(response);
      }

      // Get employee ID from JWT token (attached by authMiddleware)
      const employeeId = req.user!.user_id;

      // Change password
      await authService.changePassword(
        employeeId,
        current_password,
        new_password,
        is_first_login || false
      );

      // Success response
      const response: ApiResponse = {
        success: true,
        data: {
          message: 'Şifre başarıyla değiştirildi',
        },
      };

      return res.status(200).json(response);
    } catch (error: any) {
      console.error('[EMPLOYEE] Change password error:', error.message);

      // Check for specific errors
      if (error.message.includes('Current password is incorrect')) {
        const response: ApiResponse = {
          success: false,
          error: 'Mevcut şifre hatalı',
        };
        return res.status(400).json(response);
      }

      if (error.message.includes('Current password is required')) {
        const response: ApiResponse = {
          success: false,
          error: 'Mevcut şifre gerekli',
        };
        return res.status(400).json(response);
      }

      if (error.message.includes('Employee not found')) {
        const response: ApiResponse = {
          success: false,
          error: 'Kullanıcı bulunamadı',
        };
        return res.status(404).json(response);
      }

      // Generic server error
      const response: ApiResponse = {
        success: false,
        error: 'Şifre değiştirilemedi. Lütfen tekrar deneyin.',
      };
      return res.status(500).json(response);
    }
  }
);

export default router;
