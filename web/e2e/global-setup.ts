/**
 * E2E Global Setup
 *
 * Creates test data before all E2E tests run using the factory infrastructure.
 * This ensures tests have real data in the database without mocks.
 *
 * Data created:
 * - Test owner with authenticated profile
 * - Multiple pets with varied health profiles
 * - Vaccine records (completed, scheduled, overdue)
 * - Store products with inventory
 * - Loyalty points
 * - Test services for booking
 *
 * @see web/lib/test-utils/factories/ for factory implementations
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { chromium, FullConfig } from '@playwright/test'
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import * as fs from 'fs'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

// =============================================================================
// Constants
// =============================================================================

export const E2E_TEST_TENANT = 'adris'

export const E2E_TEST_OWNER = {
  email: 'e2e-owner@test.local',
  password: 'E2ETestPassword123!',
  fullName: 'E2E Test Owner',
}

// Store created IDs for cleanup
export interface E2ETestData {
  ownerId: string
  ownerProfileId: string
  pets: Array<{ id: string; name: string; species: string }>
  vaccines: string[]
  products: Array<{ id: string; name: string; sku: string }>
  services: Array<{ id: string; name: string }>
  loyaltyPoints: number
  appointments: string[]
  invoices: string[]
  conversations: string[]
}

// =============================================================================
// Supabase Client
// =============================================================================

function createServiceRoleClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      `[E2E Setup] Missing required environment variables:\n` +
        `  NEXT_PUBLIC_SUPABASE_URL: ${url ? 'OK' : 'MISSING'}\n` +
        `  SUPABASE_SERVICE_ROLE_KEY: ${key ? 'OK' : 'MISSING'}`
    )
  }

  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// =============================================================================
// Data Creation Functions
// =============================================================================

/**
 * Creates or reuses test owner with profile
 */
async function setupTestOwner(supabase: SupabaseClient): Promise<{ userId: string; profileId: string }> {
  console.log('[E2E Setup] Setting up test owner...')

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existingUser = existingUsers?.users?.find((u) => u.email === E2E_TEST_OWNER.email)

  let userId: string

  if (existingUser) {
    console.log('[E2E Setup] Reusing existing test owner')
    userId = existingUser.id
  } else {
    // Create new auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: E2E_TEST_OWNER.email,
      password: E2E_TEST_OWNER.password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      throw new Error(`[E2E Setup] Failed to create auth user: ${authError?.message}`)
    }

    userId = authData.user.id
    console.log('[E2E Setup] Created new test owner auth user')
  }

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (!existingProfile) {
    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      tenant_id: E2E_TEST_TENANT,
      role: 'owner',
      email: E2E_TEST_OWNER.email,
      full_name: E2E_TEST_OWNER.fullName,
      phone: '+595981123456',
    })

    if (profileError) {
      throw new Error(`[E2E Setup] Failed to create profile: ${profileError.message}`)
    }
    console.log('[E2E Setup] Created owner profile')
  }

  return { userId, profileId: userId }
}

/**
 * Creates test pets with varied health profiles
 */
async function setupTestPets(
  supabase: SupabaseClient,
  ownerId: string
): Promise<E2ETestData['pets']> {
  console.log('[E2E Setup] Setting up test pets...')

  const petsToCreate = [
    {
      name: 'Max E2E',
      species: 'dog',
      breed: 'Golden Retriever',
      profile: 'healthy',
      birth_date: '2020-03-15',
      weight_kg: 28.5,
    },
    {
      name: 'Luna E2E',
      species: 'cat',
      breed: 'Siamese',
      profile: 'senior',
      birth_date: '2012-07-22',
      weight_kg: 4.2,
    },
    {
      name: 'Rocky E2E',
      species: 'dog',
      breed: 'French Bulldog',
      profile: 'puppy',
      birth_date: '2024-01-10',
      weight_kg: 8.0,
    },
  ]

  const createdPets: E2ETestData['pets'] = []

  for (const pet of petsToCreate) {
    // Check if pet already exists
    const { data: existingPet } = await supabase
      .from('pets')
      .select('id, name, species')
      .eq('owner_id', ownerId)
      .eq('name', pet.name)
      .single()

    if (existingPet) {
      createdPets.push(existingPet)
      continue
    }

    const { data: newPet, error } = await supabase
      .from('pets')
      .insert({
        owner_id: ownerId,
        tenant_id: E2E_TEST_TENANT,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        birth_date: pet.birth_date,
        weight_kg: pet.weight_kg,
        sex: 'male',
        is_neutered: pet.profile !== 'puppy',
        color: pet.species === 'dog' ? 'Dorado' : 'Crema',
      })
      .select('id, name, species')
      .single()

    if (error) {
      console.warn(`[E2E Setup] Failed to create pet ${pet.name}: ${error.message}`)
      continue
    }

    createdPets.push(newPet)
  }

  console.log(`[E2E Setup] Created/found ${createdPets.length} pets`)
  return createdPets
}

/**
 * Creates vaccine records for pets
 */
async function setupTestVaccines(
  supabase: SupabaseClient,
  pets: E2ETestData['pets']
): Promise<string[]> {
  console.log('[E2E Setup] Setting up test vaccines...')

  const createdVaccineIds: string[] = []
  const now = new Date()

  const vaccineTypes = [
    { name: 'Antirrábica', intervalMonths: 12 },
    { name: 'Séxtuple', intervalMonths: 12 },
    { name: 'Tos de las perreras', intervalMonths: 12 },
  ]

  for (const pet of pets) {
    // Check if vaccines already exist for this pet
    const { data: existingVaccines } = await supabase
      .from('vaccines')
      .select('id')
      .eq('pet_id', pet.id)
      .limit(1)

    if (existingVaccines && existingVaccines.length > 0) {
      continue // Skip if vaccines already exist
    }

    for (let i = 0; i < vaccineTypes.length; i++) {
      const vaccine = vaccineTypes[i]

      // Vary the status: first completed, second due soon, third overdue
      let administeredDate: Date
      let nextDueDate: Date
      let status: 'completed' | 'scheduled' | 'missed'

      if (i === 0) {
        // Completed, next due in future
        administeredDate = new Date(now)
        administeredDate.setMonth(administeredDate.getMonth() - 3)
        nextDueDate = new Date(administeredDate)
        nextDueDate.setMonth(nextDueDate.getMonth() + 12)
        status = 'completed'
      } else if (i === 1) {
        // Due soon (within 30 days)
        administeredDate = new Date(now)
        administeredDate.setMonth(administeredDate.getMonth() - 11)
        nextDueDate = new Date(now)
        nextDueDate.setDate(nextDueDate.getDate() + 15)
        status = 'completed'
      } else {
        // Overdue
        administeredDate = new Date(now)
        administeredDate.setMonth(administeredDate.getMonth() - 14)
        nextDueDate = new Date(now)
        nextDueDate.setMonth(nextDueDate.getMonth() - 2)
        status = 'completed'
      }

      const { data: newVaccine, error } = await supabase
        .from('vaccines')
        .insert({
          pet_id: pet.id,
          administered_by_clinic: E2E_TEST_TENANT,
          name: vaccine.name,
          manufacturer: 'Nobivac',
          batch_number: `LOT${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
          administered_date: administeredDate.toISOString().split('T')[0],
          next_due_date: nextDueDate.toISOString().split('T')[0],
          status,
        })
        .select('id')
        .single()

      if (newVaccine) {
        createdVaccineIds.push(newVaccine.id)
      }
    }
  }

  console.log(`[E2E Setup] Created ${createdVaccineIds.length} vaccines`)
  return createdVaccineIds
}

/**
 * Creates test products with inventory
 */
async function setupTestProducts(supabase: SupabaseClient): Promise<E2ETestData['products']> {
  console.log('[E2E Setup] Setting up test products...')

  const productsToCreate = [
    { name: 'E2E Alimento Premium Perro', sku: 'E2E-FOOD-DOG', price: 85000, stock: 50 },
    { name: 'E2E Antiparasitario', sku: 'E2E-ANTI-001', price: 45000, stock: 100 },
    { name: 'E2E Shampoo Medicado', sku: 'E2E-SHAMPOO', price: 35000, stock: 25 },
    { name: 'E2E Collar Antipulgas', sku: 'E2E-COLLAR', price: 55000, stock: 30 },
  ]

  const createdProducts: E2ETestData['products'] = []

  for (const product of productsToCreate) {
    // Check if product already exists
    const { data: existingProduct } = await supabase
      .from('store_products')
      .select('id, name, sku')
      .eq('tenant_id', E2E_TEST_TENANT)
      .eq('sku', product.sku)
      .single()

    if (existingProduct) {
      createdProducts.push(existingProduct)
      continue
    }

    // Create product
    const { data: newProduct, error: productError } = await supabase
      .from('store_products')
      .insert({
        tenant_id: E2E_TEST_TENANT,
        name: product.name,
        sku: product.sku,
        base_price: product.price,
        is_active: true,
        description: `Test product for E2E testing: ${product.name}`,
      })
      .select('id, name, sku')
      .single()

    if (productError) {
      console.warn(`[E2E Setup] Failed to create product ${product.name}: ${productError.message}`)
      continue
    }

    // Create inventory record
    const { error: inventoryError } = await supabase.from('store_inventory').insert({
      product_id: newProduct.id,
      tenant_id: E2E_TEST_TENANT,
      stock_quantity: product.stock,
      reorder_point: 10,
    })

    if (inventoryError) {
      console.warn(`[E2E Setup] Failed to create inventory for ${product.name}: ${inventoryError.message}`)
    }

    createdProducts.push(newProduct)
  }

  console.log(`[E2E Setup] Created/found ${createdProducts.length} products`)
  return createdProducts
}

/**
 * Creates test services for booking
 */
async function setupTestServices(supabase: SupabaseClient): Promise<E2ETestData['services']> {
  console.log('[E2E Setup] Setting up test services...')

  const servicesToCreate = [
    { name: 'E2E Consulta General', category: 'consultation', price: 50000, duration: 30 },
    { name: 'E2E Vacunación', category: 'vaccination', price: 80000, duration: 20 },
    { name: 'E2E Baño y Peluquería', category: 'grooming', price: 45000, duration: 60 },
  ]

  const createdServices: E2ETestData['services'] = []

  for (const service of servicesToCreate) {
    // Check if service already exists
    const { data: existingService } = await supabase
      .from('services')
      .select('id, name')
      .eq('tenant_id', E2E_TEST_TENANT)
      .eq('name', service.name)
      .single()

    if (existingService) {
      createdServices.push(existingService)
      continue
    }

    const { data: newService, error } = await supabase
      .from('services')
      .insert({
        tenant_id: E2E_TEST_TENANT,
        name: service.name,
        category: service.category,
        base_price: service.price,
        duration_minutes: service.duration,
        is_active: true,
      })
      .select('id, name')
      .single()

    if (error) {
      console.warn(`[E2E Setup] Failed to create service ${service.name}: ${error.message}`)
      continue
    }

    createdServices.push(newService)
  }

  console.log(`[E2E Setup] Created/found ${createdServices.length} services`)
  return createdServices
}

/**
 * Creates test coupon for discount validation
 */
async function setupTestCoupon(supabase: SupabaseClient): Promise<void> {
  console.log('[E2E Setup] Setting up test coupon...')

  const couponCode = 'E2ETEST20'

  // Check if coupon already exists
  const { data: existingCoupon } = await supabase
    .from('store_coupons')
    .select('id')
    .eq('tenant_id', E2E_TEST_TENANT)
    .eq('code', couponCode)
    .single()

  if (existingCoupon) {
    console.log('[E2E Setup] Test coupon already exists')
    return
  }

  // Create 20% discount coupon for E2E tests
  const { error } = await supabase.from('store_coupons').insert({
    tenant_id: E2E_TEST_TENANT,
    code: couponCode,
    discount_type: 'percentage',
    discount_value: 20,
    usage_limit: 1000,
    valid_from: new Date().toISOString(),
    valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    is_active: true,
  })

  if (error) {
    console.warn(`[E2E Setup] Failed to create test coupon: ${error.message}`)
  } else {
    console.log('[E2E Setup] Created test coupon: E2ETEST20 (20% off)')
  }
}

/**
 * Creates loyalty points for test owner
 */
async function setupTestLoyaltyPoints(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  console.log('[E2E Setup] Setting up test loyalty points...')

  const initialPoints = 5000

  // Check if loyalty record exists
  const { data: existingLoyalty } = await supabase
    .from('loyalty_points')
    .select('id, balance')
    .eq('user_id', userId)
    .single()

  if (existingLoyalty) {
    console.log(`[E2E Setup] Existing loyalty balance: ${existingLoyalty.balance}`)
    return existingLoyalty.balance
  }

  // Create loyalty record
  const { error } = await supabase.from('loyalty_points').insert({
    user_id: userId,
    tenant_id: E2E_TEST_TENANT,
    balance: initialPoints,
    lifetime_earned: initialPoints,
  })

  if (error) {
    console.warn(`[E2E Setup] Failed to create loyalty points: ${error.message}`)
    return 0
  }

  // Create initial transaction
  await supabase.from('loyalty_transactions').insert({
    clinic_id: E2E_TEST_TENANT,
    user_id: userId,
    points: initialPoints,
    description: 'E2E Test - Puntos iniciales',
    type: 'earned',
  })

  console.log(`[E2E Setup] Created loyalty balance: ${initialPoints}`)
  return initialPoints
}

/**
 * Saves test data to file for use in tests
 */
function saveTestData(data: E2ETestData): void {
  const dataPath = resolve(process.cwd(), '.e2e-test-data.json')
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  console.log(`[E2E Setup] Test data saved to ${dataPath}`)
}

/**
 * Authenticates and saves browser state
 */
async function setupAuthState(config: FullConfig): Promise<void> {
  console.log('[E2E Setup] Setting up auth state...')

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  const baseURL = config.projects[0]?.use?.baseURL || 'http://127.0.0.1:3000'

  try {
    // Navigate to login page
    await page.goto(`${baseURL}/${E2E_TEST_TENANT}/portal/login`)

    // Wait for login form
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 })

    // Fill login form
    await page.fill('input[type="email"], input[name="email"]', E2E_TEST_OWNER.email)
    await page.fill('input[type="password"], input[name="password"]', E2E_TEST_OWNER.password)

    // Submit
    await page.click('button[type="submit"], button:has-text("Iniciar")')

    // Wait for navigation to portal/dashboard
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 })

    console.log('[E2E Setup] Login successful, saving auth state...')

    // Create auth directory if it doesn't exist
    const authDir = resolve(process.cwd(), '.auth')
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true })
    }

    // Save authenticated state
    await context.storageState({ path: resolve(authDir, 'owner.json') })
    console.log('[E2E Setup] Auth state saved to .auth/owner.json')
  } catch (error) {
    console.error('[E2E Setup] Failed to setup auth state:', error)
    throw error
  } finally {
    await browser.close()
  }
}

// =============================================================================
// Main Setup Function
// =============================================================================

async function globalSetup(config: FullConfig): Promise<void> {
  console.log('\n========================================')
  console.log('E2E GLOBAL SETUP - Starting...')
  console.log('========================================\n')

  const supabase = createServiceRoleClient()

  try {
    // 1. Create test owner
    const { userId, profileId } = await setupTestOwner(supabase)

    // 2. Create test pets
    const pets = await setupTestPets(supabase, userId)

    // 3. Create vaccine records
    const vaccines = await setupTestVaccines(supabase, pets)

    // 4. Create test products
    const products = await setupTestProducts(supabase)

    // 5. Create test services
    const services = await setupTestServices(supabase)

    // 6. Setup loyalty points
    const loyaltyPoints = await setupTestLoyaltyPoints(supabase, userId)

    // 7. Setup test coupon for discount validation
    await setupTestCoupon(supabase)

    // Compile test data
    const testData: E2ETestData = {
      ownerId: userId,
      ownerProfileId: profileId,
      pets,
      vaccines,
      products,
      services,
      loyaltyPoints,
      appointments: [],
      invoices: [],
      conversations: [],
    }

    // Save test data for use in tests
    saveTestData(testData)

    // 8. Setup auth state (login via browser and save session)
    await setupAuthState(config)

    console.log('\n========================================')
    console.log('E2E GLOBAL SETUP - Complete!')
    console.log('========================================\n')
    console.log('Test Data Summary:')
    console.log(`  Owner: ${E2E_TEST_OWNER.email}`)
    console.log(`  Pets: ${pets.length}`)
    console.log(`  Vaccines: ${vaccines.length}`)
    console.log(`  Products: ${products.length}`)
    console.log(`  Services: ${services.length}`)
    console.log(`  Loyalty Points: ${loyaltyPoints}`)
    console.log('')
  } catch (error) {
    console.error('\n[E2E Setup] FATAL ERROR:', error)
    throw error
  }
}

export default globalSetup
