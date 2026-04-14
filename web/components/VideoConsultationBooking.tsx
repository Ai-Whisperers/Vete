import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';

interface VideoConsultationBookingProps {
  patientId: number;
  veterinarianId: number;
}

const VideoConsultationBooking: React.FC<VideoConsultationBookingProps> = ({ patientId, veterinarianId }) => {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('veterinarian_id', veterinarianId);

      if (error) {
        console.error(error);
      } else {
        setTimeSlots(data);
      }
    };

    fetchTimeSlots();
  }, [veterinarianId]);

  const handleBooking = async (data: any) => {
    try {
      const { data: bookingData, error } = await supabase
        .from('bookings')
        .insert([
          {
            patient_id: patientId,
            veterinarian_id: veterinarianId,
            time_slot_id: selectedTimeSlot.id,
            payment_method: paymentMethod,
          },
        ]);

      if (error) {
        console.error(error);
      } else {
        router.push('/video-consultation');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Book a Video Consultation</h1>
      <form onSubmit={handleSubmit(handleBooking)}>
        <div>
          <label>Time Slot:</label>
          <select {...register('timeSlot')} onChange={(e) => setSelectedTimeSlot(timeSlots.find((slot) => slot.id === parseInt(e.target.value)))}>
            {timeSlots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.start_time} - {slot.end_time}
              </option>
            ))}
          </select>
          {errors.timeSlot && <div>{errors.timeSlot.message}</div>}
        </div>
        <div>
          <label>Payment Method:</label>
          <select {...register('paymentMethod')} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="credit-card">Credit Card</option>
            <option value="paypal">PayPal</option>
          </select>
          {errors.paymentMethod && <div>{errors.paymentMethod.message}</div>}
        </div>
        <button type="submit">Book Consultation</button>
      </form>
    </div>
  );
};

export default VideoConsultationBooking;