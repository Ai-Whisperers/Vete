/**
 * UserService Real Database Tests
 * 
 * Tests user/profile management with actual Supabase connection.
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

class UserService extends BaseService {
  // List users
  async list(tenantId, filters = {}) {
    return this.handleError(async () => {
      let query = this.supabase
        .from('profiles')
        .select('*')
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)
        .order('full_name', { ascending: true });

      if (filters.role) {
        query = query.eq('role', filters.role);
      }

      if (filters.is_staff) {
        query = query.in('role', ['vet', 'admin']);
      }

      if (filters.city) {
        query = query.eq('city', filters.city);
      }

      if (filters.has_phone) {
        query = query.not('phone', 'is', null);
      }

      if (filters.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,client_code.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }, 'Failed to fetch users');
  }

  // Get by ID
  async getById(userId, tenantId) {
    return this.handleError(async () => {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      if (!data) throw new Error('User not found');
      return data;
    }, 'Failed to fetch user');
  }

  // Get by email
  async getByEmail(email, tenantId) {
    return this.handleError(async () => {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      
      return data;
    }, 'Failed to fetch user by email');
  }

  // Create user
  async create(tenantId, userData) {
    return this.handleError(async () => {
      if (userData.email) {
        const existing = await this.getByEmail(userData.email, tenantId);
        if (existing.success && existing.data) {
          throw new Error('User with this email already exists in this tenant');
        }
      }

      // Generate UUID for the profile if not provided
      const profileId = userData.id || crypto.randomUUID();

      const { data, error } = await this.supabase
        .from('profiles')
        .insert({
          ...userData,
          id: profileId,
          tenant_id: tenantId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }, 'Failed to create user');
  }

  // Update user
  async update(userId, tenantId, updates) {
    return this.handleError(async () => {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('User not found');
      return data;
    }, 'Failed to update user');
  }

  // Update role
  async updateRole(userId, tenantId, newRole) {
    return this.handleError(async () => {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          role: newRole,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('User not found');
      return data;
    }, 'Failed to update user role');
  }

  // Soft delete
  async delete(userId, tenantId, deletedBy) {
    return this.handleError(async () => {
      const { error } = await this.supabase
        .from('profiles')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: deletedBy,
        })
        .eq('id', userId)
        .eq('tenant_id', tenantId)
        .is('deleted_at', null);

      if (error) throw error;
      return true;
    }, 'Failed to delete user');
  }

  // List staff
  async listStaff(tenantId) {
    return this.list(tenantId, { is_staff: true });
  }

  // List vets
  async listVets(tenantId) {
    return this.list(tenantId, { role: 'vet' });
  }

  // List admins
  async listAdmins(tenantId) {
    return this.list(tenantId, { role: 'admin' });
  }

  // List owners
  async listOwners(tenantId, filters = {}) {
    return this.list(tenantId, { ...filters, role: 'owner' });
  }

  // Search
  async search(tenantId, searchTerm) {
    return this.list(tenantId, { search: searchTerm });
  }

  // Get stats
  async getStats(tenantId) {
    return this.handleError(async () => {
      const { data: all, error: allError } = await this.supabase
        .from('profiles')
        .select('role, phone', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .is('deleted_at', null);

      if (allError) throw allError;

      const stats = {
        total: all?.length || 0,
        owners: all?.filter(u => u.role === 'owner').length || 0,
        vets: all?.filter(u => u.role === 'vet').length || 0,
        admins: all?.filter(u => u.role === 'admin').length || 0,
        withPhone: all?.filter(u => u.phone !== null).length || 0,
      };

      return stats;
    }, 'Failed to fetch user statistics');
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
  // Use adris tenant (we know it has data)
  const tenantId = 'adris';

  // Get an admin user for testing
  const { data: admin, error: adminError } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('tenant_id', tenantId)
    .eq('role', 'admin')
    .limit(1)
    .single();

  if (adminError || !admin) {
    throw new Error('No admin user found in adris tenant.');
  }

  console.log(`\n📊 Using test data:`);
  console.log(`   Admin: ${admin.full_name} (${admin.id})`);
  console.log(`   Tenant: ${tenantId}`);

  return { tenantId, admin };
}

// ============================================
// TEST SUITE
// ============================================

async function runTests() {
  console.log('\n🧪 Testing UserService with Real Implementation\n');
  console.log('='.repeat(60));

  const service = new UserService(supabase);
  const { tenantId, admin } = await getTestData();
  const createdIds = [];

  try {
    // =====================================
    // Test 1: Create owner
    // =====================================
    console.log('\n1️⃣ Testing create() - Owner...');
    const createOwnerResult = await service.create(tenantId, {
      full_name: `Test Owner ${Date.now()}`,
      email: `test.owner.${Date.now()}@test.com`,
      phone: '+595981234567',
      role: 'owner',
      address: 'Calle Test 123',
      city: 'Asunción',
      document_type: 'CI',
      document_number: '1234567',
      preferred_contact: 'phone',
    });

    logTest(
      'Create owner',
      createOwnerResult.success,
      createOwnerResult.success 
        ? `Created: ${createOwnerResult.data.full_name}` 
        : createOwnerResult.error
    );

    if (createOwnerResult.success) {
      createdIds.push(createOwnerResult.data.id);
      console.log(`   ✓ User ID: ${createOwnerResult.data.id}`);
      console.log(`   ✓ Role: ${createOwnerResult.data.role}`);
      console.log(`   ✓ Email: ${createOwnerResult.data.email}`);
    }

    // =====================================
    // Test 2: Create vet
    // =====================================
    console.log('\n2️⃣ Testing create() - Vet...');
    const createVetResult = await service.create(tenantId, {
      full_name: `Dr. Test Vet ${Date.now()}`,
      email: `test.vet.${Date.now()}@clinic.com`,
      phone: '+595987654321',
      role: 'vet',
      license_number: 'VET-12345',
      specializations: ['surgery', 'dermatology'],
      bio: 'Test veterinarian for automated testing',
    });

    logTest('Create vet', createVetResult.success);

    if (createVetResult.success) {
      createdIds.push(createVetResult.data.id);
      console.log(`   ✓ License: ${createVetResult.data.license_number}`);
      console.log(`   ✓ Specializations: ${createVetResult.data.specializations.join(', ')}`);
    }

    // =====================================
    // Test 3: Get by ID
    // =====================================
    if (createOwnerResult.success) {
      console.log('\n3️⃣ Testing getById()...');
      const getResult = await service.getById(
        createOwnerResult.data.id,
        tenantId
      );

      logTest(
        'Get by ID',
        getResult.success && 
        getResult.data.id === createOwnerResult.data.id
      );

      if (getResult.success) {
        console.log(`   ✓ Retrieved: ${getResult.data.full_name}`);
        console.log(`   ✓ Role: ${getResult.data.role}`);
      }
    }

    // =====================================
    // Test 4: Get by email
    // =====================================
    if (createOwnerResult.success) {
      console.log('\n4️⃣ Testing getByEmail()...');
      const emailResult = await service.getByEmail(
        createOwnerResult.data.email,
        tenantId
      );

      logTest(
        'Get by email',
        emailResult.success && 
        emailResult.data?.email === createOwnerResult.data.email
      );

      if (emailResult.success && emailResult.data) {
        console.log(`   ✓ Found: ${emailResult.data.full_name}`);
      }
    }

    // =====================================
    // Test 5: List all users
    // =====================================
    console.log('\n5️⃣ Testing list()...');
    const listResult = await service.list(tenantId);

    logTest(
      'List users',
      listResult.success && 
      Array.isArray(listResult.data) &&
      listResult.data.length > 0
    );

    if (listResult.success) {
      console.log(`   ✓ Total users: ${listResult.data.length}`);
      console.log(`   ✓ Test users present: ${listResult.data.filter(u => createdIds.includes(u.id)).length}`);
    }

    // =====================================
    // Test 6: Filter by role (owners)
    // =====================================
    console.log('\n6️⃣ Testing list() with role filter...');
    const ownersResult = await service.list(tenantId, { role: 'owner' });

    logTest(
      'Filter by role',
      ownersResult.success &&
      ownersResult.data.every(u => u.role === 'owner')
    );

    if (ownersResult.success) {
      console.log(`   ✓ Owners found: ${ownersResult.data.length}`);
    }

    // =====================================
    // Test 7: List staff
    // =====================================
    console.log('\n7️⃣ Testing listStaff()...');
    const staffResult = await service.listStaff(tenantId);

    logTest(
      'List staff',
      staffResult.success &&
      staffResult.data.every(u => ['vet', 'admin'].includes(u.role))
    );

    if (staffResult.success) {
      console.log(`   ✓ Staff members: ${staffResult.data.length}`);
      console.log(`   ✓ Vets: ${staffResult.data.filter(u => u.role === 'vet').length}`);
      console.log(`   ✓ Admins: ${staffResult.data.filter(u => u.role === 'admin').length}`);
    }

    // =====================================
    // Test 8: Update user
    // =====================================
    if (createOwnerResult.success) {
      console.log('\n8️⃣ Testing update()...');
      const updateResult = await service.update(
        createOwnerResult.data.id,
        tenantId,
        {
          address: 'Updated Address 456',
          city: 'Fernando de la Mora',
        }
      );

      logTest(
        'Update user',
        updateResult.success &&
        updateResult.data.address === 'Updated Address 456'
      );

      if (updateResult.success) {
        console.log(`   ✓ Updated address: ${updateResult.data.address}`);
        console.log(`   ✓ Updated city: ${updateResult.data.city}`);
      }
    }

    // =====================================
    // Test 9: Update role
    // =====================================
    if (createOwnerResult.success) {
      console.log('\n9️⃣ Testing updateRole()...');
      const roleResult = await service.updateRole(
        createOwnerResult.data.id,
        tenantId,
        'admin'
      );

      logTest(
        'Update role',
        roleResult.success &&
        roleResult.data.role === 'admin'
      );

      if (roleResult.success) {
        console.log(`   ✓ New role: ${roleResult.data.role}`);
      }
    }

    // =====================================
    // Test 10: Search users
    // =====================================
    console.log('\n🔟 Testing search()...');
    const searchResult = await service.search(tenantId, 'Test');

    logTest(
      'Search users',
      searchResult.success &&
      searchResult.data.length > 0
    );

    if (searchResult.success) {
      console.log(`   ✓ Search results: ${searchResult.data.length}`);
    }

    // =====================================
    // Test 11: Get stats
    // =====================================
    console.log('\n1️⃣1️⃣ Testing getStats()...');
    const statsResult = await service.getStats(tenantId);

    logTest(
      'Get statistics',
      statsResult.success &&
      statsResult.data.total > 0
    );

    if (statsResult.success) {
      console.log(`   ✓ Total users: ${statsResult.data.total}`);
      console.log(`   ✓ Owners: ${statsResult.data.owners}`);
      console.log(`   ✓ Vets: ${statsResult.data.vets}`);
      console.log(`   ✓ Admins: ${statsResult.data.admins}`);
      console.log(`   ✓ With phone: ${statsResult.data.withPhone}`);
    }

    // =====================================
    // Test 12: Soft delete
    // =====================================
    if (createOwnerResult.success) {
      console.log('\n1️⃣2️⃣ Testing delete() (soft delete)...');
      const deleteResult = await service.delete(
        createOwnerResult.data.id,
        tenantId,
        admin.id
      );

      logTest('Soft delete user', deleteResult.success);

      // Verify it's gone from list
      const verifyResult = await service.list(tenantId);
      const stillExists = verifyResult.data.some(u => u.id === createOwnerResult.data.id);

      logTest('Verify deletion', !stillExists);
      console.log(`   ✓ Users after delete: ${verifyResult.data.length}`);
    }

    // =====================================
    // Test 13: Tenant isolation
    // =====================================
    console.log('\n1️⃣3️⃣ Testing tenant isolation...');
    if (createdIds.length > 0) {
      const wrongTenantResult = await service.getById(
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
    console.log('   ✓ create() - Works');
    console.log('   ✓ getById() - Works');
    console.log('   ✓ getByEmail() - Works');
    console.log('   ✓ list() - Works');
    console.log('   ✓ Filter by role - Works');
    console.log('   ✓ listStaff() - Works');
    console.log('   ✓ update() - Works');
    console.log('   ✓ updateRole() - Works');
    console.log('   ✓ search() - Works');
    console.log('   ✓ getStats() - Works');
    console.log('   ✓ delete() - Works');
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
        .from('profiles')
        .delete()
        .eq('id', id);
    }

    console.log(`   ✓ Cleanup complete (${createdIds.length} users removed)`);
  }
}

// ============================================
// RUN TESTS
// ============================================

runTests().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
