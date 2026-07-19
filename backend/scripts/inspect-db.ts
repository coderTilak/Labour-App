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

async function inspect() {
  console.log('Fetching first company profile to see columns...');
  const { data: companies, error: compErr } = await supabaseAdmin.from('company_profiles').select('*').limit(1);
  if (compErr) {
    console.error('Company error:', compErr);
  } else {
    console.log('Company columns:', companies.length > 0 ? Object.keys(companies[0]) : 'No records found');
  }

  console.log('Fetching first subscription to see columns...');
  const { data: subs, error: subErr } = await supabaseAdmin.from('subscriptions').select('*').limit(1);
  if (subErr) {
    console.error('Subscriptions error:', subErr);
  } else {
    console.log('Subscription columns:', subs.length > 0 ? Object.keys(subs[0]) : 'No records found');
  }
}

inspect();
