import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email/client';
import {
  generateConsentRequestEmail,
  generateConsentRequestEmailText,
} from '@/lib/email/templates/consent-request';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  if (!['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo personal autorizado puede enviar solicitudes de firma' }, { status: 403 });
  }

  // Parse body
  const rateLimitResult = await rateLimit(request, 'write', user.id);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const {
    template_id,
    pet_id,
    owner_id,
    delivery_method,
    recipient_email,
    recipient_phone,
    expires_in_hours
  } = body;

  // Validate required fields
  if (!template_id || !pet_id || !owner_id || !delivery_method) {
    return NextResponse.json({
      error: 'template_id, pet_id, owner_id y delivery_method son requeridos'
    }, { status: 400 });
  }

  if (delivery_method === 'email' && !recipient_email) {
    return NextResponse.json({ error: 'recipient_email es requerido para envío por email' }, { status: 400 });
  }

  if (delivery_method === 'sms' && !recipient_phone) {
    return NextResponse.json({ error: 'recipient_phone es requerido para envío por SMS' }, { status: 400 });
  }

  // Verify pet belongs to staff's clinic
  const { data: pet } = await supabase
    .from('pets')
    .select('id, tenant_id, owner_id, name')
    .eq('id', pet_id)
    .single();

  if (!pet) {
    return NextResponse.json({ error: 'Mascota no encontrada' }, { status: 404 });
  }

  if (pet.tenant_id !== profile.clinic_id) {
    return NextResponse.json({ error: 'No tienes acceso a esta mascota' }, { status: 403 });
  }

  // Verify owner
  if (pet.owner_id !== owner_id) {
    return NextResponse.json({ error: 'El dueño no coincide con la mascota' }, { status: 400 });
  }

  // Get owner info
  const { data: owner } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone')
    .eq('id', owner_id)
    .single();

  if (!owner) {
    return NextResponse.json({ error: 'Dueño no encontrado' }, { status: 404 });
  }

  // Get template info
  const { data: template } = await supabase
    .from('consent_templates')
    .select('id, name, category')
    .eq('id', template_id)
    .single();

  if (!template) {
    return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 });
  }

  // Generate unique token
  const token = crypto.randomBytes(32).toString('hex');

  // Calculate expiry date
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + (expires_in_hours || 48));

  // Create consent request
  const { data, error } = await supabase
    .from('consent_requests')
    .insert({
      template_id,
      pet_id,
      owner_id,
      requested_by_id: user.id,
      token,
      delivery_method,
      recipient_email: recipient_email || owner.email,
      recipient_phone: recipient_phone || owner.phone,
      expires_at: expiresAt.toISOString(),
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('[API] consent requests POST error:', error);
    return NextResponse.json({ error: 'Error al crear solicitud de consentimiento' }, { status: 500 });
  }

  // Generate signing link
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const signingLink = `${baseUrl}/consent/${token}`;

  // Get clinic/tenant info for email
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name')
    .eq('id', profile.clinic_id)
    .single();

  // Get staff member name
  const { data: staffProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  // Send email if delivery method is email
  if (delivery_method === 'email' && (recipient_email || owner.email)) {
    try {
      const emailData = {
        clinicName: tenant?.name || profile.clinic_id,
        ownerName: owner.full_name || 'Cliente',
        petName: pet.name,
        consentType: template.name,
        consentCategory: template.category,
        signingLink,
        expiresAt: expiresAt.toISOString(),
        requestedBy: staffProfile?.full_name,
      };

      const html = generateConsentRequestEmail(emailData);
      const text = generateConsentRequestEmailText(emailData);

      const emailResult = await sendEmail({
        to: recipient_email || owner.email,
        subject: `Solicitud de Consentimiento - ${template.name}`,
        html,
        text,
      });

      if (!emailResult.success) {
        console.error('[Consent Request] Failed to send email:', emailResult.error);
        // Don't fail the whole operation if email fails
      }
    } catch (emailError) {
      console.error('[Consent Request] Exception sending email:', emailError);
      // Don't fail the whole operation if email fails
    }
  } else if (delivery_method === 'sms' && (recipient_phone || owner.phone)) {
    // Send consent request via SMS
    try {
      const phone = recipient_phone || owner.phone;
      const smsMessage = `${tenant?.name || 'Tu veterinaria'}: Hola ${owner.full_name || ''}, necesitamos tu firma para ${template.name} de ${pet.name}. Firma aquí: ${signingLink}`;

      // Get tenant SMS config
      const { data: tenantConfig } = await supabase
        .from('tenants')
        .select('config')
        .eq('id', profile.clinic_id)
        .single();

      const config = tenantConfig?.config || {};
      const accountSid = config.sms_api_key || process.env.TWILIO_ACCOUNT_SID;
      const authToken = config.sms_api_secret || process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = config.sms_from || process.env.TWILIO_PHONE_NUMBER;

      if (accountSid && authToken && fromNumber) {
        // Normalize phone number (Paraguay format)
        let normalizedPhone = phone.replace(/\D/g, '');
        if (normalizedPhone.startsWith('0')) {
          normalizedPhone = '595' + normalizedPhone.substring(1);
        }
        if (!normalizedPhone.startsWith('595') && normalizedPhone.length === 9) {
          normalizedPhone = '595' + normalizedPhone;
        }
        normalizedPhone = '+' + normalizedPhone;

        const smsResponse = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              From: fromNumber,
              To: normalizedPhone,
              Body: smsMessage.substring(0, 160)
            })
          }
        );

        if (!smsResponse.ok) {
          const smsError = await smsResponse.json();
          console.error('[Consent Request] Failed to send SMS:', smsError);
        } else {
          console.log('[Consent Request] SMS sent successfully');
        }
      } else {
        console.warn('[Consent Request] SMS not configured for this tenant');
      }
    } catch (smsError) {
      console.error('[Consent Request] Exception sending SMS:', smsError);
      // Don't fail the whole operation if SMS fails
    }
  }

  return NextResponse.json({
    ...data,
    signing_link: signingLink
  }, { status: 201 });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  // Authentication check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id:tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  if (!['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo personal autorizado puede ver solicitudes' }, { status: 403 });
  }

  // Get consent requests
  const { data, error } = await supabase
    .from('consent_requests')
    .select(`
      *,
      pet:pets!inner(id, name, tenant_id),
      owner:profiles!owner_id(id, full_name, email),
      template:consent_templates!template_id(id, name, category),
      requested_by:profiles!requested_by_id(id, full_name)
    `)
    .eq('pet.tenant_id', profile.clinic_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[API] consent requests GET error:', error);
    return NextResponse.json({ error: 'Error al obtener solicitudes' }, { status: 500 });
  }

  return NextResponse.json(data);
}
