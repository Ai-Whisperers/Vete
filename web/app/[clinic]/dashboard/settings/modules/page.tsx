"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ToggleRight,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calculator,
  Skull,
  TrendingUp,
  Syringe,
  QrCode,
  Gift,
  ShoppingCart,
  Calendar,
  Video,
  Store
} from "lucide-react";

interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  category: "clinical" | "features" | "commerce";
}

const moduleDefinitions: Omit<ModuleConfig, "enabled">[] = [
  // Clinical Tools
  {
    id: "toxic_checker",
    name: "Verificador de Alimentos Tóxicos",
    description: "Herramienta para verificar si un alimento es seguro para mascotas",
    icon: <Skull className="w-5 h-5" />,
    category: "clinical",
  },
  {
    id: "age_calculator",
    name: "Calculadora de Edad",
    description: "Convierte la edad de mascotas a años humanos",
    icon: <Calculator className="w-5 h-5" />,
    category: "clinical",
  },
  {
    id: "growth_charts",
    name: "Curvas de Crecimiento",
    description: "Gráficos de peso por edad y raza",
    icon: <TrendingUp className="w-5 h-5" />,
    category: "clinical",
  },
  {
    id: "vaccine_tracker",
    name: "Seguimiento de Vacunas",
    description: "Calendario y recordatorios de vacunación",
    icon: <Syringe className="w-5 h-5" />,
    category: "clinical",
  },
  // Features
  {
    id: "qr_tags",
    name: "Tags QR",
    description: "Generación de códigos QR para identificación de mascotas",
    icon: <QrCode className="w-5 h-5" />,
    category: "features",
  },
  {
    id: "loyalty_program",
    name: "Programa de Lealtad",
    description: "Sistema de puntos y recompensas para clientes",
    icon: <Gift className="w-5 h-5" />,
    category: "features",
  },
  {
    id: "booking",
    name: "Reservas Online",
    description: "Permitir a clientes agendar citas desde el sitio web",
    icon: <Calendar className="w-5 h-5" />,
    category: "features",
  },
  {
    id: "telemedicine",
    name: "Telemedicina",
    description: "Consultas por videollamada",
    icon: <Video className="w-5 h-5" />,
    category: "features",
  },
  // Commerce
  {
    id: "online_store",
    name: "Tienda Online",
    description: "Venta de productos desde el sitio web",
    icon: <Store className="w-5 h-5" />,
    category: "commerce",
  },
  {
    id: "delivery",
    name: "Delivery",
    description: "Servicio de entrega a domicilio",
    icon: <ShoppingCart className="w-5 h-5" />,
    category: "commerce",
  },
];

export default function ModulesSettingsPage(): React.ReactElement {
  const { clinic } = useParams() as { clinic: string };
  const [modules, setModules] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    const fetchModules = async (): Promise<void> => {
      try {
        const res = await fetch(`/api/settings/modules?clinic=${clinic}`);
        if (res.ok) {
          const data = await res.json();
          setModules(data.modules || {});
        }
      } catch (error) {
        // Client-side error logging - only in development
        if (process.env.NODE_ENV === 'development') {
          console.error("Error fetching modules:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchModules();
  }, [clinic]);

  const handleToggle = (moduleId: string): void => {
    setModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const res = await fetch("/api/settings/modules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinic, modules }),
      });

      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Error saving modules:", error);
      }
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const categories = [
    { id: "clinical", label: "Herramientas Clínicas" },
    { id: "features", label: "Funcionalidades" },
    { id: "commerce", label: "Comercio" },
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <ToggleRight className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Gestión de Módulos</p>
            <p className="text-sm text-blue-700">
              Activa o desactiva funcionalidades según las necesidades de tu clínica.
              Los cambios se reflejarán en el sitio web y el portal.
            </p>
          </div>
        </div>
      </div>

      {/* Modules by Category */}
      {categories.map((category) => {
        const categoryModules = moduleDefinitions.filter((m) => m.category === category.id);
        if (categoryModules.length === 0) return null;

        return (
          <div key={category.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{category.label}</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {categoryModules.map((module) => {
                const isEnabled = modules[module.id] ?? false;
                return (
                  <div
                    key={module.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${isEnabled ? "bg-[var(--primary)] bg-opacity-10 text-[var(--primary)]" : "bg-gray-100 text-gray-400"}`}>
                        {module.icon}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{module.name}</p>
                        <p className="text-sm text-gray-500">{module.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle(module.id)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ${
                        isEnabled ? "bg-[var(--primary)]" : "bg-gray-200"
                      }`}
                      role="switch"
                      aria-checked={isEnabled}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Save Button */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-4">
        <div className="flex items-center gap-2">
          {saveStatus === "success" && (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Módulos actualizados</span>
            </>
          )}
          {saveStatus === "error" && (
            <>
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-600 font-medium">Error al guardar</span>
            </>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--primary)] text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
