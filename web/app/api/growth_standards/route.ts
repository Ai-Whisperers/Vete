import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/monitoring/logger'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const breedCategory = searchParams.get('breed_category')
  const gender = searchParams.get('gender')

  if (!breedCategory || !gender) {
    return NextResponse.json({ error: 'Missing breed_category or gender' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('growth_standards')
    .select('age_weeks, weight_kg, percentile')
    .eq('breed_category', breedCategory)
    .eq('gender', gender)
    .order('age_weeks', { ascending: true })

  if (error) {
    // Table might not exist yet - return empty array gracefully
    if (error.code === '42P01' || error.message.includes('does not exist')) {
      logger.warn('growth_standards table not found, returning empty data')
      return NextResponse.json([])
    }
    logger.error('Error fetching growth standards', undefined, {
      metadata: { errorMessage: error.message, breedCategory, gender },
    })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}
