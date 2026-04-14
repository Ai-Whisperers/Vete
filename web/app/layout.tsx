import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
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

export const metadata: Metadata = {
  title: {
    default: 'LEALTIS — Paraguay Establishment for Europeans',
    template: '%s | LEALTIS',
  },
  description:
    'Professional relocation to Paraguay: residency, company formation, and bank account in one integrated program.',
  metadataBase: getMetadataBaseUrl(),
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
      <body className={`${playfairDisplay.variable} ${inter.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
