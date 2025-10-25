import { supabase } from './src/config/supabase.config';

const employeeId = '8f87c2e1-2be5-48a5-b4eb-0db71b6804fd'; // Bartın Taha

async function testEmployeeAPI() {
  console.log('\n🔍 Testing Employee API Calls...\n');
  console.log(`Employee: Bartın Taha (${employeeId})\n`);

  const weeksToTest = ['2025-10-20', '2025-10-27'];

  for (const weekStart of weeksToTest) {
    console.log(`\n📅 Testing week: ${weekStart}`);
    console.log('─'.repeat(50));

    try {
      // Step 1: Get employee's manager
      const { data: employee } = await supabase
        .from('employees')
        .select('manager_id')
        .eq('id', employeeId)
        .single();

      if (!employee) {
        console.log('❌ Employee not found');
        continue;
      }

      console.log(`✅ Manager ID: ${employee.manager_id}`);

      // Step 2: Get approved schedule for that manager and week
      const { data: schedule, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('manager_id', employee.manager_id)
        .eq('week_start', weekStart)
        .eq('status', 'approved')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log(`❌ Error: ${error.message}`);
        continue;
      }

      if (!schedule) {
        console.log('❌ No approved schedule found');
        continue;
      }

      console.log(`✅ Schedule found: ${schedule.id}`);
      console.log(`   Status: ${schedule.status}`);
      console.log(`   Total shifts: ${schedule.shifts?.length || 0}`);

      // Step 3: Filter employee's shifts
      const myShifts = schedule.shifts?.filter(
        (shift: any) => shift.employee_id === employeeId
      ) || [];

      console.log(`✅ Employee's shifts: ${myShifts.length}`);

      if (myShifts.length > 0) {
        console.log('\n   Shifts:');
        myShifts.forEach((shift: any, idx: number) => {
          console.log(`     ${idx + 1}. ${shift.day} ${shift.start_time}-${shift.end_time}`);
        });
      }

      // Step 4: This is what API would return
      console.log('\n📤 API Response:');
      console.log(JSON.stringify({
        week_start: schedule.week_start,
        shifts: myShifts,
        status: schedule.status
      }, null, 2));

    } catch (err) {
      console.error('❌ Error:', err);
    }
  }
}

testEmployeeAPI().then(() => process.exit(0));
