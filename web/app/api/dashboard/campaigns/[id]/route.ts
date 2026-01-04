import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/dashboard/campaigns/[id]
 * Get a single campaign with its products
 */
export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'vet' && profile.role !== 'admin')) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  try {
    const { data: campaign, error } = await supabase
      .from('store_campaigns')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .single()

    if (error || !campaign) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
        details: { message: 'Campaña no encontrada' },
      })
    }

    // Get campaign products
    const { data: campaignItems } = await supabase
      .from('store_campaign_items')
      .select(
        `
        id,
        product_id,
        discount_type,
        discount_value,
        store_products (
          id,
          name,
          sku,
          base_price,
          images
        )
      `
      )
      .eq('campaign_id', id)

    return NextResponse.json({
      campaign,
      products:
        campaignItems?.map((item) => ({
          ...item,
          product: item.store_products,
        })) || [],
    })
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

/**
 * PUT /api/dashboard/campaigns/[id]
 * Update a campaign
 */
export async function PUT(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'vet' && profile.role !== 'admin')) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  try {
    const body = await request.json()
    const {
      name,
      description,
      campaign_type,
      discount_type,
      discount_value,
      start_date,
      end_date,
      is_active,
      product_ids,
    } = body

    // Check if campaign exists
    const { data: existing } = await supabase
      .from('store_campaigns')
      .select('id')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .single()

    if (!existing) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND)
    }

    // Validation
    if (
      discount_type === 'percentage' &&
      discount_value &&
      (discount_value <= 0 || discount_value > 100)
    ) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'El porcentaje debe estar entre 1 y 100' },
      })
    }

    if (start_date && end_date) {
      const startDateObj = new Date(start_date)
      const endDateObj = new Date(end_date)
      if (endDateObj <= startDateObj) {
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: { message: 'La fecha de fin debe ser posterior a la fecha de inicio' },
        })
      }
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (campaign_type !== undefined) updateData.campaign_type = campaign_type
    if (discount_type !== undefined) updateData.discount_type = discount_type
    if (discount_value !== undefined) updateData.discount_value = discount_value
    if (start_date !== undefined) updateData.start_date = new Date(start_date).toISOString()
    if (end_date !== undefined) updateData.end_date = new Date(end_date).toISOString()
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: campaign, error } = await supabase
      .from('store_campaigns')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .select()
      .single()

    if (error) throw error

    // Update products if provided
    if (product_ids !== undefined) {
      // Delete existing items
      await supabase.from('store_campaign_items').delete().eq('campaign_id', id)

      // Add new items
      if (product_ids.length > 0) {
        const campaignItems = product_ids.map((productId: string) => ({
          campaign_id: id,
          tenant_id: profile.tenant_id,
          product_id: productId,
        }))

        await supabase.from('store_campaign_items').insert(campaignItems)
      }
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Error updating campaign:', error)
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

/**
 * DELETE /api/dashboard/campaigns/[id]
 * Soft delete a campaign
 */
export async function DELETE(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'vet' && profile.role !== 'admin')) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  try {
    const { error } = await supabase
      .from('store_campaigns')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
      })
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}
