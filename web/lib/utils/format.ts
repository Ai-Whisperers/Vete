import { format } from 'date-fns';
import { getLocale } from './locales';

export function formatDate(date: Date, localeCode: string, formatString: string): string {
  const locale = getLocale(localeCode);
  return format(date, formatString, { locale });
}

export function formatNumber(number: number, localeCode: string): string {
  const locale = getLocale(localeCode);
  return new Intl.NumberFormat(localeCode, { locale }).format(number);
}