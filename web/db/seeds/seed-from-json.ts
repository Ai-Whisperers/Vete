#!/usr/bin/env npx tsx
/**
 * =============================================================================
 * SEED-FROM-JSON.TS (v2)
 * =============================================================================
 * Unified JSON-to-SQL seed generator. Reads all JSON data files from the
 * organized folder structure and generates a single SQL file for database seeding.
 *
 * New Folder Structure:
 *   data/
 *   ├── 00-core/           → tenants, demo-accounts
 *   ├── 01-reference/      → diagnosis-codes, drug-dosages, lab-tests, etc.
 *   ├── 02-clinic/         → services, payment-methods, kennels, templates
 *   │   ├── _global/       → global templates (tenant_id = null)
 *   │   ├── adris/         → Adris-specific data
 *   │   └── petlife/       → PetLife-specific data
 *   └── 03-store/          → brands, categories, products, suppliers
 *
 * Usage:
 *   npx tsx db/seeds/seed-from-json.ts > db/seeds/generated-seed.sql
 *
 * =============================================================================
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// =============================================================================
// PATHS
// =============================================================================

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'data')

// Tenant IDs that should have store products
const STORE_TENANTS = ['adris', 'petlife']

// =============================================================================
// SQL HELPERS
// =============================================================================

function escapeSQL(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return 'NULL'
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE'
  if (typeof val === 'number') return String(val)
  return `'${String(val).replace(/'/g, "''")}'`
}

function arrayToSQL(arr: (string | number)[] | null | undefined): string {
  if (!arr || arr.length === 0) return 'NULL'
  const items = arr.map((v) => (typeof v === 'string' ? escapeSQL(v) : v))
  return `ARRAY[${items.join(', ')}]`
}

function jsonToSQL(obj: Record<string, unknown> | null | undefined): string {
  if (!obj) return 'NULL'
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::JSONB`
}

function loadJSON<T>(path: string): T | null {
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T
  } catch (e) {
    console.error(`-- Error loading ${path}: ${e}`)
    return null
  }
}

function listJsonFiles(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter(f => f.endsWith('.json'))
}

function listDirs(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
}

// =============================================================================
// TYPES
// =============================================================================

interface Tenant {
  id: string
  name: string
  legal_name?: string
  tax_id?: string
  city?: string
  country?: string
  address?: string
  phone?: string
  whatsapp?: string
  email?: string
  website?: string | null
  settings?: Record<string, unknown>
  business_hours?: Record<string, unknown>
  is_active?: boolean
}

interface DemoAccount {
  email: string
  tenant_id: string
  role: 'owner' | 'vet' | 'admin'
  full_name?: string
  is_active?: boolean
}

interface DiagnosisCode {
  code: string
  term: string
  term_en?: string
  standard?: string
  category?: string
  species?: string[]
  severity?: string
  common_symptoms?: string[]
}

interface DrugDosage {
  name: string
  brand_names?: string[]
  species: string
  min_dose_mg_kg: number
  max_dose_mg_kg: number
  concentration_mg_ml?: number
  route?: string
  frequency?: string
  duration_days?: string
  category?: string
  contraindications?: string[]
  requires_prescription?: boolean
}

interface GrowthStandard {
  species?: string
  breed_category: string
  gender: string
  age_weeks: number
  weight_kg: number
  percentile?: string
  height_cm?: number
}

interface LabTest {
  code: string
  name: string
  name_en?: string
  category?: string
  sample_type?: string
  base_price?: number
  turnaround_days?: number
  requires_fasting?: boolean
  species?: string[]
  description?: string
}

interface InsuranceProvider {
  name: string
  code: string
  country?: string
  phone?: string | null
  email?: string | null
  claims_email?: string | null
  website?: string | null
  coverage_types?: string[]
  direct_billing?: boolean
  is_active?: boolean
}

interface VaccineProtocol {
  vaccine_name: string
  vaccine_code?: string
  species: string
  type?: string
  diseases_prevented?: string[]
  first_dose_weeks?: number
  booster_weeks?: number[]
  revaccination_months?: number
  notes?: string
}

interface Service {
  name: string
  category: string
  base_price: number
  duration_minutes: number
  description?: string
  is_active?: boolean
  is_public?: boolean
  display_order?: number
  color?: string
  available_days?: number[]
  available_start_time?: string
  available_end_time?: string
  requires_deposit?: boolean
  deposit_percentage?: number
  species?: string[]
}

interface PaymentMethod {
  name: string
  type: string
  is_default?: boolean
  display_order?: number
  fee_percentage?: number
  min_amount?: number
  max_amount?: number
  instructions?: string
  is_active?: boolean
}

interface Kennel {
  name: string
  code: string
  kennel_type: string
  daily_rate: number
  current_status?: string
  max_weight_kg?: number
  features?: string[]
  location?: string
}

interface MessageTemplate {
  code: string
  name: string
  category: string
  subject?: string
  content: string
  content_html?: string
  channels?: string[]
  variables?: string[]
  is_active?: boolean
}

interface ConsentTemplate {
  code: string
  name: string
  category: string
  title: string
  content_html: string
  requires_witness?: boolean
  validity_days?: number | null
  version?: string
}

interface TimeOffType {
  name: string
  code: string
  is_paid?: boolean
  max_days_per_year?: number | null
  requires_approval?: boolean
  requires_documentation?: boolean
  color?: string
}

interface QrTag {
  code: string
  is_active?: boolean
  is_registered?: boolean
  batch_id?: string
}

interface Brand {
  slug: string
  name: string
  description?: string
  logo_url?: string
  website?: string | null
  country_origin?: string
}

interface Category {
  slug: string
  name: string
  description?: string
  level: number
  display_order: number
  parent_slug?: string | null
  image_url?: string
  subcategories?: Category[]
}

interface ProductVariant {
  size: string
  base_price: number
  cost_price: number
  sku_suffix: string
  barcode?: string
}

interface Product {
  sku: string
  name: string
  description?: string
  category_slug: string
  target_species?: string[]
  requires_prescription?: boolean
  variants: ProductVariant[]
  image_url?: string
  attributes?: Record<string, unknown>
}

interface ProductFile {
  brand_slug: string
  products: Product[]
}

interface Supplier {
  slug: string
  name: string
  legal_name?: string
  ruc?: string
  type: string
  phone?: string
  whatsapp?: string
  email?: string
  website?: string | null
  address?: string
  city?: string
  contact_name?: string
  contact_position?: string
  min_order_gs?: number
  payment_terms?: string
  delivery_days?: number
  brands?: string[]
  verified?: boolean
  notes?: string
  active?: boolean
}

interface TenantProductAssignment {
  sku: string
  sale_price?: number
  min_stock_level?: number
  location?: string
  initial_stock?: number
  requires_prescription?: boolean
  is_active?: boolean
}

interface TenantProductsFile {
  tenant_id: string
  products: TenantProductAssignment[]
}

// =============================================================================
// GENERATORS
// =============================================================================

function generateTenantsSQL(tenants: Tenant[]): string {
  const lines = [
    '-- TENANTS',
    'INSERT INTO public.tenants (id, name, legal_name, tax_id, city, country, address, phone, whatsapp, email, website, settings, business_hours, is_active) VALUES',
  ]
  const values = tenants.map((t, i) => {
    const comma = i < tenants.length - 1 ? ',' : ''
    return `    (${escapeSQL(t.id)}, ${escapeSQL(t.name)}, ${escapeSQL(t.legal_name)}, ${escapeSQL(t.tax_id)}, ${escapeSQL(t.city)}, ${escapeSQL(t.country)}, ${escapeSQL(t.address)}, ${escapeSQL(t.phone)}, ${escapeSQL(t.whatsapp)}, ${escapeSQL(t.email)}, ${escapeSQL(t.website)}, ${jsonToSQL(t.settings)}, ${jsonToSQL(t.business_hours)}, ${escapeSQL(t.is_active ?? true)})${comma}`
  })
  lines.push(...values)
  lines.push('ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, settings = EXCLUDED.settings, is_active = EXCLUDED.is_active;', '')
  return lines.join('\n')
}

function generateDemoAccountsSQL(accounts: DemoAccount[]): string {
  const lines = [
    '-- DEMO ACCOUNTS',
    'INSERT INTO public.demo_accounts (email, tenant_id, role, full_name, is_active) VALUES',
  ]
  const values = accounts.map((a, i) => {
    const comma = i < accounts.length - 1 ? ',' : ''
    return `    (${escapeSQL(a.email)}, ${escapeSQL(a.tenant_id)}, ${escapeSQL(a.role)}, ${escapeSQL(a.full_name)}, ${escapeSQL(a.is_active ?? true)})${comma}`
  })
  lines.push(...values)
  lines.push('ON CONFLICT (email) DO UPDATE SET tenant_id = EXCLUDED.tenant_id, role = EXCLUDED.role, full_name = EXCLUDED.full_name, is_active = EXCLUDED.is_active;', '')
  return lines.join('\n')
}

function generateDiagnosisCodesSQL(codes: DiagnosisCode[]): string {
  const lines = [
    '-- DIAGNOSIS CODES',
    'INSERT INTO public.diagnosis_codes (code, term, standard, category, species, severity) VALUES',
  ]
  const values = codes.map((c, i) => {
    const comma = i < codes.length - 1 ? ',' : ''
    return `    (${escapeSQL(c.code)}, ${escapeSQL(c.term)}, ${escapeSQL(c.standard ?? 'venom')}, ${escapeSQL(c.category)}, ${arrayToSQL(c.species)}, ${escapeSQL(c.severity)})${comma}`
  })
  lines.push(...values)
  lines.push('ON CONFLICT (code) DO NOTHING;', '')
  return lines.join('\n')
}

function generateDrugDosagesSQL(dosages: DrugDosage[]): string {
  const lines = [
    '-- DRUG DOSAGES',
    'INSERT INTO public.drug_dosages (name, species, min_dose_mg_kg, max_dose_mg_kg, concentration_mg_ml, route, frequency, category, requires_prescription) VALUES',
  ]
  const values = dosages.map((d, i) => {
    const comma = i < dosages.length - 1 ? ',' : ''
    return `    (${escapeSQL(d.name)}, ${escapeSQL(d.species)}, ${d.min_dose_mg_kg}, ${d.max_dose_mg_kg}, ${d.concentration_mg_ml ?? 'NULL'}, ${escapeSQL(d.route)}, ${escapeSQL(d.frequency)}, ${escapeSQL(d.category)}, ${escapeSQL(d.requires_prescription ?? true)})${comma}`
  })
  lines.push(...values)
  lines.push('ON CONFLICT DO NOTHING;', '')
  return lines.join('\n')
}

function generateGrowthStandardsSQL(standards: GrowthStandard[]): string {
  const lines = [
    '-- GROWTH STANDARDS',
    'INSERT INTO public.growth_standards (species, breed_category, gender, age_weeks, weight_kg, percentile) VALUES',
  ]
  const values = standards.map((s, i) => {
    const comma = i < standards.length - 1 ? ',' : ''
    return `    (${escapeSQL(s.species ?? 'dog')}, ${escapeSQL(s.breed_category)}, ${escapeSQL(s.gender)}, ${s.age_weeks}, ${s.weight_kg}, ${escapeSQL(s.percentile ?? 'P50')})${comma}`
  })
  lines.push(...values)
  lines.push('ON CONFLICT DO NOTHING;', '')
  return lines.join('\n')
}

function generateLabTestsSQL(tests: LabTest[]): string {
  const lines = [
    '-- LAB TEST CATALOG',
    'INSERT INTO public.lab_test_catalog (tenant_id, code, name, category, sample_type, base_price, turnaround_days, requires_fasting, description) VALUES',
  ]
  const values = tests.map((t, i) => {
    const comma = i < tests.length - 1 ? ',' : ''
    return `    (NULL, ${escapeSQL(t.code)}, ${escapeSQL(t.name)}, ${escapeSQL(t.category)}, ${escapeSQL(t.sample_type ?? 'blood')}, ${t.base_price ?? 'NULL'}, ${t.turnaround_days ?? 1}, ${escapeSQL(t.requires_fasting ?? false)}, ${escapeSQL(t.description)})${comma}`
  })
  lines.push(...values)
  lines.push('ON CONFLICT DO NOTHING;', '')
  return lines.join('\n')
}

function generateInsuranceProvidersSQL(providers: InsuranceProvider[]): string {
  const lines = [
    '-- INSURANCE PROVIDERS',
    'INSERT INTO public.insurance_providers (name, code, country, phone, email, claims_email, website, coverage_types, direct_billing, is_active) VALUES',
  ]
  const values = providers.map((p, i) => {
    const comma = i < providers.length - 1 ? ',' : ''
    return `    (${escapeSQL(p.name)}, ${escapeSQL(p.code)}, ${escapeSQL(p.country ?? 'Paraguay')}, ${escapeSQL(p.phone)}, ${escapeSQL(p.email)}, ${escapeSQL(p.claims_email)}, ${escapeSQL(p.website)}, ${arrayToSQL(p.coverage_types)}, ${escapeSQL(p.direct_billing ?? false)}, ${escapeSQL(p.is_active ?? true)})${comma}`
  })
  lines.push(...values)
  lines.push('ON CONFLICT (code) DO NOTHING;', '')
  return lines.join('\n')
}

function generateVaccineProtocolsSQL(protocols: VaccineProtocol[]): string {
  const lines = [
    '-- VACCINE PROTOCOLS',
    'INSERT INTO public.vaccine_protocols (vaccine_name, vaccine_code, species, protocol_type, diseases_prevented, first_dose_weeks, booster_weeks, revaccination_months, notes) VALUES',
  ]
  const values = protocols.map((p, i) => {
    const comma = i < protocols.length - 1 ? ',' : ''
    return `    (${escapeSQL(p.vaccine_name)}, ${escapeSQL(p.vaccine_code)}, ${escapeSQL(p.species)}, ${escapeSQL(p.type ?? 'core')}, ${arrayToSQL(p.diseases_prevented)}, ${p.first_dose_weeks ?? 'NULL'}, ${arrayToSQL(p.booster_weeks)}, ${p.revaccination_months ?? 'NULL'}, ${escapeSQL(p.notes)})${comma}`
  })
  lines.push(...values)
  lines.push('ON CONFLICT DO NOTHING;', '')
  return lines.join('\n')
}

function generateServicesSQL(tenantId: string, services: Service[]): string {
  const lines = [
    `-- SERVICES (${tenantId})`,
    'INSERT INTO public.services (tenant_id, name, category, base_price, duration_minutes, description, is_active, display_order, color, available_days, available_start_time, available_end_time, requires_deposit, deposit_percentage, species) VALUES',
  ]
  const values = services.map((s, i) => {
    const comma = i < services.length - 1 ? ',' : ''
    return `    (${escapeSQL(tenantId)}, ${escapeSQL(s.name)}, ${escapeSQL(s.category)}, ${s.base_price}, ${s.duration_minutes}, ${escapeSQL(s.description)}, ${escapeSQL(s.is_active ?? true)}, ${s.display_order ?? 'NULL'}, ${escapeSQL(s.color)}, ${arrayToSQL(s.available_days)}, ${escapeSQL(s.available_start_time)}, ${escapeSQL(s.available_end_time)}, ${escapeSQL(s.requires_deposit ?? false)}, ${s.deposit_percentage ?? 'NULL'}, ${arrayToSQL(s.species)})${comma}`
  })
  lines.push(...values)
  lines.push('ON CONFLICT DO NOTHING;', '')
  return lines.join('\n')
}

function generatePaymentMethodsSQL(tenantId: string, methods: PaymentMethod[]): string {
  const lines = [
    `-- PAYMENT METHODS (${tenantId})`,
    'INSERT INTO public.payment_methods (tenant_id, name, type, is_default, display_order, fee_percentage, min_amount, max_amount, instructions, is_active) VALUES',
  ]
  const values = methods.map((m, i) => {
    const comma = i < methods.length - 1 ? ',' : ''
    return `    (${escapeSQL(tenantId)}, ${escapeSQL(m.name)}, ${escapeSQL(m.type)}, ${escapeSQL(m.is_default ?? false)}, ${m.display_order ?? 'NULL'}, ${m.fee_percentage ?? 0}, ${m.min_amount ?? 'NULL'}, ${m.max_amount ?? 'NULL'}, ${escapeSQL(m.instructions)}, ${escapeSQL(m.is_active ?? true)})${comma}`
  })
  lines.push(...values)
  lines.push('ON CONFLICT DO NOTHING;', '')
  return lines.join('\n')
}

function generateKennelsSQL(tenantId: string, kennels: Kennel[]): string {
  const lines = [
    `-- KENNELS (${tenantId})`,
    'INSERT INTO public.kennels (tenant_id, name, code, kennel_type, daily_rate, current_status, max_weight_kg, features, location) VALUES',
  ]
  const values = kennels.map((k, i) => {
    const comma = i < kennels.length - 1 ? ',' : ''
    return `    (${escapeSQL(tenantId)}, ${escapeSQL(k.name)}, ${escapeSQL(k.code)}, ${escapeSQL(k.kennel_type)}, ${k.daily_rate}, ${escapeSQL(k.current_status ?? 'available')}, ${k.max_weight_kg ?? 'NULL'}, ${arrayToSQL(k.features)}, ${escapeSQL(k.location)})${comma}`
  })
  lines.push(...values)
  lines.push('ON CONFLICT DO NOTHING;', '')
  return lines.join('\n')
}

function generateQrTagsSQL(tenantId: string, tags: QrTag[]): string {
  const lines = [
    `-- QR TAGS (${tenantId})`,
    'INSERT INTO public.qr_tags (tenant_id, code, is_active, is_registered, batch_id) VALUES',
  ]
  const values = tags.map((t, i) => {
    const comma = i < tags.length - 1 ? ',' : ''
    return `    (${escapeSQL(tenantId)}, ${escapeSQL(t.code)}, ${escapeSQL(t.is_active ?? true)}, ${escapeSQL(t.is_registered ?? false)}, ${escapeSQL(t.batch_id)})${comma}`
  })
  lines.push(...values)
  lines.push('ON CONFLICT (code) DO NOTHING;', '')
  return lines.join('\n')
}

function generateMessageTemplatesSQL(templates: MessageTemplate[]): string {
  const lines = [
    '-- MESSAGE TEMPLATES (global)',
    'INSERT INTO public.message_templates (tenant_id, code, name, category, subject, content, channels, variables, is_active) VALUES',
  ]
  const values = templates.map((t, i) => {
    const comma = i < templates.length - 1 ? ',' : ''
    return `    (NULL, ${escapeSQL(t.code)}, ${escapeSQL(t.name)}, ${escapeSQL(t.category)}, ${escapeSQL(t.subject)}, ${escapeSQL(t.content)}, ${arrayToSQL(t.channels)}, ${arrayToSQL(t.variables)}, ${escapeSQL(t.is_active ?? true)})${comma}`
  })
  lines.push(...values)
  lines.push('ON CONFLICT (code) WHERE tenant_id IS NULL DO NOTHING;', '')
  return lines.join('\n')
}

function generateConsentTemplatesSQL(templates: ConsentTemplate[]): string {
  const lines = [
    '-- CONSENT TEMPLATES (global)',
    'INSERT INTO public.consent_templates (tenant_id, code, name, category, title, content_html, requires_witness, validity_days, version) VALUES',
  ]
  const values = templates.map((t, i) => {
    const comma = i < templates.length - 1 ? ',' : ''
    const vd = t.validity_days === null ? 'NULL' : (t.validity_days ?? 'NULL')
    return `    (NULL, ${escapeSQL(t.code)}, ${escapeSQL(t.name)}, ${escapeSQL(t.category)}, ${escapeSQL(t.title)}, ${escapeSQL(t.content_html)}, ${escapeSQL(t.requires_witness ?? false)}, ${vd}, ${escapeSQL(t.version ?? '1.0')})${comma}`
  })
  lines.push(...values)
  lines.push('ON CONFLICT (code) WHERE tenant_id IS NULL DO NOTHING;', '')
  return lines.join('\n')
}

function generateTimeOffTypesSQL(types: TimeOffType[]): string {
  const lines = [
    '-- TIME OFF TYPES (global)',
    'INSERT INTO public.time_off_types (tenant_id, name, code, is_paid, max_days_per_year, requires_approval, requires_documentation, color) VALUES',
  ]
  const values = types.map((t, i) => {
    const comma = i < types.length - 1 ? ',' : ''
    const maxDays = t.max_days_per_year === null ? 'NULL' : (t.max_days_per_year ?? 'NULL')
    return `    (NULL, ${escapeSQL(t.name)}, ${escapeSQL(t.code)}, ${escapeSQL(t.is_paid ?? false)}, ${maxDays}, ${escapeSQL(t.requires_approval ?? true)}, ${escapeSQL(t.requires_documentation ?? false)}, ${escapeSQL(t.color)})${comma}`
  })
  lines.push(...values)
  lines.push('ON CONFLICT (code) WHERE tenant_id IS NULL DO NOTHING;', '')
  return lines.join('\n')
}

function generateBrandsSQL(brands: Brand[]): string {
  const lines: string[] = [
    '-- STORE BRANDS (GLOBAL CATALOG)',
    '-- Brands are inserted as global entries (tenant_id = NULL)',
    'INSERT INTO public.store_brands (tenant_id, slug, name, description, logo_url, website, country_origin, is_global_catalog, is_active) VALUES'
  ]
  const values = brands.map((b, i) => {
    const comma = i < brands.length - 1 ? ',' : ''
    return `    (NULL, ${escapeSQL(b.slug)}, ${escapeSQL(b.name)}, ${escapeSQL(b.description)}, ${escapeSQL(b.logo_url)}, ${escapeSQL(b.website)}, ${escapeSQL(b.country_origin)}, TRUE, TRUE)${comma}`
  })
  lines.push(...values)
  lines.push('ON CONFLICT (slug) WHERE tenant_id IS NULL DO NOTHING;', '')
  return lines.join('\n')
}

function generateCategoriesSQL(categories: Category[]): string {
  const lines: string[] = [
    '-- STORE CATEGORIES (GLOBAL CATALOG)',
    '-- Categories are inserted as global entries (tenant_id = NULL)'
  ]
  const flatCats: Array<Category & { parent_slug?: string }> = []
  const collectCats = (cats: Category[], parent: string | null) => {
    for (const c of cats) {
      flatCats.push({ ...c, parent_slug: parent ?? undefined })
      if (c.subcategories) collectCats(c.subcategories, c.slug)
    }
  }
  collectCats(categories, null)

  lines.push('INSERT INTO public.store_categories (tenant_id, slug, name, description, level, display_order, image_url, is_global_catalog, is_active) VALUES')
  const values = flatCats.map((c, i) => {
    const comma = i < flatCats.length - 1 ? ',' : ''
    return `    (NULL, ${escapeSQL(c.slug)}, ${escapeSQL(c.name)}, ${escapeSQL(c.description)}, ${c.level}, ${c.display_order}, ${escapeSQL(c.image_url)}, TRUE, TRUE)${comma}`
  })
  lines.push(...values)
  lines.push('ON CONFLICT (slug) WHERE tenant_id IS NULL DO NOTHING;', '')

  // Update parent references for hierarchical categories
  for (const c of flatCats) {
    if (c.parent_slug) {
      lines.push(`UPDATE public.store_categories SET parent_id = (SELECT id FROM public.store_categories WHERE slug = ${escapeSQL(c.parent_slug)} AND tenant_id IS NULL LIMIT 1) WHERE slug = ${escapeSQL(c.slug)} AND tenant_id IS NULL;`)
    }
  }
  lines.push('')
  return lines.join('\n')
}

function generateProductsSQL(productFiles: ProductFile[]): string {
  const lines: string[] = [
    '-- STORE PRODUCTS (GLOBAL CATALOG)',
    '-- Products are inserted as global entries (tenant_id = NULL)',
    '-- Clinics activate products via clinic_product_assignments table',
    'DO $$',
    'DECLARE v_brand_id UUID; v_category_id UUID;',
    'BEGIN'
  ]
  for (const file of productFiles) {
    lines.push(`    -- Brand: ${file.brand_slug}`)
    lines.push(`    SELECT id INTO v_brand_id FROM public.store_brands WHERE slug = ${escapeSQL(file.brand_slug)} AND tenant_id IS NULL LIMIT 1;`)
    for (const product of file.products) {
      lines.push(`    SELECT id INTO v_category_id FROM public.store_categories WHERE slug = ${escapeSQL(product.category_slug)} AND tenant_id IS NULL LIMIT 1;`)
      for (const v of product.variants) {
        const sku = `${product.sku}${v.sku_suffix}`
        const name = `${product.name} ${v.size}`
        lines.push(`    INSERT INTO public.store_products (tenant_id, brand_id, category_id, sku, name, description, base_price, cost_price, image_url, target_species, requires_prescription, attributes, is_global_catalog, is_active) VALUES (NULL, v_brand_id, v_category_id, ${escapeSQL(sku)}, ${escapeSQL(name)}, ${escapeSQL(product.description)}, ${v.base_price}, ${v.cost_price}, ${escapeSQL(product.image_url)}, ${arrayToSQL(product.target_species)}, ${escapeSQL(product.requires_prescription ?? false)}, ${jsonToSQL(product.attributes as Record<string, unknown>)}, TRUE, TRUE) ON CONFLICT (sku) WHERE tenant_id IS NULL DO NOTHING;`)
      }
    }
  }
  lines.push('END $$;', '')
  return lines.join('\n')
}

function generateTenantProductAssignmentsSQL(tenantId: string, assignments: TenantProductAssignment[]): string {
  const lines: string[] = [
    `-- CLINIC PRODUCT ASSIGNMENTS (${tenantId})`,
    `-- Links global catalog products to this clinic with custom pricing`,
    'DO $$',
    'DECLARE v_product_id UUID;',
    'BEGIN'
  ]
  for (const a of assignments) {
    const salePrice = a.sale_price ?? 0
    const minStock = a.min_stock_level ?? 5
    const location = a.location ?? null
    const initialStock = a.initial_stock ?? 0
    const rxOverride = a.requires_prescription

    lines.push(`    -- Product: ${a.sku}`)
    lines.push(`    SELECT id INTO v_product_id FROM public.store_products WHERE sku = ${escapeSQL(a.sku)} AND tenant_id IS NULL LIMIT 1;`)
    lines.push(`    IF v_product_id IS NOT NULL THEN`)
    lines.push(`        INSERT INTO public.clinic_product_assignments (tenant_id, catalog_product_id, sale_price, min_stock_level, location, requires_prescription, is_active) VALUES (${escapeSQL(tenantId)}, v_product_id, ${salePrice}, ${minStock}, ${escapeSQL(location)}, ${rxOverride !== undefined ? escapeSQL(rxOverride) : 'NULL'}, TRUE) ON CONFLICT (tenant_id, catalog_product_id) DO UPDATE SET sale_price = EXCLUDED.sale_price, min_stock_level = EXCLUDED.min_stock_level, location = EXCLUDED.location;`)
    if (initialStock > 0) {
      lines.push(`        INSERT INTO public.store_inventory (tenant_id, product_id, stock_quantity, min_stock_level, reorder_quantity) VALUES (${escapeSQL(tenantId)}, v_product_id, ${initialStock}, ${minStock}, ${minStock * 2}) ON CONFLICT (product_id) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;`)
    }
    lines.push(`    END IF;`)
  }
  lines.push('END $$;', '')
  return lines.join('\n')
}

function generateSuppliersSQL(suppliers: Supplier[]): string {
  const lines: string[] = ['-- SUPPLIERS']
  for (const tenantId of STORE_TENANTS) {
    lines.push(`-- Suppliers for tenant: ${tenantId}`)
    lines.push('INSERT INTO public.suppliers (tenant_id, name, legal_name, tax_id, contact_info, website, supplier_type, minimum_order_amount, payment_terms, delivery_time_days, verification_status, is_active) VALUES')
    const values = suppliers.map((s, i) => {
      const contactInfo = JSON.stringify({
        phone: s.phone,
        whatsapp: s.whatsapp,
        email: s.email,
        address: s.address,
        city: s.city,
        contact_person: s.contact_name,
        contact_position: s.contact_position,
        notes: s.notes,
        brands: s.brands,
      }).replace(/'/g, "''")
      const supplierType = s.type === 'Ambos' ? 'both' : (s.type === 'Servicios' ? 'services' : 'products')
      const comma = i < suppliers.length - 1 ? ',' : ''
      return `    (${escapeSQL(tenantId)}, ${escapeSQL(s.name)}, ${escapeSQL(s.legal_name)}, ${escapeSQL(s.ruc)}, '${contactInfo}'::JSONB, ${escapeSQL(s.website)}, ${escapeSQL(supplierType)}, ${s.min_order_gs ?? 'NULL'}, ${escapeSQL(s.payment_terms)}, ${s.delivery_days ?? 'NULL'}, ${s.verified ? "'verified'" : "'pending'"}, ${escapeSQL(s.active ?? true)})${comma}`
    })
    lines.push(...values)
    lines.push('ON CONFLICT DO NOTHING;', '')
  }
  return lines.join('\n')
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('-- =============================================================================')
  console.log('-- VETE SEED DATA (Generated from JSON v2)')
  console.log('-- Generated: ' + new Date().toISOString())
  console.log('-- =============================================================================')
  console.log('BEGIN;')
  console.log('')

  // 00-CORE
  const coreDir = join(DATA_DIR, '00-core')
  const tenantsData = loadJSON<{ tenants: Tenant[] }>(join(coreDir, 'tenants.json'))
  if (tenantsData?.tenants) console.log(generateTenantsSQL(tenantsData.tenants))

  const demoData = loadJSON<{ demo_accounts: DemoAccount[] }>(join(coreDir, 'demo-accounts.json'))
  if (demoData?.demo_accounts) console.log(generateDemoAccountsSQL(demoData.demo_accounts))

  // 01-REFERENCE
  const refDir = join(DATA_DIR, '01-reference')
  const diagnosisData = loadJSON<{ diagnosis_codes: DiagnosisCode[] }>(join(refDir, 'diagnosis-codes.json'))
  if (diagnosisData?.diagnosis_codes) console.log(generateDiagnosisCodesSQL(diagnosisData.diagnosis_codes))

  const drugsData = loadJSON<{ drug_dosages: DrugDosage[] }>(join(refDir, 'drug-dosages.json'))
  if (drugsData?.drug_dosages) console.log(generateDrugDosagesSQL(drugsData.drug_dosages))

  const growthData = loadJSON<{ growth_standards: GrowthStandard[] }>(join(refDir, 'growth-standards.json'))
  if (growthData?.growth_standards) console.log(generateGrowthStandardsSQL(growthData.growth_standards))

  const labData = loadJSON<{ lab_tests: LabTest[] }>(join(refDir, 'lab-tests.json'))
  if (labData?.lab_tests) console.log(generateLabTestsSQL(labData.lab_tests))

  const insuranceData = loadJSON<{ insurance_providers: InsuranceProvider[] }>(join(refDir, 'insurance-providers.json'))
  if (insuranceData?.insurance_providers) console.log(generateInsuranceProvidersSQL(insuranceData.insurance_providers))

  const vaccineData = loadJSON<{ vaccine_protocols: VaccineProtocol[] }>(join(refDir, 'vaccine-protocols.json'))
  if (vaccineData?.vaccine_protocols) console.log(generateVaccineProtocolsSQL(vaccineData.vaccine_protocols))

  // 02-CLINIC: Global templates
  const globalClinicDir = join(DATA_DIR, '02-clinic', '_global')
  const msgData = loadJSON<{ message_templates: MessageTemplate[] }>(join(globalClinicDir, 'message-templates.json'))
  if (msgData?.message_templates) console.log(generateMessageTemplatesSQL(msgData.message_templates))

  const consentData = loadJSON<{ consent_templates: ConsentTemplate[] }>(join(globalClinicDir, 'consent-templates.json'))
  if (consentData?.consent_templates) console.log(generateConsentTemplatesSQL(consentData.consent_templates))

  const timeOffData = loadJSON<{ time_off_types: TimeOffType[] }>(join(globalClinicDir, 'time-off-types.json'))
  if (timeOffData?.time_off_types) console.log(generateTimeOffTypesSQL(timeOffData.time_off_types))

  // 02-CLINIC: Per-tenant data
  const clinicDir = join(DATA_DIR, '02-clinic')
  const tenantDirs = listDirs(clinicDir).filter(d => !d.startsWith('_'))
  for (const tenantId of tenantDirs) {
    const tenantDir = join(clinicDir, tenantId)

    const servicesData = loadJSON<{ services: Service[] }>(join(tenantDir, 'services.json'))
    if (servicesData?.services) console.log(generateServicesSQL(tenantId, servicesData.services))

    const paymentData = loadJSON<{ payment_methods: PaymentMethod[] }>(join(tenantDir, 'payment-methods.json'))
    if (paymentData?.payment_methods) console.log(generatePaymentMethodsSQL(tenantId, paymentData.payment_methods))

    const kennelsData = loadJSON<{ kennels: Kennel[] }>(join(tenantDir, 'kennels.json'))
    if (kennelsData?.kennels) console.log(generateKennelsSQL(tenantId, kennelsData.kennels))

    const qrData = loadJSON<{ qr_tags: QrTag[] }>(join(tenantDir, 'qr-tags.json'))
    if (qrData?.qr_tags) console.log(generateQrTagsSQL(tenantId, qrData.qr_tags))
  }

  // 03-STORE
  const storeDir = join(DATA_DIR, '03-store')
  const brandsData = loadJSON<{ brands: Brand[] }>(join(storeDir, 'brands.json'))
  if (brandsData?.brands) console.log(generateBrandsSQL(brandsData.brands))

  const categoriesData = loadJSON<{ categories: Category[] }>(join(storeDir, 'categories.json'))
  if (categoriesData?.categories) console.log(generateCategoriesSQL(categoriesData.categories))

  // Products
  const productsDir = join(storeDir, 'products')
  if (existsSync(productsDir)) {
    const productFiles: ProductFile[] = []
    const files = listJsonFiles(productsDir).filter(f => f.startsWith('products-'))
    for (const file of files) {
      const data = loadJSON<ProductFile>(join(productsDir, file))
      if (data?.products) productFiles.push(data)
    }
    if (productFiles.length > 0) console.log(generateProductsSQL(productFiles))
  }

  // Suppliers
  const suppliersData = loadJSON<{ suppliers: Supplier[] }>(join(storeDir, 'suppliers.json'))
  if (suppliersData?.suppliers) console.log(generateSuppliersSQL(suppliersData.suppliers))

  console.log('COMMIT;')
  console.log('-- =============================================================================')
  console.log('-- END OF GENERATED SQL')
  console.log('-- =============================================================================')
}

main().catch(console.error)
