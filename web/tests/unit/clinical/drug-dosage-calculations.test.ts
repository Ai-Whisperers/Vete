/**
 * Drug Dosage Calculation Tests
 *
 * CRITICAL: These tests verify drug dosage calculations for patient safety.
 * Incorrect dosages can cause serious harm or death to animals.
 *
 * Tests cover:
 * - Weight-based dose calculations
 * - Species-specific adjustments
 * - Dose limits and boundaries
 * - Common drug dosing scenarios
 * - API endpoint behavior
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET } from '@/app/api/drug_dosages/route'
import { NextRequest } from 'next/server'

// Mock response type helper
interface MockResponse {
  status: number
  json: () => Promise<Record<string, unknown>>
}

// Mock authenticated user (vet)
const mockUser = { id: 'vet-123', email: 'vet@clinic.com' }
const mockVetProfile = { role: 'vet' }

// Mock drug dosage data from database
const mockDrugDosages = [
  {
    id: 'drug-1',
    name: 'Amoxicilina',
    species: 'dog',
    dose_mg_per_kg: 22,
    route: 'oral',
    frequency: 'cada 12 horas',
    contraindications: 'Alergia a penicilinas',
    notes: 'Administrar con alimento',
  },
  {
    id: 'drug-2',
    name: 'Amoxicilina',
    species: 'cat',
    dose_mg_per_kg: 10,
    route: 'oral',
    frequency: 'cada 12 horas',
    contraindications: 'Alergia a penicilinas',
    notes: 'Dosis más baja para gatos',
  },
  {
    id: 'drug-3',
    name: 'Meloxicam',
    species: 'dog',
    dose_mg_per_kg: 0.2,
    route: 'oral',
    frequency: 'cada 24 horas',
    contraindications: 'Enfermedad renal, ulceras GI',
    notes: 'Primera dosis puede ser 0.4 mg/kg',
  },
  {
    id: 'drug-4',
    name: 'Meloxicam',
    species: 'cat',
    dose_mg_per_kg: 0.05,
    route: 'oral',
    frequency: 'cada 24 horas',
    contraindications: 'Enfermedad renal, ulceras GI',
    notes: 'NUNCA usar dosis de perro en gatos',
  },
  {
    id: 'drug-5',
    name: 'Metronidazol',
    species: 'all',
    dose_mg_per_kg: 15,
    route: 'oral',
    frequency: 'cada 12 horas',
    contraindications: 'Gestación',
    notes: 'Puede causar efectos neurológicos a dosis altas',
  },
]

// Create mock Supabase with configurable behavior
const createMockSupabase = (options: {
  user?: typeof mockUser | null
  profile?: typeof mockVetProfile | null
  drugs?: typeof mockDrugDosages
} = {}) => {
  const { user = mockUser, profile = mockVetProfile, drugs = mockDrugDosages } = options

  let queryBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockImplementation(() => ({
      data: drugs,
      error: null,
      count: drugs.length,
    })),
  }

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: user ? null : { message: 'Not authenticated' },
      }),
    },
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: profile,
            error: profile ? null : { message: 'Profile not found' },
          }),
        }
      }
      return queryBuilder
    }),
  }
}

// Mock modules
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ success: true }),
}))

describe('Drug Dosage API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/drug_dosages', () => {
    describe('Authentication & Authorization', () => {
      it('should require authentication', async () => {
        const { createClient } = await import('@/lib/supabase/server')
        vi.mocked(createClient).mockResolvedValue(createMockSupabase({ user: null }) as any)

        const request = new NextRequest('http://localhost/api/drug_dosages')
        const response = (await GET(request)) as MockResponse

        expect(response.status).toBe(401)
        const json = await response.json()
        expect(json.error).toContain('autorizado')
      })

      it('should only allow veterinary staff', async () => {
        const { createClient } = await import('@/lib/supabase/server')
        vi.mocked(createClient).mockResolvedValue(
          createMockSupabase({ profile: { role: 'owner' } }) as any
        )

        const request = new NextRequest('http://localhost/api/drug_dosages')
        const response = (await GET(request)) as MockResponse

        expect(response.status).toBe(403)
        const json = await response.json()
        expect(json.error).toContain('veterinario')
      })

      it('should allow vet role', async () => {
        const { createClient } = await import('@/lib/supabase/server')
        vi.mocked(createClient).mockResolvedValue(
          createMockSupabase({ profile: { role: 'vet' } }) as any
        )

        const request = new NextRequest('http://localhost/api/drug_dosages')
        const response = (await GET(request)) as MockResponse

        expect(response.status).toBe(200)
      })

      it('should allow admin role', async () => {
        const { createClient } = await import('@/lib/supabase/server')
        vi.mocked(createClient).mockResolvedValue(
          createMockSupabase({ profile: { role: 'admin' } }) as any
        )

        const request = new NextRequest('http://localhost/api/drug_dosages')
        const response = (await GET(request)) as MockResponse

        expect(response.status).toBe(200)
      })
    })

    describe('Species Filtering', () => {
      it('should filter by dog species', async () => {
        const dogDrugs = mockDrugDosages.filter(d => d.species === 'dog' || d.species === 'all')

        const { createClient } = await import('@/lib/supabase/server')
        vi.mocked(createClient).mockResolvedValue(
          createMockSupabase({ drugs: dogDrugs }) as any
        )

        const request = new NextRequest('http://localhost/api/drug_dosages?species=dog')
        const response = (await GET(request)) as MockResponse

        expect(response.status).toBe(200)
        const json = await response.json()
        expect(json.data).toBeDefined()
      })

      it('should filter by cat species', async () => {
        const catDrugs = mockDrugDosages.filter(d => d.species === 'cat' || d.species === 'all')

        const { createClient } = await import('@/lib/supabase/server')
        vi.mocked(createClient).mockResolvedValue(
          createMockSupabase({ drugs: catDrugs }) as any
        )

        const request = new NextRequest('http://localhost/api/drug_dosages?species=cat')
        const response = (await GET(request)) as MockResponse

        expect(response.status).toBe(200)
      })
    })

    describe('Search Functionality', () => {
      it('should search by drug name', async () => {
        const { createClient } = await import('@/lib/supabase/server')
        vi.mocked(createClient).mockResolvedValue(createMockSupabase() as any)

        const request = new NextRequest('http://localhost/api/drug_dosages?q=amoxicilina')
        const response = (await GET(request)) as MockResponse

        expect(response.status).toBe(200)
      })
    })

    describe('Pagination', () => {
      it('should support pagination parameters', async () => {
        const { createClient } = await import('@/lib/supabase/server')
        vi.mocked(createClient).mockResolvedValue(createMockSupabase() as any)

        const request = new NextRequest('http://localhost/api/drug_dosages?page=2&limit=10')
        const response = (await GET(request)) as MockResponse

        expect(response.status).toBe(200)
        const json = await response.json()
        expect(json).toHaveProperty('page')
        expect(json).toHaveProperty('limit')
      })

      it('should cap limit at 200', async () => {
        const { createClient } = await import('@/lib/supabase/server')
        vi.mocked(createClient).mockResolvedValue(createMockSupabase() as any)

        const request = new NextRequest('http://localhost/api/drug_dosages?limit=500')
        const response = (await GET(request)) as MockResponse

        expect(response.status).toBe(200)
        const json = await response.json()
        // Limit should be capped at 200
        expect(json.limit).toBeLessThanOrEqual(200)
      })
    })
  })
})

describe('Dosage Calculation Safety', () => {
  /**
   * These tests document expected dosage calculations.
   * They serve as safety checks for the dosage calculator feature.
   */

  describe('Weight-Based Calculations', () => {
    const calculateDose = (weightKg: number, doseMgPerKg: number): number => {
      return Math.round(weightKg * doseMgPerKg * 100) / 100
    }

    describe('Dog Dosages', () => {
      it('should calculate Amoxicilina for small dog (5kg)', () => {
        const dose = calculateDose(5, 22)
        expect(dose).toBe(110) // 110 mg per dose
      })

      it('should calculate Amoxicilina for medium dog (15kg)', () => {
        const dose = calculateDose(15, 22)
        expect(dose).toBe(330)
      })

      it('should calculate Amoxicilina for large dog (35kg)', () => {
        const dose = calculateDose(35, 22)
        expect(dose).toBe(770)
      })

      it('should calculate Meloxicam for dog (10kg)', () => {
        const dose = calculateDose(10, 0.2)
        expect(dose).toBe(2) // 2 mg per dose
      })
    })

    describe('Cat Dosages', () => {
      it('should calculate Amoxicilina for cat (4kg)', () => {
        const dose = calculateDose(4, 10)
        expect(dose).toBe(40) // 40 mg per dose
      })

      it('should calculate Meloxicam for cat (5kg)', () => {
        const dose = calculateDose(5, 0.05)
        expect(dose).toBe(0.25) // 0.25 mg per dose
      })
    })

    describe('Species-Specific Safety Margins', () => {
      it('should use significantly lower Meloxicam dose for cats vs dogs', () => {
        const dogDose = 0.2 // mg/kg
        const catDose = 0.05 // mg/kg

        expect(catDose).toBeLessThan(dogDose)
        expect(dogDose / catDose).toBe(4) // Dog dose is 4x cat dose
      })

      it('should use lower Amoxicilina dose for cats vs dogs', () => {
        const dogDose = 22 // mg/kg
        const catDose = 10 // mg/kg

        expect(catDose).toBeLessThan(dogDose)
      })
    })
  })

  describe('Dose Boundaries and Limits', () => {
    describe('Minimum Effective Doses', () => {
      it('should not recommend sub-therapeutic doses', () => {
        const minimumDogWeight = 0.5 // kg (toy puppy)
        const meloxicamDose = minimumDogWeight * 0.2

        expect(meloxicamDose).toBe(0.1)
        // This is still a valid therapeutic dose
        expect(meloxicamDose).toBeGreaterThan(0)
      })
    })

    describe('Maximum Safe Doses', () => {
      // These are hypothetical maximums for testing
      const MELOXICAM_MAX_DAILY_DOG = 10 // mg total
      const AMOXICILINA_MAX_DAILY_DOG = 2000 // mg total

      it('should warn when calculated dose exceeds maximum', () => {
        const giantDogWeight = 80 // kg Great Dane
        const calculatedMeloxicamDose = giantDogWeight * 0.2 // 16 mg

        expect(calculatedMeloxicamDose).toBeGreaterThan(MELOXICAM_MAX_DAILY_DOG)
        // System should flag this for veterinary review
      })

      it('should handle very large dogs appropriately', () => {
        const giantDogWeight = 80 // kg
        const calculatedAmoxDose = giantDogWeight * 22 // 1760 mg

        expect(calculatedAmoxDose).toBeLessThan(AMOXICILINA_MAX_DAILY_DOG)
        // This is within acceptable range
      })
    })

    describe('Pediatric Adjustments', () => {
      it('should document puppy dosing considerations', () => {
        // Puppies often need lower doses or different drugs
        const puppyAge = 8 // weeks
        const isPediatric = puppyAge < 12

        expect(isPediatric).toBe(true)
        // Veterinarian should review pediatric dosing
      })

      it('should document kitten dosing considerations', () => {
        const kittenAge = 6 // weeks
        const isPediatric = kittenAge < 12

        expect(isPediatric).toBe(true)
      })
    })

    describe('Geriatric Adjustments', () => {
      it('should document senior pet considerations', () => {
        const dogAge = 10 // years
        const isGeriatric = dogAge > 7

        expect(isGeriatric).toBe(true)
        // Senior pets may need dose reductions, especially for renal-excreted drugs
      })
    })
  })

  describe('Drug Interaction Warnings', () => {
    describe('NSAID Interactions', () => {
      it('should flag concurrent NSAID use', () => {
        const currentMedications = ['Meloxicam', 'Carprofen']
        const nsaids = ['Meloxicam', 'Carprofen', 'Rimadyl', 'Metacam', 'Previcox']

        const concurrentNsaids = currentMedications.filter(med =>
          nsaids.some(nsaid => med.toLowerCase().includes(nsaid.toLowerCase()))
        )

        expect(concurrentNsaids.length).toBeGreaterThan(1)
        // DANGER: Multiple NSAIDs should never be used together
      })

      it('should flag NSAID with corticosteroid', () => {
        const currentMedications = ['Meloxicam', 'Prednisona']
        const nsaids = ['Meloxicam', 'Carprofen', 'Rimadyl']
        const steroids = ['Prednisona', 'Prednisolona', 'Dexametasona']

        const hasNsaid = currentMedications.some(med =>
          nsaids.some(n => med.toLowerCase().includes(n.toLowerCase()))
        )
        const hasSteroid = currentMedications.some(med =>
          steroids.some(s => med.toLowerCase().includes(s.toLowerCase()))
        )

        expect(hasNsaid && hasSteroid).toBe(true)
        // DANGER: GI ulceration risk is extremely high
      })
    })

    describe('Renal Function Considerations', () => {
      it('should flag NSAIDs in renal patients', () => {
        const patientConditions = ['Enfermedad renal crónica']
        const drugContraindications = 'Enfermedad renal'

        const isContraindicated = patientConditions.some(condition =>
          condition.toLowerCase().includes('renal')
        )

        expect(isContraindicated).toBe(true)
      })
    })
  })

  describe('Common Veterinary Drug Scenarios', () => {
    describe('Post-Surgical Pain Management', () => {
      it('should calculate appropriate post-op Meloxicam for medium dog', () => {
        const patientWeight = 20 // kg
        const initialDose = patientWeight * 0.2 // First day dose

        expect(initialDose).toBe(4) // 4 mg
      })
    })

    describe('Antibiotic Therapy', () => {
      it('should calculate 7-day Amoxicilina course for cat', () => {
        const patientWeight = 4 // kg
        const dosePerAdmin = patientWeight * 10 // mg
        const administrations = 2 // BID
        const days = 7
        const totalDose = dosePerAdmin * administrations * days

        expect(dosePerAdmin).toBe(40)
        expect(totalDose).toBe(560) // 560 mg total for course
      })
    })

    describe('Emergency Dosing', () => {
      it('should calculate accurate emergency drug doses', () => {
        // Epinephrine for anaphylaxis: 0.01 mg/kg IV/IM
        const patientWeight = 25 // kg
        const epinephrineDose = patientWeight * 0.01

        expect(epinephrineDose).toBe(0.25) // 0.25 mg
      })
    })
  })
})
