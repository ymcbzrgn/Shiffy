// AI Schedule Service
// AI-powered schedule generation and management

import { apiClient } from './api-client';
import { AssignedShift } from '../types';

/**
 * Schedule Response from Backend
 */
export interface ScheduleResponse {
  id: string;
  week_start: string;
  status: 'pending' | 'generated' | 'approved';
  shifts: AssignedShift[];
  summary?: {
    total_shifts: number;
    total_hours: number;
    coverage_score: number;
    warnings: string[];
  };
  generated_at: string;
  approved_at: string | null;
}

/**
 * Employee's Schedule View (Only Approved)
 */
export interface MyScheduleResponse {
  week_start: string;
  shifts: AssignedShift[];
  status: 'pending' | 'generated' | 'approved';
}

/**
 * Generate AI Schedule (Manager Only)
 *
 * Uses Llama AI to generate optimal shift schedule based on:
 * - Employee shift preferences
 * - Employee max_weekly_hours limits
 * - Manager notes
 * - Store operating hours
 *
 * @param weekStart - Week start date in YYYY-MM-DD format
 * @returns Promise<ScheduleResponse> - Generated schedule with AI summary
 * @throws Error if generation fails (e.g., RunPod timeout, validation error)
 */
export async function generateSchedule(weekStart: string): Promise<ScheduleResponse> {
  const response = await apiClient<ScheduleResponse>('/api/schedules/generate', {
    method: 'POST',
    body: JSON.stringify({ week_start: weekStart }),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to generate schedule');
  }

  return response.data;
}

/**
 * Approve Schedule (Manager Only)
 *
 * Marks a generated schedule as approved, making it visible to employees
 *
 * @param scheduleId - Schedule UUID
 * @returns Promise<ScheduleResponse> - Updated schedule with approved_at timestamp
 * @throws Error if approval fails
 */
export async function approveSchedule(scheduleId: string): Promise<ScheduleResponse> {
  const response = await apiClient<ScheduleResponse>(`/api/schedules/${scheduleId}/approve`, {
    method: 'POST',
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to approve schedule');
  }

  return response.data;
}

/**
 * Get Manager's Schedule (Manager Only)
 *
 * Retrieves schedule for a specific week (any status: pending/generated/approved)
 * Shows all employees' shifts
 *
 * @param weekStart - Week start date in YYYY-MM-DD format
 * @returns Promise<ScheduleResponse | null> - Schedule or null if not found
 * @throws Error if fetch fails
 */
export async function getManagerSchedule(weekStart: string): Promise<ScheduleResponse | null> {
  const response = await apiClient<ScheduleResponse | null>(
    `/api/schedules?week=${weekStart}`,
    {
      method: 'GET',
    }
  );

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch schedule');
  }

  return response.data || null;
}

/**
 * Get Employee's Schedule (Employee Only)
 *
 * Retrieves ONLY approved schedules for the logged-in employee
 * Only shows the employee's own shifts (not other employees)
 *
 * @param weekStart - Week start date in YYYY-MM-DD format
 * @returns Promise<MyScheduleResponse | null> - Employee's shifts or null if not approved yet
 * @throws Error if fetch fails
 */
export async function getMySchedule(weekStart: string): Promise<MyScheduleResponse | null> {
  const response = await apiClient<MyScheduleResponse | null>(
    `/api/schedules/my-schedule?week=${weekStart}`,
    {
      method: 'GET',
    }
  );

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch schedule');
  }

  return response.data || null;
}
