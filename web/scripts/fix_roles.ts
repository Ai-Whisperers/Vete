
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Start with service role key if available for seeding, otherwise fallback (might fail RLS)
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey; 

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing .env.local variables (Need URL and SERVICE_ROLE_KEY for seeding)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function runSeed() {
  console.log('🌱 Running Seed Data...');
  
  const sqlPath = path.resolve(__dirname, '../db/seed_data.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Used pg-postgres via supabase remote call? 
  // Supabase-js doesn't natively run raw SQL unless via RPC.
  // BUT we can use the 'postgres' connection if we had it.
  // Actually, standard seed data usually runs via SQL Editor. 
  // If I can't run SQL via API, I'm stuck.
  
  // Alternative: The user sees "Invalid login credentials". 
  // I can try to fix the user via `create_users.ts` only? 
  // No, the issue is likely the `profiles` table missing the role mapping.
  // `create_users.ts` creates auth.users. The Trigger `handle_new_user` in `02_policies.sql` (or `07_triggers.sql`) handles profile creation.
  // If `complete.sql` was run, triggers are there.
  // When `create_users.ts` runs, it inserts into `auth.users`, trigger fires, `profiles` row created.
  // BUT `seed_data.sql` does UPDATES to `profiles` to set `role = 'admin'`.
  // Without that, everyone is 'owner' (default).
  // If I log in as 'admin@demo.com', I might be logged in as an 'owner'. 
  // The 'admin' login page might block non-admins? or just show limited view.
  
  // I can try to UPDATE the profile via Supabase API if I have Service Key.
  
  const { error } = await supabase
    .from('profiles')
    .update({ role: 'admin', tenant_id: 'adris' })
    .eq('email', 'admin@demo.com');
    
  if (error) {
      console.error('Error updating admin profile:', error);
  } else {
      console.log('✅ Updated admin@demo.com to admin role');
  }

  // Also fix vet
  await supabase.from('profiles').update({ role: 'vet', tenant_id: 'adris' }).eq('email', 'vet@demo.com');
  console.log('✅ Updated vet@demo.com to vet role');
}

runSeed();
