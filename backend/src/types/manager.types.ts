/**
 * Manager Type Definitions
 *
 * TypeScript interfaces for manager-related data structures
 */

import type { EmployeeResponse } from './employee.types';

/**
 * Create Employee Request
 * Used when manager creates a new employee
 */
export interface CreateEmployeeRequest {
  full_name: string;
  username: string;
}

/**
 * Create Employee Response
 * Includes one-time password for manager to share with employee
 */
export interface CreateEmployeeResponse {
  employee: EmployeeResponse;
  temp_password: string; // One-time password, only shown once
}

/**
 * Update Employee Notes Request
 */
export interface UpdateNotesRequest {
  notes: string;
}
