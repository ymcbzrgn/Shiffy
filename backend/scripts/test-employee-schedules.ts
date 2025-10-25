import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const BASE_URL = 'http://localhost:3000/api';
const WEEK_START = '2025-11-04';

const employees = [
  { username: 'ali.yilmaz', password: 'Employee123!' },
  { username: 'fatma.demir', password: 'Employee123!' },
  { username: 'mehmet.ozkan', password: 'Employee123!' },
];

async function testEmployeeSchedules() {
  console.log('\n=== TESTING EMPLOYEE SCHEDULE VIEW ===\n');

  for (const emp of employees) {
    console.log(`\n--- Testing ${emp.username} ---\n`);

    try {
      // Step 1: Login as employee
      console.log('Step 1: Logging in...');
      const loginRes = await fetch(`${BASE_URL}/employee/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: emp.username,
          password: emp.password,
        }),
      });

      const loginData: any = await loginRes.json();

      if (!loginData.success) {
        console.error(`❌ Login failed: ${loginData.error}`);
        continue;
      }

      const token = loginData.data.token;
      console.log(`✅ Logged in successfully`);

      // Step 2: Fetch employee's schedule
      console.log('Step 2: Fetching schedule...');
      const scheduleRes = await fetch(`${BASE_URL}/schedules/my-schedule?week=${WEEK_START}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const scheduleData: any = await scheduleRes.json();

      if (!scheduleRes.ok) {
        console.error(`❌ Failed to fetch schedule: ${scheduleData.error}`);
        continue;
      }

      if (scheduleData.success) {
        console.log('✅ Schedule fetched successfully\n');

        if (scheduleData.data && scheduleData.data.shifts) {
          console.log(`📅 Shifts for ${emp.username}:`);
          console.log(`   Total: ${scheduleData.data.shifts.length}\n`);

          for (const shift of scheduleData.data.shifts) {
            console.log(`   ${shift.day}: ${shift.start_time} - ${shift.end_time}`);
          }
        } else {
          console.log('   No shifts assigned for this week');
        }
      } else {
        console.error(`❌ Failed: ${scheduleData.error}`);
      }

    } catch (error: any) {
      console.error(`❌ Error for ${emp.username}:`, error.message);
    }

    console.log('');
  }

  console.log('\n✅ EMPLOYEE SCHEDULE VIEW TEST COMPLETE\n');
}

testEmployeeSchedules().catch(console.error);
