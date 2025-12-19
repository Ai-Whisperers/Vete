import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/sms/config
 * Get SMS configuration status (masked)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores pueden ver configuración' }, { status: 403 });
  }

  try {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('config')
      .eq('id', profile.tenant_id)
      .single();

    const config = tenant?.config || {};

    // Return masked configuration
    return NextResponse.json({
      configured: !!(config.sms_api_key && config.sms_api_secret && config.sms_from),
      provider: 'twilio',
      from_number: config.sms_from ? maskPhone(config.sms_from) : null,
      api_key_set: !!config.sms_api_key,
      api_secret_set: !!config.sms_api_secret
    });
  } catch (e) {
    console.error('Error fetching SMS config:', e);
    return NextResponse.json({ error: 'Error al cargar configuración' }, { status: 500 });
  }
}

/**
 * POST /api/sms/config
 * Update SMS configuration
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores pueden configurar SMS' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { sms_api_key, sms_api_secret, sms_from } = body;

    // Get current tenant config
    const { data: tenant } = await supabase
      .from('tenants')
      .select('config')
      .eq('id', profile.tenant_id)
      .single();

    const currentConfig = tenant?.config || {};

    // Build updated config
    const updatedConfig = {
      ...currentConfig,
      ...(sms_api_key && { sms_api_key }),
      ...(sms_api_secret && { sms_api_secret }),
      ...(sms_from && { sms_from })
    };

    // Update tenant config
    const { error: updateError } = await supabase
      .from('tenants')
      .update({ config: updatedConfig })
      .eq('id', profile.tenant_id);

    if (updateError) throw updateError;

    // Test the configuration if all fields provided
    if (sms_api_key && sms_api_secret && sms_from) {
      const testResult = await testTwilioConfig(sms_api_key, sms_api_secret);
      if (!testResult.success) {
        return NextResponse.json({
          success: true,
          warning: `Configuración guardada pero la prueba falló: ${testResult.error}`
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración de SMS actualizada'
    });
  } catch (e) {
    console.error('Error updating SMS config:', e);
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 });
  }
}

/**
 * POST /api/sms/config/test
 * Test SMS configuration by sending a test message
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role, phone')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Solo administradores pueden probar SMS' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const testPhone = body.test_phone || profile.phone;

    if (!testPhone) {
      return NextResponse.json({
        error: 'Número de teléfono para prueba no proporcionado'
      }, { status: 400 });
    }

    // Get SMS config
    const { data: tenant } = await supabase
      .from('tenants')
      .select('config, name')
      .eq('id', profile.tenant_id)
      .single();

    const config = tenant?.config || {};
    const accountSid = config.sms_api_key;
    const authToken = config.sms_api_secret;
    const fromNumber = config.sms_from;

    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json({
        error: 'SMS no está configurado. Complete la configuración primero.'
      }, { status: 400 });
    }

    // Send test SMS
    const normalizedPhone = normalizePhoneNumber(testPhone);
    const testMessage = `[PRUEBA] Este es un mensaje de prueba de ${tenant?.name || 'VetePy'}. Si recibiste esto, tu SMS está funcionando! 🎉`;

    const response = await fetch(
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
          Body: testMessage
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({
        success: false,
        error: `Error de Twilio: ${error.message || 'Error desconocido'}`
      }, { status: 400 });
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: `SMS de prueba enviado a ${normalizedPhone}`,
      message_id: result.sid
    });
  } catch (e) {
    console.error('Error testing SMS:', e);
    return NextResponse.json({ error: 'Error al enviar SMS de prueba' }, { status: 500 });
  }
}

async function testTwilioConfig(accountSid: string, authToken: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64')
        }
      }
    );

    if (!response.ok) {
      return { success: false, error: 'Credenciales inválidas' };
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: 'No se pudo conectar a Twilio' };
  }
}

function maskPhone(phone: string): string {
  if (phone.length <= 6) return phone;
  return phone.slice(0, 4) + '****' + phone.slice(-2);
}

function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '595' + cleaned.substring(1);
  }
  if (!cleaned.startsWith('595') && cleaned.length === 9) {
    cleaned = '595' + cleaned;
  }
  return '+' + cleaned;
}
