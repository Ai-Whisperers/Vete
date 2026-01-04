import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

/**
 * GET /api/admin/products/pending
 * List products pending approval for the global catalog
 * This is for platform admins only
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'pending' // pending, verified, rejected, needs_review
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '25', 10)

  const supabase = await createClient()

  // Auth check - must be platform admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  // Check if user is a platform admin (admin role without tenant_id or special platform_admin flag)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, tenant_id, is_platform_admin')
    .eq('id', user.id)
    .single()

  // For now, platform admin check: admin role users can access this
  // In production, you'd have a separate platform_admin table or flag
  if (!profile || profile.role !== 'admin') {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN, {
      details: { message: 'Solo administradores de plataforma pueden acceder' },
    })
  }

  try {
    const offset = (page - 1) * limit

    let query = supabase
      .from('store_products')
      .select(
        `
        *,
        store_categories (id, name, slug),
        store_brands (id, name, slug),
        created_by_tenant:created_by_tenant_id (id, name),
        verified_by_profile:verified_by (id, full_name)
      `,
        { count: 'exact' }
      )
      .is('deleted_at', null)

    // Filter by verification status
    if (status !== 'all') {
      query = query.eq('verification_status', status)
    }

    // Products submitted for global catalog have created_by_tenant_id set
    // or have verification_status != null
    query = query.not('created_by_tenant_id', 'is', null)

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
    }

    const {
      data: products,
      error,
      count,
    } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    if (error) throw error

    // Get summary counts
    const { data: summaryData } = await supabase
      .from('store_products')
      .select('verification_status')
      .not('created_by_tenant_id', 'is', null)
      .is('deleted_at', null)

    const summary = {
      pending: 0,
      verified: 0,
      rejected: 0,
      needs_review: 0,
    }

    summaryData?.forEach((p) => {
      const s = p.verification_status || 'pending'
      summary[s as keyof typeof summary] = (summary[s as keyof typeof summary] || 0) + 1
    })

    // Cast the joined data properly
    const enrichedProducts = products?.map((p) => {
      const category = p.store_categories as unknown as {
        id: string
        name: string
        slug: string
      } | null
      const brand = p.store_brands as unknown as { id: string; name: string; slug: string } | null
      const createdByTenant = p.created_by_tenant as unknown as { id: string; name: string } | null
      const verifiedByProfile = p.verified_by_profile as unknown as {
        id: string
        full_name: string
      } | null

      return {
        ...p,
        category,
        brand,
        created_by_tenant: createdByTenant,
        verified_by_profile: verifiedByProfile,
      }
    })

    return NextResponse.json({
      products: enrichedProducts,
      summary,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
        hasNext: page < Math.ceil((count || 0) / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('Error fetching pending products:', error)
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}
