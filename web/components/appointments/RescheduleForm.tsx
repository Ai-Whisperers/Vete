import React, { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';

interface RescheduleFormProps {
  appointmentId: number;
}

const RescheduleForm: React.FC<RescheduleFormProps> = ({ appointmentId }) => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleReschedule = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('appointments')
        .update({
          id: appointmentId,
          date,
          time,
        });

      if (error) {
        console.error(error);
      } else {
        router.push('/appointments');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form>
      <label>
        Date:
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <label>
        Time:
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </label>
      <button type="submit" onClick={handleReschedule}>
        Reschedule
      </button>
    </form>
  );
};

export default RescheduleForm;