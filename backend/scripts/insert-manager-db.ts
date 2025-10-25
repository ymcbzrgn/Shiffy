import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Service key for database operations
);

async function insertManager() {
  console.log('\n=== INSERTING MANAGER INTO DATABASE ===\n');

  const managerId = '03898803-dd32-4455-8adb-96d8e0853491';
  const email = 'testmanager@shiffy.com';

  const { error } = await supabase
    .from('managers')
    .insert({
      id: managerId,
      email,
      store_name: 'Test Store',
      deadline_day: 5,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique violation
      console.log('✅ Manager already exists in database');
    } else {
      console.error('❌ Error inserting manager:', error.message);
      return;
    }
  } else {
    console.log('✅ Manager inserted successfully!');
  }

  // Verify
  const { data: manager } = await supabase
    .from('managers')
    .select('*')
    .eq('id', managerId)
    .single();

  if (manager) {
    console.log('\n📊 Manager Record:');
    console.log(`   ID: ${manager.id}`);
    console.log(`   Email: ${manager.email}`);
    console.log(`   Store: ${manager.store_name}`);
    console.log(`   Deadline Day: ${manager.deadline_day}`);
  }

  console.log('\n✅ Setup complete! Ready to login.');
  console.log('\n');
}

insertManager().catch(console.error);
