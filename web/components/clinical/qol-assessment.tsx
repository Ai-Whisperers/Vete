"use client";

import { useState } from 'react';
import * as Icons from 'lucide-react';

interface QoLAssessmentProps {
    onComplete: (score: number, notes: string) => void;
}

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
        { id: 'hurt', label: 'Dolor (Hurt)', desc: '¿Está el dolor controlado? ¿Respira con dificultad?' },
        { id: 'hunger', label: 'Hambre (Hunger)', desc: '¿Come suficiente? ¿Necesita ayuda para comer?' },
        { id: 'hydration', label: 'Hidratación (Hydration)', desc: '¿Bebe suficiente? ¿Necesita fluidos?' },
        { id: 'hygiene', label: 'Higiene (Hygiene)', desc: '¿Se mantiene limpio? ¿Tiene llagas?' },
        { id: 'happiness', label: 'Felicidad (Happiness)', desc: '¿Parece disfrutar de la vida? ¿Juega?' },
        { id: 'mobility', label: 'Movilidad (Mobility)', desc: '¿Puede levantarse solo? ¿Necesita ayuda?' },
        { id: 'goodDays', label: 'Días Buenos (More Good Days)', desc: '¿Hay más días buenos que malos?' }
    ];

    const total = Object.values(scores).reduce((a, b) => a + b, 0);

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl">
            <h3 className="text-xl font-black text-gray-900 mb-2">Escala HHHHHMM</h3>
            <p className="text-sm text-gray-500 mb-6">Escala de Calidad de Vida (Alice Villalobos). Score {'>'} 35 sugiere calidad de vida aceptable.</p>

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

            <div className="mt-8 p-6 rounded-2xl bg-gray-900 text-white flex justify-between items-center">
                <div>
                    <p className="text-xs opacity-50 uppercase font-bold tracking-widest">Puntaje Total</p>
                    <p className="text-4xl font-black">{total} / 70</p>
                </div>
                <div className="text-right">
                    <p className={`font-black uppercase tracking-tighter text-xl ${total > 35 ? 'text-green-400' : 'text-red-400'}`}>
                        {total > 35 ? 'Calidad Aceptable' : 'Calidad Pobre'}
                    </p>
                </div>
            </div>

            <button 
                onClick={() => onComplete(total, `Evaluación HHHHHMM: Total ${total}/70. ${total > 35 ? 'Calidad aceptable.' : 'Calidad pobre - considerar cuidados paliativos.'}`)}
                className="w-full mt-6 py-4 bg-[var(--primary)] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
                Confirmar y Agregar a Notas
            </button>
        </div>
    );
}
