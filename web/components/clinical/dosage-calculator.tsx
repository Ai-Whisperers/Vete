"use client";

import { useState, useEffect } from 'react';
import { Calculator, AlertTriangle } from 'lucide-react';

interface Drug {
    id: string;
    name: string;
    species: 'dog' | 'cat' | 'all';
    min_dose_mg_kg: number;
    max_dose_mg_kg: number;
    concentration_mg_ml: number;
    notes: string;
    max_absolute_mg?: number; // Maximum absolute dose regardless of weight
}

// Validation constants
const MIN_PRACTICAL_VOLUME_ML = 0.1; // Minimum measurable volume
const MAX_SAFE_WEIGHT_KG = 200; // Maximum reasonable animal weight

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
            } catch {
                // Error fetching drugs - silently fail
            } finally {
                setLoading(false);
            }
        };
        fetchDrugs();
    }, [species]);

    const selectedDrug = drugs.find(d => d.id === selectedDrugId);

    const calculateDose = () => {
        if (!selectedDrug || weight <= 0) return null;

        let minTotalMg = selectedDrug.min_dose_mg_kg * weight;
        let maxTotalMg = selectedDrug.max_dose_mg_kg * weight;

        // Apply absolute maximum dose limit if defined
        if (selectedDrug.max_absolute_mg) {
            maxTotalMg = Math.min(maxTotalMg, selectedDrug.max_absolute_mg);
            minTotalMg = Math.min(minTotalMg, selectedDrug.max_absolute_mg);
        }

        const minMl = minTotalMg / selectedDrug.concentration_mg_ml;
        const maxMl = maxTotalMg / selectedDrug.concentration_mg_ml;

        // Generate warnings
        const warnings: string[] = [];

        // Warning for very small volumes (hard to measure accurately)
        if (minMl < MIN_PRACTICAL_VOLUME_ML) {
            warnings.push(`Volumen muy pequeño (${minMl.toFixed(3)} ml). Considere diluir o usar jeringa de precisión.`);
        }

        // Warning for max dose being capped
        if (selectedDrug.max_absolute_mg && maxTotalMg === selectedDrug.max_absolute_mg) {
            warnings.push(`Dosis máxima absoluta aplicada: ${selectedDrug.max_absolute_mg} mg`);
        }

        return { minMl, maxMl, minTotalMg, maxTotalMg, warnings };
    };

    const dose = calculateDose();

    // Weight validation warning
    const weightWarning = weight < 0
        ? 'El peso no puede ser negativo'
        : weight > MAX_SAFE_WEIGHT_KG
            ? `Peso inusualmente alto (${weight} kg). Verifique el valor.`
            : null;

    return (
        <div className="bg-[var(--bg-paper)] p-6 rounded-2xl border border-[var(--border-light,#f3f4f6)] shadow-sm">
            <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[var(--primary)]" />
                Calculadora de Dosis
            </h3>

            <div className="space-y-4">
                {/* Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Peso (kg)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max={MAX_SAFE_WEIGHT_KG}
                            value={weight}
                            onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                            className={`w-full p-3 min-h-[44px] bg-[var(--bg-subtle)] border rounded-lg focus:ring-[var(--primary)] ${weightWarning ? 'border-[var(--status-error-light,#fca5a5)]' : 'border-[var(--border,#e5e7eb)]'}`}
                        />
                        {weightWarning && (
                            <p className="text-xs text-[var(--status-error,#ef4444)] mt-1">{weightWarning}</p>
                        )}
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Medicamento</label>
                         <select
                            value={selectedDrugId}
                            onChange={(e) => setSelectedDrugId(e.target.value)}
                            className="w-full p-3 min-h-[44px] bg-[var(--bg-subtle)] border border-[var(--border,#e5e7eb)] rounded-lg focus:ring-[var(--primary)] text-sm"
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
                    <div className="bg-[var(--status-info-bg,#dbeafe)] p-3 rounded-lg text-xs text-[var(--status-info,#1d4ed8)] space-y-1">
                        <div className="flex justify-between">
                            <span className="font-bold">Dosis:</span>
                            <span>{selectedDrug.min_dose_mg_kg} - {selectedDrug.max_dose_mg_kg} mg/kg</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-bold">Conc:</span>
                            <span>{selectedDrug.concentration_mg_ml} mg/ml</span>
                        </div>
                        {selectedDrug.notes && (
                            <div className="pt-2 border-t border-[var(--status-info,#3b82f6)]/20 mt-2 font-medium italic">
                                Nota: {selectedDrug.notes}
                            </div>
                        )}
                    </div>
                )}

                {/* Result */}
                {dose && (
                    <div className="space-y-3">
                        <div className="bg-[var(--primary)] text-white p-4 rounded-xl text-center animate-in fade-in slide-in-from-bottom-2">
                            <div className="text-sm opacity-80 mb-1 font-medium">Administrar</div>
                            <div className="text-2xl sm:text-3xl font-black mb-1">
                                {dose.minMl.toFixed(2)} - {dose.maxMl.toFixed(2)} ml
                            </div>
                            <div className="text-xs opacity-70">
                                ({dose.minTotalMg.toFixed(0)} - {dose.maxTotalMg.toFixed(0)} mg totales)
                            </div>
                        </div>

                        {/* Warnings */}
                        {dose.warnings.length > 0 && (
                            <div className="bg-[var(--status-warning-bg,#fef3c7)] border border-[var(--status-warning,#eab308)]/30 p-3 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-[var(--status-warning-dark,#ca8a04)] flex-shrink-0 mt-0.5" />
                                    <div className="text-xs text-[var(--status-warning-dark,#a16207)] space-y-1">
                                        {dose.warnings.map((warning, idx) => (
                                            <p key={idx}>{warning}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
