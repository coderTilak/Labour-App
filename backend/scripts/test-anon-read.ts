import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
// Use the publishable key (anon key) to test public access
const supabaseAnonKey = 'sb_publishable_yFc0Zi-WwKMh7WRFnBm_aA_XUYyEcvc';

if (!supabaseUrl) {
  console.error('Error: SUPABASE_URL must be set');
  process.exit(1);
}

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

async function testAnon() {
  console.log('Testing public anon read on company_profiles...');
  const { data, error } = await supabaseAnon.from('company_profiles').select('id, company_name');
  if (error) {
    console.error('FAILED to read company_profiles:', error.message);
  } else {
    console.log('SUCCESS! Read company_profiles count:', data?.length, data);
  }

  console.log('Testing public anon read on provider_services...');
  const { data: ps, error: psError } = await supabaseAnon.from('provider_services').select('*');
  if (psError) {
    console.error('FAILED to read provider_services:', psError.message);
  } else {
    console.log('SUCCESS! Read provider_services count:', ps?.length, ps);
  }
}

testAnon();
