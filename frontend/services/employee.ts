// Employee management service (Manager operations)

import { apiClient } from './api-client';
import { Employee } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock mode toggle
const USE_MOCK = false; // Backend is ready!

// Helper: Generate random password (Backend ile aynı - özel karakter yok!)
const generateRandomPassword = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Helper: Hash password (Backend'de bcrypt, mock için basit hash)
const hashPassword = (password: string): string => {
  // Backend: await bcrypt.hash(password, 10)
  // Mock: basit string manipülasyonu
  return `$2b$10$mock_${password}_hash`;
};

// Helper: Compare password (Backend'de bcrypt.compare)
const comparePassword = (plainPassword: string, hashedPassword: string): boolean => {
  const expectedHash = hashPassword(plainPassword);
  return hashedPassword === expectedHash;
};

// Helper: Save password hash to AsyncStorage (SQL simülasyonu)
const savePasswordHash = async (username: string, hashedPassword: string): Promise<void> => {
  try {
    const key = `mock_password_hash_${username}`;
    await AsyncStorage.setItem(key, hashedPassword);
    console.log(`[MOCK SQL] ✅ Password hash saved for: ${username}`);
  } catch (error) {
    console.error('[MOCK SQL] ❌ Failed to save password hash:', error);
  }
};

// Helper: Get password hash (SQL query simülasyonu)
export const getPasswordHash = async (username: string): Promise<string | null> => {
  try {
    const key = `mock_password_hash_${username}`;
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error('[MOCK SQL] ❌ Failed to get password hash:', error);
    return null;
  }
};

// Helper: Verify password (Backend auth.service.loginEmployee mantığı)
export const verifyPassword = async (username: string, plainPassword: string): Promise<boolean> => {
  const storedHash = await getPasswordHash(username);
  if (!storedHash) {
    console.log(`[MOCK AUTH] ❌ No password found for: ${username}`);
    return false;
  }
  
  const isValid = comparePassword(plainPassword, storedHash);
  console.log(`[MOCK AUTH] Password check for ${username}: ${isValid ? '✅ SUCCESS' : '❌ FAILED'}`);
  return isValid;
};

// Helper: Save mock password to AsyncStorage
const saveMockPassword = async (username: string, password: string): Promise<void> => {
  try {
    const key = `mock_password_${username}`;
    await AsyncStorage.setItem(key, password);
  } catch (error) {
    console.error('Failed to save mock password:', error);
  }
};

// Helper: Get mock password from AsyncStorage
export const getMockPassword = async (username: string): Promise<string | null> => {
  try {
    const key = `mock_password_${username}`;
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error('Failed to get mock password:', error);
    return null;
  }
};

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
    
    // Generate random password (Backend: manager.service.createEmployee mantığı)
    const tempPassword = generateRandomPassword(8);
    
    // Hash password and save to "database" (Backend: bcrypt.hash + SQL INSERT)
    const passwordHash = hashPassword(tempPassword);
    await savePasswordHash(username, passwordHash);
    
    console.log(`[MOCK] Created employee: ${username}, temp password: ${tempPassword}`);
    
    return {
      employee: newEmployee,
      tempPassword: tempPassword, // Plain text döner (sadece 1 kez gösterilir)
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
