import { test, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

test('creates a pet via Supabase client', async () => {
  const { data, error } = await supabase
    .from('pets')
    .insert({
      owner_id: '00000000-0000-0000-0000-000000000001',
      tenant_id: 'adris',
      name: 'TestDog',
      species: 'dog',
      weight_kg: 10,
    })
    .select()
  expect(error).toBeNull()
  expect(data).toBeDefined()
  // Cleanup
  if (data && data[0]) {
    await supabase.from('pets').delete().eq('id', data[0].id)
  }
})
