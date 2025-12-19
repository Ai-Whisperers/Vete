import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/sms
 * Get SMS message history and stats
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view'); // 'history' or 'stats'
  const days = parseInt(searchParams.get('days') || '30');
  const limit = parseInt(searchParams.get('limit') || '50');

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Staff check
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo personal puede ver SMS' }, { status: 403 });
  }

  try {
    if (view === 'stats') {
      // Get SMS statistics
      const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      // Get notification log stats for SMS
      const { data: logs } = await supabase
        .from('notification_log')
        .select('status, sent_at, cost')
        .eq('tenant_id', profile.tenant_id)
        .eq('channel_type', 'sms')
        .gte('sent_at', sinceDate);

      const stats = {
        total: logs?.length || 0,
        sent: logs?.filter(l => l.status === 'sent').length || 0,
        delivered: logs?.filter(l => l.status === 'delivered').length || 0,
        failed: logs?.filter(l => l.status === 'failed' || l.status === 'bounced').length || 0,
        total_cost: logs?.reduce((sum, l) => sum + (l.cost || 0), 0) || 0
      };

      // Get daily breakdown
      const dailyStats: Record<string, number> = {};
      logs?.forEach(log => {
        const day = log.sent_at.split('T')[0];
        dailyStats[day] = (dailyStats[day] || 0) + 1;
      });

      return NextResponse.json({
        stats,
        daily: Object.entries(dailyStats)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date))
      });
    }

    // Get message history from whatsapp_messages (unified messaging)
    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select(`
        id, phone_number, direction, content, status,
        external_id, error_message, created_at, delivered_at,
        sender:profiles!whatsapp_messages_sent_by_fkey(full_name)
      `)
      .eq('tenant_id', profile.tenant_id)
      .neq('message_type', 'whatsapp') // Exclude WhatsApp messages
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({ data: messages || [] });
  } catch (e) {
    console.error('Error fetching SMS data:', e);
    return NextResponse.json({ error: 'Error al cargar mensajes' }, { status: 500 });
  }
}
