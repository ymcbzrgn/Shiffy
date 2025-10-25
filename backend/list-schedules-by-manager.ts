import { supabase } from './src/config/supabase.config';

const managerId = process.argv[2];

async function run() {
  if (!managerId) {
    console.error('Usage: ts-node list-schedules-by-manager.ts <manager-id>');
    process.exit(1);
  }

  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('id, week_start, status, generated_at, shifts')
      .eq('manager_id', managerId)
      .order('generated_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Supabase error:', error);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      console.log('No schedules found for manager', managerId);
      process.exit(0);
    }

    console.log('\nSchedules for manager', managerId);
    data.forEach((s: any, i: number) => {
      console.log(` ${i + 1}. ${s.id} | week: ${s.week_start} | status: ${s.status} | shifts: ${s.shifts?.length || 0}`);
    });

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run().then(() => process.exit(0));
