import { supabase } from './src/config/supabase.config';

const employeeId = process.argv[2] || '8f87c2e1-2be5-48a5-b4eb-0db71b6804fd'; // Bartın Taha
const weekStart = process.argv[3] || '2025-10-20';

async function run() {
  console.log('\n🔍 Debugging Employee Schedule...\n');
  console.log(`Employee ID: ${employeeId}`);
  console.log(`Week Start: ${weekStart}\n`);

  try {
    // 1. Get employee info
    const { data: employee } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    if (!employee) {
      console.log('❌ Employee not found!');
      return;
    }

    console.log('👤 Employee:', {
      name: employee.full_name,
      email: employee.email,
      manager_id: employee.manager_id,
      max_weekly_hours: employee.max_weekly_hours
    });

    // 2. Check shift preferences
    const { data: preferences } = await supabase
      .from('shift_preferences')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('week_start', weekStart)
      .single();

    console.log('\n📋 Shift Preferences:', preferences ? {
      week: preferences.week_start,
      status: preferences.status,
      slots: preferences.slots?.length || 0
    } : 'No preferences found');

    // 3. Get manager's schedule for that week
    const { data: schedule } = await supabase
      .from('schedules')
      .select('*')
      .eq('manager_id', employee.manager_id)
      .eq('week_start', weekStart)
      .single();

    if (!schedule) {
      console.log('\n❌ No schedule found for this manager and week');
      return;
    }

    console.log('\n📅 Schedule:', {
      id: schedule.id,
      week: schedule.week_start,
      status: schedule.status,
      total_shifts: schedule.shifts?.length || 0,
      generated_at: schedule.generated_at,
      approved_at: schedule.approved_at
    });

    // 4. Filter employee's shifts
    const myShifts = schedule.shifts?.filter((s: any) => s.employee_id === employeeId) || [];

    console.log(`\n🎯 Employee's Shifts in This Schedule: ${myShifts.length}`);
    if (myShifts.length > 0) {
      myShifts.forEach((shift: any, idx: number) => {
        console.log(`  ${idx + 1}. ${shift.day} ${shift.start_time}-${shift.end_time} (${shift.hours || 'N/A'}h)`);
      });
    } else {
      console.log('  ❌ No shifts assigned to this employee!');
    }

    // 5. Show all shifts in schedule
    console.log('\n📊 All Shifts in Schedule:');
    const employeeShiftCounts: Record<string, number> = {};
    schedule.shifts?.forEach((s: any) => {
      employeeShiftCounts[s.employee_name] = (employeeShiftCounts[s.employee_name] || 0) + 1;
    });

    Object.entries(employeeShiftCounts).forEach(([name, count]) => {
      console.log(`  - ${name}: ${count} shifts`);
    });

    // 6. Simulate API call result
    console.log('\n🔌 What API Would Return:');
    if (schedule.status !== 'approved') {
      console.log(`  ❌ NULL - Schedule not approved (status: ${schedule.status})`);
    } else if (myShifts.length === 0) {
      console.log('  ✅ Schedule approved BUT employee has 0 shifts → Returns empty array');
    } else {
      console.log(`  ✅ Returns ${myShifts.length} shifts`);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

run().then(() => process.exit(0));
