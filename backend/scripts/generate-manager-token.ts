import dotenv from 'dotenv';
import path from 'path';
import { generateToken } from '../src/utils/jwt.utils';

// Load environment
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function generateManagerToken() {
  console.log('\n=== GENERATING MANAGER JWT TOKEN ===\n');

  const managerId = '03898803-dd32-4455-8adb-96d8e0853491';
  const email = 'testmanager@shiffy.com';

  // Generate backend JWT token (same format as employee tokens)
  const token = generateToken({
    user_id: managerId,
    user_type: 'manager',
    manager_id: managerId, // Same as user_id for managers
    username: email,
  });

  console.log('✅ Backend JWT Token Generated!\n');
  console.log('📧 Manager:', email);
  console.log('🆔 Manager ID:', managerId);
  console.log('\n🎟️  JWT TOKEN (Backend-signed):');
  console.log('─'.repeat(120));
  console.log(token);
  console.log('─'.repeat(120));

  console.log('\n📋 COPY THIS FOR TESTING:\n');
  console.log(`export MANAGER_TOKEN="${token}"`);
  console.log('\nOR update setup-test-data-for-ai.ts with this token');
  console.log('\n✅ This token will work with /api/manager/* endpoints!\n');
}

generateManagerToken().catch(console.error);
