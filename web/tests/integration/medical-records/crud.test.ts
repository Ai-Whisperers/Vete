/**
 * Integration Tests: Medical Records CRUD
 *
 * Tests medical record management operations.
 * @tags integration, medical-records, critical
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  getTestClient,
  TestContext,
  waitForDatabase,
} from '../../__helpers__/db';
import {
  createProfile,
  createPet,
  resetSequence,
} from '../../__helpers__/factories';
import { DEFAULT_TENANT } from '../../__fixtures__/tenants';

describe('Medical Records CRUD', () => {
  const ctx = new TestContext();
  let client: ReturnType<typeof getTestClient>;
  let ownerId: string;
  let vetId: string;
  let petId: string;

  beforeAll(async () => {
    await waitForDatabase();
    client = getTestClient();

    // Create test owner
    const owner = await createProfile({
      tenantId: DEFAULT_TENANT.id,
      role: 'owner',
    });
    ownerId = owner.id;
    ctx.track('profiles', ownerId);

    // Create test vet
    const vet = await createProfile({
      tenantId: DEFAULT_TENANT.id,
      role: 'vet',
      fullName: 'Dr. Medical Records',
    });
    vetId = vet.id;
    ctx.track('profiles', vetId);

    // Create test pet
    const pet = await createPet({
      ownerId,
      tenantId: DEFAULT_TENANT.id,
      name: 'Medical Records Pet',
    });
    petId = pet.id;
    ctx.track('pets', petId);
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  beforeEach(() => {
    resetSequence();
  });

  describe('CREATE', () => {
    test('creates consultation record', async () => {
      const { data, error } = await client
        .from('medical_records')
        .insert({
          pet_id: petId,
          tenant_id: DEFAULT_TENANT.id,
          performed_by: vetId,
          type: 'consultation',
          title: 'Consulta General',
          diagnosis: 'Paciente sano',
          notes: 'Sin anomalías detectadas.',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.type).toBe('consultation');
      expect(data.title).toBe('Consulta General');

      ctx.track('medical_records', data.id);
    });

    test('creates exam record with vitals', async () => {
      const vitals = {
        weight: 25.5,
        temp: 38.5,
        hr: 80,
        rr: 20,
      };

      const { data, error } = await client
        .from('medical_records')
        .insert({
          pet_id: petId,
          tenant_id: DEFAULT_TENANT.id,
          performed_by: vetId,
          type: 'exam',
          title: 'Examen Físico Completo',
          diagnosis: 'Estado general bueno',
          vitals,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.vitals).toEqual(vitals);
      expect(data.vitals.weight).toBe(25.5);

      ctx.track('medical_records', data.id);
    });

    test('creates surgery record', async () => {
      const { data, error } = await client
        .from('medical_records')
        .insert({
          pet_id: petId,
          tenant_id: DEFAULT_TENANT.id,
          performed_by: vetId,
          type: 'surgery',
          title: 'Castración',
          diagnosis: 'Procedimiento exitoso',
          notes: 'Paciente toleró bien la anestesia. Sin complicaciones.',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.type).toBe('surgery');

      ctx.track('medical_records', data.id);
    });

    test('creates hospitalization record', async () => {
      const { data, error } = await client
        .from('medical_records')
        .insert({
          pet_id: petId,
          tenant_id: DEFAULT_TENANT.id,
          performed_by: vetId,
          type: 'hospitalization',
          title: 'Internación por observación',
          diagnosis: 'Gastritis aguda',
          notes: 'Paciente en observación 24 horas.',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.type).toBe('hospitalization');

      ctx.track('medical_records', data.id);
    });

    test('creates wellness record', async () => {
      const { data, error } = await client
        .from('medical_records')
        .insert({
          pet_id: petId,
          tenant_id: DEFAULT_TENANT.id,
          performed_by: vetId,
          type: 'wellness',
          title: 'Control Anual',
          diagnosis: 'Paciente sano',
          vitals: {
            weight: 26.0,
            temp: 38.3,
            hr: 75,
            rr: 18,
          },
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.type).toBe('wellness');

      ctx.track('medical_records', data.id);
    });

    test('creates record with attachments', async () => {
      const { data, error } = await client
        .from('medical_records')
        .insert({
          pet_id: petId,
          tenant_id: DEFAULT_TENANT.id,
          performed_by: vetId,
          type: 'exam',
          title: 'Radiografía de Tórax',
          diagnosis: 'Sin alteraciones',
          attachments: [
            'https://storage.example.com/xray-001.jpg',
            'https://storage.example.com/xray-002.jpg',
          ],
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.attachments).toHaveLength(2);

      ctx.track('medical_records', data.id);
    });

    test('fails with invalid record type', async () => {
      const { error } = await client
        .from('medical_records')
        .insert({
          pet_id: petId,
          tenant_id: DEFAULT_TENANT.id,
          type: 'invalid_type',
          title: 'Invalid',
        });

      expect(error).not.toBeNull();
    });

    test('fails with non-existent pet', async () => {
      const { error } = await client
        .from('medical_records')
        .insert({
          pet_id: '00000000-0000-0000-0000-999999999999',
          tenant_id: DEFAULT_TENANT.id,
          type: 'consultation',
          title: 'Orphan Record',
        });

      expect(error).not.toBeNull();
    });
  });

  describe('READ', () => {
    let recordId: string;

    beforeAll(async () => {
      const { data } = await client
        .from('medical_records')
        .insert({
          pet_id: petId,
          tenant_id: DEFAULT_TENANT.id,
          performed_by: vetId,
          type: 'consultation',
          title: 'Read Test Record',
          diagnosis: 'Test diagnosis',
          vitals: { weight: 20, temp: 38.5, hr: 70, rr: 15 },
        })
        .select()
        .single();
      recordId = data.id;
      ctx.track('medical_records', recordId);
    });

    test('reads record by ID', async () => {
      const { data, error } = await client
        .from('medical_records')
        .select('*')
        .eq('id', recordId)
        .single();

      expect(error).toBeNull();
      expect(data.title).toBe('Read Test Record');
    });

    test('reads records by pet', async () => {
      const { data, error } = await client
        .from('medical_records')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false });

      expect(error).toBeNull();
      expect(data.length).toBeGreaterThan(0);
    });

    test('reads record with vet details', async () => {
      const { data, error } = await client
        .from('medical_records')
        .select(`
          *,
          vet:profiles!medical_records_performed_by_fkey(id, full_name)
        `)
        .eq('id', recordId)
        .single();

      expect(error).toBeNull();
      expect(data.vet).toBeDefined();
      expect(data.vet.full_name).toBe('Dr. Medical Records');
    });

    test('filters records by type', async () => {
      const { data, error } = await client
        .from('medical_records')
        .select('*')
        .eq('pet_id', petId)
        .eq('type', 'consultation');

      expect(error).toBeNull();
      expect(data.every((r: { type: string }) => r.type === 'consultation')).toBe(true);
    });

    test('filters records by date range', async () => {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);

      const { data, error } = await client
        .from('medical_records')
        .select('*')
        .eq('pet_id', petId)
        .gte('created_at', startDate.toISOString());

      expect(error).toBeNull();
    });
  });

  describe('UPDATE', () => {
    let updateRecordId: string;

    beforeAll(async () => {
      const { data } = await client
        .from('medical_records')
        .insert({
          pet_id: petId,
          tenant_id: DEFAULT_TENANT.id,
          performed_by: vetId,
          type: 'consultation',
          title: 'Update Test Record',
        })
        .select()
        .single();
      updateRecordId = data.id;
      ctx.track('medical_records', updateRecordId);
    });

    test('updates diagnosis', async () => {
      const { data, error } = await client
        .from('medical_records')
        .update({ diagnosis: 'Updated diagnosis' })
        .eq('id', updateRecordId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.diagnosis).toBe('Updated diagnosis');
    });

    test('updates notes', async () => {
      const { data, error } = await client
        .from('medical_records')
        .update({ notes: 'Updated notes with more details.' })
        .eq('id', updateRecordId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.notes).toBe('Updated notes with more details.');
    });

    test('updates vitals', async () => {
      const newVitals = { weight: 22, temp: 38.0, hr: 72, rr: 16 };

      const { data, error } = await client
        .from('medical_records')
        .update({ vitals: newVitals })
        .eq('id', updateRecordId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.vitals).toEqual(newVitals);
    });

    test('adds attachments', async () => {
      const { data, error } = await client
        .from('medical_records')
        .update({
          attachments: ['https://storage.example.com/new-attachment.jpg'],
        })
        .eq('id', updateRecordId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.attachments).toHaveLength(1);
    });
  });

  describe('DELETE', () => {
    test('deletes record by ID', async () => {
      // Create record to delete
      const { data: created } = await client
        .from('medical_records')
        .insert({
          pet_id: petId,
          tenant_id: DEFAULT_TENANT.id,
          type: 'consultation',
          title: 'To Delete',
        })
        .select()
        .single();

      // Delete it
      const { error } = await client
        .from('medical_records')
        .delete()
        .eq('id', created.id);

      expect(error).toBeNull();

      // Verify deleted
      const { data: found } = await client
        .from('medical_records')
        .select('*')
        .eq('id', created.id)
        .single();

      expect(found).toBeNull();
    });
  });

  describe('MEDICAL HISTORY TIMELINE', () => {
    test('gets complete medical history for pet', async () => {
      const { data, error } = await client
        .from('medical_records')
        .select(`
          *,
          vet:profiles!medical_records_performed_by_fkey(full_name)
        `)
        .eq('pet_id', petId)
        .order('created_at', { ascending: false });

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    test('calculates record statistics', async () => {
      const { data, error } = await client
        .from('medical_records')
        .select('type')
        .eq('pet_id', petId);

      expect(error).toBeNull();

      // Count by type
      const stats = data.reduce((acc: Record<string, number>, record: { type: string }) => {
        acc[record.type] = (acc[record.type] || 0) + 1;
        return acc;
      }, {});

      expect(typeof stats).toBe('object');
    });
  });
});
