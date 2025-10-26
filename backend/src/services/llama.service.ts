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
      // Build prompt for shift scheduling
      const prompt = this.buildSchedulePrompt(storeName, weekStart, employees);

      console.log('=== GENERATING SCHEDULE ===');
      console.log('API URL:', config.runpod.apiUrl);
      console.log('Model: llama3.1:8b-instruct-q4_K_M');
      console.log('Employees:', employees.length);

      const response = await fetch(
        `${config.runpod.apiUrl}/api/generate-with-system`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.runpod.apiKey,
          },
          body: JSON.stringify({
            prompt: prompt,
            system_prompt_key: 'shift_scheduler',
            model: 'llama3.1:8b-instruct-q4_K_M',
            stream: false,
          }),
          signal: AbortSignal.timeout(180000), // 3 minute timeout
        }
      );

      if (!response.ok) {
        throw new Error(`RunPod API error: ${response.status}`);
      }

      const data = await response.json() as any;

      console.log('=== AI RESPONSE ===');
      console.log('Model:', data.model);
      console.log('Done:', data.done);

      // Response contains STRING JSON in "response" field
      let responseText = data.response;
      if (!responseText) {
        throw new Error('No response text from RunPod API');
      }

      // Clean markdown formatting if present
      responseText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      // Parse the JSON response
      const scheduleData = JSON.parse(responseText);
      console.log('Parsed schedule:', JSON.stringify(scheduleData, null, 2));

      // Convert to expected format
      const shifts: Shift[] = [];
      const hoursPerEmployee: Record<string, number> = {};

      if (scheduleData.shifts && Array.isArray(scheduleData.shifts)) {
        for (const shift of scheduleData.shifts) {
          const employee = employees.find(e => e.employee_id === shift.employee_id);

          shifts.push({
            employee_id: shift.employee_id,
            employee_name: employee?.full_name || shift.employee_name || 'Unknown',
            job_description: employee?.job_description || 'Çalışan',
            day: shift.day,
            start_time: shift.start_time,
            end_time: shift.end_time,
            hours: shift.hours || 8,
          });

          hoursPerEmployee[shift.employee_id] =
            (hoursPerEmployee[shift.employee_id] || 0) + (shift.hours || 8);
        }
      }

      return {
        shifts,
        summary: scheduleData.summary || {
          total_shifts: shifts.length,
          total_employees: Object.keys(hoursPerEmployee).length,
          hours_per_employee: hoursPerEmployee,
          warnings: [],
        },
      };
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
