// Employee management service (Manager operations)

import { apiClient } from './api-client';
import { Employee } from '../types';

// Mock mode toggle
const USE_MOCK = true;

// Mock data
const MOCK_EMPLOYEES: Employee[] = [
  {
    id: '1',
    manager_id: 'mock-manager-id',
    full_name: 'Ahmet Yılmaz',
    username: 'ahmet',
    status: 'active',
    first_login: false,
    manager_notes: 'Güvenilir çalışan, sabah vardiyalarında çok iyi performans gösteriyor.',
    job_description: 'Kasiyer, Barista',
    max_weekly_hours: 40,
    created_at: '2025-01-15T08:00:00Z',
    last_login: '2025-10-24T14:30:00Z',
  },
  {
    id: '2',
    manager_id: 'mock-manager-id',
    full_name: 'Ayşe Demir',
    username: 'ayse',
    status: 'active',
    first_login: true,
    manager_notes: '',
    job_description: 'Garson',
    max_weekly_hours: 30,
    created_at: '2025-10-20T10:00:00Z',
    last_login: null,
  },
  {
    id: '3',
    manager_id: 'mock-manager-id',
    full_name: 'Mehmet Kaya',
    username: 'mehmet',
    status: 'inactive',
    first_login: false,
    manager_notes: 'İzinde, ay sonunda dönecek.',
    job_description: 'Aşçı Yardımcısı',
    max_weekly_hours: 0,
    created_at: '2024-12-01T09:00:00Z',
    last_login: '2025-10-15T18:20:00Z',
  },
];

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
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_EMPLOYEES;
  }

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
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const employee = MOCK_EMPLOYEES.find(e => e.id === employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    return employee;
  }

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
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newEmployee: Employee = {
      id: String(MOCK_EMPLOYEES.length + 1),
      manager_id: 'mock-manager-id',
      full_name: fullName,
      username,
      status: 'active',
      first_login: true,
      manager_notes: '',
      job_description: jobDescription,
      max_weekly_hours: maxWeeklyHours,
      created_at: new Date().toISOString(),
      last_login: null,
    };
    
    MOCK_EMPLOYEES.push(newEmployee);
    
    return {
      employee: newEmployee,
      tempPassword: 'temp123456',
    };
  }

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
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const employee = MOCK_EMPLOYEES.find(e => e.id === employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    employee.manager_notes = notes;
    return employee;
  }

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
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const employee = MOCK_EMPLOYEES.find(e => e.id === employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    employee.status = employee.status === 'active' ? 'inactive' : 'active';
    return employee;
  }

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
