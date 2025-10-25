// ==========================================
// SHIFT PREFERENCES TYPE DEFINITIONS
// ==========================================

export type SlotStatus = 'available' | 'unavailable' | 'off_request' | null;

export interface ShiftSlot {
  day: string;        // 'monday', 'tuesday', etc.
  time: string;       // '08:00', '08:30', etc.
  status: SlotStatus;
}

export interface ShiftPreference {
  id: string;
  employee_id: string;
  week_start: string;         // 'YYYY-MM-DD' format
  slots: ShiftSlot[];
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

// ==========================================
// API REQUEST/RESPONSE TYPES
// ==========================================

export interface SubmitPreferencesRequest {
  week_start: string;         // 'YYYY-MM-DD' format
  slots: ShiftSlot[];
}

export interface ShiftPreferenceResponse {
  id: string;
  employee_id: string;
  week_start: string;
  slots: ShiftSlot[];
  submitted_at: string | null;
}

export interface ShiftRequestsResponse {
  employee_id: string;
  employee_name: string;
  week_start: string;
  slots: ShiftSlot[];
  submitted_at: string | null;
}
