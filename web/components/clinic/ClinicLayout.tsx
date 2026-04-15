import Image from 'next/image'
import type { TenantData } from '@/lib/tenant-content'
import { FaqAccordion } from './FaqAccordion'
import { MobileNav } from './MobileNav'
import { WhatsAppFloat } from './WhatsAppFloat'
import { PromoBanner } from './PromoBanner'
import { TrustBar } from './TrustBar'
import { InteractiveTools } from './InteractiveTools'
import { PartnersLogos } from './PartnersLogos'
import { ReferralSection } from './ReferralSection'
import { SignatureSection } from './SignatureSection'

interface Props {
  data: TenantData
}

type AnyRecord = Record<string, unknown>

export function ClinicLayout({ data }: Props) {
  const { config, theme, home, services } = data

  const primary = (theme.colors as AnyRecord)?.primary as string || '#1B3A6B'
  const accent = (theme.colors as AnyRecord)?.accent as string || '#C9A84C'
  const headingFont = (theme.fonts as AnyRecord)?.heading as string || "Georgia, serif"
  const bodyFont = (theme.fonts as AnyRecord)?.body as string || "'Inter', sans-serif"
  const bgDefault = (theme.colors as AnyRecord)?.background as AnyRecord || {}
  const bgDefaultVal = (bgDefault?.default as string) || '#FAFBFC'
  const bgSubtle = (bgDefault?.subtle as string) || '#F3F4F6'
  const textPrimary = ((theme.colors as AnyRecord)?.text as AnyRecord)?.primary as string || '#111827'
  const textSecondary = ((theme.colors as AnyRecord)?.text as AnyRecord)?.secondary as string || '#4B5563'

  const logoUrl = (config.branding as AnyRecord)?.logo_url as string | undefined
  const heroBgUrl = (config.branding as AnyRecord)?.hero_image_url as string | undefined
  const logoWidth = (config.branding as AnyRecord)?.logo_width as number || 160
  const logoHeight = (config.branding as AnyRecord)?.logo_height as number || 48

  const whatsapp = (config.contact as AnyRecord)?.whatsapp_number as string | undefined
  const phone = (config.contact as AnyRecord)?.phone_display as string | undefined
  const email = (config.contact as AnyRecord)?.email as string | undefined
  const address = (config.contact as AnyRecord)?.address as string | undefined
  const city = (config.contact as AnyRecord)?.city as string | undefined
  const country = (config.contact as AnyRecord)?.country as string || 'Paraguay'

  const waLink = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=Hola! Vi su página web y quisiera más información.`
    : null

  const homeAny = home as AnyRecord
  const features = (home.features || []) as AnyRecord[]
  const servicesItems = (services?.items || []) as AnyRecord[]
  const testimonialItems = (data.testimonials?.items || []) as AnyRecord[]
  const faqItems = (data.faq?.items || []) as AnyRecord[]

  return (
    <div style={{ fontFamily: bodyFont, color: textPrimary, background: bgDefaultVal, minHeight: '100vh' }}>

      {/* PROMO BANNER */}
      {homeAny.promo_banner?.enabled && homeAny.promo_banner?.text && (
        <PromoBanner
          text={homeAny.promo_banner.text}
          link={homeAny.promo_banner.link}
          primary={primary}
          accent={accent}
        />
      )}

      {/* MOBILE + DESKTOP NAV */}
      <MobileNav
        clinicName={config.name}
        logoUrl={logoUrl}
        logoWidth={logoWidth}
        logoHeight={logoHeight}
        primary={primary}
      />

      {/* HERO */}
      <section id="inicio" style={{ position: 'relative', overflow: 'hidden', minHeight: '580px', display: 'flex', alignItems: 'center', paddingTop: '60px' }}>
        {heroBgUrl ? (
          <div style={{ position: 'absolute', inset: 0 }}>
            <Image src={heroBgUrl} alt="" fill style={{ objectFit: 'cover' }} priority unoptimized />
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${primary} 0%, ${primary}dd 100%)`, opacity: 0.88 }} />
          </div>
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${primary} 0%, ${primary}dd 100%)` }} />
        )}

        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-15%', right: '-8%', width: '480px', height: '480px', borderRadius: '50%', background: accent, opacity: 0.07, filter: 'blur(64px)' }} />
          <div style={{ position: 'absolute', bottom: '-20%', left: '-8%', width: '380px', height: '380px', borderRadius: '50%', background: 'white', opacity: 0.05, filter: 'blur(64px)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: '5rem 1.5rem', width: '100%' }}>
          <div style={{ maxWidth: '700px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {city && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: '9999px', padding: '0.35rem 0.875rem', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.95)', fontSize: '0.8125rem', fontWeight: 500 }}>
                  📍 {city}, {country}
                </span>
              )}
              {homeAny.hero?.badge_text && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: `${accent}22`, borderRadius: '9999px', padding: '0.35rem 0.875rem', border: `1px solid ${accent}55`, color: accent, fontSize: '0.8125rem', fontWeight: 700 }}>
                  {homeAny.hero.badge_text}
                </span>
              )}
            </div>

            <h1 style={{ color: 'white', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, fontFamily: headingFont, lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
              {homeAny.hero?.headline || config.name}
            </h1>

            {homeAny.hero?.subheadline && (
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.125rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '580px' }}>
                {homeAny.hero.subheadline}
              </p>
            )}
            {homeAny.hero?.subhead && !homeAny.hero?.subheadline && (
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.125rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '580px' }}>
                {homeAny.hero.subhead}
              </p>
            )}

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {homeAny.hero?.cta_primary && (
                <a href="#contacto" style={{ background: accent, color: 'white', padding: '0.9rem 2rem', borderRadius: '9999px', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
                  {homeAny.hero.cta_primary}
                </a>
              )}
              {homeAny.hero?.cta_secondary && (
                <a href="#servicios" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: 'white', padding: '0.9rem 2rem', borderRadius: '9999px', fontWeight: 600, fontSize: '1rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)', display: 'inline-block' }}>
                  {homeAny.hero.cta_secondary}
                </a>
              )}
              {!homeAny.hero?.cta_secondary && waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: 'white', padding: '0.9rem 2rem', borderRadius: '9999px', fontWeight: 600, fontSize: '1rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)', display: 'inline-block' }}>
                  💬 Escribinos
                </a>
              )}
            </div>

            {/* Trust Badges */}
            {homeAny.hero?.trust_badges && (homeAny.hero.trust_badges as AnyRecord[]).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem' }}>
                {(homeAny.hero.trust_badges as AnyRecord[]).map((badge, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.8125rem' }}>
                    <span>{badge.icon === 'shield-check' ? '🛡️' : badge.icon === 'clock' ? '🕐' : badge.icon === 'award' ? '🏆' : badge.icon === 'microscope' ? '🔬' : badge.icon === 'graduation-cap' ? '🎓' : badge.icon === 'building-2' ? '🏢' : badge.icon === 'heart' ? '❤️' : badge.icon === 'sparkles' ? '✨' : badge.icon === 'coffee' ? '☕' : badge.icon === 'egg' ? '🥚' : badge.icon === 'leaf' ? '🍃' : badge.icon === 'truck' ? '🚚' : badge.icon === 'shield' ? '🛡️' : badge.icon === 'package' ? '📦' : badge.icon === 'lock' ? '🔒' : '⭐'}</span>
                    <span>{badge.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TRUST BAR / STATS */}
      {(homeAny.trust_bar || homeAny.stats_section?.items) && (
        <TrustBar 
          items={(homeAny.trust_bar || homeAny.stats_section?.items || []) as AnyRecord[]} 
          primary={primary} 
          accent={accent} 
        />
      )}

      {/* FEATURES */}
      {features.length > 0 && (
        <section style={{ padding: '5rem 1.5rem', background: bgDefaultVal }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span style={{ color: accent, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Por qué elegirnos</span>
              <h2 style={{ color: primary, fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, fontFamily: headingFont, marginTop: '0.5rem' }}>
                {homeAny.features_section?.title || 'Nuestros Diferenciadores'}
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {features.map((f, i) => (
                <div key={i} style={{ padding: '2rem', borderRadius: '12px', border: '1px solid #E5E7EB', background: 'white', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.08)' }}>
                  {f.icon && (
                    <div style={{ fontSize: '2rem', marginBottom: '1rem', width: '56px', height: '56px', background: `${primary}12`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {f.icon === 'heart-pulse' ? '❤️' : f.icon === 'shield-check' ? '🛡️' : f.icon === 'clock' ? '🕐' : f.icon === 'microscope' ? '🔬' : f.icon === 'scissors' ? '✂️' : f.icon === 'truck' ? '🚚' : f.icon === 'stethoscope' ? '🩺' : f.icon === 'waves' ? '🌊' : f.icon === 'trees' ? '🌳' : f.icon === 'home' ? '🏠' : f.icon === 'award' ? '🏆' : f.icon === 'star' ? '⭐' : f.icon === 'building' ? '🏢' : f.icon === 'tooth' ? '🦷' : f.icon === 'sparkles' ? '✨' : f.icon === 'palette' ? '🎨' : f.icon === 'file-text' ? '📄' : f.icon === 'leaf' ? '🍃' : f.icon === 'egg' ? '🥚' : '💡'}
                    </div>
                  )}
                  <h3 style={{ color: primary, fontWeight: 700, fontFamily: headingFont, fontSize: '1.0625rem', marginBottom: '0.5rem' }}>{f.title || f.name}</h3>
                  <p style={{ color: textSecondary, lineHeight: 1.65, fontSize: '0.9375rem', margin: 0 }}>{f.description || f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SERVICES */}
      {servicesItems.length > 0 && (
        <section id="servicios" style={{ padding: '5rem 1.5rem', background: bgSubtle }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span style={{ color: accent, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Lo que hacemos</span>
              <h2 style={{ color: primary, fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, fontFamily: headingFont, marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                {services.title || 'Nuestros Servicios'}
              </h2>
              {services.subtitle && (
                <p style={{ color: textSecondary, maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
                  {services.subtitle}
                </p>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {servicesItems.slice(0, 6).map((s, i) => (
                <div key={i} style={{ background: 'white', padding: '1.75rem', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <h3 style={{ color: primary, fontWeight: 700, fontFamily: headingFont, marginBottom: '0.5rem', fontSize: '1.0625rem' }}>{s.name}</h3>
                  {s.description && <p style={{ color: textSecondary, marginBottom: '0.75rem', lineHeight: 1.6 }}>{s.description}</p>}
                  {s.price && <p style={{ color: accent, fontWeight: 700, fontSize: '1.125rem' }}>{s.price}</p>}
                  {s.features && s.features.length > 0 && (
                    <ul style={{ marginTop: '1rem', paddingLeft: '1.25rem', marginBottom: 0 }}>
                      {s.features.map((f: string, j: number) => <li key={j} style={{ color: textSecondary, marginBottom: '0.25rem', fontSize: '0.875rem' }}>{f}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            {waLink && (
              <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ background: primary, color: 'white', padding: '0.875rem 2rem', borderRadius: '9999px', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.2)', display: 'inline-block' }}>
                  Consultar precio o reservar →
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* INTERACTIVE TOOLS */}
      {homeAny.interactive_tools_section?.enabled && homeAny.interactive_tools_section?.tools && (
        <InteractiveTools
          title={homeAny.interactive_tools_section.title}
          subtitle={homeAny.interactive_tools_section.subtitle}
          tools={homeAny.interactive_tools_section.tools}
          waLink={waLink}
          primary={primary}
          accent={accent}
        />
      )}

      {/* SIGNATURE SECTION (cafes/restaurants) */}
      {(homeAny as AnyRecord).signature_section?.copy && (
        <SignatureSection
          title={(homeAny as AnyRecord).signature_section?.title}
          copy={(homeAny as AnyRecord).signature_section?.copy}
          image={(homeAny as AnyRecord).signature_section?.image}
          primary={primary}
          accent={accent}
          headingFont={headingFont}
        />
      )}

      {/* REFERRAL SECTION (B2B/medical) */}
      {(homeAny as AnyRecord).referral_section?.enabled && (
        <ReferralSection
          title={(homeAny as AnyRecord).referral_section?.title}
          subtitle={(homeAny as AnyRecord).referral_section?.subtitle}
          benefits={(homeAny as AnyRecord).referral_section?.benefits}
          ctaText={(homeAny as AnyRecord).referral_section?.cta_text}
          waLink={waLink}
          primary={primary}
          accent={accent}
          headingFont={headingFont}
        />
      )}

      {/* PARTNERS / LOGOS */}
      {(homeAny as AnyRecord).partners_section?.enabled && (homeAny as AnyRecord).partners_section?.logos && (
        <PartnersLogos
          title={(homeAny as AnyRecord).partners_section?.title}
          logos={(homeAny as AnyRecord).partners_section?.logos}
          primary={primary}
          accent={accent}
        />
      )}

      {/* TESTIMONIALS */}
      {testimonialItems.length > 0 && (
        <section style={{ padding: '5rem 1.5rem', background: bgSubtle }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span style={{ color: accent, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Testimonios</span>
              <h2 style={{ color: primary, fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, fontFamily: headingFont, marginTop: '0.5rem' }}>
                {homeAny.testimonials_section?.title || 'Lo que dicen nuestros clientes'}
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {testimonialItems.slice(0, 3).map((t, i) => (
                <div key={i} style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                  <p style={{ color: textSecondary, fontStyle: 'italic', lineHeight: 1.7, marginBottom: '1.25rem' }}>"{t.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: primary }}>
                      {(t.name || t.author || '?').charAt(0)}
                    </div>
                    <div>
                      <p style={{ color: primary, fontWeight: 600, fontSize: '0.9375rem', margin: 0 }}>{t.name || t.author}</p>
                      {t.source && <p style={{ color: '#9CA3AF', fontSize: '0.8125rem', margin: 0 }}>{t.source}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqItems.length > 0 && (
        <section id="faq" style={{ padding: '5rem 1.5rem', background: bgDefaultVal }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span style={{ color: accent, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>Ayuda</span>
              <h2 style={{ color: primary, fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, fontFamily: headingFont, marginTop: '0.5rem' }}>
                {homeAny.faq?.title || 'Preguntas Frecuentes'}
              </h2>
            </div>
            <FaqAccordion items={faqItems} primary={primary} accent={accent} headingFont={headingFont} />
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section id="contacto" style={{ padding: '5rem 1.5rem', background: primary, color: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, fontFamily: headingFont, marginBottom: '1rem' }}>Contacto</h2>
          {config.tagline && <p style={{ opacity: 0.85, marginBottom: '2rem', fontSize: '1.0625rem' }}>{config.tagline}</p>}
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'left', background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '16px' }}>
            {email && (
              <div>
                <p style={{ opacity: 0.7, fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Email</p>
                <a href={`mailto:${email}`} style={{ color: 'white', textDecoration: 'none', fontWeight: 500 }}>{email}</a>
              </div>
            )}
            {phone && (
              <div>
                <p style={{ opacity: 0.7, fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Teléfono</p>
                <a href={`tel:${phone}`} style={{ color: 'white', textDecoration: 'none', fontWeight: 500 }}>{phone}</a>
              </div>
            )}
            {address && (
              <div>
                <p style={{ opacity: 0.7, fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Dirección</p>
                <p style={{ fontWeight: 500 }}>{address}</p>
              </div>
            )}
          </div>

          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '2rem', background: '#25D366', color: 'white', padding: '0.875rem 2rem', borderRadius: '9999px', fontWeight: 700, fontSize: '1rem', textDecoration: 'none' }}>
              💬 Escribinos por WhatsApp
            </a>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: primary, padding: '1.5rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', margin: 0 }}>© {new Date().getFullYear()} {config.name}. Todos los derechos reservados.</p>
      </footer>

      {/* WHATSAPP FLOAT */}
      <WhatsAppFloat phoneNumber={whatsapp} />
    </div>
  )
}
