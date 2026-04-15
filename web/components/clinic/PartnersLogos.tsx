interface Partner {
  name: string
  image: string
}

interface Props {
  title?: string
  logos: Partner[]
  primary?: string
  accent?: string
}

export function PartnersLogos({ title, logos, primary = '#1B3A6B', accent = '#C9A84C' }: Props) {
  if (!logos || logos.length === 0) return null

  return (
    <section style={{ padding: '4rem 1.5rem', background: '#FAFBFC' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          {title && <h3 style={{ color: primary, fontWeight: 700, fontSize: '1.25rem', margin: 0, opacity: 0.7 }}>{title}</h3>}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '2.5rem' }}>
          {logos.map((partner, i) => (
            <div key={i} style={{ filter: 'grayscale(100%) opacity(0.6)', transition: 'all 0.3s ease' }} title={partner.name}>
              <div style={{ width: '120px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '8px', padding: '0.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <span style={{ color: primary, fontWeight: 600, fontSize: '0.875rem', textAlign: 'center' }}>{partner.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
