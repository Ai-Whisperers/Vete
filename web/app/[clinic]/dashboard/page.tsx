import { getClinicData } from "@/lib/clinics";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Calendar,
  PawPrint,
  Syringe,
  FileText,
  Bed,
  FlaskConical,
  TrendingUp,
  Clock,
  AlertTriangle,
  Plus,
  ChevronRight,
  CalendarClock,
} from "lucide-react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TodayScheduleWidget } from "@/components/dashboard/today-schedule-widget";
import { UpcomingVaccines } from "@/components/dashboard/upcoming-vaccines";
import { LostFoundWidget } from "@/components/safety/lost-found-widget";

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

export default async function ClinicalDashboardPage({ params }: Props): Promise<React.ReactElement> {
  const { clinic } = await params;
  const clinicData = await getClinicData(clinic);

  if (!clinicData) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${clinic}/portal/login`);
  }

  // Check staff role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, tenant_id, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || !["vet", "admin"].includes(profile.role)) {
    redirect(`/${clinic}/portal/dashboard`);
  }

  const isAdmin = profile.role === "admin";

  // Fetch today's appointments
  const today = new Date().toISOString().split("T")[0];
  const { data: todayData } = await supabase
    .from("appointments")
    .select(`
      id,
      start_time,
      end_time,
      status,
      reason,
      pets (
        id,
        name,
        species,
        photo_url,
        owner:profiles!pets_owner_id_fkey (
          id,
          full_name,
          phone
        )
      )
    `)
    .eq("tenant_id", clinic)
    .gte("start_time", `${today}T00:00:00`)
    .lt("start_time", `${today}T23:59:59`)
    .order("start_time", { ascending: true });

  // Transform pets data
  const todayAppointments: TodayAppointment[] = (todayData || []).map((apt) => {
    const pets = Array.isArray(apt.pets) ? apt.pets[0] : apt.pets;
    const owner = pets?.owner ? (Array.isArray(pets.owner) ? pets.owner[0] : pets.owner) : undefined;
    return {
      ...apt,
      pets: pets ? { ...pets, owner } : null,
    };
  });

  // Quick stats for hospitalization and lab
  const { count: hospitalizedCount } = await supabase
    .from("hospitalizations")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", clinic)
    .eq("status", "admitted");

  const { count: pendingLabCount } = await supabase
    .from("lab_orders")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", clinic)
    .in("status", ["pending", "in_progress"]);

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

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${clinic}/dashboard/appointments/new`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva Cita
          </Link>
          <Link
            href={`/${clinic}/dashboard/patients`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-subtle)] transition-colors text-sm font-medium shadow-sm"
          >
            <Users className="w-4 h-4" />
            Pacientes
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards clinic={clinic} />

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Link
          href={`/${clinic}/dashboard/appointments`}
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
        >
          <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-500 transition-colors">
            <Calendar className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
          </div>
          <span className="text-sm font-medium text-[var(--text-primary)]">Citas</span>
        </Link>

        <Link
          href={`/${clinic}/dashboard/clients`}
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-300 transition-all group"
        >
          <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-500 transition-colors">
            <PawPrint className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
          </div>
          <span className="text-sm font-medium text-[var(--text-primary)]">Clientes</span>
        </Link>

        <Link
          href={`/${clinic}/dashboard/vaccines`}
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-300 transition-all group"
        >
          <div className="p-3 bg-amber-100 rounded-xl group-hover:bg-amber-500 transition-colors">
            <Syringe className="w-5 h-5 text-amber-600 group-hover:text-white transition-colors" />
          </div>
          <span className="text-sm font-medium text-[var(--text-primary)]">Vacunas</span>
        </Link>

        <Link
          href={`/${clinic}/dashboard/invoices`}
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-300 transition-all group"
        >
          <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-500 transition-colors">
            <FileText className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
          </div>
          <span className="text-sm font-medium text-[var(--text-primary)]">Facturas</span>
        </Link>

        <Link
          href={`/${clinic}/dashboard/hospital`}
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-red-300 transition-all group relative"
        >
          <div className="p-3 bg-red-100 rounded-xl group-hover:bg-red-500 transition-colors">
            <Bed className="w-5 h-5 text-red-600 group-hover:text-white transition-colors" />
          </div>
          <span className="text-sm font-medium text-[var(--text-primary)]">Hospital</span>
          {(hospitalizedCount ?? 0) > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {hospitalizedCount}
            </span>
          )}
        </Link>

        <Link
          href={`/${clinic}/dashboard/lab`}
          className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all group relative"
        >
          <div className="p-3 bg-cyan-100 rounded-xl group-hover:bg-cyan-500 transition-colors">
            <FlaskConical className="w-5 h-5 text-cyan-600 group-hover:text-white transition-colors" />
          </div>
          <span className="text-sm font-medium text-[var(--text-primary)]">Lab</span>
          {(pendingLabCount ?? 0) > 0 && (
            <span className="absolute top-2 right-2 bg-cyan-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {pendingLabCount}
            </span>
          )}
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
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
