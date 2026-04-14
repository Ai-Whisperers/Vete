import React from 'react';
import { Appointment } from '@prisma/client';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';

interface AppointmentCardProps {
  appointment: Appointment;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  const handleReschedule = async () => {
    // Open reschedule modal or navigate to reschedule page
    router.push(`/appointments/${appointment.id}/reschedule`);
  };

  return (
    <div>
      <h2>Appointment {appointment.id}</h2>
      <p>Date: {appointment.date}</p>
      <p>Time: {appointment.time}</p>
      <button onClick={handleReschedule}>Reschedule</button>
    </div>
  );
};

export default AppointmentCard;