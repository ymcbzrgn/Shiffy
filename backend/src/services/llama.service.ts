import { config } from '../config/env.config';
import type { Shift, ScheduleSummary } from '../types/schedule.types';

// ==========================================
// LLAMA SERVICE - RunPod AI Integration
// ==========================================

interface LlamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  parsed: {
    shifts: Shift[];
    summary: ScheduleSummary;
  };
  validation: {
    ok: boolean;
  };
}

interface EmployeePreference {
  employee_id: string;
  full_name: string;
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
        `${config.runpod.apiUrl}/api/generate-with-system`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.runpod.apiKey,
          },
          body: JSON.stringify({
            system_prompt_key: 'shift_scheduler', // Proxy injects system prompt
            prompt,
            model: 'llama3.1:8b-instruct-q6_K',
            stream: false,
            validate: true, // Proxy validates JSON schema
            options: {
              temperature: 0.5,
              num_ctx: 16384,
              num_predict: 3000,
            },
          }),
          signal: AbortSignal.timeout(30000), // 30s timeout
        }
      );

      if (!response.ok) {
        throw new Error(`RunPod API error: ${response.status}`);
      }

      const data = await response.json() as LlamaResponse;

      // Check validation (proxy validates against schema)
      if (!data.validation?.ok) {
        throw new Error('Schedule validation failed');
      }

      // Return parsed JSON (proxy already parsed it)
      return {
        shifts: data.parsed.shifts,
        summary: data.parsed.summary,
      };
    } catch (error) {
      console.error('Llama schedule generation error:', error);
      throw new Error(
        `Failed to generate schedule: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
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
    lines.push('- Distribute hours fairly among employees');
    lines.push('- Cover all operating hours (08:00-22:00)');

    return lines.join('\n');
  },
};
