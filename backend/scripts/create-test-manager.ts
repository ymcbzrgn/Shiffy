import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxa2VvZW9waWp0emptcHhrZmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjQ4MTAsImV4cCI6MjA3NjkwMDgxMH0.jCQ1_UiyB73Z9pOkQu7RQ-cBTgKS91jcf1XOlOJrBZk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestManager() {
  console.log('\n=== CREATING REAL TEST MANAGER ===\n');

  const email = 'testmanager@shiffy.com';
  const password = 'TestManager123!';

  // Create manager via Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'manager',
      },
    },
  });

  if (error) {
    console.error('❌ Failed to create manager:', error.message);
    return;
  }

  console.log('✅ Manager created successfully!');
  console.log(`\n📧 Email: ${email}`);
  console.log(`🔐 Password: ${password}`);
  console.log(`🆔 ID: ${data.user?.id}`);

  if (data.session) {
    console.log('\n🎟️  JWT TOKEN:');
    console.log('─'.repeat(80));
    console.log(data.session.access_token);
    console.log('─'.repeat(80));
  }

  console.log('\n📝 Next Steps:');
  console.log('1. Insert manager into managers table:');
  console.log(`   INSERT INTO managers (id, email, store_name, deadline_day)`);
  console.log(`   VALUES ('${data.user?.id}', '${email}', 'Test Store', 5);`);
  console.log('\n2. Create employees for this manager via /api/manager/employees');
  console.log('\n');
}

createTestManager().catch(console.error);
