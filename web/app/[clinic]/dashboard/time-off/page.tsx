import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
} from 'lucide-react';

interface Props {
  params: Promise<{ clinic: string }>;
}

interface TimeOffRequest {
  id: string;
  type: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string | null;
  created_at: string;
  staff_profiles: {
    profiles: {
      full_name: string;
    };
  };
}

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: 'Aprobado', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default async function TimeOffPage({ params }: Props): Promise<React.ReactElement> {
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

  const isAdmin = profile.role === 'admin';

  // Fetch time-off requests
  let query = supabase
    .from('staff_time_off')
    .select(`
      id,
      type,
      start_date,
      end_date,
      status,
      reason,
      created_at,
      staff_profiles!inner (
        profiles!inner (
          full_name
        )
      )
    `)
    .order('created_at', { ascending: false });

  // Non-admins only see their own requests
  if (!isAdmin) {
    const { data: staffProfile } = await supabase
      .from('staff_profiles')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (staffProfile) {
      query = query.eq('staff_id', staffProfile.id);
    }
  }

  const { data: requests } = await query;
  const typedRequests = (requests || []) as unknown as TimeOffRequest[];

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('es-PY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysCount = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href={`/${clinic}/dashboard/schedules`}
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Horarios
          </Link>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">
            {isAdmin ? 'Solicitudes de Ausencia' : 'Mis Ausencias'}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {isAdmin ? 'Gestiona las solicitudes del equipo' : 'Solicita días libres o vacaciones'}
          </p>
        </div>
        <Link
          href={`/${clinic}/dashboard/time-off/new`}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Nueva Solicitud
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-400 uppercase font-bold mb-1">Pendientes</p>
          <p className="text-2xl font-black text-amber-600">
            {typedRequests.filter((r) => r.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-400 uppercase font-bold mb-1">Aprobadas</p>
          <p className="text-2xl font-black text-green-600">
            {typedRequests.filter((r) => r.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-400 uppercase font-bold mb-1">Rechazadas</p>
          <p className="text-2xl font-black text-red-600">
            {typedRequests.filter((r) => r.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Empty State */}
      {typedRequests.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-600 mb-2">No hay solicitudes</h3>
          <p className="text-gray-500 mb-6">
            {isAdmin
              ? 'No hay solicitudes de ausencia pendientes'
              : 'Aún no has solicitado días libres'}
          </p>
        </div>
      )}

      {/* Requests List */}
      {typedRequests.length > 0 && (
        <div className="space-y-4">
          {typedRequests.map((request) => {
            const status = statusConfig[request.status];
            const StatusIcon = status.icon;
            const days = getDaysCount(request.start_date, request.end_date);

            return (
              <div
                key={request.id}
                className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-[var(--primary)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-[var(--text-primary)]">{request.type}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      {isAdmin && (
                        <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1 mb-2">
                          <User className="w-3 h-3" />
                          {request.staff_profiles?.profiles?.full_name || 'Sin nombre'}
                        </p>
                      )}
                      <p className="text-sm text-[var(--text-secondary)]">
                        {formatDate(request.start_date)} - {formatDate(request.end_date)}
                        <span className="text-gray-400 ml-2">({days} {days === 1 ? 'día' : 'días'})</span>
                      </p>
                      {request.reason && (
                        <p className="text-sm text-gray-500 mt-2 italic">&quot;{request.reason}&quot;</p>
                      )}
                    </div>
                  </div>

                  {/* Admin Actions */}
                  {isAdmin && request.status === 'pending' && (
                    <div className="flex gap-2">
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-bold mb-1">Política de Ausencias</p>
          <p>
            Las solicitudes deben realizarse con al menos 7 días de anticipación.
            Las emergencias serán evaluadas caso por caso.
          </p>
        </div>
      </div>
    </div>
  );
}
