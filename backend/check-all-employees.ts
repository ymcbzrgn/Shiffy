import { supabase } from './src/config/supabase.config';

const managerId = '32ec105b-a0d0-48d5-8d96-8c7835831e4c';

async function checkAllEmployees() {
  console.log('\n🔍 Checking All Employees for Manager\n');

  try {
    // Get all employees
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('manager_id', managerId);

    if (empError || !employees) {
      console.log('❌ Error fetching employees:', empError);
      return;
    }

    console.log(`✅ Found ${employees.length} employees\n`);

    // Get all approved schedules
    const { data: schedules, error: schedError } = await supabase
      .from('schedules')
      .select('*')
      .eq('manager_id', managerId)
      .eq('status', 'approved')
      .order('week_start', { ascending: false });

    if (schedError) {
      console.log('❌ Error fetching schedules:', schedError);
      return;
    }

    console.log(`✅ Found ${schedules?.length || 0} approved schedules\n`);
    console.log('='.repeat(80));

    // Check each employee
    for (const employee of employees) {
      console.log(`\n👤 ${employee.full_name} (${employee.id})`);
      console.log('-'.repeat(80));

      let totalShifts = 0;
      const shiftsByWeek: Record<string, number> = {};

      if (schedules) {
        for (const schedule of schedules) {
          const empShifts = schedule.shifts?.filter((s: any) => s.employee_id === employee.id) || [];
          if (empShifts.length > 0) {
            shiftsByWeek[schedule.week_start] = empShifts.length;
            totalShifts += empShifts.length;
          }
        }
      }

      if (totalShifts === 0) {
        console.log('❌ NO SHIFTS in any approved schedule');
        console.log('   Problem: Employee cannot see any shifts in mobile app');
        console.log('   Solution: Manager needs to assign shifts to this employee');
      } else {
        console.log(`✅ Total Shifts: ${totalShifts}`);
        console.log('   Shifts by week:');
        Object.entries(shiftsByWeek).forEach(([week, count]) => {
          console.log(`     - ${week}: ${count} shifts`);
        });
        console.log('   Status: Employee should see these shifts in mobile app ✅');
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));

    const employeesWithShifts = employees.filter(emp => {
      let hasShifts = false;
      if (schedules) {
        for (const schedule of schedules) {
          const empShifts = schedule.shifts?.filter((s: any) => s.employee_id === emp.id) || [];
          if (empShifts.length > 0) {
            hasShifts = true;
            break;
          }
        }
      }
      return hasShifts;
    });

    const employeesWithoutShifts = employees.filter(emp => {
      let hasShifts = false;
      if (schedules) {
        for (const schedule of schedules) {
          const empShifts = schedule.shifts?.filter((s: any) => s.employee_id === emp.id) || [];
          if (empShifts.length > 0) {
            hasShifts = true;
            break;
          }
        }
      }
      return !hasShifts;
    });

    console.log(`\n✅ Employees with shifts: ${employeesWithShifts.length}/${employees.length}`);
    if (employeesWithShifts.length > 0) {
      employeesWithShifts.forEach(emp => {
        console.log(`   - ${emp.full_name}`);
      });
    }

    console.log(`\n❌ Employees WITHOUT shifts: ${employeesWithoutShifts.length}/${employees.length}`);
    if (employeesWithoutShifts.length > 0) {
      console.log('   These employees CANNOT see shifts:');
      employeesWithoutShifts.forEach(emp => {
        console.log(`   - ${emp.full_name} (${emp.id})`);
      });

      console.log('\n💡 SOLUTION:');
      console.log('   Option 1: Manager manually adds shifts to these employees');
      console.log('   Option 2: Re-run AI schedule generation (force regenerate)');
      console.log('   Option 3: These employees submit shift preferences first, then regenerate');
    }

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAllEmployees().then(() => process.exit(0));
