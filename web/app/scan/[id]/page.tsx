import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import * as Icons from 'lucide-react';
import Link from 'next/link';
import { ReportFoundButton } from '@/components/safety/report-found-button';

export default async function ScanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: petId } = await params;
    const supabase = await createClient();

    // 1. Fetch Pet (Public if Active QR)
    const { data: pet, error: petError } = await supabase
        .from('pets')
        .select(`
            id,
            name,
            species,
            breed,
            photo_url,
            microchip_id,
            allergies,
            existing_conditions,
            owner_id
        `)
        .eq('id', petId)
        .single();

    if (petError || !pet) {
        return notFound();
    }

    // 2. Fetch Owner (Public if linked to Pet with Active QR)
    const { data: owner } = await supabase
        .from('profiles')
        .select('full_name, phone, email')
        .eq('id', pet.owner_id)
        .single();


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icons.ShieldCheck className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Mascota Encontrada</h1>
                    <p className="text-gray-600">Información de contacto del dueño</p>
                </div>

                {/* Pet Card */}
                <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 mb-6">
                    {/* Pet Photo */}
                    {pet.photo_url && (
                        <div className="h-64 bg-gray-100 relative overflow-hidden">
                            <img 
                                src={pet.photo_url} 
                                alt={pet.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="p-8">
                        {/* Pet Info */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black text-gray-900 mb-2">{pet.name}</h2>
                            <p className="text-lg text-gray-600">{pet.species} • {pet.breed}</p>
                            {pet.microchip_id && (
                                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-bold">
                                    <Icons.Cpu className="w-4 h-4" />
                                    Microchip: {pet.microchip_id}
                                </div>
                            )}
                        </div>

                        {/* Medical Alerts */}
                        {(pet.allergies || pet.existing_conditions) && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
                                <h3 className="font-black text-red-900 flex items-center gap-2 mb-3">
                                    <Icons.AlertTriangle className="w-5 h-5" />
                                    Alertas Médicas
                                </h3>
                                {pet.allergies && (
                                    <div className="mb-2">
                                        <span className="font-bold text-red-800">Alergias:</span>
                                        <span className="text-red-700 ml-2">{pet.allergies}</span>
                                    </div>
                                )}
                                {pet.existing_conditions && (
                                    <div>
                                        <span className="font-bold text-red-800">Condiciones:</span>
                                        <span className="text-red-700 ml-2">{pet.existing_conditions}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Owner Contact */}
                        <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-2xl p-6 mb-6">
                            <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                                <Icons.User className="w-5 h-5 text-[var(--primary)]" />
                                Contacto del Dueño
                            </h3>
                            <div className="space-y-3">
                                {owner?.full_name && (
                                    <div className="flex items-center gap-3">
                                        <Icons.User className="w-5 h-5 text-gray-400" />
                                        <span className="font-bold text-gray-900">{owner.full_name}</span>
                                    </div>
                                )}
                                {owner?.phone && (
                                    <a 
                                        href={`tel:${owner.phone}`}
                                        className="flex items-center gap-3 text-[var(--primary)] hover:underline font-bold"
                                    >
                                        <Icons.Phone className="w-5 h-5" />
                                        {owner.phone}
                                    </a>
                                )}
                                {owner?.email && (
                                    <a 
                                        href={`mailto:${owner.email}`}
                                        className="flex items-center gap-3 text-[var(--primary)] hover:underline font-bold"
                                    >
                                        <Icons.Mail className="w-5 h-5" />
                                        {owner.email}
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {owner?.phone && (
                                    <a
                                        href={`tel:${owner.phone}`}
                                        className="flex-1 px-8 py-5 bg-green-600 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-center flex items-center justify-center gap-2"
                                    >
                                        <Icons.Phone className="w-5 h-5" />
                                        Llamar al Dueño
                                    </a>
                                )}
                                {owner?.phone && (
                                    <a
                                        href={`https://wa.me/${owner.phone.replace(/\D/g, '')}?text=Hola, encontré a ${pet.name}!`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 px-8 py-5 bg-[#25D366] text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-center flex items-center justify-center gap-2"
                                    >
                                        <Icons.MessageCircle className="w-5 h-5" />
                                        WhatsApp
                                    </a>
                                )}
                            </div>
                            
                            <ReportFoundButton petId={pet.id} />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-500">
                    <p className="mb-2">¿Encontraste esta mascota perdida?</p>
                    <p>Gracias por ayudar a reunir a {pet.name} con su familia ❤️</p>
                </div>
            </div>
        </div>
    );
}
