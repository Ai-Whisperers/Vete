import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const generateSchema = z.object({
  days_ahead: z.number().min(1).max(365).optional().default(30),
})

// POST /api/appointments/recurrences/[id]/generate - Generate appointments
export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get user profile - must be staff
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role === 'owner') {
      return NextResponse.json({ error: 'Solo el personal puede generar citas' }, { status: 403 })
    }

    // Parse body
    const body = await request.json().catch(() => ({}))
    const validation = generateSchema.safeParse(body)
    const daysAhead = validation.success ? validation.data.days_ahead : 30

    // Verify recurrence exists and belongs to tenant
    const { data: recurrence } = await supabase
      .from('appointment_recurrences')
      .select('id, is_active')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .single()

    if (!recurrence) {
      return NextResponse.json({ error: 'Recurrencia no encontrada' }, { status: 404 })
    }

    if (!recurrence.is_active) {
      return NextResponse.json({ error: 'La recurrencia está inactiva' }, { status: 400 })
    }

    // Generate appointments using the DB function
    const { data: generated, error: genError } = await supabase.rpc(
      'generate_recurring_appointments',
      { p_days_ahead: daysAhead }
    )

    if (genError) {
      console.error('Error generating appointments:', genError)
      return NextResponse.json({ error: 'Error al generar citas' }, { status: 500 })
    }

    // Filter results for this recurrence
    const thisRecurrenceResults = (generated || []).filter(
      (g: { recurrence_id: string }) => g.recurrence_id === id
    )

    return NextResponse.json({
      message: `Se generaron ${thisRecurrenceResults.length} citas`,
      appointments: thisRecurrenceResults,
    })
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
