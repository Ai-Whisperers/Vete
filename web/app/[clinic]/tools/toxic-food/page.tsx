
'use client';

import { ToxicFoodSearch } from '@/components/tools/toxic-food-search';
import * as Icons from 'lucide-react';

const TOXIC_ITEMS = [
  { name: 'Chocolate', toxicity: 'Alta', symptoms: 'Arritmias, convulsiones, vómitos.', notes: 'Más oscuro = Más peligroso.' },
  { name: 'Uvas / Pasas', toxicity: 'Alta', symptoms: 'Falla renal aguda, anuria.', notes: 'Incluso una pequeña cantidad es fatal.' },
  { name: 'Cebolla / Ajo', toxicity: 'Media', symptoms: 'Debilidad, encías pálidas (anemia).', notes: 'Daña los glóbulos rojos.' },
  { name: 'Xilitol (Edulcorante)', toxicity: 'Alta', symptoms: 'Convulsiones, colapso repentino.', notes: 'Presente en chicles y mantequilla de maní.' },
  { name: 'Aguacate (Palta)', toxicity: 'Media', symptoms: 'Vómitos, diarrea.', notes: 'Contiene Persina.' },
  { name: 'Alcohol', toxicity: 'Alta', symptoms: 'Coma, dificultad respiratoria.', notes: 'Nunca dar bebidas alcohólicas.' },
  { name: 'Cafeína', toxicity: 'Media', symptoms: 'Hiperactividad, temblores.', notes: 'Café, té, bebidas energéticas.' },
  { name: 'Huesos Cocidos', toxicity: 'Alta', symptoms: 'Perforación intestinal, asfixia.', notes: 'Se astillan fácilmente.' },
  { name: 'Nueces de Macadamia', toxicity: 'Media', symptoms: 'Debilidad, parálisis temporal.', notes: 'Afecta el sistema nervioso.' },
];

export default function ToxicFoodPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-default)] font-body">
      
      {/* Header */}
      <div className="pt-20 pb-12 text-center bg-[var(--bg-paper)] shadow-sm mb-12 border-b">
         <div className="container px-4 mx-auto">
            <h1 className="text-3xl md:text-5xl font-black text-[var(--primary)] mb-4 font-heading">Verificador de Alimentos</h1>
            <p className="text-[var(--text-secondary)] text-lg">Busca un alimento para saber si es seguro para tu mascota.</p>
         </div>
      </div>

      <div className="container px-4 md:px-6 max-w-4xl mx-auto pb-20">
        {/* Search Component */}
        <ToxicFoodSearch items={TOXIC_ITEMS as any[]} />
        
        <div className="mt-16 p-6 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-900 flex gap-4 items-start shadow-sm">
             <Icons.Info className="w-6 h-6 flex-shrink-0 text-blue-500 mt-1" />
             <p className="leading-relaxed"><strong>Nota Importante:</strong> Esta herramienta es solo orientativa y no sustituye el consejo veterinario profesional. Si sospechas que tu mascota ha ingerido algo tóxico, contacta a urgencias inmediatamente.</p>
        </div>

      </div>
    </div>
  );
}
