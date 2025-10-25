import { shiftRepository } from '../repositories/shift.repository';
import type {
  ShiftSlot,
  ShiftPreferenceResponse,
  ShiftRequestsResponse,
} from '../types/shift.types';

// ==========================================
// SHIFT PREFERENCE SERVICE
// ==========================================

// Week format regex (YYYY-MM-DD)
const WEEK_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const shiftService = {
  /**
   * Submit or update shift preferences for an employee
   */
  async submitPreferences(
    employeeId: string,
    weekStart: string,
    slots: ShiftSlot[]
  ): Promise<ShiftPreferenceResponse> {
    // Validate slots array
    if (!Array.isArray(slots) || slots.length === 0) {
      throw new Error('Slots array cannot be empty');
    }

    // Validate week_start format
    if (!WEEK_FORMAT_REGEX.test(weekStart)) {
      throw new Error('Invalid week_start format. Expected YYYY-MM-DD');
    }

    try {
      const preference = await shiftRepository.createOrUpdate({
        employee_id: employeeId,
        week_start: weekStart,
        slots,
      });

      return {
        id: preference.id,
        employee_id: preference.employee_id,
        week_start: preference.week_start,
        slots: preference.slots,
        submitted_at: preference.submitted_at,
      };
    } catch (error) {
      console.error('Submit preferences error:', error);
      throw new Error(
        `Failed to submit preferences: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  /**
   * Get shift preferences for an employee by week
   * Returns null if not found
   */
  async getMyPreferences(
    employeeId: string,
    weekStart: string
  ): Promise<ShiftPreferenceResponse | null> {
    // Validate week_start format
    if (!WEEK_FORMAT_REGEX.test(weekStart)) {
      throw new Error('Invalid week_start format. Expected YYYY-MM-DD');
    }

    try {
      const preference = await shiftRepository.findByEmployeeAndWeek(
        employeeId,
        weekStart
      );

      if (!preference) {
        return null;
      }

      return {
        id: preference.id,
        employee_id: preference.employee_id,
        week_start: preference.week_start,
        slots: preference.slots,
        submitted_at: preference.submitted_at,
      };
    } catch (error) {
      console.error('Get my preferences error:', error);
      throw new Error(
        `Failed to get preferences: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  /**
   * Get all shift requests for a manager's employees
   * Returns empty array if no requests
   */
  async getShiftRequests(
    managerId: string,
    weekStart: string
  ): Promise<ShiftRequestsResponse[]> {
    // Validate week_start format
    if (!WEEK_FORMAT_REGEX.test(weekStart)) {
      throw new Error('Invalid week_start format. Expected YYYY-MM-DD');
    }

    try {
      const requests = await shiftRepository.findRequestsByManagerAndWeek(
        managerId,
        weekStart
      );

      // Transform to response format
      return requests.map((request) => ({
        employee_id: request.employee_id,
        employee_name: request.employees.full_name,
        week_start: request.week_start,
        slots: request.slots,
        submitted_at: request.submitted_at,
      }));
    } catch (error) {
      console.error('Get shift requests error:', error);
      throw new Error(
        `Failed to get shift requests: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};
