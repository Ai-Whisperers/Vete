import { getClinicData } from "@/lib/clinics";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import Link from "next/link";
import {
  Users,
  FileText,
  Plus,
  ChevronRight,
  CalendarClock,
  Clock,
  Settings,
} from "lucide-react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TodayScheduleWidget } from "@/components/dashboard/today-schedule-widget";
import { UpcomingVaccines } from "@/components/dashboard/upcoming-vaccines";
import { LostFoundWidget } from "@/components/safety/lost-found-widget";
import { WaitingRoomWrapper as WaitingRoom } from "@/components/dashboard/waiting-room";
import { TodayFocus } from "@/components/dashboard/today-focus";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { RevenueWidget } from "@/components/dashboard/revenue-widget";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { QuickSearch } from "@/components/dashboard/quick-search";
import { getTodayAppointmentsForClinic } from "@/lib/appointments";

interface Props {
  params: Promise<{ clinic: string }>;
}

export async function generateStaticParams(): Promise<Array<{ clinic: string }>> {
  return [{ clinic: "adris" }, { clinic: "petlife" }];
}

export default async function ClinicalDashboardPage({ params }: Props): Promise<React.ReactElement> {
  const { clinic } = await params;

  // SEC-006: Require staff authentication with tenant verification
  const { profile, isAdmin } = await requireStaff(clinic);

  const clinicData = await getClinicData(clinic);

  if (!clinicData) {
    notFound();
  }

  const todayAppointments = await getTodayAppointmentsForClinic(clinic);

  // Get greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos d\u00edas" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  const firstName = profile.full_name?.split(" ")[0] || "Doctor";

  return (
    <div className="section-gap pb-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Top Row: Greeting + Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
              {greeting}, {firstName}
            </h1>
            <p className="text-[var(--text-secondary)] flex items-center gap-2 mt-1">
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
              href={`/${clinic}/dashboard/appointments?action=new`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-all text-sm font-semibold shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Nueva Cita
            </Link>
            <Link
              href={`/${clinic}/dashboard/invoices?action=new`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-[var(--text-primary)] border border-[var(--border)] rounded-xl hover:bg-[var(--bg-subtle)] transition-colors text-sm font-semibold shadow-sm"
            >
              <FileText className="w-4 h-4" />
              Facturar
            </Link>
            <Link
              href={`/${clinic}/dashboard/clients?action=new-client`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-[var(--text-primary)] border border-[var(--border)] rounded-xl hover:bg-[var(--bg-subtle)] transition-colors text-sm font-semibold shadow-sm"
            >
              <Users className="w-4 h-4" />
              Cliente
            </Link>
          </div>
        </div>

        {/* Quick Search Bar */}
        <div className="max-w-2xl">
          <QuickSearch clinic={clinic} />
        </div>
      </div>

      {/* Stats Cards - Enhanced with gradients and click navigation */}
      <StatsCards clinic={clinic} />

      {/* Main Content Grid - Redesigned Layout */}
      <div className="content-grid">
        {/* Left Column - Primary Content (8 cols on lg) */}
        <div className="content-main">
          {/* Today's Focus - Urgent items requiring attention */}
          <TodayFocus clinic={clinic} />

          {/* Waiting Room - Interactive Queue */}
          <WaitingRoom clinic={clinic} />

          {/* Today's Full Schedule */}
          <TodayScheduleWidget appointments={todayAppointments} clinic={clinic} />
        </div>

        {/* Right Column - Secondary Content (4 cols on lg) */}
        <div className="content-sidebar">
          {/* Admin-only: Revenue Widget */}
          {isAdmin && <RevenueWidget clinic={clinic} />}

          {/* Alerts Panel - Consolidated alerts */}
          <AlertsPanel clinic={clinic} />

          {/* Activity Feed - Recent activities */}
          <ActivityFeed clinic={clinic} maxItems={6} />

          {/* Upcoming Vaccines */}
          <UpcomingVaccines clinic={clinic} />

          {/* Lost & Found Widget */}
          <LostFoundWidget />

          {/* Quick Links */}
          <div className="card-base overflow-hidden">
            <div className="card-header">
              <Clock className="w-5 h-5 text-[var(--primary)]" />
              <h3 className="card-header-title">Accesos Rápidos</h3>
            </div>
            <div className="card-body-sm space-y-1">
              <QuickLinkItem
                href={`/${clinic}/dashboard/calendar`}
                label="Calendario Completo"
              />
              <QuickLinkItem
                href={`/${clinic}/dashboard/patients`}
                label="Todos los Pacientes"
              />
              <QuickLinkItem
                href={`/${clinic}/dashboard/consents`}
                label="Consentimientos"
              />
              <QuickLinkItem
                href={`/${clinic}/dashboard/whatsapp`}
                label="WhatsApp"
              />
              {isAdmin && (
                <>
                  <QuickLinkItem
                    href={`/${clinic}/dashboard/schedules`}
                    label="Horarios del Equipo"
                  />
                  <QuickLinkItem
                    href={`/${clinic}/dashboard/settings`}
                    label="Configuraci\u00f3n"
                    icon={<Settings className="w-4 h-4" />}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Link Item Component
function QuickLinkItem({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link href={href} className="list-item justify-between group">
      <div className="flex items-center gap-2">
        {icon && <span className="text-[var(--text-muted)]">{icon}</span>}
        <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
          {label}
        </span>
      </div>
      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}
