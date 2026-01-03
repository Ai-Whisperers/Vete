'use client';

import { Truck, Shield, RotateCcw } from 'lucide-react';
import type { BenefitsGridProps } from './types';

interface Benefit {
  icon: typeof Truck;
  title: string;
  subtitle: string;
}

const BENEFITS: Benefit[] = [
  { icon: Truck, title: 'Envío Gratis', subtitle: '+150k Gs' },
  { icon: Shield, title: 'Garantía', subtitle: 'Calidad' },
  { icon: RotateCcw, title: 'Devolución', subtitle: '7 días' },
];

export function BenefitsGrid({ className = '' }: BenefitsGridProps): React.ReactElement {
  return (
    <div className={`grid grid-cols-3 gap-3 mb-6 ${className}`}>
      {BENEFITS.map(({ icon: Icon, title, subtitle }) => (
        <div
          key={title}
          className="flex flex-col items-center text-center p-3 bg-[var(--bg-subtle)] rounded-xl"
        >
          <Icon className="w-5 h-5 text-[var(--primary)] mb-1" />
          <span className="text-xs text-[var(--text-secondary)]">{title}</span>
          <span className="text-xs text-[var(--text-muted)]">{subtitle}</span>
        </div>
      ))}
    </div>
  );
}
