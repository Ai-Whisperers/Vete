import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/dashboard/vaccines - Get upcoming vaccine reminders
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
    return NextResponse.json({ error: 'Solo el personal puede ver recordatorios' }, { status: 403 });
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
        id, name, next_dose_date,
        pet:pets(
          id, name, photo_url,
          owner:profiles!pets_owner_id_fkey(id, full_name, phone)
        )
      `)
      .eq('tenant_id', profile.tenant_id)
      .gte('next_dose_date', pastDate.toISOString())
      .lte('next_dose_date', futureDate.toISOString())
      .not('next_dose_date', 'is', null)
      .order('next_dose_date', { ascending: true });

    if (error) throw error;

    const reminders = vaccines?.map(v => {
      const dueDate = new Date(v.next_dose_date);
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
        due_date: v.next_dose_date,
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
    console.error('Error loading vaccine reminders:', e);
    return NextResponse.json({ error: 'Error al cargar recordatorios' }, { status: 500 });
  }
}
