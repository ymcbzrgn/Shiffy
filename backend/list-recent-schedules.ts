import { supabase } from './src/config/supabase.config';

async function run() {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('id, manager_id, week_start, status, generated_at')
      .order('generated_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Supabase error:', error);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      console.log('No schedules found');
      process.exit(0);
    }

    console.log('\nRecent schedules:');
    data.forEach((s: any, i: number) => {
      console.log(` ${i + 1}. ${s.id} | manager: ${s.manager_id} | week: ${s.week_start} | status: ${s.status} | generated: ${s.generated_at}`);
    });

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run().then(() => process.exit(0));
