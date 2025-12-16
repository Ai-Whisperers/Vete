
import { getClinicData, getAllClinics } from '@/lib/clinics';
import { notFound } from 'next/navigation';
import { ClinicThemeProvider } from '@/components/clinic-theme-provider';
import { Metadata } from 'next';
import Link from 'next/link';
import { MainNav } from '@/components/layout/main-nav';

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

  return (
    <div className="min-h-screen font-sans bg-[var(--bg-default)] text-[var(--text-main)] font-body">
      <ClinicThemeProvider theme={data.theme} />
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[var(--primary-light)]/20 bg-[var(--bg-default)]/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
            <Link href={`/${clinic}`} className="flex items-center gap-2 font-heading font-black text-2xl uppercase tracking-widest text-[var(--primary)] hover:opacity-80 transition-opacity">
                {data.config.branding?.logo_url ? (
                    <img 
                        src={data.config.branding.logo_url} 
                        alt={`${data.config.name} Logo`} 
                        className="object-contain"
                        style={{ 
                            width: data.config.branding.logo_width || 'auto', 
                            height: 56 // Increased from 40px
                        }} 
                    />
                ) : (
                    <span>{data.config.name}</span>
                )}
            </Link>
            
            <MainNav clinic={clinic} config={data.config} />

        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-[var(--bg-paper)] py-12 md:py-16">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 md:flex-row px-4 md:px-6">
             <div className="flex flex-col items-center gap-2 w-full">
                 <span className="text-lg font-black text-[var(--primary)] uppercase tracking-widest">{data.config.name}</span>
                  <p className="text-center text-base leading-loose text-[var(--text-secondary)]">
                  © 2024 {data.config.name}. {data.config.ui_labels?.footer.rights || 'Todos los derechos reservados.'}
                </p>
             </div>
             
             <div className="flex gap-6">
                {/* Socials Placeholder */}
             </div>
        </div>
      </footer>
    </div>
  );
}
