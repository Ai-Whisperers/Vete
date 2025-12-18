
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

    // Fetch user's pets if logged in to speed up booking
    let userPets: any[] = [];
    if (user) {
        const { data: pets } = await supabase
            .from('pets')
            .select('id, name, species')
            .eq('owner_id', user.id);
        if (pets) userPets = pets;
    }

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
