"use client";

import { useState, useEffect } from "react";
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
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: number;
}

interface NavSection {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
  defaultOpen?: boolean;
}

interface DashboardSidebarProps {
  clinic: string;
  clinicName: string;
  onOpenCommandPalette?: () => void;
}

export function DashboardSidebar({
  clinic,
  clinicName,
  onOpenCommandPalette
}: DashboardSidebarProps): React.ReactElement {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Reorganized into 5 main sections
  const sections: NavSection[] = [
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
        { icon: FileText, label: "Facturas", href: `/${clinic}/dashboard/invoices` },
        { icon: Package, label: "Inventario", href: `/${clinic}/dashboard/inventory` },
        { icon: Shield, label: "Seguros", href: `/${clinic}/dashboard/insurance` },
      ],
    },
    {
      title: "Configuración",
      icon: Settings,
      defaultOpen: false,
      items: [
        { icon: Users, label: "Equipo", href: `/${clinic}/dashboard/team` },
        { icon: CalendarClock, label: "Horarios", href: `/${clinic}/dashboard/schedules` },
        { icon: Calendar, label: "Ausencias", href: `/${clinic}/dashboard/time-off` },
        { icon: Settings, label: "Auditoría", href: `/${clinic}/dashboard/audit` },
      ],
    },
  ];

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
  }, [pathname]);

  const isActive = (href: string): boolean => pathname === href || pathname.startsWith(href + "/");

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
              ? "text-[var(--primary)] bg-[var(--primary)]/10"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
              <div className="mt-1 space-y-0.5 ml-3 pl-3 border-l-2 border-gray-100">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        active
                          ? "bg-[var(--primary)] text-white font-medium"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && item.badge > 0 && (
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                          active ? "bg-white/20" : "bg-red-100 text-red-600"
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
      className={`hidden lg:flex flex-col bg-white border-r border-gray-200 h-screen sticky top-0 transition-all duration-200 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
        <Link
          href={`/${clinic}/portal/dashboard`}
          className="flex items-center gap-2 text-[var(--primary)] font-bold hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className={isCollapsed ? "hidden" : ""}>Portal</span>
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          title={isCollapsed ? "Expandir" : "Colapsar"}
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Clinic Name & Search */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-gray-100 space-y-3">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Clínica</p>
            <p className="font-bold text-gray-800 truncate">{clinicName}</p>
          </div>

          {/* Command Palette Trigger */}
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="flex-1 text-left">Buscar...</span>
              <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium bg-white rounded border shadow-sm">
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
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Herramientas
          </p>
          <div className="flex flex-wrap gap-1">
            <Link
              href={`/${clinic}/drug_dosages`}
              className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              title="Calculadora de dosis"
            >
              Dosis
            </Link>
            <Link
              href={`/${clinic}/diagnosis_codes`}
              className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              title="Códigos diagnóstico"
            >
              Diagnóstico
            </Link>
            <Link
              href={`/${clinic}/growth_charts`}
              className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
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
