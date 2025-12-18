import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/dashboard/stats - Get clinic dashboard stats from materialized view
export async function GET(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Solo el personal puede ver estadísticas' }, { status: 403 });
  }

  try {
    // Get from materialized view for fast access
    const { data: stats, error } = await supabase
      .from('mv_clinic_dashboard_stats')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .single();

    if (error) {
      // Fallback to live query if materialized view not available
      const [petsResult, appointmentsResult, vaccinesResult, invoicesResult] = await Promise.all([
        supabase
          .from('pets')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', profile.tenant_id)
          .is('deleted_at', null),
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', profile.tenant_id)
          .gte('start_time', new Date().toISOString().split('T')[0]),
        supabase
          .from('vaccines')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', profile.tenant_id)
          .lte('next_dose_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from('invoices')
          .select('id, amount_due', { count: 'exact' })
          .eq('tenant_id', profile.tenant_id)
          .in('status', ['sent', 'partial'])
      ]);

      const pendingAmount = invoicesResult.data?.reduce((sum, inv) => sum + (inv.amount_due || 0), 0) || 0;

      return NextResponse.json({
        total_pets: petsResult.count || 0,
        appointments_today: appointmentsResult.count || 0,
        pending_vaccines: vaccinesResult.count || 0,
        pending_invoices: invoicesResult.count || 0,
        pending_amount: pendingAmount,
        last_updated: new Date().toISOString()
      });
    }

    return NextResponse.json(stats);
  } catch (e) {
    console.error('Error loading dashboard stats:', e);
    return NextResponse.json({ error: 'Error al cargar estadísticas' }, { status: 500 });
  }
}
