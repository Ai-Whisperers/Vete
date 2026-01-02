import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { apiError, HTTP_STATUS } from '@/lib/api/errors';

/**
 * GET /api/reminders/stats
 * Get reminder statistics for the dashboard
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED);
  }

  // Staff check
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN);
  }

  try {
    // Get reminders by status
    const { data: statusCounts } = await supabase
      .from('reminders')
      .select('status')
      .eq('tenant_id', profile.tenant_id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const stats = {
      pending: 0,
      processing: 0,
      sent: 0,
      failed: 0,
      cancelled: 0,
      skipped: 0
    };

    statusCounts?.forEach(r => {
      const status = r.status as keyof typeof stats;
      if (stats[status] !== undefined) {
        stats[status]++;
      }
    });

    // Get notification log stats
    const { data: notificationCounts } = await supabase
      .from('notification_log')
      .select('status, channel_type')
      .eq('tenant_id', profile.tenant_id)
      .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const notificationStats = {
      total: notificationCounts?.length || 0,
      email: 0,
      sms: 0,
      whatsapp: 0,
      delivered: 0,
      failed: 0
    };

    notificationCounts?.forEach(n => {
      if (n.channel_type === 'email') notificationStats.email++;
      if (n.channel_type === 'sms') notificationStats.sms++;
      if (n.channel_type === 'whatsapp') notificationStats.whatsapp++;
      if (n.status === 'delivered' || n.status === 'sent') notificationStats.delivered++;
      if (n.status === 'failed' || n.status === 'bounced') notificationStats.failed++;
    });

    // Get upcoming vaccines due
    const { count: vaccinesDue } = await supabase
      .from('vaccines')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .lte('next_due_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

    // Get upcoming appointments
    const { count: appointmentsUpcoming } = await supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', profile.tenant_id)
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', new Date().toISOString())
      .lte('start_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());

    // Get job execution logs
    const { data: recentJobs } = await supabase
      .from('scheduled_job_log')
      .select('job_name, status, started_at, duration_ms')
      .in('job_name', ['vaccine_reminders', 'appointment_reminders', 'process_notifications'])
      .order('started_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      reminders: stats,
      notifications: notificationStats,
      upcoming: {
        vaccines_due: vaccinesDue || 0,
        appointments_24h: appointmentsUpcoming || 0
      },
      recent_jobs: recentJobs || []
    });
  } catch (e) {
    console.error('Error fetching reminder stats:', e);
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * POST /api/reminders/stats
 * Manually trigger reminder generation
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED);
  }

  // Admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN);
  }

  try {
    const body = await request.json();
    const { job_type } = body;

    if (!job_type) {
      return apiError('MISSING_FIELDS', HTTP_STATUS.BAD_REQUEST, { details: { required: ['job_type'] } });
    }

    // Call the database function to trigger the job
    const jobName = job_type === 'vaccine' ? 'vaccine_reminders' :
                    job_type === 'appointment' ? 'appointment_reminders' :
                    job_type === 'process' ? 'process_notifications' : null;

    if (!jobName) {
      return apiError('VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST, { details: { reason: 'Tipo de job invalido' } });
    }

    const { data, error } = await supabase.rpc('trigger_job', { p_job_name: jobName });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: data || `Job ${jobName} ejecutado`
    });
  } catch (e) {
    console.error('Error triggering job:', e);
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
