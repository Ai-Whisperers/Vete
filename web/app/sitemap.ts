import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lealtis.com'

const locales = ['nl', 'en', 'de', 'es']

const pages = [
  '',
  '/programas/paraguay-business',
  '/programas/investor-program',
  '/por-que-paraguay',
  '/como-funciona',
  '/nosotros',
  '/faq',
  '/blog',
  '/contacto',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  locales.forEach((locale) => {
    pages.forEach((page) => {
      const path = locale === 'en' ? `/${locale}${page}` : page ? `/${locale}${page}` : `/${locale}`
      
      entries.push({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: page === '' ? 1 : 0.8,
      })
    })
  })

  return entries
}
