import { supabase } from './src/config/supabase.config';

async function checkShifts() {
  console.log('\n�� Checking Shift Assignments...\n');

  try {
    const { data: schedule } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', '22222222-2222-2222-2222-222222222222')
      .single();

    if (schedule) {
      console.log('�� Schedule:', {
        week: schedule.week_start,
        status: schedule.status,
        total_shifts: schedule.shifts?.length
      });

      console.log('\n👥 Shifts breakdown:');
      schedule.shifts?.forEach((shift: any) => {
        console.log(`  - ${shift.employee_name} (${shift.employee_id})`);
        console.log(`    ${shift.day}: ${shift.start_time} - ${shift.end_time}`);
      });

      // Get all employees for this manager
      const { data: employees } = await supabase
        .from('employees')
        .select('id, full_name, manager_id')
        .eq('manager_id', schedule.manager_id);

      console.log('\n\n📋 All employees for this manager:');
      employees?.forEach(emp => {
        const hasShift = schedule.shifts?.some((s: any) => s.employee_id === emp.id);
        console.log(`  ${hasShift ? '✅' : '❌'} ${emp.full_name} (${emp.id})`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkShifts().then(() => process.exit(0));
