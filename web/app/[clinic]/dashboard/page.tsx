"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Appointment {
  id: string;
  pet_name: string;
  owner_name: string;
  start_time: string;
  status: string;
}

export default function ClinicDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/'); // not logged in -> back to login
        return;
      }
      // For now fetch upcoming appointments (placeholder query)
      const { data, error } = await supabase
        .from('appointments')
        .select('id, pet_name, owner_name, start_time, status')
        .order('start_time', { ascending: true })
        .limit(5);
      if (error) console.error('Error loading appointments', error);
      else setAppointments(data as Appointment[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <p className="p-4">Loading dashboard...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Clinic Dashboard</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Upcoming Appointments</h2>
        {appointments.length === 0 ? (
          <p>No upcoming appointments.</p>
        ) : (
          <ul className="space-y-2">
            {appointments.map((a) => (
              <li key={a.id} className="border rounded p-3 bg-white shadow">
                <p><strong>{a.pet_name}</strong> ({a.owner_name})</p>
                <p>{new Date(a.start_time).toLocaleString()}</p>
                <p>Status: {a.status}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      {/* Additional widgets can be added here, e.g., stats, quick actions */}
    </div>
  );
}
