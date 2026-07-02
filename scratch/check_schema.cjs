const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const content = fs.readFileSync('src/supabaseClient.ts', 'utf8');
const supabaseUrl = content.match(/SUPABASE_URL\s*=\s*['"`](.*?)['"`]/)[1];
const supabaseKey = content.match(/SUPABASE_ANON_KEY\s*=\s*['"`](.*?)['"`]/)[1];

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.log('Profile columns:', data.length > 0 ? Object.keys(data[0]) : 'No rows, but query succeeded');
  }
}
check();
