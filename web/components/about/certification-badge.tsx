"use client";

import { useState } from 'react';
import { BadgeCheck } from 'lucide-react';

interface CertificationBadgeProps {
  name: string;
  description: string;
  logo?: string;
}

export function CertificationBadge({ name, description, logo }: CertificationBadgeProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-w-[180px] max-w-[220px]">
      <div className="w-16 h-16 mb-4 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
        {logo && !imageError ? (
          <img
            src={logo}
            alt={`Logo de certificacion ${name}`}
            className="w-10 h-10 object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <BadgeCheck className="w-8 h-8 text-[var(--primary)]" aria-hidden="true" />
        )}
      </div>
      <h3 className="font-bold text-[var(--text-primary)] text-center mb-1">{name}</h3>
      <p className="text-xs text-[var(--text-muted)] text-center">{description}</p>
    </div>
  );
}
