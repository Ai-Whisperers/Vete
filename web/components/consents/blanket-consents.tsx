"use client";

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Shield,
  Plus,
  XCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit3,
  Type,
  RotateCcw,
  X,
  Check
} from 'lucide-react';

interface BlanketConsent {
  id: string;
  consent_type: string;
  scope: string;
  conditions: string | null;
  signature_data: string;
  granted_at: string;
  expires_at: string | null;
  is_active: boolean;
  revoked_at: string | null;
  revocation_reason: string | null;
  granted_by: {
    full_name: string;
  };
}

interface BlanketConsentsProps {
  petId: string;
  ownerId: string;
  onUpdate?: () => void;
}

export default function BlanketConsents({
  petId,
  ownerId,
  onUpdate
}: BlanketConsentsProps): JSX.Element {
  const [consents, setConsents] = useState<BlanketConsent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [consentType, setConsentType] = useState('');
  const [scope, setScope] = useState('');
  const [conditions, setConditions] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [signatureText, setSignatureText] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchConsents();
  }, [petId, ownerId]);

  useEffect(() => {
    if (canvasRef.current && signatureMode === 'draw') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }
    }
  }, [signatureMode]);

  const fetchConsents = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/consents/blanket?pet_id=${petId}&owner_id=${ownerId}`);
      if (!response.ok) {
        throw new Error('Error al cargar consentimientos permanentes');
      }

      const data = await response.json();
      setConsents(data);
    } catch (error) {
      console.error('Error fetching blanket consents:', error);
    } finally {
      setLoading(false);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);

    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): void => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (): void => {
    setIsDrawing(false);
  };

  const clearSignature = (): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getSignatureData = (): string => {
    if (signatureMode === 'draw') {
      return canvasRef.current?.toDataURL() || '';
    }
    return signatureText;
  };

  const handleAdd = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const signatureData = getSignatureData();
    if (!signatureData) {
      alert('Debe proporcionar una firma');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/consents/blanket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pet_id: petId,
          owner_id: ownerId,
          consent_type: consentType,
          scope,
          conditions: conditions || null,
          signature_data: signatureData,
          expires_at: expiresAt || null
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear consentimiento permanente');
      }

      // Reset form
      setConsentType('');
      setScope('');
      setConditions('');
      setExpiresAt('');
      setSignatureText('');
      clearSignature();
      setShowAddModal(false);

      // Refresh list
      await fetchConsents();

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error adding blanket consent:', error);
      alert('Error al crear el consentimiento permanente');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (consentId: string): Promise<void> => {
    const reason = prompt('Motivo de revocación (opcional):');
    if (reason === null) return; // User cancelled

    try {
      const response = await fetch('/api/consents/blanket', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: consentId,
          action: 'revoke',
          reason
        })
      });

      if (!response.ok) {
        throw new Error('Error al revocar consentimiento');
      }

      // Refresh list
      await fetchConsents();

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error revoking blanket consent:', error);
      alert('Error al revocar el consentimiento');
    }
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      emergency_treatment: 'Tratamiento de Emergencia',
      routine_procedures: 'Procedimientos de Rutina',
      vaccination: 'Vacunación',
      diagnostic_tests: 'Pruebas Diagnósticas',
      grooming: 'Peluquería',
      boarding: 'Hospedaje',
      other: 'Otro'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto"></div>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[var(--primary)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Consentimientos Permanentes
          </h3>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-3 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </button>
      </div>

      {/* Consents List */}
      {consents.length === 0 ? (
        <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-8 text-center">
          <Shield className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3" />
          <p className="text-[var(--text-secondary)]">No hay consentimientos permanentes registrados</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            <Plus className="w-4 h-4" />
            Agregar primer consentimiento
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {consents.map((consent) => (
            <div
              key={consent.id}
              className={`bg-[var(--bg-paper)] rounded-lg border p-4 ${
                consent.is_active
                  ? 'border-[var(--primary)]/20'
                  : 'border-red-300 bg-red-50/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-[var(--text-primary)]">
                      {getTypeLabel(consent.consent_type)}
                    </h4>
                    {consent.is_active ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>

                  <p className="text-sm text-[var(--text-secondary)] mb-2">{consent.scope}</p>

                  {consent.conditions && (
                    <p className="text-xs text-[var(--text-secondary)] mb-2">
                      <strong>Condiciones:</strong> {consent.conditions}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                    <span>Firmado: {new Date(consent.granted_at).toLocaleDateString('es-PY')}</span>
                    {consent.expires_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Expira: {new Date(consent.expires_at).toLocaleDateString('es-PY')}
                      </span>
                    )}
                  </div>

                  {!consent.is_active && consent.revocation_reason && (
                    <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800">
                      <strong>Revocado:</strong> {consent.revocation_reason}
                    </div>
                  )}
                </div>

                {consent.is_active && (
                  <button
                    onClick={() => handleRevoke(consent.id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Revocar"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-paper)] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--bg-paper)] border-b border-[var(--primary)]/20 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                  Nuevo Consentimiento Permanente
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-6">
              {/* Consent Type */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Tipo de consentimiento <span className="text-red-600">*</span>
                </label>
                <select
                  value={consentType}
                  onChange={(e) => setConsentType(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
                >
                  <option value="">Seleccionar...</option>
                  <option value="emergency_treatment">Tratamiento de Emergencia</option>
                  <option value="routine_procedures">Procedimientos de Rutina</option>
                  <option value="vaccination">Vacunación</option>
                  <option value="diagnostic_tests">Pruebas Diagnósticas</option>
                  <option value="grooming">Peluquería</option>
                  <option value="boarding">Hospedaje</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              {/* Scope */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Alcance <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  required
                  rows={3}
                  placeholder="Describa el alcance de este consentimiento..."
                  className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
                />
              </div>

              {/* Conditions */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Condiciones (opcional)
                </label>
                <textarea
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  rows={2}
                  placeholder="Condiciones especiales o limitaciones..."
                  className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
                />
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Fecha de expiración (opcional)
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
                />
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Dejar vacío para consentimiento sin fecha de expiración
                </p>
              </div>

              {/* Signature */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Firma <span className="text-red-600">*</span>
                </label>

                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setSignatureMode('draw')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      signatureMode === 'draw'
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--bg-default)] text-[var(--text-primary)] border border-[var(--primary)]/20'
                    }`}
                  >
                    <Edit3 className="w-4 h-4" />
                    Dibujar
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignatureMode('type')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      signatureMode === 'type'
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--bg-default)] text-[var(--text-primary)] border border-[var(--primary)]/20'
                    }`}
                  >
                    <Type className="w-4 h-4" />
                    Escribir
                  </button>
                </div>

                {signatureMode === 'draw' ? (
                  <div className="space-y-2">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={150}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full border-2 border-dashed border-[var(--primary)]/20 rounded-lg cursor-crosshair bg-white"
                    />
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Limpiar firma
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                    placeholder="Escriba su nombre completo"
                    className="w-full px-4 py-3 text-2xl font-serif border-2 border-dashed border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white text-black"
                    style={{ fontFamily: 'cursive' }}
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t border-[var(--primary)]/20">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                  className="px-6 py-2 bg-[var(--bg-default)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--primary)]/10 transition-colors border border-[var(--primary)]/20 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Guardar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
