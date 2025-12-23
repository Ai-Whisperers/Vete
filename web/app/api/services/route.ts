import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/with-auth';
import { apiError, apiSuccess } from '@/lib/api/errors';

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
import { rateLimit } from '@/lib/rate-limit';

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
  const rateLimitResult = await rateLimit(request as NextRequest, 'search', 'public-services');
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const clinic = searchParams.get('clinic');
  const category = searchParams.get('category');
  const active = searchParams.get('active') !== 'false'; // Default to active only

  if (!clinic) {
    return apiError('MISSING_FIELDS', 400, { details: { field: 'clinic' } });
  }

  try {
    let query = supabase
      .from('services')
      .select('id, tenant_id, name, description, category, base_price, duration_minutes, is_active, created_at, updated_at')
      .eq('tenant_id', clinic)
      .order('category')
      .order('name');

    if (active) {
      query = query.eq('is_active', true);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: services, error } = await query;

    if (error) throw error;

    return NextResponse.json(services, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (e) {
    console.error('Error loading services:', e);
    return apiError('DATABASE_ERROR', 500);
  }
}

// POST /api/services - Create service (staff only)
export const POST = withAuth(
  async ({ profile, supabase, request }) => {
    try {
      const body = await request.json();
      const { name, description, category, base_price, duration_minutes, is_active } = body;

      if (!name || !category || base_price === undefined) {
        return apiError('MISSING_FIELDS', 400, {
          details: { required: ['name', 'category', 'base_price'] }
        });
      }

      const { data: service, error } = await supabase
        .from('services')
        .insert({
          tenant_id: profile.tenant_id,
          name,
          description,
          category,
          base_price,
          duration_minutes: duration_minutes || 30,
          is_active: is_active !== false
        })
        .select()
        .single();

      if (error) throw error;

      const { logAudit } = await import('@/lib/audit');
      await logAudit('CREATE_SERVICE', `services/${service.id}`, { name, category, base_price });

      return apiSuccess(service, 'Servicio creado exitosamente', 201);
    } catch (e) {
      console.error('Error creating service:', e);
      return apiError('DATABASE_ERROR', 500);
    }
  },
  { roles: ['vet', 'admin'] }
);
