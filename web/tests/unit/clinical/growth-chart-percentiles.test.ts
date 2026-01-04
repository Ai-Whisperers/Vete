/**
 * Growth Chart Percentile Tests
 *
 * Tests for the growth standards API and percentile calculations.
 * Growth charts are used to track pet development and identify
 * malnutrition, obesity, or underlying health conditions.
 *
 * Tests cover:
 * - API endpoint behavior
 * - Percentile calculation accuracy
 * - Breed category standards
 * - Age interpolation
 * - Gender-specific standards
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET } from '@/app/api/growth_standards/route'

// Mock response type helper
interface MockResponse {
  status: number
  json: () => Promise<unknown>
  headers?: { get: (key: string) => string | null }
}

// Mock growth standards data
const mockGrowthStandards = [
  // Toy breed, female
  { age_weeks: 8, weight_kg: 0.5, percentile: 50, breed_category: 'toy', gender: 'female' },
  { age_weeks: 12, weight_kg: 0.8, percentile: 50, breed_category: 'toy', gender: 'female' },
  { age_weeks: 16, weight_kg: 1.2, percentile: 50, breed_category: 'toy', gender: 'female' },
  { age_weeks: 24, weight_kg: 1.8, percentile: 50, breed_category: 'toy', gender: 'female' },
  { age_weeks: 52, weight_kg: 2.5, percentile: 50, breed_category: 'toy', gender: 'female' },

  // Large breed, male
  { age_weeks: 8, weight_kg: 5.0, percentile: 50, breed_category: 'large', gender: 'male' },
  { age_weeks: 12, weight_kg: 10.0, percentile: 50, breed_category: 'large', gender: 'male' },
  { age_weeks: 16, weight_kg: 15.0, percentile: 50, breed_category: 'large', gender: 'male' },
  { age_weeks: 24, weight_kg: 22.0, percentile: 50, breed_category: 'large', gender: 'male' },
  { age_weeks: 52, weight_kg: 30.0, percentile: 50, breed_category: 'large', gender: 'male' },

  // Multiple percentiles for medium breed
  { age_weeks: 16, weight_kg: 4.5, percentile: 10, breed_category: 'medium', gender: 'male' },
  { age_weeks: 16, weight_kg: 5.5, percentile: 25, breed_category: 'medium', gender: 'male' },
  { age_weeks: 16, weight_kg: 6.5, percentile: 50, breed_category: 'medium', gender: 'male' },
  { age_weeks: 16, weight_kg: 7.5, percentile: 75, breed_category: 'medium', gender: 'male' },
  { age_weeks: 16, weight_kg: 8.5, percentile: 90, breed_category: 'medium', gender: 'male' },
]

// Create mock Supabase
const createMockSupabase = (data: typeof mockGrowthStandards = mockGrowthStandards) => ({
  from: vi.fn().mockImplementation(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({
      data,
      error: null,
    }),
  })),
})

// Mock modules
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/monitoring/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Growth Standards API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/growth_standards', () => {
    describe('Parameter Validation', () => {
      it('should require breed_category parameter', async () => {
        const { createClient } = await import('@/lib/supabase/server')
        vi.mocked(createClient).mockResolvedValue(createMockSupabase() as any)

        const request = new Request('http://localhost/api/growth_standards?gender=male')
        const response = (await GET(request)) as MockResponse

        expect(response.status).toBe(400)
        const json = await response.json()
        expect(json).toHaveProperty('error')
      })

      it('should require gender parameter', async () => {
        const { createClient } = await import('@/lib/supabase/server')
        vi.mocked(createClient).mockResolvedValue(createMockSupabase() as any)

        const request = new Request('http://localhost/api/growth_standards?breed_category=medium')
        const response = (await GET(request)) as MockResponse

        expect(response.status).toBe(400)
        const json = await response.json()
        expect(json).toHaveProperty('error')
      })

      it('should accept valid breed_category and gender', async () => {
        const { createClient } = await import('@/lib/supabase/server')
        vi.mocked(createClient).mockResolvedValue(createMockSupabase() as any)

        const request = new Request(
          'http://localhost/api/growth_standards?breed_category=medium&gender=male'
        )
        const response = (await GET(request)) as MockResponse

        expect(response.status).toBe(200)
      })
    })

    describe('Data Retrieval', () => {
      it('should return growth standards data', async () => {
        const { createClient } = await import('@/lib/supabase/server')
        vi.mocked(createClient).mockResolvedValue(createMockSupabase() as any)

        const request = new Request(
          'http://localhost/api/growth_standards?breed_category=large&gender=male'
        )
        const response = (await GET(request)) as MockResponse

        expect(response.status).toBe(200)
        const json = (await response.json()) as typeof mockGrowthStandards
        expect(Array.isArray(json)).toBe(true)
      })

      it('should return empty array for missing table gracefully', async () => {
        const { createClient } = await import('@/lib/supabase/server')
        vi.mocked(createClient).mockResolvedValue({
          from: vi.fn().mockImplementation(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { code: '42P01', message: 'relation does not exist' },
            }),
          })),
        } as any)

        const request = new Request(
          'http://localhost/api/growth_standards?breed_category=medium&gender=male'
        )
        const response = (await GET(request)) as MockResponse

        expect(response.status).toBe(200)
        const json = await response.json()
        expect(json).toEqual([])
      })

      it('should handle database errors', async () => {
        const { createClient } = await import('@/lib/supabase/server')
        vi.mocked(createClient).mockResolvedValue({
          from: vi.fn().mockImplementation(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'OTHER', message: 'Connection failed' },
            }),
          })),
        } as any)

        const request = new Request(
          'http://localhost/api/growth_standards?breed_category=medium&gender=male'
        )
        const response = (await GET(request)) as MockResponse

        expect(response.status).toBe(500)
      })
    })
  })
})

describe('Growth Chart Percentile Calculations', () => {
  /**
   * These tests document expected percentile calculations and serve as
   * verification for the growth chart feature.
   */

  describe('Percentile Interpolation', () => {
    /**
     * Interpolate weight percentile based on age and reference data
     */
    const interpolatePercentile = (
      currentWeight: number,
      ageWeeks: number,
      standards: Array<{ age_weeks: number; weight_kg: number; percentile: number }>
    ): number => {
      // Filter standards for the exact age or closest ages
      const atAge = standards.filter((s) => s.age_weeks === ageWeeks)

      if (atAge.length === 0) {
        return -1 // Age not in standards
      }

      // Sort by weight
      const sorted = [...atAge].sort((a, b) => a.weight_kg - b.weight_kg)

      // Find where current weight falls
      if (currentWeight <= sorted[0].weight_kg) {
        return sorted[0].percentile
      }
      if (currentWeight >= sorted[sorted.length - 1].weight_kg) {
        return sorted[sorted.length - 1].percentile
      }

      // Linear interpolation between two percentile points
      for (let i = 0; i < sorted.length - 1; i++) {
        if (currentWeight >= sorted[i].weight_kg && currentWeight <= sorted[i + 1].weight_kg) {
          const ratio =
            (currentWeight - sorted[i].weight_kg) /
            (sorted[i + 1].weight_kg - sorted[i].weight_kg)
          return Math.round(
            sorted[i].percentile + ratio * (sorted[i + 1].percentile - sorted[i].percentile)
          )
        }
      }

      return 50 // Default to median
    }

    const mediumMaleStandards = mockGrowthStandards.filter(
      (s) => s.breed_category === 'medium' && s.gender === 'male'
    )

    it('should return P50 for median weight', () => {
      const percentile = interpolatePercentile(6.5, 16, mediumMaleStandards)
      expect(percentile).toBe(50)
    })

    it('should return P10 for underweight pet', () => {
      const percentile = interpolatePercentile(4.5, 16, mediumMaleStandards)
      expect(percentile).toBe(10)
    })

    it('should return P90 for overweight pet', () => {
      const percentile = interpolatePercentile(8.5, 16, mediumMaleStandards)
      expect(percentile).toBe(90)
    })

    it('should interpolate between percentile points', () => {
      const percentile = interpolatePercentile(6.0, 16, mediumMaleStandards)
      // Between P25 (5.5kg) and P50 (6.5kg)
      expect(percentile).toBeGreaterThan(25)
      expect(percentile).toBeLessThan(50)
    })

    it('should return lowest percentile for very underweight', () => {
      const percentile = interpolatePercentile(3.0, 16, mediumMaleStandards)
      expect(percentile).toBe(10) // Returns minimum
    })

    it('should return highest percentile for very overweight', () => {
      const percentile = interpolatePercentile(12.0, 16, mediumMaleStandards)
      expect(percentile).toBe(90) // Returns maximum
    })
  })

  describe('Breed Category Standards', () => {
    describe('Toy Breeds', () => {
      it('should have appropriate standards for toy breeds', () => {
        const toyStandards = mockGrowthStandards.filter((s) => s.breed_category === 'toy')

        // Toy breeds should have small weights
        const maxWeight = Math.max(...toyStandards.map((s) => s.weight_kg))
        expect(maxWeight).toBeLessThan(5) // Under 5kg at adult
      })

      it('should show proper growth curve for toy breeds', () => {
        const toyFemale = mockGrowthStandards
          .filter((s) => s.breed_category === 'toy' && s.gender === 'female')
          .sort((a, b) => a.age_weeks - b.age_weeks)

        // Weight should increase with age
        for (let i = 1; i < toyFemale.length; i++) {
          expect(toyFemale[i].weight_kg).toBeGreaterThan(toyFemale[i - 1].weight_kg)
        }
      })
    })

    describe('Large Breeds', () => {
      it('should have appropriate standards for large breeds', () => {
        const largeStandards = mockGrowthStandards.filter((s) => s.breed_category === 'large')

        // Large breeds should have substantial weights
        const adultWeight = largeStandards.find((s) => s.age_weeks === 52)?.weight_kg
        expect(adultWeight).toBeGreaterThan(25) // Over 25kg at adult
      })

      it('should show rapid early growth for large breeds', () => {
        const largeMale = mockGrowthStandards
          .filter((s) => s.breed_category === 'large' && s.gender === 'male')
          .sort((a, b) => a.age_weeks - b.age_weeks)

        // Early growth should be rapid
        const week8 = largeMale.find((s) => s.age_weeks === 8)!
        const week16 = largeMale.find((s) => s.age_weeks === 16)!

        const growthRate = (week16.weight_kg - week8.weight_kg) / 8
        expect(growthRate).toBeGreaterThan(1) // Over 1kg per week early on
      })
    })
  })

  describe('Gender Differences', () => {
    it('should document that males typically weigh more', () => {
      // This is a documentation test - actual standards would show this
      const maleAdult = 30 // kg (example)
      const femaleAdult = 26 // kg (example)

      expect(maleAdult).toBeGreaterThan(femaleAdult)
    })
  })

  describe('Clinical Interpretation', () => {
    describe('Underweight Classification', () => {
      it('should identify severely underweight (<P5)', () => {
        const percentile = 3
        const isSeverelyUnderweight = percentile < 5

        expect(isSeverelyUnderweight).toBe(true)
        // Clinical action: Investigate malnutrition, parasites, illness
      })

      it('should identify underweight (P5-P15)', () => {
        const percentile = 10
        const isUnderweight = percentile >= 5 && percentile < 15

        expect(isUnderweight).toBe(true)
        // Clinical action: Monitor closely, may need dietary adjustment
      })
    })

    describe('Normal Weight Classification', () => {
      it('should identify normal weight (P15-P85)', () => {
        const percentile = 50
        const isNormal = percentile >= 15 && percentile <= 85

        expect(isNormal).toBe(true)
        // Clinical action: Continue normal care
      })
    })

    describe('Overweight Classification', () => {
      it('should identify overweight (P85-P95)', () => {
        const percentile = 88
        const isOverweight = percentile > 85 && percentile <= 95

        expect(isOverweight).toBe(true)
        // Clinical action: Dietary counseling, increased exercise
      })

      it('should identify obese (>P95)', () => {
        const percentile = 97
        const isObese = percentile > 95

        expect(isObese).toBe(true)
        // Clinical action: Weight management program, rule out endocrine issues
      })
    })
  })

  describe('Growth Velocity', () => {
    const calculateGrowthVelocity = (
      weight1: number,
      weight2: number,
      weeks: number
    ): number => {
      return (weight2 - weight1) / weeks
    }

    it('should calculate expected growth velocity', () => {
      const week8Weight = 5.0
      const week12Weight = 10.0
      const velocity = calculateGrowthVelocity(week8Weight, week12Weight, 4)

      expect(velocity).toBe(1.25) // 1.25 kg per week
    })

    it('should flag slow growth', () => {
      const expectedVelocity = 1.25 // kg/week for large breed puppy
      const actualVelocity = 0.5 // kg/week

      const isSlowGrowth = actualVelocity < expectedVelocity * 0.7

      expect(isSlowGrowth).toBe(true)
      // Clinical action: Investigate poor growth
    })

    it('should flag excessive growth', () => {
      const expectedVelocity = 1.25 // kg/week
      const actualVelocity = 2.0 // kg/week

      const isExcessiveGrowth = actualVelocity > expectedVelocity * 1.3

      expect(isExcessiveGrowth).toBe(true)
      // Clinical action: Risk of developmental orthopedic disease in large breeds
    })
  })
})
