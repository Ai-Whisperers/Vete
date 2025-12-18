import { getClinicData } from '@/lib/clinics';
import { notFound } from 'next/navigation';
import { AgeCalculator } from '@/components/tools/age-calculator';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ clinic: string }> }): Promise<Metadata> {
  const { clinic } = await params;
  const data = await getClinicData(clinic);
  if (!data) return {};
  return {
    title: `Calculadora de Edad - ${data.config.name}`,
    description: 'Descubre la edad real de tu mascota en años humanos.'
  };
}

export default async function AgeCalculatorPage({ params }: { params: Promise<{ clinic: string }> }) {
  const { clinic } = await params;
  const data = await getClinicData(clinic);

  if (!data || !data.config.settings.modules.age_calculator) {
     return notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--bg-default)] pb-24">
      {/* Decorative Header */}
      <div className="bg-[var(--primary)] pt-32 pb-24 relative overflow-hidden">
         <div className="absolute inset-0 bg-black/10" />
         <div className="container relative z-10 px-4 text-center text-white">
            <h1 className="text-4xl md:text-5xl font-heading font-black mb-4">Calculadora de Edad</h1>
            <p className="text-xl opacity-90">¿Sabías que 1 año de perro NO son 7 años humanos?</p>
         </div>
      </div>

      <div className="container px-4 -mt-16 relative z-20">
        <AgeCalculator config={data.config} />
      </div>
    </div>
  );
}
