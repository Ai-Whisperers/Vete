"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  CalendarClock,
  Users,
  FileText,
  Bed,
  FlaskConical,
  Syringe,
  Shield,
  FileSignature,
  MessageSquare,
  Package,
  Settings,
  ChevronDown,
  ChevronLeft,
  Search,
  Command,
  ArrowLeft,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: number;
  adminOnly?: boolean;
}

interface NavSection {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
  defaultOpen?: boolean;
  adminOnly?: boolean;
}

interface DashboardSidebarProps {
  clinic: string;
  clinicName: string;
  isAdmin?: boolean;
  onOpenCommandPalette?: () => void;
}

export function DashboardSidebar({
  clinic,
  clinicName,
  isAdmin = false,
  onOpenCommandPalette
}: DashboardSidebarProps): React.ReactElement {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Navigation sections with admin-only flags
  const allSections: NavSection[] = useMemo(() => [
    {
      title: "Agenda",
      icon: Calendar,
      defaultOpen: true,
      items: [
        { icon: LayoutDashboard, label: "Dashboard", href: `/${clinic}/dashboard` },
        { icon: CalendarClock, label: "Calendario", href: `/${clinic}/dashboard/calendar` },
        { icon: Calendar, label: "Citas Hoy", href: `/${clinic}/dashboard/appointments` },
        { icon: Syringe, label: "Vacunas", href: `/${clinic}/dashboard/vaccines` },
        { icon: Bed, label: "Hospital", href: `/${clinic}/dashboard/hospital` },
        { icon: FlaskConical, label: "Laboratorio", href: `/${clinic}/dashboard/lab` },
      ],
    },
    {
      title: "Clientes",
      icon: Users,
      defaultOpen: true,
      items: [
        { icon: Users, label: "Directorio", href: `/${clinic}/dashboard/clients` },
        { icon: MessageSquare, label: "Mensajes", href: `/${clinic}/dashboard/whatsapp` },
        { icon: FileSignature, label: "Consentimientos", href: `/${clinic}/dashboard/consents` },
      ],
    },
    {
      title: "Finanzas",
      icon: FileText,
      defaultOpen: false,
      items: [
        { icon: BarChart3, label: "Analytics", href: `/${clinic}/dashboard/analytics` },
        { icon: FileText, label: "Facturas", href: `/${clinic}/dashboard/invoices` },
        { icon: Package, label: "Inventario", href: `/${clinic}/dashboard/inventory` },
        { icon: Shield, label: "Seguros", href: `/${clinic}/dashboard/insurance` },
      ],
    },
    {
      title: "Administración",
      icon: Settings,
      defaultOpen: false,
      adminOnly: true, // Entire section is admin-only
      items: [
        { icon: Settings, label: "Ajustes", href: `/${clinic}/dashboard/settings`, adminOnly: true },
        { icon: Users, label: "Equipo", href: `/${clinic}/dashboard/team`, adminOnly: true },
        { icon: CalendarClock, label: "Horarios", href: `/${clinic}/dashboard/schedules`, adminOnly: true },
        { icon: Calendar, label: "Ausencias", href: `/${clinic}/dashboard/time-off`, adminOnly: true },
        { icon: Settings, label: "Auditoría", href: `/${clinic}/dashboard/audit`, adminOnly: true },
      ],
    },
  ], [clinic]);

  // Filter sections based on admin status
  const sections = useMemo(() => {
    return allSections
      .filter(section => !section.adminOnly || isAdmin)
      .map(section => ({
        ...section,
        items: section.items.filter(item => !item.adminOnly || isAdmin)
      }))
      .filter(section => section.items.length > 0);
  }, [allSections, isAdmin]);

  // Initialize open sections based on current path
  useEffect(() => {
    const initialOpen: Record<string, boolean> = {};
    sections.forEach((section) => {
      const isCurrentSection = section.items.some(
        (item) => pathname === item.href || pathname.startsWith(item.href + "/")
      );
      initialOpen[section.title] = section.defaultOpen || isCurrentSection;
    });
    setOpenSections(initialOpen);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, sections]);

  // Check if a nav item is active
  // Dashboard link requires exact match to avoid highlighting when on sub-pages
  const isActive = (href: string): boolean => {
    const isDashboardLink = href.endsWith('/dashboard');
    if (isDashboardLink) {
      return pathname === href; // Exact match only for dashboard
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const toggleSection = (title: string): void => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const renderSection = (section: NavSection): React.ReactElement => {
    const isOpen = openSections[section.title] ?? section.defaultOpen ?? false;
    const hasActiveItem = section.items.some((item) => isActive(item.href));
    const SectionIcon = section.icon;

    return (
      <div key={section.title} className="mb-1">
        <button
          onClick={() => toggleSection(section.title)}
          className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold transition-colors rounded-xl ${
            hasActiveItem
              ? "text-[var(--primary)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
          }`}
        >
          <div className="flex items-center gap-2">
            <SectionIcon className={`w-4 h-4 ${isCollapsed ? "" : ""}`} />
            <span className={isCollapsed ? "hidden" : ""}>{section.title}</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""} ${
              isCollapsed ? "hidden" : ""
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {isOpen && !isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-0.5 ml-3 pl-3 border-l-2 border-[var(--border-light)]">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        active
                          ? "bg-[var(--primary)] text-white font-medium shadow-sm ring-2 ring-[var(--primary)] ring-offset-1"
                          : "text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && item.badge > 0 && (
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                          active ? "bg-white/20" : "bg-[var(--status-error-bg)] text-[var(--status-error)]"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <aside
      className={`hidden lg:flex flex-col bg-[var(--bg-paper)] border-r border-[var(--border-light)] h-screen sticky top-0 transition-all duration-200 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-light)]">
        <Link
          href={`/${clinic}/portal/dashboard`}
          className="flex items-center gap-2 text-[var(--primary)] font-bold hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className={isCollapsed ? "hidden" : ""}>Portal</span>
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] transition-colors"
          title={isCollapsed ? "Expandir" : "Colapsar"}
          aria-label={isCollapsed ? "Expandir menu lateral" : "Colapsar menu lateral"}
          aria-expanded={!isCollapsed}
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Clinic Name & Search */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-[var(--border-light)] space-y-3">
          <div>
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Clínica</p>
            <p className="font-bold text-[var(--text-primary)] truncate">{clinicName}</p>
          </div>

          {/* Command Palette Trigger */}
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle)]/80 rounded-xl transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="flex-1 text-left">Buscar...</span>
              <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium bg-[var(--bg-paper)] rounded border border-[var(--border-light)] shadow-sm">
                <Command className="w-3 h-3" />K
              </kbd>
            </button>
          )}
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map(renderSection)}
      </div>

      {/* Footer - Clinical Tools Quick Access */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-t border-[var(--border-light)]">
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Herramientas
          </p>
          <div className="flex flex-wrap gap-1">
            <Link
              href={`/${clinic}/drug_dosages`}
              className="px-2 py-1 text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle)]/80 rounded-lg transition-colors"
              title="Calculadora de dosis"
            >
              Dosis
            </Link>
            <Link
              href={`/${clinic}/diagnosis_codes`}
              className="px-2 py-1 text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle)]/80 rounded-lg transition-colors"
              title="Códigos diagnóstico"
            >
              Diagnóstico
            </Link>
            <Link
              href={`/${clinic}/growth_charts`}
              className="px-2 py-1 text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle)]/80 rounded-lg transition-colors"
              title="Curvas de crecimiento"
            >
              Crecimiento
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
