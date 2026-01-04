"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { generalSettingsSchema, type GeneralSettingsInput } from "@/lib/schemas/settings";

export default function GeneralSettingsPage(): React.ReactElement {
  const { clinic } = useParams() as { clinic: string };
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      clinic,
      name: '',
      tagline: undefined as string | undefined,
    },
  });

  useEffect(() => {
    const fetchSettings = async (): Promise<void> => {
      try {
        const res = await fetch(`/api/settings/general?clinic=${clinic}`);
        if (res.ok) {
          const result = await res.json();
          const data = result.success ? result.data : result;
          reset({
            clinic,
            name: data.name,
            tagline: data.tagline,
            contact: {
              email: data.contact?.email || "",
              phone: data.contact?.phone || data.contact?.phone_display || "",
              whatsapp: data.contact?.whatsapp || data.contact?.whatsapp_number || "",
              address: data.contact?.address || "",
            },
            hours: data.hours || {},
            settings: {
              currency: data.settings?.currency || "PYG",
              emergency_24h: data.settings?.emergency_24h || false,
            },
          });
        }
      } catch (error) {
        // Client-side error logging - only in development
        if (process.env.NODE_ENV === 'development') {
          console.error("Error fetching settings:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [clinic, reset]);

  const onSubmit = async (data: Record<string, unknown>): Promise<void> => {
    setSaveStatus("idle");

    try {
      const res = await fetch("/api/settings/general", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        // Client-side error logging - only in development
        if (process.env.NODE_ENV === 'development') {
          const errData = await res.json();
          console.error("Save error:", errData);
        }
        setSaveStatus("error");
      }
    } catch (error) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Error saving settings:", error);
      }
      setSaveStatus("error");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Clinic Info Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <Building2 className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="font-semibold text-gray-900">Información de la Clínica</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="clinic-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Clínica
            </label>
            <input
              id="clinic-name"
              type="text"
              {...register("name")}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all ${
                errors.name ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="Veterinaria Ejemplo"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="clinic-tagline" className="block text-sm font-medium text-gray-700 mb-1">
              Eslogan / Descripción Corta
            </label>
            <input
              id="clinic-tagline"
              type="text"
              {...register("tagline")}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all ${
                errors.tagline ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="Cuidamos a tu mascota como parte de nuestra familia"
            />
            {errors.tagline && (
              <p className="mt-1 text-xs text-red-500">{errors.tagline.message}</p>
            )}
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
            <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono (Display)
            </label>
            <input
              id="contact-phone"
              type="text"
              {...register("contact.phone")}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all ${
                errors.contact?.phone ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="+595 21 123 456"
            />
            {errors.contact?.phone && (
              <p className="mt-1 text-xs text-red-500">{errors.contact.phone.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="contact-whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp (Número completo)
            </label>
            <input
              id="contact-whatsapp"
              type="text"
              {...register("contact.whatsapp")}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all ${
                errors.contact?.whatsapp ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="595211234567"
            />
            {errors.contact?.whatsapp && (
              <p className="mt-1 text-xs text-red-500">{errors.contact.whatsapp.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              {...register("contact.email")}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all ${
                errors.contact?.email ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="contacto@veterinaria.com"
            />
            {errors.contact?.email && (
              <p className="mt-1 text-xs text-red-500">{errors.contact.email.message}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="contact-address" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Dirección
            </label>
            <input
              id="contact-address"
              type="text"
              {...register("contact.address")}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all ${
                errors.contact?.address ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="Av. Principal 123, Ciudad"
            />
            {errors.contact?.address && (
              <p className="mt-1 text-xs text-red-500">{errors.contact.address.message}</p>
            )}
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
            <label htmlFor="hours-weekdays" className="block text-sm font-medium text-gray-700 mb-1">
              Lunes a Viernes
            </label>
            <input
              id="hours-weekdays"
              type="text"
              {...register("hours.weekdays")}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              placeholder="08:00 - 18:00"
            />
          </div>
          <div>
            <label htmlFor="hours-saturday" className="block text-sm font-medium text-gray-700 mb-1">
              Sábados
            </label>
            <input
              id="hours-saturday"
              type="text"
              {...register("hours.saturday")}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              placeholder="08:00 - 12:00"
            />
          </div>
          <div>
            <label htmlFor="hours-sunday" className="block text-sm font-medium text-gray-700 mb-1">
              Domingos
            </label>
            <input
              id="hours-sunday"
              type="text"
              {...register("hours.sunday")}
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
              {...register("settings.emergency_24h")}
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
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--primary)] text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Guardar Cambios
        </button>
      </div>
    </form>
  );
}
