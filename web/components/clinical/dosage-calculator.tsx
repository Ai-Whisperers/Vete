"use client";

import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

interface Drug {
    id: string;
    name: string;
    species: 'dog' | 'cat' | 'all';
    min_dose_mg_kg: number;
    max_dose_mg_kg: number;
    concentration_mg_ml: number;
    notes: string;
}

export function DosageCalculator({ initialWeightKg, species }: { initialWeightKg?: number; species?: 'dog' | 'cat' }) {
    const [drugs, setDrugs] = useState<Drug[]>([]);
    const [selectedDrugId, setSelectedDrugId] = useState('');
    const [weight, setWeight] = useState(initialWeightKg || 0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDrugs = async () => {
            setLoading(true);
            try {
                const url = species ? `/api/drug_dosages?species=${species}` : '/api/drug_dosages';
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setDrugs(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchDrugs();
    }, [species]);

    const selectedDrug = drugs.find(d => d.id === selectedDrugId);

    const calculateDose = () => {
        if (!selectedDrug || weight <= 0) return null;
        
        const minTotalMg = selectedDrug.min_dose_mg_kg * weight;
        const maxTotalMg = selectedDrug.max_dose_mg_kg * weight;
        
        const minMl = minTotalMg / selectedDrug.concentration_mg_ml;
        const maxMl = maxTotalMg / selectedDrug.concentration_mg_ml;

        return { minMl, maxMl, minTotalMg, maxTotalMg };
    };

    const dose = calculateDose();

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Icons.Calculator className="w-5 h-5 text-[var(--primary)]" />
                Calculadora de Dosis
            </h3>

            <div className="space-y-4">
                {/* Inputs */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Peso (kg)</label>
                        <input 
                            type="number" 
                            step="0.1"
                            value={weight}
                            onChange={(e) => setWeight(parseFloat(e.target.value))}
                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-[var(--primary)]"
                        />
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Medicamento</label>
                         <select 
                            value={selectedDrugId}
                            onChange={(e) => setSelectedDrugId(e.target.value)}
                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-[var(--primary)] text-sm"
                            disabled={loading}
                         >
                            <option value="">Seleccionar...</option>
                            {drugs.map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.concentration_mg_ml}mg/ml)</option>
                            ))}
                         </select>
                    </div>
                </div>

                {/* Drug Info */}
                {selectedDrug && (
                    <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 space-y-1">
                        <div className="flex justify-between">
                            <span className="font-bold">Dosis:</span>
                            <span>{selectedDrug.min_dose_mg_kg} - {selectedDrug.max_dose_mg_kg} mg/kg</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-bold">Conc:</span>
                            <span>{selectedDrug.concentration_mg_ml} mg/ml</span>
                        </div>
                        {selectedDrug.notes && (
                            <div className="pt-2 border-t border-blue-100 mt-2 font-medium italic">
                                Nota: {selectedDrug.notes}
                            </div>
                        )}
                    </div>
                )}

                {/* Result */}
                {dose && (
                    <div className="bg-[var(--primary)] text-white p-4 rounded-xl text-center animate-in fade-in slide-in-from-bottom-2">
                        <div className="text-sm opacity-80 mb-1 font-medium">Administrar</div>
                        <div className="text-3xl font-black mb-1">
                            {dose.minMl.toFixed(2)} - {dose.maxMl.toFixed(2)} ml
                        </div>
                        <div className="text-xs opacity-70">
                            ({dose.minTotalMg.toFixed(0)} - {dose.maxTotalMg.toFixed(0)} mg totales)
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
