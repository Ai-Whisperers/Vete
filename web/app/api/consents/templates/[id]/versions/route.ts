import { NextResponse } from 'next/server'
import { withApiAuthParams, type ApiHandlerContextWithParams } from '@/lib/auth'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

/**
 * GET /api/consents/templates/[id]/versions
 * Get version history for a consent template
 */
export const GET = withApiAuthParams(
  async ({ params, user, profile, supabase }: ApiHandlerContextWithParams<{ id: string }>) => {
    const templateId = params.id

    try {
      // Get template info
      const { data: template, error: templateError } = await supabase
        .from('consent_templates')
        .select('code, tenant_id')
        .eq('id', templateId)
        .single()

      if (templateError || !template) {
        return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
          details: { resource: 'template' },
        })
      }

      // Get all versions of this template (same code)
      const { data: versions, error } = await supabase
        .from('consent_templates')
        .select(
          `
          id, version, is_current, is_active, published_at, change_summary,
          created_at, created_by,
          creator:profiles!consent_templates_created_by_fkey(full_name)
        `
        )
        .eq('code', template.code)
        .eq('tenant_id', template.tenant_id)
        .order('version', { ascending: false })

      if (error) throw error

      // Get document counts for each version
      const versionIds = versions?.map((v) => v.id) || []
      const { data: docCounts } = await supabase
        .from('consent_documents')
        .select('template_id')
        .in('template_id', versionIds)

      const countMap: Record<string, number> = {}
      docCounts?.forEach((doc) => {
        countMap[doc.template_id] = (countMap[doc.template_id] || 0) + 1
      })

      const versionsWithCounts = versions?.map((v) => ({
        ...v,
        documents_count: countMap[v.id] || 0,
        creator_name: Array.isArray(v.creator)
          ? v.creator[0]?.full_name
          : (v.creator as { full_name?: string })?.full_name,
      }))

      return NextResponse.json({ data: versionsWithCounts || [] })
    } catch (e) {
      logger.error('Error fetching consent template versions', {
        tenantId: profile.tenant_id,
        userId: user.id,
        templateId,
        error: e instanceof Error ? e.message : 'Unknown',
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  },
  { roles: ['vet', 'admin'] }
)

/**
 * POST /api/consents/templates/[id]/versions
 * Create a new version of a consent template (admin only)
 */
export const POST = withApiAuthParams(
  async ({ request, params, user, profile, supabase }: ApiHandlerContextWithParams<{ id: string }>) => {
    const templateId = params.id

    try {
      const body = await request.json()
      const { content_html, title, description, change_summary } = body

      if (!content_html) {
        return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, {
          details: { required: ['content_html'] },
        })
      }

      // Get current template
      const { data: template, error: templateError } = await supabase
        .from('consent_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (templateError || !template) {
        return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
          details: { resource: 'template' },
        })
      }

      // Can only version tenant-specific templates
      if (!template.tenant_id) {
        return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN, {
          details: { message: 'Cannot version global templates' },
        })
      }

      if (template.tenant_id !== profile.tenant_id) {
        return apiError('FORBIDDEN', HTTP_STATUS.FORBIDDEN)
      }

      // Get next version number
      const { data: versionData } = await supabase
        .from('consent_templates')
        .select('version')
        .eq('tenant_id', template.tenant_id)
        .eq('code', template.code)
        .order('version', { ascending: false })
        .limit(1)
        .single()

      const nextVersion = (versionData?.version || 1) + 1

      // Mark current version as not current
      await supabase
        .from('consent_templates')
        .update({ is_current: false })
        .eq('tenant_id', template.tenant_id)
        .eq('code', template.code)
        .eq('is_current', true)

      // Create new version
      const { data: newTemplate, error: insertError } = await supabase
        .from('consent_templates')
        .insert({
          tenant_id: template.tenant_id,
          code: template.code,
          name: template.name,
          category: template.category,
          title: title || template.title,
          description: description || template.description,
          content_html,
          requires_witness: template.requires_witness,
          requires_id_verification: template.requires_id_verification,
          requires_payment_acknowledgment: template.requires_payment_acknowledgment,
          min_age_to_sign: template.min_age_to_sign,
          validity_days: template.validity_days,
          can_be_revoked: template.can_be_revoked,
          language: template.language,
          is_active: true,
          version: nextVersion,
          parent_id: template.id,
          is_current: true,
          published_at: new Date().toISOString(),
          change_summary: change_summary || null,
          created_by: user.id,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Copy fields from old template to new
      const { data: fields } = await supabase
        .from('consent_template_fields')
        .select('*')
        .eq('template_id', templateId)

      if (fields && fields.length > 0) {
        const newFields = fields.map((f) => ({
          template_id: newTemplate.id,
          field_name: f.field_name,
          field_label: f.field_label,
          field_type: f.field_type,
          is_required: f.is_required,
          default_value: f.default_value,
          options: f.options,
          validation_regex: f.validation_regex,
          min_length: f.min_length,
          max_length: f.max_length,
          display_order: f.display_order,
          help_text: f.help_text,
          placeholder: f.placeholder,
        }))

        await supabase.from('consent_template_fields').insert(newFields)
      }

      return NextResponse.json(
        {
          success: true,
          data: newTemplate,
          message: `Versión ${nextVersion} creada exitosamente`,
        },
        { status: 201 }
      )
    } catch (e) {
      logger.error('Error creating consent template version', {
        tenantId: profile.tenant_id,
        userId: user.id,
        templateId,
        error: e instanceof Error ? e.message : 'Unknown',
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  },
  { roles: ['admin'] }
)
