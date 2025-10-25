/**
 * Phase 1 Foundation Test Suite
 *
 * Smoke tests for database, utilities, and repository layer
 * Run: npm run test:foundation
 */

import dotenv from 'dotenv';
import { generateToken, verifyToken } from '../utils/jwt.utils';
import { generateRandomPassword, hashPassword, comparePassword } from '../utils/password.utils';
import { supabase } from '../config/supabase.config';
import { findByUsername } from '../repositories/employee.repository';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

let passedTests = 0;
let totalTests = 0;

function testHeader(message: string) {
  console.log(`\n[${totalTests + 1}/5] ${message}`);
}

function testPass(message: string) {
  console.log(`  ✅ ${message}`);
  passedTests++;
  totalTests++;
}

function testFail(message: string, error: any) {
  console.log(`  ❌ ${message}`);
  console.log(`     Error: ${error.message || error}`);
  totalTests++;
}

async function main() {
  console.log('\n🧪 Phase 1 Foundation Test Suite');
  console.log('═'.repeat(50));

  // ============================================
  // Test 1: Environment Variables
  // ============================================
  testHeader('🔍 Environment Variables');

  try {
    if (process.env.SUPABASE_URL) {
      testPass('SUPABASE_URL loaded');
    } else {
      testFail('SUPABASE_URL missing', new Error('Not found in .env'));
    }
  } catch (error) {
    testFail('SUPABASE_URL check failed', error);
  }

  try {
    if (process.env.SUPABASE_SERVICE_KEY) {
      testPass('SUPABASE_SERVICE_KEY loaded');
    } else {
      testFail('SUPABASE_SERVICE_KEY missing', new Error('Not found in .env'));
    }
  } catch (error) {
    testFail('SUPABASE_SERVICE_KEY check failed', error);
  }

  try {
    if (process.env.JWT_SECRET) {
      testPass('JWT_SECRET loaded');
    } else {
      testFail('JWT_SECRET missing', new Error('Not found in .env'));
    }
  } catch (error) {
    testFail('JWT_SECRET check failed', error);
  }

  try {
    if (process.env.JWT_EXPIRY) {
      testPass('JWT_EXPIRY loaded');
    } else {
      testFail('JWT_EXPIRY missing', new Error('Not found in .env'));
    }
  } catch (error) {
    testFail('JWT_EXPIRY check failed', error);
  }

  // ============================================
  // Test 2: JWT Utilities
  // ============================================
  testHeader('🔐 JWT Utilities');

  try {
    const payload = {
      user_id: 'test-123',
      user_type: 'employee' as const,
      manager_id: 'manager-456',
      username: 'test.user',
    };

    const token = generateToken(payload);
    if (token && typeof token === 'string' && token.length > 0) {
      testPass('Token generation works');
    } else {
      testFail('Token generation failed', new Error('Invalid token format'));
    }

    const decoded = verifyToken(token);
    if (decoded && decoded.user_id === 'test-123' && decoded.username === 'test.user') {
      testPass('Token verification works');
    } else {
      testFail('Token verification failed', new Error('Decoded payload mismatch'));
    }

    const invalidToken = verifyToken('invalid.token.here');
    if (invalidToken === null) {
      testPass('Invalid token rejected');
    } else {
      testFail('Invalid token NOT rejected', new Error('Should return null'));
    }

    if (decoded && decoded.user_id === payload.user_id && decoded.manager_id === payload.manager_id) {
      testPass('Payload matches input');
    } else {
      testFail('Payload mismatch', new Error('Token data corrupted'));
    }
  } catch (error) {
    testFail('JWT utilities test failed', error);
  }

  // ============================================
  // Test 3: Password Utilities
  // ============================================
  testHeader('🔒 Password Utilities');

  try {
    const randomPassword = generateRandomPassword(8);
    if (randomPassword && randomPassword.length === 8 && /^[A-Za-z0-9]+$/.test(randomPassword)) {
      testPass('Random password generated');
    } else {
      testFail('Random password generation failed', new Error('Invalid format or length'));
    }
  } catch (error) {
    testFail('Random password generation failed', error);
  }

  try {
    const testPassword = 'SecurePass123';
    const hash = await hashPassword(testPassword);
    if (hash && hash.startsWith('$2b$') && hash.length > 50) {
      testPass('Password hashing works');
    } else {
      testFail('Password hashing failed', new Error('Invalid bcrypt hash'));
    }

    const isValid = await comparePassword(testPassword, hash);
    if (isValid === true) {
      testPass('Correct password validates');
    } else {
      testFail('Correct password validation failed', new Error('comparePassword returned false'));
    }

    const isInvalid = await comparePassword('WrongPassword', hash);
    if (isInvalid === false) {
      testPass('Wrong password rejects');
    } else {
      testFail('Wrong password NOT rejected', new Error('comparePassword returned true'));
    }
  } catch (error) {
    testFail('Password utilities test failed', error);
  }

  // ============================================
  // Test 4: Supabase Connection
  // ============================================
  testHeader('🗄️  Supabase Connection');

  try {
    const { count, error } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });

    if (!error) {
      testPass('Connection established');
      testPass('Employees table accessible');
      testPass(`Service role active (found ${count || 0} rows)`);
    } else {
      testFail('Supabase connection failed', error);
      testFail('Table not accessible', error);
      testFail('Service role issue', error);
    }
  } catch (error) {
    testFail('Supabase connection failed', error);
    testFail('Table not accessible', error);
    testFail('Service role issue', error);
  }

  // ============================================
  // Test 5: Employee Repository
  // ============================================
  testHeader('📦 Employee Repository');

  try {
    const result = await findByUsername('nonexistent.user');
    if (result === null) {
      testPass('findByUsername() works');
      testPass('No connection errors');
    } else {
      testFail('findByUsername() unexpected result', new Error('Should return null for nonexistent user'));
      totalTests++;
    }
  } catch (error) {
    testFail('findByUsername() failed', error);
    testFail('Connection error detected', error);
  }

  // ============================================
  // Summary
  // ============================================
  console.log('\n' + '═'.repeat(50));

  if (passedTests === totalTests) {
    console.log(`🎉 ALL TESTS PASSED! (${passedTests}/${totalTests})`);
    console.log('✅ Phase 1 Foundation is SOLID');
    console.log('✅ Ready for Phase 2: Auth Endpoints');
    console.log('');
    process.exit(0);
  } else {
    console.log(`❌ TESTS FAILED: ${passedTests}/${totalTests} passed`);
    console.log(`   Failed: ${totalTests - passedTests} tests`);
    console.log('');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\n💥 Test suite crashed:', error);
  process.exit(1);
});
