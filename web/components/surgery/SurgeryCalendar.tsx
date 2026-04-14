import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const SurgeryCalendar = () => {
  const [surgeries, setSurgeries] = useState([]);

  useEffect(() => {
    const fetchSurgeries = async () => {
      const { data, error } = await supabase
        .from('surgeries')
        .select('id, start_time, end_time, surgeon, room');

      if (error) {
        console.error(error);
      } else {
        setSurgeries(data);
      }
    };

    fetchSurgeries();
  }, []);

  const events = surgeries.map((surgery) => ({
    id: surgery.id,
    title: `Surgery with ${surgery.surgeon}`,
    start: new Date(surgery.start_time),
    end: new Date(surgery.end_time),
    room: surgery.room,
  }));

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500 }}
    />
  );
};

export default SurgeryCalendar;