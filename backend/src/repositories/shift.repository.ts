import { supabase } from '../config/supabase.config';
import type { ShiftSlot, ShiftPreference } from '../types/shift.types';

// ==========================================
// SHIFT PREFERENCE REPOSITORY
// ==========================================

interface CreateOrUpdatePreferenceData {
  employee_id: string;
  week_start: string;
  slots: ShiftSlot[];
}

interface ShiftRequestWithEmployee {
  id: string;
  employee_id: string;
  week_start: string;
  slots: ShiftSlot[];
  submitted_at: string | null;
  employees: {
    id: string;
    full_name: string;
    manager_id: string;
  };
}

export const shiftRepository = {
  /**
   * Create or update shift preference (upsert)
   * Conflict resolution on (employee_id, week_start)
   */
  async createOrUpdate(data: CreateOrUpdatePreferenceData): Promise<ShiftPreference> {
    try {
      const { data: preference, error } = await supabase
        .from('shift_preferences')
        .upsert(
          {
            employee_id: data.employee_id,
            week_start: data.week_start,
            slots: data.slots,
            submitted_at: new Date().toISOString(),
          },
          {
            onConflict: 'employee_id,week_start',
          }
        )
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create/update shift preference: ${error.message}`);
      }

      if (!preference) {
        throw new Error('No preference returned from database');
      }

      return preference as ShiftPreference;
    } catch (error) {
      console.error('Shift preference create/update error:', error);
      throw error;
    }
  },

  /**
   * Find shift preference by employee and week
   * Returns null if not found
   */
  async findByEmployeeAndWeek(
    employeeId: string,
    weekStart: string
  ): Promise<ShiftPreference | null> {
    try {
      const { data, error } = await supabase
        .from('shift_preferences')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('week_start', weekStart)
        .single();

      // PGRST116 = not found (not an error)
      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to find shift preference: ${error.message}`);
      }

      return data ? (data as ShiftPreference) : null;
    } catch (error) {
      console.error('Shift preference find error:', error);
      throw error;
    }
  },

  /**
   * Find all shift requests for a manager's employees
   * Returns array (empty if no requests)
   */
  async findRequestsByManagerAndWeek(
    managerId: string,
    weekStart: string
  ): Promise<ShiftRequestWithEmployee[]> {
    try {
      const { data, error } = await supabase
        .from('shift_preferences')
        .select('*, employees(id, full_name, manager_id)')
        .eq('employees.manager_id', managerId)
        .eq('week_start', weekStart);

      if (error) {
        throw new Error(`Failed to find shift requests: ${error.message}`);
      }

      // Transform Supabase response to our format
      const transformed = (data || []).map((row: any) => ({
        id: row.id,
        employee_id: row.employee_id,
        week_start: row.week_start,
        slots: row.slots,
        submitted_at: row.submitted_at,
        employees: row.employees || { id: '', full_name: 'Unknown', manager_id: '' },
      }));

      return transformed as ShiftRequestWithEmployee[];
    } catch (error) {
      console.error('Shift requests find error:', error);
      throw error;
    }
  },
};
