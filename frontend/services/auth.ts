// Manager Authentication Service
// Mock implementation - will be replaced with Supabase calls

import { Manager } from '../types';

const USE_MOCK = true;

// Mock manager data
const MOCK_MANAGER: Manager = {
  id: 'mgr-1',
  store_name: 'Kahve Dükkanı',
  email: 'yonetici@test.com',
  created_at: '2025-01-01T00:00:00Z',
  subscription_status: 'active',
  subscription_tier: 'premium'
};

// Mock login - simulates Supabase auth
export async function loginManager(email: string, password: string): Promise<{ manager: Manager; token: string }> {
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock validation (accept yonetici@test.com / 123456)
    if (email === 'yonetici@test.com' && password === '123456') {
      return {
        manager: MOCK_MANAGER,
        token: 'mock_jwt_token_manager_' + Date.now()
      };
    }
    
    throw new Error('Email veya şifre hatalı');
  }
  
  // Real Supabase implementation will go here
  // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  throw new Error('Real auth not implemented yet');
}

// Mock register - simulates Supabase auth
export async function registerManager(
  storeName: string,
  email: string,
  password: string
): Promise<{ manager: Manager; token: string }> {
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Mock email check (reject if already exists)
    if (email === 'yonetici@test.com') {
      throw new Error('Bu email zaten kullanılıyor');
    }
    
    const newManager: Manager = {
      id: 'mgr-' + Date.now(),
      store_name: storeName,
      email: email,
      created_at: new Date().toISOString(),
      subscription_status: 'trial',
      subscription_tier: 'basic'
    };
    
    return {
      manager: newManager,
      token: 'mock_jwt_token_manager_' + Date.now()
    };
  }
  
  // Real Supabase implementation will go here
  // const { data, error } = await supabase.auth.signUp({ email, password });
  throw new Error('Real auth not implemented yet');
}

// Store auth token in AsyncStorage
export async function storeAuthToken(token: string, userType: 'manager' | 'employee'): Promise<void> {
  // TODO: Use AsyncStorage when implementing real auth
  // await AsyncStorage.setItem('shiffy_access_token', token);
  // await AsyncStorage.setItem('shiffy_user_type', userType);
  console.log('Stored token:', token, 'for', userType);
}

// Get stored token
export async function getAuthToken(): Promise<string | null> {
  // TODO: Use AsyncStorage when implementing real auth
  // return await AsyncStorage.getItem('shiffy_access_token');
  return null;
}
