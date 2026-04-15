'use client'

interface Props {
  text: string
  link?: string
  primary?: string
  accent?: string
}

export function PromoBanner({ text, link, primary = '#1B3A6B', accent = '#C9A84C' }: Props) {
  if (!text) return null

  const content = (
    <div style={{
      background: `${accent}15`,
      borderBottom: `2px solid ${accent}`,
      padding: '0.875rem 1.5rem',
      textAlign: 'center',
    }}>
      <span style={{
        color: primary,
        fontWeight: 600,
        fontSize: '0.9375rem',
      }}>
        {text}
      </span>
    </div>
  )

  if (link) {
    return <a href={link} style={{ textDecoration: 'none', display: 'block' }}>{content}</a>
  }

  return content
}
