interface StatItem {
  value: string
  label: string
}

interface Props {
  items: StatItem[]
  primary: string
  accent: string
}

export function TrustBar({ items, primary, accent }: Props) {
  if (!items || items.length === 0) return null

  return (
    <div style={{
      background: primary,
      borderBottom: `3px solid ${accent}`,
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '1.5rem 1.5rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '3rem',
        flexWrap: 'wrap',
      }}>
        {items.map((stat, i) => (
          <div key={i} style={{ textAlign: 'center', minWidth: '80px' }}>
            <div style={{
              color: accent,
              fontSize: '1.875rem',
              fontWeight: 800,
              lineHeight: 1,
            }}>
              {stat.value}
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.8125rem',
              marginTop: '0.35rem',
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
