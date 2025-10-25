import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function updateMockManagerPassword() {
  console.log('\n=== UPDATING MOCK MANAGER PASSWORD ===\n');

  const managerId = '11111111-1111-1111-1111-111111111111';
  const email = 'ahmet.yilmaz@starbucks.com';
  const newPassword = 'StarbucksTest123!';

  // Update password using admin API
  const { error } = await supabase.auth.admin.updateUserById(
    managerId,
    {
      password: newPassword,
      email_confirm: true
    }
  );

  if (error) {
    console.error('❌ Failed to update password:', error.message);
    return;
  }

  console.log('✅ Mock manager password updated!');
  console.log(`\n📧 Email: ${email}`);
  console.log(`🔐 New Password: ${newPassword}`);
  console.log(`🆔 Manager ID: ${managerId}`);
  console.log(`\n🏪 Store: Starbucks Kadıköy`);
  console.log(`👥 Employees: 3 (with preferences for week 2025-10-27)`);
  console.log('\n✅ Ready to test AI generation!\n');
}

updateMockManagerPassword().catch(console.error);
