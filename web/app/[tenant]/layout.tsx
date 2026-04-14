import { getTenantData } from '@/lib/tenant-content'
import { notFound } from 'next/navigation'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import type { TenantTheme } from '@/lib/types/tenant-config'
import '../globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

function themeToCssVars(theme: TenantTheme): Record<string, string> {
  const vars: Record<string, string> = {}

  if (theme.colors?.primary) {
    vars['--color-primary'] = theme.colors.primary.main
    vars['--color-primary-light'] = theme.colors.primary.light
    vars['--color-primary-dark'] = theme.colors.primary.dark
    vars['--color-primary-contrast'] = theme.colors.primary.contrast
    vars['--color-primary-rgb'] = theme.colors.primary.rgb
  }

  if (theme.colors?.secondary) {
    vars['--color-secondary'] = theme.colors.secondary.main
    vars['--color-secondary-light'] = theme.colors.secondary.light
    vars['--color-secondary-dark'] = theme.colors.secondary.dark
    vars['--color-secondary-contrast'] = theme.colors.secondary.contrast
    vars['--color-secondary-rgb'] = theme.colors.secondary.rgb
  }

  if (theme.colors?.accent) {
    vars['--color-accent'] = theme.colors.accent
  }

  if (theme.colors?.background) {
    vars['--color-background'] = theme.colors.background.default
    vars['--color-surface'] = theme.colors.background.surface || theme.colors.background.paper
    vars['--color-card'] = theme.colors.background.paper
    vars['--color-background-subtle'] = theme.colors.background.subtle
    vars['--color-background-dark'] = theme.colors.background.dark
    vars['--color-background-hero'] = theme.colors.background.hero
  }

  if (theme.colors?.text) {
    vars['--color-text'] = theme.colors.text.primary
    vars['--color-text-secondary'] = theme.colors.text.secondary
    vars['--color-text-muted'] = theme.colors.text.muted
    vars['--color-text-invert'] = theme.colors.text.invert
    vars['--color-text-link'] = theme.colors.text.link
    vars['--color-text-disabled'] = theme.colors.text.disabled
  }

  if (theme.colors?.border) {
    vars['--color-border'] = theme.colors.border.main || theme.colors.border.light
    vars['--color-border-light'] = theme.colors.border.light
  }

  const statusColors = ['success', 'warning', 'error', 'info'] as const
  for (const status of statusColors) {
    if (theme.colors?.[status]) {
      const sc = theme.colors[status] as Record<string, string>
      vars[`--color-${status}`] = sc.main
      if (sc.light) vars[`--color-${status}-light`] = sc.light
      if (sc.dark) vars[`--color-${status}-dark`] = sc.dark
      if (sc.bg) vars[`--color-${status}-bg`] = sc.bg
    }
  }

  if (theme.typography?.fontFamily) {
    vars['--font-heading'] = theme.typography.fontFamily.heading
    vars['--font-body'] = theme.typography.fontFamily.body
  }

  if (theme.borderRadius) {
    vars['--radius-sm'] = theme.borderRadius.sm || '6px'
    vars['--radius-md'] = theme.borderRadius.md || '8px'
    vars['--radius-lg'] = theme.borderRadius.lg || '12px'
  }

  return vars
}

interface Props {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}

export default async function TenantLayout({ children, params }: Props) {
  const { tenant } = await params
  const tenantData = await getTenantData(tenant)

  if (!tenantData) {
    notFound()
  }

  const cssVars = themeToCssVars(tenantData.theme)
  const messages = await getMessages()

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased`}
        style={cssVars as React.CSSProperties}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
