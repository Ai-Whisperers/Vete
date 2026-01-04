import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const verifySchema = z.object({
  status: z.enum(['verified', 'rejected']),
  notes: z.string().optional(),
})

// POST - Verify or reject a supplier
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get tenant context
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    // Only admin can verify suppliers
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden verificar proveedores' }, { status: 403 })
    }

    // Parse and validate body
    const body = await request.json()
    const validation = verifySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Check supplier exists and belongs to tenant
    const { data: existing } = await supabase
      .from('suppliers')
      .select('id, verification_status')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 })
    }

    // Update verification status
    const updateData: Record<string, unknown> = {
      verification_status: validation.data.status,
      verified_by: user.id,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (validation.data.notes) {
      updateData.verification_notes = validation.data.notes
    }

    const { data: supplier, error } = await supabase
      .from('suppliers')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .select()
      .single()

    if (error) {
      console.error('Error verifying supplier:', error)
      return NextResponse.json({ error: 'Error al verificar proveedor' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      supplier,
      message: validation.data.status === 'verified'
        ? 'Proveedor verificado exitosamente'
        : 'Proveedor rechazado',
    })
  } catch (error) {
    console.error('Supplier verify POST error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
