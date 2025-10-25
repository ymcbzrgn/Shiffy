import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MANAGER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMDM4OTg4MDMtZGQzMi00NDU1LThhZGItOTZkOGUwODUzNDkxIiwidXNlcl90eXBlIjoibWFuYWdlciIsIm1hbmFnZXJfaWQiOiIwMzg5ODgwMy1kZDMyLTQ0NTUtOGFkYi05NmQ4ZTA4NTM0OTEiLCJ1c2VybmFtZSI6InRlc3RtYW5hZ2VyQHNoaWZmeS5jb20iLCJpYXQiOjE3NjEzNjkxMTIsImV4cCI6MTc2MTk3MzkxMn0.YoE_Z8TuS3EyBPHQRPs4PVC9sJBcOlDjaXWEAbmTSx8';
const BASE_URL = 'http://localhost:3000/api';

async function testManagerSchedules() {
  console.log('\n=== TESTING MANAGER SCHEDULE VIEW ===\n');

  const weekStart = '2025-11-04'; // Week we generated schedule for
  console.log(`Fetching schedules for week: ${weekStart}\n`);

  try {
    const response = await fetch(`${BASE_URL}/schedules?week=${weekStart}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MANAGER_TOKEN}`,
      },
    });

    const data: any = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to fetch schedules!');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${data.error}`);
      return;
    }

    if (data.success) {
      console.log('✅ Manager can view schedules!\n');

      // Handle both single object and array responses
      const schedules = Array.isArray(data.data) ? data.data : [data.data];
      console.log(`📊 Total Schedules: ${schedules.length}\n`);

      for (const schedule of schedules) {
        console.log(`Schedule ID: ${schedule.id}`);
        console.log(`  Week Start: ${schedule.week_start}`);
        console.log(`  Status: ${schedule.status}`);
        console.log(`  Shifts: ${schedule.shifts.length}`);
        console.log(`  Created: ${new Date(schedule.created_at).toLocaleString()}`);
        if (schedule.approved_at) {
          console.log(`  Approved: ${new Date(schedule.approved_at).toLocaleString()}`);
        }
        console.log('');
      }

      // Find the latest generated schedule
      const generatedSchedule = schedules.find((s: any) => s.status === 'generated');
      if (generatedSchedule) {
        console.log(`💡 Found generated schedule ready for approval:`);
        console.log(`   Schedule ID: ${generatedSchedule.id}`);
        console.log(`   Use this for approval test\n`);
      }

    } else {
      console.error('❌ Request failed:', data.error);
    }

  } catch (error: any) {
    console.error('❌ Request failed:', error.message);
  }
}

testManagerSchedules().catch(console.error);
