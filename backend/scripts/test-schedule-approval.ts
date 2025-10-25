import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MANAGER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMDM4OTg4MDMtZGQzMi00NDU1LThhZGItOTZkOGUwODUzNDkxIiwidXNlcl90eXBlIjoibWFuYWdlciIsIm1hbmFnZXJfaWQiOiIwMzg5ODgwMy1kZDMyLTQ0NTUtOGFkYi05NmQ4ZTA4NTM0OTEiLCJ1c2VybmFtZSI6InRlc3RtYW5hZ2VyQHNoaWZmeS5jb20iLCJpYXQiOjE3NjEzNjkxMTIsImV4cCI6MTc2MTk3MzkxMn0.YoE_Z8TuS3EyBPHQRPs4PVC9sJBcOlDjaXWEAbmTSx8';
const BASE_URL = 'http://localhost:3000/api';
const SCHEDULE_ID = '7cf82c83-1de5-41dd-8f43-4252e841d21a'; // From AI generation test

async function testScheduleApproval() {
  console.log('\n=== TESTING SCHEDULE APPROVAL ===\n');
  console.log(`Schedule ID: ${SCHEDULE_ID}\n`);

  try {
    // Approve the schedule
    const response = await fetch(`${BASE_URL}/schedules/${SCHEDULE_ID}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MANAGER_TOKEN}`,
      },
    });

    const data: any = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to approve schedule!');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${data.error}`);
      return;
    }

    if (data.success) {
      console.log('✅ Schedule approved successfully!\n');
      console.log('📊 Updated Schedule:');
      console.log(`   Schedule ID: ${data.data.id}`);
      console.log(`   Week Start: ${data.data.week_start}`);
      console.log(`   Status: ${data.data.status}`);
      console.log(`   Shifts: ${data.data.shifts.length}`);
      console.log(`   Approved At: ${new Date(data.data.approved_at).toLocaleString()}`);
      console.log('');

      // Verify the schedule status changed
      if (data.data.status === 'approved') {
        console.log('✅ Status correctly changed to "approved"');
      } else {
        console.log(`⚠️  Warning: Status is "${data.data.status}", expected "approved"`);
      }

      if (data.data.approved_at) {
        console.log('✅ Approval timestamp is set');
      } else {
        console.log('⚠️  Warning: approved_at is null');
      }

      console.log('\n💡 Schedule is now visible to employees!\n');

    } else {
      console.error('❌ Approval failed:', data.error);
    }

  } catch (error: any) {
    console.error('❌ Request failed:', error.message);
  }
}

testScheduleApproval().catch(console.error);
