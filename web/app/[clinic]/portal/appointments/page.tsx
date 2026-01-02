import { AppointmentList } from '@/components/appointments/appointment-list';
import { getOwnerAppointments } from '@/app/actions/appointments';
import { notFound } from 'next/navigation';

export default async function AppointmentsPage({ params }: { params: Promise<{ clinic: string }> }) {
  const { clinic } = await params;

  const result = await getOwnerAppointments(clinic);

  if (!result.success) {
    // Handle unauthorized or other errors
    return (
        <div className="p-8 text-center bg-red-50 text-red-600 rounded-2xl">
            <p className="font-bold">Error al cargar citas</p>
            <p className="text-sm">{result.error}</p>
        </div>
    );
  }

  const { upcoming, past } = result.data;

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-black text-[var(--text-primary)] mb-8 px-4 sm:px-6 lg:px-8">Mis Citas</h1>
      <AppointmentList upcoming={upcoming} past={past} clinic={clinic} />
    </div>
  );
}
