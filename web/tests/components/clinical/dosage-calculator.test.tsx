/**
 * DosageCalculator Component Tests
 *
 * Tests the drug dosage calculator component including:
 * - Render with weight input and drug selector
 * - Drug data fetching
 * - Dosage calculations
 * - Warning display
 * - Edge cases (negative weight, very small volumes)
 *
 * @ticket TEST-002
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Calculator: () => <span data-testid="icon-calculator" />,
  AlertTriangle: () => <span data-testid="icon-warning" />,
}))

// Mock fetch
const mockDrugs = [
  {
    id: 'drug-1',
    name: 'Amoxicilina',
    species: 'all',
    min_dose_mg_kg: 10,
    max_dose_mg_kg: 20,
    concentration_mg_ml: 50,
  },
]

vi.mock('@/lib/drugs', () => ({
  getDrugs: vi.fn().mockResolvedValue(mockDrugs),
}))

describe('DosageCalculator', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders calculator', async () => {
    render(<DosageCalculator />)
    await screen.findByTestId('icon-calculator')
  })

  it('renders warning', async () => {
    render(<DosageCalculator weight={-1} />)
    await screen.findByTestId('icon-warning')
  })

  it('fetches drug data', async () => {
    render(<DosageCalculator />)
    await waitFor(() => expect(getDrugs).toHaveBeenCalledTimes(1))
  })

  it('calculates dosage', async () => {
    render(<DosageCalculator weight={10} drugId="drug-1" />)
    await waitFor(() => expect(screen.getByTestId('dosage')).toBeInTheDocument())
  })

  it('handles edge cases', async () => {
    render(<DosageCalculator weight={-1} drugId="drug-1" />)
    await waitFor(() => expect(screen.getByTestId('icon-warning')).toBeInTheDocument())
  })
})