
import { getClinicData, getAllClinics } from '@/lib/clinics';
import { notFound } from 'next/navigation';
import { ClinicThemeProvider } from '@/components/clinic-theme-provider';
import { Metadata } from 'next';
import Link from 'next/link';
import { MainNav } from '@/components/layout/main-nav';
import { ToastProvider } from '@/components/ui/Toast';
import { CartProvider } from '@/context/cart-context';
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail, Clock } from 'lucide-react';

// Generate metadata dynamically
export async function generateMetadata({ params }: { params: Promise<{ clinic: string }> }): Promise<Metadata> {
  const { clinic } = await params;
  const data = await getClinicData(clinic);
  if (!data) return { title: 'Clinic Not Found' };

  return {
    title: data.home.seo?.meta_title || data.config.name,
    description: data.home.seo?.meta_description || `Welcome to ${data.config.name}`,
    icons: {
      icon: data.config.branding?.favicon_url || '/favicon.ico',
    }
  };
}

export async function generateStaticParams() {
  const clinics = await getAllClinics();
  return clinics.map((clinic) => ({
    clinic: clinic,
  }));
}

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

  return (
    <ToastProvider>
      <CartProvider>
        <div className="min-h-screen font-sans bg-[var(--bg-default)] text-[var(--text-main)] font-body flex flex-col">
          <ClinicThemeProvider theme={data.theme} />

          {/* Header */}
          <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
              <Link
                href={`/${clinic}`}
                className="flex items-center gap-3 font-heading font-black text-2xl uppercase tracking-widest text-[var(--primary)] hover:opacity-80 transition-opacity"
              >
                {config.branding?.logo_url ? (
                  <img
                    src={config.branding.logo_url}
                    alt={`${config.name} Logo`}
                    className="object-contain"
                    style={{
                      width: config.branding.logo_width || 'auto',
                      height: 56
                    }}
                  />
                ) : (
                  <span>{config.name}</span>
                )}
              </Link>
              <MainNav clinic={clinic} config={config} />
            </div>
          </header>

          <main className="flex-1">
            {children}
          </main>

          {/* Footer - Enhanced */}
          <footer className="bg-[var(--bg-dark,#1a1a1a)] text-white relative overflow-hidden">
            {/* Decorative top border */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary)]" />

            <div className="container mx-auto px-4 md:px-6 py-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

                {/* Brand Column */}
                <div className="lg:col-span-1">
                  <Link href={`/${clinic}`} className="inline-block mb-6">
                    {config.branding?.logo_dark_url ? (
                      <img
                        src={config.branding.logo_dark_url}
                        alt={config.name}
                        className="h-12 w-auto"
                      />
                    ) : (
                      <span className="text-2xl font-heading font-black text-white">
                        {config.name}
                      </span>
                    )}
                  </Link>
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
                  </div>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">
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
                      <Link href={`/${clinic}/portal/login`} className="text-gray-400 hover:text-white transition-colors text-sm">
                        Portal de Dueños
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Contact Info */}
                <div>
                  <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">
                    {footerLabels.contact_us || 'Contacto'}
                  </h4>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-400 text-sm">{config.contact.address}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
                      <a href={`tel:${config.contact.whatsapp_number}`} className="text-gray-400 hover:text-white transition-colors text-sm">
                        {config.contact.phone_display}
                      </a>
                    </li>
                    <li className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
                      <a href={`mailto:${config.contact.email}`} className="text-gray-400 hover:text-white transition-colors text-sm">
                        {config.contact.email}
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Hours */}
                <div>
                  <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">
                    Horarios
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-white font-medium">Lun - Vie</p>
                        <p className="text-gray-400">{config.hours.weekdays}</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-white font-medium">Sábados</p>
                        <p className="text-gray-400">{config.hours.saturday}</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      </div>
                      <div className="text-sm">
                        <p className="text-[var(--accent)] font-bold">Urgencias 24hs</p>
                        <p className="text-gray-400">Todos los días</p>
                      </div>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Bottom Bar */}
              <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-gray-500 text-sm text-center md:text-left">
                  © {new Date().getFullYear()} {config.name}. {footerLabels.rights || 'Todos los derechos reservados.'}
                </p>
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
        </div>
      </CartProvider>
    </ToastProvider>
  );
}
