interface Props {
  title?: string
  subtitle?: string
  benefits?: string[]
  ctaText?: string
  waLink?: string | null
  primary?: string
  accent?: string
  headingFont?: string
}

export function ReferralSection({ title, subtitle, benefits = [], ctaText, waLink, primary = '#1B3A6B', accent = '#C9A84C', headingFont = 'Georgia, serif' }: Props) {
  return (
    <section style={{ padding: '5rem 1.5rem', background: `${primary}05` }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ color: accent, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Colaboración</span>
          <h2 style={{ color: primary, fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, fontFamily: headingFont, marginTop: '0.5rem' }}>
            {title || 'Programa de Derivaciones'}
          </h2>
          {subtitle && <p style={{ color: '#4B5563', maxWidth: '600px', margin: '0.75rem auto 0', lineHeight: 1.7 }}>{subtitle}</p>}
        </div>

        {benefits.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
            {benefits.map((benefit, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <span style={{ color: accent, fontWeight: 700 }}>✓</span>
                <span style={{ color: '#374151', fontSize: '0.9375rem' }}>{benefit}</span>
              </div>
            ))}
          </div>
        )}

        {waLink && ctaText && (
          <div style={{ textAlign: 'center' }}>
            <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: primary, color: 'white', padding: '0.875rem 2rem', borderRadius: '9999px', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
              {ctaText} →
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
