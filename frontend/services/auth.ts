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

  // Save token for API requests
  await saveToken(data.session.access_token);

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

  // Save token
  await saveToken(data.session.access_token);

  return {
    manager: managerData as Manager,
    token: data.session.access_token,
  };
}

/**
 * Logout (clear session)
 */
export async function logoutManager(): Promise<void> {
  await supabase.auth.signOut();
  await clearToken();
}
