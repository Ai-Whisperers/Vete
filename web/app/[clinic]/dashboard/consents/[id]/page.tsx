"use client";

import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { pdf } from '@react-pdf/renderer';
import { ConsentPDF } from '@/components/consents/consent-pdf';
import {
  FileText,
  Calendar,
  User,
  AlertCircle,
  Download,
  Mail,
  XCircle,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  action: string;
  created_at: string;
  details: any;
  performed_by: {
    full_name: string;
  };
}

interface ConsentDocument {
  id: string;
  status: string;
  custom_content: string | null;
  field_values: Record<string, any>;
  signature_data: string;
  signed_at: string;
  signed_by_id: string;
  witness_signature_data: string | null;
  witness_name: string | null;
  id_verification_type: string | null;
  id_verification_number: string | null;
  expires_at: string | null;
  can_be_revoked: boolean;
  revoked_at: string | null;
  revoked_by_id: string | null;
  revocation_reason: string | null;
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string;
  };
  owner: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
  template: {
    id: string;
    name: string;
    category: string;
    content: string;
    requires_witness: boolean;
    can_be_revoked: boolean;
  };
  signed_by_user: {
    id: string;
    full_name: string;
  };
  audit_log: AuditLogEntry[];
}

export default function ConsentDetailPage(): JSX.Element {
  const [consent, setConsent] = useState<ConsentDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revocationReason, setRevocationReason] = useState('');
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  const consentId = params?.id as string;

  useEffect(() => {
    if (consentId) {
      fetchConsent();
    }
  }, [consentId]);

  const fetchConsent = async (): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/');
        return;
      }

      const response = await fetch(`/api/consents/${consentId}`);
      if (!response.ok) {
        throw new Error('Error al cargar consentimiento');
      }

      const data = await response.json();
      setConsent(data);
    } catch (error) {
      console.error('Error fetching consent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (): Promise<void> => {
    if (!consent) return;

    setRevoking(true);

    try {
      const response = await fetch(`/api/consents/${consent.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'revoke',
          reason: revocationReason
        })
      });

      if (!response.ok) {
        throw new Error('Error al revocar consentimiento');
      }

      // Refresh consent data
      await fetchConsent();
      setShowRevokeModal(false);
      setRevocationReason('');
    } catch (error) {
      console.error('Error revoking consent:', error);
      alert('Error al revocar el consentimiento');
    } finally {
      setRevoking(false);
    }
  };

  const handleDownloadPDF = async (): Promise<void> => {
    if (!consent) return;

    try {
      // Generate PDF blob
      const blob = await pdf(
        <ConsentPDF
          clinicName={consent.template.name}
          templateName={consent.template.name}
          templateCategory={consent.template.category}
          documentNumber={consent.id.substring(0, 8).toUpperCase()}
          petName={consent.pet.name}
          petSpecies={consent.pet.species}
          petBreed={consent.pet.breed}
          ownerName={consent.owner.full_name}
          ownerEmail={consent.owner.email}
          ownerPhone={consent.owner.phone || ''}
          content={renderContent()}
          fieldValues={consent.field_values}
          signatureData={consent.signature_data}
          signedAt={consent.signed_at}
          witnessName={consent.witness_name || undefined}
          witnessSignatureData={consent.witness_signature_data || undefined}
          idVerificationType={consent.id_verification_type || undefined}
          idVerificationNumber={consent.id_verification_number || undefined}
          status={consent.status}
        />
      ).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `consentimiento-${consent.pet.name}-${new Date(consent.signed_at).toLocaleDateString('es-PY')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Log download action
      await fetch(`/api/consents/${consent.id}/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'downloaded'
        })
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF');
    }
  };

  const handleSendEmail = async (): Promise<void> => {
    if (!consent?.owner?.email) {
      alert('El propietario no tiene correo electrónico registrado');
      return;
    }

    if (!confirm(`¿Enviar el consentimiento firmado a ${consent.owner.email}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/consents/${consentId}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar email');
      }

      alert(`Email enviado exitosamente a ${consent.owner.email}`);

      // Refresh to update audit log
      fetchConsent();
    } catch (error) {
      console.error('Error sending email:', error);
      alert(error instanceof Error ? error.message : 'Error al enviar email');
    }
  };

  const renderContent = (): string => {
    if (!consent) return '';

    let content = consent.custom_content || consent.template.content;

    // Replace pet placeholders
    content = content.replace(/{{pet_name}}/g, consent.pet.name);
    content = content.replace(/{{pet_species}}/g, consent.pet.species);
    content = content.replace(/{{pet_breed}}/g, consent.pet.breed);

    // Replace owner placeholders
    content = content.replace(/{{owner_name}}/g, consent.owner.full_name);
    content = content.replace(/{{owner_email}}/g, consent.owner.email);
    content = content.replace(/{{owner_phone}}/g, consent.owner.phone || '');

    // Replace custom field placeholders
    if (consent.field_values) {
      Object.keys(consent.field_values).forEach((key) => {
        const value = consent.field_values[key];
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
      });
    }

    // Replace date placeholder
    content = content.replace(/{{date}}/g, new Date(consent.signed_at).toLocaleDateString('es-PY'));

    return content;
  };

  const getStatusBadge = (status: string): JSX.Element => {
    const statusConfig: Record<string, { color: string; icon: JSX.Element; label: string }> = {
      active: {
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="w-5 h-5" />,
        label: 'Activo'
      },
      expired: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: <Clock className="w-5 h-5" />,
        label: 'Expirado'
      },
      revoked: {
        color: 'bg-red-100 text-red-800',
        icon: <XCircle className="w-5 h-5" />,
        label: 'Revocado'
      }
    };

    const config = statusConfig[status] || statusConfig.active;

    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </div>
    );
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      surgery: 'Cirugía',
      anesthesia: 'Anestesia',
      euthanasia: 'Eutanasia',
      boarding: 'Hospedaje',
      treatment: 'Tratamiento',
      vaccination: 'Vacunación',
      diagnostic: 'Diagnóstico',
      other: 'Otro'
    };
    return labels[category] || category;
  };

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      signed: 'Firmado',
      revoked: 'Revocado',
      viewed: 'Visualizado',
      downloaded: 'Descargado',
      sent: 'Enviado'
    };
    return labels[action] || action;
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
            <p className="mt-4 text-[var(--text-secondary)]">Cargando consentimiento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!consent) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Consentimiento no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
              {consent.template.name}
            </h1>
            <p className="text-[var(--text-secondary)] mt-1">
              {getCategoryLabel(consent.template.category)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-paper)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--primary)]/10 transition-colors border border-[var(--primary)]/20"
            >
              <Download className="w-4 h-4" />
              Descargar PDF
            </button>
            <button
              onClick={handleSendEmail}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-paper)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--primary)]/10 transition-colors border border-[var(--primary)]/20"
            >
              <Mail className="w-4 h-4" />
              Enviar por email
            </button>
            {consent.can_be_revoked && consent.status === 'active' && (
              <button
                onClick={() => setShowRevokeModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Revocar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status */}
          <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Estado</h2>
              {getStatusBadge(consent.status)}
            </div>
            {consent.status === 'revoked' && consent.revocation_reason && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Motivo de revocación:</strong> {consent.revocation_reason}
                </p>
                {consent.revoked_at && (
                  <p className="text-xs text-red-600 mt-2">
                    Revocado el {new Date(consent.revoked_at).toLocaleString('es-PY')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Document Content */}
          <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Documento
            </h2>
            <div
              className="prose max-w-none text-[var(--text-primary)]"
              dangerouslySetInnerHTML={{ __html: renderContent() }}
            />
          </div>

          {/* Signatures */}
          <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Firmas</h2>

            <div className="space-y-6">
              {/* Owner Signature */}
              <div>
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Firma del propietario
                </h3>
                <div className="border border-[var(--primary)]/20 rounded-lg p-4 bg-white">
                  {consent.signature_data.startsWith('data:image') ? (
                    <img
                      src={consent.signature_data}
                      alt="Firma del propietario"
                      className="max-h-32"
                    />
                  ) : (
                    <p className="text-2xl font-serif" style={{ fontFamily: 'cursive' }}>
                      {consent.signature_data}
                    </p>
                  )}
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  {consent.owner.full_name} - {new Date(consent.signed_at).toLocaleString('es-PY')}
                </p>
              </div>

              {/* Witness Signature */}
              {consent.witness_signature_data && (
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Firma del testigo
                  </h3>
                  <div className="border border-[var(--primary)]/20 rounded-lg p-4 bg-white">
                    {consent.witness_signature_data.startsWith('data:image') ? (
                      <img
                        src={consent.witness_signature_data}
                        alt="Firma del testigo"
                        className="max-h-32"
                      />
                    ) : (
                      <p className="text-2xl font-serif" style={{ fontFamily: 'cursive' }}>
                        {consent.witness_signature_data}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-2">
                    {consent.witness_name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Audit Log */}
          {consent.audit_log && consent.audit_log.length > 0 && (
            <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Historial de auditoría
              </h2>
              <div className="space-y-3">
                {consent.audit_log.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 p-3 bg-[var(--bg-default)] rounded-lg"
                  >
                    <div className="mt-1">
                      <Shield className="w-4 h-4 text-[var(--primary)]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {getActionLabel(entry.action)}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Por {entry.performed_by.full_name} -{' '}
                        {new Date(entry.created_at).toLocaleString('es-PY')}
                      </p>
                      {entry.details && Object.keys(entry.details).length > 0 && (
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                          {JSON.stringify(entry.details)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pet Info */}
          <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Mascota</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Nombre</p>
                <p className="font-medium text-[var(--text-primary)]">{consent.pet.name}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Especie</p>
                <p className="font-medium text-[var(--text-primary)]">{consent.pet.species}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Raza</p>
                <p className="font-medium text-[var(--text-primary)]">{consent.pet.breed}</p>
              </div>
            </div>
          </div>

          {/* Owner Info */}
          <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Propietario</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Nombre</p>
                <p className="font-medium text-[var(--text-primary)]">{consent.owner.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Email</p>
                <p className="font-medium text-[var(--text-primary)]">{consent.owner.email}</p>
              </div>
              {consent.owner.phone && (
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Teléfono</p>
                  <p className="font-medium text-[var(--text-primary)]">{consent.owner.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Fechas</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-[var(--primary)] mt-1" />
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Firmado</p>
                  <p className="font-medium text-[var(--text-primary)]">
                    {new Date(consent.signed_at).toLocaleString('es-PY')}
                  </p>
                </div>
              </div>
              {consent.expires_at && (
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-[var(--primary)] mt-1" />
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Expira</p>
                    <p className="font-medium text-[var(--text-primary)]">
                      {new Date(consent.expires_at).toLocaleString('es-PY')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ID Verification */}
          {consent.id_verification_type && consent.id_verification_number && (
            <div className="bg-[var(--bg-paper)] rounded-lg border border-[var(--primary)]/20 p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Verificación de identidad
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Tipo de documento</p>
                  <p className="font-medium text-[var(--text-primary)]">
                    {consent.id_verification_type.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Número</p>
                  <p className="font-medium text-[var(--text-primary)]">
                    {consent.id_verification_number}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Revoke Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-paper)] rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
              Revocar Consentimiento
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              ¿Está seguro que desea revocar este consentimiento? Esta acción quedará registrada en el
              historial de auditoría.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Motivo de revocación (opcional)
              </label>
              <textarea
                value={revocationReason}
                onChange={(e) => setRevocationReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-[var(--primary)]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--bg-default)] text-[var(--text-primary)]"
                placeholder="Describa el motivo..."
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowRevokeModal(false)}
                disabled={revoking}
                className="px-4 py-2 bg-[var(--bg-default)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--primary)]/10 transition-colors border border-[var(--primary)]/20 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRevoke}
                disabled={revoking}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {revoking ? 'Revocando...' : 'Confirmar revocación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
