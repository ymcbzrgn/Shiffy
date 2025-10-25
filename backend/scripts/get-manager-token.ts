import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import * as readline from 'readline';

// Load environment
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Using anon key for auth
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function getManagerToken() {
  console.log('\n=== MANAGER LOGIN - GET JWT TOKEN ===\n');

  const email = await question('Manager Email: ');
  const password = await question('Manager Password: ');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('\n❌ Login failed:', error.message);
    rl.close();
    return;
  }

  console.log('\n✅ Login successful!');
  console.log('\n📋 MANAGER JWT TOKEN:');
  console.log('─'.repeat(80));
  console.log(data.session?.access_token);
  console.log('─'.repeat(80));
  console.log(`\n👤 Manager: ${data.user.email}`);
  console.log(`🔑 User ID: ${data.user.id}`);
  console.log(`⏱️  Expires: ${new Date(data.session?.expires_at! * 1000).toLocaleString()}`);
  console.log('\n💡 Usage:');
  console.log(`curl -H "Authorization: Bearer ${data.session?.access_token?.substring(0, 30)}..." ...`);
  console.log('\n');

  rl.close();
}

getManagerToken().catch(console.error);
