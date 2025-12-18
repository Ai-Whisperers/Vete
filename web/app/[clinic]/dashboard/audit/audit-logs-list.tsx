"use client";

import { ShieldAlert, User, Clock, Monitor, Activity } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  profiles: {
    email: string;
    full_name: string;
    role: string;
  } | null;
}

interface AuditLogsListProps {
  logs: AuditLog[];
}

export function AuditLogsList({ logs }: AuditLogsListProps): React.ReactElement {
  const getActionColor = (action: string): string => {
    if (action.includes('delete') || action.includes('remove')) return 'text-red-600 bg-red-100';
    if (action.includes('create') || action.includes('add')) return 'text-green-600 bg-green-100';
    if (action.includes('update') || action.includes('edit')) return 'text-blue-600 bg-blue-100';
    if (action.includes('login') || action.includes('auth')) return 'text-purple-600 bg-purple-100';
    return 'text-gray-600 bg-gray-100';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('es-PY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Registro de Auditoría</h1>
          <p className="text-[var(--text-secondary)]">Seguimiento de acciones del sistema</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{logs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-medium">Creaciones</span>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {logs.filter(l => l.action.includes('create') || l.action.includes('add')).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-medium">Actualizaciones</span>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {logs.filter(l => l.action.includes('update') || l.action.includes('edit')).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-medium">Eliminaciones</span>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {logs.filter(l => l.action.includes('delete') || l.action.includes('remove')).length}
          </p>
        </div>
      </div>

      {/* Logs */}
      {logs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">No hay registros de auditoria</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                    <Clock className="w-3 h-3" />
                    {formatDate(log.created_at)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {log.profiles?.full_name || 'Sistema'}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] truncate">
                        {log.profiles?.email || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-[var(--text-primary)]">
                    <span className="text-[var(--text-secondary)]">Recurso:</span> {log.resource}
                  </div>
                  {log.ip_address && (
                    <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                      <Monitor className="w-3 h-3" />
                      {log.ip_address}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Accion</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Recurso</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">
                              {log.profiles?.full_name || 'Sistema'}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                              {log.profiles?.email || '-'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[var(--text-primary)]">{log.resource}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                          <Clock className="w-4 h-4" />
                          {formatDate(log.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                          <Monitor className="w-4 h-4" />
                          {log.ip_address || '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
