
import { getClinicData } from '@/lib/clinics';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import BookingWizard from '@/components/booking/booking-wizard';

export const generateMetadata = async ({ params }: { params: Promise<{ clinic: string }> }) => {
    const { clinic } = await params;
    const data = await getClinicData(clinic);
    return {
        title: `Reservar Cita - ${data?.config.name || 'Adris'}`,
        description: 'Agende su cita veterinaria online.'
    };
};

export default async function BookingPage({ params, searchParams }: { 
    params: Promise<{ clinic: string }>;
    searchParams: Promise<{ service?: string }>;
}) {
    const { clinic } = await params;
    const { service } = await searchParams; // Pre-select service if passed

    const data = await getClinicData(clinic);
    if (!data) notFound();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Require authentication for booking
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center">
                    <h2 className="text-2xl font-black text-gray-900 mb-4">Autenticación Requerida</h2>
                    <p className="text-gray-600 mb-6">Por favor inicia sesión para reservar una cita.</p>
                    <a
                        href={`/${clinic}/portal/login?redirect=/${clinic}/book`}
                        className="px-8 py-4 bg-[var(--primary)] text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all inline-block"
                    >
                        Iniciar Sesión
                    </a>
                </div>
            </div>
        );
    }

    // Fetch user's pets if logged in to speed up booking
    const { data: pets } = await supabase
        .from('pets')
        .select('id, name, species, breed')
        .eq('owner_id', user.id);

    const userPets = pets || [];

    return (
        <div className="min-h-screen bg-gray-50">
            <BookingWizard
                clinic={data}
                user={user}
                userPets={userPets}
                initialService={service}
            />
        </div>
    );
}
