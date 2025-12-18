import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import NetworkSearch from './NetworkSearch';
import PatientRequestButton from './PatientRequestButton';

export default async function PatientsPage({ 
    params, 
    searchParams 
}: { 
    params: Promise<{ clinic: string }>,
    searchParams: Promise<{ query?: string; scope?: string }> 
}) {
    const supabase = await createClient();
    const { clinic } = await params;
    const { query, scope } = await searchParams;
    const isGlobal = scope === 'global';
    const searchQuery = query || '';

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect(`/${clinic}/portal/login`);

    // Role Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single();

    const isStaff = profile?.role === 'vet' || profile?.role === 'admin';
    if (!isStaff) {
        return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado. Solo personal autorizado.</div>;
    }

    // Fetch Data (using RPC for both local and global to unify structure, or standard query for local)
    // We will use the new `search_pets_global` RPC for BOTH, as it handles the "is_local" logic perfectly.
    // If scope is local, we can just filter in the UI or pass a flag? 
    // actually `search_pets_global` returns EVERYTHING matching the query.
    // Ideally we filter by `is_local` if scope is local. 
    // But `search_pets_global` requires a query string. If empty, it might return nothing?
    
    let pets: any[] = [];
    let error = null;

    if (searchQuery) {
        const { data, error: err } = await supabase.rpc('search_pets_global', {
            search_query: searchQuery,
            requesting_clinic_id: clinic // assumes clinic param matches tenant_id (e.g. 'adris')
        });
        if (err) error = err;
        else pets = data || [];
    } else if (!isGlobal) {
        // Default Local View (Recent Pets) if no query
        const { data } = await supabase
            .from('pets')
            .select('*, profiles(full_name, phone)')
            .eq('tenant_id', clinic)
            .order('created_at', { ascending: false })
            .limit(20);
        
        // Map to match RPC structure
        pets = data?.map(p => ({
            id: p.id,
            name: p.name,
            species: p.species,
            breed: p.breed,
            photo_url: p.photo_url,
            owner_name: p.profiles?.full_name,
            owner_phone: p.profiles?.phone,
            is_local: true,
            has_access: true
        })) || [];
    }

    // Filter by Scope if Query was used
    if (searchQuery && !isGlobal) {
        pets = pets.filter(p => p.is_local || p.has_access);
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Link href={`/${clinic}/portal/dashboard`} className="hover:text-[var(--primary)] text-gray-400">Dashboard</Link>
                    <Icons.ChevronRight className="w-4 h-4" />
                    <span className="font-bold text-[var(--primary)]">Pacientes</span>
                </div>
                <h1 className="text-3xl font-black font-heading text-[var(--text-primary)]">
                    Directorio de Pacientes
                </h1>
                <p className="text-[var(--text-secondary)]">
                    Gestiona tus pacientes locales o busca en la Red Global.
                </p>
            </div>

            {/* Search & Toggle */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <NetworkSearch />
            </div>

            {/* Results */}
            <div className="space-y-4">
                {searchQuery && (
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                        Resultados para "{searchQuery}" ({pets.length})
                    </h3>
                )}

                <div className="grid gap-4">
                    {pets.map((pet) => (
                        <div key={pet.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                            pet.is_local 
                            ? 'bg-white border-gray-100 shadow-sm hover:shadow-md' 
                            : 'bg-gray-50 border-gray-200 opacity-90'
                        }`}>
                            {/* Avatar */}
                            <div className="relative">
                                {pet.photo_url ? (
                                    <img src={pet.photo_url} alt={pet.name} className="w-16 h-16 rounded-full object-cover" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                                        <Icons.PawPrint className="w-8 h-8" />
                                    </div>
                                )}
                                {!pet.is_local && !pet.has_access && (
                                    <div className="absolute -bottom-1 -right-1 bg-gray-600 text-white rounded-full p-1 border-2 border-white" title="Red Externa">
                                        <Icons.Globe className="w-3 h-3" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-lg text-[var(--text-primary)]">{pet.name}</h3>
                                    {pet.is_local && (
                                        <span className="bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            LOCAL
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-[var(--text-secondary)] capitalize">
                                    {pet.species} • {pet.breed || 'Mestizo'}
                                </p>
                            </div>

                            {/* Privacy / Owner */}
                            <div className="text-right mr-4">
                                {pet.has_access ? (
                                    <>
                                        <p className="font-bold text-sm text-[var(--text-primary)]">{pet.owner_name}</p>
                                        <p className="text-xs text-gray-500">{pet.owner_phone}</p>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                            <Icons.Lock className="w-3 h-3" /> Privado
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div>
                                {pet.has_access ? (
                                    <Link href={`/${clinic}/portal/pets/${pet.id}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white font-bold text-sm hover:opacity-90 transition-opacity">
                                        Ver Ficha
                                    </Link>
                                ) : (
                                    <PatientRequestButton petId={pet.id} clinicId={clinic} />
                                )}
                            </div>
                        </div>
                    ))}

                    {pets.length === 0 && searchQuery && (
                        <div className="text-center py-12 text-gray-400">
                            <Icons.SearchX className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No se encontraron pacientes con ese nombre.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
