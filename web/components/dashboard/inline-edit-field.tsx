"use client";

import { useState, useRef, useEffect } from "react";
import { Check, X, Pencil, Loader2, Copy, CheckCheck } from "lucide-react";
import { useForm } from '@/hooks/use-form';
import { useAsyncData } from '@/hooks/use-async-data';
import { required } from '@/lib/utils/validation';

interface InlineEditFieldProps {
  value: string;
  label: string;
  field: string;
  entityId: string;
  entityType: "client" | "pet";
  clinic: string;
  onUpdate?: (newValue: string) => void;
  type?: "text" | "email" | "tel";
  icon?: React.ReactNode;
  copyable?: boolean;
  editable?: boolean;
}

export function InlineEditField({
  value,
  label,
  field,
  entityId,
  entityType,
  clinic,
  onUpdate,
  type = "text",
  icon,
  copyable = false,
  editable = true,
}: InlineEditFieldProps): React.ReactElement {
  const [isEditing, setIsEditing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Form handling with validation
  const form = useForm({
    initialValues: { [field]: value },
    validationRules: type === 'email' ? { [field]: required('Email requerido') } : {}
  });

  // Async data handling for save operation
  const { isLoading: isSaving, error: saveError, refetch: saveField } = useAsyncData(
    async () => {
      const endpoint = entityType === "client"
        ? `/api/clients/${entityId}`
        : `/api/pets/${entityId}`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic,
          [field]: form.values[field]
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al guardar");
      }

      return response.json();
    },
    [], // No dependencies - manual trigger only
    { enabled: false } // Don't run automatically
  );

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    // Reset form when value changes externally
    form.reset({ [field]: value });
  }, [value, field]);

  const handleSave = async (): Promise<void> => {
    if (!form.validateForm()) return;

    if (form.values[field] === value) {
      setIsEditing(false);
      return;
    }

    try {
      await saveField();
      onUpdate?.(form.values[field]);
      setIsEditing(false);
    } catch (err) {
      // Error is handled by useAsyncData
    }
  };

  const handleCancel = (): void => {
    form.reset({ [field]: value });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleCopy = async (): Promise<void> => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to copy:", err);
      }
    }
  };

  const displayValue = value || "No registrado";
  const fieldProps = form.getFieldProps(field);
  const hasError = saveError || fieldProps.error;

  return (
    <div className="flex items-start gap-3">
      {icon && (
        <div className="w-5 h-5 text-[var(--text-secondary)] mt-0.5 flex-shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--text-secondary)] mb-1">{label}</p>

        {isEditing ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type={type}
                {...fieldProps}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                className={`flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50 ${
                  hasError
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-[var(--border-color)] focus:ring-[var(--primary)]'
                }`}
              />
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                title="Guardar"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                title="Cancelar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {hasError && (
              <p className="text-xs text-red-600">{saveError || fieldProps.error}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <p className={`text-sm font-medium ${value ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] italic"}`}>
              {displayValue}
            </p>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {editable && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 hover:text-[var(--primary)] hover:bg-gray-100 rounded transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              {copyable && value && (
                <button
                  onClick={handleCopy}
                  className="p-1 text-gray-400 hover:text-[var(--primary)] hover:bg-gray-100 rounded transition-colors"
                  title={isCopied ? "¡Copiado!" : "Copiar"}
                >
                  {isCopied ? (
                    <CheckCheck className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
