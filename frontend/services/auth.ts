import { supabase } from '../config/supabase.config';
import { Manager } from '../types';
import { saveToken, clearToken } from './api-client';

/**
 * Manager Login (Supabase Auth)
 */
export async function loginManager(
  email: string,
  password: string
): Promise<{ manager: Manager; token: string }> {
  // CRITICAL: Clear employee token FIRST, before any API calls
  // This prevents getFreshToken() from using stale employee tokens
  await clearToken();

  // Sign in with Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user || !data.session) {
    throw new Error('Login failed');
  }

  // IMPORTANT: Do NOT save Supabase token to AsyncStorage
  // AsyncStorage is for employee tokens only (custom JWT)
  // Manager tokens come from Supabase session directly

  // Fetch manager profile from database
  const { data: managerData, error: profileError } = await supabase
    .from('managers')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError || !managerData) {
    throw new Error('Failed to fetch manager profile');
  }

  return {
    manager: managerData as Manager,
    token: data.session.access_token,
  };
}

/**
 * Manager Registration (Supabase Auth)
 */
export async function registerManager(
  storeName: string,
  email: string,
  password: string
): Promise<{ manager: Manager; token: string }> {
  // CRITICAL: Clear employee token FIRST, before any API calls
  await clearToken();

  // Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user || !data.session) {
    throw new Error('Registration failed');
  }

  // Create manager profile
  const { data: managerData, error: profileError } = await supabase
    .from('managers')
    .insert({
      id: data.user.id,
      email,
      store_name: storeName,
      subscription_status: 'trial',
      subscription_tier: 'basic',
    })
    .select()
    .single();

  if (profileError || !managerData) {
    throw new Error('Failed to create manager profile');
  }

  // IMPORTANT: Do NOT save Supabase token to AsyncStorage
  // AsyncStorage is for employee tokens only (custom JWT)
  // Manager tokens come from Supabase session directly

  return {
    manager: managerData as Manager,
    token: data.session.access_token,
  };
}

/**
 * Logout (clear session)
 */
export async function logoutManager(): Promise<void> {
  // Sign out from Supabase
  await supabase.auth.signOut();
  // Also clear AsyncStorage (in case there's an employee token)
  await clearToken();
}
