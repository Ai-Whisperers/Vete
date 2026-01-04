import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const supabase = await createClient()

  let query = supabase.from('lost_pet_reports').select(`
      id,
      status,
      last_seen_location,
      last_seen_date,
      finder_contact,
      finder_notes,
      notes,
      created_at,
      resolved_at,
      pet:pets (
        id,
        name,
        species,
        breed,
        photo_url,
        owner:profiles (
          id,
          full_name,
          phone,
          email
        )
      ),
      reported_by_user:profiles!reported_by (
        full_name
      ),
      resolved_by_user:profiles!resolved_by (
        full_name
      )
    `)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching lost pet reports:', error)
    return NextResponse.json({ error: 'Failed to fetch lost pet reports' }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 200 })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { id, status } = await request.json()

  const { error } = await supabase
    .from('lost_pet_reports')
    .update({ status, resolved_at: status === 'reunited' ? new Date().toISOString() : null })
    .eq('id', id)

  if (error) {
    console.error('Error updating lost pet report status:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
