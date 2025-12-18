import { ToxicFoodSearch } from '@/components/tools/toxic-food-search';
import { TOXIC_FOODS, SPECIES_LABELS } from '@/data/toxic-foods';
import { Info, AlertTriangle, Sparkles } from 'lucide-react';
import { getClinicData } from '@/lib/clinics';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ clinic: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clinic } = await params;
  const clinicData = await getClinicData(clinic);

  return {
    title: `Alimentos Tóxicos para Mascotas | ${clinicData?.config.name || 'Veterinaria'}`,
    description: 'Verifica si un alimento es seguro para tu mascota. Base de datos completa de alimentos tóxicos para perros, gatos, aves, conejos y más.',
  };
}

export async function generateStaticParams(): Promise<{ clinic: string }[]> {
  return [{ clinic: 'adris' }, { clinic: 'petlife' }];
}

export default async function ToxicFoodPage({ params }: Props): Promise<React.ReactElement> {
  const { clinic } = await params;
  const clinicData = await getClinicData(clinic);

  if (!clinicData) {
    notFound();
  }

  // Check if module is enabled
  const modules = clinicData.config.modules || {};
  if (modules.toxicFoodChecker === false) {
    notFound();
  }

  // Stats for the header
  const highToxicity = TOXIC_FOODS.filter(f => f.toxicity === 'Alta').length;
  const speciesCount = Object.keys(SPECIES_LABELS).length;

  return (
    <div className="min-h-screen bg-[var(--bg-default)] font-body">
      {/* Header */}
      <div className="pt-20 pb-12 text-center bg-gradient-to-b from-red-50 to-[var(--bg-paper)] shadow-sm mb-8 border-b">
        <div className="container px-4 mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-4">
            <AlertTriangle className="w-4 h-4" />
            Herramienta de Seguridad
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[var(--primary)] mb-4 font-heading">
            Verificador de Alimentos Tóxicos
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            Consulta nuestra base de datos con <strong>{TOXIC_FOODS.length}+ alimentos</strong> para
            verificar si son seguros para tu mascota.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-6 mt-6">
            <div className="text-center">
              <p className="text-2xl font-black text-red-600">{highToxicity}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Alta Toxicidad</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-2xl font-black text-[var(--primary)]">{speciesCount}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Especies</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-2xl font-black text-purple-600">
                <Sparkles className="w-6 h-6 inline" />
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Con IA</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 max-w-5xl mx-auto pb-20">
        {/* Search Component with full data */}
        <ToxicFoodSearch items={TOXIC_FOODS} />

        {/* Info Box */}
        <div className="mt-12 p-6 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-900 flex gap-4 items-start shadow-sm">
          <Info className="w-6 h-6 flex-shrink-0 text-blue-500 mt-1" />
          <div>
            <p className="font-bold mb-1">Nota Importante</p>
            <p className="leading-relaxed">
              Esta herramienta es solo orientativa y no sustituye el consejo veterinario profesional.
              Si sospechas que tu mascota ha ingerido algo tóxico, contacta a{' '}
              <strong>{clinicData.config.name}</strong> inmediatamente o acude a urgencias.
            </p>
            {clinicData.config.contact?.emergencyPhone && (
              <p className="mt-2 font-medium">
                Emergencias: {clinicData.config.contact.emergencyPhone}
              </p>
            )}
          </div>
        </div>

        {/* Sources */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>
            Fuentes: ASPCA Poison Control, Pet Poison Helpline, FDA, literatura veterinaria.
          </p>
        </div>
      </div>
    </div>
  );
}
