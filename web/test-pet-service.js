/**
 * Simple standalone test for PetService
 * Run with: node test-pet-service.js
 */

const { config } = require('dotenv');
const { resolve } = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
config({ path: resolve(__dirname, '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

async function testDatabase() {
  console.log('Creating Supabase client...');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('Testing database connection...');
  
  // Test 1: Can we connect and query tenants?
  const { data: tenants, error: tenantError } = await supabase
    .from('tenants')
    .select('id, name')
    .limit(5);
  
  if (tenantError) {
    console.error('❌ Tenant query failed:', tenantError);
    return;
  }
  
  console.log('✅ Tenants query successful:', tenants?.length || 0, 'tenants found');
  
  // Test 2: Can we query pets?
  const { data: pets, error: petError } = await supabase
    .from('pets')
    .select('id, name, species')
    .limit(5);
  
  if (petError) {
    console.error('❌ Pets query failed:', petError);
    return;
  }
  
  console.log('✅ Pets query successful:', pets?.length || 0, 'pets found');
  
  // Test 3: Can we create a test pet?
  const testTenantId = tenants?.[0]?.id || 'test-tenant';
  const testOwnerId = crypto.randomUUID();
  
  // First create a test user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: testOwnerId,
      tenant_id: testTenantId,
      role: 'owner',
      full_name: 'Test Owner',
      email: 'test@example.com',
    })
    .select()
    .single();
  
  if (profileError) {
    console.error('❌ Profile creation failed:', profileError);
    return;
  }
  
  console.log('✅ Test profile created');
  
  // Now create a test pet
  const { data: newPet, error: createError } = await supabase
    .from('pets')
    .insert({
      owner_id: testOwnerId,
      tenant_id: testTenantId,
      name: 'Test Pet',
      species: 'dog',
      breed: 'Test Breed',
      is_active: true,
    })
    .select()
    .single();
  
  if (createError) {
    console.error('❌ Pet creation failed:', createError);
    // Cleanup profile
    await supabase.from('profiles').delete().eq('id', testOwnerId);
    return;
  }
  
  console.log('✅ Test pet created:', newPet.id);
  
  // Test 4: Can we query the pet we just created?
  const { data: queriedPet, error: queryError } = await supabase
    .from('pets')
    .select('*')
    .eq('id', newPet.id)
    .single();
  
  if (queryError) {
    console.error('❌ Pet query failed:', queryError);
  } else {
    console.log('✅ Pet query successful:', queriedPet.name);
  }
  
  // Test 5: Can we update the pet?
  const { data: updatedPet, error: updateError } = await supabase
    .from('pets')
    .update({ weight_kg: 25 })
    .eq('id', newPet.id)
    .select()
    .single();
  
  if (updateError) {
    console.error('❌ Pet update failed:', updateError);
  } else {
    console.log('✅ Pet update successful:', updatedPet.weight_kg);
  }
  
  // Cleanup
  console.log('Cleaning up test data...');
  await supabase.from('pets').delete().eq('id', newPet.id);
  await supabase.from('profiles').delete().eq('id', testOwnerId);
  console.log('✅ Cleanup complete');
  
  console.log('\n=== ALL TESTS PASSED ===');
}

testDatabase().catch(console.error);
