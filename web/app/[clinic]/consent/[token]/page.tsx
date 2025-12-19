"use client";

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import SigningForm, { SigningFormData } from '@/components/consents/signing-form';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface ConsentRequest {
  id: string;
  template_id: string;
  pet_id: string;
  owner_id: string;
  token: string;
  expires_at: string;
  status: string;
  template: {
    id: string;
    name: string;
    category: string;
    content: string;
    requires_witness: boolean;
    requires_id_verification: boolean;
    fields?: any[];
  };
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string;
    owner_id: string;
  };
  owner: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
}

export default function RemoteSigningPage(): JSX.Element {
  const [request, setRequest] = useState<ConsentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const token = params?.token as string;

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async (): Promise<void> => {
    try {
      // Fetch consent request by token (no auth required)
      const { data, error } = await supabase
        .from('consent_requests')
        .select(`
          *,
          template:consent_templates!template_id(
            id,
            name,
            category,
            content,
            requires_witness,
            requires_id_verification,
            fields:consent_template_fields(*)
          ),
          pet:pets!pet_id(id, name, species, breed, owner_id),
          owner:profiles!owner_id(id, full_name, email, phone)
        `)
        .eq('token', token)
        .single();

      if (error || !data) {
        setError('Token inválido o expirado');
        setLoading(false);
        return;
      }

      // Check if already completed
      if (data.status === 'completed') {
        setError('Este consentimiento ya ha sido firmado');
        setLoading(false);
        return;
      }

      // Check if expired
      const expiresAt = new Date(data.expires_at);
      const now = new Date();
      if (now > expiresAt) {
        setError('Este enlace ha expirado');
        setLoading(false);
        return;
      }

      setRequest(data as any);
    } catch (err) {
      console.error('Error validating token:', err);
      setError('Error al validar el enlace');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: SigningFormData): Promise<void> => {
    if (!request) return;

    try {
      // Create consent document (no auth required for remote signing)
      const response = await fetch('/api/consents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al crear consentimiento');
      }

      // Update consent request status
      await supabase
        .from('consent_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', request.id);

      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting consent:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-default)] p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
          <p className="mt-4 text-[var(--text-secondary)]">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-default)] p-4">
        <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-12 text-center max-w-md">
          {error.includes('expirado') ? (
            <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          ) : error.includes('firmado') ? (
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          ) : (
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            {error.includes('firmado') ? 'Ya firmado' : 'Error'}
          </h1>
          <p className="text-[var(--text-secondary)]">{error}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-4">
            Por favor, contacte con la clínica veterinaria si necesita asistencia.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-default)] p-4">
        <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-12 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Consentimiento firmado exitosamente
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">
            Gracias por completar el formulario de consentimiento. Su firma ha sido registrada de forma
            segura.
          </p>
          <div className="bg-[var(--primary)]/10 rounded-lg p-4 mb-6">
            <p className="text-sm text-[var(--text-primary)]">
              <strong>Mascota:</strong> {request?.pet.name}
            </p>
            <p className="text-sm text-[var(--text-primary)]">
              <strong>Documento:</strong> {request?.template.name}
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Recibirá una copia del consentimiento firmado por email.
            </p>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Puede cerrar esta ventana de forma segura.
          </p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-default)] p-4">
        <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">No se pudo cargar la solicitud</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-default)] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2">
            Firma de Consentimiento Informado
          </h1>
          <p className="text-[var(--text-secondary)]">
            Por favor, lea cuidadosamente el documento y proporcione su firma digital para confirmar su
            consentimiento.
          </p>

          {/* Request Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-[var(--bg-default)] rounded-lg">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Mascota</p>
              <p className="font-medium text-[var(--text-primary)]">{request.pet.name}</p>
              <p className="text-xs text-[var(--text-secondary)]">
                {request.pet.species} - {request.pet.breed}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Propietario</p>
              <p className="font-medium text-[var(--text-primary)]">{request.owner.full_name}</p>
              <p className="text-xs text-[var(--text-secondary)]">{request.owner.email}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Válido hasta</p>
              <p className="font-medium text-[var(--text-primary)]">
                {new Date(request.expires_at).toLocaleDateString('es-PY')}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                {new Date(request.expires_at).toLocaleTimeString('es-PY', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Firma segura</p>
              <p className="text-xs mt-1">
                Su firma será almacenada de forma segura y encriptada. Este documento tiene validez legal.
              </p>
            </div>
          </div>
        </div>

        {/* Signing Form */}
        <SigningForm
          template={request.template as any}
          pet={request.pet}
          owner={request.owner}
          onSubmit={handleSubmit}
          onCancel={() => {
            if (confirm('¿Está seguro que desea cancelar? Perderá todo el progreso.')) {
              window.close();
            }
          }}
        />

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-[var(--text-secondary)]">
          <p>
            Al firmar este documento, usted confirma que ha leído y comprendido toda la información
            proporcionada.
          </p>
          <p className="mt-2">
            Si tiene preguntas, por favor contacte con la clínica veterinaria antes de firmar.
          </p>
        </div>
      </div>
    </div>
  );
}
