/**
 * Create Test Schedule
 *
 * Inserts a test schedule into the database for testing endpoints
 * when RunPod API is unavailable
 */

import { supabase } from '../config/supabase.config';

async function createTestSchedule() {
  try {
    console.log('🧪 Creating test schedule...\n');

    const testSchedule = {
      id: '22222222-2222-2222-2222-222222222222',
      manager_id: '11111111-1111-1111-1111-111111111111', // Test manager
      week_start: '2025-10-28',
      status: 'generated',
      shifts: [
        {
          employee_id: 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
          employee_name: 'Test Employee',
          day: 'Monday',
          start_time: '08:00',
          end_time: '17:00',
          hours: 9,
        },
        {
          employee_id: 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
          employee_name: 'Test Employee',
          day: 'Wednesday',
          start_time: '10:00',
          end_time: '18:00',
          hours: 8,
        },
      ],
      ai_metadata: {
        total_employees: 1,
        total_shifts: 2,
        hours_per_employee: {
          'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1': 17,
        },
        warnings: [],
      },
      generated_at: new Date().toISOString(),
    };

    // Insert test schedule (upsert to avoid conflicts)
    const { data, error } = await supabase
      .from('schedules')
      .upsert(testSchedule, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create test schedule: ${error.message}`);
    }

    console.log('✅ Test schedule created successfully!\n');
    console.log('Schedule ID:', data.id);
    console.log('Manager ID:', data.manager_id);
    console.log('Week Start:', data.week_start);
    console.log('Status:', data.status);
    console.log('Shifts:', data.shifts.length);
    console.log('\n📋 Use this ID for testing approval endpoint:');
    console.log(data.id);

  } catch (error) {
    console.error('❌ Error creating test schedule:', error);
    process.exit(1);
  }
}

createTestSchedule();
