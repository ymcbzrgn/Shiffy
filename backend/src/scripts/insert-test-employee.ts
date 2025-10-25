/**
 * Insert Test Employee to Database
 *
 * Creates a test employee for API testing
 */

import dotenv from 'dotenv';
import { supabase } from '../config/supabase.config';

// Load env
dotenv.config({ path: '.env.local' });
dotenv.config();

async function main() {
  console.log('\n📝 Setting up test data...\n');

  const testManagerId = '00000000-0000-0000-0000-000000000001';

  // 1. Check if test manager exists, if not create one
  const { data: existingManager } = await supabase
    .from('managers')
    .select('id')
    .eq('id', testManagerId)
    .single();

  if (!existingManager) {
    console.log('Creating test manager...');
    const { error: managerError } = await supabase.from('managers').insert({
      id: testManagerId,
      email: 'test.manager@shiffy.local',
      business_name: 'Test Business',
      plan: 'free' as const,
      preferences: {},
    });

    if (managerError) {
      console.error('❌ Failed to create test manager:', managerError.message);
      process.exit(1);
    }
    console.log('✅ Test manager created');
  } else {
    console.log('✅ Test manager already exists');
  }

  // 2. Create test employee
  const testEmployee = {
    manager_id: testManagerId,
    username: 'test.user',
    full_name: 'Test User',
    password_hash: '$2b$10$7T4x6BBf8rgNRGckDUxiq.s8CT3U596t/zqcKGNlWVlb7g/ouf0ZO',
    first_login: true,
    status: 'active' as const,
  };

  // Check if already exists
  const { data: existing } = await supabase
    .from('employees')
    .select('id')
    .eq('username', 'test.user')
    .single();

  if (existing) {
    console.log('⚠️  Test employee already exists!');
    console.log('   Username: test.user');
    console.log('   Password: TestPass123');
    console.log('');
    process.exit(0);
  }

  // Insert
  const { data, error } = await supabase
    .from('employees')
    .insert(testEmployee)
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to insert test employee:', error.message);
    process.exit(1);
  }

  console.log('✅ Test employee created successfully!');
  console.log('');
  console.log('   ID:', data.id);
  console.log('   Username: test.user');
  console.log('   Password: TestPass123');
  console.log('   First Login: true');
  console.log('');
  console.log('🧪 Test with:');
  console.log('');
  console.log('curl -X POST http://localhost:3000/api/employee/login \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"username":"test.user","password":"TestPass123"}\'');
  console.log('');
}

main();
