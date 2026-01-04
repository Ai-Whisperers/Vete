'use client'

import * as Icons from "lucide-react"
import { updateAppointmentStatus } from "@/app/actions/update-appointment"
import { useState } from "react"

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';

interface AppointmentOwner {
    full_name?: string;
    phone?: string;
}

interface AppointmentPet {
    name: string;
    species: string;
    owner?: AppointmentOwner;
}

interface Appointment {
    id: string;
    pet: AppointmentPet;
    start_time: string;
    status: AppointmentStatus;
    reason: string;
    notes?: string;
}

export default function AppointmentItem({ appointment, clinic }: { appointment: Appointment, clinic: string }) {
    const [loading, setLoading] = useState(false)
    const { pet, start_time, status, reason, notes } = appointment
    const date = new Date(start_time)

    const handleStatus = async (newStatus: string) => {
        if (!confirm(`¿Cambiar estado a ${newStatus}?`)) return
        setLoading(true)
        await updateAppointmentStatus(appointment.id, newStatus, clinic)
        setLoading(false)
    }

    const statusColors: Record<AppointmentStatus, string> = {
        pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
        completed: 'bg-green-100 text-green-700 border-green-200',
        cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
        rejected: 'bg-red-100 text-red-700 border-red-200'
    }

    const badgeClass = statusColors[status] || 'bg-gray-100 text-gray-500'

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
            {/* Time Column */}
            <div className="md:w-32 flex-shrink-0 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6">
                <span className="text-2xl font-black text-[var(--text-primary)]">
                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {date.toLocaleDateString([], { weekday: 'short', day: 'numeric' })}
                </span>
                <div className={`mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${badgeClass}`}>
                    {status}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-[var(--text-primary)]">{pet.name}</h3>
                            <span className="text-gray-400 text-sm">({pet.species})</span>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Icons.User className="w-3 h-3" /> {pet.owner?.full_name || 'Desconocido'}
                            <span className="text-gray-300">|</span>
                            <Icons.Phone className="w-3 h-3" /> {pet.owner?.phone || '-'}
                        </p>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-start gap-3">
                        <Icons.Info className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                        <div>
                            <span className="block text-xs font-bold text-gray-400 uppercase mb-0.5">Motivo</span>
                            <p className="text-sm font-medium text-gray-700">{reason}</p>
                            {notes && <p className="text-xs text-gray-500 mt-1 italic">"{notes}"</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                {status === 'pending' && (
                    <>
                        <button onClick={() => handleStatus('confirmed')} disabled={loading} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Confirmar">
                            <Icons.Check className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleStatus('rejected')} disabled={loading} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Rechazar">
                            <Icons.X className="w-5 h-5" />
                        </button>
                    </>
                )}
                {status === 'confirmed' && (
                    <button onClick={() => handleStatus('completed')} disabled={loading} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="Completar">
                        <Icons.CheckCircle2 className="w-5 h-5" />
                    </button>
                )}
                 {(status !== 'cancelled' && status !== 'completed' && status !== 'rejected') && (
                    <button onClick={() => handleStatus('cancelled')} disabled={loading} className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-100 transition-colors" title="Cancelar">
                        <Icons.Trash2 className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    )
}
