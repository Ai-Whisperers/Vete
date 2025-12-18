'use client';

import { useState } from 'react';
import { createMedicalRecord } from '@/app/actions/medical-records';
import { useFormStatus } from 'react-dom';
import * as Icons from 'lucide-react';
import Link from 'next/link';
import { DiagnosisSearch } from '@/components/clinical/diagnosis-search';
import { DosageCalculator } from '@/components/clinical/dosage-calculator';
import { QoLAssessment } from '@/components/clinical/qol-assessment';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <Icons.Loader2 className="animate-spin" />
      ) : (
        <><Icons.Save className="w-5 h-5" /> Guardar Registro</>
      )}
    </button>
  );
}

export default function NewRecordForm({ clinic, petId, initialWeight }: { clinic: string, petId: string, initialWeight?: number }) {
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [showToolbox, setShowToolbox] = useState<'calculator' | 'qol' | null>(null);

  const handleQoLComplete = (score: number, summary: string) => {
      setNotes(prev => prev + (prev ? '\n\n' : '') + summary);
      setShowToolbox(null);
  };

  return (
    <div className="relative">
        <form action={createMedicalRecord} className="space-y-6">
            <input type="hidden" name="clinic" value={clinic} />
            <input type="hidden" name="pet_id" value={petId} />

            {/* Type Selection */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                    { id: 'consultation', label: 'Consulta', icon: Icons.Stethoscope },
                    { id: 'exam', label: 'Examen', icon: Icons.Microscope },
                    { id: 'surgery', label: 'Cirugía', icon: Icons.Scissors },
                    { id: 'hospitalization', label: 'Internación', icon: Icons.Bed },
                    { id: 'wellness', label: 'Wellness', icon: Icons.HeartPulse },
                    { id: 'other', label: 'Otro', icon: Icons.FileText },
                ].map((type) => (
                    <label key={type.id} className="cursor-pointer">
                        <input type="radio" name="type" value={type.id} className="peer sr-only" required />
                        <div className="flex flex-col items-center justify-center p-4 bg-white border-2 border-gray-100 rounded-xl peer-checked:border-[var(--primary)] peer-checked:bg-[var(--primary)]/5 hover:bg-gray-50 transition-all">
                            <type.icon className="w-6 h-6 mb-2 text-gray-400 peer-checked:text-[var(--primary)]" />
                            <span className="font-bold text-sm text-gray-500 peer-checked:text-[var(--primary)]">{type.label}</span>
                        </div>
                    </label>
                ))}
            </div>

            {/* Title */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Título del Evento</label>
                <input 
                    name="title" 
                    type="text" 
                    placeholder="Ej. Control Anual, Vómitos, Castración..." 
                    className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-[var(--primary)] outline-none transition-colors font-medium"
                    required
                />
            </div>

            {/* Standardized Diagnosis Integration */}
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                        <Icons.Search className="w-4 h-4 text-blue-500" /> Búsqueda VeNom
                    </label>
                    <DiagnosisSearch 
                        onSelect={(d) => setDiagnosis(d.term)}
                        placeholder="Buscar término médico..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Diagnóstico Resultante</label>
                    <input 
                        name="diagnosis" 
                        type="text" 
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="Se autocompleta arriba o escribe manual..." 
                        className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-[var(--primary)] outline-none transition-colors font-medium"
                    />
                </div>
            </div>

            {/* Vitals Section */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-[var(--text-secondary)] mb-4 flex items-center justify-between gap-2 text-sm uppercase">
                    <span className="flex items-center gap-2"><Icons.Activity className="w-4 h-4"/> Signos Vitales</span>
                    <div className="flex gap-4">
                        <button 
                            type="button"
                            onClick={() => setShowToolbox(showToolbox === 'qol' ? null : 'qol')}
                            className="text-orange-500 hover:underline flex items-center gap-1 normal-case font-bold"
                        >
                            <Icons.Heart className="w-4 h-4" /> Escala QoL
                        </button>
                        <button 
                            type="button"
                            onClick={() => setShowToolbox(showToolbox === 'calculator' ? null : 'calculator')}
                            className="text-[var(--primary)] hover:underline flex items-center gap-1 normal-case font-bold"
                        >
                            <Icons.Calculator className="w-4 h-4" /> Calculadora de Dosis
                        </button>
                    </div>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                         <label className="block text-xs font-bold text-gray-500 mb-1">Peso (kg)</label>
                         <input name="weight" type="number" step="0.1" defaultValue={initialWeight} className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[var(--primary)] text-center font-bold" placeholder="0.0" />
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gray-500 mb-1">Temp (°C)</label>
                         <input name="temp" type="number" step="0.1" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[var(--primary)] text-center font-bold" placeholder="38.5" />
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gray-500 mb-1">Frec. Card. (lpm)</label>
                         <input name="hr" type="number" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[var(--primary)] text-center font-bold" placeholder="80" />
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gray-500 mb-1">Frec. Resp. (rpm)</label>
                         <input name="rr" type="number" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[var(--primary)] text-center font-bold" placeholder="20" />
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Notas Clínicas</label>
                <textarea 
                    name="notes" 
                    rows={6}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describa el cuadro clínico, tratamiento recetado y observaciones..." 
                    className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-[var(--primary)] outline-none transition-colors resize-none"
                ></textarea>
            </div>

            {/* Attachments */}
            <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Adjuntos (Imágenes/PDF)</label>
                 <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                     <input type="file" name="attachments" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                     <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-[var(--primary)]">
                         <Icons.UploadCloud className="w-8 h-8" />
                         <p className="font-bold text-sm">Arrastra archivos o haz clic para subir</p>
                     </div>
                 </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
                <Link href={`/${clinic}/portal/pets/${petId}`} className="w-1/3 py-4 text-center text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">
                    Cancelar
                </Link>
                <div className="flex-1">
                    <SubmitButton />
                </div>
            </div>
        </form>

        {/* Floating/Side Tools Wrapper */}
        {showToolbox && (
            <div className="fixed inset-y-0 right-0 w-96 bg-gray-50 shadow-2xl z-50 p-6 border-l border-gray-200 animate-in slide-in-from-right duration-300 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-black text-xl text-gray-900">
                        {showToolbox === 'calculator' ? 'Calculadora' : 'Evaluación QoL'}
                    </h2>
                    <button onClick={() => setShowToolbox(null)} className="p-2 hover:bg-white rounded-full shadow-sm">
                        <Icons.X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                
                {showToolbox === 'calculator' ? (
                    <>
                        <DosageCalculator initialWeightKg={initialWeight} />
                        <p className="text-[10px] text-gray-400 mt-4 leading-relaxed italic">
                            Las dosis son sugerencias basadas en literatura estándar. Siempre verifique antes de administrar.
                        </p>
                    </>
                ) : (
                    <QoLAssessment onComplete={handleQoLComplete} />
                )}
            </div>
        )}
    </div>
  );
}
