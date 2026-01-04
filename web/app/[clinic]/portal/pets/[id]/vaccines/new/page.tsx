"use client";

import { useActionState, useState, useCallback } from "react";
import {
  ArrowLeft,
  AlertTriangle,
  Loader2,
  Check,
  X,
  Trash2,
  Camera,
  AlertCircle,
  FileText,
  Upload,
  Info,
  CheckCircle2,
  Calendar,
  Syringe
} from "lucide-react";
import { createVaccine } from "@/app/actions/create-vaccine";
import { validateImageQuality } from "@/lib/image-validation";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ActionResult, FieldErrors } from "@/lib/types/action-result";

// Helper component for field errors
function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <span>{error}</span>
    </p>
  );
}

// Helper component for field hints
function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1 text-xs text-[var(--text-muted)] flex items-start gap-1">
      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

// Get field errors from state
function getFieldErrors(state: ActionResult | null): FieldErrors {
  if (!state || state.success) return {};
  return state.fieldErrors || {};
}

// Input class with error state
function inputClass(hasError: boolean) {
  const base = "w-full px-4 py-3 rounded-xl border outline-none transition-colors";
  return hasError
    ? `${base} border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200`
    : `${base} border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20`;
}

export default function NewVaccinePage() {
  const params = useParams();
  const [state, formAction, isPending] = useActionState(createVaccine, null);
  const fieldErrors = getFieldErrors(state);

  const [photos, setPhotos] = useState<{ file: File, preview: string, status: 'validating' | 'valid' | 'invalid', error?: string }[]>([]);
  const [certificate, setCertificate] = useState<{ file: File, name: string } | null>(null);
  const [certificateError, setCertificateError] = useState<string | null>(null);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        status: 'validating' as const
      }));

      setPhotos(prev => [...prev, ...newPhotos]);

      for (let i = 0; i < newPhotos.length; i++) {
        const result = await validateImageQuality(newPhotos[i].file);

        setPhotos(prev => prev.map(p => {
          if (p.file === newPhotos[i].file) {
            return {
              ...p,
              status: result.isValid ? 'valid' : 'invalid',
              error: result.reason
            };
          }
          return p;
        }));
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const hasInvalidPhotos = photos.some(p => p.status === 'invalid');
  const isValidatingPhotos = photos.some(p => p.status === 'validating');

  const [reactionWarning, setReactionWarning] = useState<{ severity: string; date: string } | null>(null);

  const handleCertificateSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCertificateError(null);

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setCertificateError('Formato no permitido. Usa PDF, JPG, PNG o WebP.');
      return;
    }

    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setCertificateError(`El archivo es muy grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo ${maxSizeMB}MB.`);
      return;
    }

    setCertificate({ file, name: file.name });
  }, []);

  const removeCertificate = useCallback(() => {
    setCertificate(null);
    setCertificateError(null);
  }, []);

  const checkReaction = async (brand: string) => {
    if (!brand || brand.length < 3) return;
    try {
      const res = await fetch('/api/vaccine_reactions/check', {
        method: 'POST',
        body: JSON.stringify({ pet_id: params.id, brand })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.hasReaction) {
          setReactionWarning({
            severity: data.record.severity,
            date: data.record.reaction_date
          });
        } else {
          setReactionWarning(null);
        }
      }
    } catch (e) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error(e);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Reaction Warning */}
      {reactionWarning && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" aria-hidden="true" />
          <div>
            <h4 className="font-bold text-red-700">¡Advertencia de Reacción Previa!</h4>
            <p className="text-sm text-red-600 mt-1">
              Este paciente registró una reacción <strong>{reactionWarning.severity.toUpperCase()}</strong> a esta vacuna el {new Date(reactionWarning.date).toLocaleDateString()}.
            </p>
            <p className="text-xs text-red-500 mt-2 font-medium">Proceda con extrema precaución o considere alternativas.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/${params.clinic}/portal/pets/${params.id}`} className="p-2 rounded-xl hover:bg-white transition-colors" aria-label="Volver al perfil de mascota">
          <ArrowLeft className="w-6 h-6 text-[var(--text-secondary)]" aria-hidden="true" />
        </Link>
        <div>
          <h1 className="text-3xl font-black font-heading text-[var(--text-primary)]">Nueva Vacuna</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Registra una vacuna aplicada a tu mascota</p>
        </div>
      </div>

      {/* Global error message */}
      {state && !state.success && (
        <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold">No se pudo guardar</p>
            <p className="text-sm mt-1">{state.error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="clinic" value={params.clinic} />
          <input type="hidden" name="petId" value={params.id} />

          {/* Required fields notice */}
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] pb-2 border-b border-gray-100">
            <Info className="w-4 h-4" aria-hidden="true" />
            <span>Los campos marcados con <span className="text-red-500">*</span> son obligatorios</span>
          </div>

          {/* Photo Upload Section */}
          <div>
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
              <Camera className="w-4 h-4 inline mr-1" aria-hidden="true" />
              Fotos de la Libreta / Sticker
            </label>
            <p className="text-xs text-[var(--text-muted)] mb-3">
              Sube fotos del sticker de la vacuna o de la libreta sanitaria. Esto ayuda a verificar la vacunación.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {photos.map((photo, idx) => (
                <div key={photo.preview} className={`relative aspect-square rounded-2xl overflow-hidden border-2 group ${photo.status === 'invalid' ? 'border-red-500' : photo.status === 'valid' ? 'border-green-500' : 'border-gray-200'}`}>
                  <img src={photo.preview} alt={`Vista previa ${idx + 1}`} className="w-full h-full object-cover" />

                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-center backdrop-blur-sm">
                    {photo.status === 'validating' && <span className="text-xs text-white flex items-center justify-center gap-1"><Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" /> Procesando...</span>}
                    {photo.status === 'valid' && <span className="text-xs text-green-400 font-bold flex items-center justify-center gap-1"><Check className="w-3 h-3" aria-hidden="true" /> Lista</span>}
                    {photo.status === 'invalid' && <span className="text-xs text-red-400 font-bold flex items-center justify-center gap-1"><X className="w-3 h-3" aria-hidden="true" /> Rechazada</span>}
                  </div>

                  {photo.error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4 text-center">
                      <p className="text-xs text-white font-medium">{photo.error}</p>
                    </div>
                  )}

                  <button type="button" onClick={() => removePhoto(idx)} aria-label={`Eliminar foto ${idx + 1}`} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <label className="aspect-square rounded-2xl border-2 border-dashed border-[var(--primary)]/30 bg-[var(--primary)]/5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[var(--primary)]/10 transition-colors">
                <Camera className="w-8 h-8 text-[var(--primary)]" aria-hidden="true" />
                <span className="text-xs font-bold text-[var(--primary)]">Agregar Foto</span>
                <span className="text-[10px] text-[var(--text-muted)]">JPG, PNG, WebP</span>
                <input
                  type="file"
                  name="photos"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            </div>

            <FieldError error={fieldErrors.photos} />

            {hasInvalidPhotos && (
              <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                Elimina las fotos rechazadas antes de continuar
              </p>
            )}
          </div>

          {/* Vaccine Details Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Syringe className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" />
              Datos de la Vacuna
            </h3>

            <div>
              <label htmlFor="name" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                Nombre de la Vacuna <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                required
                type="text"
                onBlur={(e) => checkReaction(e.target.value)}
                placeholder="Ej: Séxtuple, Antirrábica, Triple Felina"
                className={inputClass(!!fieldErrors.name)}
                aria-invalid={!!fieldErrors.name}
              />
              <FieldError error={fieldErrors.name} />
              <FieldHint>Escribe el nombre tal como aparece en el sticker o certificado</FieldHint>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                  <Calendar className="w-3 h-3 inline mr-1" aria-hidden="true" />
                  Fecha de Aplicación <span className="text-red-500">*</span>
                </label>
                <input
                  id="date"
                  name="date"
                  required
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  className={inputClass(!!fieldErrors.date)}
                  aria-invalid={!!fieldErrors.date}
                />
                <FieldError error={fieldErrors.date} />
              </div>
              <div>
                <label htmlFor="nextDate" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                  <Calendar className="w-3 h-3 inline mr-1" aria-hidden="true" />
                  Próxima Dosis
                </label>
                <input
                  id="nextDate"
                  name="nextDate"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className={inputClass(!!fieldErrors.nextDate)}
                  aria-invalid={!!fieldErrors.nextDate}
                />
                <FieldError error={fieldErrors.nextDate} />
                <FieldHint>Te recordaremos cuando se acerque la fecha</FieldHint>
              </div>
            </div>

            <div>
              <label htmlFor="batch" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Número de Lote</label>
              <input
                id="batch"
                name="batch"
                type="text"
                placeholder="Ej: A-12345, LOT2024001"
                className={inputClass(!!fieldErrors.batch)}
                aria-invalid={!!fieldErrors.batch}
              />
              <FieldError error={fieldErrors.batch} />
              <FieldHint>Opcional. Lo encontrarás en el sticker o certificado de la vacuna</FieldHint>
            </div>
          </div>

          {/* Certificate Upload Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
                <FileText className="w-4 h-4 inline mr-1" aria-hidden="true" />
                Certificado de Vacunación
              </label>
              <p className="text-xs text-[var(--text-muted)] mb-3">
                Opcional. Útil para viajes internacionales o requisitos especiales.
              </p>

              {certificate ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-700 truncate">{certificate.name}</p>
                    <p className="text-xs text-green-600">
                      {(certificate.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeCertificate}
                    aria-label="Eliminar certificado"
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[var(--primary)]/50 hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      Subir certificado
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      PDF, JPG, PNG o WebP • Max 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    name="certificate"
                    accept=".pdf,image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleCertificateSelect}
                    className="hidden"
                  />
                </label>
              )}

              {(certificateError || fieldErrors.certificate) && (
                <FieldError error={certificateError || fieldErrors.certificate} />
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="text-sm text-blue-800">
                <p className="font-bold">Consejos para el registro:</p>
                <ul className="mt-1 space-y-1 list-disc list-inside text-blue-700">
                  <li>Toma una foto clara del sticker de la vacuna</li>
                  <li>Asegúrate que se lea la fecha y el nombre</li>
                  <li>Si la vacuna fue aplicada por un veterinario, será verificada automáticamente</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || hasInvalidPhotos || isValidatingPhotos}
            className="w-full bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" aria-hidden="true" />
                <span>Guardando...</span>
              </>
            ) : (
              "Guardar en Libreta"
            )}
          </button>

          {(hasInvalidPhotos || isValidatingPhotos) && (
            <p className="text-center text-xs text-amber-600 font-medium">
              {isValidatingPhotos ? "Procesando fotos..." : "Elimina las fotos rechazadas para continuar"}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
