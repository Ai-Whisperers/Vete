"use client";

import { useState } from "react";
import * as Icons from "lucide-react";

type Species = "dog" | "cat";

interface VaccineScheduleItem {
  n: number;
  age: string;
  vaccines?: string[];
  note?: string;
}

interface VaccineScheduleConfig {
  title?: string;
  subtitle?: string;
  dog_label?: string;
  cat_label?: string;
  important_label?: string;
  important_text?: string;
  data?: {
    dog: VaccineScheduleItem[];
    cat: VaccineScheduleItem[];
  };
}

interface VaccineScheduleProps {
  config?: VaccineScheduleConfig;
}

export function VaccineSchedule({ config }: VaccineScheduleProps) {
  const [species, setSpecies] = useState<Species>("dog");

  // Fallback if config isn't provided (for safety/backward compatibility)
  const safeConfig = config || {
    title: "Calendario de Vacunación (Paraguay)",
    subtitle: "Cronograma oficial recomendado por SENACSA.",
    dog_label: "Perros",
    cat_label: "Gatos",
    important_label: "Importante:",
    important_text: "Este es un esquema estándar.",
    data: { dog: [], cat: [] }
  };
  
  const schedules = safeConfig.data || { dog: [], cat: [] };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 bg-[var(--bg-subtle)] border-b border-gray-100">
        <h3 className="text-2xl font-heading font-black text-[var(--text-primary)] mb-2 flex items-center gap-2">
            <Icons.CalendarCheck className="w-6 h-6 text-[var(--primary)]" />
            {safeConfig.title}
        </h3>
        <p className="text-[var(--text-secondary)] text-sm mb-6">
            {safeConfig.subtitle}
        </p>

        <div className="flex p-1 bg-white rounded-xl shadow-sm border border-gray-200 w-fit">
            <button
                onClick={() => setSpecies("dog")}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${
                    species === "dog" 
                        ? "bg-[var(--primary)] text-white shadow-md" 
                        : "text-gray-500 hover:bg-gray-50"
                }`}
            >
                <Icons.Dog className="w-4 h-4" /> {safeConfig.dog_label}
            </button>
            <button
                onClick={() => setSpecies("cat")}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${
                    species === "cat" 
                        ? "bg-[var(--primary)] text-white shadow-md" 
                        : "text-gray-500 hover:bg-gray-50"
                }`}
            >
                <Icons.Cat className="w-4 h-4" /> {safeConfig.cat_label}
            </button>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-6">
            {schedules[species]?.map((item: VaccineScheduleItem, idx: number) => (
                <div key={idx} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            item.age.includes("Anual") ? "bg-[var(--accent)] text-black" : "bg-[var(--primary)] text-white"
                        }`}>
                            {item.n}
                        </div>
                        {idx !== (schedules[species]?.length || 0) - 1 && (
                            <div className="w-0.5 h-full bg-gray-100 my-1 group-hover:bg-[var(--primary)]/30 transition-colors" />
                        )}
                    </div>
                    <div className="pb-6">
                        <h4 className="font-bold text-lg text-[var(--text-primary)]">{item.age}</h4>
                        <div className="flex flex-wrap gap-2 my-2">
                            {item.vaccines?.map((v: string, i: number) => (
                                <span key={i} className="inline-block px-3 py-1 bg-[var(--bg-subtle)] text-[var(--primary)] text-xs font-bold rounded-md border border-[var(--primary)]/10">
                                    {v}
                                </span>
                            ))}
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] italic">"{item.note}"</p>
                    </div>
                </div>
            ))}
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex gap-3 text-sm text-yellow-800">
            <Icons.AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p>
                <strong>{safeConfig.important_label}</strong> {safeConfig.important_text}
            </p>
        </div>
      </div>
    </div>
  );
}
