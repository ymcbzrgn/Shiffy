// Shift Preferences Service
// Employee shift preference operations

import { apiClient } from './api-client';
import { ShiftPreference, TimeSlot } from '../types';

/**
 * Submit Shift Preferences (Employee)
 *
 * Allows employees to submit their availability for a specific week
 *
 * @param weekStart - Week start date in YYYY-MM-DD format (e.g., "2025-01-27")
 * @param slots - Array of time slots with availability status
 * @returns Promise<ShiftPreference> - Submitted preference data
 * @throws Error if submission fails
 */
export async function submitPreferences(
  weekStart: string,
  slots: TimeSlot[]
): Promise<ShiftPreference> {
  const response = await apiClient<ShiftPreference>('/api/shifts/preferences', {
    method: 'POST',
    body: JSON.stringify({
      week_start: weekStart,
      slots,
    }),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to submit preferences');
  }

  return response.data;
}

/**
 * Get My Preferences (Employee)
 *
 * Retrieves the logged-in employee's shift preferences for a specific week
 *
 * @param weekStart - Week start date in YYYY-MM-DD format
 * @returns Promise<ShiftPreference | null> - Preference data or null if not submitted
 * @throws Error if fetch fails
 */
export async function getMyPreferences(weekStart: string): Promise<ShiftPreference | null> {
  const response = await apiClient<ShiftPreference | null>(
    `/api/shifts/my-preferences?week=${weekStart}`,
    {
      method: 'GET',
    }
  );

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch preferences');
  }

  return response.data || null;
}

/**
 * Get All Employee Preferences (Manager)
 *
 * Retrieves all employees' shift preferences for a specific week
 * Manager use only - requires manager JWT token
 *
 * @param weekStart - Week start date in YYYY-MM-DD format
 * @returns Promise<ShiftRequest[]> - Array of employee preferences
 * @throws Error if fetch fails
 */
export interface ShiftRequest {
  employee_id: string;
  full_name: string;
  slots: TimeSlot[];
  submitted_at: string | null;
}

export async function getShiftRequests(weekStart: string): Promise<ShiftRequest[]> {
  const response = await apiClient<ShiftRequest[]>(
    `/api/shifts/requests?week=${weekStart}`,
    {
      method: 'GET',
    }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch shift requests');
  }

  return response.data;
}
