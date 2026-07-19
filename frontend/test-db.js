const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Load env
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabaseUrl = envConfig.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.EXPO_PUBLIC_SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Checking customer_profiles columns...");
  
  // Try to insert a dummy record to see if it complains about 'city'
  const { data, error } = await supabase.from('customer_profiles').select('city').limit(1);
  
  if (error) {
    console.error("ERROR:", error.message);
  } else {
    console.log("SUCCESS! The city column exists and is accessible.");
  }
}

run();
