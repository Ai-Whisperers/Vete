import { NextResponse } from 'next/server'
import { withApiAuthParams, type ApiHandlerContextWithParams } from '@/lib/auth'
import { sendEmail } from '@/lib/email/client'
import {
  generateSignedConsentEmail,
  generateSignedConsentEmailText,
} from '@/lib/email/templates/consent-signed'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

/**
 * POST /api/consents/[id]/email - Send signed consent via email
 */
export const POST = withApiAuthParams(
  async ({ params, user, profile, supabase }: ApiHandlerContextWithParams<{ id: string }>) => {
    const consentId = params.id

    try {
      // Get consent with all related data
      const { data: consent, error: consentError } = await supabase
        .from('consent_documents')
        .select(
          `
          *,
          pet:pets!inner(id, name, species, breed, tenant_id),
          owner:profiles!consent_documents_signed_by_id_fkey(id, full_name, email, phone),
          template:consent_templates(id, name, category, content),
          signed_by_user:profiles!consent_documents_signed_by_id_fkey(full_name)
        `
        )
        .eq('id', consentId)
        .eq('pet.tenant_id', profile.tenant_id)
        .single()

      if (consentError || !consent) {
        return apiError('NOT_FOUND', HTTP_STATUS.NOT_FOUND, {
          details: { resource: 'consent' },
        })
      }

      // Verify consent is signed
      if (!consent.signed_at || !consent.signature_data) {
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: { message: 'Consent not signed yet' },
        })
      }

      // Get owner email
      const ownerEmail = consent.owner?.email
      if (!ownerEmail) {
        return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, {
          details: { message: 'Owner has no email registered' },
        })
      }

      // Get clinic info
      const { data: clinic } = await supabase
        .from('tenants')
        .select('name, phone, email, logo_url')
        .eq('id', profile.tenant_id)
        .single()

      // Generate email content
      const emailData = {
        clinicName: clinic?.name || 'Clínica Veterinaria',
        clinicLogo: clinic?.logo_url,
        clinicPhone: clinic?.phone,
        clinicEmail: clinic?.email,
        ownerName: consent.owner?.full_name || 'Propietario',
        petName: consent.pet?.name || 'Mascota',
        consentType: consent.template?.name || 'Consentimiento',
        consentCategory: consent.template?.category,
        signedAt: consent.signed_at,
        signedBy: consent.signed_by_user?.full_name || consent.owner?.full_name || 'Propietario',
      }

      const html = generateSignedConsentEmail(emailData)
      const text = generateSignedConsentEmailText(emailData)

      // Send email
      const result = await sendEmail({
        to: ownerEmail,
        subject: `Consentimiento Firmado - ${consent.template?.name || 'Documento'} para ${consent.pet?.name}`,
        html,
        text,
        replyTo: clinic?.email,
      })

      if (!result.success) {
        logger.error('Error sending consent email', {
          tenantId: profile.tenant_id,
          consentId,
          error: result.error,
        })
        return apiError('EXTERNAL_SERVICE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
          details: { service: 'email', error: result.error },
        })
      }

      // Log the action
      await supabase.from('consent_audit_log').insert({
        consent_document_id: consentId,
        action: 'sent',
        performed_by: user.id,
        details: {
          sent_to: ownerEmail,
          message_id: result.messageId,
        },
      })

      // Update email sent timestamp on consent
      await supabase
        .from('consent_documents')
        .update({ email_sent_at: new Date().toISOString() })
        .eq('id', consentId)

      return NextResponse.json({
        success: true,
        message: `Email enviado a ${ownerEmail}`,
        messageId: result.messageId,
      })
    } catch (e) {
      logger.error('Error sending consent email', {
        tenantId: profile.tenant_id,
        consentId,
        error: e instanceof Error ? e.message : 'Unknown',
      })
      return apiError('SERVER_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  },
  { roles: ['vet', 'admin'] }
)
