import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function checkMockData() {
  console.log('\n=== CHECKING MOCK DATA IN SUPABASE ===\n');

  // Check managers (Supabase Auth users)
  const { data: managers, error: managerError } = await supabase.auth.admin.listUsers();

  if (managerError) {
    console.error('❌ Error fetching managers:', managerError);
  } else {
    console.log(`📊 MANAGERS (${managers.users.length}):`);
    managers.users.forEach((user, idx) => {
      console.log(`  ${idx + 1}. ${user.email} (ID: ${user.id})`);
    });
  }

  // Check employees
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('id, manager_id, full_name, username, first_login');

  if (empError) {
    console.error('\n❌ Error fetching employees:', empError);
  } else {
    console.log(`\n👥 EMPLOYEES (${employees?.length || 0}):`);
    employees?.forEach((emp, idx) => {
      console.log(`  ${idx + 1}. ${emp.full_name} (@${emp.username}) - Manager: ${emp.manager_id.substring(0, 8)}...`);
    });
  }

  // Check shift preferences
  const { data: preferences, error: prefError } = await supabase
    .from('shift_preferences')
    .select('id, employee_id, week_start, submitted_at');

  if (prefError) {
    console.error('\n❌ Error fetching preferences:', prefError);
  } else {
    console.log(`\n📅 SHIFT PREFERENCES (${preferences?.length || 0}):`);
    preferences?.forEach((pref, idx) => {
      console.log(`  ${idx + 1}. Employee ${pref.employee_id.substring(0, 8)}... - Week: ${pref.week_start}`);
    });
  }

  // Check schedules
  const { data: schedules, error: schedError } = await supabase
    .from('schedules')
    .select('id, manager_id, week_start, status');

  if (schedError) {
    console.error('\n❌ Error fetching schedules:', schedError);
  } else {
    console.log(`\n📆 SCHEDULES (${schedules?.length || 0}):`);
    schedules?.forEach((sched, idx) => {
      console.log(`  ${idx + 1}. Week ${sched.week_start} - Status: ${sched.status}`);
    });
  }

  console.log('\n=== MOCK DATA CHECK COMPLETE ===\n');
}

checkMockData().catch(console.error);
