import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Send,
  AlertCircle,
} from 'lucide-react';

interface Props {
  params: Promise<{ clinic: string }>;
}

export default async function NewTimeOffPage({ params }: Props): Promise<React.ReactElement> {
  const { clinic } = await params;
  const supabase = await createClient();

  // Auth & staff check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${clinic}/portal/login`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role) || profile.tenant_id !== clinic) {
    redirect(`/${clinic}/portal/dashboard`);
  }

  // Get staff profile for this user
  const { data: staffProfile } = await supabase
    .from('staff_profiles')
    .select('id')
    .eq('profile_id', user.id)
    .single();

  // Fetch time-off types
  const { data: timeOffTypes } = await supabase
    .from('staff_time_off_types')
    .select('id, name, paid, max_days')
    .eq('tenant_id', clinic)
    .order('name');

  const typedTypes = (timeOffTypes || []) as { id: string; name: string; paid: boolean; max_days: number | null }[];

  // Default types if none configured
  const defaultTypes = [
    { id: 'vacation', name: 'Vacaciones', paid: true, max_days: null },
    { id: 'sick', name: 'Enfermedad', paid: true, max_days: null },
    { id: 'personal', name: 'Personal', paid: false, max_days: null },
    { id: 'other', name: 'Otro', paid: false, max_days: null },
  ];

  const availableTypes = typedTypes.length > 0 ? typedTypes : defaultTypes;

  // Server action to create request
  async function createTimeOffRequest(formData: FormData): Promise<void> {
    'use server';

    const supabaseServer = (await import('@/lib/supabase/server')).createClient;
    const supabase = await supabaseServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Verify staff
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', user.id)
      .single();

    if (!userProfile || !['vet', 'admin'].includes(userProfile.role)) return;

    // Get staff profile
    const { data: staffProf } = await supabase
      .from('staff_profiles')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (!staffProf) return;

    const type = formData.get('type') as string;
    const startDate = formData.get('start_date') as string;
    const endDate = formData.get('end_date') as string;
    const reason = formData.get('reason') as string | null;

    // Insert request
    const { error } = await supabase.from('staff_time_off').insert({
      staff_id: staffProf.id,
      type,
      start_date: startDate,
      end_date: endDate,
      reason: reason || null,
      status: 'pending',
    });

    if (error) {
      console.error('Error creating time-off request:', error);
      return;
    }

    // Redirect back to list
    const { redirect: redirectFn } = await import('next/navigation');
    redirectFn(`/${clinic}/dashboard/time-off`);
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/${clinic}/dashboard/time-off`}
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Ausencias
        </Link>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">Nueva Solicitud</h1>
            <p className="text-[var(--text-secondary)]">Solicita días libres o vacaciones</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form action={createTimeOffRequest} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Type Selection */}
        <div className="p-6 border-b border-gray-100">
          <label htmlFor="type" className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
            Tipo de ausencia *
          </label>
          <select
            id="type"
            name="type"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
          >
            {availableTypes.map((type) => (
              <option key={type.id || type.name} value={type.name}>
                {type.name}
                {type.paid && ' (Con goce de sueldo)'}
                {type.max_days && ` - Máx. ${type.max_days} días`}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="p-6 border-b border-gray-100 grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Fecha inicio *
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                id="start_date"
                name="start_date"
                required
                min={today}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="end_date" className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Fecha fin *
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                id="end_date"
                name="end_date"
                required
                min={today}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="p-6 border-b border-gray-100">
          <label htmlFor="reason" className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
            Motivo (opcional)
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={3}
            placeholder="Describe brevemente el motivo de tu solicitud..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none resize-none"
          />
        </div>

        {/* Info Box */}
        <div className="px-6 py-4 bg-blue-50 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-bold mb-1">Importante</p>
            <p>
              Las solicitudes deben realizarse con al menos 7 días de anticipación.
              Recibirás una notificación cuando tu solicitud sea revisada.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="p-6 flex justify-end gap-3">
          <Link
            href={`/${clinic}/dashboard/time-off`}
            className="px-6 py-3 text-[var(--text-secondary)] font-medium hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" />
            Enviar Solicitud
          </button>
        </div>
      </form>
    </div>
  );
}
