const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const content = fs.readFileSync('src/supabaseClient.ts', 'utf8');
const supabaseUrl = content.match(/SUPABASE_URL\s*=\s*['"`](.*?)['"`]/)[1];
const supabaseKey = content.match(/SUPABASE_ANON_KEY\s*=\s*['"`](.*?)['"`]/)[1];

const supabase = createClient(supabaseUrl, supabaseKey);

async function alterTable() {
  // Let's try to run a SQL command using rpc if available, or just check what happens
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cooked_count INTEGER DEFAULT 0;' });
    if (error) {
      console.log('RPC exec_sql error (expected if not defined):', error.message);
    } else {
      console.log('Successfully altered table via RPC exec_sql!', data);
      return;
    }
  } catch (e) {
    console.log('RPC catch:', e.message);
  }

  // Let's try to update a profile to see if we can write arbitrary fields or if it errors
  const { data, error } = await supabase.from('profiles').update({ cooked_count: 5 }).eq('id', 'non-existent-id');
  console.log('Update cooked_count result:', error ? error.message : 'no error');
}
alterTable();
