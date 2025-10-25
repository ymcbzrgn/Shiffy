import { supabase } from './src/config/supabase.config';

const scheduleId = 'd52fad2d-714f-4e50-9e21-4969c752bb54';

async function run() {
  console.log('\n✅ Approving Schedule...\n');

  try {
    const { data, error } = await supabase
      .from('schedules')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', scheduleId)
      .select()
      .single();

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('✅ Schedule Approved Successfully!');
    console.log('\nSchedule Details:');
    console.log(`  ID: ${data.id}`);
    console.log(`  Week: ${data.week_start}`);
    console.log(`  Status: ${data.status}`);
    console.log(`  Approved At: ${data.approved_at}`);
    console.log(`  Total Shifts: ${data.shifts?.length || 0}`);

    if (data.shifts && data.shifts.length > 0) {
      console.log('\nEmployee Shifts:');
      const employeeShifts: Record<string, number> = {};
      data.shifts.forEach((s: any) => {
        employeeShifts[s.employee_name] = (employeeShifts[s.employee_name] || 0) + 1;
      });
      
      Object.entries(employeeShifts).forEach(([name, count]) => {
        console.log(`  - ${name}: ${count} shifts`);
      });
    }

    console.log('\n✅ Employees can now see their shifts in the mobile app!');

  } catch (err) {
    console.error('Error:', err);
  }
}

run().then(() => process.exit(0));
