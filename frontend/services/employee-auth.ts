// Employee authentication service (custom backend, not Supabase)

import { apiClient, saveToken, clearToken } from './api-client';

interface LoginResponse {
  token: string;
  employee: {
    id: string;
    username: string;
    full_name: string;
    first_login: boolean;
  };
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Employee Login (Custom JWT)
 *
 * Authenticates employee with username/password
 * Returns JWT token and employee data
 *
 * @param username - Employee username
 * @param password - Employee password
 * @returns Promise<LoginResponse> - Token and employee data
 * @throws Error if login fails
 */
export async function employeeLogin(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await apiClient<LoginResponse>('/api/employee/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Kullanıcı adı veya şifre hatalı');
  }

  // Save token for future requests
  await saveToken(response.data.token);

  return response.data;
}

/**
 * Employee Change Password (Requires auth)
 *
 * Changes employee password
 * Handles both first-login and regular password changes
 *
 * @param currentPassword - Current password (not required for first login)
 * @param newPassword - New password to set
 * @param isFirstLogin - Whether this is first login (skips current password check)
 * @returns Promise<ChangePasswordResponse> - Success status and message
 * @throws Error if password change fails
 */
export async function employeeChangePassword(
  currentPassword: string,
  newPassword: string,
  isFirstLogin: boolean
): Promise<ChangePasswordResponse> {
  const response = await apiClient<ChangePasswordResponse>(
    '/api/employee/change-password',
    {
      method: 'POST',
      body: JSON.stringify({
        current_password: isFirstLogin ? undefined : currentPassword,
        new_password: newPassword,
        is_first_login: isFirstLogin,
      }),
    }
  );

  if (!response.success) {
    throw new Error(response.error || 'Şifre değiştirilemedi');
  }

  // Return success response with message
  return {
    success: true,
    message: response.message || 'Şifre başarıyla değiştirildi',
  };
}

/**
 * Employee Logout
 *
 * Clears stored token (stateless JWT, no backend call needed)
 */
export async function employeeLogout(): Promise<void> {
  await clearToken();
}
