import dotenv from 'dotenv';
import { supabase } from '../config/supabase.config';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function main() {
  const { data, error } = await supabase
    .from('managers')
    .select('id, email, store_name')
    .limit(1);

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log('\n✅ Found manager:');
    console.log(JSON.stringify(data[0], null, 2));
    console.log('\nUse this manager_id for test employee:');
    console.log(data[0].id);
  } else {
    console.log('\n⚠️  No managers found in database');
    console.log('You need to sign up a manager via Supabase Auth first.');
  }
}

main();
