/**
 * Integration Tests: Prescriptions CRUD
 *
 * Tests prescription management and digital signing.
 * @tags integration, prescriptions, critical
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

describe('Prescriptions CRUD', () => {
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

    // Create test vet with signature
    const vet = await createProfile({
      tenantId: DEFAULT_TENANT.id,
      role: 'vet',
      fullName: 'Dr. Prescription Vet',
    });
    vetId = vet.id;
    ctx.track('profiles', vetId);

    // Create test pet
    const pet = await createPet({
      ownerId,
      tenantId: DEFAULT_TENANT.id,
      name: 'Prescription Pet',
      weightKg: 20,
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
    test('creates basic prescription', async () => {
      const { data, error } = await client
        .from('prescriptions')
        .insert({
          pet_id: petId,
          drug_name: 'Amoxicilina',
          dosage: '250mg cada 12 horas',
          instructions: 'Administrar con comida. Tratamiento por 7 días.',
          signed_by: vetId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.drug_name).toBe('Amoxicilina');
      expect(data.signed_by).toBe(vetId);

      ctx.track('prescriptions', data.id);
    });

    test('creates prescription with detailed dosage', async () => {
      const { data, error } = await client
        .from('prescriptions')
        .insert({
          pet_id: petId,
          drug_name: 'Metronidazol',
          dosage: '15mg/kg cada 8 horas (300mg por dosis)',
          instructions: 'Administrar 30 minutos antes de cada comida. No suspender tratamiento aunque mejore. Duración: 10 días.',
          signed_by: vetId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.dosage).toContain('15mg/kg');

      ctx.track('prescriptions', data.id);
    });

    test('creates multiple prescriptions for same pet', async () => {
      const prescriptions = [
        {
          pet_id: petId,
          drug_name: 'Omeprazol',
          dosage: '1mg/kg cada 24 horas',
          instructions: 'En ayunas, 30 min antes de comer.',
          signed_by: vetId,
        },
        {
          pet_id: petId,
          drug_name: 'Sucralfato',
          dosage: '500mg cada 8 horas',
          instructions: '1 hora antes de comidas.',
          signed_by: vetId,
        },
      ];

      for (const rx of prescriptions) {
        const { data, error } = await client
          .from('prescriptions')
          .insert(rx)
          .select()
          .single();

        expect(error).toBeNull();
        ctx.track('prescriptions', data.id);
      }

      // Verify count
      const { data: allRx } = await client
        .from('prescriptions')
        .select('*')
        .eq('pet_id', petId);

      expect(allRx.length).toBeGreaterThanOrEqual(2);
    });

    test('fails without drug name', async () => {
      const { error } = await client
        .from('prescriptions')
        .insert({
          pet_id: petId,
          dosage: '100mg',
          signed_by: vetId,
        });

      expect(error).not.toBeNull();
    });

    test('fails without dosage', async () => {
      const { error } = await client
        .from('prescriptions')
        .insert({
          pet_id: petId,
          drug_name: 'Test Drug',
          signed_by: vetId,
        });

      expect(error).not.toBeNull();
    });

    test('fails with non-existent pet', async () => {
      const { error } = await client
        .from('prescriptions')
        .insert({
          pet_id: '00000000-0000-0000-0000-999999999999',
          drug_name: 'Orphan Drug',
          dosage: '100mg',
          signed_by: vetId,
        });

      expect(error).not.toBeNull();
    });
  });

  describe('READ', () => {
    let prescriptionId: string;

    beforeAll(async () => {
      const { data } = await client
        .from('prescriptions')
        .insert({
          pet_id: petId,
          drug_name: 'Read Test Drug',
          dosage: '100mg',
          instructions: 'Test instructions',
          signed_by: vetId,
        })
        .select()
        .single();
      prescriptionId = data.id;
      ctx.track('prescriptions', prescriptionId);
    });

    test('reads prescription by ID', async () => {
      const { data, error } = await client
        .from('prescriptions')
        .select('*')
        .eq('id', prescriptionId)
        .single();

      expect(error).toBeNull();
      expect(data.drug_name).toBe('Read Test Drug');
    });

    test('reads prescriptions by pet', async () => {
      const { data, error } = await client
        .from('prescriptions')
        .select('*')
        .eq('pet_id', petId)
        .order('signed_at', { ascending: false });

      expect(error).toBeNull();
      expect(data.length).toBeGreaterThan(0);
    });

    test('reads prescription with pet and vet details', async () => {
      const { data, error } = await client
        .from('prescriptions')
        .select(`
          *,
          pet:pets(id, name, species, weight_kg),
          vet:profiles!prescriptions_signed_by_fkey(id, full_name)
        `)
        .eq('id', prescriptionId)
        .single();

      expect(error).toBeNull();
      expect(data.pet).toBeDefined();
      expect(data.pet.name).toBe('Prescription Pet');
      expect(data.vet).toBeDefined();
      expect(data.vet.full_name).toBe('Dr. Prescription Vet');
    });

    test('filters prescriptions by vet', async () => {
      const { data, error } = await client
        .from('prescriptions')
        .select('*')
        .eq('signed_by', vetId);

      expect(error).toBeNull();
      expect(data.every((rx: { signed_by: string }) => rx.signed_by === vetId)).toBe(true);
    });

    test('filters prescriptions by date', async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await client
        .from('prescriptions')
        .select('*')
        .eq('pet_id', petId)
        .gte('signed_at', thirtyDaysAgo.toISOString());

      expect(error).toBeNull();
    });
  });

  describe('UPDATE', () => {
    let updatePrescriptionId: string;

    beforeAll(async () => {
      const { data } = await client
        .from('prescriptions')
        .insert({
          pet_id: petId,
          drug_name: 'Update Test Drug',
          dosage: '50mg',
          signed_by: vetId,
        })
        .select()
        .single();
      updatePrescriptionId = data.id;
      ctx.track('prescriptions', updatePrescriptionId);
    });

    test('updates instructions', async () => {
      const { data, error } = await client
        .from('prescriptions')
        .update({
          instructions: 'Updated: Tomar con abundante agua.',
        })
        .eq('id', updatePrescriptionId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.instructions).toContain('Updated');
    });

    test('updates dosage', async () => {
      const { data, error } = await client
        .from('prescriptions')
        .update({ dosage: '100mg cada 8 horas' })
        .eq('id', updatePrescriptionId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.dosage).toBe('100mg cada 8 horas');
    });
  });

  describe('DELETE', () => {
    test('deletes prescription by ID', async () => {
      // Create prescription to delete
      const { data: created } = await client
        .from('prescriptions')
        .insert({
          pet_id: petId,
          drug_name: 'To Delete Drug',
          dosage: '10mg',
          signed_by: vetId,
        })
        .select()
        .single();

      // Delete it
      const { error } = await client
        .from('prescriptions')
        .delete()
        .eq('id', created.id);

      expect(error).toBeNull();

      // Verify deleted
      const { data: found } = await client
        .from('prescriptions')
        .select('*')
        .eq('id', created.id)
        .single();

      expect(found).toBeNull();
    });
  });

  describe('PRESCRIPTION CALCULATIONS', () => {
    test('calculates dosage based on weight', () => {
      const calculateDosage = (
        dosagePerKg: number,
        weightKg: number,
        unit: string = 'mg'
      ): string => {
        const totalDosage = dosagePerKg * weightKg;
        return `${totalDosage}${unit}`;
      };

      // 10 mg/kg for a 20 kg dog
      expect(calculateDosage(10, 20)).toBe('200mg');

      // 0.5 ml/kg for a 5 kg cat
      expect(calculateDosage(0.5, 5, 'ml')).toBe('2.5ml');
    });

    test('formats prescription label', () => {
      const formatLabel = (rx: {
        drugName: string;
        dosage: string;
        petName: string;
      }): string => {
        return `${rx.drugName} - ${rx.dosage}\nPaciente: ${rx.petName}`;
      };

      const label = formatLabel({
        drugName: 'Amoxicilina',
        dosage: '250mg cada 12h',
        petName: 'Max',
      });

      expect(label).toContain('Amoxicilina');
      expect(label).toContain('Max');
    });
  });
});
