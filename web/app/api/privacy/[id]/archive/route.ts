/**
 * Privacy Policy Archive API
 *
 * COMP-002: Archive a published policy
 *
 * POST - Archive policy
 */

import { NextResponse } from 'next/server'
import { withApiAuthParams, type ApiHandlerContextWithParams } from '@/lib/auth'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { getPolicyById, archivePolicy } from '@/lib/privacy'

type Params = { id: string }

/**
 * POST /api/privacy/[id]/archive
 *
 * Archive a published policy
 * Admin only
 */
export const POST = withApiAuthParams<Params>(
  async ({ params, profile, log }: ApiHandlerContextWithParams<Params>) => {
    const { id } = params

    log.info('Archiving privacy policy', { action: 'privacy.archive', resourceId: id })

    // Check policy exists and belongs to tenant
    const existing = await getPolicyById(id)

    if (!existing) {
      return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
        details: { resource: 'privacy_policy' },
      })
    }

    if (existing.tenantId !== profile.tenant_id) {
      return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
    }

    if (existing.status !== 'published') {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
        details: { message: 'Solo se pueden archivar políticas publicadas' },
      })
    }

    try {
      const policy = await archivePolicy(id)

      log.info('Privacy policy archived', {
        action: 'privacy.archived',
        resourceId: id,
        version: policy.version,
      })

      return NextResponse.json(policy)
    } catch (error) {
      log.error('Error archiving privacy policy', {
        action: 'privacy.archive.error',
        error: error instanceof Error ? error : new Error(String(error)),
        resourceId: id,
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  },
  { roles: ['admin'], rateLimit: 'write' }
)
