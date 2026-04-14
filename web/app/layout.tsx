import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import Script from 'next/script'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { getMetadataBaseUrl } from '@/lib/config'
import './globals.css'

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN

const baseUrl = 'https://paragu-ai.com/lealtis'

export const metadata: Metadata = {
  title: {
    default: 'LEALTIS — Paraguay Establishment for Europeans',
    template: '%s | LEALTIS',
  },
  description:
    'Professional relocation to Paraguay: residency, company formation, and bank account in one integrated program.',
  metadataBase: getMetadataBaseUrl(),
  alternates: {
    canonical: '/',
    languages: {
      'nl': `${baseUrl}`,
      'en': `${baseUrl}?locale=en`,
      'de': `${baseUrl}?locale=de`,
      'es': `${baseUrl}?locale=es`,
      'x-default': `${baseUrl}`,
    },
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {plausibleDomain && (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className={`${playfairDisplay.variable} ${inter.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
