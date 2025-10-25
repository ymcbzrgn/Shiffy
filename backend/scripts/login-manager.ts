import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxa2VvZW9waWp0emptcHhrZmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjQ4MTAsImV4cCI6MjA3NjkwMDgxMH0.jCQ1_UiyB73Z9pOkQu7RQ-cBTgKS91jcf1XOlOJrBZk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function loginManager() {
  console.log('\n=== MANAGER LOGIN ===\n');

  const email = 'testmanager@shiffy.com';
  const password = 'TestManager123!';

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('❌ Login failed:', error.message);
    return;
  }

  console.log('✅ Login successful!');
  console.log(`\n👤 Manager: ${data.user.email}`);
  console.log(`🆔 User ID: ${data.user.id}`);
  console.log(`⏱️  Token Expires: ${new Date(data.session.expires_at! * 1000).toLocaleString()}`);

  console.log(`\n🎟️  JWT ACCESS TOKEN:`);
  console.log('─'.repeat(120));
  console.log(data.session.access_token);
  console.log('─'.repeat(120));

  console.log('\n📋 COPY THIS FOR TESTING:\n');
  console.log(`export MANAGER_TOKEN="${data.session.access_token}"`);
  console.log('\nOR use directly in curl:');
  console.log(`curl -H "Authorization: Bearer ${data.session.access_token}" http://localhost:3000/api/schedules/generate`);
  console.log('\n');
}

loginManager().catch(console.error);
