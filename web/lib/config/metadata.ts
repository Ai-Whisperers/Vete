import { env } from '@/lib/env'

export const SITE_CONFIG = {
  url: env.APP_URL,
  name: 'paragu.ai',
  defaultTitle: 'paragu.ai — Multi-Brand Platform',
  description: 'Your gateway to services and brands in Paraguay',
  twitter: 'paragu_ai',
  locale: 'es_PY',
  language: 'es',
} as const

export function getSiteUrl(path = ''): string {
  const baseUrl = SITE_CONFIG.url.replace(/\/$/, '')
  return `${baseUrl}${path}`
}

export function getCanonicalUrl(slug: string, path = ''): string {
  return getSiteUrl(`/${slug}${path}`)
}

export function getMetadataBaseUrl(): URL {
  return new URL(SITE_CONFIG.url)
}
