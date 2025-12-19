'use client';

import { useState, useEffect } from 'react';
import {
  Bell, Calendar, Mail, MessageSquare, Phone, RefreshCw,
  Play, Settings, Clock, CheckCircle, XCircle, AlertTriangle,
  Syringe, TrendingUp, Filter, Plus
} from 'lucide-react';

interface ReminderStats {
  reminders: {
    pending: number;
    processing: number;
    sent: number;
    failed: number;
    cancelled: number;
    skipped: number;
  };
  notifications: {
    total: number;
    email: number;
    sms: number;
    whatsapp: number;
    delivered: number;
    failed: number;
  };
  upcoming: {
    vaccines_due: number;
    appointments_24h: number;
  };
  recent_jobs: Array<{
    job_name: string;
    status: string;
    started_at: string;
    duration_ms: number;
  }>;
}

interface Reminder {
  id: string;
  type: string;
  reference_type: string | null;
  reference_id: string | null;
  scheduled_at: string;
  status: string;
  attempts: number;
  error_message: string | null;
  created_at: string;
  client: { id: string; full_name: string; email: string; phone: string } | null;
  pet: { id: string; name: string } | null;
}

interface ReminderRule {
  id: string;
  name: string;
  type: string;
  days_offset: number;
  time_of_day: string;
  channels: string[];
  is_active: boolean;
}

interface Props {
  clinic: string;
  isAdmin: boolean;
}

export default function RemindersDashboard({ clinic, isAdmin }: Props) {
  const [stats, setStats] = useState<ReminderStats | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [rules, setRules] = useState<ReminderRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reminders' | 'rules'>('overview');
  const [statusFilter, setStatusFilter] = useState('all');
  const [triggering, setTriggering] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, remindersRes, rulesRes] = await Promise.all([
        fetch('/api/reminders/stats'),
        fetch(`/api/reminders?status=${statusFilter}&limit=50`),
        isAdmin ? fetch('/api/reminders/rules') : Promise.resolve({ ok: true, json: () => ({ data: [] }) })
      ]);

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
      if (remindersRes.ok) {
        const data = await remindersRes.json();
        setReminders(data.data || []);
      }
      if (rulesRes.ok) {
        const data = await rulesRes.json();
        setRules(data.data || []);
      }
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  const triggerJob = async (jobType: string) => {
    setTriggering(jobType);
    try {
      const res = await fetch('/api/reminders/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_type: jobType })
      });

      if (res.ok) {
        await fetchData();
      } else {
        const json = await res.json();
        alert(json.error || 'Error al ejecutar');
      }
    } catch (e) {
      alert('Error al ejecutar job');
    } finally {
      setTriggering(null);
    }
  };

  const toggleRule = async (rule: ReminderRule) => {
    try {
      const res = await fetch('/api/reminders/rules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rule.id, is_active: !rule.is_active })
      });

      if (res.ok) {
        setRules(rules.map(r => r.id === rule.id ? { ...r, is_active: !r.is_active } : r));
      }
    } catch (e) {
      console.error('Error toggling rule:', e);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      sent: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
      skipped: 'bg-gray-100 text-gray-500'
    };
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      processing: 'Procesando',
      sent: 'Enviado',
      failed: 'Fallido',
      cancelled: 'Cancelado',
      skipped: 'Omitido'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vaccine_reminder: 'Vacuna',
      vaccine_overdue: 'Vacuna Vencida',
      appointment_reminder: 'Cita',
      appointment_confirmation: 'Confirmación',
      birthday: 'Cumpleaños',
      follow_up: 'Seguimiento',
      custom: 'Personalizado'
    };
    return labels[type] || type;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Sistema de Recordatorios</h1>
          <p className="text-[var(--text-secondary)]">Automatización de notificaciones para vacunas, citas y más</p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Resumen', icon: TrendingUp },
          { id: 'reminders', label: 'Recordatorios', icon: Bell },
          ...(isAdmin ? [{ id: 'rules', label: 'Reglas', icon: Settings }] : [])
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {loading && !stats ? (
        <div className="h-96 w-full bg-gray-100 rounded-2xl animate-pulse" />
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-100 rounded-xl">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <span className="text-gray-500 text-sm font-medium">Pendientes</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.reminders.pending}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-gray-500 text-sm font-medium">Enviados (30d)</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{stats.reminders.sent}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="text-gray-500 text-sm font-medium">Fallidos</span>
                  </div>
                  <p className="text-3xl font-bold text-red-600">{stats.reminders.failed}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Mail className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-gray-500 text-sm font-medium">Notificaciones</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.notifications.total}</p>
                </div>
              </div>

              {/* Channel Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Notificaciones por Canal (30d)</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">Email</span>
                      </div>
                      <span className="font-bold">{stats.notifications.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-green-500" />
                        <span className="font-medium">SMS</span>
                      </div>
                      <span className="font-bold">{stats.notifications.sms}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-emerald-500" />
                        <span className="font-medium">WhatsApp</span>
                      </div>
                      <span className="font-bold">{stats.notifications.whatsapp}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Próximos a Vencer</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Syringe className="w-5 h-5 text-amber-500" />
                        <span className="font-medium">Vacunas (7 días)</span>
                      </div>
                      <span className="font-bold text-amber-600">{stats.upcoming.vaccines_due}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">Citas (24 horas)</span>
                      </div>
                      <span className="font-bold text-blue-600">{stats.upcoming.appointments_24h}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manual Triggers */}
              {isAdmin && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Ejecutar Manualmente</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => triggerJob('vaccine')}
                      disabled={triggering === 'vaccine'}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl font-medium hover:bg-amber-200 disabled:opacity-50"
                    >
                      <Play className="w-4 h-4" />
                      {triggering === 'vaccine' ? 'Ejecutando...' : 'Generar Recordatorios de Vacunas'}
                    </button>
                    <button
                      onClick={() => triggerJob('appointment')}
                      disabled={triggering === 'appointment'}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 disabled:opacity-50"
                    >
                      <Play className="w-4 h-4" />
                      {triggering === 'appointment' ? 'Ejecutando...' : 'Generar Recordatorios de Citas'}
                    </button>
                    <button
                      onClick={() => triggerJob('process')}
                      disabled={triggering === 'process'}
                      className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl font-medium hover:bg-green-200 disabled:opacity-50"
                    >
                      <Play className="w-4 h-4" />
                      {triggering === 'process' ? 'Procesando...' : 'Procesar Cola de Notificaciones'}
                    </button>
                  </div>
                </div>
              )}

              {/* Recent Jobs */}
              {stats.recent_jobs.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Ejecuciones Recientes</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-xs uppercase text-gray-500 border-b">
                        <tr>
                          <th className="p-3 text-left">Job</th>
                          <th className="p-3 text-left">Estado</th>
                          <th className="p-3 text-left">Fecha</th>
                          <th className="p-3 text-right">Duración</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {stats.recent_jobs.map((job, i) => (
                          <tr key={i}>
                            <td className="p-3 font-medium">{job.job_name}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                job.status === 'completed' ? 'bg-green-100 text-green-700' :
                                job.status === 'failed' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {job.status}
                              </span>
                            </td>
                            <td className="p-3 text-gray-500">
                              {new Date(job.started_at).toLocaleString()}
                            </td>
                            <td className="p-3 text-right font-mono text-gray-500">
                              {job.duration_ms}ms
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reminders Tab */}
          {activeTab === 'reminders' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendientes</option>
                  <option value="sent">Enviados</option>
                  <option value="failed">Fallidos</option>
                </select>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="p-4 text-left">Tipo</th>
                      <th className="p-4 text-left">Cliente</th>
                      <th className="p-4 text-left">Mascota</th>
                      <th className="p-4 text-left">Programado</th>
                      <th className="p-4 text-center">Estado</th>
                      <th className="p-4 text-center">Intentos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reminders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          No hay recordatorios
                        </td>
                      </tr>
                    ) : (
                      reminders.map(reminder => (
                        <tr key={reminder.id} className="hover:bg-gray-50">
                          <td className="p-4 font-medium">{getTypeLabel(reminder.type)}</td>
                          <td className="p-4">{reminder.client?.full_name || '-'}</td>
                          <td className="p-4">{reminder.pet?.name || '-'}</td>
                          <td className="p-4 text-gray-500">
                            {new Date(reminder.scheduled_at).toLocaleString()}
                          </td>
                          <td className="p-4 text-center">{getStatusBadge(reminder.status)}</td>
                          <td className="p-4 text-center font-mono">{reminder.attempts}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rules Tab */}
          {activeTab === 'rules' && isAdmin && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="p-4 text-left">Nombre</th>
                      <th className="p-4 text-left">Tipo</th>
                      <th className="p-4 text-left">Días</th>
                      <th className="p-4 text-left">Hora</th>
                      <th className="p-4 text-left">Canales</th>
                      <th className="p-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rules.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          No hay reglas configuradas
                        </td>
                      </tr>
                    ) : (
                      rules.map(rule => (
                        <tr key={rule.id} className="hover:bg-gray-50">
                          <td className="p-4 font-medium">{rule.name}</td>
                          <td className="p-4">{getTypeLabel(rule.type)}</td>
                          <td className="p-4">
                            {rule.days_offset < 0 ? `${Math.abs(rule.days_offset)} días antes` :
                             rule.days_offset > 0 ? `${rule.days_offset} días después` : 'Mismo día'}
                          </td>
                          <td className="p-4 font-mono">{rule.time_of_day.slice(0, 5)}</td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              {rule.channels.map(ch => (
                                <span key={ch} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                                  {ch}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => toggleRule(rule)}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                rule.is_active
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              {rule.is_active ? 'Activo' : 'Inactivo'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
