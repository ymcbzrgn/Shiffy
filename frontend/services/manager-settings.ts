// Manager Settings Service

import { apiClient } from './api-client';

/**
 * Manager Settings Interface
 */
export interface ManagerSettings {
  id: string;
  email: string;
  store_name: string;
  deadline_day: number; // 1-7 (1=Monday, 7=Sunday)
  created_at: string;
  updated_at: string;
}

/**
 * Get Manager Settings
 *
 * Retrieves current manager's settings including deadline_day
 *
 * @returns Promise<ManagerSettings> - Manager settings
 * @throws Error if fetch fails
 */
export async function getManagerSettings(): Promise<ManagerSettings> {
  const response = await apiClient<ManagerSettings>('/api/manager-settings', {
    method: 'GET',
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to get manager settings');
  }

  return response.data;
}

/**
 * Update Manager Settings
 *
 * Updates manager settings (store_name, deadline_day)
 *
 * @param updates - Fields to update
 * @returns Promise<ManagerSettings> - Updated manager settings
 * @throws Error if update fails
 */
export async function updateManagerSettings(updates: {
  store_name?: string;
  deadline_day?: number;
}): Promise<ManagerSettings> {
  const response = await apiClient<ManagerSettings>('/api/manager-settings', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to update manager settings');
  }

  return response.data;
}

/**
 * Get deadline day name
 * 
 * @param deadlineDay - 1-7 (1=Monday, 7=Sunday)
 * @returns Day name in Turkish
 */
export function getDeadlineDayName(deadlineDay: number): string {
  const days = ['', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  return days[deadlineDay] || 'Bilinmiyor';
}

/**
 * Get all deadline day options
 * 
 * @returns Array of day options
 */
export function getDeadlineDayOptions(): Array<{ value: number; label: string }> {
  return [
    { value: 1, label: 'Pazartesi' },
    { value: 2, label: 'Salı' },
    { value: 3, label: 'Çarşamba' },
    { value: 4, label: 'Perşembe' },
    { value: 5, label: 'Cuma' },
    { value: 6, label: 'Cumartesi' },
    { value: 7, label: 'Pazar' },
  ];
}
