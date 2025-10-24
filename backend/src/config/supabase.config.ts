import { createClient } from '@supabase/supabase-js';
import { config } from './env.config';

export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Test connection on initialization
void supabase
  .from('managers')
  .select('count')
  .limit(1)
  .then(({ error }) => {
    if (error) {
      console.warn('⚠️  Supabase connection test failed:', error.message);
      console.warn('   Note: This is expected if tables are not yet created');
    } else {
      console.log('✅ Supabase connection successful');
    }
  });
