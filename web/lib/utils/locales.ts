import type { Locale } from 'date-fns';

const locales: Record<string, Locale> = {
  // ... existing locales
  'gn': require('date-fns/locale/gn'), // Guarani
};

export function getLocale(localeCode: string): Locale {
  return locales[localeCode];
}