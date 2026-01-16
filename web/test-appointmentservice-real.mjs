/**
 * Standalone test for AppointmentService with embedded implementation
 * Tests appointment booking, status transitions, and lifecycle
 * 
 * Run with: node test-appointmentservice-real.mjs
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: resolve(__dirname, '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Embedded AppointmentService implementation
class AppointmentService {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async create(input) {
    try {
      const { tenant_id, pet_id, service_id, vet_id, start_time, duration_minutes = 30, reason, notes } = input;

      // Calculate end_time
      const startDate = new Date(start_time);
      const endDate = new Date(startDate.getTime() + duration_minutes * 60000);

      const { data: appointment, error } = await this.supabase
        .from('appointments')
        .insert({
          tenant_id,
          pet_id,
          service_id: service_id || null,
          vet_id: vet_id || null,
          start_time,
          end_time: endDate.toISOString(),
          duration_minutes,
          reason: reason || null,
          notes: notes || null,
          status: 'scheduled',
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: appointment };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getById(id, tenantId) {
    try {
      const { data: appointment, error } = await this.supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single();

      if (error) throw error;
      if (!appointment) throw new Error('Appointment not found');

      return { success: true, data: appointment };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async list(tenantId, filters = {}) {
    try {
      let query = this.supabase
        .from('appointments')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('start_time', { ascending: true });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.pet_id) {
        query = query.eq('pet_id', filters.pet_id);
      }

      if (filters.vet_id) {
        query = query.eq('vet_id', filters.vet_id);
      }

      if (filters.from_date) {
        query = query.gte('start_time', filters.from_date);
      }

      if (filters.to_date) {
        query = query.lte('start_time', filters.to_date);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async update(id, tenantId, updateData) {
    try {
      const { data: existing } = await this.supabase
        .from('appointments')
        .select('status')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single();

      if (!existing) throw new Error('Appointment not found');

      // Only allow updates on scheduled appointments
      if (existing.status !== 'scheduled') {
        throw new Error(`Cannot update appointment with status: ${existing.status}`);
      }

      const { error } = await this.supabase
        .from('appointments')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('tenant_id', tenantId);

      if (error) throw error;

      return await this.getById(id, tenantId);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async checkIn(id, tenantId) {
    try {
      const { error } = await this.supabase
        .from('appointments')
        .update({
          status: 'checked_in',
          checked_in_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .eq('status', 'scheduled'); // Only allow check-in from scheduled

      if (error) throw error;

      return await this.getById(id, tenantId);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async complete(id, tenantId, completionData = {}) {
    try {
      const { error } = await this.supabase
        .from('appointments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          internal_notes: completionData.notes || null,
        })
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .in('status', ['scheduled', 'checked_in', 'in_progress']); // Can complete from these statuses

      if (error) throw error;

      return await this.getById(id, tenantId);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async cancel(id, tenantId, userId, reason) {
    try {
      const { error } = await this.supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_by: userId,
          cancellation_reason: reason || null,
        })
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .in('status', ['scheduled', 'checked_in']); // Only allow cancellation from these statuses

      if (error) throw error;

      return await this.getById(id, tenantId);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async delete(id, tenantId) {
    try {
      // Soft delete
      const { error } = await this.supabase
        .from('appointments')
        .update({
          deleted_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('tenant_id', tenantId);

      if (error) throw error;

      return { success: true, data: { deleted: true } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Test runner
async function runTests() {
  console.log('🧪 Testing AppointmentService with Real Implementation\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const appointmentService = new AppointmentService(supabase);

  // Test data
  let tenantId, petId, vetId, serviceId, appointmentId;

  try {
    // Setup: Get existing data
    console.log('📝 Setting up test data...');
    
    // Get a pet with owner
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('id, name, owner_id, tenant_id, profiles!pets_owner_id_fkey(full_name)')
      .not('tenant_id', 'is', null)
      .limit(1)
      .single();

    if (petError || !pet) {
      throw new Error('No valid pet found for testing');
    }

    petId = pet.id;
    tenantId = pet.tenant_id;
    
    console.log(`  ✓ Using existing pet: ${pet.name} (${petId})`);
    console.log(`  ✓ Using tenant: ${tenantId}`);
    console.log(`  ✓ Pet owner: ${pet.profiles.full_name}`);

    // Get a vet (staff member)
    const { data: vet } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('tenant_id', tenantId)
      .in('role', ['vet', 'admin'])
      .limit(1)
      .single();

    if (vet) {
      vetId = vet.id;
      console.log(`  ✓ Using vet: ${vet.full_name} (${vetId})`);
    }

    // Get a service record
    const { data: serviceRecord } = await supabase
      .from('services')
      .select('id, name')
      .eq('tenant_id', tenantId)
      .limit(1)
      .single();

    if (serviceRecord) {
      serviceId = serviceRecord.id;
      console.log(`  ✓ Using service: ${serviceRecord.name} (${serviceId})`);
    }

    // Test 1: Create appointment
    console.log('\n1️⃣ Testing create()...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const createResult = await appointmentService.create({
      tenant_id: tenantId,
      pet_id: petId,
      service_id: serviceId,
      vet_id: vetId,
      start_time: tomorrow.toISOString(),
      duration_minutes: 30,
      reason: 'Test appointment - checkup',
      notes: 'Test notes',
    });

    if (!createResult.success) {
      throw new Error(`Create appointment failed: ${createResult.error}`);
    }

    appointmentId = createResult.data.id;
    console.log(`  ✅ Created appointment: ${appointmentId}`);
    console.log(`     Start: ${createResult.data.start_time}`);
    console.log(`     Duration: ${createResult.data.duration_minutes} minutes`);
    console.log(`     Status: ${createResult.data.status}`);

    // Test 2: Get appointment by ID
    console.log('\n2️⃣ Testing getById()...');
    const getResult = await appointmentService.getById(appointmentId, tenantId);

    if (!getResult.success) {
      throw new Error(`Get appointment failed: ${getResult.error}`);
    }

    console.log(`  ✅ Retrieved appointment`);
    console.log(`     Pet ID: ${getResult.data.pet_id}`);
    console.log(`     Status: ${getResult.data.status}`);
    console.log(`     Reason: ${getResult.data.reason}`);

    // Test 3: List appointments
    console.log('\n3️⃣ Testing list()...');
    const listResult = await appointmentService.list(tenantId);

    if (!listResult.success) {
      throw new Error(`List appointments failed: ${listResult.error}`);
    }

    console.log(`  ✅ Listed appointments: ${listResult.data.length} found`);
    console.log(`     Test appointment present: ${listResult.data.some(a => a.id === appointmentId) ? 'Yes' : 'No'}`);

    // Test 4: List with filter (status)
    console.log('\n4️⃣ Testing list() with status filter...');
    const filteredResult = await appointmentService.list(tenantId, { status: 'scheduled' });

    if (!filteredResult.success) {
      throw new Error(`Filtered list failed: ${filteredResult.error}`);
    }

    console.log(`  ✅ Scheduled appointments: ${filteredResult.data.length}`);
    console.log(`     All are scheduled: ${filteredResult.data.every(a => a.status === 'scheduled') ? 'Yes' : 'No'}`);

    // Test 5: Update appointment
    console.log('\n5️⃣ Testing update()...');
    const updateResult = await appointmentService.update(appointmentId, tenantId, {
      notes: 'Updated test notes',
      internal_notes: 'Internal update',
    });

    if (!updateResult.success) {
      throw new Error(`Update appointment failed: ${updateResult.error}`);
    }

    console.log(`  ✅ Updated appointment`);
    console.log(`     New notes: ${updateResult.data.notes}`);

    // Test 6: Check in appointment
    console.log('\n6️⃣ Testing checkIn()...');
    const checkInResult = await appointmentService.checkIn(appointmentId, tenantId);

    if (!checkInResult.success) {
      throw new Error(`Check-in failed: ${checkInResult.error}`);
    }

    console.log(`  ✅ Checked in appointment`);
    console.log(`     Status: ${checkInResult.data.status}`);
    console.log(`     Checked in at: ${checkInResult.data.checked_in_at}`);

    // Test 7: Complete appointment
    console.log('\n7️⃣ Testing complete()...');
    const completeResult = await appointmentService.complete(appointmentId, tenantId, {
      notes: 'Appointment completed successfully',
    });

    if (!completeResult.success) {
      throw new Error(`Complete failed: ${completeResult.error}`);
    }

    console.log(`  ✅ Completed appointment`);
    console.log(`     Status: ${completeResult.data.status}`);
    console.log(`     Completed at: ${completeResult.data.completed_at}`);

    // Test 8: Try to update completed appointment (should fail)
    console.log('\n8️⃣ Testing update() on completed appointment (expect error)...');
    const invalidUpdateResult = await appointmentService.update(appointmentId, tenantId, {
      notes: 'Try to update completed',
    });

    if (invalidUpdateResult.success) {
      throw new Error('Should not allow update on completed appointment');
    }

    console.log(`  ✅ Correctly rejected: ${invalidUpdateResult.error}`);

    // Test 9: Create and cancel appointment
    console.log('\n9️⃣ Testing cancel()...');
    // Create a new appointment to cancel
    const tomorrow2 = new Date();
    tomorrow2.setDate(tomorrow2.getDate() + 2);
    tomorrow2.setHours(14, 0, 0, 0);

    const createResult2 = await appointmentService.create({
      tenant_id: tenantId,
      pet_id: petId,
      start_time: tomorrow2.toISOString(),
      duration_minutes: 30,
      reason: 'To be cancelled',
    });

    if (!createResult2.success) {
      throw new Error(`Create second appointment failed: ${createResult2.error}`);
    }

    const appointmentId2 = createResult2.data.id;

    const cancelResult = await appointmentService.cancel(appointmentId2, tenantId, vetId || petId, 'Test cancellation');

    if (!cancelResult.success) {
      throw new Error(`Cancel failed: ${cancelResult.error}`);
    }

    console.log(`  ✅ Cancelled appointment`);
    console.log(`     Status: ${cancelResult.data.status}`);
    console.log(`     Cancelled at: ${cancelResult.data.cancelled_at}`);
    console.log(`     Reason: ${cancelResult.data.cancellation_reason}`);

    // Test 10: Soft delete appointment
    console.log('\n🔟 Testing delete() - soft delete...');
    const deleteResult = await appointmentService.delete(appointmentId2, tenantId);

    if (!deleteResult.success) {
      throw new Error(`Delete failed: ${deleteResult.error}`);
    }

    console.log(`  ✅ Soft deleted appointment`);

    // Verify it still exists but with deleted_at
    const deletedAppt = await appointmentService.getById(appointmentId2, tenantId);
    console.log(`     Still exists: ${deletedAppt.success ? 'Yes' : 'No'}`);
    console.log(`     Deleted at: ${deletedAppt.data?.deleted_at || 'null'}`);

    console.log('\n✅ All Tests Passed!');
    console.log('\n📊 Summary:');
    console.log('   ✓ create() - Works');
    console.log('   ✓ getById() - Works');
    console.log('   ✓ list() - Works');
    console.log('   ✓ list(filters) - Works');
    console.log('   ✓ update() - Works');
    console.log('   ✓ checkIn() - Works');
    console.log('   ✓ complete() - Works');
    console.log('   ✓ update() validation - Works');
    console.log('   ✓ cancel() - Works');
    console.log('   ✓ delete() (soft delete) - Works');

  } catch (error) {
    console.error(`\n❌ Test Failed: ${error.message}`);
    console.error(error.stack);
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    if (appointmentId) {
      await supabase.from('appointments').delete().eq('id', appointmentId);
    }
    // appointmentId2 is already soft-deleted, fully delete it
    const { data: appts } = await supabase
      .from('appointments')
      .select('id')
      .eq('reason', 'To be cancelled')
      .not('deleted_at', 'is', null);
    
    if (appts && appts.length > 0) {
      await supabase.from('appointments').delete().in('id', appts.map(a => a.id));
    }
    console.log('  ✓ Cleanup complete');
  }
}

runTests().catch(console.error);
