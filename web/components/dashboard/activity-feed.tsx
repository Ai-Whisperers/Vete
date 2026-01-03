"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  PawPrint,
  Calendar,
  Syringe,
  Receipt,
  UserPlus,
  Clock,
  Activity,
  RefreshCw,
} from 'lucide-react';

type ActivityType =
  | 'appointment_completed'
  | 'appointment_scheduled'
  | 'pet_registered'
  | 'vaccine_administered'
  | 'invoice_paid'
  | 'client_registered';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  href?: string;
  actor?: string;
  meta?: Record<string, any>;
}

interface ActivityFeedProps {
  clinic: string;
  maxItems?: number;
}

const activityConfig: Record<ActivityType, { icon: any; color: string; bgColor: string }> = {
  appointment_completed: {
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  appointment_scheduled: {
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  pet_registered: {
    icon: PawPrint,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  vaccine_administered: {
    icon: Syringe,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  invoice_paid: {
    icon: Receipt,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  client_registered: {
    icon: UserPlus,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
};

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSeconds < 60) return 'hace un momento';
  if (diffSeconds < 3600) return `hace ${Math.floor(diffSeconds / 60)} min`;
  if (diffSeconds < 86400) return `hace ${Math.floor(diffSeconds / 3600)} h`;
  if (diffSeconds < 172800) return 'ayer';
  return date.toLocaleDateString('es-PY', { day: 'numeric', month: 'short' });
}

function ActivityItemRow({ item }: { item: ActivityItem }) {
  const config = activityConfig[item.type];
  const Icon = config.icon;

  const content = (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
      <div className={`p-2 rounded-lg ${config.bgColor} ${config.color} flex-shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
          <span className="font-medium">{item.title}</span>
          {item.description && (
            <span className="text-gray-500"> - {item.description}</span>
          )}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(item.timestamp)}
          </span>
          {item.actor && (
            <span className="text-xs text-gray-400">
              por {item.actor}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (item.href) {
    return <Link href={item.href}>{content}</Link>;
  }
  return content;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse flex items-start gap-3 p-3">
          <div className="w-8 h-8 bg-gray-200 rounded-lg flex-shrink-0" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Activity className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-sm text-gray-500">Sin actividad reciente</p>
    </div>
  );
}

export function ActivityFeed({ clinic, maxItems = 8 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivities = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Fetch recent activities from multiple sources
      const [appointmentsRes, petsRes] = await Promise.all([
        fetch(`/api/dashboard/today-appointments?clinic=${clinic}`),
        fetch(`/api/pets?clinic=${clinic}&limit=5&sort=created_at`),
      ]);

      const activityItems: ActivityItem[] = [];

      // Process completed appointments
      if (appointmentsRes.ok) {
        const data = await appointmentsRes.json();
        const appointments = data.appointments || [];

        appointments
          .filter((apt: any) => apt.status === 'completed')
          .slice(0, 4)
          .forEach((apt: any) => {
            activityItems.push({
              id: `apt-${apt.id}`,
              type: 'appointment_completed',
              title: apt.pet_name || 'Cita completada',
              description: apt.service_name || 'Consulta',
              timestamp: apt.updated_at || apt.end_time || apt.start_time,
              href: `/${clinic}/dashboard/appointments/${apt.id}`,
              actor: apt.vet_name,
            });
          });

        // Scheduled appointments
        appointments
          .filter((apt: any) => apt.status === 'scheduled' || apt.status === 'confirmed')
          .slice(0, 3)
          .forEach((apt: any) => {
            activityItems.push({
              id: `apt-scheduled-${apt.id}`,
              type: 'appointment_scheduled',
              title: apt.pet_name || 'Nueva cita',
              description: formatTime(apt.start_time),
              timestamp: apt.created_at || apt.start_time,
              href: `/${clinic}/dashboard/appointments/${apt.id}`,
            });
          });
      }

      // Process recently registered pets
      if (petsRes.ok) {
        const data = await petsRes.json();
        const pets = data.data || data.pets || [];

        pets.slice(0, 3).forEach((pet: any) => {
          activityItems.push({
            id: `pet-${pet.id}`,
            type: 'pet_registered',
            title: pet.name,
            description: `${pet.species === 'dog' ? 'Perro' : 'Gato'} ${pet.breed || 'mestizo'}`,
            timestamp: pet.created_at,
            href: `/${clinic}/dashboard/patients/${pet.id}`,
          });
        });
      }

      // Sort by timestamp (most recent first)
      activityItems.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(activityItems.slice(0, maxItems));
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    // Refresh every 30 seconds
    const interval = setInterval(() => fetchActivities(true), 30 * 1000);
    return () => clearInterval(interval);
  }, [clinic, maxItems]);

  return (
    <div className="bg-[var(--bg-paper)] rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
            <Activity className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)]">Actividad Reciente</h3>
            <p className="text-xs text-gray-500">Actualizaciones en tiempo real</p>
          </div>
        </div>
        <button
          onClick={() => fetchActivities(true)}
          disabled={refreshing}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="Actualizar"
        >
          <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-2">
            <LoadingSkeleton />
          </div>
        ) : activities.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-gray-50">
            {activities.map(activity => (
              <ActivityItemRow key={activity.id} item={activity} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {activities.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <Link
            href={`/${clinic}/dashboard/activity`}
            className="text-sm text-[var(--primary)] hover:underline font-medium"
          >
            Ver toda la actividad
          </Link>
        </div>
      )}
    </div>
  );
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' });
}
