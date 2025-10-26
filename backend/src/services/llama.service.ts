import { config } from '../config/env.config';
import type { Shift, ScheduleSummary } from '../types/schedule.types';

// ==========================================
// LLAMA SERVICE - RunPod AI Integration
// ==========================================

// Temporarily commented out - using dynamic parsing
// interface LlamaResponse {
//   model: string;
//   created_at: string;
//   response: string;
//   done: boolean;
//   parsed: {
//     shifts: Shift[];
//     summary: ScheduleSummary;
//   };
//   validation: {
//     ok: boolean;
//   };
// }

interface EmployeePreference {
  employee_id: string;
  full_name: string;
  job_description: string | null;
  max_weekly_hours: number | null;
  slots: Array<{
    day: string;
    time: string;
    status: 'available' | 'unavailable' | 'off_request' | null;
  }>;
  notes?: string;
}

export const llamaService = {
  /**
   * Generate schedule using RunPod Llama API
   */
  async generateSchedule(
    storeName: string,
    weekStart: string,
    employees: EmployeePreference[]
  ): Promise<{ shifts: Shift[]; summary: ScheduleSummary }> {
    try {
      const prompt = this.buildSchedulePrompt(storeName, weekStart, employees);

      const response = await fetch(
        `${config.runpod.apiUrl}/api/generate-schedule`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // No API key needed - CORS is open
          },
          body: JSON.stringify({
            store_hours: { start: '08:00', end: '22:00' },
            employees: employees.map(emp => ({
              id: emp.employee_id,
              name: emp.full_name,
              job_description: emp.job_description,
              availability: this.convertSlotsToAvailability(emp.slots),
              preferences: {
                max_hours_per_week: emp.max_weekly_hours || 40,
                notes: emp.notes,
              },
            })),
            requirements: {
              min_employees_per_shift: 1,
              shift_duration_hours: 8,
            },
          }),
          signal: AbortSignal.timeout(90000), // 90s timeout for AI generation
        }
      );

      if (!response.ok) {
        throw new Error(`RunPod API error: ${response.status}`);
      }

      const data = await response.json() as any;

      console.log('=== AI RESPONSE ===');
      console.log('Response keys:', Object.keys(data));
      console.log('Success:', data.success);

      // New API format: { success: true, schedule: {...} }
      if (data.success && data.schedule) {
        const scheduleData = data.schedule.schedule?.store || data.schedule;
        console.log('Schedule data:', JSON.stringify(scheduleData, null, 2));

        // Convert new format to old format (shifts array)
        const shifts: Shift[] = [];
        const hoursPerEmployee: Record<string, number> = {};

        // Parse schedule from new format
        for (const [date, daySchedule] of Object.entries(scheduleData)) {
          for (const [day, dayShifts] of Object.entries(daySchedule as any)) {
            for (const shift of (dayShifts as any[])) {
              shifts.push({
                employee_id: shift.employee_id,
                employee_name: employees.find(e => e.employee_id === shift.employee_id)?.full_name || 'Unknown',
                day: day,
                start_time: shift.start_time,
                end_time: shift.end_time,
              });

              // Calculate hours
              const [startHour, startMin] = shift.start_time.split(':').map(Number);
              const [endHour, endMin] = shift.end_time.split(':').map(Number);
              const hours = (endHour * 60 + endMin - (startHour * 60 + startMin)) / 60;
              hoursPerEmployee[shift.employee_id] = (hoursPerEmployee[shift.employee_id] || 0) + hours;
            }
          }
        }

        return {
          shifts,
          summary: {
            total_shifts: shifts.length,
            total_employees: Object.keys(hoursPerEmployee).length,
            hours_per_employee: hoursPerEmployee,
            warnings: [],
          },
        };
      }

      throw new Error('Invalid response format from RunPod API');
    } catch (error) {
      console.error('Llama schedule generation error:', error);
      throw new Error(
        `Failed to generate schedule: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },

  /**
   * Convert slot-based availability to time-range format
   */
  convertSlotsToAvailability(
    slots: Array<{ day: string; time: string; status: string | null }>
  ): Record<string, string[]> {
    const availability: Record<string, string[]> = {};
    const timeMapping: Record<string, string> = {
      morning: '08:00-12:00',
      afternoon: '12:00-17:00',
      evening: '17:00-22:00',
    };

    // Group by day and only include available/preferred slots
    for (const slot of slots) {
      if (slot.status === 'available' || slot.status === 'preferred') {
        const day = slot.day.toLowerCase();
        const timeRange = timeMapping[slot.time] || slot.time;

        if (!availability[day]) {
          availability[day] = [];
        }
        availability[day].push(timeRange);
      }
    }

    return availability;
  },

  /**
   * Build prompt for Llama schedule generation
   */
  buildSchedulePrompt(
    storeName: string,
    weekStart: string,
    employees: EmployeePreference[]
  ): string {
    const lines: string[] = [];

    lines.push(`STORE: ${storeName}`);
    lines.push(`WEEK: ${weekStart}`);
    lines.push(`OPERATING HOURS: 08:00-22:00 (Monday-Sunday)`);
    lines.push('');

    // Employee count
    lines.push(`TOTAL EMPLOYEES: ${employees.length}`);
    lines.push('');

    // Employee preferences
    for (const emp of employees) {
      lines.push(`EMPLOYEE ${emp.employee_id}: ${emp.full_name}`);

      // Job description
      if (emp.job_description) {
        lines.push(`Job Description: ${emp.job_description}`);
      }

      // Max weekly hours
      if (emp.max_weekly_hours !== null) {
        if (emp.max_weekly_hours === 0) {
          lines.push(`Status: ON LEAVE (do not schedule)`);
        } else {
          lines.push(`Max Weekly Hours: ${emp.max_weekly_hours}`);
        }
      }

      if (emp.notes) {
        lines.push(`Manager Notes: ${emp.notes}`);
      }

      lines.push('Availability:');

      if (emp.slots && emp.slots.length > 0) {
        for (const slot of emp.slots) {
          lines.push(`  ${slot.day} ${slot.time}: ${slot.status}`);
        }
      } else {
        lines.push('  No preferences submitted (use default availability)');
      }

      lines.push('');
    }

    lines.push('TASK: Generate optimal weekly shift schedule as JSON.');
    lines.push('RULES:');
    lines.push('- Each shift should be 8-9 hours');
    lines.push('- Respect employee availability (unavailable = cannot work)');
    lines.push('- Prefer available/preferred slots');
    lines.push('- off_request = employee wants day off (use as last resort)');
    lines.push('- Respect max_weekly_hours (soft limit, try not to exceed)');
    lines.push('- If max_weekly_hours = 0, skip employee entirely (on leave)');
    lines.push('- Distribute hours fairly among employees');
    lines.push('- Cover all operating hours (08:00-22:00)');

    return lines.join('\n');
  },
};
