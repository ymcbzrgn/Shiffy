/**
 * Employee Type Definitions
 *
 * TypeScript interfaces for employee-related data structures
 */

/**
 * Employee Entity
 * Represents a single employee record from database
 */
export interface Employee {
  id: string;
  manager_id: string;
  username: string;
  full_name: string;
  job_description: string | null;
  max_weekly_hours: number | null;
  password_hash: string;
  first_login: boolean;
  manager_notes: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

/**
 * Create Employee DTO
 * Data Transfer Object for creating new employee
 */
export interface CreateEmployeeDTO {
  manager_id: string;
  full_name: string;
  username: string;
  job_description?: string | null;
  max_weekly_hours?: number | null;
  password_hash: string;
  first_login?: boolean; // Default: true
}

/**
 * Update Employee DTO
 * Data Transfer Object for updating employee
 */
export interface UpdateEmployeeDTO {
  full_name?: string;
  manager_notes?: string;
  status?: 'active' | 'inactive';
}

/**
 * Employee Response (without sensitive data)
 * Used for API responses - excludes password_hash
 */
export interface EmployeeResponse {
  id: string;
  manager_id: string;
  username: string;
  full_name: string;
  job_description: string | null;
  max_weekly_hours: number | null;
  first_login: boolean;
  manager_notes: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

/**
 * Helper: Convert Employee to EmployeeResponse
 * Removes password_hash before sending to client
 */
export function toEmployeeResponse(employee: Employee): EmployeeResponse {
  const { password_hash, ...response } = employee;
  return response;
}
