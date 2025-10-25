// ==========================================
// SCHEDULE TYPE DEFINITIONS
// ==========================================

export type ScheduleStatus = 'pending' | 'generated' | 'approved';

export interface Shift {
  employee_id: string;
  employee_name: string;
  day: string;          // 'Monday', 'Tuesday', etc.
  start_time: string;   // '08:00'
  end_time: string;     // '17:00'
  hours: number;        // 9
}

export interface ScheduleSummary {
  total_employees: number;
  total_shifts: number;
  hours_per_employee: Record<string, number>;
  warnings: string[];
}

export interface Schedule {
  id: string;
  manager_id: string;
  week_start: string;
  status: ScheduleStatus;
  shifts: Shift[];
  ai_metadata: ScheduleSummary;
  generated_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

// ==========================================
// API REQUEST/RESPONSE TYPES
// ==========================================

export interface GenerateScheduleRequest {
  week_start: string;  // 'YYYY-MM-DD'
}

export interface ScheduleResponse {
  id: string;
  week_start: string;
  status: ScheduleStatus;
  shifts: Shift[];
  summary: ScheduleSummary;
  generated_at: string | null;
  approved_at: string | null;
}

export interface MyScheduleResponse {
  week_start: string;
  shifts: Shift[];  // Only employee's shifts
  status: ScheduleStatus;
}
