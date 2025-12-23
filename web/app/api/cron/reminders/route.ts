import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/client';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET(request: NextRequest) {
  // 1. Security Check (Vercel Cron)
  // Vercel automatically bypasses protection if called internally, but checking auth header is good practice for external triggers
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new NextResponse('Unauthorized', { status: 401 });
  // }
  
  // For local dev, we might skip strict check or use a known secret
  // Assuming implicit trust for now or relying on Vercel's protection

  const supabase = await createClient();

  try {
    // 2. Find Pending Reminders (Due in next 24 hours OR past due but not sent)
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { data: reminders, error: fetchError } = await supabase
      .from('reminders')
      .select(`
        id,
        title,
        description,
        due_date,
        type,
        pet:pets(
          name,
          owner:profiles!pets_owner_id_fkey(full_name, email)
        )
      `)
      .eq('status', 'pending')
      .lte('due_date', tomorrow.toISOString()) // Due by tomorrow
      .limit(50); // Process in batches

    if (fetchError) {
      console.error('Error fetching reminders:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!reminders || reminders.length === 0) {
      return NextResponse.json({ message: 'No pending reminders found', count: 0 });
    }

    // 3. Process Each Reminder
    const results = await Promise.allSettled(reminders.map(async (reminder) => {
      // Logic for each reminder
      const petName = reminder.pet?.name || 'su mascota';
      const ownerName = reminder.pet?.owner?.full_name || 'Cliente';
      const ownerEmail = reminder.pet?.owner?.email;

      if (!ownerEmail) {
        throw new Error(`No email for owner of reminder ${reminder.id}`);
      }

      // Compose Email
      const emailResult = await sendEmail({
        to: ownerEmail,
        subject: `Recordatorio Vete: ${reminder.title}`,
        html: `
          <h1>Hola ${ownerName},</h1>
          <p>Este es un recordatorio amable para <strong>${petName}</strong>.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #4f46e5; margin-top: 0;">${reminder.title}</h2>
            <p>${reminder.description || ''}</p>
            <p><strong>Fecha:</strong> ${new Date(reminder.due_date).toLocaleDateString('es-PY')}</p>
          </div>
          <p>Por favor contáctenos si tiene alguna pregunta.</p>
          <p>Saludos,<br/>El equipo de Vete</p>
        `,
        text: `Recordatorio para ${petName}: ${reminder.title}. Fecha: ${new Date(reminder.due_date).toLocaleDateString('es-PY')}.`
      });

      if (!emailResult.success) {
        throw new Error(emailResult.error);
      }

      // Mark as Sent
      await supabase
        .from('reminders')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', reminder.id);

      return reminder.id;
    }));

    // 4. Summarize Results
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      message: `Processed ${reminders.length} reminders`,
      stats: {
        total: reminders.length,
        sent: successCount,
        failed: failureCount
      }
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
