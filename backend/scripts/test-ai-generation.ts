import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MANAGER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMDM4OTg4MDMtZGQzMi00NDU1LThhZGItOTZkOGUwODUzNDkxIiwidXNlcl90eXBlIjoibWFuYWdlciIsIm1hbmFnZXJfaWQiOiIwMzg5ODgwMy1kZDMyLTQ0NTUtOGFkYi05NmQ4ZTA4NTM0OTEiLCJ1c2VybmFtZSI6InRlc3RtYW5hZ2VyQHNoaWZmeS5jb20iLCJpYXQiOjE3NjEzNjkxMTIsImV4cCI6MTc2MTk3MzkxMn0.YoE_Z8TuS3EyBPHQRPs4PVC9sJBcOlDjaXWEAbmTSx8';
const BASE_URL = 'http://localhost:3000/api';

async function testAIGeneration() {
  console.log('\n=== TESTING AI SCHEDULE GENERATION ===\n');

  const weekStart = '2025-11-04';

  console.log(`📅 Generating schedule for week: ${weekStart}\n`);

  try {
    const response = await fetch(`${BASE_URL}/schedules/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MANAGER_TOKEN}`,
      },
      body: JSON.stringify({ week_start: weekStart }),
    });

    const data: any = await response.json();

    if (!response.ok) {
      console.error('❌ AI Generation Failed!');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${data.error}`);
      return;
    }

    if (data.success) {
      console.log('✅ AI Schedule Generated Successfully!\n');
      console.log('📊 Schedule Details:');
      console.log(`   Schedule ID: ${data.data.id}`);
      console.log(`   Week Start: ${data.data.week_start}`);
      console.log(`   Status: ${data.data.status}`);
      console.log(`   Total Shifts: ${data.data.shifts.length}`);
      console.log(`\n📋 Generated Shifts:`);

      // Group shifts by employee
      const shiftsByEmployee: any = {};
      for (const shift of data.data.shifts) {
        if (!shiftsByEmployee[shift.employee_id]) {
          shiftsByEmployee[shift.employee_id] = [];
        }
        shiftsByEmployee[shift.employee_id].push(shift);
      }

      for (const [employeeId, shifts] of Object.entries(shiftsByEmployee)) {
        const empShifts = shifts as any[];
        console.log(`\n   Employee ${employeeId.substring(0, 8)}...:`);
        for (const shift of empShifts) {
          console.log(`     - ${shift.day} ${shift.time_slot}: ${shift.start_time}-${shift.end_time}`);
        }
      }

      console.log(`\n💡 Next: Test schedule approval with:`);
      console.log(`   Schedule ID: ${data.data.id}`);
      console.log('\n');
    } else {
      console.error('❌ Generation failed:', data.error);
    }

  } catch (error: any) {
    console.error('❌ Request failed:', error.message);
  }
}

testAIGeneration().catch(console.error);
