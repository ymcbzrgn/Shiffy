/**
 * Database Migration Script - MANUAL EXECUTION ONLY
 *
 * This script provides instructions for manual SQL execution.
 * Automated migration doesn't work reliably with Supabase.
 */

import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

console.log('\n🚀 Shiffy Database Migration - MANUAL EXECUTION\n');
console.log('─'.repeat(60));
console.log('⚠️  Automated migration is not supported.');
console.log('   Please follow these steps for manual execution:\n');

console.log('📋 STEPS:\n');
console.log('1. Open Supabase SQL Editor:');
if (projectRef) {
  console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new\n`);
} else {
  console.log('   https://supabase.com/dashboard → Your Project → SQL Editor\n');
}

console.log('2. Copy SQL migration file:');
const migrationFile = path.join(__dirname, 'migrations', '001_initial_schema.sql');
console.log(`   ${migrationFile}\n`);

console.log('3. Paste into SQL Editor and click "RUN"\n');

console.log('4. Verify migration:');
console.log('   npm run verify-db\n');

console.log('─'.repeat(60));
console.log('\n💡 TIP: Migration SQL is idempotent (safe to run multiple times)\n');

// Display SQL file location
if (fs.existsSync(migrationFile)) {
  console.log('✅ Migration file found at:');
  console.log(`   ${migrationFile}\n`);
} else {
  console.error('❌ Migration file not found!');
  console.error(`   Expected: ${migrationFile}\n`);
  process.exit(1);
}
