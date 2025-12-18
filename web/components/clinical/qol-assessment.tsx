"use client";

import { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';

interface QoLAssessmentProps {
    onComplete: (score: number, notes: string) => void;
}

// Critical thresholds for individual categories
const CRITICAL_THRESHOLD = 2; // Score <= 2 in any category is critical
const POOR_TOTAL_THRESHOLD = 35;

export function QoLAssessment({ onComplete }: QoLAssessmentProps) {
    const [scores, setScores] = useState({
        hurt: 5,
        hunger: 5,
        hydration: 5,
        hygiene: 5,
        happiness: 5,
        mobility: 5,
        goodDays: 5
    });

    const categories = [
        { id: 'hurt', label: 'Dolor (Hurt)', desc: '0 = Dolor severo sin control. 10 = Sin dolor o bien controlado.', critical: true },
        { id: 'hunger', label: 'Hambre (Hunger)', desc: '0 = No come nada. 10 = Come con normalidad.', critical: true },
        { id: 'hydration', label: 'Hidratación (Hydration)', desc: '0 = Deshidratación severa. 10 = Bien hidratado.', critical: true },
        { id: 'hygiene', label: 'Higiene (Hygiene)', desc: '0 = Llagas/incontinencia sin tratamiento. 10 = Se mantiene limpio.', critical: false },
        { id: 'happiness', label: 'Felicidad (Happiness)', desc: '0 = Deprimido/sin respuesta. 10 = Alegre e interactivo.', critical: false },
        { id: 'mobility', label: 'Movilidad (Mobility)', desc: '0 = No puede moverse. 10 = Se mueve libremente.', critical: false },
        { id: 'goodDays', label: 'Días Buenos (More Good Days)', desc: '0 = Solo días malos. 10 = Mayoría días buenos.', critical: false }
    ];

    const total = Object.values(scores).reduce((a, b) => a + b, 0);

    // Check for critical individual scores
    const criticalWarnings = useMemo(() => {
        const warnings: string[] = [];
        categories.forEach(cat => {
            const score = scores[cat.id as keyof typeof scores];
            if (score <= CRITICAL_THRESHOLD && cat.critical) {
                warnings.push(`${cat.label}: Puntuación crítica (${score}/10)`);
            }
        });
        return warnings;
    }, [scores]);

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl">
            <h3 className="text-xl font-black text-gray-900 mb-2">Escala HHHHHMM</h3>
            <p className="text-sm text-gray-500 mb-4">Escala de Calidad de Vida (Dr. Alice Villalobos). Score {'>'} 35 sugiere calidad de vida aceptable.</p>

            {/* Important disclaimer */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6">
                <div className="flex gap-3">
                    <Icons.AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                        <p className="font-bold mb-1">Esta herramienta es solo una guía</p>
                        <p className="text-amber-700">Las decisiones sobre el final de la vida deben tomarse junto con un veterinario, considerando el contexto completo del paciente. Esta escala NO sustituye el juicio profesional.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {categories.map((cat) => (
                    <div key={cat.id}>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-bold text-gray-700">{cat.label}</label>
                            <span className="text-lg font-black text-[var(--primary)]">{scores[cat.id as keyof typeof scores]}</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{cat.desc}</p>
                        <input 
                            type="range" 
                            min="0" max="10" 
                            value={scores[cat.id as keyof typeof scores]}
                            onChange={(e) => setScores({ ...scores, [cat.id]: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                        />
                    </div>
                ))}
            </div>

            {/* Critical warnings */}
            {criticalWarnings.length > 0 && (
                <div className="mt-6 bg-red-50 border border-red-200 p-4 rounded-xl">
                    <div className="flex gap-3">
                        <Icons.AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-red-800 mb-2">Valores críticos detectados:</p>
                            <ul className="text-sm text-red-700 space-y-1">
                                {criticalWarnings.map((warning, idx) => (
                                    <li key={idx}>• {warning}</li>
                                ))}
                            </ul>
                            <p className="text-sm text-red-600 mt-2 font-medium">
                                Puntuaciones críticas en categorías esenciales requieren atención veterinaria inmediata.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8 p-6 rounded-2xl bg-gray-900 text-white">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <p className="text-xs opacity-50 uppercase font-bold tracking-widest">Puntaje Total</p>
                        <p className="text-4xl font-black">{total} / 70</p>
                    </div>
                    <div className="text-right">
                        <p className={`font-black uppercase tracking-tighter text-xl ${total > POOR_TOTAL_THRESHOLD ? 'text-green-400' : 'text-red-400'}`}>
                            {total > POOR_TOTAL_THRESHOLD ? 'Calidad Aceptable' : 'Calidad Comprometida'}
                        </p>
                    </div>
                </div>

                {/* Score interpretation guide */}
                <div className="text-xs opacity-70 border-t border-gray-700 pt-4 mt-4">
                    <p className="mb-1"><span className="text-green-400">{'>'} 35:</span> Calidad de vida aceptable</p>
                    <p className="mb-1"><span className="text-yellow-400">25-35:</span> Calidad comprometida, evaluar opciones</p>
                    <p><span className="text-red-400">{'<'} 25:</span> Calidad pobre, considerar cuidados paliativos</p>
                </div>
            </div>

            <button
                onClick={() => {
                    const criticalNote = criticalWarnings.length > 0
                        ? ` ALERTA: ${criticalWarnings.join('; ')}.`
                        : '';
                    onComplete(total, `Evaluación HHHHHMM: Total ${total}/70.${criticalNote} ${total > POOR_TOTAL_THRESHOLD ? 'Calidad aceptable.' : 'Calidad comprometida - evaluar opciones con el veterinario.'}`);
                }}
                className="w-full mt-6 py-4 bg-[var(--primary)] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
                Confirmar y Agregar a Notas
            </button>
        </div>
    );
}
