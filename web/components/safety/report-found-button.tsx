'use client';

import { useState } from 'react';
import { CheckCircle, Loader2, Megaphone } from 'lucide-react';
import { reportFoundPet } from '@/app/actions/safety';
import { useToast } from '@/components/ui/Toast';

export function ReportFoundButton({ petId }: { petId: string }) {
    const [isReporting, setIsReporting] = useState(false);
    const [reported, setReported] = useState(false);
    const { showToast } = useToast();

    const handleReport = async () => {
        if (!confirm('¿Confirmas que has encontrado a esta mascota? Esto notificará a la clínica.')) return;
        
        setIsReporting(true);
        try {
            // Optional: Ask for browser location
            let location = '';
            if ('geolocation' in navigator) {
                try {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                    });
                    location = `${position.coords.latitude}, ${position.coords.longitude}`;
                } catch {
                    // Location access denied - continue without location
                }
            }

            const res = await reportFoundPet(petId, location);
            if (res.success) {
                setReported(true);
                showToast('¡Gracias! Hemos notificado que la mascota fue encontrada.');
            } else {
                throw new Error(res.error);
            }
        } catch (e) {
            // TICKET-TYPE-004: Proper error handling without any
            showToast(e instanceof Error ? e.message : 'Error al reportar');
        } finally {
            setIsReporting(false);
        }
    };

    if (reported) {
        return (
            <div className="bg-[var(--status-success-bg,#dcfce7)] text-[var(--status-success,#16a34a)] p-4 rounded-xl text-center font-bold flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Reporte Enviado
            </div>
        );
    }

    return (
        <button
            onClick={handleReport}
            disabled={isReporting}
            className="w-full mt-4 bg-[var(--status-warning-bg,#fef3c7)] text-[var(--status-warning-dark,#a16207)] py-3 rounded-xl font-bold hover:bg-[var(--status-warning,#eab308)]/20 transition-colors flex items-center justify-center gap-2"
        >
            {isReporting ? <Loader2 className="w-5 h-5 animate-spin"/> : <Megaphone className="w-5 h-5"/>}
            Reportar como Encontrado
        </button>
    );
}
