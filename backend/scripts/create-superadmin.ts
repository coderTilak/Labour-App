import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from the backend .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

// Note: You MUST use the service role key to bypass RLS and create users directly
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSuperAdmin() {
  const email = process.argv[2] || 'admin@labourconnect.com';
  const password = process.argv[3] || 'admin123456';

  console.log(`Attempting to create super admin user with email: ${email}`);

  try {
    // 1. Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm the email
    });

    if (authError) {
      if (authError.message.includes('already has an account') || authError.message.includes('User already registered')) {
        console.log(`User ${email} already exists in auth.users. Proceeding to role assignment...`);
      } else {
        throw new Error(`Auth Error: ${authError.message}`);
      }
    } else {
      console.log(`Successfully created auth user: ${authData.user.id}`);
    }

    // Get the user ID (either newly created or existing)
    const { data: existingUser, error: getUserError } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .eq('role', 'super_admin')
      .limit(1);

    let userId = authData?.user?.id;

    if (!userId) {
      // If user existed, fetch their ID
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) throw new Error(`Could not list users: ${listError.message}`);
      
      const user = users.users.find(u => u.email === email);
      if (!user) throw new Error(`Could not find user ${email}`);
      userId = user.id;
    }

    // 2. Insert into user_roles table
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert(
        { user_id: userId, role: 'super_admin' },
        { onConflict: 'user_id' }
      );

    if (roleError) {
      throw new Error(`Role Error: ${roleError.message}`);
    }

    console.log(`Successfully assigned 'super_admin' role to user ${userId}`);
    console.log('\n--- SUCCESS ---');
    console.log(`You can now log into the superadmin dashboard with:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
  } catch (error: any) {
    console.error('Failed to create superadmin:', error.message);
    process.exit(1);
  }
}

createSuperAdmin();
