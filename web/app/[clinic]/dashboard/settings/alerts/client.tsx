"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Mail,
  MessageCircle,
  Package,
  Clock,
  AlertCircle,
  Save,
  Loader2,
  CheckCircle,
  ArrowLeft,
  Settings2,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface AlertPreferences {
  id: string | null;
  profile_id: string;
  tenant_id: string;
  low_stock_alerts: boolean;
  expiry_alerts: boolean;
  out_of_stock_alerts: boolean;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  in_app_enabled: boolean;
  low_stock_threshold: number;
  expiry_days_warning: number;
  notification_email: string | null;
  notification_phone: string | null;
  digest_frequency: string;
}

interface AlertSettingsClientProps {
  clinic: string;
}

const defaultPreferences: AlertPreferences = {
  id: null,
  profile_id: "",
  tenant_id: "",
  low_stock_alerts: true,
  expiry_alerts: true,
  out_of_stock_alerts: true,
  email_enabled: true,
  whatsapp_enabled: false,
  in_app_enabled: true,
  low_stock_threshold: 5,
  expiry_days_warning: 30,
  notification_email: null,
  notification_phone: null,
  digest_frequency: "immediate",
};

export default function AlertSettingsClient({ clinic }: AlertSettingsClientProps): React.ReactElement {
  const [preferences, setPreferences] = useState<AlertPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPreferences = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/dashboard/alert-preferences");

      if (!response.ok) {
        throw new Error("Error al cargar preferencias");
      }

      const data = await response.json();
      setPreferences(data.preferences || defaultPreferences);
    } catch (err) {
      console.error("Error fetching preferences:", err);
      setError("Error al cargar las preferencias");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/dashboard/alert-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error("Error al guardar preferencias");
      }

      const data = await response.json();
      setPreferences(data.preferences);
      setSuccess("Preferencias guardadas correctamente");

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving preferences:", err);
      setError("Error al guardar las preferencias");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (): Promise<void> => {
    if (!confirm("¿Restablecer las preferencias a valores predeterminados?")) {
      return;
    }

    try {
      await fetch("/api/dashboard/alert-preferences", {
        method: "DELETE",
      });

      setPreferences(defaultPreferences);
      setSuccess("Preferencias restablecidas");

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error resetting preferences:", err);
      setError("Error al restablecer las preferencias");
    }
  };

  const updatePreference = <K extends keyof AlertPreferences>(key: K, value: AlertPreferences[K]): void => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Cargando preferencias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href={`/${clinic}/dashboard/settings`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Bell className="w-7 h-7 text-[var(--primary)]" />
              Alertas de Inventario
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] ml-12">
            Configura cómo y cuándo recibir notificaciones sobre el inventario
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium"
          >
            Restablecer
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2.5 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Alert Types */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-gray-400" />
            Tipos de Alerta
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Selecciona qué tipo de alertas deseas recibir
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Low Stock Alerts */}
          <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.low_stock_alerts}
              onChange={(e) => updatePreference("low_stock_alerts", e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-100">
                  <Package className="w-4 h-4 text-orange-600" />
                </div>
                <span className="font-semibold text-[var(--text-primary)]">Stock Bajo</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Recibe alertas cuando productos tengan stock por debajo del mínimo
              </p>
              {preferences.low_stock_alerts && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-[var(--text-secondary)]">Umbral mínimo:</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={preferences.low_stock_threshold}
                    onChange={(e) => updatePreference("low_stock_threshold", Number(e.target.value))}
                    className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--text-secondary)]">unidades</span>
                </div>
              )}
            </div>
          </label>

          {/* Out of Stock Alerts */}
          <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.out_of_stock_alerts}
              onChange={(e) => updatePreference("out_of_stock_alerts", e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-100">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <span className="font-semibold text-[var(--text-primary)]">Sin Stock</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Recibe alertas inmediatas cuando un producto se quede sin stock
              </p>
            </div>
          </label>

          {/* Expiry Alerts */}
          <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.expiry_alerts}
              onChange={(e) => updatePreference("expiry_alerts", e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-semibold text-[var(--text-primary)]">Productos por Vencer</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Recibe alertas sobre productos próximos a vencer
              </p>
              {preferences.expiry_alerts && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-[var(--text-secondary)]">Advertir con:</span>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={preferences.expiry_days_warning}
                    onChange={(e) => updatePreference("expiry_days_warning", Number(e.target.value))}
                    className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--text-secondary)]">días de anticipación</span>
                </div>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Notification Channels */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-400" />
            Canales de Notificación
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Elige cómo quieres recibir las alertas
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Email */}
          <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100">
            <input
              type="checkbox"
              checked={preferences.email_enabled}
              onChange={(e) => updatePreference("email_enabled", e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Mail className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-semibold text-[var(--text-primary)]">Correo Electrónico</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Recibe alertas por correo electrónico
              </p>
              {preferences.email_enabled && (
                <div className="mt-3">
                  <input
                    type="email"
                    value={preferences.notification_email || ""}
                    onChange={(e) => updatePreference("notification_email", e.target.value || null)}
                    placeholder="Usar email de mi perfil"
                    className="w-full max-w-sm px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                  />
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Deja vacío para usar el email de tu perfil
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* WhatsApp */}
          <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100">
            <input
              type="checkbox"
              checked={preferences.whatsapp_enabled}
              onChange={(e) => updatePreference("whatsapp_enabled", e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-100">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-semibold text-[var(--text-primary)]">WhatsApp</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Recibe alertas por WhatsApp
              </p>
              {preferences.whatsapp_enabled && (
                <div className="mt-3">
                  <input
                    type="tel"
                    value={preferences.notification_phone || ""}
                    onChange={(e) => updatePreference("notification_phone", e.target.value || null)}
                    placeholder="Ej: 0981123456"
                    className="w-full max-w-sm px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                  />
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Número de WhatsApp para recibir alertas
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* In-App */}
          <label className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.in_app_enabled}
              onChange={(e) => updatePreference("in_app_enabled", e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-100">
                  <Bell className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="font-semibold text-[var(--text-primary)]">En la Aplicación</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Ver alertas en el panel de control al iniciar sesión
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Frequency */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Frecuencia de Notificaciones
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            ¿Con qué frecuencia deseas recibir las alertas?
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label
              className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                preferences.digest_frequency === "immediate"
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="digest_frequency"
                value="immediate"
                checked={preferences.digest_frequency === "immediate"}
                onChange={(e) => updatePreference("digest_frequency", e.target.value)}
                className="sr-only"
              />
              <AlertCircle className={`w-8 h-8 mb-2 ${
                preferences.digest_frequency === "immediate" ? "text-[var(--primary)]" : "text-gray-400"
              }`} />
              <span className="font-semibold text-[var(--text-primary)]">Inmediato</span>
              <span className="text-xs text-[var(--text-secondary)] text-center mt-1">
                Recibe alertas al instante
              </span>
            </label>

            <label
              className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                preferences.digest_frequency === "daily"
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="digest_frequency"
                value="daily"
                checked={preferences.digest_frequency === "daily"}
                onChange={(e) => updatePreference("digest_frequency", e.target.value)}
                className="sr-only"
              />
              <Clock className={`w-8 h-8 mb-2 ${
                preferences.digest_frequency === "daily" ? "text-[var(--primary)]" : "text-gray-400"
              }`} />
              <span className="font-semibold text-[var(--text-primary)]">Diario</span>
              <span className="text-xs text-[var(--text-secondary)] text-center mt-1">
                Resumen cada 24 horas
              </span>
            </label>

            <label
              className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                preferences.digest_frequency === "weekly"
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="digest_frequency"
                value="weekly"
                checked={preferences.digest_frequency === "weekly"}
                onChange={(e) => updatePreference("digest_frequency", e.target.value)}
                className="sr-only"
              />
              <Bell className={`w-8 h-8 mb-2 ${
                preferences.digest_frequency === "weekly" ? "text-[var(--primary)]" : "text-gray-400"
              }`} />
              <span className="font-semibold text-[var(--text-primary)]">Semanal</span>
              <span className="text-xs text-[var(--text-secondary)] text-center mt-1">
                Resumen cada 7 días
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button (Mobile) */}
      <div className="sm:hidden">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar Preferencias
        </button>
      </div>
    </div>
  );
}
