'use client';

import { useState } from 'react';
import * as Icons from 'lucide-react';
import { requestAccess } from '@/app/actions/network-actions';

interface Props {
    petId: string;
    clinicId: string;
}

export default function PatientRequestButton({ petId, clinicId }: Props) {
    const [loading, setLoading] = useState(false);

    const handleRequest = async () => {
        if (!confirm('¿Solicitar acceso a este paciente? Esto registrará la actividad.')) return;

        setLoading(true);
        const result = await requestAccess(petId, clinicId);
        setLoading(false);

        if (!result.success) {
            alert('Error solicitando acceso: ' + result.error);
        } else {
             // Success - page will likely revalidate, but we can alert just in case
        }
    };

    return (
        <button 
            onClick={handleRequest}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--primary)] text-[var(--primary)] font-bold text-sm hover:bg-[var(--primary)]/5 transition-colors disabled:opacity-50"
        >
            {loading ? (
                <>
                   <Icons.Loader2 className="w-4 h-4 animate-spin" /> Procesando...
                </>
            ) : (
                <>
                   <Icons.LockKeyhole className="w-4 h-4" /> Solicitar Acceso
                </>
            )}
        </button>
    );
}
