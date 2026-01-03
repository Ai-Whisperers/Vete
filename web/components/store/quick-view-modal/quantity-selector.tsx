'use client';

import { Minus, Plus } from 'lucide-react';
import type { QuantitySelectorProps } from './types';

export function QuantitySelector({
  quantity,
  stock,
  onChange,
}: QuantitySelectorProps): React.ReactElement {
  const decrease = (): void => {
    onChange(Math.max(1, quantity - 1));
  };

  const increase = (): void => {
    onChange(Math.min(stock, quantity + 1));
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="text-sm font-medium text-[var(--text-secondary)]">
        Cantidad:
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={decrease}
          disabled={quantity <= 1}
          className="p-2 rounded-lg border border-[var(--border-default)] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Disminuir cantidad"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-12 text-center font-bold text-lg">{quantity}</span>
        <button
          onClick={increase}
          disabled={quantity >= stock}
          className="p-2 rounded-lg border border-[var(--border-default)] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Aumentar cantidad"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
