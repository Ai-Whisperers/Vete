import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Reminders from '../components/Reminders';

interface Appointment {
  id: number;
  petName: string;
  appointmentDate: string;
  appointmentTime: string;
}

const AppointmentPage = ({ id }) => {
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id);
      if (error) {
        console.error(error);
      } else {
        setAppointment(data[0]);
      }
    };
    fetchAppointment();
  }, [id]);

  return (
    <div>
      <h1>Appointment {id}</h1>
      {appointment && (
        <div>
          <p>Pet Name: {appointment.petName}</p>
          <p>Appointment Date: {appointment.appointmentDate}</p>
          <p>Appointment Time: {appointment.appointmentTime}</p>
        </div>
      )}
      <Reminders />
    </div>
  );
};

export default AppointmentPage;