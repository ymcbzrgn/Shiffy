import { supabase } from './src/config/supabase.config';

const managerId = '32ec105b-a0d0-48d5-8d96-8c7835831e4c';

async function run() {
  console.log('\n🔍 Checking All Schedules for Manager...\n');

  try {
    // Get all schedules for this manager
    const { data: schedules, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('manager_id', managerId)
      .order('week_start', { ascending: false });

    if (error) {
      console.error('Error:', error);
      return;
    }

    if (!schedules || schedules.length === 0) {
      console.log('No schedules found');
      return;
    }

    console.log(`Found ${schedules.length} schedule(s):\n`);

    schedules.forEach((schedule: any, idx: number) => {
      console.log(`${idx + 1}. Schedule ID: ${schedule.id}`);
      console.log(`   Week: ${schedule.week_start}`);
      console.log(`   Status: ${schedule.status}`);
      console.log(`   Generated: ${schedule.generated_at}`);
      console.log(`   Approved: ${schedule.approved_at || 'NOT APPROVED'}`);
      console.log(`   Total Shifts: ${schedule.shifts?.length || 0}`);
      
      if (schedule.shifts && schedule.shifts.length > 0) {
        const employeeShifts: Record<string, number> = {};
        schedule.shifts.forEach((s: any) => {
          employeeShifts[s.employee_name] = (employeeShifts[s.employee_name] || 0) + 1;
        });
        
        console.log('   Employee Shifts:');
        Object.entries(employeeShifts).forEach(([name, count]) => {
          console.log(`     - ${name}: ${count} shifts`);
        });
      }
      console.log('');
    });

    // Get all employees
    const { data: employees } = await supabase
      .from('employees')
      .select('id, full_name, email')
      .eq('manager_id', managerId);

    console.log(`\n👥 Total Employees: ${employees?.length || 0}\n`);

    // Check each employee's shift count across all schedules
    if (employees) {
      employees.forEach((emp: any) => {
        let totalShifts = 0;
        schedules.forEach((schedule: any) => {
          const empShifts = schedule.shifts?.filter((s: any) => s.employee_id === emp.id) || [];
          totalShifts += empShifts.length;
        });
        
        console.log(`${emp.full_name}: ${totalShifts} shifts across all schedules`);
      });
    }

  } catch (err) {
    console.error('Error:', err);
  }
}

run().then(() => process.exit(0));
