"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Clock,
  Syringe,
  CalendarCheck,
  ChevronRight,
  Bell,
  AlertCircle,
  CheckCircle2,
  Activity,
} from 'lucide-react';

interface FocusItem {
  id: string;
  type: 'urgent' | 'reminder' | 'followup' | 'vaccine';
  title: string;
  description: string;
  time?: string;
  petName?: string;
  ownerName?: string;
  href: string;
  priority: 'high' | 'medium' | 'low';
}

interface TodayFocusProps {
  clinic: string;
}

interface VaccineRecord {
  pet_id: string;
  pet_name?: string;
  owner_name?: string;
  vaccine_name: string;
  due_date: string;
  is_overdue: boolean;
}

interface AppointmentRecord {
  id: string;
  status: string;
  start_time: string;
  pet?: { name: string; owner?: { full_name: string } };
  pet_name?: string;
  owner_name?: string;
  service?: { name: string };
  service_name?: string;
}

const priorityColors = {
  high: 'border-l-[var(--status-error)] bg-[var(--status-error-bg)]/50',
  medium: 'border-l-[var(--status-warning)] bg-[var(--status-warning-bg)]/50',
  low: 'border-l-[var(--status-info)] bg-[var(--status-info-bg)]/50',
};

const typeIcons = {
  urgent: AlertTriangle,
  reminder: Bell,
  followup: Activity,
  vaccine: Syringe,
};

const typeLabels = {
  urgent: 'Urgente',
  reminder: 'Recordatorio',
  followup: 'Seguimiento',
  vaccine: 'Vacuna',
};

function FocusItemCard({ item, clinic }: { item: FocusItem; clinic: string }) {
  const Icon = typeIcons[item.type];

  return (
    <Link
      href={item.href}
      className={`group flex items-start gap-3 p-3 rounded-xl border-l-4 hover:shadow-md transition-all duration-200 ${priorityColors[item.priority]}`}
    >
      <div className={`p-2 rounded-lg flex-shrink-0 ${
        item.priority === 'high' ? 'bg-[var(--status-error-bg)] text-[var(--status-error)]' :
        item.priority === 'medium' ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]' :
        'bg-[var(--status-info-bg)] text-[var(--status-info)]'
      }`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
            item.priority === 'high' ? 'bg-[var(--status-error-bg)] text-[var(--status-error)]' :
            item.priority === 'medium' ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]' :
            'bg-[var(--status-info-bg)] text-[var(--status-info)]'
          }`}>
            {typeLabels[item.type]}
          </span>
          {item.time && (
            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {item.time}
            </span>
          )}
        </div>
        <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--primary)] transition-colors">
          {item.title}
        </h4>
        <p className="text-xs text-[var(--text-muted)] truncate">{item.description}</p>
        {(item.petName || item.ownerName) && (
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {item.petName && <span className="font-medium">{item.petName}</span>}
            {item.petName && item.ownerName && ' - '}
            {item.ownerName}
          </p>
        )}
      </div>

      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all flex-shrink-0 self-center" />
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-12 h-12 rounded-full bg-[var(--status-success-bg)] flex items-center justify-center mb-3">
        <CheckCircle2 className="w-6 h-6 text-[var(--status-success)]" />
      </div>
      <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
        Todo al día
      </h4>
      <p className="text-xs text-[var(--text-muted)]">
        No hay elementos urgentes pendientes
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-subtle)]">
          <div className="w-8 h-8 bg-[var(--border-light)] rounded-lg" />
          <div className="flex-1">
            <div className="h-3 bg-[var(--border-light)] rounded w-20 mb-2" />
            <div className="h-4 bg-[var(--border-light)] rounded w-40 mb-1" />
            <div className="h-3 bg-[var(--border-light)] rounded w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TodayFocus({ clinic }: TodayFocusProps) {
  const [items, setItems] = useState<FocusItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFocusItems = async () => {
      try {
        // Fetch from multiple sources in parallel
        const [vaccinesRes, appointmentsRes] = await Promise.all([
          fetch(`/api/dashboard/vaccines?clinic=${clinic}&days=3`),
          fetch(`/api/dashboard/today-appointments?clinic=${clinic}`),
        ]);

        const focusItems: FocusItem[] = [];

        // Process overdue vaccines
        if (vaccinesRes.ok) {
          const vaccinesData = await vaccinesRes.json();
          // API returns array with is_overdue flag, filter for overdue ones
          const overdue: VaccineRecord[] = Array.isArray(vaccinesData)
            ? vaccinesData.filter((v: VaccineRecord) => v.is_overdue)
            : vaccinesData.overdue || [];
          overdue.slice(0, 3).forEach((v: VaccineRecord) => {
            focusItems.push({
              id: `vaccine-${v.pet_id}-${v.vaccine_name}`,
              type: 'vaccine',
              title: `Vacuna vencida: ${v.vaccine_name}`,
              description: `Venció ${formatDaysAgo(v.due_date)}`,
              petName: v.pet_name,
              ownerName: v.owner_name,
              href: `/${clinic}/dashboard/patients/${v.pet_id}`,
              priority: 'high',
            });
          });
        }

        // Process today's appointments that need attention
        if (appointmentsRes.ok) {
          const appointmentsData = await appointmentsRes.json();
          // API returns array directly or { appointments: [...] }
          const appointments: AppointmentRecord[] = Array.isArray(appointmentsData)
            ? appointmentsData
            : appointmentsData.appointments || [];

          // Find appointments that should have started but aren't in progress
          const now = new Date();
          appointments.forEach((apt: AppointmentRecord) => {
            const startTime = new Date(apt.start_time);
            const petName = apt.pet?.name || apt.pet_name;
            const ownerName = apt.pet?.owner?.full_name || apt.owner_name;
            const serviceName = apt.service?.name || apt.service_name || 'Consulta';

            if (apt.status === 'confirmed' && startTime < now) {
              focusItems.push({
                id: `apt-${apt.id}`,
                type: 'urgent',
                title: `Cita sin iniciar`,
                description: serviceName,
                time: formatTime(apt.start_time),
                petName,
                ownerName,
                href: `/${clinic}/dashboard/appointments/${apt.id}`,
                priority: 'high',
              });
            } else if (apt.status === 'scheduled') {
              // Upcoming scheduled appointments
              const minutesUntil = Math.floor((startTime.getTime() - now.getTime()) / 60000);
              if (minutesUntil <= 30 && minutesUntil > 0) {
                focusItems.push({
                  id: `apt-upcoming-${apt.id}`,
                  type: 'reminder',
                  title: `Próxima cita en ${minutesUntil} min`,
                  description: serviceName,
                  time: formatTime(apt.start_time),
                  petName,
                  href: `/${clinic}/dashboard/appointments/${apt.id}`,
                  priority: 'medium',
                });
              }
            }
          });
        }

        // Sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        focusItems.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        setItems(focusItems.slice(0, 5)); // Max 5 items
      } catch (error) {
        // Client-side error logging - only in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching focus items:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFocusItems();
    // Refresh every minute for real-time updates
    const interval = setInterval(fetchFocusItems, 60 * 1000);
    return () => clearInterval(interval);
  }, [clinic]);

  return (
    <div className="bg-[var(--bg-paper)] rounded-2xl shadow-sm border border-[var(--border-light)] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border-light)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
            <AlertCircle className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)]">Foco de Hoy</h3>
            <p className="text-xs text-[var(--text-muted)]">Elementos que requieren atención</p>
          </div>
        </div>
        {items.length > 0 && (
          <span className="px-2.5 py-1 bg-[var(--status-error-bg)] text-[var(--status-error)] text-xs font-bold rounded-full">
            {items.length}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <LoadingSkeleton />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <FocusItemCard key={item.id} item={item} clinic={clinic} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' });
}

function formatDaysAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'hoy';
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays} días`;
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} semanas`;
  return `hace ${Math.floor(diffDays / 30)} meses`;
}
