"use client";

import { useState } from 'react';
import * as Icons from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BookingWizardProps {
    clinic: any;
    user: any;
    userPets: any[];
    initialService?: string;
}

type Step = 'service' | 'pet' | 'datetime' | 'confirm' | 'success';

const PROGRESS = {
    'service': 25,
    'pet': 50,
    'datetime': 75,
    'confirm': 90,
    'success': 100
};

export default function BookingWizard({ clinic, user, userPets, initialService }: BookingWizardProps) {
    const router = useRouter();
    const [step, setStep] = useState<Step>(initialService ? 'pet' : 'service');
    const [selection, setSelection] = useState({
        serviceId: initialService || null,
        petId: userPets.length === 1 ? userPets[0].id : null,
        date: '',
        time_slot: '',
        notes: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Services (Expanded for premium feel)
    const services = [
        { id: 'vaccination', name: 'Vacunación', icon: Icons.Syringe, duration: 15, price: 25, color: 'bg-blue-50 text-blue-600' },
        { id: 'consultation', name: 'Consulta General', icon: Icons.Stethoscope, duration: 30, price: 40, color: 'bg-green-50 text-green-600' },
        { id: 'grooming', name: 'Baño y Corte', icon: Icons.Scissors, duration: 60, price: 50, color: 'bg-purple-50 text-purple-600' },
        { id: 'specialist', name: 'Especialista', icon: Icons.UserCircle, duration: 45, price: 80, color: 'bg-amber-50 text-amber-600' },
        { id: 'internal', name: 'Medicina Interna', icon: Icons.Activity, duration: 40, price: 60, color: 'bg-rose-50 text-rose-600' },
    ];

    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    const currentService = services.find(s => s.id === selection.serviceId);
    const currentPet = userPets.find(p => p.id === selection.petId);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
             const res = await fetch('/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clinic_slug: clinic.config.id,
                    ...selection
                })
             });

             if (res.ok) {
                 setStep('success');
             } else {
                 const err = await res.json();
                 alert(`Error: ${err.error || 'No se pudo procesar la reserva'}`);
             }
        } catch (e) {
            alert('Error de conexión con el servidor.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (step === 'success') {
        return (
            <div className="max-w-2xl mx-auto mt-20 p-12 bg-white rounded-[3rem] shadow-2xl border border-gray-100 text-center animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-green-600 relative">
                    <Icons.Check className="w-12 h-12 relative z-10" />
                    <div className="absolute inset-0 bg-green-400 opacity-20 rounded-full animate-ping"></div>
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-4">¡Todo listo!</h2>
                <p className="text-gray-500 mb-10 text-lg leading-relaxed">
                    Tu cita para <span className="text-gray-900 font-bold">{currentPet?.name}</span> ({currentService?.name}) ha sido confirmada para el <span className="text-gray-900 font-bold">{selection.date}</span> a las <span className="text-gray-900 font-bold">{selection.time_slot}</span>.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={() => router.push(`/${clinic.config.id}/portal/dashboard`)} 
                        className="px-10 py-5 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                    >
                        Volver al Inicio
                    </button>
                    <button className="px-10 py-5 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                        <Icons.Download className="w-5 h-5" /> Descargar Ticket
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-12 px-4">
            {/* Progress Bar */}
            <div className="mb-12 max-w-2xl mx-auto">
                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
                    <span>Servicio</span>
                    <span>Paciente</span>
                    <span>Fecha</span>
                    <span>Confirmar</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[var(--primary)] transition-all duration-700 ease-out" 
                        style={{ width: `${PROGRESS[step]}%` }}
                    />
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_350px] gap-12 items-start">
                <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-white/50 overflow-hidden min-h-[500px] p-8 md:p-12 relative">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl"></div>

                    {/* Step 1: Service */}
                    {step === 'service' && (
                        <div className="relative z-10 animate-in slide-in-from-right-8 duration-500">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl flex items-center justify-center">
                                    <Icons.Layers className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900">¿Qué servicio necesitas?</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {services.map(s => (
                                    <button 
                                        key={s.id}
                                        onClick={() => {
                                            setSelection({...selection, serviceId: s.id});
                                            setStep('pet');
                                        }}
                                        className="p-6 bg-white border border-gray-100 rounded-[2rem] hover:border-[var(--primary)] hover:shadow-xl hover:-translate-y-1 transition-all text-left group flex items-start gap-4"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${s.color} transition-transform group-hover:scale-110`}>
                                            <s.icon className="w-7 h-7" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-black text-gray-900 text-lg mb-1">{s.name}</h3>
                                            <p className="text-sm text-gray-500 font-medium mb-2 opacity-60">Duración: {s.duration} min</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[var(--primary)] font-black">Desde ${s.price}</span>
                                                <Icons.ArrowRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 group-hover:text-[var(--primary)] transition-all" />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Pet */}
                    {step === 'pet' && (
                        <div className="relative z-10 animate-in slide-in-from-right-8 duration-500">
                            <div className="flex items-center gap-4 mb-10">
                                <button onClick={() => setStep('service')} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all">
                                    <Icons.ArrowLeft className="w-5 h-5" />
                                </button>
                                <h2 className="text-3xl font-black text-gray-900">¿Para quién es la cita?</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {userPets.length > 0 ? (
                                    userPets.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                setSelection({...selection, petId: p.id});
                                                setStep('datetime');
                                            }}
                                            className="p-6 bg-white border border-gray-100 rounded-[2rem] hover:border-[var(--primary)] hover:shadow-xl hover:-translate-y-1 transition-all text-left group flex items-center gap-5"
                                        >
                                            <div className="w-16 h-16 bg-[var(--primary)] text-white rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-lg shadow-[var(--primary)]/20">
                                                {p.name[0]}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-black text-gray-900 text-xl mb-1">{p.name}</h3>
                                                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">{p.species} • {p.breed}</p>
                                            </div>
                                            <Icons.ChevronRight className="w-6 h-6 text-gray-200 group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                                        <Icons.Dog className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                                        <p className="text-gray-500 mb-8 font-bold text-lg">No tienes mascotas registradas.</p>
                                        <button 
                                            onClick={() => router.push(`/${clinic.config.id}/portal/pets/new`)} 
                                            className="px-8 py-4 bg-[var(--primary)] text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                                        >
                                            + Registrar Mascota
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Date & Time */}
                    {step === 'datetime' && (
                        <div className="relative z-10 animate-in slide-in-from-right-8 duration-500">
                             <div className="flex items-center gap-4 mb-10">
                                <button onClick={() => setStep('pet')} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all">
                                    <Icons.ArrowLeft className="w-5 h-5" />
                                </button>
                                <h2 className="text-3xl font-black text-gray-900">Agenda tu visita</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-12">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Selecciona el día</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-5 bg-gray-50 border-none rounded-3xl font-black text-gray-700 focus:ring-4 focus:ring-[var(--primary)]/20 transition-all outline-none text-lg"
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setSelection({...selection, date: e.target.value})}
                                    />
                                    <div className="mt-6 p-6 bg-[var(--primary)]/5 rounded-3xl border border-[var(--primary)]/10">
                                        <p className="text-sm text-[var(--primary)] font-bold flex items-center gap-2">
                                            <Icons.Info className="w-4 h-4" />
                                            Reservando en {clinic.config.name}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Horarios disponibles</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {timeSlots.map(t => (
                                            <button
                                                key={t}
                                                disabled={!selection.date}
                                                onClick={() => setSelection({...selection, time_slot: t})}
                                                className={`py-4 rounded-2xl text-sm font-black transition-all border-2 ${
                                                    selection.time_slot === t 
                                                    ? 'bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-200' 
                                                    : 'bg-white text-gray-700 border-gray-50 hover:border-gray-200 disabled:opacity-30'
                                                }`}
                                            >
                                                {t}
                                            </button>
                                        ) )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 flex justify-between">
                                <div className="text-xs text-gray-400 font-bold max-w-xs flex items-center gap-2 italic">
                                     <Icons.AlertCircle className="w-4 h-4 shrink-0" />
                                     Sujeto a confirmación por parte de la clínica.
                                </div>
                                <button 
                                    disabled={!selection.date || !selection.time_slot}
                                    onClick={() => setStep('confirm')}
                                    className="px-10 py-5 bg-gray-900 text-white font-black rounded-[1.5rem] shadow-2xl shadow-gray-200 hover:bg-[var(--primary)] hover:shadow-[var(--primary)]/30 hover:-translate-y-1 transition-all disabled:opacity-20"
                                >
                                    Continuar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Confirm */}
                    {step === 'confirm' && (
                        <div className="relative z-10 animate-in slide-in-from-right-8 duration-500">
                             <div className="flex items-center gap-4 mb-10">
                                <button onClick={() => setStep('datetime')} className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all">
                                    <Icons.ArrowLeft className="w-5 h-5" />
                                </button>
                                <h2 className="text-3xl font-black text-gray-900">Confirmación Final</h2>
                            </div>

                            <div className="bg-gray-50/50 p-10 rounded-[3rem] border border-gray-100 mb-8 backdrop-blur-sm">
                                <div className="grid md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Servicio</p>
                                            <p className="text-xl font-black text-gray-900">{currentService?.name}</p>
                                            <p className="text-sm text-[var(--primary)] font-bold italic">${currentService?.price}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Paciente</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center font-bold text-xs">{currentPet?.name[0]}</div>
                                                <p className="text-xl font-black text-gray-900">{currentPet?.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fecha y Hora</p>
                                            <div className="text-xl font-black text-gray-900 flex items-center gap-2">
                                                <Icons.Calendar className="w-5 h-5 text-[var(--primary)]" />
                                                {selection.date}
                                            </div>
                                            <div className="text-xl font-black text-gray-900 flex items-center gap-2 mt-1">
                                                <Icons.Clock className="w-5 h-5 text-[var(--primary)]" />
                                                {selection.time_slot}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-10">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">¿Algún comentario adicional?</label>
                                <textarea 
                                    className="w-full p-6 bg-white border border-gray-100 rounded-[2rem] font-medium text-gray-700 focus:ring-4 focus:ring-[var(--primary)]/10 transition-all outline-none h-32" 
                                    placeholder="Ej: Mi mascota está un poco nerviosa..."
                                    onChange={(e) => setSelection({...selection, notes: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="flex justify-end">
                                <button 
                                    onClick={handleSubmit} 
                                    disabled={isSubmitting} 
                                    className="px-12 py-6 bg-[var(--primary)] text-white font-black text-xl rounded-[2rem] shadow-2xl shadow-[var(--primary)]/40 hover:scale-105 transition-all flex items-center gap-4 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Icons.Loader2 className="animate-spin w-6 h-6" /> : (
                                        <>Confirmar Cita <Icons.ArrowRight className="w-6 h-6" /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Summary */}
                <aside className="lg:sticky lg:top-12 space-y-6 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-100">
                        <h4 className="font-black text-gray-900 mb-6 flex items-center gap-3">
                            <Icons.ShoppingBag className="w-5 h-5 text-[var(--primary)]" /> Resumen
                        </h4>
                        
                        <div className="space-y-6">
                            <div className={`p-4 rounded-2xl border transition-all ${selection.serviceId ? 'bg-[var(--primary)]/5 border-[var(--primary)]/20' : 'bg-gray-50 border-gray-100'}`}>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Servicio</p>
                                {selection.serviceId ? (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg"><Icons.Zap className="w-4 h-4 text-[var(--primary)]" /></div>
                                        <span className="font-bold text-gray-700">{currentService?.name}</span>
                                    </div>
                                ) : <span className="text-sm italic text-gray-400 font-bold">Sin seleccionar</span>}
                            </div>

                            <div className={`p-4 rounded-2xl border transition-all ${selection.petId ? 'bg-gray-900 text-white border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                                <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${selection.petId ? 'text-gray-500' : 'text-gray-400'}`}>Paciente</p>
                                {selection.petId ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center font-bold text-xs">{currentPet?.name[0]}</div>
                                        <span className="font-bold">{currentPet?.name}</span>
                                    </div>
                                ) : <span className="text-sm italic text-gray-400 font-bold">Sin seleccionar</span>}
                            </div>

                            <div className={`p-4 rounded-2xl border transition-all ${selection.date ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Horario</p>
                                {selection.date && selection.time_slot ? (
                                    <div className="font-bold text-green-700 flex flex-col">
                                        <span>{selection.date}</span>
                                        <span className="text-xs opacity-70 underline">{selection.time_slot}</span>
                                    </div>
                                ) : <span className="text-sm italic text-gray-400 font-bold">Por definir</span>}
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                             <div className="flex justify-between items-end">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Estimado</span>
                                <span className="text-2xl font-black text-gray-900">${currentService?.price || 0}</span>
                             </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
