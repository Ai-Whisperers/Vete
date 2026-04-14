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

function getColor(obj: any): string {
  if (!obj) return '#ffffff'
  if (typeof obj === 'string') return obj
  if (typeof obj === 'object' && typeof obj.main === 'string') return obj.main
  return '#ffffff'
}

export default async function TenantPage({ params }: Props) {
  const { tenant } = await params
  const data = await getTenantData(tenant)

  if (!data) {
    notFound()
  }

  const { config, theme, home, about, services, faq, testimonials } = data
  const colors = theme?.colors || {}
  
  const primaryColor = getColor(colors.primary)
  const secondaryColor = getColor(colors.secondary)
  const secondaryContrast = colors.secondary?.contrast || '#ffffff'
  const bg = {
    default: getColor(colors.background?.default),
    paper: getColor(colors.background?.paper),
    subtle: getColor(colors.background?.subtle),
  }
  const text = {
    primary: getColor(colors.text?.primary),
    secondary: getColor(colors.text?.secondary),
    muted: getColor(colors.text?.muted),
  }
  const border = getColor(colors.border?.light)
  
  const serviceList = services?.services || services || []
  const testimonialList = testimonials || []
  const faqList = faq?.items || faq || []
  const aboutText = about?.intro?.text || about?.content || about?.description || ''

  return (
    <main className="min-h-screen" style={{ backgroundColor: bg.default }}>
      <nav className="py-4 px-6 flex items-center justify-between" style={{ backgroundColor: bg.paper, borderBottom: `1px solid ${border}` }}>
        <h1 className="text-xl font-bold" style={{ color: primaryColor }}>{config.name}</h1>
        <span style={{ color: text.secondary, fontSize: '0.875rem' }}>{config.tagline}</span>
        <div className="flex gap-6">
          {serviceList.length > 0 && <Link href="#services" style={{ color: text.secondary }}>Servicios</Link>}
          {aboutText && <Link href="#about" style={{ color: text.secondary }}>Nosotros</Link>}
          {faqList.length > 0 && <Link href="#faq" style={{ color: text.secondary }}>FAQ</Link>}
        </div>
      </nav>

      {home?.hero && (
        <section className="py-20 px-6 text-center" style={{ backgroundColor: primaryColor }}>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {home.hero.headline}
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            {home.hero.subhead}
          </p>
          {home.hero.cta_primary && (
            <Link href="#contact" className="inline-block px-8 py-3 rounded-lg font-medium" style={{ backgroundColor: secondaryColor, color: secondaryContrast }}>
              {home.hero.cta_primary}
            </Link>
          )}
        </section>
      )}

      {home?.features && (
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {home.features.map((f: any, i: number) => (
                <div key={i} className="p-6 rounded-xl text-center" style={{ backgroundColor: bg.paper, border: `1px solid ${border}` }}>
                  <h4 className="text-lg font-bold mb-2" style={{ color: text.primary }}>{f.title}</h4>
                  <p style={{ color: text.secondary }}>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {serviceList.length > 0 && (
        <section id="services" className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12" style={{ color: text.primary }}>Servicios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {serviceList.slice(0, 6).map((s: any, i: number) => (
                <div key={i} className="p-6 rounded-xl" style={{ backgroundColor: bg.paper, border: `1px solid ${border}` }}>
                  <h4 className="text-lg font-bold mb-2" style={{ color: text.primary }}>{s.title}</h4>
                  <p style={{ color: text.secondary }}>{s.summary || s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {aboutText && (
        <section id="about" className="py-16 px-6" style={{ backgroundColor: bg.subtle }}>
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-8" style={{ color: text.primary }}>Sobre Nosotros</h3>
            <div className="prose max-w-none" style={{ color: text.secondary }} dangerouslySetInnerHTML={{ __html: aboutText }} />
          </div>
        </section>
      )}

      {testimonialList.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12" style={{ color: text.primary }}>Testimonios</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonialList.slice(0, 3).map((t: any, i: number) => (
                <div key={i} className="p-6 rounded-xl" style={{ backgroundColor: bg.paper, border: `1px solid ${border}` }}>
                  <p className="mb-4" style={{ color: text.secondary }}>"{t.text}"</p>
                  <p className="font-medium" style={{ color: text.primary }}>— {t.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {faqList.length > 0 && (
        <section id="faq" className="py-16 px-6" style={{ backgroundColor: bg.subtle }}>
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-8" style={{ color: text.primary }}>Preguntas Frecuentes</h3>
            <div className="space-y-4">
              {faqList.slice(0, 5).map((f: any, i: number) => (
                <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: bg.paper }}>
                  <h4 className="font-medium mb-2" style={{ color: text.primary }}>{f.question}</h4>
                  <p style={{ color: text.secondary }}>{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="contact" className="py-16 px-6 text-center" style={{ backgroundColor: primaryColor }}>
        <h3 className="text-2xl font-bold text-white mb-4">Contáctanos</h3>
        <p className="text-white/80 mb-6">{config.contact?.email}</p>
        {config.contact?.whatsapp_number && (
          <a href={`https://wa.me/${config.contact.whatsapp_number.replace(/\D/g, '')}`} className="inline-block px-8 py-3 rounded-lg font-medium" style={{ backgroundColor: secondaryColor, color: secondaryContrast }}>
            Escribinos en WhatsApp
          </a>
        )}
      </section>

      <footer className="py-6 px-6 text-center text-sm" style={{ color: text.muted, borderTop: `1px solid ${border}` }}>
        <p>© {new Date().getFullYear()} {config.name}. Todos los derechos reservados.</p>
      </footer>
    </main>
  )
}