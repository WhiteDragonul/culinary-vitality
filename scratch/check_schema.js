const { createClient } = require('@supabase/supabase-js');
// Load credentials from supabaseClient.ts
const fs = require('fs');
const content = fs.readFileSync('src/supabaseClient.ts', 'utf8');
const supabaseUrl = content.match(/supabaseUrl\s*=\s*['"`](.*?)['"`]/)[1];
const supabaseKey = content.match(/supabaseKey\s*=\s*['"`](.*?)['"`]/)[1];

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.log('Profile columns:', Object.keys(data[0] || {}));
  }
}
check();
