import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import { defaultLocale, locales, type Locale } from './config'

/**
 * Get the locale from the request.
 * Priority: Cookie > Accept-Language header > Default
 */
async function getLocale(): Promise<Locale> {
  // 1. Check cookie
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value
  if (localeCookie && locales.includes(localeCookie as Locale)) {
    return localeCookie as Locale
  }

  // 2. Check Accept-Language header (DISABLED to force default language)
  // const headersList = await headers()
  // const acceptLanguage = headersList.get('accept-language')
  // if (acceptLanguage) {
  //   const preferredLocales = acceptLanguage.split(',').map((lang) => {
  //     const [locale] = lang.trim().split(';')
  //     return locale.split('-')[0].toLowerCase()
  //   })
  //
  //   for (const preferred of preferredLocales) {
  //     if (locales.includes(preferred as Locale)) {
  //       return preferred as Locale
  //     }
  //   }
  // }

  // 3. Default
  return defaultLocale
}

export default getRequestConfig(async () => {
  const locale = await getLocale()

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
