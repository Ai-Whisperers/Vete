// Supabase Edge Function: Generate Vaccine Reminders
// Called daily by pg_cron to create notification queue entries for upcoming vaccines

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';
import { corsHeaders } from '../_shared/cors.ts';

const REMINDER_DAYS = [7, 3, 1, 0]; // Send reminders 7, 3, 1, and 0 days before due date

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Generating vaccine reminders...');

    // Get all tenants with active subscriptions
    const { data: tenants, error: tenantsError } = await supabaseAdmin
      .from('tenants')
      .select('id, name, config')
      .eq('is_active', true);

    if (tenantsError) {
      throw new Error(`Failed to fetch tenants: ${tenantsError.message}`);
    }

    let totalReminders = 0;

    for (const tenant of tenants || []) {
      const remindersGenerated = await generateRemindersForTenant(tenant);
      totalReminders += remindersGenerated;
    }

    console.log(`Generated ${totalReminders} vaccine reminders`);

    return new Response(
      JSON.stringify({
        message: 'Vaccine reminders generated',
        total_reminders: totalReminders,
        tenants_processed: tenants?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating vaccine reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateRemindersForTenant(tenant: { id: string; name: string; config?: any }): Promise<number> {
  let remindersCreated = 0;

  for (const daysAhead of REMINDER_DAYS) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);
    targetDate.setHours(0, 0, 0, 0);

    const targetDateStr = targetDate.toISOString().split('T')[0];

    // Get vaccines due on this date
    const { data: vaccines, error } = await supabaseAdmin
      .from('vaccines')
      .select(`
        id, name, next_dose_date,
        pet:pets(
          id, name,
          owner:profiles!pets_owner_id_fkey(id, email, phone, full_name)
        )
      `)
      .eq('tenant_id', tenant.id)
      .gte('next_dose_date', `${targetDateStr}T00:00:00`)
      .lt('next_dose_date', `${targetDateStr}T23:59:59`);

    if (error) {
      console.error(`Error fetching vaccines for tenant ${tenant.id}:`, error);
      continue;
    }

    for (const vaccine of vaccines || []) {
      const pet = vaccine.pet as any;
      const owner = pet?.owner;

      if (!owner) continue;

      // Check if we already sent this reminder
      const reminderKey = `vaccine-${vaccine.id}-${daysAhead}d`;
      const { data: existing } = await supabaseAdmin
        .from('reminders')
        .select('id')
        .eq('tenant_id', tenant.id)
        .eq('entity_type', 'vaccine')
        .eq('entity_id', vaccine.id)
        .eq('reminder_key', reminderKey)
        .single();

      if (existing) continue; // Already created

      // Create reminder record
      await supabaseAdmin.from('reminders').insert({
        tenant_id: tenant.id,
        entity_type: 'vaccine',
        entity_id: vaccine.id,
        reminder_key: reminderKey,
        due_date: vaccine.next_dose_date,
        status: 'pending'
      });

      // Queue email notification
      if (owner.email) {
        const daysText = daysAhead === 0 ? 'hoy' :
          daysAhead === 1 ? 'mañana' :
            `en ${daysAhead} días`;

        await supabaseAdmin.from('notification_queue').insert({
          tenant_id: tenant.id,
          channel: 'email',
          recipient_id: owner.id,
          recipient_address: owner.email,
          subject: `Recordatorio: Vacuna de ${pet.name} vence ${daysText}`,
          body: formatVaccineReminderEmail(pet.name, vaccine.name, daysAhead, tenant.name),
          priority: daysAhead === 0 ? 'high' : daysAhead === 1 ? 'normal' : 'low',
          metadata: {
            vaccine_id: vaccine.id,
            pet_id: pet.id,
            pet_name: pet.name,
            vaccine_name: vaccine.name,
            days_until: daysAhead,
            clinic_name: tenant.name
          }
        });
        remindersCreated++;
      }

      // Queue SMS notification (only for same-day and next-day)
      if (owner.phone && daysAhead <= 1) {
        await supabaseAdmin.from('notification_queue').insert({
          tenant_id: tenant.id,
          channel: 'sms',
          recipient_id: owner.id,
          recipient_address: owner.phone,
          body: formatVaccineReminderSms(pet.name, vaccine.name, daysAhead, tenant.name),
          priority: 'high',
          metadata: {
            vaccine_id: vaccine.id,
            pet_id: pet.id
          }
        });
        remindersCreated++;
      }
    }
  }

  return remindersCreated;
}

function formatVaccineReminderEmail(
  petName: string,
  vaccineName: string,
  daysAhead: number,
  clinicName: string
): string {
  const urgency = daysAhead === 0 ? '¡URGENTE! ' : '';
  const daysText = daysAhead === 0 ? 'HOY' :
    daysAhead === 1 ? 'MAÑANA' :
      `en ${daysAhead} días`;

  return `
${urgency}Hola,

Te recordamos que la vacuna "${vaccineName}" de ${petName} vence ${daysText}.

Para mantener a ${petName} protegido/a, te recomendamos agendar una cita lo antes posible.

Puedes agendar tu cita desde nuestro portal en línea o llamando a la clínica.

Saludos,
${clinicName}

---
Este es un mensaje automático. Por favor no respondas directamente a este correo.
  `.trim();
}

function formatVaccineReminderSms(
  petName: string,
  vaccineName: string,
  daysAhead: number,
  clinicName: string
): string {
  const daysText = daysAhead === 0 ? 'HOY' : 'MAÑANA';
  return `${clinicName}: Vacuna ${vaccineName} de ${petName} vence ${daysText}. Agenda tu cita!`;
}
