import { createClient } from '@/lib/supabase/server'

export const TABLE_CONFIGS = {
  pets: {
    dbTable: 'pets',
    columns: [
      { column: 'id', header: 'ID' },
      { column: 'name', header: 'Name' },
      { column: 'species', header: 'Species' },
      { column: 'breed', header: 'Breed' },
      { column: 'date_of_birth', header: 'Date of Birth' },
    ],
  },
  appointments: {
    dbTable: 'appointments',
    columns: [
      { column: 'id', header: 'ID' },
      { column: 'pet_id', header: 'Pet ID' },
      { column: 'vet_id', header: 'Vet ID' },
      { column: 'start_time', header: 'Start Time' },
      { column: 'end_time', header: 'End Time' },
    ],
  },
  // Add more tables as needed
}