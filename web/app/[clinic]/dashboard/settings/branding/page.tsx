"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Palette,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Upload,
  Eye
} from "lucide-react";

interface ThemeColors {
  primary: { main: string; light: string; dark: string };
  secondary: { main: string };
  background: { default: string; paper: string; subtle: string };
  text: { primary: string; secondary: string };
}

interface BrandingSettings {
  logo_url: string;
  favicon_url: string;
  hero_image_url: string;
  colors: ThemeColors;
}

const colorPresets = [
  { name: "Esmeralda", primary: "#10B981", secondary: "#059669" },
  { name: "Azul Océano", primary: "#0EA5E9", secondary: "#0284C7" },
  { name: "Púrpura Real", primary: "#8B5CF6", secondary: "#7C3AED" },
  { name: "Rosa Coral", primary: "#F43F5E", secondary: "#E11D48" },
  { name: "Naranja Cálido", primary: "#F97316", secondary: "#EA580C" },
  { name: "Índigo", primary: "#6366F1", secondary: "#4F46E5" },
];

export default function BrandingSettingsPage(): React.ReactElement {
  const { clinic } = useParams() as { clinic: string };
  const [branding, setBranding] = useState<BrandingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [previewColor, setPreviewColor] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranding = async (): Promise<void> => {
      try {
        const res = await fetch(`/api/settings/branding?clinic=${clinic}`);
        if (res.ok) {
          const data = await res.json();
          setBranding(data);
        }
      } catch (error) {
        console.error("Error fetching branding:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranding();
  }, [clinic]);

  const handleSave = async (): Promise<void> => {
    if (!branding) return;

    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const res = await fetch("/api/settings/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinic, ...branding }),
      });

      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Error saving branding:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const applyPreset = (preset: { primary: string; secondary: string }): void => {
    if (!branding) return;
    setBranding({
      ...branding,
      colors: {
        ...branding.colors,
        primary: { ...branding.colors.primary, main: preset.primary },
        secondary: { ...branding.colors.secondary, main: preset.secondary },
      },
    });
  };

  const updateColor = (path: string, value: string): void => {
    if (!branding) return;
    const [category, shade] = path.split(".");
    setBranding({
      ...branding,
      colors: {
        ...branding.colors,
        [category]: {
          ...branding.colors[category as keyof ThemeColors],
          [shade]: value,
        },
      },
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!branding) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <div className="text-center text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No se pudieron cargar los ajustes de marca</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Color Presets */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <Palette className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="font-semibold text-gray-900">Paleta de Colores</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4">Selecciona un preset o personaliza los colores</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                onMouseEnter={() => setPreviewColor(preset.primary)}
                onMouseLeave={() => setPreviewColor(null)}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div
                  className="w-8 h-8 rounded-full shadow-inner"
                  style={{ backgroundColor: preset.primary }}
                />
                <span className="text-sm font-medium text-gray-700">{preset.name}</span>
              </button>
            ))}
          </div>

          {/* Custom Colors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Primario
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={previewColor || branding.colors.primary.main}
                  onChange={(e) => updateColor("primary.main", e.target.value)}
                  className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.colors.primary.main}
                  onChange={(e) => updateColor("primary.main", e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg font-mono text-sm"
                  placeholder="#10B981"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Secundario
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={branding.colors.secondary.main}
                  onChange={(e) => updateColor("secondary.main", e.target.value)}
                  className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.colors.secondary.main}
                  onChange={(e) => updateColor("secondary.main", e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg font-mono text-sm"
                  placeholder="#059669"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Vista Previa</span>
          </div>
          <div className="flex gap-3">
            <button
              style={{ backgroundColor: previewColor || branding.colors.primary.main }}
              className="px-4 py-2 text-white text-sm font-medium rounded-lg"
            >
              Botón Primario
            </button>
            <button
              style={{
                borderColor: previewColor || branding.colors.primary.main,
                color: previewColor || branding.colors.primary.main
              }}
              className="px-4 py-2 text-sm font-medium rounded-lg border-2 bg-white"
            >
              Botón Secundario
            </button>
            <span
              style={{ color: previewColor || branding.colors.primary.main }}
              className="px-4 py-2 text-sm font-medium"
            >
              Texto con color
            </span>
          </div>
        </div>
      </div>

      {/* Logo & Images */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <Upload className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="font-semibold text-gray-900">Logo e Imágenes</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo (URL)
            </label>
            <div className="flex items-center gap-4">
              {branding.logo_url && (
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={branding.logo_url}
                    alt="Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="url"
                  value={branding.logo_url || ""}
                  onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg"
                  placeholder="https://ejemplo.com/logo.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recomendado: PNG transparente, 200x60px mínimo
                </p>
              </div>
            </div>
          </div>

          {/* Favicon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favicon (URL)
            </label>
            <div className="flex items-center gap-4">
              {branding.favicon_url && (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={branding.favicon_url}
                    alt="Favicon"
                    className="w-8 h-8 object-contain"
                  />
                </div>
              )}
              <input
                type="url"
                value={branding.favicon_url || ""}
                onChange={(e) => setBranding({ ...branding, favicon_url: e.target.value })}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg"
                placeholder="https://ejemplo.com/favicon.ico"
              />
            </div>
          </div>

          {/* Hero Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen Hero (URL)
            </label>
            <input
              type="url"
              value={branding.hero_image_url || ""}
              onChange={(e) => setBranding({ ...branding, hero_image_url: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg"
              placeholder="https://ejemplo.com/hero.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Imagen de fondo para la sección principal. Recomendado: 1920x1080px
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-4">
        <div className="flex items-center gap-2">
          {saveStatus === "success" && (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Marca actualizada</span>
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
