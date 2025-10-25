/**
 * Generate Manager JWT Token (for testing)
 *
 * Creates a JWT token for manager testing purposes
 * Uses mock manager from seed data
 */

import dotenv from 'dotenv';
import path from 'path';
import { generateToken } from '../utils/jwt.utils';

// Load environment variables from project root
dotenv.config({ path: path.join(__dirname, '../../.env.local') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('DEBUG: JWT_SECRET =', process.env.JWT_SECRET ? `${process.env.JWT_SECRET.substring(0, 20)}...` : 'NOT SET');

// Mock Manager (from seed data)
// Manager 1: Ahmet Yılmaz (Starbucks Kadıköy)
const managerId = '11111111-1111-1111-1111-111111111111';

const managerToken = generateToken({
  user_id: managerId,
  user_type: 'manager',
  manager_id: managerId,
  username: 'ahmet.yilmaz',
});

console.log('\n='.repeat(50));
console.log('🔐 MANAGER JWT TOKEN (for testing)');
console.log('='.repeat(50));
console.log('\nManager: Ahmet Yılmaz (Starbucks Kadıköy)');
console.log(`Manager ID: ${managerId}`);
console.log('\nToken:');
console.log(managerToken);
console.log('\n' + '='.repeat(50));
console.log('\nUsage:');
console.log('curl -H "Authorization: Bearer <token>" http://localhost:3000/api/manager/employees');
console.log('='.repeat(50) + '\n');
