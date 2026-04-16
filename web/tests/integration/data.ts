import { supabase } from './setup';

export const createTestData = async () => {
  // Create test data here
  await supabase.from('pets').insert([
    {
      id: 'pet-1',
      name: 'Test Pet',
      species: 'dog',
      breed: 'Golden Retriever',
      birth_date: '2020-01-01',
      weight_kg: 20,
      sex: 'male',
      is_neutered: true,
      color: 'Golden',
      temperament: 'Friendly',
    },
  ]);

  await supabase.from('appointments').insert([
    {
      id: 'appointment-1',
      pet_id: 'pet-1',
      vet_id: 'vet-1',
      start_time: '2024-01-01T10:00:00',
      end_time: '2024-01-01T11:00:00',
      status: 'scheduled',
    },
  ]);
};