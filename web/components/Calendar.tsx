import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Appointment } from '../types/appointment';

interface CalendarProps {
  // Add props if needed
}

const Calendar: React.FC<CalendarProps> = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [filter, setFilter] = useState<{ status: string }>({ status: '' });

  useEffect(() => {
    const fetchAppointments = async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('status', filter.status);

      if (error) {
        console.error(error);
      } else {
        setAppointments(data);
      }
    };

    fetchAppointments();
  }, [filter.status]);

  const handleDragDrop = (appointment: Appointment) => {
    // Implement drag-drop logic
  };

  const handleFilterChange = (status: string) => {
    setFilter({ status });
  };

  return (
    <div>
      <h1>Calendar</h1>
      <div>
        <button onClick={() => setView('day')}>Day</button>
        <button onClick={() => setView('week')}>Week</button>
        <button onClick={() => setView('month')}>Month</button>
      </div>
      <div>
        <select value={filter.status} onChange={(e) => handleFilterChange(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {view === 'day' && (
        <div>
          {appointments.map((appointment) => (
            <div key={appointment.id} style={{ backgroundColor: appointment.status === 'pending' ? 'yellow' : appointment.status === 'confirmed' ? 'green' : 'red' }}>
              {appointment.petName} - {appointment.startTime} - {appointment.endTime}
            </div>
          ))}
        </div>
      )}
      {view === 'week' && (
        <div>
          {/* Implement week view */}
        </div>
      )}
      {view === 'month' && (
        <div>
          {/* Implement month view */}
        </div>
      )}
    </div>
  );
};

export default Calendar;