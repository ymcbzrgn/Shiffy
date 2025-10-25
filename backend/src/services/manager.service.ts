/**
 * Manager Service
 *
 * Business logic for manager operations
 * Handles employee CRUD for managers
 */

import { generateRandomPassword, hashPassword } from '../utils/password.utils';
import * as employeeRepository from '../repositories/employee.repository';
import { toEmployeeResponse } from '../types/employee.types';
import type { EmployeeResponse } from '../types/employee.types';
import type { CreateEmployeeResponse } from '../types/manager.types';

/**
 * Get All Employees for Manager
 *
 * @param managerId - Manager UUID
 * @returns Array of employees (without password_hash)
 */
export async function getEmployees(managerId: string): Promise<EmployeeResponse[]> {
  try {
    const employees = await employeeRepository.findByManager(managerId);

    // Convert to response format (removes password_hash)
    return employees.map(emp => toEmployeeResponse(emp));
  } catch (error: any) {
    throw new Error(`Failed to fetch employees: ${error.message}`);
  }
}

/**
 * Create New Employee
 *
 * Manager creates employee with auto-generated password
 *
 * @param managerId - Manager UUID
 * @param fullName - Employee full name
 * @param username - Employee username (unique)
 * @param jobDescription - Job roles/description (optional)
 * @param maxWeeklyHours - Maximum hours per week (optional, 0-150)
 * @returns Created employee + temporary password
 */
export async function createEmployee(
  managerId: string,
  fullName: string,
  username: string,
  jobDescription: string | null = null,
  maxWeeklyHours: number | null = null
): Promise<CreateEmployeeResponse> {
  try {
    // Check if username already exists
    const existingEmployee = await employeeRepository.findByUsername(username);
    if (existingEmployee) {
      throw new Error('Bu kullanıcı adı zaten kullanılıyor');
    }

    // Generate random password (8 characters)
    const tempPassword = generateRandomPassword(8);

    // Hash password
    const passwordHash = await hashPassword(tempPassword);

    // Create employee
    const employee = await employeeRepository.create({
      manager_id: managerId,
      full_name: fullName,
      username,
      job_description: jobDescription,
      max_weekly_hours: maxWeeklyHours,
      password_hash: passwordHash,
      first_login: true, // Must change password on first login
    });

    return {
      employee: toEmployeeResponse(employee),
      temp_password: tempPassword, // Return plain password (one-time only)
    };
  } catch (error: any) {
    throw new Error(`Failed to create employee: ${error.message}`);
  }
}

/**
 * Get Single Employee by ID
 *
 * @param employeeId - Employee UUID
 * @returns Employee details
 */
export async function getEmployeeById(employeeId: string): Promise<EmployeeResponse> {
  try {
    const employee = await employeeRepository.findById(employeeId);

    if (!employee) {
      throw new Error('Çalışan bulunamadı');
    }

    return toEmployeeResponse(employee);
  } catch (error: any) {
    throw new Error(`Failed to fetch employee: ${error.message}`);
  }
}

/**
 * Update Employee Notes
 *
 * Manager can add/update notes about employee
 *
 * @param employeeId - Employee UUID
 * @param notes - Manager notes
 * @returns Updated employee
 */
export async function updateEmployeeNotes(
  employeeId: string,
  notes: string
): Promise<EmployeeResponse> {
  try {
    const employee = await employeeRepository.update(employeeId, {
      manager_notes: notes || undefined,
    });

    return toEmployeeResponse(employee);
  } catch (error: any) {
    throw new Error(`Failed to update notes: ${error.message}`);
  }
}

/**
 * Toggle Employee Status
 *
 * Switch between active/inactive
 *
 * @param employeeId - Employee UUID
 * @returns Updated employee
 */
export async function toggleEmployeeStatus(employeeId: string): Promise<EmployeeResponse> {
  try {
    const employee = await employeeRepository.findById(employeeId);

    if (!employee) {
      throw new Error('Çalışan bulunamadı');
    }

    // Toggle status
    const newStatus = employee.status === 'active' ? 'inactive' : 'active';

    const updatedEmployee = await employeeRepository.update(employeeId, {
      status: newStatus,
    });

    return toEmployeeResponse(updatedEmployee);
  } catch (error: any) {
    throw new Error(`Failed to toggle status: ${error.message}`);
  }
}
