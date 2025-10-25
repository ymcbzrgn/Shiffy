import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MANAGER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMDM4OTg4MDMtZGQzMi00NDU1LThhZGItOTZkOGUwODUzNDkxIiwidXNlcl90eXBlIjoibWFuYWdlciIsIm1hbmFnZXJfaWQiOiIwMzg5ODgwMy1kZDMyLTQ0NTUtOGFkYi05NmQ4ZTA4NTM0OTEiLCJ1c2VybmFtZSI6InRlc3RtYW5hZ2VyQHNoaWZmeS5jb20iLCJpYXQiOjE3NjEzNjkxMTIsImV4cCI6MTc2MTk3MzkxMn0.YoE_Z8TuS3EyBPHQRPs4PVC9sJBcOlDjaXWEAbmTSx8';

const BASE_URL = 'http://localhost:3000/api';

interface Employee {
  employee_id: string;
  username: string;
  temp_password: string;
  jwt_token?: string;
}

async function setupTestData() {
  console.log('\n=== SETTING UP TEST DATA FOR AI TESTING ===\n');

  // Step 1: Create 3 employees
  console.log('📝 Step 1: Creating employees...\n');

  const employees: Employee[] = [];

  const employeeData = [
    { full_name: 'Ali Yılmaz', username: 'ali.yilmaz' },
    { full_name: 'Fatma Demir', username: 'fatma.demir' },
    { full_name: 'Mehmet Özkan', username: 'mehmet.ozkan' },
  ];

  for (const emp of employeeData) {
    const res = await fetch(`${BASE_URL}/manager/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MANAGER_TOKEN}`,
      },
      body: JSON.stringify(emp),
    });

    const data: any = await res.json();

    if (data.success) {
      employees.push(data.data);
      console.log(`✅ Created: ${emp.full_name} (@${emp.username})`);
      console.log(`   Temp Password: ${data.data.temp_password}`);
    } else {
      console.error(`❌ Failed to create ${emp.full_name}:`, data.error);
    }
  }

  // Step 2: Login each employee and change password
  console.log('\n📝 Step 2: Logging in employees and changing passwords...\n');

  for (const emp of employees) {
    // Login
    const loginRes = await fetch(`${BASE_URL}/employee/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: emp.username,
        password: emp.temp_password,
      }),
    });

    const loginData: any = await loginRes.json();

    if (loginData.success) {
      emp.jwt_token = loginData.data.token;
      console.log(`✅ Logged in: ${emp.username}`);

      // Change password
      const changePwRes = await fetch(`${BASE_URL}/employee/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${emp.jwt_token}`,
        },
        body: JSON.stringify({
          old_password: emp.temp_password,
          new_password: 'Employee123!',
        }),
      });

      const changePwData: any = await changePwRes.json();

      if (changePwData.success) {
        console.log(`✅ Password changed for ${emp.username}`);
      }
    }
  }

  // Step 3: Submit shift preferences for week 2025-11-04
  console.log('\n📝 Step 3: Submitting shift preferences for week 2025-11-04...\n');

  const weekStart = '2025-11-04'; // Next week Monday

  const preferences = [
    // Ali - Prefers mornings
    {
      employeeUsername: 'ali.yilmaz',
      slots: [
        { day: 'Monday', time: 'morning', status: 'available' },
        { day: 'Monday', time: 'afternoon', status: 'unavailable' },
        { day: 'Tuesday', time: 'morning', status: 'available' },
        { day: 'Wednesday', time: 'morning', status: 'available' },
        { day: 'Thursday', time: 'morning', status: 'available' },
        { day: 'Friday', time: 'morning', status: 'unavailable' },
        { day: 'Saturday', time: 'afternoon', status: 'available' },
        { day: 'Sunday', time: 'morning', status: 'unavailable' },
      ]
    },
    // Fatma - Flexible
    {
      employeeUsername: 'fatma.demir',
      slots: [
        { day: 'Monday', time: 'afternoon', status: 'available' },
        { day: 'Tuesday', time: 'afternoon', status: 'available' },
        { day: 'Wednesday', time: 'afternoon', status: 'available' },
        { day: 'Thursday', time: 'afternoon', status: 'available' },
        { day: 'Friday', time: 'afternoon', status: 'available' },
        { day: 'Saturday', time: 'morning', status: 'unavailable' },
        { day: 'Sunday', time: 'afternoon', status: 'available' },
      ]
    },
    // Mehmet - Prefers evenings
    {
      employeeUsername: 'mehmet.ozkan',
      slots: [
        { day: 'Monday', time: 'evening', status: 'available' },
        { day: 'Tuesday', time: 'evening', status: 'available' },
        { day: 'Wednesday', time: 'evening', status: 'available' },
        { day: 'Thursday', time: 'evening', status: 'unavailable' },
        { day: 'Friday', time: 'evening', status: 'available' },
        { day: 'Saturday', time: 'evening', status: 'available' },
        { day: 'Sunday', time: 'evening', status: 'available' },
      ]
    },
  ];

  for (const pref of preferences) {
    const emp = employees.find(e => e.username === pref.employeeUsername);
    if (!emp || !emp.jwt_token) continue;

    const res = await fetch(`${BASE_URL}/shifts/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${emp.jwt_token}`,
      },
      body: JSON.stringify({
        week_start: weekStart,
        slots: pref.slots,
      }),
    });

    const data: any = await res.json();

    if (data.success) {
      console.log(`✅ Preferences submitted for ${emp.username}`);
    } else {
      console.error(`❌ Failed to submit preferences for ${emp.username}:`, data.error);
    }
  }

  console.log('\n✅ TEST DATA SETUP COMPLETE!\n');
  console.log('📊 Summary:');
  console.log(`   - 3 employees created`);
  console.log(`   - All employees logged in and passwords changed`);
  console.log(`   - Shift preferences submitted for week ${weekStart}`);
  console.log('\n🚀 Ready to test AI schedule generation!');
  console.log(`\n💡 Test command:`);
  console.log(`curl -X POST http://localhost:3000/api/schedules/generate \\`);
  console.log(`  -H "Authorization: Bearer ${MANAGER_TOKEN.substring(0, 50)}..." \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"week_start": "${weekStart}"}'`);
  console.log('\n');
}

setupTestData().catch(console.error);
