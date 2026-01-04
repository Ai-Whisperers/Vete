import { MetadataRoute } from 'next'
import { getAllClinics, getClinicData } from '@/lib/clinics'

const BASE_URL = 'https://vetepy.vercel.app'

// Static pages for each clinic
const CLINIC_PAGES = [
  '', // homepage
  '/services',
  '/about',
  '/store',
  '/faq',
  '/book',
  '/tools/toxic-food',
  '/tools/age-calculator',
  '/loyalty_points',
  '/privacy',
  '/terms',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const clinics = await getAllClinics()
  const entries: MetadataRoute.Sitemap = []

  // Root landing page
  entries.push({
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1.0,
  })

  // Generate entries for each clinic
  for (const clinicSlug of clinics) {
    const clinicData = await getClinicData(clinicSlug)
    if (!clinicData) continue

    // Clinic homepage - highest priority
    entries.push({
      url: `${BASE_URL}/${clinicSlug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    })

    // Static clinic pages
    for (const page of CLINIC_PAGES) {
      if (page === '') continue // Already added homepage

      entries.push({
        url: `${BASE_URL}/${clinicSlug}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '/services' || page === '/store' ? 'daily' : 'weekly',
        priority: page === '/services' ? 0.8 : 0.7,
      })
    }

    // Dynamic service detail pages
    if (clinicData.services?.services) {
      for (const service of clinicData.services.services) {
        entries.push({
          url: `${BASE_URL}/${clinicSlug}/services/${service.id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    }
  }

  return entries
}
