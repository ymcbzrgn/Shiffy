import { createClient } from '@supabase/supabase-js';

// Supabase credentials (from Supabase Dashboard → Settings → API)
const SUPABASE_URL = 'https://dqkeoeopijtzjmpxkffp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxa2VvZW9waWp0emptcHhrZmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjQ4MTAsImV4cCI6MjA3NjkwMDgxMH0.jCQ1_UiyB73Z9pOkQu7RQ-cBTgKS91jcf1XOlOJrBZk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
