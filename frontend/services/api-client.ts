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
  // First, try AsyncStorage (for employee tokens - custom JWT)
  const storedToken = await AsyncStorage.getItem('auth_token');
  
  if (storedToken) {
    // Employee token exists, use it
    return storedToken;
  }

  // Fallback to Supabase session (for manager tokens)
  const { data: { session }, error } = await supabase.auth.getSession();

  if (!error && session?.access_token) {
    // Manager session exists, use Supabase token
    return session.access_token;
  }

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

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const fullUrl = `${API_BASE_URL}${endpoint}`;

    // Make request
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    // Parse JSON response
    const data = await response.json();

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
 */
export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem('auth_token');
}

/**
 * Get current authentication token
 *
 * @returns Token string or null if not logged in
 */
export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem('auth_token');
}
