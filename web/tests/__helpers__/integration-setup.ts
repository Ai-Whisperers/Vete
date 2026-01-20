/**
 * Integration Test Setup Helper
 *
 * Provides infrastructure for real database integration tests:
 * - Direct Supabase client (bypasses Next.js cookies)
 * - Test data creation helpers
 * - Cleanup coordination
 *
 * @example
 * ```typescript
 * describe('API (Integration)', () => {
 *   let supabase: SupabaseClient
 *
 *   beforeAll(async () => {
 *     supabase = await setupIntegrationTest()
 *   })
 *
 *   afterAll(async () => {
 *     await cleanupIntegrationTest()
 *   })
 *
 *   afterEach(async () => {
 *     await cleanupManager.cleanupWithRetry()
 *   })
 *
 *   it('should work with real data', async () => {
 *     const profile = await createTestProfile(supabase, 'vet', TEST_TENANT_ID)
 *     // ...
 *   })
 * })
 * ```
 */

/**
 * Environment variables are now loaded in vitest.config.ts
 * This ensures they're available before any test code runs
 */

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import { factoryMode } from '@/lib/test-utils/factories/core/mode'
import { idGenerator } from '@/lib/test-utils/factories/core/id-generator'
import { cleanupManager } from './cleanup-manager'

// Re-export cleanupManager for test files
export { cleanupManager }

// =============================================================================
// Constants
// =============================================================================

/**
 * Dedicated tenant ID for integration tests.
 * This tenant should exist in the database with necessary seed data.
 */
export const TEST_TENANT_ID = 'adris'

/**
 * Test users for different roles (must exist in Supabase Auth)
 * These are used for testing authentication and authorization
 */
export const TEST_USERS = {
  VET: {
    email: 'vet@test.local',
    password: 'test-password-123',
  },
  ADMIN: {
    email: 'admin@test.local',
    password: 'test-password-123',
  },
  OWNER: {
    email: 'owner@test.local',
    password: 'test-password-123',
  },
} as const

// =============================================================================
// Client Creation
// =============================================================================

let serviceRoleClient: SupabaseClient | null = null

/**
 * Creates a direct Supabase client for integration tests.
 * Uses service_role key to bypass RLS (for test setup/cleanup).
 *
 * @param keyType - 'service_role' (default) or 'anon'
 * @returns Supabase client
 */
export function createTestSupabaseClient(keyType: 'service_role' | 'anon' = 'service_role'): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    keyType === 'service_role'
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      `[Integration Test] Missing required environment variables:\n` +
        `  NEXT_PUBLIC_SUPABASE_URL: ${url ? 'OK' : 'MISSING'}\n` +
        `  ${keyType === 'service_role' ? 'SUPABASE_SERVICE_ROLE_KEY' : 'NEXT_PUBLIC_SUPABASE_ANON_KEY'}: ${key ? 'OK' : 'MISSING'}`
    )
  }

  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Gets the singleton service role client.
 * Creates it if it doesn't exist.
 */
export function getServiceRoleClient(): SupabaseClient {
  if (!serviceRoleClient) {
    serviceRoleClient = createTestSupabaseClient('service_role')
  }
  return serviceRoleClient
}

// =============================================================================
// Setup & Teardown
// =============================================================================

/**
 * Sets up the test environment for integration tests.
 *
 * Configures:
 * - Factory mode to 'persist' (write to database)
 * - ID generator to UUID mode (database-safe)
 * - Cleanup manager for resource tracking
 *
 * @returns Service role Supabase client for test setup
 */
export async function setupIntegrationTest(): Promise<SupabaseClient> {
  // Configure factory infrastructure
  factoryMode.configureForIntegrationTests({
    defaultTenant: TEST_TENANT_ID,
  })
  idGenerator.useUuidMode()

  // Reset cleanup tracking
  cleanupManager.reset()
  cleanupManager.setMode('test')

  // Return service role client for test setup
  return getServiceRoleClient()
}

/**
 * Cleans up after integration tests.
 *
 * - Runs cleanup with retry logic
 * - Resets factory configuration
 * - Resets ID generator
 */
export async function cleanupIntegrationTest(): Promise<void> {
  // Run cleanup with retry for FK constraints
  const result = await cleanupManager.cleanupWithRetry(3)

  if (!result.success) {
    console.warn('[Integration Test] Cleanup had failures:', result.errors)
  }

  // Reset factory infrastructure
  factoryMode.reset()
  idGenerator.reset()

  // Clear singleton
  serviceRoleClient = null
}

// =============================================================================
// Profile Helpers
// =============================================================================

export type TestRole = 'vet' | 'admin' | 'owner'

export interface TestProfileData {
  id: string
  tenant_id: string
  role: TestRole
  email: string
  full_name: string
}

/**
 * Creates a test profile in the database.
 *
 * Note: This creates only the profile row. For full auth testing,
 * the user must also exist in Supabase Auth (use createTestAuthUser).
 *
 * @param supabase - Service role client
 * @param role - User role (vet, admin, owner)
 * @param tenantId - Tenant ID (defaults to TEST_TENANT_ID)
 * @returns Created profile data
 */
export async function createTestProfile(
  supabase: SupabaseClient,
  role: TestRole,
  tenantId: string = TEST_TENANT_ID
): Promise<TestProfileData> {
  const id = idGenerator.generate('profile')
  const email = `${role}-${id}@test.local`

  const profileData = {
    id,
    tenant_id: tenantId,
    role,
    email,
    full_name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
  }

  const { data, error } = await supabase.from('profiles').insert(profileData).select().single()

  if (error) {
    throw new Error(`[Integration Test] Failed to create test profile: ${error.message}`)
  }

  // Track for cleanup
  cleanupManager.track('profiles', data.id)

  return data as TestProfileData
}

/**
 * Creates a test user in Supabase Auth and corresponding profile.
 *
 * @param supabase - Service role client
 * @param role - User role
 * @param tenantId - Tenant ID
 * @returns User ID and profile data
 */
export async function createTestAuthUser(
  supabase: SupabaseClient,
  role: TestRole,
  tenantId: string = TEST_TENANT_ID
): Promise<{ userId: string; profile: TestProfileData }> {
  const email = `${role}-${idGenerator.generate()}@test.local`
  const password = 'test-password-123'

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    throw new Error(`[Integration Test] Failed to create auth user: ${authError?.message}`)
  }

  const userId = authData.user.id

  // NOTE: The handle_new_user() trigger automatically creates a profile
  // when an auth user is created. We just need to update it with test-specific data.
  
  // Wait for trigger to execute (increased from 100ms to 500ms for reliability)
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Update the auto-created profile with test-specific data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({
      tenant_id: tenantId,
      role,
      full_name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
    })
    .eq('id', userId)
    .select()
    .single()

  if (profileError) {
    // If update failed, check if profile exists at all
    const { data: checkProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()
    
    const errorDetails = checkProfile 
      ? `Profile exists but update failed: ${profileError.message}`
      : `Profile not created by trigger: ${profileError.message}`
    
    // Cleanup auth user on profile failure
    await supabase.auth.admin.deleteUser(userId)
    throw new Error(`[Integration Test] Failed to update profile: ${errorDetails}`)
  }
  
  // Verify profile is actually in database (extra safety check)
  if (!profile || !profile.id) {
    await supabase.auth.admin.deleteUser(userId)
    throw new Error(`[Integration Test] Profile update returned no data for user ${userId}`)
  }

  // Track for cleanup (auth user deletion will cascade)
  cleanupManager.track('profiles', userId)

  return {
    userId,
    profile: profile as TestProfileData,
    email, // Return email so tests can sign in
    password, // Return password so tests can sign in
  }
}

// =============================================================================
// Test Data Helpers
// =============================================================================

/**
 * Creates a test pet in the database.
 *
 * @param supabase - Service role client
 * @param ownerId - Owner profile ID
 * @param tenantId - Tenant ID
 * @param overrides - Optional field overrides
 */
export async function createTestPet(
  supabase: SupabaseClient,
  ownerId: string,
  tenantId: string = TEST_TENANT_ID,
  overrides: Partial<{
    name: string
    species: 'dog' | 'cat' | 'bird' | 'other'
    breed: string
    birth_date: string
  }> = {}
): Promise<{ id: string; name: string; species: string }> {
  const petId = idGenerator.generate('pet')

  const petData = {
    id: petId,
    owner_id: ownerId,
    tenant_id: tenantId,
    name: `Test Pet ${petId.slice(-4)}`,
    species: 'dog',
    breed: 'Mixed',
    birth_date: '2020-01-01',
    ...overrides,
  }

  const { data, error } = await supabase.from('pets').insert(petData).select().single()

  if (error) {
    throw new Error(`[Integration Test] Failed to create test pet: ${error.message}`)
  }

  cleanupManager.track('pets', data.id)
  return data
}

/**
 * Creates a test product in the store.
 *
 * Note: stock_quantity is stored in store_inventory, not store_products.
 * If stock_quantity is provided, a separate inventory record is created.
 *
 * @param supabase - Service role client
 * @param tenantId - Tenant ID
 * @param overrides - Optional field overrides
 */
export async function createTestProduct(
  supabase: SupabaseClient,
  tenantId: string = TEST_TENANT_ID,
  overrides: Partial<{
    name: string
    sku: string
    base_price: number
    is_active: boolean
    stock_quantity: number
    reorder_point: number
  }> = {}
): Promise<{ id: string; name: string; sku: string }> {
  const productId = idGenerator.generate('product')
  const sku = overrides.sku || `TEST-${productId.slice(-8).toUpperCase()}`

  // Separate stock_quantity and reorder_point from product data
  const { stock_quantity, reorder_point, ...productOverrides } = overrides

  const productData = {
    id: productId,
    tenant_id: tenantId,
    name: `Test Product ${productId.slice(-4)}`,
    sku,
    base_price: 1000, // 10.00 in cents
    is_active: true,
    ...productOverrides,
  }

  const { data, error } = await supabase.from('store_products').insert(productData).select().single()

  if (error) {
    throw new Error(`[Integration Test] Failed to create test product: ${error.message}`)
  }

  cleanupManager.track('store_products', data.id)

  // Create inventory record if stock_quantity provided
  if (stock_quantity !== undefined) {
    const inventoryId = idGenerator.generate('inventory')
    const { error: invError } = await supabase.from('store_inventory').insert({
      id: inventoryId,
      product_id: data.id,
      tenant_id: tenantId,
      stock_quantity: stock_quantity,
      reorder_point: reorder_point ?? 10,
    })

    if (invError) {
      throw new Error(`[Integration Test] Failed to create inventory record: ${invError.message}`)
    }

    cleanupManager.track('store_inventory', inventoryId)
  }

  return data
}

/**
 * Creates a test supplier.
 *
 * @param supabase - Service role client
 * @param tenantId - Tenant ID
 * @param overrides - Optional field overrides
 */
export async function createTestSupplier(
  supabase: SupabaseClient,
  tenantId: string = TEST_TENANT_ID,
  overrides: Partial<{
    name: string
    contact_email: string
    payment_terms: string
    delivery_time_days: number
  }> = {}
): Promise<{ id: string; name: string }> {
  const supplierId = idGenerator.generate('supplier')

  const supplierData = {
    id: supplierId,
    tenant_id: tenantId,
    name: `Test Supplier ${supplierId.slice(-4)}`,
    contact_email: `supplier-${supplierId}@test.local`,
    payment_terms: 'net30',
    delivery_time_days: 7,
    is_active: true,
    ...overrides,
  }

  const { data, error } = await supabase.from('suppliers').insert(supplierData).select().single()

  if (error) {
    throw new Error(`[Integration Test] Failed to create test supplier: ${error.message}`)
  }

  cleanupManager.track('suppliers', data.id)
  return data
}

/**
 * Creates a test lab test catalog entry.
 *
 * @param supabase - Service role client
 * @param tenantId - Tenant ID
 * @param overrides - Optional field overrides
 */
export async function createTestLabTest(
  supabase: SupabaseClient,
  tenantId: string = TEST_TENANT_ID,
  overrides: Partial<{
    name: string
    code: string
    category: string
    sample_type: string
    reference_ranges: Record<string, { min?: number; max?: number; unit?: string }>
    is_active: boolean
  }> = {}
): Promise<{ id: string; name: string; code: string }> {
  const testId = idGenerator.generate('lab-test')
  const code = overrides.code || `TEST-${testId.slice(-4).toUpperCase()}`

  const testData = {
    id: testId,
    tenant_id: tenantId,
    name: `Test Lab Test ${testId.slice(-4)}`,
    code,
    category: 'Hematology',
    sample_type: 'blood',
    is_active: true,
    ...overrides,
  }

  const { data, error } = await supabase.from('lab_test_catalog').insert(testData).select().single()

  if (error) {
    throw new Error(`[Integration Test] Failed to create test lab test: ${error.message}`)
  }

  cleanupManager.track('lab_test_catalog', data.id)
  return data
}

/**
 * Creates a test lab order.
 *
 * @param supabase - Service role client
 * @param petId - Pet ID
 * @param orderedBy - Vet profile ID who ordered the test
 * @param tenantId - Tenant ID
 * @param overrides - Optional field overrides
 */
export async function createTestLabOrder(
  supabase: SupabaseClient,
  petId: string,
  orderedBy: string,
  tenantId: string = TEST_TENANT_ID,
  overrides: Partial<{
    order_number: string
    status: 'pending' | 'collected' | 'processing' | 'completed' | 'reviewed' | 'cancelled'
    priority: 'stat' | 'urgent' | 'routine'
    lab_type: 'in_house' | 'reference_lab'
    has_critical_values: boolean
    specimen_quality: string
    clinical_notes: string
  }> = {}
): Promise<{ id: string; order_number: string; status: string }> {
  const orderId = idGenerator.generate('lab-order')
  const orderNumber = overrides.order_number || `LAB-TEST-${orderId.slice(-6).toUpperCase()}`

  const orderData = {
    id: orderId,
    tenant_id: tenantId,
    pet_id: petId,
    ordered_by: orderedBy,
    order_number: orderNumber,
    status: 'pending',
    priority: 'routine',
    lab_type: 'in_house',
    ...overrides,
  }

  const { data, error } = await supabase.from('lab_orders').insert(orderData).select().single()

  if (error) {
    throw new Error(`[Integration Test] Failed to create lab order: ${error.message}`)
  }

  cleanupManager.track('lab_orders', data.id)
  return data
}

/**
 * Creates a test lab order item.
 *
 * @param supabase - Service role client
 * @param labOrderId - Lab order ID
 * @param testId - Lab test catalog ID
 * @param tenantId - Tenant ID
 * @param overrides - Optional field overrides
 */
export async function createTestLabOrderItem(
  supabase: SupabaseClient,
  labOrderId: string,
  testId: string,
  tenantId: string = TEST_TENANT_ID,
  overrides: Partial<{
    status: 'pending' | 'processing' | 'completed' | 'cancelled'
    price: number
  }> = {}
): Promise<{ id: string; lab_order_id: string; test_id: string }> {
  const itemId = idGenerator.generate('lab-order-item')

  const itemData = {
    id: itemId,
    lab_order_id: labOrderId,
    tenant_id: tenantId,
    test_id: testId,
    status: 'pending',
    ...overrides,
  }

  const { data, error } = await supabase.from('lab_order_items').insert(itemData).select().single()

  if (error) {
    throw new Error(`[Integration Test] Failed to create lab order item: ${error.message}`)
  }

  cleanupManager.track('lab_order_items', data.id)
  return data
}

/**
 * Creates a test staff profile with schedule.
 *
 * @param supabase - Service role client
 * @param profileId - Profile ID to link
 * @param tenantId - Tenant ID
 */
export async function createTestStaffProfile(
  supabase: SupabaseClient,
  profileId: string,
  tenantId: string = TEST_TENANT_ID,
  overrides: Record<string, unknown> = {}
): Promise<{ id: string; profile_id: string }> {
  const staffId = idGenerator.generate('staff')

  // Only use core required fields to avoid schema cache issues
  const staffData = {
    id: staffId,
    profile_id: profileId,
    tenant_id: tenantId,
    ...overrides,
  }

  const { data, error } = await supabase.from('staff_profiles').insert(staffData).select().single()

  if (error) {
    throw new Error(`[Integration Test] Failed to create staff profile: ${error.message}`)
  }

  cleanupManager.track('staff_profiles', data.id)
  return data
}

/**
 * Creates a test purchase order.
 *
 * @param supabase - Service role client
 * @param supplierId - Supplier ID
 * @param createdBy - Profile ID who created the order
 * @param tenantId - Tenant ID
 * @param overrides - Optional field overrides
 */
export async function createTestPurchaseOrder(
  supabase: SupabaseClient,
  supplierId: string,
  createdBy: string,
  tenantId: string = TEST_TENANT_ID,
  overrides: Partial<{
    order_number: string
    status: 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'received' | 'cancelled'
    expected_delivery_date: string
    shipping_address: string
    notes: string
  }> = {}
): Promise<{ id: string; order_number: string; status: string }> {
  const orderId = idGenerator.generate('purchase-order')
  const orderNumber = overrides.order_number || `PO-TEST-${orderId.slice(-6).toUpperCase()}`

  const orderData = {
    id: orderId,
    tenant_id: tenantId,
    supplier_id: supplierId,
    order_number: orderNumber,
    status: 'draft',
    created_by: createdBy,
    ...overrides,
  }

  const { data, error } = await supabase.from('purchase_orders').insert(orderData).select().single()

  if (error) {
    throw new Error(`[Integration Test] Failed to create purchase order: ${error.message}`)
  }

  cleanupManager.track('purchase_orders', data.id)
  return data
}

/**
 * Creates a test purchase order item.
 *
 * @param supabase - Service role client
 * @param purchaseOrderId - Purchase order ID
 * @param productId - Store product ID
 * @param overrides - Optional field overrides
 */
export async function createTestPurchaseOrderItem(
  supabase: SupabaseClient,
  purchaseOrderId: string,
  productId: string,
  overrides: Partial<{
    quantity: number
    unit_cost: number
    received_quantity: number
    notes: string
  }> = {}
): Promise<{ id: string; purchase_order_id: string; catalog_product_id: string }> {
  const itemId = idGenerator.generate('po-item')

  const itemData = {
    id: itemId,
    purchase_order_id: purchaseOrderId,
    catalog_product_id: productId,
    quantity: 10,
    unit_cost: 100.0,
    ...overrides,
  }

  const { data, error } = await supabase.from('purchase_order_items').insert(itemData).select().single()

  if (error) {
    throw new Error(`[Integration Test] Failed to create purchase order item: ${error.message}`)
  }

  cleanupManager.track('purchase_order_items', data.id)
  return data
}

// =============================================================================
// Request Helpers
// =============================================================================

/**
 * Gets an authentication token for a test user.
 * 
 * Creates a new anon client, signs in with the user's credentials,
 * and returns the access token.
 *
 * @param email - User email
 * @param password - User password (default: 'test-password-123')
 * @returns Access token for Authorization header
 */
export async function getAuthToken(
  email: string,
  password: string = 'test-password-123'
): Promise<string> {
  // Create anon client for sign-in (service_role can't sign in)
  const anonClient = createTestSupabaseClient('anon')

  const { data, error } = await anonClient.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.session) {
    throw new Error(`[Integration Test] Failed to get auth token for ${email}: ${error?.message || 'No session'}`)
  }

  return data.session.access_token
}

/**
 * Convenience helper: Get auth token from createTestAuthUser result.
 * 
 * Usage:
 * ```typescript
 * const adminUser = await createTestAuthUser(supabase, 'admin')
 * const token = await getAuthTokenFromUser(adminUser)
 * ```
 * 
 * @param user - Result from createTestAuthUser
 * @returns Access token for Authorization header
 */
export async function getAuthTokenFromUser(user: {
  email: string
  password: string
}): Promise<string> {
  return getAuthToken(user.email, user.password)
}

/**
 * Creates a NextRequest for testing API routes.
 *
 * @param url - Request URL
 * @param options - Fetch options
 */
export function createTestRequest(
  url: string,
  options: {
    method?: string
    body?: unknown
    headers?: Record<string, string>
    authToken?: string
  } = {}
): Request {
  const { method = 'GET', body, headers = {}, authToken } = options

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  // Add Authorization header if authToken provided
  if (authToken) {
    requestHeaders['Authorization'] = `Bearer ${authToken}`
  }

  const requestInit: RequestInit = {
    method,
    headers: requestHeaders,
  }

  if (body) {
    requestInit.body = JSON.stringify(body)
  }

  return new Request(url, requestInit)
}

// =============================================================================
// Assertion Helpers
// =============================================================================

/**
 * Asserts that a response has the expected status and returns the parsed body.
 */
export async function expectResponse<T = unknown>(
  response: Response,
  expectedStatus: number
): Promise<T> {
  if (response.status !== expectedStatus) {
    const body = await response.text()
    throw new Error(
      `Expected status ${expectedStatus}, got ${response.status}. Body: ${body}`
    )
  }
  return response.json() as Promise<T>
}

/**
 * Asserts that a response is a success (2xx).
 */
export async function expectSuccess<T = unknown>(response: Response): Promise<T> {
  if (response.status < 200 || response.status >= 300) {
    const body = await response.text()
    throw new Error(`Expected success status, got ${response.status}. Body: ${body}`)
  }
  return response.json() as Promise<T>
}

/**
 * Asserts that a response is an error with specific status.
 */
export async function expectError(
  response: Response,
  expectedStatus: number,
  expectedMessage?: string
): Promise<void> {
  if (response.status !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus}, got ${response.status}`)
  }

  if (expectedMessage) {
    const body = await response.json()
    if (!body.message?.includes(expectedMessage) && !body.error?.includes(expectedMessage)) {
      throw new Error(
        `Expected message to include "${expectedMessage}", got: ${JSON.stringify(body)}`
      )
    }
  }
}
