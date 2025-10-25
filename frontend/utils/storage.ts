import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/config/supabase.config';
import type { SlotStatus, Employee, Manager } from '@/types';

// Storage Keys
const KEYS = {
  USER_SESSION: '@shiffy_user_session',
  USER_TYPE: '@shiffy_user_type',
  SHIFT_PREFERENCES: '@shiffy_shift_preferences',
  PREFERENCE_DRAFT: '@shiffy_preference_draft',
};

// ==========================================
// USER SESSION
// ==========================================

interface UserSession {
  user: Employee | Manager;
  userType: 'employee' | 'manager';
  accessToken: string;
}

export async function saveUserSession(session: UserSession): Promise<void> {
  try {
    await AsyncStorage.multiSet([
      [KEYS.USER_SESSION, JSON.stringify(session.user)],
      [KEYS.USER_TYPE, session.userType],
    ]);
  } catch (error) {
    console.error('Failed to save user session:', error);
    throw error;
  }
}

export async function getUserSession(): Promise<UserSession | null> {
  try {
    const [[, userJson], [, userType]] = await AsyncStorage.multiGet([
      KEYS.USER_SESSION,
      KEYS.USER_TYPE,
    ]);

    if (!userJson || !userType) return null;

    const user = JSON.parse(userJson);

    // Get fresh token (auto-refreshes for managers)
    let accessToken = '';

    if (userType === 'manager') {
      // For managers: Use Supabase session (auto-refreshes if expired)
      const { data: { session }, error } = await supabase.auth.getSession();

      if (!error && session?.access_token) {
        accessToken = session.access_token;
        // Update AsyncStorage with fresh token
        await AsyncStorage.setItem('auth_token', session.access_token);
      }
    } else {
      // For employees: Get from AsyncStorage (custom JWT)
      const token = await AsyncStorage.getItem('auth_token');
      accessToken = token || '';
    }

    return {
      user,
      userType: userType as 'employee' | 'manager',
      accessToken,
    };
  } catch (error) {
    console.error('Failed to get user session:', error);
    return null;
  }
}

export async function clearUserSession(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([KEYS.USER_SESSION, KEYS.USER_TYPE]);
  } catch (error) {
    console.error('Failed to clear user session:', error);
    throw error;
  }
}

// ==========================================
// SHIFT PREFERENCES
// ==========================================

interface ShiftPreferenceData {
  weekStart: string; // YYYY-MM-DD
  grid: Record<string, SlotStatus>;
  submittedAt: string | null;
}

export async function saveShiftPreferences(
  employeeId: string,
  weekStart: string,
  grid: Record<string, SlotStatus>
): Promise<void> {
  try {
    const key = `${KEYS.SHIFT_PREFERENCES}_${employeeId}_${weekStart}`;
    const data: ShiftPreferenceData = {
      weekStart,
      grid,
      submittedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save shift preferences:', error);
    throw error;
  }
}

export async function loadShiftPreferences(
  employeeId: string,
  weekStart: string
): Promise<ShiftPreferenceData | null> {
  try {
    const key = `${KEYS.SHIFT_PREFERENCES}_${employeeId}_${weekStart}`;
    const json = await AsyncStorage.getItem(key);
    if (!json) return null;
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to load shift preferences:', error);
    return null;
  }
}

// ==========================================
// PREFERENCE DRAFT (Auto-save)
// ==========================================

export async function saveDraft(
  employeeId: string,
  weekStart: string,
  grid: Record<string, SlotStatus>
): Promise<void> {
  try {
    const key = `${KEYS.PREFERENCE_DRAFT}_${employeeId}_${weekStart}`;
    const data: ShiftPreferenceData = {
      weekStart,
      grid,
      submittedAt: null,
    };
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save draft:', error);
    // Don't throw - drafts are not critical
  }
}

export async function loadDraft(
  employeeId: string,
  weekStart: string
): Promise<ShiftPreferenceData | null> {
  try {
    const key = `${KEYS.PREFERENCE_DRAFT}_${employeeId}_${weekStart}`;
    const json = await AsyncStorage.getItem(key);
    if (!json) return null;
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

export async function clearDraft(employeeId: string, weekStart: string): Promise<void> {
  try {
    const key = `${KEYS.PREFERENCE_DRAFT}_${employeeId}_${weekStart}`;
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear draft:', error);
    // Don't throw - not critical
  }
}

// ==========================================
// UTILITY
// ==========================================

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Failed to clear all data:', error);
    throw error;
  }
}

export async function getAllKeys(): Promise<readonly string[]> {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Failed to get all keys:', error);
    return [];
  }
}
