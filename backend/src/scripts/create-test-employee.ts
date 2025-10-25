/**
 * Create Test Employee
 *
 * Generates hash for test password and shows SQL to insert test employee
 */

import { hashPassword } from '../utils/password.utils';

async function main() {
  const testPassword = 'TestPass123';
  console.log(`\n🔐 Generating hash for password: "${testPassword}"\n`);

  const hash = await hashPassword(testPassword);

  console.log('Hash generated:');
  console.log(hash);
  console.log('\n' + '─'.repeat(60));
  console.log('\n📝 Run this SQL in Supabase SQL Editor:\n');

  console.log(`INSERT INTO employees (
  manager_id,
  username,
  full_name,
  password_hash,
  first_login,
  status
) VALUES (
  'test-manager-uuid',
  'test.user',
  'Test User',
  '${hash}',
  true,
  'active'
);`);

  console.log('\n' + '─'.repeat(60));
  console.log('\n✅ After running SQL, test with:');
  console.log('\ncurl -X POST http://localhost:3000/api/employee/login \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log(`  -d '{"username":"test.user","password":"${testPassword}"}'`);
  console.log('');
}

main();
