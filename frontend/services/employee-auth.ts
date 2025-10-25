// Employee authentication service (custom backend, not Supabase)

import { apiClient, saveToken, clearToken } from './api-client';
import { verifyPassword } from './employee';

// Mock mode toggle
const USE_MOCK = false; // Backend is ready!

// Mock credentials - In MOCK mode, accept any password for testing
// In production, backend validates against hashed passwords
const MOCK_CREDENTIALS: Record<string, { password: string; employeeData: any }> = {
  'ahmet': {
    password: 'ANY', // Accept any password in mock mode
    employeeData: {
      id: '1',
      username: 'ahmet',
      full_name: 'Ahmet Yılmaz',
      first_login: false,
    }
  },
  'ayse': {
    password: 'ANY',
    employeeData: {
      id: '2',
      username: 'ayse',
      full_name: 'Ayşe Demir',
      first_login: true,
    }
  },
  'mehmet': {
    password: 'ANY',
    employeeData: {
      id: '3',
      username: 'mehmet',
      full_name: 'Mehmet Kaya',
      first_login: false,
    }
  },
};

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
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const usernameLower = username.toLowerCase();
    const mockUser = MOCK_CREDENTIALS[usernameLower];
    
    if (!mockUser) {
      throw new Error('Kullanıcı adı veya şifre hatalı');
    }
    
    // Verify password (Backend mantığı: bcrypt.compare)
    const isPasswordValid = await verifyPassword(usernameLower, password);
    
    if (!isPasswordValid) {
      throw new Error('Kullanıcı adı veya şifre hatalı');
    }
    
    console.log(`[MOCK AUTH] ✅ Login successful for: ${usernameLower}`);
    
    const mockToken = `mock-jwt-token-${usernameLower}-${Date.now()}`;
    await saveToken(mockToken);
    
    return {
      token: mockToken,
      employee: mockUser.employeeData,
    };
  }

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
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In mock mode, just accept the password change
    return {
      success: true,
      message: 'Şifre başarıyla değiştirildi',
    };
  }

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
    message: response.data?.message || 'Şifre başarıyla değiştirildi',
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
