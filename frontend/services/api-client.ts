import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase.config';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get fresh token (auto-refreshes Supabase session if needed)
 * Priority: AsyncStorage (for employee JWT) > Supabase session (for manager)
 */
async function getFreshToken(): Promise<string | null> {
  // CRITICAL: Use multiGet to bypass iOS AsyncStorage cache
  // getItem() can return stale cached values on iOS
  const [[, storedToken]] = await AsyncStorage.multiGet(['auth_token']);
  
  // DEBUG: Log all AsyncStorage keys to verify token is actually removed
  const allKeys = await AsyncStorage.getAllKeys();
  console.log('[API] All AsyncStorage keys:', allKeys);
  console.log('[API] auth_token value:', storedToken);
  
  if (storedToken) {
    console.log('[API] Using employee token from AsyncStorage');
    // Employee token exists, use it
    return storedToken;
  }

  // Fallback to Supabase session (for manager tokens)
  // Use refreshSession() to ensure fresh token (not cached/expired)
  console.log('[API] No AsyncStorage token, trying Supabase refresh...');
  const { data: { session }, error } = await supabase.auth.refreshSession();

  if (error) {
    console.error('[API] Supabase refresh error:', error.message);
    return null;
  }

  if (session?.access_token) {
    console.log('[API] ✅ Got fresh Supabase token');
    // Manager session exists, use Supabase token
    return session.access_token;
  }

  console.warn('[API] ⚠️ No token available - user not logged in?');
  // No token found
  return null;
}

/**
 * Fetch wrapper with automatic token injection
 *
 * @param endpoint - API endpoint path (e.g., '/api/manager/employees')
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Promise<APIResponse<T>> - Standardized response format
 *
 * @example
 * const response = await apiClient<Employee[]>('/api/manager/employees', {
 *   method: 'GET'
 * });
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  try {
    // Get fresh token (auto-refreshes if needed)
    const token = await getFreshToken();

    console.log(`[API] Request: ${options.method || 'GET'} ${endpoint}`);
    console.log(`[API] Token present: ${token ? 'YES' : 'NO'}`);

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log(`[API] Auth header: Bearer ${token.substring(0, 20)}...`);
    } else {
      console.warn('[API] ⚠️ No token - request will fail if protected');
    }

    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`[API] Full URL: ${fullUrl}`);

    // Make request
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    console.log(`[API] Response status: ${response.status} ${response.statusText}`);

    // Parse JSON response
    const data = await response.json();

    console.log(`[API] Response success: ${data.success}`);
    if (!data.success) {
      console.error(`[API] Response error: ${data.error}`);
    }

    // Return response (backend already uses { success, data, error } format)
    return data;

  } catch (error) {
    console.error('API Error:', endpoint, error instanceof Error ? error.message : 'Unknown');

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network request failed',
    };
  }
}

/**
 * Save authentication token to AsyncStorage
 *
 * @param token - JWT token from login response
 */
export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem('auth_token', token);
}

/**
 * Clear authentication token (logout)
 * Also flushes AsyncStorage cache to prevent stale reads
 */
export async function clearToken(): Promise<void> {
  // DEBUG: Check what's in AsyncStorage BEFORE removal
  const beforeKeys = await AsyncStorage.getAllKeys();
  const beforeToken = await AsyncStorage.getItem('auth_token');
  console.log('[clearToken] BEFORE - Keys:', beforeKeys);
  console.log('[clearToken] BEFORE - Token exists:', !!beforeToken);
  
  await AsyncStorage.removeItem('auth_token');
  
  // DEBUG: Verify it's actually removed
  const afterKeys = await AsyncStorage.getAllKeys();
  const afterToken = await AsyncStorage.getItem('auth_token');
  console.log('[clearToken] AFTER - Keys:', afterKeys);
  console.log('[clearToken] AFTER - Token exists:', !!afterToken);
  
  // CRITICAL: Flush AsyncStorage cache to prevent getFreshToken() from reading stale values
  // Without this, iOS may return cached value even after removeItem()
  await AsyncStorage.getAllKeys(); // Force cache refresh
  console.log('[clearToken] ✅ Token removed and cache flushed');
}

/**
 * Get current authentication token
 *
 * @returns Token string or null if not logged in
 */
export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem('auth_token');
}
