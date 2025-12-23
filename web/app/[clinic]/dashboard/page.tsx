import { getClinicData } from "@/lib/clinics";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import Link from "next/link";
import {
  Users,
  FileText,
  TrendingUp,
  Clock,
  Plus,
  ChevronRight,
  CalendarClock,
} from "lucide-react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TodayScheduleWidget } from "@/components/dashboard/today-schedule-widget";
import { UpcomingVaccines } from "@/components/dashboard/upcoming-vaccines";
import { LostFoundWidget } from "@/components/safety/lost-found-widget";
import { WaitingRoom } from "@/components/dashboard/waiting-room";

interface Props {
  params: Promise<{ clinic: string }>;
}

export async function generateStaticParams(): Promise<Array<{ clinic: string }>> {
  return [{ clinic: "adris" }, { clinic: "petlife" }];
}

interface TodayAppointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  reason: string;
  pets: {
    id: string;
    name: string;
    species: string;
    photo_url?: string | null;
    owner?: {
      id: string;
      full_name: string;
      phone?: string | null;
    };
  } | null;
}

async function getTodayAppointments(clinic: string): Promise<TodayAppointment[]> {
  // In a real app, you'd get the full URL from an env var
  const res = await fetch(`http://localhost:3000/api/dashboard/today-appointments?clinic=${clinic}`, {
    next: { revalidate: 60 }, // Revalidate every minute
  });

  if (!res.ok) {
    console.error('Failed to fetch today\'s appointments:', await res.text());
    return [];
  }

  const data = await res.json();

  // Transform pets data as before
  return (data || []).map((apt: any) => {
    const pets = Array.isArray(apt.pets) ? apt.pets[0] : apt.pets;
    const owner = pets?.owner ? (Array.isArray(pets.owner) ? pets.owner[0] : pets.owner) : undefined;
    return {
      ...apt,
      pets: pets ? { ...pets, owner } : null,
    };
  });
}

export default async function ClinicalDashboardPage({ params }: Props): Promise<React.ReactElement> {
  const { clinic } = await params;

  // SEC-006: Require staff authentication with tenant verification
  const { profile, isAdmin } = await requireStaff(clinic);

  const clinicData = await getClinicData(clinic);

  if (!clinicData) {
    notFound();
  }

  const todayAppointments = await getTodayAppointments(clinic);


  // Get greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
            {greeting}, {profile.full_name?.split(" ")[0] || "Doctor"}
          </h1>
          <p className="text-[var(--text-secondary)] flex items-center gap-2">
            <CalendarClock className="w-4 h-4" />
            {new Date().toLocaleDateString("es-PY", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Quick Actions - Using ?action= pattern for slide-overs */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${clinic}/dashboard/appointments?action=new`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva Cita
          </Link>
          <Link
            href={`/${clinic}/dashboard/invoices?action=new`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-subtle)] transition-colors text-sm font-medium shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Nueva Factura
          </Link>
          <Link
            href={`/${clinic}/dashboard/clients?action=new-client`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-subtle)] transition-colors text-sm font-medium shadow-sm"
          >
            <Users className="w-4 h-4" />
            Nuevo Cliente
          </Link>
        </div>
      </div>

      {/* Stats Cards - includes clickable navigation to each module */}
      <StatsCards clinic={clinic} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Waiting Room & Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Waiting Room - Interactive Queue */}
          <WaitingRoom clinic={clinic} />

          {/* Today's Full Schedule */}
          <TodayScheduleWidget appointments={todayAppointments} clinic={clinic} />

          {/* Admin-only: Quick Financial Overview */}
          {isAdmin && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
                  <h3 className="font-semibold text-[var(--text-primary)]">Resumen del Día</h3>
                </div>
                <Link
                  href={`/${clinic}/dashboard/invoices`}
                  className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
                >
                  Ver facturas
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 font-medium mb-1">Citas Completadas</p>
                  <p className="text-xl font-bold text-green-700">
                    {todayAppointments.filter((a) => a.status === "completed").length}
                  </p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium mb-1">En Espera</p>
                  <p className="text-xl font-bold text-blue-700">
                    {todayAppointments.filter((a) => ["pending", "confirmed", "checked_in"].includes(a.status)).length}
                  </p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-600 font-medium mb-1">En Consulta</p>
                  <p className="text-xl font-bold text-purple-700">
                    {todayAppointments.filter((a) => a.status === "in_progress").length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Vaccines & Alerts */}
        <div className="space-y-6">
          <UpcomingVaccines clinic={clinic} />
          <LostFoundWidget />

          {/* Quick Links */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--text-secondary)]" />
              Accesos Rápidos
            </h3>
            <div className="space-y-2">
              <Link
                href={`/${clinic}/dashboard/calendar`}
                className="flex items-center justify-between p-3 bg-[var(--bg-subtle)] rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-[var(--text-primary)]">Calendario Completo</span>
                <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
              </Link>
              <Link
                href={`/${clinic}/dashboard/consents`}
                className="flex items-center justify-between p-3 bg-[var(--bg-subtle)] rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-[var(--text-primary)]">Consentimientos</span>
                <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
              </Link>
              <Link
                href={`/${clinic}/dashboard/whatsapp`}
                className="flex items-center justify-between p-3 bg-[var(--bg-subtle)] rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-[var(--text-primary)]">WhatsApp</span>
                <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
              </Link>
              {isAdmin && (
                <Link
                  href={`/${clinic}/dashboard/schedules`}
                  className="flex items-center justify-between p-3 bg-[var(--bg-subtle)] rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium text-[var(--text-primary)]">Horarios del Equipo</span>
                  <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
