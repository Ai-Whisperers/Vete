/**
 * Integration Tests: Appointment Booking
 *
 * Tests appointment CRUD operations and booking workflows.
 * @tags integration, booking, appointments, critical
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  getTestClient,
  TestContext,
  waitForDatabase,
} from '../../__helpers__/db';
import {
  buildAppointment,
  createPet,
  createAppointment,
  createProfile,
  resetSequence,
  futureDate,
  pastDate,
} from '../../__helpers__/factories';
import { DEFAULT_TENANT } from '../../__fixtures__/tenants';
import {
  ALL_APPOINTMENT_TYPES,
  ALL_APPOINTMENT_STATUSES,
  TIME_SLOTS,
} from '../../__fixtures__/appointments';

describe('Appointment Booking', () => {
  const ctx = new TestContext();
  let testOwnerId: string;
  let testPetId: string;
  let testVetId: string;

  beforeAll(async () => {
    await waitForDatabase();

    // Create test owner
    const owner = await createProfile({
      tenantId: DEFAULT_TENANT.id,
      role: 'owner',
    });
    testOwnerId = owner.id;
    ctx.track('profiles', testOwnerId);

    // Create test vet
    const vet = await createProfile({
      tenantId: DEFAULT_TENANT.id,
      role: 'vet',
    });
    testVetId = vet.id;
    ctx.track('profiles', testVetId);

    // Create test pet
    const pet = await createPet({
      ownerId: testOwnerId,
      tenantId: DEFAULT_TENANT.id,
    });
    testPetId = pet.id;
    ctx.track('pets', testPetId);
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  beforeEach(() => {
    resetSequence();
  });

  describe('CREATE', () => {
    test('creates appointment with required fields', async () => {
      const client = getTestClient();
      const appointmentDate = futureDate(7);

      const { data, error } = await client
        .from('appointments')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          pet_id: testPetId,
          owner_id: testOwnerId,
          type: 'consultation',
          date: appointmentDate,
          time: '10:00',
          status: 'pending',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.type).toBe('consultation');
      expect(data.status).toBe('pending');
      expect(data.date).toBe(appointmentDate);

      ctx.track('appointments', data.id);
    });

    test('creates appointment with all fields', async () => {
      const client = getTestClient();
      const appointmentDate = futureDate(14);

      const { data, error } = await client
        .from('appointments')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          pet_id: testPetId,
          owner_id: testOwnerId,
          vet_id: testVetId,
          type: 'vaccination',
          date: appointmentDate,
          time: '09:30',
          duration: 30,
          status: 'confirmed',
          reason: 'Vacuna antirrábica anual',
          notes: 'Traer cartilla de vacunación',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.type).toBe('vaccination');
      expect(data.status).toBe('confirmed');
      expect(data.vet_id).toBe(testVetId);
      expect(data.reason).toBe('Vacuna antirrábica anual');

      ctx.track('appointments', data.id);
    });

    test('creates appointments for all types', async () => {
      const client = getTestClient();

      for (const type of ALL_APPOINTMENT_TYPES) {
        const { data, error } = await client
          .from('appointments')
          .insert({
            tenant_id: DEFAULT_TENANT.id,
            pet_id: testPetId,
            owner_id: testOwnerId,
            type,
            date: futureDate(Math.floor(Math.random() * 30) + 1),
            time: TIME_SLOTS[Math.floor(Math.random() * TIME_SLOTS.length)],
            status: 'pending',
          })
          .select()
          .single();

        expect(error).toBeNull();
        expect(data.type).toBe(type);
        ctx.track('appointments', data.id);
      }
    });

    test('fails with invalid type', async () => {
      const client = getTestClient();

      const { error } = await client
        .from('appointments')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          pet_id: testPetId,
          owner_id: testOwnerId,
          type: 'invalid_type', // Invalid
          date: futureDate(7),
          time: '10:00',
          status: 'pending',
        });

      expect(error).not.toBeNull();
    });

    test('fails with invalid status', async () => {
      const client = getTestClient();

      const { error } = await client
        .from('appointments')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          pet_id: testPetId,
          owner_id: testOwnerId,
          type: 'consultation',
          date: futureDate(7),
          time: '10:00',
          status: 'invalid_status', // Invalid
        });

      expect(error).not.toBeNull();
    });

    test('fails with non-existent pet_id', async () => {
      const client = getTestClient();

      const { error } = await client
        .from('appointments')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          pet_id: '00000000-0000-0000-0000-999999999999', // Non-existent
          owner_id: testOwnerId,
          type: 'consultation',
          date: futureDate(7),
          time: '10:00',
          status: 'pending',
        });

      expect(error).not.toBeNull();
    });
  });

  describe('READ', () => {
    let readTestAppointmentId: string;

    beforeAll(async () => {
      const client = getTestClient();
      const { data } = await client
        .from('appointments')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          pet_id: testPetId,
          owner_id: testOwnerId,
          vet_id: testVetId,
          type: 'checkup',
          date: futureDate(21),
          time: '11:00',
          status: 'confirmed',
          reason: 'Read test appointment',
        })
        .select()
        .single();
      readTestAppointmentId = data.id;
      ctx.track('appointments', readTestAppointmentId);
    });

    test('reads appointment by ID', async () => {
      const client = getTestClient();

      const { data, error } = await client
        .from('appointments')
        .select('*')
        .eq('id', readTestAppointmentId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.reason).toBe('Read test appointment');
    });

    test('reads appointments by owner', async () => {
      const client = getTestClient();

      const { data, error } = await client
        .from('appointments')
        .select('*')
        .eq('owner_id', testOwnerId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data).not.toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data!.length).toBeGreaterThan(0);
    });

    test('reads appointments by pet', async () => {
      const client = getTestClient();

      const { data, error } = await client
        .from('appointments')
        .select('*')
        .eq('pet_id', testPetId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    test('reads appointments by vet', async () => {
      const client = getTestClient();

      const { data, error } = await client
        .from('appointments')
        .select('*')
        .eq('vet_id', testVetId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data).not.toBeNull();
      expect(data!.every((a: { vet_id: string }) => a.vet_id === testVetId)).toBe(true);
    });

    test('reads appointment with pet and owner details (join)', async () => {
      const client = getTestClient();

      const { data, error } = await client
        .from('appointments')
        .select(`
          *,
          pet:pets(id, name, species),
          owner:profiles!appointments_owner_id_fkey(id, full_name, phone)
        `)
        .eq('id', readTestAppointmentId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.pet).toBeDefined();
      expect(data.owner).toBeDefined();
    });

    test('filters appointments by status', async () => {
      const client = getTestClient();

      const { data, error } = await client
        .from('appointments')
        .select('*')
        .eq('tenant_id', DEFAULT_TENANT.id)
        .eq('status', 'confirmed');

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data!.every((a: { status: string }) => a.status === 'confirmed')).toBe(true);
    });

    test('filters appointments by date range', async () => {
      const client = getTestClient();
      const startDate = futureDate(0);
      const endDate = futureDate(30);

      const { data, error } = await client
        .from('appointments')
        .select('*')
        .eq('tenant_id', DEFAULT_TENANT.id)
        .gte('date', startDate)
        .lte('date', endDate);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    test('orders appointments by date and time', async () => {
      const client = getTestClient();

      const { data, error } = await client
        .from('appointments')
        .select('*')
        .eq('tenant_id', DEFAULT_TENANT.id)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('UPDATE', () => {
    let updateTestAppointmentId: string;

    beforeAll(async () => {
      const client = getTestClient();
      const { data } = await client
        .from('appointments')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          pet_id: testPetId,
          owner_id: testOwnerId,
          type: 'consultation',
          date: futureDate(10),
          time: '14:00',
          status: 'pending',
        })
        .select()
        .single();
      updateTestAppointmentId = data.id;
      ctx.track('appointments', updateTestAppointmentId);
    });

    test('updates appointment status from pending to confirmed', async () => {
      const client = getTestClient();

      const { data, error } = await client
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', updateTestAppointmentId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.status).toBe('confirmed');
    });

    test('assigns vet to appointment', async () => {
      const client = getTestClient();

      const { data, error } = await client
        .from('appointments')
        .update({ vet_id: testVetId })
        .eq('id', updateTestAppointmentId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.vet_id).toBe(testVetId);
    });

    test('reschedules appointment (date and time)', async () => {
      const client = getTestClient();
      const newDate = futureDate(15);

      const { data, error } = await client
        .from('appointments')
        .update({
          date: newDate,
          time: '16:00',
        })
        .eq('id', updateTestAppointmentId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.date).toBe(newDate);
      expect(data.time).toBe('16:00');
    });

    test('adds notes to appointment', async () => {
      const client = getTestClient();

      const { data, error } = await client
        .from('appointments')
        .update({ notes: 'Paciente con alergia a penicilina' })
        .eq('id', updateTestAppointmentId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.notes).toBe('Paciente con alergia a penicilina');
    });

    test('cancels appointment', async () => {
      const client = getTestClient();

      const { data, error } = await client
        .from('appointments')
        .update({
          status: 'cancelled',
          notes: 'Cancelado por cliente',
        })
        .eq('id', updateTestAppointmentId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.status).toBe('cancelled');
    });

    test('completes appointment', async () => {
      const client = getTestClient();

      // First create a confirmed appointment
      const { data: newAppt } = await client
        .from('appointments')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          pet_id: testPetId,
          owner_id: testOwnerId,
          vet_id: testVetId,
          type: 'checkup',
          date: pastDate(1), // Yesterday
          time: '10:00',
          status: 'confirmed',
        })
        .select()
        .single();
      ctx.track('appointments', newAppt.id);

      // Complete it
      const { data, error } = await client
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', newAppt.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.status).toBe('completed');
    });
  });

  describe('DELETE', () => {
    test('deletes appointment by ID', async () => {
      const client = getTestClient();

      // Create appointment to delete
      const { data: created } = await client
        .from('appointments')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          pet_id: testPetId,
          owner_id: testOwnerId,
          type: 'grooming',
          date: futureDate(5),
          time: '09:00',
          status: 'pending',
        })
        .select()
        .single();

      // Delete appointment
      const { error: deleteError } = await client
        .from('appointments')
        .delete()
        .eq('id', created.id);

      expect(deleteError).toBeNull();

      // Verify deleted
      const { data: found } = await client
        .from('appointments')
        .select('*')
        .eq('id', created.id)
        .single();

      expect(found).toBeNull();
    });
  });

  describe('SCHEDULING CONFLICTS', () => {
    test('allows multiple appointments at same time for different vets', async () => {
      const client = getTestClient();
      const appointmentDate = futureDate(25);
      const appointmentTime = '10:00';

      // Create another vet
      const vet2 = await createProfile({
        tenantId: DEFAULT_TENANT.id,
        role: 'vet',
      });
      ctx.track('profiles', vet2.id);

      // Create appointment for vet 1
      const { data: appt1, error: error1 } = await client
        .from('appointments')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          pet_id: testPetId,
          owner_id: testOwnerId,
          vet_id: testVetId,
          type: 'consultation',
          date: appointmentDate,
          time: appointmentTime,
          status: 'confirmed',
        })
        .select()
        .single();

      expect(error1).toBeNull();
      ctx.track('appointments', appt1.id);

      // Create another pet for the second appointment
      const pet2 = await createPet({
        ownerId: testOwnerId,
        tenantId: DEFAULT_TENANT.id,
      });
      ctx.track('pets', pet2.id);

      // Create appointment for vet 2 at same time (should succeed)
      const { data: appt2, error: error2 } = await client
        .from('appointments')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          pet_id: pet2.id,
          owner_id: testOwnerId,
          vet_id: vet2.id,
          type: 'consultation',
          date: appointmentDate,
          time: appointmentTime,
          status: 'confirmed',
        })
        .select()
        .single();

      expect(error2).toBeNull();
      ctx.track('appointments', appt2.id);
    });
  });

  describe('MULTI-TENANT ISOLATION', () => {
    test('appointments are isolated by tenant', async () => {
      const client = getTestClient();

      // Create profile in petlife
      const petlifeOwner = await createProfile({
        tenantId: 'petlife',
        role: 'owner',
      });
      ctx.track('profiles', petlifeOwner.id);

      // Create pet in petlife
      const petlifePet = await createPet({
        ownerId: petlifeOwner.id,
        tenantId: 'petlife',
      });
      ctx.track('pets', petlifePet.id);

      // Create appointment in adris
      const { data: adrisAppt } = await client
        .from('appointments')
        .insert({
          tenant_id: 'adris',
          pet_id: testPetId,
          owner_id: testOwnerId,
          type: 'consultation',
          date: futureDate(30),
          time: '10:00',
          status: 'pending',
        })
        .select()
        .single();
      ctx.track('appointments', adrisAppt.id);

      // Create appointment in petlife
      const { data: petlifeAppt } = await client
        .from('appointments')
        .insert({
          tenant_id: 'petlife',
          pet_id: petlifePet.id,
          owner_id: petlifeOwner.id,
          type: 'checkup',
          date: futureDate(30),
          time: '11:00',
          status: 'pending',
        })
        .select()
        .single();
      ctx.track('appointments', petlifeAppt.id);

      // Query adris appointments
      const { data: adrisAppts } = await client
        .from('appointments')
        .select('*')
        .eq('tenant_id', 'adris');

      // Query petlife appointments
      const { data: petlifeAppts } = await client
        .from('appointments')
        .select('*')
        .eq('tenant_id', 'petlife');

      // Verify isolation
      expect(adrisAppts).not.toBeNull();
      expect(petlifeAppts).not.toBeNull();
      expect(adrisAppts!.some((a: { id: string }) => a.id === adrisAppt.id)).toBe(true);
      expect(adrisAppts!.some((a: { id: string }) => a.id === petlifeAppt.id)).toBe(false);
      expect(petlifeAppts!.some((a: { id: string }) => a.id === petlifeAppt.id)).toBe(true);
      expect(petlifeAppts!.some((a: { id: string }) => a.id === adrisAppt.id)).toBe(false);
    });
  });
});
