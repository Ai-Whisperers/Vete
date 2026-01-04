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
    // Read config.json
    const configPath = path.join(CONTENT_DATA_PATH, clinic, 'config.json')
    const configData = await fs.readFile(configPath, 'utf-8')
    const config = JSON.parse(configData)

    return NextResponse.json({
      modules: config.settings?.modules || {},
    })
  } catch (error) {
    console.error('Error reading modules:', error)
    return NextResponse.json({ error: 'Error al leer módulos' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const body = await request.json()
  const { clinic, modules } = body

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
    // Read existing config
    const configPath = path.join(CONTENT_DATA_PATH, clinic, 'config.json')
    const configData = await fs.readFile(configPath, 'utf-8')
    const config = JSON.parse(configData)

    // Update modules
    const updatedConfig = {
      ...config,
      settings: {
        ...config.settings,
        modules: {
          ...config.settings?.modules,
          ...modules,
        },
      },
    }

    // Write back
    await fs.writeFile(configPath, JSON.stringify(updatedConfig, null, 2), 'utf-8')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating modules:', error)
    return NextResponse.json({ error: 'Error al guardar módulos' }, { status: 500 })
  }
}
