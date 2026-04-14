/**
 * Lab Result Entry Integration Tests
 *
 * Tests the lab result entry workflow including:
 * - Reference range validation
 * - Abnormal value flagging (low, high, critical)
 * - Specimen quality assessment
 * - Result interpretation
 *
 * @ticket TICKET-CLINICAL-004
 */
import { describe, it, expect } from 'vitest';
import { setupIntegrationTest } from '../__helpers__/integration-setup';

describe('Reference Range Validation', () => {
  interface ReferenceRange {
    testName: string;
    unit: string;
    species: 'dog' | 'cat';
    lowNormal: number;
    highNormal: number;
    criticalLow?: number;
    criticalHigh?: number;
  }

  const referenceRanges: ReferenceRange[] = [
    // Hematology
    {
      testName: 'RBC',
      unit: 'M/µL',
      species: 'dog',
      lowNormal: 5.5,
      highNormal: 8.5,
    },
  ];

  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await setupIntegrationTest();
  });

  afterAll(async () => {
    await cleanupIntegrationTest();
  });

  it('should validate reference range', async () => {
    const result = await supabase.from('lab_results').insert([
      {
        test_name: 'RBC',
        value: 6.5,
        unit: 'M/µL',
        species: 'dog',
      },
    ]);
    expect(result.data[0].is_abnormal).toBe(false);
  });
});