import type { DayOfWeek, SlotStatus } from '@/types';

// Generate all 30-minute time slots from 00:00 to 23:30 (48 slots)
export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
}

// Get Turkish day labels for grid header
export function getDayLabels(): string[] {
  return ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
}

// Get day keys for data structure
export function getDayKeys(): DayOfWeek[] {
  return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
}

// Generate unique key for slot (e.g., "monday-08:00")
export function getSlotKey(day: DayOfWeek, time: string): string {
  return `${day}-${time}`;
}

// Parse slot key back to day and time
export function parseSlotKey(key: string): { day: DayOfWeek; time: string } {
  const [day, time] = key.split('-');
  return { day: day as DayOfWeek, time };
}

// Cycle through slot states: null → available → maybe → unavailable → null
export function cycleSlotStatus(current: SlotStatus): SlotStatus {
  if (current === null) return 'available';
  if (current === 'available') return 'unavailable';
  if (current === 'unavailable') return 'off_request';
  return null;
}

// Get week start (Monday) from any date
export function getWeekStart(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Sunday = 0, Monday = 1
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

// Format week range for display (e.g., "13 - 19 Ocak 2025")
export function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();
  
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  
  const month = monthNames[weekEnd.getMonth()];
  const year = weekEnd.getFullYear();
  
  return `${startDay} - ${endDay} ${month} ${year}`;
}

// Convert Date to YYYY-MM-DD string
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Initialize empty grid (all slots null)
export function initializeEmptyGrid(): Record<string, SlotStatus> {
  const timeSlots = generateTimeSlots();
  const days = getDayKeys();
  const grid: Record<string, SlotStatus> = {};
  
  timeSlots.forEach(time => {
    days.forEach(day => {
      grid[getSlotKey(day, time)] = null;
    });
  });
  
  return grid;
}

// Count slots by status for statistics
export function countSlotsByStatus(grid: Record<string, SlotStatus>) {
  return Object.values(grid).reduce(
    (acc, status) => {
      if (status === 'available') acc.available++;
      if (status === 'unavailable') acc.unavailable++;
      if (status === 'off_request') acc.offRequest++;
      if (status === null) acc.empty++;
      return acc;
    },
    { available: 0, unavailable: 0, offRequest: 0, empty: 0 }
  );
}

// Count hours by status for each day
export function countHoursByDayAndStatus(grid: Record<string, SlotStatus>) {
  const days = getDayKeys();
  const timeSlots = generateTimeSlots();
  
  const result: Record<DayOfWeek, { available: number; unavailable: number; offRequest: number }> = {
    monday: { available: 0, unavailable: 0, offRequest: 0 },
    tuesday: { available: 0, unavailable: 0, offRequest: 0 },
    wednesday: { available: 0, unavailable: 0, offRequest: 0 },
    thursday: { available: 0, unavailable: 0, offRequest: 0 },
    friday: { available: 0, unavailable: 0, offRequest: 0 },
    saturday: { available: 0, unavailable: 0, offRequest: 0 },
    sunday: { available: 0, unavailable: 0, offRequest: 0 },
  };
  
  days.forEach(day => {
    timeSlots.forEach(time => {
      const key = getSlotKey(day, time);
      const status = grid[key];
      
      if (status === 'available') {
        result[day].available += 0.5; // Each slot is 30 minutes = 0.5 hours
      } else if (status === 'unavailable') {
        result[day].unavailable += 0.5;
      } else if (status === 'off_request') {
        result[day].offRequest += 0.5;
      }
    });
  });
  
  return result;
}

// ====================================================================
// BACKEND API CONVERSION HELPERS
// ====================================================================

import type { TimeSlot } from '@/types';

/**
 * Convert grid object to TimeSlot array for backend API
 * Only includes non-null slots (skips empty slots)
 */
export function gridToSlots(grid: Record<string, SlotStatus>): TimeSlot[] {
  const slots: TimeSlot[] = [];

  Object.entries(grid).forEach(([key, status]) => {
    if (status !== null) {
      const { day, time } = parseSlotKey(key);
      slots.push({ day, time, status });
    }
  });

  return slots;
}

/**
 * Convert TimeSlot array from backend API to grid object
 * Initializes empty grid and populates with slots
 */
export function slotsToGrid(slots: TimeSlot[]): Record<string, SlotStatus> {
  const grid = initializeEmptyGrid();

  slots.forEach(slot => {
    const key = getSlotKey(slot.day, slot.time);
    grid[key] = slot.status;
  });

  return grid;
}
