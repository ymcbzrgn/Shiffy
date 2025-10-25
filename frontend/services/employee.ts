// Employee management service (Manager operations)

import { apiClient } from './api-client';
import { Employee } from '../types';

/**
 * Get All Employees (Manager Only)
 *
 * Fetches all employees for the logged-in manager
 * Manager ID is extracted from JWT token automatically
 *
 * @returns Promise<Employee[]> - List of all employees
 * @throws Error if fetch fails
 */
export async function getEmployees(): Promise<Employee[]> {
  const response = await apiClient<Employee[]>('/api/manager/employees', {
    method: 'GET',
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch employees');
  }

  return response.data;
}

/**
 * Search Employees (Client-side filtering)
 *
 * Searches employees by name, username, or job description
 * Uses client-side filtering on all employees
 *
 * @param query - Search query string
 * @returns Promise<Employee[]> - Filtered employees
 */
export async function searchEmployees(query: string): Promise<Employee[]> {
  const employees = await getEmployees();

  if (!query) return employees;

  const lowerQuery = query.toLowerCase();
  return employees.filter(emp =>
    emp.full_name.toLowerCase().includes(lowerQuery) ||
    emp.username.toLowerCase().includes(lowerQuery) ||
    emp.job_description?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get Single Employee (Manager Only)
 *
 * Fetches details of a specific employee
 *
 * @param employeeId - Employee UUID
 * @returns Promise<Employee> - Employee details
 * @throws Error if employee not found
 */
export async function getEmployee(employeeId: string): Promise<Employee> {
  const response = await apiClient<Employee>(
    `/api/manager/employees/${employeeId}`,
    {
      method: 'GET',
    }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch employee');
  }

  return response.data;
}

/**
 * Create Employee (Manager Only)
 *
 * Creates a new employee with temporary password
 * NEW FIELDS: job_description, max_weekly_hours
 *
 * @param fullName - Full name of employee
 * @param username - Unique username (no spaces)
 * @param jobDescription - Job roles (e.g., "Cashier, Barista") - Optional
 * @param maxWeeklyHours - Max weekly hours (0-150, 0=on leave, null=unlimited) - Optional
 * @returns Promise<{ employee, tempPassword }> - Created employee and temporary password
 * @throws Error if creation fails
 */
export async function createEmployee(
  fullName: string,
  username: string,
  jobDescription: string | null = null,
  maxWeeklyHours: number | null = null
): Promise<{ employee: Employee; tempPassword: string }> {
  const response = await apiClient<{ employee: Employee; temp_password: string }>(
    '/api/manager/employees',
    {
      method: 'POST',
      body: JSON.stringify({
        full_name: fullName,
        username,
        job_description: jobDescription,
        max_weekly_hours: maxWeeklyHours,
      }),
    }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to create employee');
  }

  return {
    employee: response.data.employee,
    tempPassword: response.data.temp_password,
  };
}

/**
 * Update Employee Notes (Manager Only)
 *
 * Updates manager notes for a specific employee
 *
 * @param employeeId - Employee UUID
 * @param notes - Manager notes text
 * @returns Promise<Employee> - Updated employee
 * @throws Error if update fails
 */
export async function updateEmployeeNotes(
  employeeId: string,
  notes: string
): Promise<Employee> {
  const response = await apiClient<Employee>(
    `/api/manager/employees/${employeeId}/notes`,
    {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to update notes');
  }

  return response.data;
}

/**
 * Toggle Employee Status (Manager Only)
 *
 * Toggles employee status between active/inactive
 *
 * @param employeeId - Employee UUID
 * @returns Promise<Employee> - Updated employee with new status
 * @throws Error if toggle fails
 */
export async function toggleEmployeeStatus(employeeId: string): Promise<Employee> {
  const response = await apiClient<Employee>(
    `/api/manager/employees/${employeeId}/toggle-status`,
    {
      method: 'PATCH',
    }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to toggle status');
  }

  return response.data;
}
