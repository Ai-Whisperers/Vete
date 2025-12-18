'use client'

import { useActionState } from "react"
import { createAppointment } from "@/app/actions/create-appointment"
import * as Icons from "lucide-react"

export default function AppointmentForm({ pets, clinic }: { pets: any[], clinic: string }) {
    const [state, formAction, isPending] = useActionState(createAppointment, null)

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="clinic" value={clinic} />
            
            {/* 1. Select Pet */}
            <div>
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">¿Para quién es la cita?</label>
                <div className="grid grid-cols-2 gap-3">
                    {pets.map(pet => (
                        <label key={pet.id} className="cursor-pointer">
                            <input type="radio" name="pet_id" value={pet.id} className="peer sr-only" required />
                            <div className="p-3 rounded-xl border-2 border-gray-100 peer-checked:border-[var(--primary)] peer-checked:bg-[var(--primary)]/5 hover:border-gray-200 transition-all flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0">
                                    {pet.photo_url ? (
                                        <img src={pet.photo_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Icons.PawPrint className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                                <span className="font-bold text-gray-700">{pet.name}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* 2. Date & Time */}
            <div>
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Fecha y Hora Preferida</label>
                <input 
                    type="datetime-local" 
                    name="start_time" 
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none"
                    // Min date = today
                    min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-gray-400 mt-1">Sujeto a confirmación por la veterinaria.</p>
            </div>

            {/* 3. Reason */}
            <div>
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Motivo de la visita</label>
                <select name="reason" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none bg-white mb-2">
                    <option value="Vacunación">Vacunación</option>
                    <option value="Consultation">Consulta General</option>
                    <option value="Checkup">Control Sano</option>
                    <option value="Deworming">Desparasitación</option>
                    <option value="Other">Otro</option>
                </select>
                <textarea 
                    name="notes"
                    placeholder="Detalles adicionales (opcional)..." 
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] outline-none resize-none"
                ></textarea>
            </div>

            {state?.error && (
                <div role="alert" className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <Icons.AlertCircle className="w-4 h-4" aria-hidden="true" />
                    {state.error}
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex justify-center items-center gap-2"
            >
                {isPending ? <Icons.Loader2 className="animate-spin w-5 h-5"/> : "Solicitar Cita"}
            </button>
        </form>
    )
}
