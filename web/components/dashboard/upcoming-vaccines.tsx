"use client";

import { useEffect, useState } from 'react';
import { Syringe, ChevronRight, Bell, Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface VaccineReminder {
  pet_id: string;
  pet_name: string;
  pet_photo?: string;
  owner_name: string;
  owner_phone?: string;
  vaccine_name: string;
  due_date: string;
  days_until: number;
  is_overdue: boolean;
}

interface UpcomingVaccinesProps {
  clinic: string;
}

export function UpcomingVaccines({ clinic }: UpcomingVaccinesProps) {
  const [vaccines, setVaccines] = useState<VaccineReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [reminderResult, setReminderResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        // Using existing vaccine endpoint or dashboard-specific endpoint
        const res = await fetch(`/api/dashboard/vaccines?clinic=${clinic}&days=14`);
        if (res.ok) {
          const data = await res.json();
          setVaccines(data);
        }
      } catch {
        // Error fetching vaccine reminders - silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchVaccines();
  }, [clinic]);

  if (loading) {
    return (
      <div className="bg-[var(--bg-paper)] rounded-xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-[var(--bg-subtle)] rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--bg-subtle)] rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-[var(--bg-subtle)] rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-[var(--border-light,#f3f4f6)] rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const overdue = vaccines.filter(v => v.is_overdue);
  const upcoming = vaccines.filter(v => !v.is_overdue);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-PY', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getDaysLabel = (days: number, isOverdue: boolean) => {
    if (isOverdue) {
      return days === -1 ? 'Hace 1 día' : `Hace ${Math.abs(days)} días`;
    }
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Mañana';
    return `En ${days} días`;
  };

  const handleSendReminders = async () => {
    setSendingReminders(true);
    setReminderResult(null);

    try {
      const res = await fetch('/api/reminders/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_type: 'vaccine' })
      });

      const data = await res.json();

      if (res.ok) {
        setReminderResult({
          success: true,
          message: data.message || 'Recordatorios de vacunas enviados correctamente'
        });
      } else {
        setReminderResult({
          success: false,
          message: data.error || 'Error al enviar recordatorios'
        });
      }
    } catch {
      setReminderResult({
        success: false,
        message: 'Error de conexión al enviar recordatorios'
      });
    } finally {
      setSendingReminders(false);
      // Clear result after 5 seconds
      setTimeout(() => setReminderResult(null), 5000);
    }
  };

  return (
    <div className="bg-[var(--bg-paper)] rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Syringe className="w-5 h-5 text-[var(--text-secondary)]" />
          <h3 className="font-semibold text-[var(--text-primary)]">Vacunas Próximas</h3>
        </div>
        <Link
          href={`/${clinic}/dashboard/vaccines`}
          className="text-sm text-[var(--primary)] hover:text-[var(--primary-dark)] flex items-center gap-1"
        >
          Ver todas
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {vaccines.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-secondary)]">
          <Syringe className="w-12 h-12 mx-auto mb-2 text-[var(--border,#e5e7eb)]" />
          <p>No hay vacunas pendientes en los próximos 14 días</p>
        </div>
      ) : (
        <div className="space-y-1">
          {/* Overdue section */}
          {overdue.length > 0 && (
            <>
              <div className="text-xs font-medium text-[var(--status-error,#ef4444)] uppercase tracking-wide py-2">
                Vencidas ({overdue.length})
              </div>
              {overdue.slice(0, 3).map((vaccine, i) => (
                <VaccineItem
                  key={`overdue-${i}`}
                  vaccine={vaccine}
                  clinic={clinic}
                  formatDate={formatDate}
                  getDaysLabel={getDaysLabel}
                />
              ))}
            </>
          )}

          {/* Upcoming section */}
          {upcoming.length > 0 && (
            <>
              <div className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide py-2 mt-2">
                Próximas ({upcoming.length})
              </div>
              {upcoming.slice(0, 5).map((vaccine, i) => (
                <VaccineItem
                  key={`upcoming-${i}`}
                  vaccine={vaccine}
                  clinic={clinic}
                  formatDate={formatDate}
                  getDaysLabel={getDaysLabel}
                />
              ))}
            </>
          )}
        </div>
      )}

      {/* Quick action */}
      {vaccines.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--border-light,#f3f4f6)] space-y-2">
          <button
            className="w-full flex items-center justify-center gap-2 py-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg hover:bg-[var(--primary)]/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSendReminders}
            disabled={sendingReminders}
          >
            {sendingReminders ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                Enviar recordatorios
              </>
            )}
          </button>

          {/* Result feedback */}
          {reminderResult && (
            <div className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
              reminderResult.success
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {reminderResult.success ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="truncate">{reminderResult.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VaccineItem({
  vaccine,
  clinic,
  formatDate,
  getDaysLabel
}: {
  vaccine: VaccineReminder;
  clinic: string;
  formatDate: (date: string) => string;
  getDaysLabel: (days: number, isOverdue: boolean) => string;
}) {
  return (
    <Link
      href={`/${clinic}/portal/pets/${vaccine.pet_id}`}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors group"
    >
      <div className="relative">
        {vaccine.pet_photo ? (
          <img
            src={vaccine.pet_photo}
            alt={vaccine.pet_name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-secondary)] text-sm font-medium">
            {vaccine.pet_name.charAt(0)}
          </div>
        )}
        {vaccine.is_overdue && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--status-error,#ef4444)] rounded-full flex items-center justify-center">
            <span className="text-white text-xs">!</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--text-primary)] text-sm truncate">
          {vaccine.pet_name}
        </p>
        <p className="text-xs text-[var(--text-secondary)] truncate">
          {vaccine.vaccine_name} • {vaccine.owner_name}
        </p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-medium ${
          vaccine.is_overdue ? 'text-[var(--status-error,#ef4444)]' : vaccine.days_until <= 3 ? 'text-[var(--status-warning,#f59e0b)]' : 'text-[var(--text-secondary)]'
        }`}>
          {formatDate(vaccine.due_date)}
        </p>
        <p className={`text-xs ${
          vaccine.is_overdue ? 'text-[var(--status-error,#ef4444)]' : 'text-[var(--text-muted)]'
        }`}>
          {getDaysLabel(vaccine.days_until, vaccine.is_overdue)}
        </p>
      </div>
    </Link>
  );
}
