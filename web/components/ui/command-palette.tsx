"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Command,
  Calendar,
  Plus,
  Users,
  FileText,
  Syringe,
  FlaskConical,
  Bed,
  Calculator,
  Stethoscope,
  TrendingUp,
  Heart,
  Baby,
  PawPrint,
  Clock,
  AlertCircle,
  Settings,
  X,
  User,
  TestTube,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRecentItems, getRecentItemIcon, type RecentItem } from "@/hooks/use-recent-items";

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  category: "actions" | "navigation" | "tools" | "recent";
  keywords?: string[];
}

interface RecentPatient {
  id: string;
  name: string;
  species: string;
  ownerName: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps): React.ReactElement | null {
  const router = useRouter();
  const { clinic } = useParams() as { clinic: string };
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Get localStorage-based recent items
  const { items: localRecentItems } = useRecentItems(clinic || "");

  // Fetch recent patients from database
  useEffect(() => {
    if (!isOpen || !clinic) return;

    const fetchRecent = async (): Promise<void> => {
      const supabase = createClient();
      const { data } = await supabase
        .from("pets")
        .select("id, name, species, profiles!inner(full_name)")
        .order("updated_at", { ascending: false })
        .limit(5);

      if (data) {
        setRecentPatients(
          data.map((p) => ({
            id: p.id,
            name: p.name,
            species: p.species,
            ownerName: (p.profiles as unknown as { full_name: string })?.full_name || "Sin dueño",
          }))
        );
      }
    };

    fetchRecent();
  }, [isOpen, clinic]);

  // Navigate helper
  const navigate = useCallback(
    (path: string): void => {
      router.push(`/${clinic}${path}`);
      onClose();
    },
    [router, clinic, onClose]
  );

  // Build command items
  const commands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [
      // Quick Actions
      {
        id: "new-appointment",
        title: "Nueva cita",
        subtitle: "Agendar una nueva cita",
        icon: <Plus className="w-4 h-4" />,
        action: () => navigate("/dashboard/appointments?action=new"),
        category: "actions",
        keywords: ["cita", "agendar", "appointment", "nuevo"],
      },
      {
        id: "new-invoice",
        title: "Nueva factura",
        subtitle: "Crear una factura",
        icon: <FileText className="w-4 h-4" />,
        action: () => navigate("/dashboard/invoices?action=new"),
        category: "actions",
        keywords: ["factura", "invoice", "cobrar", "nuevo"],
      },
      {
        id: "new-patient",
        title: "Nuevo paciente",
        subtitle: "Registrar una mascota",
        icon: <PawPrint className="w-4 h-4" />,
        action: () => navigate("/dashboard/clients?action=new-pet"),
        category: "actions",
        keywords: ["paciente", "mascota", "pet", "registrar", "nuevo"],
      },
      {
        id: "new-vaccine",
        title: "Registrar vacuna",
        subtitle: "Agregar registro de vacunación",
        icon: <Syringe className="w-4 h-4" />,
        action: () => navigate("/dashboard/vaccines?action=new"),
        category: "actions",
        keywords: ["vacuna", "vaccine", "inmunización", "registrar"],
      },

      // Navigation
      {
        id: "nav-dashboard",
        title: "Dashboard",
        subtitle: "Ir al panel principal",
        icon: <Command className="w-4 h-4" />,
        action: () => navigate("/dashboard"),
        category: "navigation",
        keywords: ["inicio", "home", "panel"],
      },
      {
        id: "nav-calendar",
        title: "Calendario",
        subtitle: "Ver agenda completa",
        icon: <Calendar className="w-4 h-4" />,
        action: () => navigate("/dashboard/calendar"),
        category: "navigation",
        keywords: ["agenda", "calendario", "citas", "horarios"],
      },
      {
        id: "nav-appointments",
        title: "Citas de hoy",
        subtitle: "Ver cola de atención",
        icon: <Clock className="w-4 h-4" />,
        action: () => navigate("/dashboard/appointments"),
        category: "navigation",
        keywords: ["citas", "hoy", "cola", "atención"],
      },
      {
        id: "nav-clients",
        title: "Clientes",
        subtitle: "Directorio de clientes",
        icon: <Users className="w-4 h-4" />,
        action: () => navigate("/dashboard/clients"),
        category: "navigation",
        keywords: ["clientes", "dueños", "propietarios"],
      },
      {
        id: "nav-vaccines",
        title: "Control de vacunas",
        subtitle: "Vacunas pendientes y vencidas",
        icon: <Syringe className="w-4 h-4" />,
        action: () => navigate("/dashboard/vaccines"),
        category: "navigation",
        keywords: ["vacunas", "vencidas", "pendientes"],
      },
      {
        id: "nav-hospital",
        title: "Hospitalización",
        subtitle: "Pacientes internados",
        icon: <Bed className="w-4 h-4" />,
        action: () => navigate("/dashboard/hospital"),
        category: "navigation",
        keywords: ["hospital", "internados", "kennel"],
      },
      {
        id: "nav-lab",
        title: "Laboratorio",
        subtitle: "Órdenes de laboratorio",
        icon: <FlaskConical className="w-4 h-4" />,
        action: () => navigate("/dashboard/lab"),
        category: "navigation",
        keywords: ["lab", "laboratorio", "análisis", "resultados"],
      },
      {
        id: "nav-invoices",
        title: "Facturas",
        subtitle: "Facturación y cobros",
        icon: <FileText className="w-4 h-4" />,
        action: () => navigate("/dashboard/invoices"),
        category: "navigation",
        keywords: ["facturas", "cobros", "pagos"],
      },
      {
        id: "nav-products",
        title: "Inventario",
        subtitle: "Productos y stock",
        icon: <Settings className="w-4 h-4" />,
        action: () => navigate("/portal/inventory"),
        category: "navigation",
        keywords: ["inventario", "productos", "stock"],
      },

      // Clinical Tools
      {
        id: "tool-dosage",
        title: "Calculadora de dosis",
        subtitle: "Calcular dosis por peso",
        icon: <Calculator className="w-4 h-4" />,
        action: () => navigate("/drug_dosages"),
        category: "tools",
        keywords: ["dosis", "medicamento", "calcular", "peso"],
      },
      {
        id: "tool-diagnosis",
        title: "Códigos diagnóstico",
        subtitle: "Buscar VeNom/SNOMED",
        icon: <Stethoscope className="w-4 h-4" />,
        action: () => navigate("/diagnosis_codes"),
        category: "tools",
        keywords: ["diagnóstico", "código", "venom", "snomed"],
      },
      {
        id: "tool-growth",
        title: "Curvas de crecimiento",
        subtitle: "Estándares por raza",
        icon: <TrendingUp className="w-4 h-4" />,
        action: () => navigate("/growth_charts"),
        category: "tools",
        keywords: ["crecimiento", "peso", "curva", "raza"],
      },
      {
        id: "tool-qol",
        title: "Calidad de vida",
        subtitle: "Escala HHHHHMM",
        icon: <Heart className="w-4 h-4" />,
        action: () => navigate("/euthanasia_assessments"),
        category: "tools",
        keywords: ["calidad", "vida", "eutanasia", "evaluación"],
      },
      {
        id: "tool-reproductive",
        title: "Ciclos reproductivos",
        subtitle: "Seguimiento de celo",
        icon: <Baby className="w-4 h-4" />,
        action: () => navigate("/reproductive_cycles"),
        category: "tools",
        keywords: ["celo", "reproductivo", "ciclo", "gestación"],
      },
      {
        id: "tool-reactions",
        title: "Reacciones adversas",
        subtitle: "Registrar reacciones a vacunas",
        icon: <AlertCircle className="w-4 h-4" />,
        action: () => navigate("/vaccine_reactions"),
        category: "tools",
        keywords: ["reacción", "adversa", "vacuna", "alergia"],
      },
    ];

    // Add localStorage recent items first (user's personally viewed items)
    localRecentItems.slice(0, 5).forEach((item) => {
      const iconMap: Record<string, React.ReactNode> = {
        patient: <PawPrint className="w-4 h-4" />,
        client: <User className="w-4 h-4" />,
        invoice: <FileText className="w-4 h-4" />,
        appointment: <Calendar className="w-4 h-4" />,
        "lab-order": <TestTube className="w-4 h-4" />,
      };

      items.push({
        id: `local-recent-${item.type}-${item.id}`,
        title: item.title,
        subtitle: item.subtitle,
        icon: iconMap[item.type] || <Clock className="w-4 h-4" />,
        action: () => {
          router.push(item.href);
          onClose();
        },
        category: "recent",
        keywords: [item.title.toLowerCase(), item.subtitle?.toLowerCase() || ""].filter(Boolean),
      });
    });

    // Add database recent patients if not already in localStorage recent
    const localRecentIds = new Set(
      localRecentItems.filter((i) => i.type === "patient").map((i) => i.id)
    );

    recentPatients
      .filter((p) => !localRecentIds.has(p.id))
      .slice(0, 3)
      .forEach((patient) => {
        items.push({
          id: `recent-${patient.id}`,
          title: patient.name,
          subtitle: `${patient.species} · ${patient.ownerName}`,
          icon: <PawPrint className="w-4 h-4" />,
          action: () => navigate(`/portal/pets/${patient.id}`),
          category: "recent",
          keywords: [patient.name.toLowerCase(), patient.ownerName.toLowerCase()],
        });
      });

    return items;
  }, [navigate, recentPatients, localRecentItems, router, onClose]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      // Show categorized when no query
      return commands;
    }

    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(lowerQuery) ||
        cmd.subtitle?.toLowerCase().includes(lowerQuery) ||
        cmd.keywords?.some((k) => k.includes(lowerQuery))
    );
  }, [commands, query]);

  // Group by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      actions: [],
      recent: [],
      navigation: [],
      tools: [],
    };

    filteredCommands.forEach((cmd) => {
      groups[cmd.category].push(cmd);
    });

    return groups;
  }, [filteredCommands]);

  // Flatten for keyboard navigation
  const flatCommands = useMemo(() => {
    return [
      ...groupedCommands.actions,
      ...groupedCommands.recent,
      ...groupedCommands.navigation,
      ...groupedCommands.tools,
    ];
  }, [groupedCommands]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, flatCommands.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (flatCommands[selectedIndex]) {
            flatCommands[selectedIndex].action();
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, flatCommands, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector('[data-selected="true"]');
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const categoryLabels: Record<string, string> = {
    actions: "Acciones rápidas",
    recent: "Pacientes recientes",
    navigation: "Navegación",
    tools: "Herramientas clínicas",
  };

  let globalIndex = -1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Palette */}
        <div className="flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar pacientes, acciones, herramientas..."
                className="flex-1 text-base outline-none placeholder:text-gray-400"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded">
                ESC
              </kbd>
              <button
                onClick={onClose}
                className="sm:hidden p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
              {flatCommands.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No se encontraron resultados</p>
                  <p className="text-sm text-gray-400">Intenta con otra búsqueda</p>
                </div>
              ) : (
                Object.entries(groupedCommands).map(([category, items]) => {
                  if (items.length === 0) return null;

                  return (
                    <div key={category}>
                      <div className="px-4 py-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          {categoryLabels[category]}
                        </span>
                      </div>
                      {items.map((item) => {
                        globalIndex++;
                        const isSelected = globalIndex === selectedIndex;

                        return (
                          <button
                            key={item.id}
                            data-selected={isSelected}
                            onClick={item.action}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              isSelected
                                ? "bg-[var(--primary)] text-white"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <span
                              className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                                isSelected
                                  ? "bg-white/20"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {item.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`font-medium truncate ${
                                  isSelected ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {item.title}
                              </p>
                              {item.subtitle && (
                                <p
                                  className={`text-sm truncate ${
                                    isSelected ? "text-white/70" : "text-gray-500"
                                  }`}
                                >
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white rounded border">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white rounded border">↓</kbd>
                  <span>navegar</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white rounded border">↵</kbd>
                  <span>seleccionar</span>
                </span>
              </div>
              <span className="flex items-center gap-1">
                <Command className="w-3 h-3" />K para abrir
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

// Global keyboard listener hook
export function useCommandPalette(): { isOpen: boolean; open: () => void; close: () => void } {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
