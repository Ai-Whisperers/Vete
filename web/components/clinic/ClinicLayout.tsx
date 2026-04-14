import type { ClinicData } from '@/lib/clinics'

interface Props {
  data: ClinicData
}

export function ClinicLayout({ data }: Props) {
  const { config, theme, home, services } = data
  const primary = theme.colors?.primary || '#1B3A6B'
  const accent = theme.colors?.accent || '#C9A84C'
  const headingFont = theme.fonts?.heading || 'var(--font-playfair)'

  return (
    <div style={{ fontFamily: theme.fonts?.body || 'var(--font-inter)' }}>
      <nav style={{ background: primary, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {config.name && <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', fontFamily: headingFont }}>{config.name}</span>}
          {config.tagline && <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>{config.tagline}</span>}
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['home', 'about', 'services', 'faq', 'contact'].map((mod) => (
            <a key={mod} href={`#${mod}`} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize' }}>{mod}</a>
          ))}
        </div>
      </nav>

      {home.hero && (
        <section id="home" style={{ background: `linear-gradient(135deg, ${primary}, ${primary}dd)`, padding: '4rem 2rem', textAlign: 'center', color: 'white' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', fontFamily: headingFont, marginBottom: '1rem' }}>{home.hero.headline}</h1>
          {home.hero.subheadline && <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '700px', margin: '0 auto' }}>{home.hero.subheadline}</p>}
          {home.hero.cta_text && (
            <a href="#contact" style={{ display: 'inline-block', marginTop: '2rem', background: accent, color: 'white', padding: '0.875rem 2rem', borderRadius: '9999px', fontWeight: 'bold', textDecoration: 'none' }}>{home.hero.cta_text}</a>
          )}
        </section>
      )}

      {home.features && home.features.length > 0 && (
        <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {home.features.map((f: { title: string; description: string; icon?: string }, i: number) => (
              <div key={i} style={{ padding: '2rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                {f.icon && <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{f.icon}</div>}
                <h3 style={{ color: primary, fontWeight: 'bold', fontFamily: headingFont, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: '#64748b' }}>{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {services.items && services.items.length > 0 && (
        <section id="services" style={{ padding: '4rem 2rem', background: '#f8fafc' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', color: primary, fontFamily: headingFont, marginBottom: '2rem' }}>{services.title || 'Our Services'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {services.items.map((s: { name: string; description?: string; price?: string; features?: string[] }, i: number) => (
                <div key={i} style={{ background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ color: primary, fontWeight: 'bold', fontFamily: headingFont, marginBottom: '0.5rem' }}>{s.name}</h3>
                  {s.description && <p style={{ color: '#64748b', marginBottom: '1rem' }}>{s.description}</p>}
                  {s.price && <p style={{ color: accent, fontWeight: 'bold', fontSize: '1.25rem' }}>{s.price}</p>}
                  {s.features && (
                    <ul style={{ marginTop: '1rem', paddingLeft: '1.25rem' }}>
                      {s.features.map((f: string, j: number) => <li key={j} style={{ color: '#64748b', marginBottom: '0.25rem' }}>{f}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {data.faq?.items && data.faq.items.length > 0 && (
        <section id="faq" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', color: primary, fontFamily: headingFont, marginBottom: '2rem' }}>FAQ</h2>
          {data.faq.items.map((item: { question: string; answer: string }, i: number) => (
            <div key={i} style={{ marginBottom: '1.5rem', padding: '1.5rem', borderRadius: '0.75rem', background: '#f8fafc' }}>
              <h3 style={{ color: primary, fontWeight: 'bold', marginBottom: '0.5rem' }}>{item.question}</h3>
              <p style={{ color: '#64748b' }}>{item.answer}</p>
            </div>
          ))}
        </section>
      )}

      {data.testimonials?.items && data.testimonials.items.length > 0 && (
        <section style={{ padding: '4rem 2rem', background: '#f8fafc' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', color: primary, fontFamily: headingFont, marginBottom: '2rem' }}>Testimonials</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {data.testimonials.items.map((t: { name: string; text: string; source?: string; rating?: number }, i: number) => (
                <div key={i} style={{ background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                  <p style={{ color: '#64748b', fontStyle: 'italic', marginBottom: '1rem' }}>"{t.text}"</p>
                  <p style={{ color: primary, fontWeight: 'bold' }}>{t.name}</p>
                  {t.source && <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{t.source}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="contact" style={{ padding: '4rem 2rem', background: primary, color: 'white', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: headingFont, marginBottom: '1rem' }}>Contact Us</h2>
        {config.contact?.email && <p style={{ marginBottom: '0.5rem' }}>{config.contact.email}</p>}
        {config.contact?.phone && <p style={{ marginBottom: '0.5rem' }}>{config.contact.phone}</p>}
        {config.contact?.whatsapp && <a href={`https://wa.me/${config.contact.whatsapp.replace(/[^0-9]/g, '')}`} style={{ display: 'inline-block', marginTop: '1rem', background: '#25D366', color: 'white', padding: '0.875rem 2rem', borderRadius: '9999px', fontWeight: 'bold', textDecoration: 'none' }}>WhatsApp</a>}
      </section>

      <footer style={{ background: primary, padding: '2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>&copy; {new Date().getFullYear()} {config.name}. All rights reserved.</p>
      </footer>
    </div>
  )
}
