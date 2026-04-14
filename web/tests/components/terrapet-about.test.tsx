import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import AboutPage from '@/app/[clinic]/about/page'
import { getClinicData } from '@/lib/clinics'
import type { ClinicData } from '@/lib/types/clinic-config'

// Mock the getClinicData function
vi.mock('@/lib/clinics', () => ({
  getClinicData: vi.fn().mockResolvedValue({
    id: 'clinic-1',
    name: 'Test Clinic',
    address: '123 Main St',
    phone: '555-555-5555',
    email: 'test@example.com',
  }),
}))

// Mock child components
vi.mock('@/components/about/team-member-card', () => ({
  TeamMemberCard: ({ member }: { member: { name: string; role: string } }) => (
    <div data-testid="team-member-card">
      <h3>{member.name}</h3>
      <p>{member.role}</p>
    </div>
  ),
}))

vi.mock('@/components/about/facilities-gallery', () => ({
  FacilitiesGallery: () => <div data-testid="facilities-gallery">Facilities Gallery</div>,
}))

vi.mock('@/components/about/certification-badge', () => ({
  CertificationBadge: () => <div data-testid="certification-badge">Certification Badge</div>,
}))

vi.mock('@/components/seo/structured-data', () => ({
  StructuredData: () => <div data-testid="structured-data">Structured Data</div>,
}))

describe('AboutPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders clinic data', async () => {
    render(<AboutPage />)
    await screen.findByTestId('team-member-card')
    await screen.findByTestId('facilities-gallery')
    await screen.findByTestId('certification-badge')
    await screen.findByTestId('structured-data')
    expect(getClinicData).toHaveBeenCalledTimes(1)
  })

  it('renders team member card', async () => {
    render(<AboutPage />)
    const teamMemberCard = await screen.findByTestId('team-member-card')
    expect(teamMemberCard).toBeInTheDocument()
  })

  it('renders facilities gallery', async () => {
    render(<AboutPage />)
    const facilitiesGallery = await screen.findByTestId('facilities-gallery')
    expect(facilitiesGallery).toBeInTheDocument()
  })

  it('renders certification badge', async () => {
    render(<AboutPage />)
    const certificationBadge = await screen.findByTestId('certification-badge')
    expect(certificationBadge).toBeInTheDocument()
  })

  it('renders structured data', async () => {
    render(<AboutPage />)
    const structuredData = await screen.findByTestId('structured-data')
    expect(structuredData).toBeInTheDocument()
  })
})