import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: env vars missing');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('Attempting to add whatsapp_no column via RPC exec_sql...');
  const { data, error } = await supabaseAdmin.rpc('exec_sql', {
    sql: 'ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS whatsapp_no TEXT;'
  });

  if (error) {
    console.log('RPC exec_sql failed or doesn\'t exist. Details:', error.message);
    console.log('Please execute the ALTER TABLE command manually in the Supabase SQL editor.');
  } else {
    console.log('RPC exec_sql succeeded! whatsapp_no column check passed.');
  }
}

run();
