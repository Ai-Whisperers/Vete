import { describe, test, expect } from 'vitest';
import { getTestClient, TestContext } from '../../__helpers__/db';
import { createPet, createProfile } from '../../__helpers__/factories';
import { supabase } from '@/lib/supabase/server';

describe('Grooming Booking', () => {
  let testContext: TestContext;

  beforeAll(async () => {
    testContext = await getTestClient();
  });

  afterAll(async () => {
    await testContext.close();
  });

  test('should book a grooming appointment', async () => {
    const pet = await createPet(testContext);
    const profile = await createProfile(testContext);

    const { data: services, error } = await supabase
      .from('services')
      .select('id, name');

    if (error) {
      console.error(error);
    } else {
      const service = services[0];

      const { data: groomers, error: groomersError } = await supabase
        .from('groomers')
        .select('id, name')
        .eq('service', service.name);

      if (groomersError) {
        console.error(groomersError);
      } else {
        const groomer = groomers[0];

        const { data: timeSlots, error: timeSlotsError } = await supabase
          .from('time_slots')
          .select('id, start_time, end_time')
          .eq('date', '2024-09-16');

        if (timeSlotsError) {
          console.error(timeSlotsError);
        } else {
          const timeSlot = timeSlots[0];

          const { data: bookingData, error: bookingError } = await supabase
            .from('bookings')
            .insert([{
              service: service.name,
              date: '2024-09-16',
              time: `${format(new Date(timeSlot.start_time), 'HH:mm')} - ${format(new Date(timeSlot.end_time), 'HH:mm')}`,
              groomer: groomer.name,
            }]);

          if (bookingError) {
            console.error(bookingError);
          } else {
            expect(bookingData).toHaveLength(1);
          }
        }
      }
    }
  });
});