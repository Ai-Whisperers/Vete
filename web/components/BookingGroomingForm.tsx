import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase/server';

const groomingSchema = z.object({
  service: z.string().min(1, 'Service is required'),
  date: z.date('yyyy-MM-dd'),
  time: z.string().min(1, 'Time is required'),
  groomer: z.string().min(1, 'Groomer is required'),
});

type GroomingForm = z.infer<typeof groomingSchema>;

const BookingGroomingForm = () => {
  const [services, setServices] = useState([]);
  const [groomers, setGroomers] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GroomingForm>({
    resolver: zodResolver(groomingSchema),
  });

  const onSubmit = async (data: GroomingForm) => {
    try {
      const { data: bookingData, error } = await supabase
        .from('bookings')
        .insert([{
          service: data.service,
          date: data.date,
          time: data.time,
          groomer: data.groomer,
        }]);

      if (error) {
        console.error(error);
      } else {
        console.log(bookingData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleServiceChange = async (service: string) => {
    try {
      const { data: groomersData, error } = await supabase
        .from('groomers')
        .select('id, name')
        .eq('service', service);

      if (error) {
        console.error(error);
      } else {
        setGroomers(groomersData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDateChange = async (date: Date) => {
    try {
      const { data: timeSlotsData, error } = await supabase
        .from('time_slots')
        .select('id, start_time, end_time')
        .eq('date', format(date, 'yyyy-MM-dd'));

      if (error) {
        console.error(error);
      } else {
        setTimeSlots(timeSlotsData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>
        Service:
        <select {...register('service')} onChange={(e) => handleServiceChange(e.target.value)}>
          {services.map((service) => (
            <option key={service.id} value={service.name}>
              {service.name}
            </option>
          ))}
        </select>
        {errors.service && <div>{errors.service.message}</div>}
      </label>

      <label>
        Date:
        <input type="date" {...register('date')} onChange={(e) => handleDateChange(new Date(e.target.value))} />
        {errors.date && <div>{errors.date.message}</div>}
      </label>

      <label>
        Time:
        <select {...register('time')}>
          {timeSlots.map((timeSlot) => (
            <option key={timeSlot.id} value={`${format(new Date(timeSlot.start_time), 'HH:mm')} - ${format(new Date(timeSlot.end_time), 'HH:mm')}`}>
              {format(new Date(timeSlot.start_time), 'HH:mm')} - {format(new Date(timeSlot.end_time), 'HH:mm')}
            </option>
          ))}
        </select>
        {errors.time && <div>{errors.time.message}</div>}
      </label>

      <label>
        Groomer:
        <select {...register('groomer')}>
          {groomers.map((groomer) => (
            <option key={groomer.id} value={groomer.name}>
              {groomer.name}
            </option>
          ))}
        </select>
        {errors.groomer && <div>{errors.groomer.message}</div>}
      </label>

      <button type="submit">Book Appointment</button>
    </form>
  );
};

export default BookingGroomingForm;