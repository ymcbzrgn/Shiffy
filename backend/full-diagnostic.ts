import { supabase } from './src/config/supabase.config';

const employeeId = '8f87c2e1-2be5-48a5-b4eb-0db71b6804fd'; // Bartın Taha

async function fullDiagnostic() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 COMPLETE SHIFT DIAGNOSTIC - START TO END');
  console.log('='.repeat(80) + '\n');

  try {
    // ==========================================
    // STEP 1: CHECK EMPLOYEE
    // ==========================================
    console.log('📌 STEP 1: Employee Verification');
    console.log('-'.repeat(80));
    
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    if (empError || !employee) {
      console.log('❌ Employee not found:', empError);
      return;
    }

    console.log('✅ Employee Found:');
    console.log(`   ID: ${employee.id}`);
    console.log(`   Name: ${employee.full_name}`);
    console.log(`   Email: ${employee.email || 'N/A'}`);
    console.log(`   Manager ID: ${employee.manager_id}`);
    console.log(`   Max Weekly Hours: ${employee.max_weekly_hours}`);
    console.log(`   Job: ${employee.job_description}`);

    // ==========================================
    // STEP 2: CHECK ALL SCHEDULES FOR THIS MANAGER
    // ==========================================
    console.log('\n📌 STEP 2: All Schedules for Manager');
    console.log('-'.repeat(80));

    const { data: schedules, error: schedError } = await supabase
      .from('schedules')
      .select('*')
      .eq('manager_id', employee.manager_id)
      .order('week_start', { ascending: false });

    if (schedError) {
      console.log('❌ Error fetching schedules:', schedError);
      return;
    }

    if (!schedules || schedules.length === 0) {
      console.log('❌ No schedules found for this manager');
      return;
    }

    console.log(`✅ Found ${schedules.length} schedule(s):\n`);

    schedules.forEach((schedule: any, idx: number) => {
      console.log(`   ${idx + 1}. Schedule ID: ${schedule.id}`);
      console.log(`      Week Start: ${schedule.week_start}`);
      console.log(`      Status: ${schedule.status} ${schedule.status === 'approved' ? '✅' : '⚠️'}`);
      console.log(`      Generated: ${schedule.generated_at}`);
      console.log(`      Approved: ${schedule.approved_at || 'NOT APPROVED'}`);
      console.log(`      Total Shifts: ${schedule.shifts?.length || 0}`);

      if (schedule.shifts && schedule.shifts.length > 0) {
        const empShifts = schedule.shifts.filter((s: any) => s.employee_id === employeeId);
        console.log(`      This Employee's Shifts: ${empShifts.length}`);
        
        if (empShifts.length > 0) {
          empShifts.forEach((s: any, i: number) => {
            console.log(`        ${i + 1}. ${s.day} ${s.start_time}-${s.end_time}`);
          });
        }
      }
      console.log('');
    });

    // ==========================================
    // STEP 3: SIMULATE API CALL FOR EACH WEEK
    // ==========================================
    console.log('📌 STEP 3: Simulate API Calls (getMySchedule)');
    console.log('-'.repeat(80));

    const weeksToTest = schedules.map((s: any) => s.week_start);

    for (const weekStart of weeksToTest) {
      console.log(`\n🔍 Testing week: ${weekStart}`);
      console.log('   ' + '-'.repeat(70));

      // This is what the API does
      const { data: schedule, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('manager_id', employee.manager_id)
        .eq('week_start', weekStart)
        .eq('status', 'approved')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log(`   ❌ Database Error: ${error.message}`);
        continue;
      }

      if (!schedule) {
        console.log('   ❌ No APPROVED schedule found (API returns NULL)');
        console.log('   Reason: Schedule exists but status != "approved"');
        continue;
      }

      console.log(`   ✅ Schedule Found: ${schedule.id}`);
      console.log(`   Status: ${schedule.status}`);

      // Filter employee's shifts
      const myShifts = schedule.shifts?.filter(
        (shift: any) => shift.employee_id === employeeId
      ) || [];

      console.log(`   Employee's Shifts: ${myShifts.length}`);

      if (myShifts.length > 0) {
        console.log('   API Response:');
        console.log(JSON.stringify({
          week_start: schedule.week_start,
          shifts: myShifts.map((s: any) => ({
            day: s.day,
            start_time: s.start_time,
            end_time: s.end_time,
            employee_name: s.employee_name
          })),
          status: schedule.status
        }, null, 6));
      } else {
        console.log('   ⚠️  API Response: Empty shifts array (employee has no shifts)');
      }
    }

    // ==========================================
    // STEP 4: CHECK SHIFT PREFERENCES
    // ==========================================
    console.log('\n📌 STEP 4: Shift Preferences');
    console.log('-'.repeat(80));

    const { data: preferences, error: prefError } = await supabase
      .from('shift_preferences')
      .select('*')
      .eq('employee_id', employeeId)
      .order('week_start', { ascending: false })
      .limit(5);

    if (prefError) {
      console.log('❌ Error fetching preferences:', prefError);
    } else if (!preferences || preferences.length === 0) {
      console.log('⚠️  No shift preferences found for this employee');
    } else {
      console.log(`✅ Found ${preferences.length} preference(s):\n`);
      preferences.forEach((pref: any, idx: number) => {
        console.log(`   ${idx + 1}. Week: ${pref.week_start}`);
        console.log(`      Status: ${pref.status || 'N/A'}`);
        console.log(`      Submitted: ${pref.submitted_at || 'NOT SUBMITTED'}`);
        console.log(`      Slots: ${pref.slots?.length || 0}`);
        console.log('');
      });
    }

    // ==========================================
    // STEP 5: FRONTEND SIMULATION
    // ==========================================
    console.log('📌 STEP 5: Frontend Behavior Simulation');
    console.log('-'.repeat(80));

    // Calculate weeks frontend would load (4 past + current + 3 future)
    const today = new Date('2025-10-26');
    const getWeekStart = (date: Date): Date => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const formatDateISO = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const currentWeekStart = getWeekStart(today);
    const frontendWeeks: string[] = [];

    for (let i = -4; i <= 3; i++) {
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(currentWeekStart.getDate() + i * 7);
      frontendWeeks.push(formatDateISO(weekStart));
    }

    console.log('Frontend would load these weeks:');
    frontendWeeks.forEach((week, idx) => {
      console.log(`   ${idx + 1}. ${week}`);
    });

    console.log('\nFrontend API calls and expected results:');
    let totalShiftsLoaded = 0;

    for (const week of frontendWeeks) {
      const schedule = schedules.find((s: any) => s.week_start === week && s.status === 'approved');
      
      if (schedule) {
        const empShifts = schedule.shifts?.filter((s: any) => s.employee_id === employeeId) || [];
        console.log(`   ${week}: ${empShifts.length} shifts ✅`);
        totalShiftsLoaded += empShifts.length;
      } else {
        console.log(`   ${week}: 0 shifts (no approved schedule)`);
      }
    }

    console.log(`\n📊 Total shifts employee should see: ${totalShiftsLoaded}`);

    // ==========================================
    // STEP 6: SUMMARY & DIAGNOSIS
    // ==========================================
    console.log('\n' + '='.repeat(80));
    console.log('📋 DIAGNOSTIC SUMMARY');
    console.log('='.repeat(80));

    const approvedSchedules = schedules.filter((s: any) => s.status === 'approved');
    const totalShiftsInApproved = approvedSchedules.reduce((sum: number, s: any) => {
      const empShifts = s.shifts?.filter((shift: any) => shift.employee_id === employeeId) || [];
      return sum + empShifts.length;
    }, 0);

    console.log(`\n✅ Employee: ${employee.full_name}`);
    console.log(`✅ Total Schedules: ${schedules.length}`);
    console.log(`✅ Approved Schedules: ${approvedSchedules.length}`);
    console.log(`✅ Total Shifts (in approved schedules): ${totalShiftsInApproved}`);

    if (totalShiftsInApproved === 0) {
      console.log('\n⚠️  PROBLEM IDENTIFIED:');
      console.log('   - Employee has 0 shifts in approved schedules');
      console.log('   - This is why mobile app shows empty');
      console.log('\n💡 SOLUTIONS:');
      console.log('   1. Manager should assign shifts to this employee');
      console.log('   2. Re-run AI schedule generation');
      console.log('   3. Manually add shifts in manager panel');
    } else {
      console.log('\n✅ NO PROBLEM:');
      console.log(`   - Employee has ${totalShiftsInApproved} shifts`);
      console.log('   - These should appear in mobile app');
      console.log('\n💡 If shifts not showing:');
      console.log('   1. Check frontend is calling correct API endpoint');
      console.log('   2. Verify employee auth token is valid');
      console.log('   3. Clear app cache and restart');
      console.log('   4. Check console logs in mobile app');
    }

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('❌ Diagnostic Error:', error);
  }
}

fullDiagnostic().then(() => process.exit(0));
