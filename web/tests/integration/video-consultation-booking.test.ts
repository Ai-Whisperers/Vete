import { describe, it, expect } from 'vitest';
import { setupIntegrationTest } from '../__helpers__/integration-setup';
import { createTestProfile } from '../__helpers__/factories';

describe('Video Consultation Booking Integration Tests', () => {
  let supabase: any;

  beforeAll(async () => {
    supabase = await setupIntegrationTest();
  });

  afterAll(async () => {
    await cleanupIntegrationTest();
  });

  it('should book a video consultation', async () => {
    const patientId = 1;
    const veterinarianId = 1;

    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          patient_id: patientId,
          veterinarian_id: veterinarianId,
          time_slot_id: 1,
          payment_method: 'credit-card',
        },
      ]);

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });
});