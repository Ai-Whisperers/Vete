import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth'
import { apiError, apiSuccess, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'
import { rateLimit } from '@/lib/rate-limit'
import { serviceQuerySchema, createServiceSchema } from '@/lib/schemas/service'

/**
 * Public endpoint - no authentication required
 * Returns available services for a clinic
 *
 * @param clinic - Clinic slug (required)
 * @param category - Optional category filter
 * @param active - Filter active services (default: true)
 *
 * Cache: 5 minutes (s-maxage=300)
 */
export async function GET(request: Request) {
  // Apply mild rate limiting for public scraping protection (30 requests per minute)
  const rateLimitResult = await rateLimit(request as NextRequest, 'search', 'public-services')
  if (!rateLimitResult.success) {
    return rateLimitResult.response
  }

  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  
  // Extract and validate query parameters with Zod
  const queryParams = {
    clinic: searchParams.get('clinic'),
    category: searchParams.get('category'),
    active: searchParams.get('active'),
  };

  const validationResult = serviceQuerySchema.safeParse(queryParams);
  if (!validationResult.success) {
    return apiError('VALIDATION_ERROR', 400, {
      details: {
        errors: validationResult.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
  }

  const { clinic, category, active } = validationResult.data;
  const isActive = active !== 'false'; // Default to active only

  try {
    let query = supabase
      .from('services')
      .select(
        'id, tenant_id, name, description, category, base_price, duration_minutes, is_active, created_at, updated_at'
      )
      .eq('tenant_id', clinic)
      .is('deleted_at', null)
      .order('category')
      .order('name')

    if (isActive) {
      query = query.eq('is_active', true)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data: services, error } = await query

    if (error) throw error

    return NextResponse.json(services, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (e) {
    logger.error('Error loading services', {
      clinic,
      error: e instanceof Error ? e.message : 'Unknown',
    })
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

// POST /api/services - Create service (staff only)
export const POST = withApiAuth(
  async ({ profile, supabase, request }: ApiHandlerContext) => {
    try {
      // Parse and validate request body with Zod schema
      let rawBody: unknown
      try {
        rawBody = await request.json()
      } catch (_error: unknown) {
        return apiError('INVALID_FORMAT', 400, {
          details: { message: 'Formato de solicitud inválido' },
        })
      }

      const validationResult = createServiceSchema.safeParse(rawBody)
      if (!validationResult.success) {
        return apiError('VALIDATION_ERROR', 400, {
          details: {
            errors: validationResult.error.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        })
      }

      const { name, description, category, base_price, duration_minutes, is_active } = validationResult.data

      const { data: service, error } = await supabase
        .from('services')
        .insert({
          tenant_id: profile.tenant_id,
          name,
          description,
          category,
          base_price,
          duration_minutes: duration_minutes || 30,
          is_active: is_active !== false,
        })
        .select()
        .single()

      if (error) throw error

      const { logAudit } = await import('@/lib/audit')
      await logAudit('CREATE_SERVICE', `services/${service.id}`, { name, category, base_price })

      return apiSuccess(service, 'Servicio creado exitosamente', 201)
    } catch (e) {
      logger.error('Error creating service', {
        tenantId: profile.tenant_id,
        error: e instanceof Error ? e.message : 'Unknown',
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  },
  { roles: ['vet', 'admin'], rateLimit: 'write' }
)
