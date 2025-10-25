/**
 * Authentication Service
 *
 * Business logic for employee authentication
 * Handles login, password change, and token generation
 */

import { comparePassword, hashPassword } from '../utils/password.utils';
import { generateToken } from '../utils/jwt.utils';
import * as employeeRepository from '../repositories/employee.repository';
import type { LoginResponseData } from '../types/api.types';

/**
 * Employee Login
 *
 * Validates credentials and returns JWT token
 *
 * @param username - Employee username
 * @param password - Plain text password
 * @returns Login response with token and employee data
 * @throws Error if credentials invalid
 */
export async function loginEmployee(
  username: string,
  password: string
): Promise<LoginResponseData> {
  try {
    // Find employee by username
    const employee = await employeeRepository.findByUsername(username);

    if (!employee) {
      throw new Error('Kullanıcı adı veya şifre hatalı');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, employee.password_hash);

    if (!isPasswordValid) {
      throw new Error('Kullanıcı adı veya şifre hatalı');
    }

    // Update last login timestamp
    await employeeRepository.updateLastLogin(employee.id);

    // Generate JWT token
    const token = generateToken({
      user_id: employee.id,
      user_type: 'employee',
      manager_id: employee.manager_id,
      username: employee.username,
    });

    // Return success response
    return {
      token,
      employee: {
        id: employee.id,
        username: employee.username,
        full_name: employee.full_name,
        first_login: employee.first_login,
      },
    };
  } catch (error: any) {
    // Re-throw with generic message for security
    if (error.message === 'Kullanıcı adı veya şifre hatalı') {
      throw error;
    }
    throw new Error('Login failed: ' + error.message);
  }
}

/**
 * Change Employee Password
 *
 * Handles both first-time password change and regular password updates
 *
 * @param employeeId - Employee UUID
 * @param currentPassword - Current password (required if not first login)
 * @param newPassword - New password to set
 * @param isFirstLogin - Whether this is first login password change
 * @throws Error if validation fails
 */
export async function changePassword(
  employeeId: string,
  currentPassword: string | undefined,
  newPassword: string,
  isFirstLogin: boolean
): Promise<void> {
  try {
    // Find employee
    const employee = await employeeRepository.findById(employeeId);

    if (!employee) {
      throw new Error('Employee not found');
    }

    // If not first login, verify current password
    if (!isFirstLogin) {
      if (!currentPassword) {
        throw new Error('Current password is required');
      }

      const isCurrentPasswordValid = await comparePassword(
        currentPassword,
        employee.password_hash
      );

      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password in database (also sets first_login to false)
    await employeeRepository.updatePassword(employeeId, newPasswordHash);

  } catch (error: any) {
    throw new Error('Password change failed: ' + error.message);
  }
}
