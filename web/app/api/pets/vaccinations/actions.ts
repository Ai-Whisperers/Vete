import { useServer } from 'next/server'
import { logApiError, logApiInfo } from '@/lib/logger/api-helpers'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('vaccinations').select('*')

    if (error) {
      logApiError('pets/vaccinations', 'Failed to fetch vaccinations', {}, error)
      return new Response('Error fetching vaccinations', { status: 500 })
    }

    logApiInfo('pets/vaccinations', 'Fetched vaccinations successfully')
    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    logApiError('pets/vaccinations', 'Error fetching vaccinations', {}, error)
    return new Response('Error fetching vaccinations', { status: 500 })
  }
}