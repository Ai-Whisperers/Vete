import { getTenantData } from '@/lib/tenant-content'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ tenant: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params
  const data = await getTenantData(tenant)
  if (!data) return {}

  return {
    title: {
      default: data.config.name,
      template: `%s | ${data.config.name}`,
    },
    description: data.config.tagline,
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => (o || {})[k], obj)
}

export default async function TenantPage({ params }: Props) {
  const { tenant } = await params
  const data = await getTenantData(tenant)

  if (!data) {
    notFound()
  }

  const { config, theme, home, about, services, faq, testimonials } = data
  const colors = theme?.colors || {}
  const bg = colors.background || {}
  
  // Handle nested structures
  const serviceList = services?.services || services || []
  const testimonialList = testimonials || []
  const faqList = faq?.items || faq || []
  const aboutText = about?.intro?.text || about?.content || about?.description || ''

  return (
    <main className="min-h-screen" style={{ backgroundColor: bg.default || '#fff' }}>
      {/* Navigation */}
      <nav className="py-4 px-6 flex items-center justify-between" style={{ backgroundColor: bg.paper || '#fff', borderBottom: `1px solid ${colors.border?.light || '#e5e7eb'}` }}>
        <h1 className="text-xl font-bold" style={{ color: colors.primary?.main }}>{config.name}</h1>
        <div className="flex gap-6">
          {serviceList.length > 0 && <Link href="#services" style={{ color: colors.text?.secondary }}>Servicios</Link>}
          {aboutText && <Link href="#about" style={{ color: colors.text?.secondary }}>Nosotros</Link>}
          {faqList.length > 0 && <Link href="#faq" style={{ color: colors.text?.secondary }}>FAQ</Link>}
        </div>
      </nav>

      {/* Hero from home.json */}
      {home?.hero && (
        <section className="py-20 px-6 text-center" style={{ backgroundColor: colors.primary?.main }}>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: theme?.typography?.fontFamily?.heading }}>
            {home.hero.headline}
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            {home.hero.subhead}
          </p>
          {home.hero.cta_primary && (
            <Link href="#contact" className="inline-block px-8 py-3 rounded-lg font-medium" style={{ backgroundColor: colors.secondary?.main, color: colors.secondary?.contrast }}>
              {home.hero.cta_primary}
            </Link>
          )}
        </section>
      )}

      {/* Features from home.json */}
      {home?.features && (
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {home.features.map((f: any, i: number) => (
                <div key={i} className="p-6 rounded-xl text-center" style={{ backgroundColor: bg.paper, border: `1px solid ${colors.border?.light}` }}>
                  <h4 className="text-lg font-bold mb-2" style={{ color: colors.text?.primary }}>{f.title}</h4>
                  <p style={{ color: colors.text?.secondary }}>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      {serviceList.length > 0 && (
        <section id="services" className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12" style={{ color: colors.text?.primary }}>Servicios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {serviceList.slice(0, 6).map((s: any, i: number) => (
                <div key={i} className="p-6 rounded-xl" style={{ backgroundColor: bg.paper, border: `1px solid ${colors.border?.light}` }}>
                  <h4 className="text-lg font-bold mb-2" style={{ color: colors.text?.primary }}>{s.title}</h4>
                  <p style={{ color: colors.text?.secondary }}>{s.summary || s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      {aboutText && (
        <section id="about" className="py-16 px-6" style={{ backgroundColor: bg.subtle }}>
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-8" style={{ color: colors.text?.primary }}>Sobre Nosotros</h3>
            <div className="prose max-w-none" style={{ color: colors.text?.secondary }} dangerouslySetInnerHTML={{ __html: aboutText }} />
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonialList.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12" style={{ color: colors.text?.primary }}>Testimonios</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonialList.slice(0, 3).map((t: any, i: number) => (
                <div key={i} className="p-6 rounded-xl" style={{ backgroundColor: bg.paper, border: `1px solid ${colors.border?.light}` }}>
                  <p className="mb-4" style={{ color: colors.text?.secondary }}>"{t.text}"</p>
                  <p className="font-medium" style={{ color: colors.text?.primary }}>— {t.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqList.length > 0 && (
        <section id="faq" className="py-16 px-6" style={{ backgroundColor: bg.subtle }}>
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-8" style={{ color: colors.text?.primary }}>Preguntas Frecuentes</h3>
            <div className="space-y-4">
              {faqList.slice(0, 5).map((f: any, i: number) => (
                <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: bg.paper }}>
                  <h4 className="font-medium mb-2" style={{ color: colors.text?.primary }}>{f.question}</h4>
                  <p style={{ color: colors.text?.secondary }}>{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="contact" className="py-16 px-6 text-center" style={{ backgroundColor: colors.primary?.main }}>
        <h3 className="text-2xl font-bold text-white mb-4">Contáctanos</h3>
        <p className="text-white/80 mb-6">{config.contact?.email}</p>
        {config.contact?.whatsapp_number && (
          <a href={`https://wa.me/${config.contact.whatsapp_number.replace(/\D/g, '')}`} className="inline-block px-8 py-3 rounded-lg font-medium" style={{ backgroundColor: colors.secondary?.main, color: colors.secondary?.contrast }}>
            Escribinos en WhatsApp
          </a>
        )}
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 text-center text-sm" style={{ color: colors.text?.muted, borderTop: `1px solid ${colors.border?.light}` }}>
        <p>© {new Date().getFullYear()} {config.name}. Todos los derechos reservados.</p>
      </footer>
    </main>
  )
}