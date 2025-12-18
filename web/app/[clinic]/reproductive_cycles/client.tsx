"use client";

import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';

interface ReproductiveCycle {
    id: string;
    pet_id: string;
    cycle_start: string;
    cycle_end: string;
    notes?: string;
}

export default function ReproductiveCyclesClient({ clinic }: { clinic: string }) {
    const supabase = createClient();
    const { showToast } = useToast();
    const router = useRouter();

    const [petId, setPetId] = useState("");
    const [pets, setPets] = useState<any[]>([]);
    const [cycles, setCycles] = useState<ReproductiveCycle[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form state
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [notes, setNotes] = useState("");

    // Fetch pets
    useEffect(() => {
        const loadPets = async () => {
            const { data } = await supabase
                .from('pets')
                .select('id, name, species, breed, gender')
                .eq('gender', 'female') // Only show females
                .order('name');
            if (data) setPets(data);
        };
        loadPets();
    }, [supabase]);

    // Fetch history for selected pet
    useEffect(() => {
        if (!petId) {
            setCycles([]);
            return;
        }
        const loadCycles = async () => {
            const { data } = await supabase
                .from('reproductive_cycles')
                .select('*')
                .eq('pet_id', petId)
                .order('cycle_start', { ascending: false });
            if (data) setCycles(data);
        };
        loadCycles();
    }, [petId, supabase]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!petId) return;

        setIsSaving(true);
        try {
            const res = await fetch("/api/reproductive_cycles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pet_id: petId,
                    cycle_start: startDate,
                    cycle_end: endDate,
                    notes: notes
                }),
            });
            if (res.ok) {
                setStartDate("");
                setEndDate("");
                setNotes("");
                showToast("Ciclo registrado correctamente");
                router.refresh(); // Update list
                // Refresh local cycles list
                const { data } = await supabase
                    .from('reproductive_cycles')
                    .select('*')
                    .eq('pet_id', petId)
                    .order('cycle_start', { ascending: false });
                if (data) setCycles(data);
            }
        } catch (err) {
            showToast("Error al guardar el ciclo");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar este registro de ciclo?")) return;
        const res = await fetch("/api/reproductive_cycles", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        if (res.ok) {
            setCycles(prev => prev.filter(c => c.id !== id));
            showToast("Registro eliminado");
        }
    };

    const getNextHeatEstimate = (lastStart: string) => {
        const date = new Date(lastStart);
        date.setMonth(date.getMonth() + 6); // Average for many breeds
        return date;
    };

    const isCurrentlyActive = (start: string, end: string) => {
        const now = new Date();
        const s = new Date(start);
        const e = new Date(end);
        return now >= s && now <= e;
    };

    const selectedPet = pets.find(p => p.id === petId);

    return (
        <div className="bg-[var(--bg-default)] min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/${clinic}/portal/dashboard`} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                            <Icons.ArrowLeft className="w-5 h-5 text-gray-500" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-[var(--text-primary)]">Monitor Reproductivo</h1>
                            <p className="text-sm text-gray-500 font-medium">Seguimiento de Ciclos y Celos</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Paciente (Hembras)</span>
                        <select 
                            value={petId} 
                            onChange={(e) => setPetId(e.target.value)}
                            className="bg-purple-50 border-none rounded-xl font-bold text-purple-700 focus:ring-2 focus:ring-purple-500 py-2 px-4 outline-none"
                        >
                            <option value="">Seleccionar Paciente...</option>
                            {pets.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.breed})</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {petId ? (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Status & Predictions */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-purple-100/50 border border-purple-100 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 opacity-[0.05] rounded-full -mr-16 -mt-16"></div>
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Estado Actual</h3>
                                
                                {cycles.length > 0 ? (
                                    <>
                                        {isCurrentlyActive(cycles[0].cycle_start, cycles[0].cycle_end) ? (
                                            <div className="text-center py-6">
                                                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                                    <Icons.Heart className="w-10 h-10 fill-current" />
                                                </div>
                                                <h4 className="text-2xl font-black text-red-600 mb-1">Celo Activo</h4>
                                                <p className="text-sm text-gray-500">Termina aprox. el {new Date(cycles[0].cycle_end).toLocaleDateString()}</p>
                                            </div>
                                        ) : (
                                            <div className="text-center py-6">
                                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Icons.CheckCircle2 className="w-10 h-10" />
                                                </div>
                                                <h4 className="text-2xl font-black text-gray-800 mb-1">Inactiva</h4>
                                                <p className="text-sm text-gray-500 leading-relaxed px-4">Próximo celo estimado para:</p>
                                                <p className="text-lg font-black text-purple-600 mt-2">
                                                    {getNextHeatEstimate(cycles[0].cycle_start).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-6 text-gray-400">
                                        <Icons.Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="text-sm font-medium">Sin datos históricos para predecir.</p>
                                    </div>
                                )}
                            </div>

                            {/* Add New Cycle Form */}
                            <div className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100">
                                <h3 className="text-lg font-black text-gray-900 mb-6">Registrar Nuevo Ciclo</h3>
                                <form onSubmit={handleAdd} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-black text-gray-400 uppercase mb-2 block tracking-widest">Inicio del Celo</label>
                                        <input 
                                            type="date" 
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            required
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-700 focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-gray-400 uppercase mb-2 block tracking-widest">Fin Estimado/Real</label>
                                        <input 
                                            type="date" 
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            required
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-700 focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-gray-400 uppercase mb-2 block tracking-widest">Notas</label>
                                        <textarea 
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Observaciones sobre sangrado, comportamiento, etc."
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 font-medium text-gray-700 focus:ring-2 focus:ring-purple-500 outline-none h-24"
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full bg-purple-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
                                    >
                                        {isSaving ? 'Guardando...' : 'Registrar Ciclo'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Timeline & History */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-[40px] p-10 shadow-xl border border-gray-100">
                                <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                    <Icons.List className="w-6 h-6 text-purple-500" />
                                    Historial de Ciclos
                                </h3>

                                <div className="space-y-6">
                                    {cycles.length > 0 ? cycles.map((c) => (
                                        <div key={c.id} className="group relative pl-10 border-l-4 border-purple-100 pb-2">
                                            <div className="absolute left-[-10px] top-0 w-4 h-4 rounded-full bg-purple-500 border-4 border-white shadow-sm"></div>
                                            
                                            <div className="bg-gray-50 rounded-3xl p-6 group-hover:bg-purple-50 transition-colors border border-transparent group-hover:border-purple-100">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="text-lg font-black text-gray-800">
                                                                {new Date(c.cycle_start).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} - 
                                                                {new Date(c.cycle_end).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </span>
                                                            {isCurrentlyActive(c.cycle_start, c.cycle_end) && (
                                                                <span className="text-[10px] bg-red-500 text-white px-3 py-1 rounded-full font-black uppercase shadow-lg shadow-red-200">
                                                                    Actual
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-500 font-medium text-sm leading-relaxed">
                                                            {c.notes || "Sin notas adicionales."}
                                                        </p>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleDelete(c.id)}
                                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Icons.Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                                            <Icons.Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500 font-medium">No hay ciclos registrados para este paciente.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-40">
                         <div className="w-24 h-24 bg-purple-50 text-purple-200 rounded-[40px] flex items-center justify-center mx-auto mb-8">
                            <Icons.Dog className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Monitor de Reproducción</h2>
                        <p className="text-gray-500 max-w-sm mx-auto font-medium">
                            Seleccione una paciente hembra para ver su historial reproductivo, tendencias y predicciones de celo.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
