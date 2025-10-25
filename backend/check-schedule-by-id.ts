import { supabase } from './src/config/supabase.config';

async function run() {
  const id = process.argv[2];
  if (!id) {
    console.error('Usage: ts-node check-schedule-by-id.ts <schedule-id>');
    process.exit(1);
  }

  try {
    const { data: schedule, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      process.exit(1);
    }

    if (!schedule) {
      console.log('Schedule not found');
      process.exit(0);
    }

    console.log('\nSchedule:', { id: schedule.id, week_start: schedule.week_start, status: schedule.status, total_shifts: schedule.shifts?.length });

    if (schedule.shifts && schedule.shifts.length > 0) {
      console.log('\nShifts:');
      schedule.shifts.forEach((s: any, idx: number) => {
        console.log(` ${idx + 1}. ${s.employee_name || s.employee_id} (${s.employee_id}) — ${s.day} ${s.start_time} - ${s.end_time} (${s.hours || 'N/A'}h)`);
      });
    } else {
      console.log('\nNo shifts in this schedule');
    }

    // List employees for the manager
    const { data: employees } = await supabase
      .from('employees')
      .select('id, full_name')
      .eq('manager_id', schedule.manager_id);

    console.log('\nEmployees for this manager:');
    employees?.forEach((emp: any) => {
      const assigned = schedule.shifts?.some((sh: any) => sh.employee_id === emp.id);
      console.log(` ${assigned ? '✅' : '❌'} ${emp.full_name} (${emp.id})`);
    });

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run().then(() => process.exit(0));
