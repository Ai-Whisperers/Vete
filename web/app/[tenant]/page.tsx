import { getTenantData } from '@/lib/tenant-content'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ tenant: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params
  const tenantData = await getTenantData(tenant)
  if (!tenantData) return {}

  return {
    title: {
      default: tenantData.config.name,
      template: `%s | ${tenantData.config.name}`,
    },
    description: tenantData.config.tagline,
  }
}

export default async function TenantPage({ params }: Props) {
  const { tenant } = await params
  const tenantData = await getTenantData(tenant)

  if (!tenantData) {
    notFound()
  }

  const { config, home } = tenantData

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <header className="bg-[var(--color-primary)] text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
            {config.name}
          </h1>
          {config.tagline && (
            <p className="mt-2 text-lg opacity-90">{config.tagline}</p>
          )}
        </div>
      </header>

      {home?.hero && (
        <section className="py-16 bg-[var(--color-background-subtle)]">
          <div className="max-w-7xl mx-auto px-4 text-center">
            {home.hero.headline && (
              <h2 className="text-4xl font-bold text-[var(--color-text)] font-[family-name:var(--font-heading)]">
                {home.hero.headline}
              </h2>
            )}
            {home.hero.subhead && (
              <p className="mt-4 text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto">
                {home.hero.subhead}
              </p>
            )}
          </div>
        </section>
      )}

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-[var(--color-text-muted)]">
            Content loaded from JSON-CMS. Full page rendering coming soon.
          </p>
        </div>
      </section>
    </main>
  )
}
