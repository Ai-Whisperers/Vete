/**
 * Signed Consent Document Email Template
 *
 * Generates HTML email for sending signed consent documents to clients
 */

export interface SignedConsentEmailData {
  tenantName: string
  clinicLogo?: string
  clinicPhone?: string
  clinicEmail?: string
  ownerName: string
  petName: string
  consentType: string
  consentCategory?: string
  signedAt: string
  signedBy: string
  viewLink?: string
}

/**
 * Generate signed consent email HTML
 */
export function generateSignedConsentEmail(data: SignedConsentEmailData): string {
  const {
    tenantName,
    clinicLogo,
    clinicPhone,
    clinicEmail,
    ownerName,
    petName,
    consentType,
    consentCategory,
    signedAt,
    signedBy,
    viewLink,
  } = data

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const categoryEmoji =
    consentCategory === 'surgery'
      ? '🏥'
      : consentCategory === 'anesthesia'
        ? '💉'
        : consentCategory === 'euthanasia'
          ? '🕊️'
          : consentCategory === 'treatment'
            ? '💊'
            : '📋'

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consentimiento Firmado</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px 8px 0 0;">
              ${clinicLogo ? `<img src="${clinicLogo}" alt="${tenantName}" style="max-width: 150px; height: auto; margin-bottom: 20px;">` : ''}
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">${tenantName}</h1>
              <div style="margin-top: 12px;">
                ${clinicPhone ? `<span style="color: #e0e0e0; font-size: 14px; margin-right: 15px;">📞 ${clinicPhone}</span>` : ''}
                ${clinicEmail ? `<span style="color: #e0e0e0; font-size: 14px;">✉️ ${clinicEmail}</span>` : ''}
              </div>
            </td>
          </tr>

          <!-- Icon & Title -->
          <tr>
            <td style="padding: 30px 40px 20px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 20px;">✅</div>
              <h2 style="margin: 0 0 10px; color: #333333; font-size: 24px; font-weight: 600;">Consentimiento Firmado</h2>
              <p style="margin: 0; color: #666666; font-size: 16px;">Copia de tu consentimiento firmado</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <p style="margin: 0; color: #666666; font-size: 16px; line-height: 1.5;">
                Hola <strong>${ownerName}</strong>,
              </p>
              <p style="margin: 15px 0 0; color: #666666; font-size: 16px; line-height: 1.5;">
                Te enviamos una copia del consentimiento que firmaste para <strong>${petName}</strong>. Por favor, guarda este correo para tus registros.
              </p>
            </td>
          </tr>

          <!-- Consent Info Box -->
          <tr>
            <td style="padding: 0 40px 25px;">
              <div style="background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 20px;">
                <div style="color: #047857; font-size: 14px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
                  ${categoryEmoji} ${consentCategory ? consentCategory.toUpperCase() : 'CONSENTIMIENTO'}
                </div>
                <div style="color: #065f46; font-size: 18px; font-weight: 700; margin-bottom: 12px;">
                  ${consentType}
                </div>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                  <tr>
                    <td style="padding: 5px 0; color: #059669; font-size: 14px;">
                      <strong>Mascota:</strong>
                    </td>
                    <td style="padding: 5px 0; color: #065f46; font-size: 14px;">
                      ${petName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #059669; font-size: 14px;">
                      <strong>Firmado por:</strong>
                    </td>
                    <td style="padding: 5px 0; color: #065f46; font-size: 14px;">
                      ${signedBy}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #059669; font-size: 14px;">
                      <strong>Fecha:</strong>
                    </td>
                    <td style="padding: 5px 0; color: #065f46; font-size: 14px;">
                      ${formatDate(signedAt)}
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- PDF Attachment Notice -->
          <tr>
            <td style="padding: 0 40px 25px;">
              <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; border-radius: 4px;">
                <strong style="color: #0369a1; font-size: 14px; display: block; margin-bottom: 5px;">📎 Documento adjunto</strong>
                <p style="margin: 0; color: #0c4a6e; font-size: 14px; line-height: 1.5;">
                  Encontrarás el documento de consentimiento firmado adjunto a este correo en formato PDF.
                </p>
              </div>
            </td>
          </tr>

          ${
            viewLink
              ? `
          <!-- View Online Button -->
          <tr>
            <td style="padding: 0 40px 25px; text-align: center;">
              <a href="${viewLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                📄 Ver en Portal
              </a>
            </td>
          </tr>
          `
              : ''
          }

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 14px; text-align: center; line-height: 1.5;">
                Gracias por confiar en nosotros para el cuidado de ${petName}.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px; text-align: center; line-height: 1.5;">
                Si tienes alguna pregunta sobre este consentimiento, no dudes en contactarnos.
              </p>
              ${
                clinicPhone || clinicEmail
                  ? `
                <p style="margin: 10px 0 0; color: #999999; font-size: 12px; text-align: center;">
                  ${clinicPhone ? `📞 ${clinicPhone}` : ''} ${clinicPhone && clinicEmail ? '|' : ''} ${clinicEmail ? `✉️ ${clinicEmail}` : ''}
                </p>
              `
                  : ''
              }
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Generate plain text version of signed consent email
 */
export function generateSignedConsentEmailText(data: SignedConsentEmailData): string {
  const {
    tenantName,
    ownerName,
    petName,
    consentType,
    consentCategory,
    signedAt,
    signedBy,
    viewLink,
  } = data

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-PY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  let text = `${tenantName}\n`
  text += `${'='.repeat(tenantName.length)}\n\n`
  text += `CONSENTIMIENTO FIRMADO\n\n`
  text += `Hola ${ownerName},\n\n`
  text += `Te enviamos una copia del consentimiento que firmaste para ${petName}.\n`
  text += `Por favor, guarda este correo para tus registros.\n\n`

  text += `DETALLES:\n`
  if (consentCategory) {
    text += `Categoría: ${consentCategory.toUpperCase()}\n`
  }
  text += `Tipo: ${consentType}\n`
  text += `Mascota: ${petName}\n`
  text += `Firmado por: ${signedBy}\n`
  text += `Fecha: ${formatDate(signedAt)}\n\n`

  text += `El documento de consentimiento firmado está adjunto a este correo en formato PDF.\n\n`

  if (viewLink) {
    text += `También puedes ver el documento en línea:\n${viewLink}\n\n`
  }

  text += `Gracias por confiar en nosotros para el cuidado de ${petName}.\n`
  text += `Si tienes alguna pregunta sobre este consentimiento, no dudes en contactarnos.\n`

  return text
}
