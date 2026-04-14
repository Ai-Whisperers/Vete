import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paragu-ai.com/lealtis'

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
  '/comparar',
  '/comparar/paraguay-vs-portugal',
  '/comparar/paraguay-vs-uruguay',
  '/comparar/paraguay-vs-dubai',
  '/comparar/paraguay-vs-panama',
  '/comparar/paraguay-vs-georgia',
  '/comparar/paraguay-vs-malta',
  '/precios',
  '/banking',
  '/impuestos',
  '/guia-gratis',
  '/espana',
  '/nederland',
  '/deutschland',
  '/calculadora',
  '/costo-de-vida',
  '/checklist',
  '/barrios',
  '/partners',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  locales.forEach((locale) => {
    pages.forEach((page) => {
      const sep = page === '' ? '' : page
      const localeSuffix = locale === 'nl' ? '' : `?locale=${locale}`

      entries.push({
        url: `${baseUrl}${sep}${localeSuffix}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: page === '' ? 1 : 0.8,
      })
    })
  })

  return entries
}
