import { createClient } from '@/lib/supabase/server'

export async function promoteUsers() {
  console.log('🚀 Starting User Promotion...')
  const supabase = await createClient()

  // 1. Promote Admin
  const { error: errAdmin } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('email', 'admin@demo.com')

  if (errAdmin) console.error('❌ Failed to promote admin:', errAdmin)
  else console.log('✅ Promoted admin@demo.com')

  // 2. Promote Vet
  const { error: errVet } = await supabase
    .from('profiles')
    .update({ role: 'vet' })
    .eq('email', 'vet@demo.com')

  if (errVet) console.error('❌ Failed to promote vet:', errVet)
  else console.log('✅ Promoted vet@demo.com')
}
