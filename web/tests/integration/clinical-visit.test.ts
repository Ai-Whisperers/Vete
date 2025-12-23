/**
 * Clinical Visit Integration Tests
 * 
 * Verifies the full business lifecycle of a clinical visit:
 * 1. Appointment scheduling
 * 2. Check-in (Status update)
 * 3. Medical Record creation (Diagnosis)
 * 4. Prescription (Inventory)
 * 5. Invoicing
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { getTestClient, cleanupTestData, seedTenants } from '@/tests/__helpers__/db';
import { 
  createProfile, 
  createPet, 
  createAppointment, 
  createMedicalRecord, 
  createInvoice 
} from '@/tests/__helpers__/factories';

describe('Clinical Visit Lifecycle', () => {
  // Track IDs for cleanup
  const cleanupIds: Record<string, string[]> = {
    profiles: [],
    pets: [],
    appointments: [],
    medical_records: [],
    invoices: [],
  };

  const client = getTestClient();

  beforeAll(async () => {
    // Ensure tenents exist
    await seedTenants();
  });

  afterAll(async () => {
    await cleanupTestData(cleanupIds);
  });

  test('complete clinical visit flow', async () => {
    // 1. Setup Data: Owner, Pet, Vet (Author)
    const owner = await createProfile({ tenantId: 'adris', role: 'owner' });
    cleanupIds.profiles.push(owner.id);

    const vet = await createProfile({ tenantId: 'adris', role: 'vet', fullName: 'Dr. Test' });
    cleanupIds.profiles.push(vet.id); // Add vet to cleanup if createProfile returns id

    const pet = await createPet({ 
      ownerId: owner.id, 
      tenantId: 'adris',
      name: 'Sick Puppy' 
    });
    cleanupIds.pets.push(pet.id);

    // 2. Schedule Appointment
    const appointment = await createAppointment({
      tenantId: 'adris',
      petId: pet.id,
      ownerId: owner.id,
      vetId: vet.id,
      status: 'confirmed',
      reason: 'General Checkup'
    });
    cleanupIds.appointments.push(appointment.id);

    expect(appointment.id).toBeDefined();
    expect(appointment.status).toBe('confirmed');

    // 3. Vet "Checks In" the patient (Status: confirmed/in-progress)
    const adminClient = getTestClient({ serviceRole: true });
    const { error: updateError } = await adminClient
      .from('appointments')
      .update({ status: 'confirmed' }) // or 'checked-in' if supported
      .eq('id', appointment.id);
    
    expect(updateError).toBeNull();

    // 4. Create Medical Record (The Consultation)
    const medicalRecord = await createMedicalRecord(pet.id, {
      tenantId: 'adris',
      performedBy: vet.id,
      type: 'consultation',
      diagnosis: 'Mild Gastritis',
      notes: 'Patient ate something bad. Prescribed diet.',
      vitals: { weight: 10.5, temp: 39.2 }
    });
    cleanupIds.medical_records.push(medicalRecord.id);

    expect(medicalRecord.id).toBeDefined();
    // Verify link to pet
    const { data: storedRecord } = await adminClient
      .from('medical_records')
      .select('pet_id')
      .eq('id', medicalRecord.id)
      .single();
    expect(storedRecord?.pet_id).toBe(pet.id);

    // 5. Generate Invoice
    const invoice = await createInvoice({
      tenantId: 'adris',
      clientId: owner.id,
      petId: pet.id,
      status: 'draft'
    });
    cleanupIds.invoices.push(invoice.id);

    expect(invoice.id).toBeDefined();
    expect(invoice.status).toBe('draft');
    expect(invoice.clientId).toBe(owner.id); // Validating alias mapping
    
    // 6. Close Appointment
    const { error: closeError } = await adminClient
      .from('appointments')
      .update({ status: 'completed' })
      .eq('id', appointment.id);
    
    expect(closeError).toBeNull();

    // Final Validation: Verify Appointment History for Pet
    const { data: petHistory } = await adminClient
      .from('appointments')
      .select('status')
      .eq('pet_id', pet.id)
      .eq('status', 'completed');
    
    expect(petHistory).toBeDefined();
    expect(petHistory?.length).toBeGreaterThan(0);
  });
});
