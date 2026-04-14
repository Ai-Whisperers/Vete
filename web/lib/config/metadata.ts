/**
 * Site Metadata Configuration
 *
 * Centralized URL and metadata constants for SEO, sitemaps, and structured data.
 * Uses environment variables for environment-specific deployments.
 *
 * @module lib/config/metadata
 */

import { env } from '@/lib/env'

/**
 * Site configuration constants
 */
export const SITE_CONFIG = {
  /** Base URL from environment or default */
  url: env.APP_URL,
  /** Site name */
  name: 'LEALTIS',
  /** Default page title */
  defaultTitle: 'LEALTIS - Relocation & Investment Platform',
  /** Default description for SEO */
  description: 'Relocation and investment platform for Paraguay — programs, visas, and business opportunities',
  /** Twitter handle (without @) */
  twitter: 'lealtis_app',
  /** Default locale */
  locale: 'es_PY',
  /** Default language */
  language: 'es',
} as const

/**
 * Get the full site URL with optional path
 *
 * @param path - Optional path to append (should start with /)
 * @returns Full URL string
 *
 * @example
 * getSiteUrl() // 'https://paragu-ai.com/lealtis'
 * getSiteUrl('/about') // 'https://paragu-ai.com/lealtis/about'
 */
export function getSiteUrl(path = ''): string {
  const baseUrl = SITE_CONFIG.url.replace(/\/$/, '') // Remove trailing slash
  return `${baseUrl}${path}`
}

/**
 * Get canonical URL for a page
 *
 * @param slug - Page slug
 * @param path - Optional path within the page (should start with /)
 * @returns Full canonical URL
 *
 * @example
 * getCanonicalUrl('programas') // 'https://paragu-ai.com/lealtis/programas'
 * getCanonicalUrl('programas', '/investor') // 'https://paragu-ai.com/lealtis/programas/investor'
 */
export function getCanonicalUrl(slug: string, path = ''): string {
  return getSiteUrl(`/${slug}${path}`)
}

/**
 * Get URL object for Next.js metadataBase
 *
 * @returns URL object for metadataBase configuration
 */
export function getMetadataBaseUrl(): URL {
  return new URL(SITE_CONFIG.url)
}
