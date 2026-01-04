import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as fs from 'fs/promises'
import * as path from 'path'

const CONTENT_DATA_PATH = path.join(process.cwd(), '.content_data')

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const clinic = searchParams.get('clinic')

  if (!clinic) {
    return NextResponse.json({ error: 'Clinic parameter required' }, { status: 400 })
  }

  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Staff check (vet or admin can view services)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role) || profile.tenant_id !== clinic) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    // Read services.json
    const servicesPath = path.join(CONTENT_DATA_PATH, clinic, 'services.json')
    const servicesData = await fs.readFile(servicesPath, 'utf-8')
    const services = JSON.parse(servicesData)

    return NextResponse.json(services)
  } catch (error) {
    console.error('Error reading services:', error)
    return NextResponse.json({ error: 'Error al leer servicios' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const body = await request.json()
  const { clinic, services } = body

  if (!clinic) {
    return NextResponse.json({ error: 'Clinic parameter required' }, { status: 400 })
  }

  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin' || profile.tenant_id !== clinic) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    // Read existing services to preserve meta
    const servicesPath = path.join(CONTENT_DATA_PATH, clinic, 'services.json')
    const existingData = await fs.readFile(servicesPath, 'utf-8')
    const existing = JSON.parse(existingData)

    // Update services while preserving meta
    const updatedServices = {
      meta: existing.meta,
      services: services,
    }

    // Write back
    await fs.writeFile(servicesPath, JSON.stringify(updatedServices, null, 2), 'utf-8')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating services:', error)
    return NextResponse.json({ error: 'Error al guardar servicios' }, { status: 500 })
  }
}
