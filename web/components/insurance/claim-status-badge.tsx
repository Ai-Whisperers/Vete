"use client";

interface ClaimStatusBadgeProps {
  status: string;
  className?: string;
}

export default function ClaimStatusBadge({ status, className = '' }: ClaimStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    const configs: { [key: string]: { label: string; color: string } } = {
      draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-700' },
      pending_documents: { label: 'Docs. Pendientes', color: 'bg-orange-100 text-orange-700' },
      submitted: { label: 'Enviado', color: 'bg-blue-100 text-blue-700' },
      under_review: { label: 'En Revisión', color: 'bg-yellow-100 text-yellow-700' },
      approved: { label: 'Aprobado', color: 'bg-green-100 text-green-700' },
      partially_approved: { label: 'Parcialmente Aprobado', color: 'bg-green-100 text-green-600' },
      denied: { label: 'Denegado', color: 'bg-red-100 text-red-700' },
      paid: { label: 'Pagado', color: 'bg-emerald-100 text-emerald-700' },
      appealed: { label: 'Apelado', color: 'bg-purple-100 text-purple-700' },
      closed: { label: 'Cerrado', color: 'bg-gray-100 text-gray-600' }
    };

    return configs[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${className}`}
    >
      {config.label}
    </span>
  );
}
