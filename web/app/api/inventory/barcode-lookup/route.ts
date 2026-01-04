import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/inventory/barcode-lookup
 * Look up a product by barcode within the user's tenant
 *
 * Query params:
 * - barcode: The barcode to search for (required)
 * - clinic: The clinic/tenant ID (required)
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Get query params
  const barcode = req.nextUrl.searchParams.get('barcode')
  const clinic = req.nextUrl.searchParams.get('clinic')

  if (!barcode) {
    return NextResponse.json({ error: 'Código de barras requerido' }, { status: 400 })
  }

  if (!clinic) {
    return NextResponse.json({ error: 'Clínica requerida' }, { status: 400 })
  }

  // Verify user belongs to this tenant
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
  }

  // Staff check - only vets and admins can look up products by barcode
  if (profile.role !== 'admin' && profile.role !== 'vet') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  // Verify tenant matches
  if (profile.tenant_id !== clinic) {
    return NextResponse.json({ error: 'Acceso denegado a esta clínica' }, { status: 403 })
  }

  try {
    // Use the database function for optimized lookup
    const { data, error } = await supabase.rpc('find_product_by_barcode', {
      p_tenant_id: clinic,
      p_barcode: barcode.trim(),
    })

    if (error) {
      console.error('Barcode lookup error:', error)
      return NextResponse.json({ error: 'Error al buscar producto' }, { status: 500 })
    }

    // The function returns a table, check if we got any results
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Return the first (and should be only) result
    return NextResponse.json(data[0])
  } catch (e) {
    console.error('Barcode lookup exception:', e)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
