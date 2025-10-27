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
          signal: AbortSignal.timeout(300000), // 5 minute timeout (increased from 3)
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

      console.log('Raw response length:', responseText.length);
      console.log('Raw response preview:', responseText.substring(0, 200));

      // ==========================================
      // AGGRESSIVE JSON CLEANING & EXTRACTION
      // ==========================================
      
      // Step 1: Remove markdown code blocks
      responseText = responseText
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/g, '')
        .trim();

      // Step 2: Remove any text before first { or after last }
      const firstBrace = responseText.indexOf('{');
      const lastBrace = responseText.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
        console.error('No JSON braces found in response:', responseText);
        throw new Error('AI response does not contain valid JSON structure');
      }

      responseText = responseText.substring(firstBrace, lastBrace + 1);

      // Step 3: Remove common AI preambles/postambles
      responseText = responseText
        .replace(/^(here is|here's|sure|okay|ok|alright)[^{]*/gi, '')
        .replace(/\n*(note|explanation|i hope|let me know)[^}]*$/gi, '')
        .trim();

      // Step 4: Fix common JSON errors
      responseText = responseText
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/\n/g, ' ') // Remove newlines that might break parsing
        .replace(/\s+/g, ' '); // Normalize whitespace

      console.log('Cleaned response length:', responseText.length);
      console.log('Cleaned response preview:', responseText.substring(0, 200));

      // Parse the JSON response
      let scheduleData;
      try {
        scheduleData = JSON.parse(responseText);
        console.log('✅ Successfully parsed JSON');
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.error('Failed text:', responseText);
        throw new Error(`Invalid JSON from AI: ${parseError instanceof Error ? parseError.message : 'Parse failed'}`);
      }

      // Validate structure
      if (!scheduleData.shifts || !Array.isArray(scheduleData.shifts)) {
        console.error('Invalid schedule structure:', scheduleData);
        throw new Error('AI response missing "shifts" array');
      }

      console.log('Parsed schedule with', scheduleData.shifts.length, 'shifts');

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

    // ==========================================
    // CRITICAL JSON OUTPUT INSTRUCTIONS
    // ==========================================
    lines.push('⚠️ CRITICAL INSTRUCTIONS - READ CAREFULLY:');
    lines.push('');
    lines.push('YOU MUST RESPOND WITH VALID JSON ONLY. NO EXPLANATIONS. NO MARKDOWN. NO TEXT.');
    lines.push('START YOUR RESPONSE WITH { AND END WITH }');
    lines.push('DO NOT wrap the JSON in ```json or ``` markers.');
    lines.push('DO NOT add any text before or after the JSON object.');
    lines.push('');
    lines.push('REQUIRED JSON STRUCTURE (copy this exact format):');
    lines.push('{');
    lines.push('  "shifts": [');
    lines.push('    {');
    lines.push('      "employee_id": "exact-uuid-from-below",');
    lines.push('      "employee_name": "Full Name",');
    lines.push('      "day": "Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday",');
    lines.push('      "start_time": "HH:MM",');
    lines.push('      "end_time": "HH:MM",');
    lines.push('      "hours": 8');
    lines.push('    }');
    lines.push('  ],');
    lines.push('  "summary": {');
    lines.push('    "total_shifts": 0,');
    lines.push('    "total_employees": 0,');
    lines.push('    "hours_per_employee": {},');
    lines.push('    "warnings": []');
    lines.push('  }');
    lines.push('}');
    lines.push('');
    lines.push('✅ VALIDATION CHECKLIST BEFORE RESPONDING:');
    lines.push('1. ✓ Response starts with { (no text before)');
    lines.push('2. ✓ Response ends with } (no text after)');
    lines.push('3. ✓ No ```json or ``` markers');
    lines.push('4. ✓ All strings use double quotes "');
    lines.push('5. ✓ All employee_id values are exact UUIDs from employee list below');
    lines.push('6. ✓ All day values are exact: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday');
    lines.push('7. ✓ All times are in HH:MM format (e.g., "08:00", "16:30")');
    lines.push('8. ✓ No trailing commas in JSON');
    lines.push('9. ✓ All brackets and braces are properly closed');
    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════════════');
    lines.push('');

    // ==========================================
    // STORE & SCHEDULE INFORMATION
    // ==========================================
    lines.push(`STORE: ${storeName}`);
    lines.push(`WEEK START: ${weekStart}`);
    lines.push(`OPERATING HOURS: 08:00-22:00 (7 days a week)`);
    lines.push('');

    // Employee count
    lines.push(`TOTAL EMPLOYEES TO SCHEDULE: ${employees.length}`);
    lines.push('');

    // ==========================================
    // EMPLOYEE DATA WITH EXACT IDs
    // ==========================================
    lines.push('EMPLOYEE ROSTER (use EXACT employee_id in JSON):');
    lines.push('═══════════════════════════════════════════════════════════════════');

    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      
      lines.push('');
      lines.push(`[${i + 1}/${employees.length}] EMPLOYEE_ID: ${emp.employee_id}`);
      lines.push(`    Name: ${emp.full_name}`);

      // Job description
      if (emp.job_description) {
        lines.push(`    Position: ${emp.job_description}`);
      }

      // Max weekly hours
      if (emp.max_weekly_hours !== null) {
        if (emp.max_weekly_hours === 0) {
          lines.push(`    ⛔ STATUS: ON LEAVE - DO NOT SCHEDULE THIS EMPLOYEE`);
        } else {
          lines.push(`    Max Hours/Week: ${emp.max_weekly_hours}h (try not to exceed)`);
        }
      }

      if (emp.notes) {
        lines.push(`    Manager Notes: ${emp.notes}`);
      }

      // Availability matrix
      if (emp.slots && emp.slots.length > 0) {
        lines.push(`    Availability:`);
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        for (const day of days) {
          const daySlots = emp.slots.filter(s => s.day === day);
          if (daySlots.length > 0) {
            const statusMap = daySlots.map(s => {
              if (s.status === 'unavailable') return `${s.time}:❌`;
              if (s.status === 'available') return `${s.time}:✓`;
              if (s.status === 'off_request') return `${s.time}:🏖️`;
              return `${s.time}:?`;
            });
            lines.push(`      ${day}: ${statusMap.join(', ')}`);
          }
        }
      } else {
        lines.push(`    Availability: ALL TIMES (no preferences submitted)`);
      }
    }

    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════════════');
    lines.push('');

    // ==========================================
    // SCHEDULING RULES & CONSTRAINTS
    // ==========================================
    lines.push('🎯 SCHEDULING RULES (MUST FOLLOW):');
    lines.push('');
    lines.push('1. SHIFT DURATION:');
    lines.push('   - Each shift = 8-9 hours exactly');
    lines.push('   - Example: 08:00-16:00 (8h) or 08:00-17:00 (9h)');
    lines.push('');
    lines.push('2. AVAILABILITY RULES:');
    lines.push('   - ❌ unavailable = CANNOT work (hard constraint, never assign)');
    lines.push('   - ⭐ preferred = PRIORITIZE these slots first');
    lines.push('   - ✓ available = Can work, use if needed');
    lines.push('   - 🏖️ off_request = Employee wants day off (use ONLY as last resort)');
    lines.push('   - If no slots specified = treat as fully available all times');
    lines.push('');
    lines.push('3. HOUR LIMITS:');
    lines.push('   - max_weekly_hours is a SOFT limit (try not to exceed by more than 2-3 hours)');
    lines.push('   - If max_weekly_hours = 0 → Employee is ON LEAVE (skip completely)');
    lines.push('');
    lines.push('4. FAIRNESS:');
    lines.push('   - Distribute hours fairly (avoid one person getting 50h, another 10h)');
    lines.push('   - Aim for balanced weekly hours across all employees');
    lines.push('');
    lines.push('5. COVERAGE:');
    lines.push('   - Store operates 08:00-22:00 every day (14 hours/day)');
    lines.push('   - Ensure adequate coverage for all days');
    lines.push('   - Prefer 2 shifts/day: morning (08:00-16:00) + afternoon/evening (14:00-22:00)');
    lines.push('');
    lines.push('6. TIME SLOTS MAPPING:');
    lines.push('   - morning = 08:00-12:00');
    lines.push('   - afternoon = 12:00-17:00');
    lines.push('   - evening = 17:00-22:00');
    lines.push('');

    // ==========================================
    // FINAL JSON REMINDER
    // ==========================================
    lines.push('═══════════════════════════════════════════════════════════════════');
    lines.push('');
    lines.push('⚠️ FINAL REMINDER - YOUR RESPONSE MUST BE:');
    lines.push('');
    lines.push('✓ Pure JSON object (starts with {, ends with })');
    lines.push('✓ NO markdown, NO explanations, NO code blocks');
    lines.push('✓ Use EXACT employee_id values from the roster above');
    lines.push('✓ Use EXACT day names: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday');
    lines.push('✓ Times in HH:MM format');
    lines.push('✓ Valid JSON (test with JSON.parse before sending)');
    lines.push('');
    lines.push('BEGIN YOUR JSON RESPONSE NOW:');

    return lines.join('\n');
  },
};
