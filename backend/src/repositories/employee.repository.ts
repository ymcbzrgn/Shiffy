/**
 * Employee Repository
 *
 * Data access layer for employee-related database operations
 * Uses Supabase client with Service Role Key (bypasses RLS)
 */

import { supabase } from '../config/supabase.config';
import type { Employee, CreateEmployeeDTO, UpdateEmployeeDTO } from '../types/employee.types';

/**
 * Find Employee by Username
 *
 * @param username - Employee username (unique)
 * @returns Employee object or null if not found
 */
export async function findByUsername(username: string): Promise<Employee | null> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      // PGRST116 = not found (not an error, return null)
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Database error: ${error.message}`);
    }

    return data as Employee;
  } catch (error) {
    throw new Error(`Failed to find employee by username: ${error}`);
  }
}

/**
 * Find Employee by ID
 *
 * @param id - Employee UUID
 * @returns Employee object or null if not found
 */
export async function findById(id: string): Promise<Employee | null> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Database error: ${error.message}`);
    }

    return data as Employee;
  } catch (error) {
    throw new Error(`Failed to find employee by ID: ${error}`);
  }
}

/**
 * Create New Employee
 *
 * @param employeeData - Employee data (DTO)
 * @returns Created employee object
 */
export async function create(employeeData: CreateEmployeeDTO): Promise<Employee> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert({
        ...employeeData,
        first_login: employeeData.first_login ?? true, // Default to true
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation (username already exists)
      if (error.code === '23505') {
        throw new Error('Username already exists');
      }
      throw new Error(`Database error: ${error.message}`);
    }

    return data as Employee;
  } catch (error) {
    throw new Error(`Failed to create employee: ${error}`);
  }
}

/**
 * Update Employee Password
 *
 * Used for password change functionality
 * Also sets first_login to false
 *
 * @param id - Employee UUID
 * @param passwordHash - New bcrypt hashed password
 */
export async function updatePassword(id: string, passwordHash: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('employees')
      .update({
        password_hash: passwordHash,
        first_login: false,
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  } catch (error) {
    throw new Error(`Failed to update employee password: ${error}`);
  }
}

/**
 * Update Employee Last Login Timestamp
 *
 * Called after successful login
 *
 * @param id - Employee UUID
 */
export async function updateLastLogin(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('employees')
      .update({
        last_login: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  } catch (error) {
    // Don't throw error, just log (last_login is not critical)
    console.warn(`Failed to update last login for employee ${id}:`, error);
  }
}

/**
 * Update Employee Details
 *
 * @param id - Employee UUID
 * @param updates - Fields to update
 */
export async function update(id: string, updates: UpdateEmployeeDTO): Promise<Employee> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data as Employee;
  } catch (error) {
    throw new Error(`Failed to update employee: ${error}`);
  }
}

/**
 * Delete Employee
 *
 * @param id - Employee UUID
 */
export async function deleteEmployee(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  } catch (error) {
    throw new Error(`Failed to delete employee: ${error}`);
  }
}

/**
 * Find All Employees by Manager
 *
 * @param managerId - Manager UUID
 * @returns Array of employees
 */
export async function findByManager(managerId: string): Promise<Employee[]> {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('manager_id', managerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return (data as Employee[]) || [];
  } catch (error) {
    throw new Error(`Failed to find employees by manager: ${error}`);
  }
}
