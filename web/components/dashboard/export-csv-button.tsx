"use client";

import { useState } from "react";
import { Download, Loader2, Check, FileSpreadsheet, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardLabels } from "@/lib/hooks/use-dashboard-labels";

interface ExportField {
  key: string;
  label: string;
  selected: boolean;
}

interface ExportCSVButtonProps {
  endpoint: string;
  filename: string;
  clinic: string;
  defaultFields?: ExportField[];
  buttonText?: string;
  compact?: boolean;
}

export function ExportCSVButton({
  endpoint,
  filename,
  clinic,
  defaultFields,
  buttonText,
  compact = false,
}: ExportCSVButtonProps): React.ReactElement {
  const labels = useDashboardLabels();
  const displayButtonText = buttonText ?? labels.export.title;
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [exported, setExported] = useState(false);
  const [fields, setFields] = useState<ExportField[]>(
    defaultFields || [
      { key: "full_name", label: "Nombre Completo", selected: true },
      { key: "email", label: "Email", selected: true },
      { key: "phone", label: "Teléfono", selected: true },
      { key: "address", label: "Dirección", selected: true },
      { key: "created_at", label: "Fecha de Registro", selected: true },
      { key: "pets_count", label: "Cantidad de Mascotas", selected: true },
      { key: "last_visit", label: "Última Visita", selected: false },
      { key: "total_spent", label: "Total Gastado", selected: false },
      { key: "loyalty_points", label: "Puntos de Lealtad", selected: false },
    ]
  );

  const handleExport = async (): Promise<void> => {
    setIsExporting(true);
    try {
      const selectedFields = fields.filter((f) => f.selected).map((f) => f.key);
      const params = new URLSearchParams({
        clinic,
        fields: selectedFields.join(","),
        format: "csv",
      });

      const response = await fetch(`${endpoint}?${params}`);

      if (!response.ok) {
        throw new Error("Error al exportar");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setExported(true);
      setTimeout(() => setExported(false), 3000);
      setShowOptions(false);
    } catch (error) {
      console.error("Export error:", error);
      alert("Error al exportar. Por favor, intente nuevamente.");
    } finally {
      setIsExporting(false);
    }
  };

  const toggleField = (key: string): void => {
    setFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, selected: !f.selected } : f))
    );
  };

  const selectAll = (): void => {
    setFields((prev) => prev.map((f) => ({ ...f, selected: true })));
  };

  const selectNone = (): void => {
    setFields((prev) => prev.map((f) => ({ ...f, selected: false })));
  };

  if (compact) {
    return (
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        title={labels.export.title}
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : exported ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {!compact && <span>{displayButtonText}</span>}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <FileSpreadsheet className="w-4 h-4" />
        <span>{displayButtonText}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showOptions ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 z-10"
          >
            <div className="p-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                {labels.export.fields_to_export}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-[var(--primary)] hover:underline"
                >
                  {labels.export.select_all}
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={selectNone}
                  className="text-xs text-gray-500 hover:underline"
                >
                  {labels.export.none}
                </button>
              </div>
            </div>

            <div className="p-3 max-h-64 overflow-y-auto space-y-2">
              {fields.map((field) => (
                <label
                  key={field.key}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={field.selected}
                    onChange={() => toggleField(field.key)}
                    className="w-4 h-4 text-[var(--primary)] border-gray-300 rounded focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-gray-700">{field.label}</span>
                </label>
              ))}
            </div>

            <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button
                onClick={handleExport}
                disabled={isExporting || fields.filter((f) => f.selected).length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {labels.export.exporting}
                  </>
                ) : exported ? (
                  <>
                    <Check className="w-4 h-4" />
                    {labels.export.exported}
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    {labels.export.download}
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                {labels.export.fields_selected.replace("{count}", String(fields.filter((f) => f.selected).length))}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
