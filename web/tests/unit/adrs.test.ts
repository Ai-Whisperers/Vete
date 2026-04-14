import { describe, it, expect } from 'vitest';
import { supabase } from '@/lib/supabase';

describe('ADRs', () => {
  it('should create a new ADR', async () => {
    const { data, error } = await supabase
      .from('adrs')
      .insert([{ title: 'Test ADR', description: 'Test description', decision: 'Test decision' }]);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it('should retrieve all ADRs', async () => {
    const { data, error } = await supabase
      .from('adrs')
      .select('*');
    expect(error).toBeNull();
    expect(data).toBeInstanceOf(Array);
  });
});