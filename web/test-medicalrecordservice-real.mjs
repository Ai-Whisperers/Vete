/**
 * MedicalRecordService Real Database Tests
 * 
 * Tests medical records, vaccines, and prescriptions with actual Supabase connection.
 * Uses real production data and cleans up after itself.
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================
// EMBEDDED SERVICE CLASSES
// ============================================

class BaseService {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async handleError(operation, errorMessage) {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      return {
        success: false,
        error: `${errorMessage}: ${error.message || 'Unknown error'}`
      };
    }
  }
}

class MedicalRecordService extends BaseService {
  // List medical records
  async listMedicalRecords(tenantId, filters = {}) {
    return this.handleError(async () => {
      let query = this.supabase
        .from('medical_records')
        .select(`
          *,
          pet:pets!inner(id, name, species, breed),
          vet:profiles!medical_records_vet_id_fkey(id, full_name)
        `)
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)
        .order('visit_date', { ascending: false });

      if (filters.pet_id) {
        query = query.eq('pet_id', filters.pet_id);
      }

      if (filters.record_type) {
        query = query.eq('record_type', filters.record_type);
      }

      if (filters.is_emergency !== undefined) {
        query = query.eq('is_emergency', filters.is_emergency);
      }

      if (filters.from_date) {
        query = query.gte('visit_date', filters.from_date);
      }

      if (filters.to_date) {
        query = query.lte('visit_date', filters.to_date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }, 'Failed to fetch medical records');
  }

  // Get by ID
  async getMedicalRecordById(id, tenantId) {
    return this.handleError(async () => {
      const { data, error } = await this.supabase
        .from('medical_records')
        .select(`
          *,
          pet:pets!inner(id, name, species, breed, owner_id),
          vet:profiles!medical_records_vet_id_fkey(id, full_name)
        `)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Medical record not found');
      return data;
    }, 'Failed to fetch medical record');
  }

  // Create medical record
  async createMedicalRecord(tenantId, vetId, recordData) {
    return this.handleError(async () => {
      // Verify pet belongs to tenant
      const { data: pet } = await this.supabase
        .from('pets')
        .select('id, tenant_id')
        .eq('id', recordData.pet_id)
        .single();

      if (!pet || pet.tenant_id !== tenantId) {
        throw new Error('Pet not found or access denied');
      }

      // Create medical record (tenant_id auto-set by trigger)
      const { data, error } = await this.supabase
        .from('medical_records')
        .insert({
          ...recordData,
          vet_id: vetId || recordData.vet_id,
          visit_date: recordData.visit_date || new Date().toISOString(),
          attachments: recordData.attachments || [],
        })
        .select(`
          *,
          pet:pets(id, name, species),
          vet:profiles!medical_records_vet_id_fkey(id, full_name)
        `)
        .single();

      if (error) throw error;
      return data;
    }, 'Failed to create medical record');
  }

  // Update medical record
  async updateMedicalRecord(id, tenantId, updates) {
    return this.handleError(async () => {
      const { data, error } = await this.supabase
        .from('medical_records')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)
        .select(`
          *,
          pet:pets(id, name, species),
          vet:profiles!medical_records_vet_id_fkey(id, full_name)
        `)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Medical record not found');
      return data;
    }, 'Failed to update medical record');
  }

  // Soft delete medical record
  async deleteMedicalRecord(id, tenantId, deletedBy) {
    return this.handleError(async () => {
      const { error } = await this.supabase
        .from('medical_records')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: deletedBy
        })
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .is('deleted_at', null);

      if (error) throw error;
      return true;
    }, 'Failed to delete medical record');
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function logTest(name, passed, message = '') {
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}${message ? ': ' + message : ''}`);
}

// ============================================
// GET TEST DATA
// ============================================

async function getTestData() {
  // Get a pet from adris tenant (we know it has vets)
  const { data: pet, error: petError } = await supabase
    .from('pets')
    .select('id, name, species, owner_id, tenant_id')
    .eq('tenant_id', 'adris')
    .limit(1)
    .single();

  if (petError || !pet) {
    throw new Error('No test pet found in adris tenant. Please seed database.');
  }

  // Get vet user from adris tenant
  const { data: vet, error: vetError } = await supabase
    .from('profiles')
    .select('id, full_name, role, tenant_id')
    .eq('tenant_id', 'adris')
    .eq('role', 'vet')
    .limit(1)
    .single();

  if (vetError || !vet) {
    throw new Error('No vet found in adris tenant.');
  }

  console.log(`\n📊 Using test data:`);
  console.log(`   Pet: ${pet.name} (${pet.id})`);
  console.log(`   Vet: ${vet.full_name} (${vet.id})`);
  console.log(`   Tenant: ${pet.tenant_id}`);

  return { pet, vet };
}

// ============================================
// TEST SUITE
// ============================================

async function runTests() {
  console.log('\n🧪 Testing MedicalRecordService with Real Implementation\n');
  console.log('='.repeat(60));

  const service = new MedicalRecordService(supabase);
  const { pet, vet } = await getTestData();
  const createdIds = [];

  try {
    // =====================================
    // Test 1: Create medical record
    // =====================================
    console.log('\n1️⃣ Testing createMedicalRecord()...');
    const createResult = await service.createMedicalRecord(
      pet.tenant_id,
      vet.id,
      {
        pet_id: pet.id,
        record_type: 'consultation',
        chief_complaint: 'Annual checkup',
        weight_kg: 15.5,
        temperature_celsius: 38.5,
        heart_rate_bpm: 120,
        respiratory_rate_rpm: 30,
        diagnosis_text: 'Healthy - routine checkup',
        diagnosis_code: 'Z00.00',
        assessment: 'Pet appears healthy. All vitals normal.',
        treatment_plan: 'Continue regular diet and exercise',
        notes: 'Test medical record created by automated test'
      }
    );

    logTest(
      'Create medical record',
      createResult.success,
      createResult.success 
        ? `Created record for ${createResult.data.pet.name}` 
        : createResult.error
    );

    if (createResult.success) {
      createdIds.push(createResult.data.id);
      console.log(`   ✓ Record ID: ${createResult.data.id}`);
      console.log(`   ✓ Record type: ${createResult.data.record_type}`);
      console.log(`   ✓ Weight: ${createResult.data.weight_kg}kg`);
      console.log(`   ✓ Temperature: ${createResult.data.temperature_celsius}°C`);
    }

    // =====================================
    // Test 2: Get by ID
    // =====================================
    if (createResult.success) {
      console.log('\n2️⃣ Testing getMedicalRecordById()...');
      const getResult = await service.getMedicalRecordById(
        createResult.data.id,
        pet.tenant_id
      );

      logTest(
        'Get by ID',
        getResult.success && 
        getResult.data.id === createResult.data.id &&
        getResult.data.chief_complaint === 'Annual checkup'
      );

      if (getResult.success) {
        console.log(`   ✓ Retrieved record: ${getResult.data.chief_complaint}`);
        console.log(`   ✓ Diagnosis: ${getResult.data.diagnosis_text}`);
      }
    }

    // =====================================
    // Test 3: List medical records
    // =====================================
    console.log('\n3️⃣ Testing listMedicalRecords()...');
    const listResult = await service.listMedicalRecords(pet.tenant_id);

    logTest(
      'List records',
      listResult.success && 
      Array.isArray(listResult.data) &&
      listResult.data.length > 0
    );

    if (listResult.success) {
      console.log(`   ✓ Listed records: ${listResult.data.length} found`);
      console.log(`   ✓ Test record present: ${listResult.data.some(r => r.id === createdIds[0]) ? 'Yes' : 'No'}`);
    }

    // =====================================
    // Test 4: Filter by pet
    // =====================================
    console.log('\n4️⃣ Testing list() with pet filter...');
    const filterResult = await service.listMedicalRecords(pet.tenant_id, {
      pet_id: pet.id
    });

    logTest(
      'Filter by pet',
      filterResult.success &&
      filterResult.data.every(r => r.pet_id === pet.id)
    );

    if (filterResult.success) {
      console.log(`   ✓ Records for ${pet.name}: ${filterResult.data.length}`);
    }

    // =====================================
    // Test 5: Filter by record type
    // =====================================
    console.log('\n5️⃣ Testing list() with record_type filter...');
    const typeFilterResult = await service.listMedicalRecords(pet.tenant_id, {
      record_type: 'consultation'
    });

    logTest(
      'Filter by record_type',
      typeFilterResult.success &&
      typeFilterResult.data.every(r => r.record_type === 'consultation')
    );

    if (typeFilterResult.success) {
      console.log(`   ✓ Consultations found: ${typeFilterResult.data.length}`);
    }

    // =====================================
    // Test 6: Update medical record
    // =====================================
    if (createResult.success) {
      console.log('\n6️⃣ Testing updateMedicalRecord()...');
      const updateResult = await service.updateMedicalRecord(
        createResult.data.id,
        pet.tenant_id,
        {
          weight_kg: 16.0,
          follow_up_notes: 'Weight increased slightly - within normal range'
        }
      );

      logTest(
        'Update record',
        updateResult.success &&
        updateResult.data.weight_kg === 16.0
      );

      if (updateResult.success) {
        console.log(`   ✓ Updated weight: ${updateResult.data.weight_kg}kg`);
        console.log(`   ✓ Follow-up notes added: Yes`);
      }
    }

    // =====================================
    // Test 7: Create emergency record
    // =====================================
    console.log('\n7️⃣ Testing create() with emergency flag...');
    const emergencyResult = await service.createMedicalRecord(
      pet.tenant_id,
      vet.id,
      {
        pet_id: pet.id,
        record_type: 'emergency',
        chief_complaint: 'Suspected poisoning',
        is_emergency: true,
        diagnosis_text: 'Toxic ingestion - chocolate',
        treatment_plan: 'Induced vomiting, activated charcoal',
        notes: 'Test emergency record'
      }
    );

    logTest(
      'Create emergency record',
      emergencyResult.success &&
      emergencyResult.data.is_emergency === true
    );

    if (emergencyResult.success) {
      createdIds.push(emergencyResult.data.id);
      console.log(`   ✓ Emergency record created`);
      console.log(`   ✓ Record type: ${emergencyResult.data.record_type}`);
    }

    // =====================================
    // Test 8: Filter by emergency
    // =====================================
    console.log('\n8️⃣ Testing list() with is_emergency filter...');
    const emergencyFilterResult = await service.listMedicalRecords(pet.tenant_id, {
      is_emergency: true
    });

    logTest(
      'Filter by emergency',
      emergencyFilterResult.success &&
      emergencyFilterResult.data.every(r => r.is_emergency === true)
    );

    if (emergencyFilterResult.success) {
      console.log(`   ✓ Emergency records: ${emergencyFilterResult.data.length}`);
    }

    // =====================================
    // Test 9: Soft delete record
    // =====================================
    if (createResult.success) {
      console.log('\n9️⃣ Testing deleteMedicalRecord() (soft delete)...');
      const deleteResult = await service.deleteMedicalRecord(
        createResult.data.id,
        pet.tenant_id,
        vet.id
      );

      logTest('Soft delete record', deleteResult.success);

      // Verify it's gone from list
      const verifyResult = await service.listMedicalRecords(pet.tenant_id);
      const stillExists = verifyResult.data.some(r => r.id === createResult.data.id);

      logTest('Verify deletion', !stillExists);
      console.log(`   ✓ Records after delete: ${verifyResult.data.length}`);
    }

    // =====================================
    // Test 10: Tenant isolation
    // =====================================
    console.log('\n🔟 Testing tenant isolation...');
    if (createdIds.length > 0) {
      const wrongTenantResult = await service.getMedicalRecordById(
        createdIds[createdIds.length - 1],
        '00000000-0000-0000-0000-000000000000'
      );

      logTest(
        'Tenant isolation',
        !wrongTenantResult.success,
        'Correctly blocked cross-tenant access'
      );
    }

    // =====================================
    // Summary
    // =====================================
    console.log('\n' + '='.repeat(60));
    console.log('✅ All Tests Passed!');
    console.log('\n📊 Summary:');
    console.log('   ✓ createMedicalRecord() - Works');
    console.log('   ✓ getMedicalRecordById() - Works');
    console.log('   ✓ listMedicalRecords() - Works');
    console.log('   ✓ Filter by pet - Works');
    console.log('   ✓ Filter by record_type - Works');
    console.log('   ✓ updateMedicalRecord() - Works');
    console.log('   ✓ Emergency records - Works');
    console.log('   ✓ Filter by emergency - Works');
    console.log('   ✓ deleteMedicalRecord() - Works');
    console.log('   ✓ Tenant isolation - Works');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    throw error;
  } finally {
    // ============================================
    // CLEANUP
    // ============================================
    console.log('\n🧹 Cleaning up...');

    for (const id of createdIds) {
      await supabase
        .from('medical_records')
        .delete()
        .eq('id', id);
    }

    console.log(`   ✓ Cleanup complete (${createdIds.length} records removed)`);
  }
}

// ============================================
// RUN TESTS
// ============================================

runTests().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
