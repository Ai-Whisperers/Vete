
import { getClinicData } from '@/lib/clinics';
import { notFound } from 'next/navigation';
import { ClinicThemeProvider } from '@/components/clinic-theme-provider';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MainNav } from '@/components/layout/main-nav';
import { ToastProvider } from '@/components/ui/Toast';
import { CartProvider } from '@/context/cart-context';
import { CommandPaletteProvider } from '@/components/search/command-palette-provider';
import { CartLayoutWrapper } from '@/components/cart/cart-layout-wrapper';
import { createClient } from '@/lib/supabase/server';
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import { FooterLogo } from '@/components/layout/footer-logo';
import { Copyright } from '@/components/ui/copyright';

const BASE_URL = 'https://vetepy.vercel.app';

// Generate metadata dynamically with full SEO support
export async function generateMetadata({ params }: { params: Promise<{ clinic: string }> }): Promise<Metadata> {
  const { clinic } = await params;
  const data = await getClinicData(clinic);
  if (!data) return { title: 'Clinic Not Found' };

  const { config, home } = data;
  const seo = home?.seo;
  const title = seo?.meta_title || config.name;
  const description = seo?.meta_description || `Bienvenido a ${config.name}`;
  const ogImage = config.branding?.og_image_url || '/branding/default-og.jpg';
  const canonicalUrl = `${BASE_URL}/${clinic}`;

  return {
    title,
    description,
    keywords: seo?.keywords?.join(', '),
    authors: [{ name: config.name }],
    creator: config.name,
    publisher: config.name,
    icons: {
      icon: config.branding?.favicon_url || '/favicon.ico',
      apple: config.branding?.apple_touch_icon || '/apple-touch-icon.png',
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      locale: seo?.og_locale || 'es_PY',
      url: canonicalUrl,
      title,
      description,
      siteName: config.name,
      images: [
        {
          url: ogImage.startsWith('/') ? `${BASE_URL}${ogImage}` : ogImage,
          width: 1200,
          height: 630,
          alt: `${config.name} - ${config.tagline}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage.startsWith('/') ? `${BASE_URL}${ogImage}` : ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Generate LocalBusiness/VeterinaryCare structured data
function generateStructuredData(clinic: string, config: {
  name: string;
  tagline?: string;
  contact: {
    phone_display: string;
    whatsapp_number: string;
    email: string;
    address: string;
    city?: string;
    country?: string;
    coordinates?: { lat: number; lng: number };
    google_maps_id?: string;
  };
  hours?: { weekdays?: string; saturday?: string; sunday?: string };
  branding?: { logo_url?: string; og_image_url?: string };
  social?: { facebook?: string; instagram?: string };
}) {
  const { contact, hours, branding, social } = config;

  // Parse opening hours for schema
  const openingHours = [];
  if (hours?.weekdays) {
    const [open, close] = hours.weekdays.split(' - ');
    openingHours.push({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: open,
      closes: close,
    });
  }
  if (hours?.saturday) {
    const [open, close] = hours.saturday.split(' - ');
    openingHours.push({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: open,
      closes: close,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'VeterinaryCare',
    '@id': `${BASE_URL}/${clinic}#organization`,
    name: config.name,
    description: config.tagline || `Clínica veterinaria ${config.name}`,
    url: `${BASE_URL}/${clinic}`,
    telephone: contact.phone_display,
    email: contact.email,
    image: branding?.og_image_url ? `${BASE_URL}${branding.og_image_url}` : undefined,
    logo: branding?.logo_url ? `${BASE_URL}${branding.logo_url}` : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.address,
      addressLocality: contact.city || 'Asunción',
      addressCountry: contact.country || 'PY',
    },
    geo: contact.coordinates ? {
      '@type': 'GeoCoordinates',
      latitude: contact.coordinates.lat,
      longitude: contact.coordinates.lng,
    } : undefined,
    openingHoursSpecification: openingHours,
    sameAs: [
      social?.facebook,
      social?.instagram,
    ].filter(Boolean),
    hasMap: contact.google_maps_id
      ? `https://www.google.com/maps/place/?q=place_id:${contact.google_maps_id}`
      : undefined,
    priceRange: '$$',
    currenciesAccepted: 'PYG',
    paymentAccepted: 'Cash, Credit Card, Debit Card',
    areaServed: {
      '@type': 'City',
      name: contact.city || 'Asunción',
    },
    medicalSpecialty: [
      'Veterinary Medicine',
      'Emergency Medicine',
      'Surgery',
      'Diagnostic Imaging',
    ],
  };
}

// Note: generateStaticParams removed to allow dynamic rendering
// Many child pages have client components that can't be serialized during static generation
// This allows all pages to be server-rendered on-demand

export default async function ClinicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clinic: string }>;
}) {
  const { clinic } = await params;
  const data = await getClinicData(clinic);

  if (!data) {
    notFound();
  }

  const { config } = data;
  const footerLabels = config.ui_labels?.footer || {};

  // Check if user is logged in for cart UI
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  // Generate structured data for SEO
  const structuredData = generateStructuredData(clinic, config);

  return (
    <ToastProvider>
      <CartProvider>
        <CommandPaletteProvider>
          <div className="min-h-screen font-sans bg-[var(--bg-default)] text-[var(--text-main)] font-body flex flex-col">
            <ClinicThemeProvider theme={data.theme} />

          {/* JSON-LD Structured Data for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />

          {/* Skip Link for Accessibility */}
          <a href="#main-content" className="skip-link">
            Saltar al contenido principal
          </a>

          {/* Header */}
          <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm" role="banner">
            <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
              <Link
                href={`/${clinic}`}
                className="flex items-center gap-3 font-heading font-black text-2xl uppercase tracking-widest text-[var(--primary)] hover:opacity-80 transition-opacity"
              >
                {config.branding?.logo_url ? (
                  <Image
                    src={config.branding.logo_url}
                    alt={`${config.name} Logo`}
                    width={config.branding.logo_width || 150}
                    height={config.branding.logo_height || 56}
                    className="object-contain"
                    style={{ width: 'auto', height: 'auto' }}
                    priority
                  />
                ) : (
                  <span>{config.name}</span>
                )}
              </Link>
              <MainNav clinic={clinic} config={config} />
            </div>
          </header>

          <main id="main-content" tabIndex={-1} className="flex-1">
            {children}
          </main>

          {/* Footer - Enhanced */}
          <footer className="bg-[var(--bg-dark,#1a1a1a)] text-white relative overflow-hidden" role="contentinfo">
            {/* Decorative top border */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary)]" aria-hidden="true" />

            <div className="container mx-auto px-4 md:px-6 py-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

                {/* Brand Column */}
                <div className="lg:col-span-1">
                  <FooterLogo 
                    clinic={clinic}
                    logoUrl={config.branding?.logo_dark_url}
                    name={config.name}
                  />
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {config.tagline}
                  </p>

                  {/* Social Links */}
                  <div className="flex gap-3">
                    {config.social?.facebook && (
                      <a
                        href={config.social.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--primary)] transition-colors"
                        aria-label="Facebook"
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    {config.social?.instagram && (
                      <a
                        href={config.social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--primary)] transition-colors"
                        aria-label="Instagram"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {config.social?.youtube && (
                      <a
                        href={config.social.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--primary)] transition-colors"
                        aria-label="YouTube"
                      >
                        <Youtube className="w-5 h-5" />
                      </a>
                    )}
                    {config.social?.tiktok && (
                      <a
                        href={config.social.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--primary)] transition-colors"
                        aria-label="TikTok"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                        </svg>
                      </a>
                    )}
                    {config.contact?.whatsapp_number && (
                      <a
                        href={`https://wa.me/${config.contact.whatsapp_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors"
                        aria-label="WhatsApp"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Quick Links */}
                <nav aria-labelledby="footer-quick-links">
                  <h4 id="footer-quick-links" className="font-bold text-white mb-6 text-sm uppercase tracking-wider">
                    Enlaces Rápidos
                  </h4>
                  <ul className="space-y-3">
                    <li>
                      <Link href={`/${clinic}`} className="text-gray-400 hover:text-white transition-colors text-sm">
                        Inicio
                      </Link>
                    </li>
                    <li>
                      <Link href={`/${clinic}/services`} className="text-gray-400 hover:text-white transition-colors text-sm">
                        Servicios
                      </Link>
                    </li>
                    <li>
                      <Link href={`/${clinic}/about`} className="text-gray-400 hover:text-white transition-colors text-sm">
                        Nosotros
                      </Link>
                    </li>
                    <li>
                      <Link href={`/${clinic}/store`} className="text-gray-400 hover:text-white transition-colors text-sm">
                        Tienda
                      </Link>
                    </li>
                    <li>
                      <Link href={`/${clinic}/faq`} className="text-gray-400 hover:text-white transition-colors text-sm">
                        Preguntas Frecuentes
                      </Link>
                    </li>
                    <li>
                      <Link href={`/${clinic}/portal/login`} className="text-gray-400 hover:text-white transition-colors text-sm">
                        Portal de Dueños
                      </Link>
                    </li>
                  </ul>
                </nav>

                {/* Tools Section */}
                <nav aria-labelledby="footer-tools">
                  <h4 id="footer-tools" className="font-bold text-white mb-6 text-sm uppercase tracking-wider">
                    Herramientas
                  </h4>
                  <ul className="space-y-3">
                    <li>
                      <Link href={`/${clinic}/tools/age-calculator`} className="text-gray-400 hover:text-white transition-colors text-sm">
                        Calculadora de Edad
                      </Link>
                    </li>
                    <li>
                      <Link href={`/${clinic}/tools/toxic-food`} className="text-gray-400 hover:text-white transition-colors text-sm">
                        Alimentos Tóxicos
                      </Link>
                    </li>
                    <li>
                      <Link href={`/${clinic}/book`} className="text-gray-400 hover:text-white transition-colors text-sm">
                        Agendar Cita
                      </Link>
                    </li>
                    <li>
                      <Link href={`/${clinic}/loyalty_points`} className="text-gray-400 hover:text-white transition-colors text-sm">
                        Programa de Lealtad
                      </Link>
                    </li>
                  </ul>
                </nav>

                {/* Contact Info */}
                <div aria-labelledby="footer-contact">
                  <h4 id="footer-contact" className="font-bold text-white mb-6 text-sm uppercase tracking-wider">
                    {footerLabels.contact_us || 'Contacto'}
                  </h4>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-gray-400 text-sm">{config.contact.address}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-[var(--primary)] flex-shrink-0" aria-hidden="true" />
                      <a href={`tel:${config.contact.whatsapp_number}`} className="text-gray-400 hover:text-white transition-colors text-sm">
                        {config.contact.phone_display}
                      </a>
                    </li>
                    <li className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-[var(--primary)] flex-shrink-0" aria-hidden="true" />
                      <a href={`mailto:${config.contact.email}`} className="text-gray-400 hover:text-white transition-colors text-sm">
                        {config.contact.email}
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Hours */}
                <div aria-labelledby="footer-hours">
                  <h4 id="footer-hours" className="font-bold text-white mb-6 text-sm uppercase tracking-wider">
                    Horarios
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-[var(--primary)] flex-shrink-0" aria-hidden="true" />
                      <div className="text-sm">
                        <p className="text-white font-medium">Lun - Vie</p>
                        <p className="text-gray-400">{config.hours?.weekdays || '8:00 - 18:00'}</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-[var(--primary)] flex-shrink-0" aria-hidden="true" />
                      <div className="text-sm">
                        <p className="text-white font-medium">Sábados</p>
                        <p className="text-gray-400">{config.hours?.saturday || '8:00 - 12:00'}</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
                      </div>
                      <div className="text-sm">
                        <p className="text-[var(--accent)] font-bold">Urgencias 24hs</p>
                        <p className="text-gray-400">Todos los días</p>
                      </div>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Newsletter Section */}
              <section aria-labelledby="newsletter-heading" className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/20 border border-white/10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h4 id="newsletter-heading" className="font-bold text-white text-lg mb-1">
                      {footerLabels.newsletter_title || 'Suscríbete a nuestro boletín'}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Recibe tips de cuidado, ofertas exclusivas y novedades.
                    </p>
                  </div>
                  <form className="flex gap-2 w-full md:w-auto" action={`/api/newsletter`} method="POST">
                    <input type="hidden" name="clinic" value={clinic} />
                    <label htmlFor="newsletter-email" className="sr-only">
                      Correo electrónico para suscripción
                    </label>
                    <input
                      id="newsletter-email"
                      type="email"
                      name="email"
                      placeholder={footerLabels.newsletter_placeholder || 'Tu email'}
                      required
                      aria-required="true"
                      className="flex-1 md:w-64 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                      {footerLabels.newsletter_button || 'Enviar'}
                    </button>
                  </form>
                </div>
              </section>

              {/* Bottom Bar */}
              <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <Copyright
                  companyName={config.name}
                  rightsText={footerLabels.rights || 'Todos los derechos reservados.'}
                />
                <div className="flex gap-6 text-sm">
                  <Link href={`/${clinic}/privacy`} className="text-gray-500 hover:text-white transition-colors">
                    {footerLabels.privacy || 'Privacidad'}
                  </Link>
                  <Link href={`/${clinic}/terms`} className="text-gray-500 hover:text-white transition-colors">
                    {footerLabels.terms || 'Términos'}
                  </Link>
                </div>
              </div>
            </div>
          </footer>

          {/* Cart UI (only for logged-in users) */}
          <CartLayoutWrapper isLoggedIn={isLoggedIn} />
          </div>
        </CommandPaletteProvider>
      </CartProvider>
    </ToastProvider>
  );
}
