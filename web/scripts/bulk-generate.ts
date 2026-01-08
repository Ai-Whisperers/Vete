#!/usr/bin/env npx tsx
/**
 * Bulk Clinic Generation Script
 *
 * Generates pre-built clinic websites from scraped data (Google Maps, Instagram).
 * Part of the "Your website is already live" outreach strategy.
 *
 * Usage:
 *   npx tsx scripts/bulk-generate.ts --source=leads.csv [--output=.content_data] [--db]
 *
 * Options:
 *   --source    CSV file with clinic leads (required)
 *   --output    Output directory (default: .content_data)
 *   --db        Also create tenant records in Supabase
 *   --dry-run   Preview without writing files
 *
 * CSV Format:
 *   name,phone,address,zone,clinic_type,google_rating,instagram_handle
 *   "Veterinaria ABC","+595981123456","Av. España 123, Asunción","Villa Morra","general","4.5","@vetabc"
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs'
import { join, dirname } from 'path'
import { parse } from 'csv-parse/sync'
import { createClient } from '@supabase/supabase-js'

// Types
interface ClinicLead {
  name: string
  phone: string
  address: string
  zone: string
  clinic_type: 'general' | 'emergency' | 'specialist' | 'grooming' | 'rural'
  google_rating?: string
  instagram_handle?: string
  email?: string
  whatsapp?: string
}

interface GeneratedClinic {
  slug: string
  lead: ClinicLead
  files: Record<string, object>
}

// Theme presets by clinic type
const THEME_PRESETS: Record<string, object> = {
  general: {
    primary: '#2F5233', // Forest green
    secondary: '#F0C808', // Gold
    gradient_start: '#2F5233',
    gradient_end: '#4A7C59',
  },
  emergency: {
    primary: '#DC2626', // Red
    secondary: '#FFFFFF',
    gradient_start: '#DC2626',
    gradient_end: '#EF4444',
  },
  specialist: {
    primary: '#1E40AF', // Blue
    secondary: '#94A3B8', // Silver
    gradient_start: '#1E40AF',
    gradient_end: '#3B82F6',
  },
  grooming: {
    primary: '#DB2777', // Pink
    secondary: '#A855F7', // Purple
    gradient_start: '#DB2777',
    gradient_end: '#A855F7',
  },
  rural: {
    primary: '#78350F', // Brown
    secondary: '#22C55E', // Green
    gradient_start: '#78350F',
    gradient_end: '#A16207',
  },
}

// Service templates by clinic type
const SERVICE_TEMPLATES: Record<string, object[]> = {
  general: [
    { name: 'Consulta General', price: 100000, duration: 30, description: 'Evaluación completa de salud' },
    { name: 'Vacunación', price: 150000, duration: 20, description: 'Vacunas certificadas SENACSA' },
    { name: 'Desparasitación', price: 80000, duration: 15, description: 'Control de parásitos internos y externos' },
    { name: 'Cirugía Menor', price: 300000, duration: 60, description: 'Procedimientos quirúrgicos menores' },
    { name: 'Castración', price: 400000, duration: 45, description: 'Esterilización canina y felina' },
    { name: 'Baño y Peluquería', price: 80000, duration: 60, description: 'Servicio de grooming completo' },
    { name: 'Radiografía', price: 200000, duration: 30, description: 'Diagnóstico por imagen' },
    { name: 'Laboratorio', price: 150000, duration: 20, description: 'Análisis de sangre y orina' },
  ],
  emergency: [
    { name: 'Urgencia 24hs', price: 250000, duration: 30, description: 'Atención de emergencia' },
    { name: 'Internación', price: 150000, duration: 1440, description: 'Hospitalización por día' },
    { name: 'Cirugía de Emergencia', price: 800000, duration: 120, description: 'Intervención quirúrgica urgente' },
    { name: 'Consulta General', price: 100000, duration: 30, description: 'Evaluación completa de salud' },
    { name: 'Vacunación', price: 150000, duration: 20, description: 'Vacunas certificadas' },
  ],
  specialist: [
    { name: 'Ecografía Doppler', price: 350000, duration: 45, description: 'Diagnóstico por ultrasonido avanzado' },
    { name: 'Radiología Digital', price: 200000, duration: 30, description: 'Rayos X de alta definición' },
    { name: 'Ecocardiografía', price: 400000, duration: 60, description: 'Evaluación cardíaca especializada' },
    { name: 'Laboratorio In-House', price: 150000, duration: 30, description: 'Resultados en 30 minutos' },
    { name: 'Segunda Opinión', price: 200000, duration: 45, description: 'Consulta especializada' },
  ],
  grooming: [
    { name: 'Baño Completo', price: 80000, duration: 60, description: 'Baño, secado y cepillado' },
    { name: 'Corte de Pelo', price: 120000, duration: 90, description: 'Corte profesional a medida' },
    { name: 'Spa Premium', price: 200000, duration: 120, description: 'Tratamiento completo de belleza' },
    { name: 'Corte de Uñas', price: 30000, duration: 15, description: 'Corte y limado de uñas' },
    { name: 'Limpieza de Oídos', price: 40000, duration: 15, description: 'Higiene auricular' },
    { name: 'Consulta Veterinaria', price: 100000, duration: 30, description: 'Chequeo de salud básico' },
  ],
  rural: [
    { name: 'Consulta a Domicilio', price: 200000, duration: 60, description: 'Visita a campo' },
    { name: 'Vacunación Bovinos', price: 50000, duration: 10, description: 'Por cabeza' },
    { name: 'Cirugía de Campo', price: 500000, duration: 120, description: 'Intervenciones en el lugar' },
    { name: 'Ecografía Reproductiva', price: 150000, duration: 30, description: 'Diagnóstico de preñez' },
    { name: 'Atención Equinos', price: 250000, duration: 60, description: 'Consulta especializada' },
  ],
}

// Hero templates by clinic type
const HERO_TEMPLATES: Record<string, { headline: string; subhead: string }> = {
  general: {
    headline: 'Cuidado Completo para tu Mascota',
    subhead: 'Atención veterinaria profesional con el cariño que tu mascota merece.',
  },
  emergency: {
    headline: '24 Horas a tu Lado',
    subhead: 'Emergencias veterinarias atendidas las 24 horas, los 7 días de la semana.',
  },
  specialist: {
    headline: 'Tecnología Avanzada en Diagnóstico',
    subhead: 'Centro de referencia en diagnóstico por imagen y estudios especializados.',
  },
  grooming: {
    headline: 'Belleza y Salud para tu Mascota',
    subhead: 'Servicios de spa y peluquería con productos de primera calidad.',
  },
  rural: {
    headline: 'Veterinaria Rural Profesional',
    subhead: 'Atención especializada para grandes animales en tu campo.',
  },
}

// Helper: Generate slug from name
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50)
}

// Helper: Format phone for WhatsApp
function formatWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('595')) {
    return digits
  }
  if (digits.startsWith('0')) {
    return '595' + digits.slice(1)
  }
  return '595' + digits
}

// Generate config.json for a clinic
function generateConfig(lead: ClinicLead, slug: string): object {
  const whatsapp = lead.whatsapp || formatWhatsApp(lead.phone)

  return {
    id: slug,
    name: lead.name,
    contact: {
      whatsapp_number: whatsapp,
      phone_display: lead.phone,
      email: lead.email || `contacto@${slug}.vetic.com`,
      address: lead.address,
      google_maps_id: '', // To be filled later
    },
    settings: {
      currency: 'PYG',
      emergency_24h: lead.clinic_type === 'emergency',
      modules: {
        toxic_checker: true,
        age_calculator: true,
      },
      inventory_template_google_sheet_url: null,
    },
    branding: {
      logo_url: '',
      logo_width: 150,
      logo_height: 40,
      favicon_url: '/favicon.ico',
      hero_image_url: '',
      og_image_url: '',
    },
    ui_labels: {
      nav: {
        home: 'Inicio',
        services: 'Servicios',
        about: 'Nosotros',
        book_btn: 'Agendar',
      },
      footer: {
        rights: 'Todos los derechos reservados.',
      },
      home: {
        visit_us: 'Visítanos',
      },
      services: {
        online_badge: 'Reservable Online',
        description_label: 'Descripción:',
        includes_label: 'Incluye:',
        table_variant: 'Variante / Tipo',
        table_price: 'Precio',
        book_floating_btn: 'Agendar Turno',
      },
      about: {
        team_title: 'Nuestro Equipo',
      },
    },
  }
}

// Generate home.json for a clinic
function generateHome(lead: ClinicLead, slug: string): object {
  const heroTemplate = HERO_TEMPLATES[lead.clinic_type] || HERO_TEMPLATES.general

  return {
    hero: {
      headline: `Bienvenido a ${lead.name}`,
      subhead: `Tu veterinaria de confianza en ${lead.zone}. ${heroTemplate.subhead}`,
      cta_primary: 'Agendar Cita',
      cta_secondary: 'Ver Servicios',
    },
    features: [
      {
        icon: 'heart-pulse',
        title: 'Atención Profesional',
        text: 'Equipo veterinario capacitado',
      },
      {
        icon: 'shield-check',
        title: 'Vacunas Certificadas',
        text: 'Certificación SENACSA',
      },
      {
        icon: 'clock',
        title: lead.clinic_type === 'emergency' ? 'Urgencias 24hs' : 'Horario Flexible',
        text: lead.clinic_type === 'emergency' ? 'Atendemos emergencias' : 'Turnos en horarios convenientes',
      },
    ],
    promo_banner: {
      enabled: true,
      text: '¡Primeras 2 consultas con 20% de descuento!',
      link: '#services',
    },
    interactive_tools_section: {
      title: 'Herramientas Útiles',
      subtitle: 'Recursos para cuidar a tu mascota',
      toxic_food_cta: 'Verificar Toxicidad',
      age_calc_cta: 'Calcular Edad',
    },
    testimonials_section: {
      enabled: false, // No testimonials yet for pre-generated
      title: 'Testimonios',
      subtitle: 'Lo que dicen nuestros clientes.',
    },
    seo: {
      meta_title: `${lead.name} | Veterinaria en ${lead.zone}, Paraguay`,
      meta_description: `${lead.name} - ${heroTemplate.subhead} Ubicados en ${lead.address}. Reservá tu turno online.`,
    },
  }
}

// Generate services.json for a clinic
function generateServices(lead: ClinicLead): object {
  const services = SERVICE_TEMPLATES[lead.clinic_type] || SERVICE_TEMPLATES.general

  return {
    categories: [
      {
        id: 'all',
        name: 'Todos los Servicios',
        services: services.map((s: any, i: number) => ({
          id: `service-${i + 1}`,
          ...s,
          bookable_online: true,
          category: 'general',
        })),
      },
    ],
    page: {
      title: 'Nuestros Servicios',
      subtitle: 'Atención integral para tu mascota',
    },
  }
}

// Generate theme.json for a clinic
function generateTheme(lead: ClinicLead): object {
  const preset = THEME_PRESETS[lead.clinic_type] || THEME_PRESETS.general

  return {
    colors: {
      primary: (preset as any).primary,
      secondary: (preset as any).secondary,
      accent: (preset as any).secondary,
      background: '#FFFFFF',
      text: {
        primary: '#1F2937',
        secondary: '#6B7280',
        muted: '#9CA3AF',
      },
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    gradients: {
      hero: `linear-gradient(135deg, ${(preset as any).gradient_start} 0%, ${(preset as any).gradient_end} 100%)`,
    },
    fonts: {
      heading: 'Montserrat',
      body: 'Inter',
      weights: {
        heading: 700,
        body: 400,
      },
    },
    borderRadius: {
      small: '4px',
      medium: '8px',
      large: '16px',
      full: '9999px',
    },
    shadows: {
      small: '0 1px 2px rgba(0, 0, 0, 0.05)',
      medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
      large: '0 10px 15px rgba(0, 0, 0, 0.1)',
    },
  }
}

// Generate about.json for a clinic
function generateAbout(lead: ClinicLead): object {
  return {
    page: {
      title: 'Sobre Nosotros',
      subtitle: `Conocé más sobre ${lead.name}`,
    },
    story: {
      title: 'Nuestra Historia',
      content: `${lead.name} es una veterinaria ubicada en ${lead.zone}, dedicada a brindar atención de calidad a las mascotas de la comunidad.`,
    },
    team: [],
    values: [
      {
        icon: 'heart',
        title: 'Amor por los Animales',
        description: 'Tratamos a cada mascota como si fuera nuestra.',
      },
      {
        icon: 'award',
        title: 'Profesionalismo',
        description: 'Equipo capacitado y actualizado.',
      },
      {
        icon: 'users',
        title: 'Cercanía',
        description: 'Atención personalizada y cálida.',
      },
    ],
  }
}

// Generate all files for a clinic
function generateClinic(lead: ClinicLead): GeneratedClinic {
  const slug = slugify(lead.name)

  return {
    slug,
    lead,
    files: {
      'config.json': generateConfig(lead, slug),
      'home.json': generateHome(lead, slug),
      'services.json': generateServices(lead),
      'theme.json': generateTheme(lead),
      'about.json': generateAbout(lead),
      'testimonials.json': { testimonials: [] },
      'faq.json': {
        faqs: [
          {
            question: '¿Cuáles son los horarios de atención?',
            answer: 'Atendemos de lunes a viernes de 8:00 a 18:00 y sábados de 8:00 a 13:00.',
          },
          {
            question: '¿Aceptan emergencias?',
            answer: lead.clinic_type === 'emergency' ? 'Sí, atendemos emergencias las 24 horas.' : 'Sí, contactanos por WhatsApp para emergencias.',
          },
          {
            question: '¿Qué métodos de pago aceptan?',
            answer: 'Aceptamos efectivo, tarjetas de débito/crédito y transferencias bancarias.',
          },
        ],
      },
      'legal.json': {
        privacy_url: '/privacy',
        terms_url: '/terms',
      },
    },
  }
}

// Write clinic files to disk
function writeClinicFiles(clinic: GeneratedClinic, outputDir: string): void {
  const clinicDir = join(outputDir, clinic.slug)

  // Create directory
  mkdirSync(clinicDir, { recursive: true })

  // Write each file
  for (const [filename, content] of Object.entries(clinic.files)) {
    const filepath = join(clinicDir, filename)
    writeFileSync(filepath, JSON.stringify(content, null, 2))
  }

  // Copy static files from template
  const templateDir = join(outputDir, '_TEMPLATE')
  const staticFiles = ['images.json', 'showcase.json']

  for (const file of staticFiles) {
    const src = join(templateDir, file)
    const dest = join(clinicDir, file)
    if (existsSync(src)) {
      copyFileSync(src, dest)
    }
  }

  console.log(`✓ Generated: ${clinic.slug} (${clinic.lead.clinic_type})`)
}

// Create tenant record in Supabase
async function createTenantRecord(
  clinic: GeneratedClinic,
  supabase: ReturnType<typeof createClient>
): Promise<void> {
  const { error } = await supabase.from('tenants').upsert({
    id: clinic.slug,
    name: clinic.lead.name,
    phone: clinic.lead.phone,
    whatsapp: clinic.lead.whatsapp || formatWhatsApp(clinic.lead.phone),
    email: clinic.lead.email || `contacto@${clinic.slug}.vetic.com`,
    address: clinic.lead.address,
    city: 'Asunción',
    country: 'Paraguay',
    status: 'pregenerated',
    is_pregenerated: true,
    clinic_type: clinic.lead.clinic_type,
    zone: clinic.lead.zone,
    google_rating: clinic.lead.google_rating,
    instagram_handle: clinic.lead.instagram_handle,
    scraped_data: {
      source: 'bulk-generate',
      generated_at: new Date().toISOString(),
      original_data: clinic.lead,
    },
    plan: 'free',
    is_active: true,
  }, {
    onConflict: 'id',
  })

  if (error) {
    console.error(`✗ Database error for ${clinic.slug}: ${error.message}`)
  } else {
    console.log(`✓ Database: ${clinic.slug}`)
  }
}

// Parse CLI arguments
function parseArgs(): { source: string; output: string; db: boolean; dryRun: boolean } {
  const args = process.argv.slice(2)
  let source = ''
  let output = '.content_data'
  let db = false
  let dryRun = false

  for (const arg of args) {
    if (arg.startsWith('--source=')) {
      source = arg.split('=')[1]
    } else if (arg.startsWith('--output=')) {
      output = arg.split('=')[1]
    } else if (arg === '--db') {
      db = true
    } else if (arg === '--dry-run') {
      dryRun = true
    }
  }

  if (!source) {
    console.error('Error: --source=<file.csv> is required')
    console.log('\nUsage: npx tsx scripts/bulk-generate.ts --source=leads.csv [--output=.content_data] [--db] [--dry-run]')
    console.log('\nCSV Format:')
    console.log('  name,phone,address,zone,clinic_type,google_rating,instagram_handle')
    process.exit(1)
  }

  return { source, output, db, dryRun }
}

// Main function
async function main(): Promise<void> {
  console.log('🏥 Vetic Bulk Clinic Generator')
  console.log('================================\n')

  const { source, output, db, dryRun } = parseArgs()

  // Read CSV
  console.log(`📂 Reading: ${source}`)
  const csvContent = readFileSync(source, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as ClinicLead[]

  console.log(`📊 Found ${records.length} clinics\n`)

  // Validate clinic types
  const validTypes = ['general', 'emergency', 'specialist', 'grooming', 'rural']
  for (const record of records) {
    if (!validTypes.includes(record.clinic_type)) {
      record.clinic_type = 'general'
    }
  }

  // Initialize Supabase if needed
  let supabase: ReturnType<typeof createClient> | null = null
  if (db && !dryRun) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️  Supabase credentials not found. Skipping database creation.')
    } else {
      supabase = createClient(supabaseUrl, supabaseKey)
      console.log('🔌 Connected to Supabase\n')
    }
  }

  // Generate clinics
  const clinics: GeneratedClinic[] = []
  for (const record of records) {
    const clinic = generateClinic(record)
    clinics.push(clinic)

    if (!dryRun) {
      writeClinicFiles(clinic, output)

      if (supabase) {
        await createTenantRecord(clinic, supabase)
      }
    } else {
      console.log(`[DRY-RUN] Would generate: ${clinic.slug}`)
    }
  }

  // Summary
  console.log('\n================================')
  console.log(`✅ Generated ${clinics.length} clinics`)

  if (dryRun) {
    console.log('\n⚠️  Dry run - no files were written')
  } else {
    console.log(`📁 Output: ${output}`)
    if (supabase) {
      console.log('🗄️  Database records created')
    }
  }

  // Output list of slugs for outreach
  console.log('\n📋 Generated slugs:')
  for (const clinic of clinics) {
    console.log(`   vetic.com/${clinic.slug}`)
  }
}

main().catch(console.error)
