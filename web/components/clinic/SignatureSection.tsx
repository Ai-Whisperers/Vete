import Image from 'next/image'

interface Props {
  title?: string
  copy?: string
  image?: string
  primary?: string
  accent?: string
  headingFont?: string
}

export function SignatureSection({ title, copy, image, primary = '#1B3A6B', accent = '#C9A84C', headingFont = 'Georgia, serif' }: Props) {
  if (!copy) return null

  return (
    <section style={{ padding: '5rem 1.5rem', background: '#FAFBFC' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
        <div>
          <span style={{ color: accent, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Historia</span>
          <h2 style={{ color: primary, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, fontFamily: headingFont, marginTop: '0.5rem', marginBottom: '1rem' }}>
            {title || 'Nuestra Especialidad'}
          </h2>
          <p style={{ color: '#4B5563', fontSize: '1.0625rem', lineHeight: 1.8 }}>{copy}</p>
        </div>
        {image && (
          <div style={{ position: 'relative', height: '300px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
            <Image src={image} alt="" fill style={{ objectFit: 'cover' }} unoptimized />
          </div>
        )}
      </div>
    </section>
  )
}
