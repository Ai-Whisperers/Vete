import { AppointmentList } from '@/components/appointments/appointment-list';
import { createClient } from '@/lib/supabase/server';
import { requireStaff } from '@/lib/auth';
import { notFound } from 'next/navigation';

async function getAppointments(clinic: string, userId: string) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      tenant_id,
      start_time,
      end_time,
      status,
      reason,
      notes,
      pets (
        id,
        name,
        species,
        photo_url
      )
    `)
    .eq('tenant_id', clinic)
    .eq('created_by', userId) // Assuming created_by is the pet owner
    .order('start_time', { ascending: false });

  if (error) {
    console.error('Error fetching appointments:', error);
    return { upcoming: [], past: [] };
  }

  const upcoming = data.filter(apt => new Date(apt.start_time) >= new Date());
  const past = data.filter(apt => new Date(apt.start_time) < new Date());

  return { upcoming, past };
}

export default async function AppointmentsPage({ params }: { params: { clinic: string } }) {
  const { clinic } = params;
  const { profile } = await requireStaff(clinic); // In a real app, this would be requireOwner or similar
  const { upcoming, past } = await getAppointments(clinic, profile.id);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Mis Citas</h1>
      <AppointmentList upcoming={upcoming} past={past} clinic={clinic} />
    </div>
  );
}