import { describe, it, expect } from 'vitest';
import { setupIntegrationTest } from '../__helpers__/integration-setup';
import { createTestProfile } from '../__helpers__/factories';

describe('Video Call Integration Tests', () => {
  let supabase: any;

  beforeAll(async () => {
    supabase = await setupIntegrationTest();
  });

  afterAll(async () => {
    await cleanupIntegrationTest();
  });

  it('should create a video call', async () => {
    const patientId = 1;
    const veterinarianId = 1;

    const { data, error } = await supabase
      .from('video_calls')
      .insert([
        {
          patient_id: patientId,
          veterinarian_id: veterinarianId,
          status: 'calling',
        },
      ]);

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it('should update the video call status', async () => {
    const patientId = 1;
    const veterinarianId = 1;

    const { data, error } = await supabase
      .from('video_calls')
      .insert([
        {
          patient_id: patientId,
          veterinarian_id: veterinarianId,
          status: 'calling',
        },
      ]);

    const videoCallId = data[0].id;

    const { data: updatedData, error: updatedError } = await supabase
      .from('video_calls')
      .update({
        id: videoCallId,
        status: 'ended',
      });

    expect(updatedError).toBeNull();
    expect(updatedData).toHaveLength(1);
  });
});