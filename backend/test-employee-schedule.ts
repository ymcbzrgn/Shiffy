import { supabase } from './src/config/supabase.config';

async function testEmployeeSchedule() {
  console.log('\n🔍 Testing Employee Schedule Display...\n');

  try {
    // 1. Get all employees
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id, full_name, manager_id')
      .limit(3);

    if (empError) throw empError;
    console.log('📋 Employees:', employees);

    if (employees && employees.length > 0) {
      const employee = employees[0];
      console.log(`\n✅ Testing with employee: ${employee.full_name} (${employee.id})`);

      // 2. Get all schedules for this employee's manager
      const { data: schedules, error: schedError } = await supabase
        .from('schedules')
        .select('*')
        .eq('manager_id', employee.manager_id)
        .order('week_start', { ascending: false });

      if (schedError) throw schedError;
      console.log(`\n📅 All schedules for manager ${employee.manager_id}:`, schedules?.map(s => ({
        id: s.id,
        week: s.week_start,
        status: s.status,
        shifts: s.shifts?.length
      })));

      if (schedules && schedules.length > 0) {
        const schedule = schedules[0];
        console.log(`\n🎯 Latest schedule:`, {
          id: schedule.id,
          week_start: schedule.week_start,
          status: schedule.status,
          shifts_count: schedule.shifts?.length || 0
        });

        // 3. Check if employee has shifts in this schedule
        const employeeShifts = schedule.shifts?.filter((s: any) => s.employee_id === employee.id) || [];
        console.log(`\n👤 Employee's shifts in this schedule (${employeeShifts.length} shifts):`, employeeShifts);

        // 4. Test the exact query used by getMySchedule
        const { data: approvedSchedule, error: approvedError } = await supabase
          .from('schedules')
          .select('*')
          .eq('manager_id', employee.manager_id)
          .eq('week_start', schedule.week_start)
          .eq('status', 'approved')
          .single();

        if (approvedError && approvedError.code !== 'PGRST116') {
          console.log('\n❌ Error fetching approved schedule:', approvedError);
        } else if (approvedSchedule) {
          console.log('\n✅ APPROVED schedule found!', {
            id: approvedSchedule.id,
            status: approvedSchedule.status,
            employee_shifts: approvedSchedule.shifts?.filter((s: any) => s.employee_id === employee.id).length
          });
        } else {
          console.log('\n⚠️  NO APPROVED SCHEDULE FOUND!');
          console.log('   📊 Schedule status is:', schedule.status);
          console.log('   💡 Solution: Manager needs to APPROVE the schedule first!');
          console.log('   🔧 Schedule ID:', schedule.id);
        }
      } else {
        console.log('\n⚠️  No schedules found for this manager');
      }
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

testEmployeeSchedule().then(() => process.exit(0));
