import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { apiError, HTTP_STATUS } from '@/lib/api/errors';

// GET /api/dashboard/vaccines - Get upcoming vaccine reminders
export async function GET(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN);
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '14');

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);

    // Get vaccines due in the next X days (including overdue)
    const pastDate = new Date(today);
    pastDate.setDate(pastDate.getDate() - 30); // Include up to 30 days overdue

    const { data: vaccines, error } = await supabase
      .from('vaccines')
      .select(`
        id, name, next_due_date,
        pet:pets(
          id, name, photo_url,
          owner:profiles!pets_owner_id_fkey(id, full_name, phone)
        )
      `)
      .eq('tenant_id', profile.tenant_id)
      .gte('next_due_date', pastDate.toISOString())
      .lte('next_due_date', futureDate.toISOString())
      .not('next_due_date', 'is', null)
      .order('next_due_date', { ascending: true });

    if (error) throw error;

    const reminders = vaccines?.map(v => {
      const dueDate = new Date(v.next_due_date);
      const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const pet = v.pet as any;
      const owner = pet?.owner;

      return {
        pet_id: pet?.id,
        pet_name: pet?.name || 'Desconocido',
        pet_photo: pet?.photo_url,
        owner_name: owner?.full_name || 'Sin dueño',
        owner_phone: owner?.phone,
        vaccine_name: v.name,
        due_date: v.next_due_date,
        days_until: daysUntil,
        is_overdue: daysUntil < 0
      };
    }) || [];

    // Sort: overdue first (most overdue at top), then upcoming (soonest first)
    reminders.sort((a, b) => {
      if (a.is_overdue && !b.is_overdue) return -1;
      if (!a.is_overdue && b.is_overdue) return 1;
      return a.days_until - b.days_until;
    });

    return NextResponse.json(reminders);
  } catch (e) {
    logger.error('Error loading vaccine reminders', { userId: user.id, tenantId: profile.tenant_id, error: e instanceof Error ? e.message : 'Unknown' });
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      details: { message: e instanceof Error ? e.message : 'Unknown error' }
    });
  }
}
