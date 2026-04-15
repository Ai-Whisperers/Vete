import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import Script from 'next/script'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
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

export const metadata: Metadata = {
  title: {
    default: 'paragu.ai — Multi-Brand Platform',
    template: '%s | paragu.ai',
  },
  description:
    'Your gateway to services and brands in Paraguay.',
  metadataBase: new URL('https://paragu-ai.com'),
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
      <body className="antialiased font-sans" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
