import { scheduleRepository } from '../repositories/schedule.repository';
import * as employeeRepository from '../repositories/employee.repository';
import { shiftRepository } from '../repositories/shift.repository';
import { llamaService } from './llama.service';
import type {
  ScheduleResponse,
  MyScheduleResponse,
} from '../types/schedule.types';
import type { Employee } from '../types/employee.types';

// ==========================================
// SCHEDULE SERVICE
// ==========================================

// Week format regex (YYYY-MM-DD)
const WEEK_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const scheduleService = {
  /**
   * Generate schedule using AI (Llama)
   */
  async generateSchedule(
    managerId: string,
    weekStart: string
  ): Promise<ScheduleResponse> {
    // Validate week_start format
    if (!WEEK_FORMAT_REGEX.test(weekStart)) {
      throw new Error('Invalid week_start format. Expected YYYY-MM-DD');
    }

    try {
      // Get manager's employees
      const employees = await employeeRepository.findByManager(managerId);

      if (!employees || employees.length === 0) {
        throw new Error('No employees found for this manager');
      }

      // Get shift preferences for each employee
      const employeePreferences = await Promise.all(
        employees.map(async (emp: Employee) => {
          const preference = await shiftRepository.findByEmployeeAndWeek(
            emp.id,
            weekStart
          );

          return {
            employee_id: emp.id,
            full_name: emp.full_name,
            job_description: emp.job_description,
            max_weekly_hours: emp.max_weekly_hours,
            slots: preference?.slots || [],
            notes: emp.manager_notes || undefined,
          };
        })
      );

      // Call Llama API to generate schedule
      const { shifts, summary } = await llamaService.generateSchedule(
        'Store Name', // TODO: Get from manager profile in future
        weekStart,
        employeePreferences
      );

      // Save generated schedule to database
      const schedule = await scheduleRepository.create({
        manager_id: managerId,
        week_start: weekStart,
        shifts,
        ai_metadata: summary,
      });

      return {
        id: schedule.id,
        week_start: schedule.week_start,
        status: schedule.status,
        shifts: schedule.shifts,
        summary: schedule.ai_metadata,
        generated_at: schedule.generated_at,
        approved_at: schedule.approved_at,
      };
    } catch (error) {
      console.error('Generate schedule error:', error);
      throw new Error(
        `Failed to generate schedule: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  /**
   * Approve schedule (manager only)
   */
  async approveSchedule(
    managerId: string,
    scheduleId: string
  ): Promise<ScheduleResponse> {
    try {
      // First verify the schedule exists and belongs to this manager
      const { data: schedule, error } = await require('../config/supabase.config').supabase
        .from('schedules')
        .select('*')
        .eq('id', scheduleId)
        .eq('manager_id', managerId)
        .single();

      if (error || !schedule) {
        throw new Error('Schedule not found or access denied');
      }

      // Update status to approved
      const approvedSchedule = await scheduleRepository.updateStatus(
        scheduleId,
        'approved',
        new Date().toISOString()
      );

      return {
        id: approvedSchedule.id,
        week_start: approvedSchedule.week_start,
        status: approvedSchedule.status,
        shifts: approvedSchedule.shifts,
        summary: approvedSchedule.ai_metadata,
        generated_at: approvedSchedule.generated_at,
        approved_at: approvedSchedule.approved_at,
      };
    } catch (error) {
      console.error('Approve schedule error:', error);
      throw new Error(
        `Failed to approve schedule: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  /**
   * Get employee's schedule (only approved schedules, only their shifts)
   */
  async getMySchedule(
    employeeId: string,
    weekStart: string
  ): Promise<MyScheduleResponse | null> {
    // Validate week_start format
    if (!WEEK_FORMAT_REGEX.test(weekStart)) {
      throw new Error('Invalid week_start format. Expected YYYY-MM-DD');
    }

    try {
      const schedule = await scheduleRepository.findApprovedByEmployeeAndWeek(
        employeeId,
        weekStart
      );

      if (!schedule) {
        return null;
      }

      // Filter shifts to only show this employee's shifts
      const myShifts = schedule.shifts.filter(
        (shift) => shift.employee_id === employeeId
      );

      return {
        week_start: schedule.week_start,
        shifts: myShifts,
        status: schedule.status,
      };
    } catch (error) {
      console.error('Get my schedule error:', error);
      throw new Error(
        `Failed to get schedule: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  /**
   * Get manager's schedule (all employees, any status)
   */
  async getManagerSchedule(
    managerId: string,
    weekStart: string
  ): Promise<ScheduleResponse | null> {
    // Validate week_start format
    if (!WEEK_FORMAT_REGEX.test(weekStart)) {
      throw new Error('Invalid week_start format. Expected YYYY-MM-DD');
    }

    try {
      const schedule = await scheduleRepository.findByManagerAndWeek(
        managerId,
        weekStart
      );

      if (!schedule) {
        return null;
      }

      return {
        id: schedule.id,
        week_start: schedule.week_start,
        status: schedule.status,
        shifts: schedule.shifts,
        summary: schedule.ai_metadata,
        generated_at: schedule.generated_at,
        approved_at: schedule.approved_at,
      };
    } catch (error) {
      console.error('Get manager schedule error:', error);
      throw new Error(
        `Failed to get schedule: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};
