// ==========================================
// AUTH TYPES
// ==========================================

export type UserType = 'manager' | 'employee';

export interface Manager {
  id: string;
  email: string;
  store_name: string;
  created_at: string;
  subscription_status: 'trial' | 'active' | 'expired';
  subscription_tier: 'basic' | 'premium';
}

export interface Employee {
  id: string;
  manager_id: string;
  username: string;
  full_name: string;
  job_description: string | null; // e.g., "Cashier, Server" - comma-separated roles
  max_weekly_hours: number | null; // 0-150, 0=on leave, null=no limit
  first_login: boolean;
  manager_notes: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  last_login: string | null;
}

// ==========================================
// SHIFT TYPES
// ==========================================

export type SlotStatus = 'available' | 'unavailable' | 'off_request' | null;

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface TimeSlot {
  day: DayOfWeek;
  time: string; // 'HH:MM' e.g. '08:00'
  status: SlotStatus;
}

export interface ShiftPreference {
  id: string;
  employee_id: string;
  week_start: string; // 'YYYY-MM-DD'
  slots: TimeSlot[];
  submitted_at: string | null;
}

export interface AssignedShift {
  id: string;
  employee_id: string;
  employee_name: string;
  day: DayOfWeek;
  start_time: string; // 'HH:MM'
  end_time: string; // 'HH:MM'
}

export interface WeekSchedule {
  id: string;
  manager_id: string;
  week_start: string; // 'YYYY-MM-DD'
  status: 'pending' | 'generated' | 'approved';
  shifts: AssignedShift[];
  generated_at: string | null;
  approved_at: string | null;
}

// ==========================================
// API TYPES
// ==========================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LoginResponse {
  access_token: string;
  user_id: string;
  user_type: UserType;
  first_login?: boolean;
}

export interface DashboardStats {
  pending_requests: number;
  week_status: 'pending' | 'generated' | 'approved';
  employee_count: number;
}
