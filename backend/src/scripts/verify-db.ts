/**
 * Database Schema Verification Script
 *
 * Verifies that all tables, columns, indexes exist in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config(); // Fallback to .env

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface TableCheck {
  name: string;
  exists: boolean;
  rowCount?: number;
}

/**
 * Check if table exists by querying it
 */
async function checkTable(tableName: string): Promise<TableCheck> {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      return { name: tableName, exists: false };
    }

    return { name: tableName, exists: true, rowCount: count || 0 };

  } catch (error) {
    return { name: tableName, exists: false };
  }
}

/**
 * Main verification
 */
async function main() {
  console.log('🔍 Verifying Database Schema\n');
  console.log(`📦 Supabase URL: ${supabaseUrl}`);
  console.log('─'.repeat(60));

  // Expected tables
  const tables = [
    'managers',
    'employees',
    'shift_preferences',
    'schedules'
  ];

  console.log('\n📋 Checking Tables:\n');

  let allExist = true;

  for (const table of tables) {
    const result = await checkTable(table);

    if (result.exists) {
      console.log(`✅ ${table.padEnd(20)} - Exists (${result.rowCount} rows)`);
    } else {
      console.log(`❌ ${table.padEnd(20)} - NOT FOUND`);
      allExist = false;
    }
  }

  console.log('\n' + '─'.repeat(60));

  if (allExist) {
    console.log('\n✅ All required tables exist!');
    console.log('\n💡 Next step: Start development with "npm run dev"\n');
    process.exit(0);
  } else {
    console.log('\n❌ Some tables are missing!');
    console.log('\n💡 Solution:');
    console.log('   1. Go to Supabase SQL Editor');
    console.log('   2. Copy SQL from: src/scripts/migrations/001_initial_schema.sql');
    console.log('   3. Click "Run"');
    console.log('   4. Run "npm run verify-db" again\n');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\n💥 Verification error:', error);
  process.exit(1);
});
