import dotenv from 'dotenv';
import path from 'path';
import { supabase } from '../config/supabase.config';

dotenv.config({ path: path.join(__dirname, '../../.env.local') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function main() {
  console.log('\n🔍 Checking shift_preferences table...\n');

  // Check if table exists and has data
  const { data, error } = await supabase
    .from('shift_preferences')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Table might not exist. You may need to create it in Supabase SQL Editor.\n');
    return;
  }

  if (data && data.length > 0) {
    console.log('✅ Table exists and has data:');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('✅ Table exists but is empty (no data yet)');
  }

  console.log('\n');
}

main();
