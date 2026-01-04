"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Mail,
  MessageSquare,
  Calendar,
  Syringe,
  Package,
  Sparkles,
  Loader2,
  Check,
  AlertCircle
} from "lucide-react";

interface NotificationSettings {
  email_vaccine_reminders: boolean;
  email_appointment_reminders: boolean;
  email_promotions: boolean;
  sms_vaccine_reminders: boolean;
  sms_appointment_reminders: boolean;
  whatsapp_enabled: boolean;
}

export default function NotificationSettingsPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const clinic = params?.clinic as string;

  const [settings, setSettings] = useState<NotificationSettings>({
    email_vaccine_reminders: true,
    email_appointment_reminders: true,
    email_promotions: false,
    sms_vaccine_reminders: false,
    sms_appointment_reminders: true,
    whatsapp_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/user/notification-settings?clinic=${clinic}`);
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        // Client-side error logging - only in development
        if (process.env.NODE_ENV === 'development') {
          console.error("Error fetching settings:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [clinic]);

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/user/notification-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinic, settings }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-subtle)]">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/${clinic}/portal/dashboard`}
            className="p-2 rounded-xl hover:bg-white transition-colors"
            aria-label="Volver al dashboard"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--text-secondary)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">
              Notificaciones
            </h1>
            <p className="text-sm text-gray-500">
              Configura cómo quieres recibir alertas
            </p>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="font-bold text-lg text-[var(--text-primary)]">
              Correo Electrónico
            </h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Syringe className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-800">Recordatorios de vacunas</p>
                  <p className="text-sm text-gray-500">Cuando una vacuna está por vencer</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.email_vaccine_reminders}
                onChange={() => handleToggle("email_vaccine_reminders")}
                className="w-6 h-6 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-800">Recordatorios de citas</p>
                  <p className="text-sm text-gray-500">24 horas antes de tu cita</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.email_appointment_reminders}
                onChange={() => handleToggle("email_appointment_reminders")}
                className="w-6 h-6 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-800">Ofertas y promociones</p>
                  <p className="text-sm text-gray-500">Descuentos exclusivos</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.email_promotions}
                onChange={() => handleToggle("email_promotions")}
                className="w-6 h-6 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
              />
            </label>
          </div>
        </div>

        {/* SMS/WhatsApp Notifications */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="font-bold text-lg text-[var(--text-primary)]">
              SMS y WhatsApp
            </h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Syringe className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-800">SMS de vacunas</p>
                  <p className="text-sm text-gray-500">Alertas por mensaje de texto</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.sms_vaccine_reminders}
                onChange={() => handleToggle("sms_vaccine_reminders")}
                className="w-6 h-6 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-800">SMS de citas</p>
                  <p className="text-sm text-gray-500">Confirmación y recordatorios</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.sms_appointment_reminders}
                onChange={() => handleToggle("sms_appointment_reminders")}
                className="w-6 h-6 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-800">WhatsApp habilitado</p>
                  <p className="text-sm text-gray-500">Recibir mensajes por WhatsApp</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.whatsapp_enabled}
                onChange={() => handleToggle("whatsapp_enabled")}
                className="w-6 h-6 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
              />
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div role="alert" className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5" aria-hidden="true" />
            {error}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            saved
              ? "bg-green-500 text-white"
              : "bg-[var(--primary)] text-white hover:shadow-lg"
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Guardando...
            </>
          ) : saved ? (
            <>
              <Check className="w-5 h-5" />
              Guardado
            </>
          ) : (
            "Guardar Cambios"
          )}
        </button>
      </div>
    </div>
  );
}
