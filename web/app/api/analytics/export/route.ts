import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type ExportType = 'revenue' | 'appointments' | 'clients' | 'services' | 'inventory' | 'customers'

interface ExportConfig {
  title: string
  getQuery: (
    supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
    tenantId: string,
    startDate: string,
    endDate: string
  ) => Promise<{ data: Record<string, unknown>[] | null; error: unknown }>
  columns: { key: string; header: string; format?: (value: unknown) => string }[]
}

const formatCurrency = (value: unknown): string => {
  const num = typeof value === 'number' ? value : parseFloat(String(value)) || 0
  return `Gs ${num.toLocaleString('es-PY')}`
}

const formatDate = (value: unknown): string => {
  if (!value) return ''
  return new Date(String(value)).toLocaleDateString('es-PY')
}

const formatDateTime = (value: unknown): string => {
  if (!value) return ''
  return new Date(String(value)).toLocaleString('es-PY')
}

/**
 * GET /api/analytics/export
 * Export analytics data in CSV or PDF format
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const type = (searchParams.get('type') || 'revenue') as ExportType
  const format = searchParams.get('format') || 'csv'
  const startDate = searchParams.get('startDate') || getDefaultStartDate()
  const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0]

  try {
    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single()

    if (!profile || !['vet', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const tenantId = profile.tenant_id

    // Get export config based on type
    const config = getExportConfig(type)
    if (!config) {
      return NextResponse.json({ error: 'Tipo de exportación no válido' }, { status: 400 })
    }

    // Fetch data
    const { data, error } = await config.getQuery(supabase, tenantId, startDate, endDate)

    if (error) {
      console.error('Export query error:', error)
      return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No hay datos para exportar' }, { status: 404 })
    }

    // Generate CSV
    if (format === 'csv') {
      const csv = generateCSV(data, config.columns)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${type}-${startDate}-${endDate}.csv"`,
        },
      })
    }

    // Generate PDF (simplified - would need a proper PDF library for production)
    if (format === 'pdf') {
      // For now, return a JSON response indicating PDF generation
      // In production, use @react-pdf/renderer or similar
      return NextResponse.json({
        message: 'PDF generation not yet implemented',
        suggestion: 'Use CSV export for now',
      })
    }

    return NextResponse.json({ error: 'Formato no soportado' }, { status: 400 })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

function getDefaultStartDate(): string {
  const date = new Date()
  date.setMonth(date.getMonth() - 1)
  return date.toISOString().split('T')[0]
}

function getExportConfig(type: ExportType): ExportConfig | null {
  const configs: Record<ExportType, ExportConfig> = {
    revenue: {
      title: 'Ingresos',
      getQuery: async (supabase, tenantId, startDate, endDate) => {
        return supabase
          .from('invoices')
          .select('invoice_number, client:profiles!client_id(full_name), total, status, created_at')
          .eq('tenant_id', tenantId)
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59')
          .order('created_at', { ascending: false })
      },
      columns: [
        { key: 'invoice_number', header: 'Nro. Factura' },
        { key: 'client.full_name', header: 'Cliente' },
        { key: 'total', header: 'Total', format: formatCurrency },
        { key: 'status', header: 'Estado' },
        { key: 'created_at', header: 'Fecha', format: formatDateTime },
      ],
    },
    appointments: {
      title: 'Citas',
      getQuery: async (supabase, tenantId, startDate, endDate) => {
        return supabase
          .from('appointments')
          .select(`
            id,
            start_time,
            end_time,
            status,
            pet:pets!pet_id(name, species),
            service:services!service_id(name),
            vet:profiles!vet_id(full_name)
          `)
          .eq('tenant_id', tenantId)
          .gte('start_time', startDate)
          .lte('start_time', endDate + 'T23:59:59')
          .order('start_time', { ascending: false })
      },
      columns: [
        { key: 'start_time', header: 'Fecha/Hora', format: formatDateTime },
        { key: 'pet.name', header: 'Mascota' },
        { key: 'pet.species', header: 'Especie' },
        { key: 'service.name', header: 'Servicio' },
        { key: 'vet.full_name', header: 'Veterinario' },
        { key: 'status', header: 'Estado' },
      ],
    },
    clients: {
      title: 'Clientes',
      getQuery: async (supabase, tenantId, startDate, endDate) => {
        return supabase
          .from('profiles')
          .select('full_name, email, phone, created_at')
          .eq('tenant_id', tenantId)
          .eq('role', 'owner')
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59')
          .order('created_at', { ascending: false })
      },
      columns: [
        { key: 'full_name', header: 'Nombre' },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Teléfono' },
        { key: 'created_at', header: 'Fecha Registro', format: formatDate },
      ],
    },
    services: {
      title: 'Servicios',
      getQuery: async (supabase, tenantId) => {
        return supabase
          .from('services')
          .select('name, category, base_price, duration_minutes, is_active')
          .eq('tenant_id', tenantId)
          .order('name')
      },
      columns: [
        { key: 'name', header: 'Servicio' },
        { key: 'category', header: 'Categoría' },
        { key: 'base_price', header: 'Precio Base', format: formatCurrency },
        { key: 'duration_minutes', header: 'Duración (min)' },
        { key: 'is_active', header: 'Activo' },
      ],
    },
    inventory: {
      title: 'Inventario',
      getQuery: async (supabase, tenantId) => {
        return supabase
          .from('store_products')
          .select(`
            sku,
            name,
            base_price,
            is_active,
            inventory:store_inventory(stock_quantity, reorder_point)
          `)
          .eq('tenant_id', tenantId)
          .order('name')
      },
      columns: [
        { key: 'sku', header: 'SKU' },
        { key: 'name', header: 'Producto' },
        { key: 'base_price', header: 'Precio', format: formatCurrency },
        { key: 'inventory.stock_quantity', header: 'Stock' },
        { key: 'inventory.reorder_point', header: 'Punto Reorden' },
        { key: 'is_active', header: 'Activo' },
      ],
    },
    customers: {
      title: 'Segmentación de Clientes',
      getQuery: async (supabase, tenantId) => {
        // This would ideally call the customer segmentation RPC
        return supabase
          .from('profiles')
          .select(`
            full_name,
            email,
            phone,
            created_at
          `)
          .eq('tenant_id', tenantId)
          .eq('role', 'owner')
          .order('full_name')
      },
      columns: [
        { key: 'full_name', header: 'Cliente' },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Teléfono' },
        { key: 'created_at', header: 'Cliente desde', format: formatDate },
      ],
    },
  }

  return configs[type] || null
}

function generateCSV(
  data: Record<string, unknown>[],
  columns: ExportConfig['columns']
): string {
  // Header row
  const headers = columns.map((col) => col.header).join(',')

  // Data rows
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        // Handle nested keys like "client.full_name"
        const value = getNestedValue(row, col.key)
        const formatted = col.format ? col.format(value) : String(value ?? '')
        // Escape quotes and wrap in quotes if contains comma
        const escaped = formatted.replace(/"/g, '""')
        return escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')
          ? `"${escaped}"`
          : escaped
      })
      .join(',')
  })

  return [headers, ...rows].join('\n')
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}
