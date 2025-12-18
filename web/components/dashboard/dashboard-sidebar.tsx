"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  CalendarClock,
  CalendarPlus,
  Users,
  UserPlus,
  FileText,
  FilePlus,
  Bed,
  FlaskConical,
  FlaskConicalOff,
  Shield,
  FileCheck,
  FileSignature,
  MessageSquare,
  LayoutTemplate,
  Stethoscope,
  Pill,
  LineChart,
  Syringe,
  Heart,
  Baby,
  ChevronDown,
  ChevronLeft,
  Menu,
  X,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

interface DashboardSidebarProps {
  clinic: string;
  clinicName: string;
}

export function DashboardSidebar({ clinic, clinicName }: DashboardSidebarProps): React.ReactElement {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Define all navigation sections
  const sections: NavSection[] = [
    {
      title: "Principal",
      defaultOpen: true,
      items: [
        { icon: LayoutDashboard, label: "Dashboard", href: `/${clinic}/dashboard` },
        { icon: Calendar, label: "Citas Hoy", href: `/${clinic}/dashboard/appointments` },
        { icon: CalendarPlus, label: "Nueva Cita", href: `/${clinic}/dashboard/appointments/new` },
        { icon: CalendarClock, label: "Calendario", href: `/${clinic}/dashboard/calendar` },
        { icon: Syringe, label: "Control Vacunas", href: `/${clinic}/dashboard/vaccines` },
      ],
    },
    {
      title: "Clientes",
      defaultOpen: true,
      items: [
        { icon: Users, label: "Clientes", href: `/${clinic}/dashboard/clients` },
        { icon: UserPlus, label: "Invitar Cliente", href: `/${clinic}/dashboard/clients/invite` },
      ],
    },
    {
      title: "Facturación",
      items: [
        { icon: FileText, label: "Facturas", href: `/${clinic}/dashboard/invoices` },
        { icon: FilePlus, label: "Nueva Factura", href: `/${clinic}/dashboard/invoices/new` },
      ],
    },
    {
      title: "Hospitalización",
      items: [
        { icon: Bed, label: "Pacientes", href: `/${clinic}/dashboard/hospital` },
      ],
    },
    {
      title: "Laboratorio",
      items: [
        { icon: FlaskConical, label: "Órdenes Lab", href: `/${clinic}/dashboard/lab` },
        { icon: FlaskConicalOff, label: "Nueva Orden", href: `/${clinic}/dashboard/lab/new` },
      ],
    },
    {
      title: "Seguros",
      items: [
        { icon: Shield, label: "Seguros", href: `/${clinic}/dashboard/insurance` },
        { icon: FileCheck, label: "Pólizas", href: `/${clinic}/dashboard/insurance/policies` },
      ],
    },
    {
      title: "Consentimientos",
      items: [
        { icon: FileSignature, label: "Consentimientos", href: `/${clinic}/dashboard/consents` },
        { icon: LayoutTemplate, label: "Plantillas", href: `/${clinic}/dashboard/consents/templates` },
      ],
    },
    {
      title: "Comunicaciones",
      items: [
        { icon: MessageSquare, label: "WhatsApp", href: `/${clinic}/dashboard/whatsapp` },
        { icon: LayoutTemplate, label: "Plantillas WA", href: `/${clinic}/dashboard/whatsapp/templates` },
      ],
    },
    {
      title: "Horarios",
      items: [
        { icon: CalendarClock, label: "Horarios Staff", href: `/${clinic}/dashboard/schedules` },
        { icon: Calendar, label: "Ausencias", href: `/${clinic}/dashboard/time-off` },
      ],
    },
    {
      title: "Herramientas Clínicas",
      items: [
        { icon: Stethoscope, label: "Códigos Diagnóstico", href: `/${clinic}/diagnosis_codes` },
        { icon: Pill, label: "Dosis Fármacos", href: `/${clinic}/drug_dosages` },
        { icon: LineChart, label: "Curvas Crecimiento", href: `/${clinic}/growth_charts` },
        { icon: Syringe, label: "Reacciones Vacunas", href: `/${clinic}/vaccine_reactions` },
        { icon: Heart, label: "Calidad de Vida", href: `/${clinic}/euthanasia_assessments` },
        { icon: Baby, label: "Ciclos Reproductivos", href: `/${clinic}/reproductive_cycles` },
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
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

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

    return (
      <div key={section.title} className="mb-2">
        <button
          onClick={() => toggleSection(section.title)}
          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded-lg ${
            hasActiveItem
              ? "text-[var(--primary)] bg-[var(--primary)]/5"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span className={isCollapsed ? "hidden" : ""}>{section.title}</span>
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
              <div className="mt-1 space-y-1 pl-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "bg-[var(--primary)] text-white"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
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

  const sidebarContent = (
    <>
      {/* Sidebar Header */}
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
          className="hidden lg:flex p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          title={isCollapsed ? "Expandir" : "Colapsar"}
        >
          <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Clinic Name */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dashboard Clínico</p>
          <p className="font-bold text-gray-800 truncate">{clinicName}</p>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map(renderSection)}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-xl flex items-center justify-center hover:opacity-90 transition-opacity"
        aria-label="Abrir menú"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-72 bg-white z-50 lg:hidden flex flex-col shadow-xl"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                <span className="font-bold text-gray-800">Menú Dashboard</span>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-4">
                {sections.map(renderSection)}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-gray-200 h-screen sticky top-0 transition-all duration-200 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
