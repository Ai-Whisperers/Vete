'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Check, Search, MapPin, Phone, AlertTriangle, PawPrint } from 'lucide-react';

interface LostPet {
    id: string;
    pet_id: string;
    status: string;
    last_seen_location: string;
    last_seen_date: string;
    finder_contact?: string;
    pets: {
        name: string;
        photo_url: string;
        species: string;
        breed: string;
        profiles: {
            full_name: string;
            phone: string;
        }
    };
}

export function LostFoundWidget() {
    const [lostPets, setLostPets] = useState<LostPet[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchLostPets = async () => {
            try {
                // Get current user's clinic ID
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('tenant_id')
                    .eq('id', user.id)
                    .single();
                
                if (!profile) return;

                // Fetch lost pets in this clinic (tenant) with full joins
                const { data, error } = await supabase
                    .from('lost_pets')
                    .select(`
                        *,
                        pets!inner (
                            name,
                            photo_url,
                            species,
                            breed,
                            tenant_id,
                            profiles!owner_id (
                                full_name,
                                phone
                            )
                        )
                    `)
                    .eq('pets.tenant_id', profile.tenant_id)
                    .neq('status', 'reunited')
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (error) throw error;
                setLostPets(data as any || []);
            } catch {
                // Error fetching lost pets - silently fail
            } finally {
                setLoading(false);
            }
        };

        fetchLostPets();
    }, []);

    if (loading) return <div className="h-48 animate-pulse bg-[var(--bg-subtle)] rounded-3xl" />;

    if (lostPets.length === 0) {
        return (
            <div className="bg-[var(--bg-paper)] p-6 rounded-3xl shadow-sm border border-[var(--border-light,#f3f4f6)] h-full flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-[var(--status-success-bg,#dcfce7)] rounded-full flex items-center justify-center mb-3">
                    <Check className="w-6 h-6 text-[var(--status-success,#22c55e)]" />
                </div>
                <h3 className="font-bold text-[var(--text-primary)]">Sin Reportes</h3>
                <p className="text-sm text-[var(--text-secondary)]">No hay mascotas perdidas activas.</p>
            </div>
        );
    }

    return (
        <div className="bg-[var(--bg-paper)] p-6 rounded-3xl shadow-sm border border-[var(--border-light,#f3f4f6)] h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-[var(--text-primary)] flex items-center gap-2">
                    <Search className="w-5 h-5 text-[var(--status-error,#ef4444)]" />
                    Mascotas Perdidas
                </h3>
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                    {lostPets.length} Activos
                </span>
            </div>

            <div className="space-y-4">
                {lostPets.map((report) => (
                    <div key={report.id} className="flex gap-3 items-start p-3 bg-red-50/50 rounded-2xl border border-red-100 hover:bg-red-50 transition-colors cursor-pointer">
                        <div className="w-12 h-12 bg-gray-200 rounded-xl overflow-hidden shrink-0">
                            {report.pets.photo_url ? (
                                <img src={report.pets.photo_url} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white">
                                    <PawPrint className="w-6 h-6 text-gray-300" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-900 truncate">{report.pets.name}</h4>
                                {report.status === 'found' && (
                                    <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                                        Encontrado
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">Props: {report.pets.profiles.full_name}</p>
                            <div className="flex items-center gap-1 mt-1 text-xs text-red-600 font-medium">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{report.last_seen_location}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
