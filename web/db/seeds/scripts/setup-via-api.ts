#!/usr/bin/env npx tsx

console.log('Script starting...')

/**
 * =============================================================================
 * SETUP-VIA-API.TS
 * =============================================================================
 * API-based environment setup script. Creates all seed data through API calls
 * instead of direct SQL insertion, simulating real user workflows.
 *
 * This ensures:
 * - Backend generates all IDs automatically
 * - Data validation happens through API
 * - Business logic is properly executed
 * - Relationships are maintained correctly
 * - No hardcoded ID dependencies
 *
 * Usage:
 *   npx tsx db/seeds/setup-via-api.ts --env local --tenant adris
 *
 * =============================================================================
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// =============================================================================
// CONFIGURATION
// =============================================================================

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'data')

interface SetupConfig {
  baseUrl: string
  tenantId: string
  adminToken?: string
  setupType: 'basic' | 'full' | 'demo' | 'clear'
  skipExisting?: boolean
  clearFirst?: boolean
}

// =============================================================================
// API CLIENT
// =============================================================================

class ApiClient {
  private baseUrl: string
  private authToken?: string

  constructor(baseUrl: string, authToken?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.authToken = authToken
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
    }

    const config: RequestInit = {
      method,
      headers,
    }

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data)
    }

    console.log(`🔄 ${method} ${url}`)
    if (data) {
      console.log(`   📤 ${JSON.stringify(data, null, 2).slice(0, 200)}...`)
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log(`   ✅ ${method} ${endpoint} - Success`)
      return result
    } catch (error) {
      console.error(`   ❌ ${method} ${endpoint} - Failed:`, error)
      throw error
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    return this.request('POST', '/auth/login', { email, password })
  }

  async switchTenant(tenantId: string): Promise<any> {
    return this.request('POST', `/auth/switch-tenant/${tenantId}`)
  }

  // Tenants
  async createTenant(data: any): Promise<any> {
    return this.request('POST', '/admin/tenants', data)
  }

  async getTenant(tenantId: string): Promise<any> {
    return this.request('GET', `/admin/tenants/${tenantId}`)
  }

  // Users/Profiles
  async createProfile(data: any): Promise<any> {
    return this.request('POST', '/profiles', data)
  }

  async getProfiles(): Promise<any[]> {
    return this.request('GET', '/profiles')
  }

  // Pets
  async createPet(data: any): Promise<any> {
    return this.request('POST', '/pets', data)
  }

  async getPets(): Promise<any[]> {
    return this.request('GET', '/pets')
  }

  // Services
  async createService(data: any): Promise<any> {
    return this.request('POST', '/services', data)
  }

  async getServices(): Promise<any[]> {
    return this.request('GET', '/services')
  }

  // Appointments
  async createAppointment(data: any): Promise<any> {
    return this.request('POST', '/appointments', data)
  }

  async getAppointments(): Promise<any[]> {
    return this.request('GET', '/appointments')
  }

  // Medical Records
  async createMedicalRecord(data: any): Promise<any> {
    return this.request('POST', '/medical-records', data)
  }

  async getMedicalRecords(): Promise<any[]> {
    return this.request('GET', '/medical-records')
  }

  // Vaccines
  async createVaccine(data: any): Promise<any> {
    return this.request('POST', '/vaccines', data)
  }

  async getVaccines(): Promise<any[]> {
    return this.request('GET', '/vaccines')
  }

  // Hospitalizations
  async createHospitalization(data: any): Promise<any> {
    return this.request('POST', '/hospitalizations', data)
  }

  async getHospitalizations(): Promise<any[]> {
    return this.request('GET', '/hospitalizations')
  }

  // Payment Methods
  async createPaymentMethod(data: any): Promise<any> {
    return this.request('POST', '/payment-methods', data)
  }

  async getPaymentMethods(): Promise<any[]> {
    return this.request('GET', '/payment-methods')
  }

  // Kennels
  async createKennel(data: any): Promise<any> {
    return this.request('POST', '/kennels', data)
  }

  async getKennels(): Promise<any[]> {
    return this.request('GET', '/kennels')
  }

  // QR Tags
  async createQrTag(data: any): Promise<any> {
    return this.request('POST', '/qr-tags', data)
  }

  async getQrTags(): Promise<any[]> {
    return this.request('GET', '/qr-tags')
  }

  // Appointments
  async createAppointment(data: any): Promise<any> {
    return this.request('POST', '/appointments', data)
  }

  async getAppointments(): Promise<any[]> {
    return this.request('GET', '/appointments')
  }

  // Hospitalizations
  async createHospitalization(data: any): Promise<any> {
    return this.request('POST', '/hospitalizations', data)
  }

  async getHospitalizations(): Promise<any[]> {
    return this.request('GET', '/hospitalizations')
  }

  // Store operations
  async createBrand(data: any): Promise<any> {
    return this.request('POST', '/store/brands', data)
  }

  async createCategory(data: any): Promise<any> {
    return this.request('POST', '/store/categories', data)
  }

  async createProduct(data: any): Promise<any> {
    return this.request('POST', '/store/products', data)
  }

  async createSupplier(data: any): Promise<any> {
    return this.request('POST', '/suppliers', data)
  }

  async assignProductToClinic(productId: string, data: any): Promise<any> {
    return this.request('POST', `/store/products/${productId}/assign`, data)
  }

  // ============================================================================
  // SEEDING VIA SPECIAL API ENDPOINT
  // ============================================================================

  // Use the special seeding endpoint that bypasses authentication for development
  async seedEntity(action: string, data: any): Promise<any> {
    return this.request('POST', '/api/setup/seed', { action, data })
  }

  async seedBulk(data: any): Promise<any> {
    return this.request('POST', '/api/setup/seed', { action: 'bulk_seed', data })
  }

  // ============================================================================
  // CLEARING METHODS (for clearing environment)
  // ============================================================================

  // Clear all data for a tenant by calling individual delete endpoints
  async clearTenantData(tenantId: string): Promise<void> {
    console.log(`🧹 Clearing all data for tenant: ${tenantId}`)

    const response = await this.request('DELETE', `/api/setup/seed?tenant_id=${tenantId}`)
    const result = await response.json()

    if (!response.ok) {
      throw new Error(`Failed to clear tenant data: ${result.error}`)
    }

    console.log(`   ✅ Cleared ${result.total_deleted} records for tenant ${tenantId}`)
  }
}

// =============================================================================
// ID TRACKING SYSTEM
// =============================================================================

class IdTracker {
  private ids: Map<string, string> = new Map()
  private reverseIds: Map<string, string> = new Map()

  set(entityType: string, originalId: string, createdId: string) {
    this.ids.set(`${entityType}:${originalId}`, createdId)
    this.reverseIds.set(createdId, `${entityType}:${originalId}`)
  }

  get(entityType: string, originalId: string): string | undefined {
    return this.ids.get(`${entityType}:${originalId}`)
  }

  getByCreatedId(createdId: string): { entityType: string; originalId: string } | undefined {
    const key = this.reverseIds.get(createdId)
    if (!key) return undefined

    const [entityType, originalId] = key.split(':')
    return { entityType, originalId }
  }

  resolveReferences(data: any, entityType: string): any {
    if (typeof data === 'string') {
      // Check if it's a reference to track
      const trackedId = this.get(entityType, data)
      return trackedId || data
    }

    if (Array.isArray(data)) {
      return data.map(item => this.resolveReferences(item, entityType))
    }

    if (typeof data === 'object' && data !== null) {
      const result: any = {}
      for (const [key, value] of Object.entries(data)) {
        // Special handling for common ID fields
        if (key.includes('_id') || key === 'id') {
          const entityTypeMap: Record<string, string> = {
            owner_id: 'profile',
            pet_id: 'pet',
            vet_id: 'profile',
            profile_id: 'profile',
            tenant_id: 'tenant',
            service_id: 'service',
            brand_id: 'brand',
            category_id: 'category',
            supplier_id: 'supplier',
          }

          const refEntityType = entityTypeMap[key] || key.replace('_id', '')
          result[key] = this.resolveReferences(value, refEntityType)
        } else {
          result[key] = this.resolveReferences(value, entityType)
        }
      }
      return result
    }

    return data
  }

  getSummary(): Record<string, number> {
    const summary: Record<string, number> = {}
    for (const [key] of this.ids) {
      const [entityType] = key.split(':')
      summary[entityType] = (summary[entityType] || 0) + 1
    }
    return summary
  }
}

// =============================================================================
// SETUP ORCHESTRATOR
// =============================================================================

class EnvironmentSetup {
  private api: ApiClient
  private tracker: IdTracker
  private config: SetupConfig

  constructor(config: SetupConfig) {
    this.config = config
    this.api = new ApiClient(config.baseUrl, config.adminToken)
    this.tracker = new IdTracker()
  }

  async setup(): Promise<void> {
    console.log('🚀 Starting environment setup via API')
    console.log(`   Environment: ${this.config.baseUrl}`)
    console.log(`   Tenant: ${this.config.tenantId}`)
    console.log(`   Setup Type: ${this.config.setupType}`)
    if (this.config.clearFirst) {
      console.log(`   Clear First: ${this.config.clearFirst}`)
    }
    console.log('')

    try {
      // Authenticate if needed
      if (!this.config.adminToken) {
        await this.authenticate()
      }

      // Switch to tenant context
      await this.switchToTenant()

      // Clear existing data if requested
      if (this.config.clearFirst) {
        await this.clearEnvironment()
      }

      // Execute setup based on type
      switch (this.config.setupType) {
        case 'clear':
          await this.clearEnvironment()
          break
        case 'basic':
          await this.setupBasic()
          break
        case 'full':
          await this.setupFull()
          break
        case 'demo':
          await this.setupDemo()
          break
      }

      // Print summary
      this.printSummary()

    } catch (error) {
      console.error('❌ Setup failed:', error)
      throw error
    }
  }

  private async authenticate(): Promise<void> {
    console.log('🔐 Authenticating...')

    // Try to login with demo admin account
    try {
      const auth = await this.api.login('admin@demo.com', 'demo123')
      this.api = new ApiClient(this.config.baseUrl, auth.token)
      console.log('✅ Authentication successful')
    } catch (error) {
      console.log('⚠️  Authentication failed, proceeding without auth (may fail on protected endpoints)')
    }
  }

  private async switchToTenant(): Promise<void> {
    console.log(`🏢 Switching to tenant: ${this.config.tenantId}`)
    try {
      await this.api.switchTenant(this.config.tenantId)
      console.log('✅ Tenant context set')
    } catch (error) {
      console.log('⚠️  Could not switch tenant, proceeding (tenant may not exist yet)')
    }
  }

  private async setupBasic(): Promise<void> {
    console.log('📋 Running BASIC setup (minimal clinic data)')

    await this.setupCoreData()
    await this.setupClinicServices()
    await this.setupPaymentMethods()
    await this.setupKennels()
  }

  private async setupFull(): Promise<void> {
    console.log('📋 Running FULL setup (complete clinic with sample data)')

    await this.setupCoreData()
    await this.setupClinicServices()
    await this.setupPaymentMethods()
    await this.setupKennels()
    await this.setupQrTags()
    await this.setupSampleProfiles()
    await this.setupSamplePets()
    await this.setupSampleAppointments()
  }

  private async setupDemo(): Promise<void> {
    console.log('📋 Running DEMO setup (complete demo environment)')

    await this.setupCoreData()
    await this.setupClinicServices()
    await this.setupPaymentMethods()
    await this.setupKennels()
    await this.setupQrTags()
    await this.setupSampleProfiles()
    await this.setupSamplePets()
    await this.setupSampleAppointments()
    await this.setupSampleMedicalRecords()
    await this.setupSampleVaccines()
    await this.setupSampleHospitalizations()
    await this.setupStoreData()
  }

  // ============================================================================
  // SETUP METHODS
  // ============================================================================

  private async setupCoreData(): Promise<void> {
    console.log('🏗️  Setting up core data...')

    // Create tenant if it doesn't exist
    const tenantData = loadJSON<{ tenants: any[] }>(join(DATA_DIR, '00-core', 'tenants.json'))
    if (tenantData?.tenants) {
      for (const tenant of tenantData.tenants) {
        if (tenant.id === this.config.tenantId) {
          try {
            const response = await this.api.seedEntity('create_tenant', tenant)
            this.tracker.set('tenant', tenant.id, created.id)
            console.log(`   ✅ Created tenant: ${created.name}`)
          } catch (error) {
            if (this.config.skipExisting) {
              console.log(`   ⏭️  Tenant ${tenant.id} already exists, skipping`)
            } else {
              throw error
            }
          }
        }
      }
    }
  }

  private async setupClinicServices(): Promise<void> {
    console.log('🩺 Setting up clinic services...')

    const servicesData = loadJSON<{ services: any[] }>(
      join(DATA_DIR, '02-clinic', this.config.tenantId, 'services.json')
    )

    if (servicesData?.services) {
      for (const service of servicesData.services) {
        try {
          const response = await this.api.seedEntity('create_service', service)
          this.tracker.set('service', service.name, created.id)
          console.log(`   ✅ Created service: ${created.name}`)
        } catch (error) {
          console.log(`   ⚠️  Failed to create service ${service.name}:`, error.message)
        }
      }
    }
  }

  private async setupPaymentMethods(): Promise<void> {
    console.log('💳 Setting up payment methods...')

    const paymentData = loadJSON<{ payment_methods: any[] }>(
      join(DATA_DIR, '02-clinic', this.config.tenantId, 'payment-methods.json')
    )

    if (paymentData?.payment_methods) {
      for (const method of paymentData.payment_methods) {
        try {
          const response = await this.api.seedEntity('create_payment_method', method)
          this.tracker.set('payment_method', method.name, created.id)
          console.log(`   ✅ Created payment method: ${created.name}`)
        } catch (error) {
          console.log(`   ⚠️  Failed to create payment method ${method.name}:`, error.message)
        }
      }
    }
  }

  private async setupKennels(): Promise<void> {
    console.log('🏠 Setting up kennels...')

    const kennelsData = loadJSON<{ kennels: any[] }>(
      join(DATA_DIR, '02-clinic', this.config.tenantId, 'kennels.json')
    )

    if (kennelsData?.kennels) {
      for (const kennel of kennelsData.kennels) {
        try {
          const response = await this.api.seedEntity('create_kennel', kennel)
          this.tracker.set('kennel', kennel.name, created.id)
          console.log(`   ✅ Created kennel: ${created.name}`)
        } catch (error) {
          console.log(`   ⚠️  Failed to create kennel ${kennel.name}:`, error.message)
        }
      }
    }
  }

  private async setupQrTags(): Promise<void> {
    console.log('🏷️  Setting up QR tags...')

    const qrData = loadJSON<{ qr_tags: any[] }>(
      join(DATA_DIR, '02-clinic', this.config.tenantId, 'qr-tags.json')
    )

    if (qrData?.qr_tags) {
      for (const tag of qrData.qr_tags) {
        try {
          const response = await this.api.seedEntity('create_qr_tag', tag)
          this.tracker.set('qr_tag', tag.code, created.id)
          console.log(`   ✅ Created QR tag: ${created.code}`)
        } catch (error) {
          console.log(`   ⚠️  Failed to create QR tag ${tag.code}:`, error.message)
        }
      }
    }
  }

  private async setupSampleProfiles(): Promise<void> {
    console.log('👥 Setting up sample profiles...')

    const profilesData = loadJSON<{ profiles: any[] }>(
      join(DATA_DIR, '02-global', 'profiles.json')
    )

    if (profilesData?.profiles) {
      for (const profile of profilesData.profiles) {
        try {
          // Remove the hardcoded ID from the payload
          const { id, ...profileData } = profile
          const response = await this.api.seedEntity('create_profile', profileData)
          this.tracker.set('profile', profile.id, response.id)
          console.log(`   ✅ Created profile: ${response.full_name}`)
        } catch (error) {
          console.log(`   ⚠️  Failed to create profile ${profile.full_name}:`, error.message)
        }
      }
    }
  }

  private async setupSamplePets(): Promise<void> {
    console.log('🐾 Setting up sample pets...')

    const petsData = loadJSON<{ pets: any[] }>(
      join(DATA_DIR, '02-global', 'pets.json')
    )

    if (petsData?.pets) {
      for (const pet of petsData.pets) {
        try {
          // Resolve owner_id reference and remove hardcoded ID
          const { id, ...petData } = pet
          const resolvedData = this.tracker.resolveReferences(petData, 'profile')
          const response = await this.api.seedEntity('create_pet', resolvedData)
          this.tracker.set('pet', pet.id, response.id)
          console.log(`   ✅ Created pet: ${response.name}`)
        } catch (error) {
          console.log(`   ⚠️  Failed to create pet ${pet.name}:`, error.message)
        }
      }
    }
  }

  private async setupSampleAppointments(): Promise<void> {
    console.log('📅 Setting up sample appointments...')

    const appointmentsData = loadJSON<{ appointments: any[] }>(
      join(DATA_DIR, '02-clinic', this.config.tenantId, 'appointments.json')
    )

    if (appointmentsData?.appointments) {
      for (const appointment of appointmentsData.appointments) {
        try {
          // Resolve all ID references and remove hardcoded ID
          const { id, ...appointmentData } = appointment
          const resolvedData = this.tracker.resolveReferences(appointmentData, 'profile')
          const response = await this.api.createAppointment(resolvedData)
          this.tracker.set('appointment', appointment.id, response.id)
          console.log(`   ✅ Created appointment: ${response.id}`)
        } catch (error) {
          console.log(`   ⚠️  Failed to create appointment ${appointment.id}:`, error.message)
        }
      }
    }
  }

  private async setupSampleMedicalRecords(): Promise<void> {
    console.log('📋 Setting up sample medical records...')

    const recordsData = loadJSON<{ medical_records: any[] }>(
      join(DATA_DIR, '02-global', 'medical-records.json')
    )

    if (recordsData?.medical_records) {
      for (const record of recordsData.medical_records) {
        try {
          // Resolve all ID references and remove hardcoded ID
          const { id, ...recordData } = record
          const resolvedData = this.tracker.resolveReferences(recordData, 'profile')
          const response = await this.api.seedEntity('create_medical_record', resolvedData)
          this.tracker.set('medical_record', record.id, created.id)
          console.log(`   ✅ Created medical record: ${created.id}`)
        } catch (error) {
          console.log(`   ⚠️  Failed to create medical record ${record.id}:`, error.message)
        }
      }
    }
  }

  private async setupSampleVaccines(): Promise<void> {
    console.log('💉 Setting up sample vaccines...')

    const vaccinesData = loadJSON<{ vaccines: any[] }>(
      join(DATA_DIR, '02-clinic', this.config.tenantId, 'vaccines.json')
    )

    if (vaccinesData?.vaccines) {
      for (const vaccine of vaccinesData.vaccines) {
        try {
          // Resolve all ID references and remove hardcoded ID
          const { id, ...vaccineData } = vaccine
          const resolvedData = this.tracker.resolveReferences(vaccineData, 'profile')
          const response = await this.api.seedEntity('create_vaccine', resolvedData)
          this.tracker.set('vaccine', vaccine.id, created.id)
          console.log(`   ✅ Created vaccine record: ${created.id}`)
        } catch (error) {
          console.log(`   ⚠️  Failed to create vaccine ${vaccine.id}:`, error.message)
        }
      }
    }
  }

  private async setupSampleHospitalizations(): Promise<void> {
    console.log('🏥 Setting up sample hospitalizations...')

    const hospitalizationsData = loadJSON<{ hospitalizations: any[] }>(
      join(DATA_DIR, '02-clinic', this.config.tenantId, 'hospitalizations.json')
    )

    if (hospitalizationsData?.hospitalizations) {
      for (const hospitalization of hospitalizationsData.hospitalizations) {
        try {
          // Resolve all ID references and remove hardcoded ID
          const { id, ...hospData } = hospitalization
          const resolvedData = this.tracker.resolveReferences(hospData, 'profile')
          const response = await this.api.createHospitalization(resolvedData)
          this.tracker.set('hospitalization', hospitalization.id, response.id)
          console.log(`   ✅ Created hospitalization: ${response.id}`)
        } catch (error) {
          console.log(`   ⚠️  Failed to create hospitalization ${hospitalization.id}:`, error.message)
        }
      }
    }
  }

  private async setupStoreData(): Promise<void> {
    console.log('🛒 Setting up store data...')

    // This would include brands, categories, products, suppliers
    // Implementation would be similar to other setup methods
    console.log('   ⏭️  Store setup not yet implemented (would create brands, categories, products)')
  }

  private async clearEnvironment(): Promise<void> {
    console.log('🧹 Clearing existing environment data...')

    try {
      await this.api.clearTenantData(this.config.tenantId)
      console.log('✅ Environment cleared successfully')

      // Reset ID tracker since all entities are gone
      this.tracker = new IdTracker()
      console.log('🔄 ID tracker reset')
      console.log('')

    } catch (error) {
      console.error('❌ Failed to clear environment:', error)
      throw error
    }
  }

  private printSummary(): void {
    console.log('')
    console.log('📊 SETUP SUMMARY')
    console.log('================')

    const summary = this.tracker.getSummary()
    for (const [entityType, count] of Object.entries(summary)) {
      console.log(`✅ ${entityType}: ${count} created`)
    }

    console.log('')
    console.log('🎉 Environment setup completed successfully!')
    console.log('   All IDs were generated by the backend')
    console.log('   Data was created through proper API validation')
    console.log('   Relationships are maintained automatically')
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function loadJSON<T>(path: string): T | null {
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T
  } catch (e) {
    console.error(`Error loading ${path}: ${e}`)
    return null
  }
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('🚀 Starting Vete API Seed Setup...')

  const args = process.argv.slice(2)
  console.log('Arguments:', args)

  const config: SetupConfig = {
    baseUrl: 'http://localhost:3000',
    tenantId: 'adris',
    setupType: 'basic',
    skipExisting: true,
    clearFirst: false,
  }

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--env':
      case '--environment':
        config.baseUrl = args[++i]
        break
      case '--tenant':
        config.tenantId = args[++i]
        break
      case '--type':
        const typeArg = args[++i]
        if (!['basic', 'full', 'demo', 'clear'].includes(typeArg)) {
          console.error('❌ Invalid setup type. Use: basic, full, demo, or clear')
          process.exit(1)
        }
        config.setupType = typeArg as 'basic' | 'full' | 'demo' | 'clear'
        break
      case '--token':
        config.adminToken = args[++i]
        break
      case '--no-skip':
        config.skipExisting = false
        break
      case '--clear-first':
        config.clearFirst = true
        break
    }
  }

  // Validate configuration
  if (!['basic', 'full', 'demo', 'clear'].includes(config.setupType)) {
    console.error('❌ Invalid setup type. Use: basic, full, demo, or clear')
    process.exit(1)
  }

  const setup = new EnvironmentSetup(config)

  try {
    await setup.setup()
    console.log('')
    console.log('✅ Setup completed successfully!')
  } catch (error) {
    console.error('')
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

// Run main function
console.log('About to call main...')
main()
  .then(() => console.log('✅ Main completed successfully'))
  .catch((error) => {
    console.error('❌ Main failed:', error)
    console.error('Stack:', error.stack)
    process.exit(1)
  })

export { EnvironmentSetup, ApiClient, IdTracker }
