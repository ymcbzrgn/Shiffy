import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Admin privileges
);

async function confirmEmail() {
  console.log('\n=== CONFIRMING MANAGER EMAIL ===\n');

  const userId = '03898803-dd32-4455-8adb-96d8e0853491';

  // Use admin API to update user
  const { data, error } = await supabase.auth.admin.updateUserById(
    userId,
    { email_confirm: true }
  );

  if (error) {
    console.error('❌ Failed to confirm email:', error.message);
    return;
  }

  console.log('✅ Email confirmed successfully!');
  console.log(`📧 User: ${data.user.email}`);
  console.log(`✅ Email Confirmed At: ${data.user.email_confirmed_at}`);
  console.log('\n🎉 Manager is now ready to login!\n');
}

confirmEmail().catch(console.error);
