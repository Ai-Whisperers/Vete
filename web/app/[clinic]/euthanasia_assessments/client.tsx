"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, Activity, History, ChevronRight, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';

interface AssessmentScore {
    hurt: number;
    hunger: number;
    hydration: number;
    hygiene: number;
    happiness: number;
    mobility: number;
    more_good_days: number;
}

const CRITERIA = [
    { key: 'hurt', label: 'Dolor (Hurt)', desc: 'Control adecuado del dolor y capacidad de respirar. 0 (Mucho dolor) - 10 (Sin dolor)' },
    { key: 'hunger', label: 'Hambre (Hunger)', desc: 'Interés por la comida y capacidad de comer. 0 (Sin interés) - 10 (Come bien)' },
    { key: 'hydration', label: 'Hidratación (Hydration)', desc: 'Ingesta de líquidos y estado de hidratación. 0 (Deshidratado) - 10 (Bien hidratado)' },
    { key: 'hygiene', label: 'Higiene (Hygiene)', desc: 'Capacidad de mantenerse limpio o ser limpiado. 0 (Sucio/Llagas) - 10 (Limpio)' },
    { key: 'happiness', label: 'Felicidad (Happiness)', desc: 'Interés por el entorno, juegos, familia. 0 (Deprimido) - 10 (Feliz)' },
    { key: 'mobility', label: 'Movilidad (Mobility)', desc: 'Capacidad de moverse independientemente. 0 (Inmóvil) - 10 (Activo)' },
    { key: 'more_good_days', label: 'Más días buenos (More Good Days)', desc: 'Balance general de días buenos vs malos. 0 (Todos malos) - 10 (Todos buenos)' },
];

export default function EuthanasiaAssessmentClient({ 
    clinic, 
    initialPetId 
}: { 
    clinic: string;
    initialPetId?: string;
}) {
    const supabase = createClient();
    const { showToast } = useToast();
    const router = useRouter();

    const [petId, setPetId] = useState(initialPetId || "");
    const [pets, setPets] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [notes, setNotes] = useState("");
    const [history, setHistory] = useState<any[]>([]);
    
    const [scores, setScores] = useState<AssessmentScore>({
        hurt: 5, hunger: 5, hydration: 5, hygiene: 5, happiness: 5, mobility: 5, more_good_days: 5
    });

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

    // Fetch pets for selection
    useEffect(() => {
        const loadPets = async () => {
            const { data } = await supabase
                .from('pets')
                .select('id, name, species, breed')
                .order('name');
            if (data) setPets(data);
        };
        loadPets();
    }, [supabase]);

    // Fetch history for selected pet
    useEffect(() => {
        if (!petId) return;
        const loadHistory = async () => {
            const { data } = await supabase
                .from('euthanasia_assessments')
                .select('*')
                .eq('pet_id', petId)
                .order('assessed_at', { ascending: false });
            if (data) setHistory(data);
        };
        loadHistory();
    }, [petId, supabase]);

    const getInterpretation = (score: number) => {
        if (score > 50) return { text: "Excelente Calidad de Vida", color: "text-green-600", bg: "bg-green-50" };
        if (score > 35) return { text: "Calidad de Vida Aceptable", color: "text-blue-600", bg: "bg-blue-50" };
        if (score > 25) return { text: "Calidad de Vida Comprometida", color: "text-yellow-600", bg: "bg-yellow-50" };
        return { text: "Considerar Eutanasia Humanitaria", color: "text-red-600", bg: "bg-red-50" };
    };

    const status = getInterpretation(totalScore);

    const handleSliderChange = (key: keyof AssessmentScore, value: string) => {
        setScores(prev => ({ ...prev, [key]: parseInt(value) }));
    };

    const handleSave = async () => {
        if (!petId) {
            showToast("Seleccione un paciente primero");
            return;
        }

        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            // Generate details string for notes
            const breakdown = CRITERIA.map(c => `${c.label}: ${scores[c.key as keyof AssessmentScore]}/10`).join('\n');
            const finalNotes = `--- DESGLOSE HHHHHMM ---\n${breakdown}\n\n--- NOTAS ADICIONALES ---\n${notes}`;

            const payload = {
                pet_id: petId,
                score: totalScore,
                notes: finalNotes,
                assessed_by: user?.id
            };

            const response = await fetch('/api/euthanasia_assessments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showToast("Evaluación guardada correctamente");
                router.refresh(); // Refresh history
                setNotes("");
            } else {
                const err = await response.json();
                throw new Error(err.error || "Failed to save");
            }
        } catch (error: any) {
            showToast(error.message || "No se pudo guardar la evaluación");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-[var(--bg-default)] min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/${clinic}/portal/dashboard`} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-[var(--text-primary)]">Escala HHHHHMM</h1>
                            <p className="text-sm text-gray-500 font-medium">Evaluación Clínica de Calidad de Vida</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Paciente</span>
                            <select 
                                value={petId} 
                                onChange={(e) => setPetId(e.target.value)}
                                className="bg-gray-50 border-none rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-[var(--primary)] py-2 px-4 outline-none"
                            >
                                <option value="">Seleccionar Paciente...</option>
                                {pets.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.species})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Assessment Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[40px] p-10 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)] opacity-[0.03] rounded-full -mr-32 -mt-32"></div>
                            
                            <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center text-sm">1</span>
                                Criterios de Evaluación
                            </h2>

                            {CRITERIA.map((item) => (
                                <div key={item.key} className="mb-10 last:mb-0 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="max-w-md">
                                            <label className="text-lg font-bold text-gray-800 block group-hover:text-[var(--primary)] transition-colors">
                                                {item.label}
                                            </label>
                                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={`text-4xl font-black tabular-nums ${
                                                scores[item.key as keyof AssessmentScore] < 5 ? 'text-red-500' : 'text-[var(--primary)]'
                                            }`}>
                                                {scores[item.key as keyof AssessmentScore]}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">Puntos</span>
                                        </div>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="10" 
                                        step="1"
                                        value={scores[item.key as keyof AssessmentScore]}
                                        onChange={(e) => handleSliderChange(item.key as keyof AssessmentScore, e.target.value)}
                                        className="w-full h-3 bg-gray-100 rounded-2xl appearance-none cursor-pointer accent-[var(--primary)] focus:outline-none"
                                    />
                                    <div className="flex justify-between text-[10px] text-gray-400 mt-3 font-black uppercase tracking-widest px-1">
                                        <span className="text-red-400">Estado Crítico (0)</span>
                                        <span className="text-green-500">Estado Óptimo (10)</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Additional Notes */}
                        <div className="bg-white rounded-[40px] p-10 shadow-xl shadow-gray-200/50 border border-gray-100">
                             <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center text-sm">2</span>
                                Observaciones Clínicas
                            </h2>
                            <textarea 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Escriba aquí los detalles adicionales de la observación, comportamiento reciente, o notas para el propietario..."
                                className="w-full h-40 bg-gray-50 rounded-3xl p-6 border-none focus:ring-2 focus:ring-[var(--primary)] outline-none font-medium text-gray-700"
                            />
                        </div>

                        {/* History Section */}
                        {history.length > 0 && (
                             <div className="bg-white rounded-[40px] p-10 shadow-xl shadow-gray-200/50 border border-gray-100">
                                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                    <History className="w-6 h-6 text-gray-400" />
                                    Historial de Evaluaciones
                                </h2>
                                <div className="space-y-4">
                                    {history.map((h) => (
                                        <div key={h.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-black text-gray-800">{h.score} pts</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getInterpretation(h.score).bg} ${getInterpretation(h.score).color}`}>
                                                        {getInterpretation(h.score).text}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    {new Date(h.assessed_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-300" />
                                        </div>
                                    ))}
                                </div>
                             </div>
                        )}
                    </div>

                    {/* Score Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[40px] p-10 shadow-2xl shadow-[var(--primary)]/10 border border-gray-100 sticky top-28 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-[var(--primary)]"></div>
                            
                            <h2 className="text-xl font-black text-gray-900 mb-8 text-center uppercase tracking-widest text-xs opacity-50">Índice de Calidad</h2>
                            
                            <div className="relative mb-10 text-center scale-110">
                                <div className="text-8xl font-black text-[var(--primary)] tracking-tighter drop-shadow-sm">{totalScore}</div>
                                <div className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] mt-2">de 70 Puntos</div>
                            </div>

                            <div className={`p-6 rounded-3xl mb-10 text-center ${status.bg} border border-${status.color.split('-')[1]}-100 transition-all duration-500`}>
                                <div className={`w-12 h-12 rounded-2xl ${status.bg} flex items-center justify-center mx-auto mb-3 shadow-inner`}>
                                    <Activity className={`w-6 h-6 ${status.color}`} />
                                </div>
                                <p className={`text-lg font-black ${status.color} leading-snug`}>{status.text}</p>
                            </div>

                            <button 
                                onClick={handleSave}
                                disabled={isSaving || !petId}
                                className={`w-full py-5 bg-[var(--primary)] text-white font-black rounded-3xl shadow-xl shadow-[var(--primary)]/30 hover:shadow-2xl hover:-translate-y-1 transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none`}
                            >
                                {isSaving ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <Save className="w-6 h-6" />
                                )}
                                {isSaving ? 'Guardando...' : 'Finalizar Evaluación'}
                            </button>
                            
                            <div className="mt-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                                <p className="text-[11px] text-blue-800 font-bold leading-relaxed text-center italic">
                                    "Esta métrica es complementaria al diagnóstico médico. La decisión final siempre reside en el consenso entre el profesional y la familia."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
