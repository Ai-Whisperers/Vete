"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface ClinicSettings {
  name: string;
  tagline: string;
  contact: {
    phone_display: string;
    whatsapp_number: string;
    email: string;
    address: string;
  };
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  settings: {
    currency: string;
    emergency_24h: boolean;
  };
}

export default function GeneralSettingsPage(): React.ReactElement {
  const { clinic } = useParams() as { clinic: string };
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    const fetchSettings = async (): Promise<void> => {
      try {
        const res = await fetch(`/api/settings/general?clinic=${clinic}`);
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [clinic]);

  const handleSave = async (): Promise<void> => {
    if (!settings) return;

    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const res = await fetch("/api/settings/general", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinic, ...settings }),
      });

      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (path: string, value: string | boolean): void => {
    if (!settings) return;

    setSettings((prev) => {
      if (!prev) return prev;
      const newSettings = { ...prev };
      const keys = path.split(".");
      let current: Record<string, unknown> = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] as Record<string, unknown>;
      }

      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <div className="text-center text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No se pudieron cargar los ajustes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Clinic Info Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <Building2 className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="font-semibold text-gray-900">Información de la Clínica</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Clínica
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              placeholder="Veterinaria Ejemplo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Eslogan / Descripción Corta
            </label>
            <input
              type="text"
              value={settings.tagline || ""}
              onChange={(e) => updateField("tagline", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              placeholder="Cuidamos a tu mascota como parte de nuestra familia"
            />
          </div>
        </div>
      </div>

      {/* Contact Info Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <Phone className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="font-semibold text-gray-900">Información de Contacto</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono (Display)
            </label>
            <input
              type="text"
              value={settings.contact.phone_display}
              onChange={(e) => updateField("contact.phone_display", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              placeholder="+595 21 123 456"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp (Número completo)
            </label>
            <input
              type="text"
              value={settings.contact.whatsapp_number}
              onChange={(e) => updateField("contact.whatsapp_number", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              placeholder="595211234567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              type="email"
              value={settings.contact.email}
              onChange={(e) => updateField("contact.email", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              placeholder="contacto@veterinaria.com"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Dirección
            </label>
            <input
              type="text"
              value={settings.contact.address}
              onChange={(e) => updateField("contact.address", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              placeholder="Av. Principal 123, Ciudad"
            />
          </div>
        </div>
      </div>

      {/* Business Hours Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <Clock className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="font-semibold text-gray-900">Horarios de Atención</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lunes a Viernes
            </label>
            <input
              type="text"
              value={settings.hours?.weekdays || ""}
              onChange={(e) => updateField("hours.weekdays", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              placeholder="08:00 - 18:00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sábados
            </label>
            <input
              type="text"
              value={settings.hours?.saturday || ""}
              onChange={(e) => updateField("hours.saturday", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              placeholder="08:00 - 12:00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domingos
            </label>
            <input
              type="text"
              value={settings.hours?.sunday || ""}
              onChange={(e) => updateField("hours.sunday", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              placeholder="Cerrado"
            />
          </div>
        </div>

        {/* Emergency toggle */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.settings.emergency_24h}
              onChange={(e) => updateField("settings.emergency_24h", e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <div>
              <p className="font-medium text-gray-900">Emergencias 24/7</p>
              <p className="text-sm text-gray-500">Mostrar badge de atención de emergencias</p>
            </div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-4">
        <div className="flex items-center gap-2">
          {saveStatus === "success" && (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Cambios guardados</span>
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
