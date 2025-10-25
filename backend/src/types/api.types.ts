/**
 * API Response Type Definitions
 *
 * Standardized response formats for all API endpoints
 */

/**
 * Generic API Response
 * Used for all API endpoints for consistency
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Login Response Data
 * Returned after successful employee login
 */
export interface LoginResponseData {
  token: string;
  employee: {
    id: string;
    username: string;
    full_name: string;
    first_login: boolean;
  };
}

/**
 * Employee Login Request Body
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Change Password Request Body
 */
export interface ChangePasswordRequest {
  current_password?: string; // Optional for first login
  new_password: string;
  is_first_login: boolean;
}
