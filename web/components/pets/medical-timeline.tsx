'use client';

import Link from 'next/link';
import * as Icons from 'lucide-react';

interface TimelineItem {
  id: string;
  created_at: string;
  timelineType: 'record' | 'prescription';
  title: string;
  type?: string;
  diagnosis?: string;
  vitals?: {
    weight?: number;
    temp?: number;
    hr?: number;
    rr?: number;
  };
  drugs?: Array<{
    name: string;
    dose: string;
    instructions: string;
  }>;
  notes?: string;
  attachments?: string[];
}

interface MedicalTimelineProps {
  timelineItems: TimelineItem[];
  clinic: string;
  petId: string;
  isStaff: boolean;
}

export function MedicalTimeline({ timelineItems, clinic, petId, isStaff }: MedicalTimelineProps) {
  return (
    <div className="md:col-span-2 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-2">
          <Icons.Activity className="w-6 h-6 text-[var(--primary)]" />
          Historial Médico
        </h2>
        {isStaff && (
          <div className="flex gap-2">
            <Link
              href={`/${clinic}/portal/prescriptions/new?pet_id=${petId}`}
              className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl font-bold hover:bg-purple-200 flex items-center gap-2 text-sm transition-colors"
            >
              <Icons.Pill className="w-4 h-4" /> Nueva Receta
            </Link>
            <Link
              href={`/${clinic}/portal/pets/${petId}/records/new`}
              className="bg-[var(--primary)] text-white px-4 py-2 rounded-xl font-bold shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
            >
              <Icons.Plus className="w-4 h-4" /> Nueva Consulta
            </Link>
          </div>
        )}
      </div>

      <div className="relative border-l-2 border-dashed border-gray-200 ml-4 space-y-8 pb-8">
        {timelineItems.length === 0 ? (
          <div className="ml-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
            <p className="text-gray-500 italic">No hay registros médicos aún.</p>
          </div>
        ) : (
          timelineItems.map((item: TimelineItem) => (
            <div key={item.id} className="ml-8 relative">
              {/* Timeline Node */}
              <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-white shadow-sm ${
                item.timelineType === 'prescription' ? 'bg-purple-500' :
                item.type === 'surgery' ? 'bg-red-500' :
                item.type === 'consultation' ? 'bg-blue-500' : 'bg-green-500'
              }`}></div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                    {item.timelineType === 'prescription' && <Icons.Pill className="w-5 h-5 text-purple-500" />}
                    {item.title}
                  </h3>
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
                    item.timelineType === 'prescription'
                      ? 'bg-purple-50 text-purple-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {item.timelineType === 'prescription' ? 'Receta' : item.type}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                  <Icons.Calendar className="w-4 h-4" />
                  {new Date(item.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                {item.diagnosis && (
                  <div className="mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase">Diagnóstico</span>
                    <p className="text-gray-800 font-medium">{item.diagnosis}</p>
                  </div>
                )}

                {/* Vitals Display (Records only) */}
                {item.timelineType === 'record' && item.vitals && (item.vitals.weight || item.vitals.temp || item.vitals.hr || item.vitals.rr) && (
                  <div className="mb-4 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                    <span className="text-xs font-bold text-blue-400 uppercase mb-2 block">Signos Vitales</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      {item.vitals.weight && <div><span className="text-gray-400 text-xs">Peso</span> <p className="font-bold text-gray-700">{item.vitals.weight} kg</p></div>}
                      {item.vitals.temp && <div><span className="text-gray-400 text-xs">Temp</span> <p className="font-bold text-gray-700">{item.vitals.temp}°C</p></div>}
                      {item.vitals.hr && <div><span className="text-gray-400 text-xs">FC</span> <p className="font-bold text-gray-700">{item.vitals.hr} lpm</p></div>}
                      {item.vitals.rr && <div><span className="text-gray-400 text-xs">FR</span> <p className="font-bold text-gray-700">{item.vitals.rr} rpm</p></div>}
                    </div>
                  </div>
                )}

                {/* Drugs Display (Prescriptions only) */}
                {item.timelineType === 'prescription' && item.drugs && item.drugs.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {item.drugs.map((drug: { name: string; dose: string; instructions: string }, idx: number) => (
                      <div key={idx} className="bg-purple-50/30 p-2 rounded-lg border border-purple-100/50 text-sm">
                        <p className="font-bold text-purple-900">{drug.name}</p>
                        <p className="text-xs text-purple-700">{drug.dose} - <span className="italic">{drug.instructions}</span></p>
                      </div>
                    ))}
                  </div>
                )}

                {item.notes && (
                  <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-600 italic mb-4">
                    "{item.notes}"
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {item.timelineType === 'prescription' && (
                    <button className="flex items-center gap-2 px-3 py-2 bg-purple-600 rounded-lg text-xs font-bold text-white hover:bg-purple-700 transition-colors">
                      <Icons.Download className="w-3 h-3" /> Ver PDF
                    </button>
                  )}
                  {item.attachments && item.attachments.map((url: string, idx: number) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      <Icons.Paperclip className="w-3 h-3" />
                      Adjunto {idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
