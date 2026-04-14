/**
 * i18n Configuration
 *
 * Supported locales for the application.
 * Default is Dutch (nl) as the primary market is European (Dutch, German, English, Spanish).
 */

export const locales = ['nl', 'en', 'de', 'es'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'nl'

export const localeNames: Record<Locale, string> = {
  nl: 'Nederlands',
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
}

export const localeFlags: Record<Locale, string> = {
  nl: '🇳🇱',
  en: '🇬🇧',
  de: '🇩🇪',
  es: '🇪🇸',
}
