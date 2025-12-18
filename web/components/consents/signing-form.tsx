"use client";

import type { JSX } from 'react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Edit3, Type, RotateCcw, Check, AlertCircle } from 'lucide-react';
import DOMPurify from 'dompurify'; // TICKET-ERR-003: XSS protection

interface TemplateField {
  id: string;
  field_name: string;
  field_type: string;
  field_label: string;
  is_required: boolean;
  field_options: string[] | null;
}

interface ConsentTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  requires_witness: boolean;
  requires_id_verification: boolean;
  fields?: TemplateField[];
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  owner_id: string;
}

interface Owner {
  id: string;
  full_name: string;
  email: string;
  phone: string;
}

interface SigningFormProps {
  template: ConsentTemplate;
  pet: Pet;
  owner: Owner;
  onSubmit: (data: SigningFormData) => Promise<void>;
  onCancel: () => void;
}

export interface SigningFormData {
  template_id: string;
  pet_id: string;
  owner_id: string;
  field_values: Record<string, any>;
  signature_data: string;
  witness_signature_data?: string;
  witness_name?: string;
  id_verification_type?: string;
  id_verification_number?: string;
}

export default function SigningForm({
  template,
  pet,
  owner,
  onSubmit,
  onCancel
}: SigningFormProps): JSX.Element {
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [signatureText, setSignatureText] = useState('');
  const [witnessSignatureMode, setWitnessSignatureMode] = useState<'draw' | 'type'>('draw');
  const [witnessSignatureText, setWitnessSignatureText] = useState('');
  const [witnessName, setWitnessName] = useState('');
  const [idVerificationType, setIdVerificationType] = useState('');
  const [idVerificationNumber, setIdVerificationNumber] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isWitnessDrawing, setIsWitnessDrawing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // TICKET-FORM-002: Replace alert() with proper error state
  const [formError, setFormError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const witnessCanvasRef = useRef<HTMLCanvasElement>(null);

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

  useEffect(() => {
    if (witnessCanvasRef.current && witnessSignatureMode === 'draw') {
      const canvas = witnessCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }
    }
  }, [witnessSignatureMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, isWitness = false): void => {
    const canvas = isWitness ? witnessCanvasRef.current : canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isWitness) {
      setIsWitnessDrawing(true);
    } else {
      setIsDrawing(true);
    }

    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, isWitness = false): void => {
    if (isWitness ? !isWitnessDrawing : !isDrawing) return;

    const canvas = isWitness ? witnessCanvasRef.current : canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (isWitness = false): void => {
    if (isWitness) {
      setIsWitnessDrawing(false);
    } else {
      setIsDrawing(false);
    }
  };

  const clearSignature = (isWitness = false): void => {
    const canvas = isWitness ? witnessCanvasRef.current : canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getSignatureData = (isWitness = false): string => {
    if (isWitness) {
      if (witnessSignatureMode === 'draw') {
        return witnessCanvasRef.current?.toDataURL() || '';
      }
      return witnessSignatureText;
    } else {
      if (signatureMode === 'draw') {
        return canvasRef.current?.toDataURL() || '';
      }
      return signatureText;
    }
  };

  const renderContent = (): string => {
    let content = template.content;

    // Replace pet placeholders
    content = content.replace(/{{pet_name}}/g, pet.name);
    content = content.replace(/{{pet_species}}/g, pet.species);
    content = content.replace(/{{pet_breed}}/g, pet.breed);

    // Replace owner placeholders
    content = content.replace(/{{owner_name}}/g, owner.full_name);
    content = content.replace(/{{owner_email}}/g, owner.email);
    content = content.replace(/{{owner_phone}}/g, owner.phone || '');

    // Replace custom field placeholders
    Object.keys(fieldValues).forEach((key) => {
      const value = fieldValues[key];
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
    });

    // Replace date placeholder
    content = content.replace(/{{date}}/g, new Date().toLocaleDateString('es-PY'));

    return content;
  };

  // TICKET-TYPE-004: Use union type instead of any for field values
  const handleFieldChange = (fieldName: string, value: string | number | boolean | null): void => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // TICKET-FORM-002: Return error string instead of using alert()
  const validateForm = (): string | null => {
    // Validate required custom fields
    if (template.fields) {
      for (const field of template.fields) {
        if (field.is_required && !fieldValues[field.field_name]) {
          return `El campo "${field.field_label}" es requerido`;
        }
      }
    }

    // Validate signature
    const signatureData = getSignatureData();
    if (!signatureData) {
      return 'Debe proporcionar una firma';
    }

    // Validate witness signature if required
    if (template.requires_witness) {
      const witnessSignatureData = getSignatureData(true);
      if (!witnessSignatureData) {
        return 'Se requiere firma del testigo';
      }
      if (!witnessName.trim()) {
        return 'Debe ingresar el nombre del testigo';
      }
    }

    // Validate ID verification if required
    if (template.requires_id_verification) {
      if (!idVerificationType || !idVerificationNumber) {
        return 'Se requiere verificación de identidad';
      }
    }

    return null; // No errors
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    // TICKET-FORM-002: Clear previous errors and use error state
    setFormError(null);

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const data: SigningFormData = {
        template_id: template.id,
        pet_id: pet.id,
        owner_id: owner.id,
        field_values: fieldValues,
        signature_data: getSignatureData()
      };

      if (template.requires_witness) {
        data.witness_signature_data = getSignatureData(true);
        data.witness_name = witnessName;
      }

      if (template.requires_id_verification) {
        data.id_verification_type = idVerificationType;
        data.id_verification_number = idVerificationNumber;
      }

      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting consent:', error);
      // TICKET-FORM-002: Use error state instead of alert()
      setFormError(error instanceof Error ? error.message : 'Error al enviar el consentimiento');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* TICKET-FORM-002, TICKET-A11Y-004: Error Display with accessibility */}
      {formError && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <p className="font-medium">{formError}</p>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="ml-auto hover:opacity-70"
              aria-label="Cerrar mensaje de error"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Custom Fields */}
      {template.fields && template.fields.length > 0 && (
        <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Información adicional
          </h3>
          <div className="space-y-4">
            {template.fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  {field.field_label}
                  {field.is_required && <span className="text-red-600 ml-1">*</span>}
                </label>

                {field.field_type === 'text' && (
                  <input
                    type="text"
                    value={fieldValues[field.field_name] || ''}
                    onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                    required={field.is_required}
                    className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
                  />
                )}

                {field.field_type === 'textarea' && (
                  <textarea
                    value={fieldValues[field.field_name] || ''}
                    onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                    required={field.is_required}
                    rows={4}
                    className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
                  />
                )}

                {field.field_type === 'select' && field.field_options && (
                  <select
                    value={fieldValues[field.field_name] || ''}
                    onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                    required={field.is_required}
                    className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
                  >
                    <option value="">Seleccionar...</option>
                    {field.field_options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {field.field_type === 'date' && (
                  <input
                    type="date"
                    value={fieldValues[field.field_name] || ''}
                    onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                    required={field.is_required}
                    className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
                  />
                )}

                {field.field_type === 'number' && (
                  <input
                    type="number"
                    value={fieldValues[field.field_name] || ''}
                    onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                    required={field.is_required}
                    className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rendered Content */}
      <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Documento de consentimiento
        </h3>
        {/* TICKET-ERR-003: Sanitize HTML content to prevent XSS attacks */}
        <div
          className="prose max-w-none text-[var(--text-primary)]"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderContent()) }}
        />
      </div>

      {/* ID Verification */}
      {template.requires_id_verification && (
        <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Verificación de identidad
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Tipo de documento <span className="text-red-600">*</span>
              </label>
              <select
                value={idVerificationType}
                onChange={(e) => setIdVerificationType(e.target.value)}
                required
                className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
              >
                <option value="">Seleccionar...</option>
                <option value="ci">Cédula de Identidad</option>
                <option value="passport">Pasaporte</option>
                <option value="ruc">RUC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Número de documento <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={idVerificationNumber}
                onChange={(e) => setIdVerificationNumber(e.target.value)}
                required
                className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Owner Signature */}
      <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Firma del propietario <span className="text-red-600">*</span>
        </h3>

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
              height={200}
              onMouseDown={(e) => startDrawing(e)}
              onMouseMove={(e) => draw(e)}
              onMouseUp={() => stopDrawing()}
              onMouseLeave={() => stopDrawing()}
              onTouchStart={(e) => startDrawing(e)}
              onTouchMove={(e) => draw(e)}
              onTouchEnd={() => stopDrawing()}
              className="w-full border-2 border-dashed border-[var(--primary)]/20 rounded-lg cursor-crosshair bg-white"
            />
            <button
              type="button"
              onClick={() => clearSignature()}
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

      {/* Witness Signature */}
      {template.requires_witness && (
        <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Firma del testigo <span className="text-red-600">*</span>
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Nombre del testigo <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={witnessName}
              onChange={(e) => setWitnessName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
            />
          </div>

          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setWitnessSignatureMode('draw')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                witnessSignatureMode === 'draw'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--bg-default)] text-[var(--text-primary)] border border-[var(--primary)]/20'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              Dibujar
            </button>
            <button
              type="button"
              onClick={() => setWitnessSignatureMode('type')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                witnessSignatureMode === 'type'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--bg-default)] text-[var(--text-primary)] border border-[var(--primary)]/20'
              }`}
            >
              <Type className="w-4 h-4" />
              Escribir
            </button>
          </div>

          {witnessSignatureMode === 'draw' ? (
            <div className="space-y-2">
              <canvas
                ref={witnessCanvasRef}
                width={600}
                height={200}
                onMouseDown={(e) => startDrawing(e, true)}
                onMouseMove={(e) => draw(e, true)}
                onMouseUp={() => stopDrawing(true)}
                onMouseLeave={() => stopDrawing(true)}
                onTouchStart={(e) => startDrawing(e, true)}
                onTouchMove={(e) => draw(e, true)}
                onTouchEnd={() => stopDrawing(true)}
                className="w-full border-2 border-dashed border-[var(--primary)]/20 rounded-lg cursor-crosshair bg-white"
              />
              <button
                type="button"
                onClick={() => clearSignature(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <RotateCcw className="w-4 h-4" />
                Limpiar firma
              </button>
            </div>
          ) : (
            <input
              type="text"
              value={witnessSignatureText}
              onChange={(e) => setWitnessSignatureText(e.target.value)}
              placeholder="Escriba su nombre completo"
              className="w-full px-4 py-3 text-2xl font-serif border-2 border-dashed border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white text-black"
              style={{ fontFamily: 'cursive' }}
            />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--bg-default)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--primary)]/10 transition-colors border border-[var(--primary)]/20 disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Enviando...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Firmar y enviar
            </>
          )}
        </button>
      </div>
    </form>
  );
}
