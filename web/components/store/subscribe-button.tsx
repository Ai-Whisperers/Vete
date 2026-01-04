'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RefreshCw, Loader2, ChevronDown, Check, X } from 'lucide-react';
import { clsx } from 'clsx';

interface SubscribeButtonProps {
  productId: string;
  productName: string;
  price: number;
  variantId?: string | null;
  variantName?: string | null;
  className?: string;
  compact?: boolean;
}

const FREQUENCY_OPTIONS = [
  { value: 14, label: '2 semanas' },
  { value: 30, label: '1 mes' },
  { value: 45, label: '6 semanas' },
  { value: 60, label: '2 meses' },
  { value: 90, label: '3 meses' },
];

export default function SubscribeButton({
  productId,
  productName,
  price,
  variantId,
  variantName,
  className,
  compact = false,
}: SubscribeButtonProps) {
  const { clinic } = useParams() as { clinic: string };
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [frequency, setFrequency] = useState(30);

  const formatPrice = (p: number): string => {
    return `Gs ${p.toLocaleString('es-PY')}`;
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/store/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinic,
          product_id: productId,
          variant_id: variantId || null,
          quantity,
          frequency_days: frequency,
        }),
      });

      if (res.status === 401) {
        // User not logged in, redirect to login
        router.push(`/${clinic}/portal/login?returnTo=/${clinic}/store/product/${productId}`);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.details?.message || 'Error al crear suscripción');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 2000);

    } catch (e) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Subscribe error:', e);
      }
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={clsx(
        'flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white font-bold rounded-xl',
        className
      )}>
        <Check className="w-5 h-5" />
        ¡Suscripción creada!
      </div>
    );
  }

  if (compact && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={clsx(
          'flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-purple-200 text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition',
          className
        )}
      >
        <RefreshCw className="w-4 h-4" />
        Suscribirse
      </button>
    );
  }

  return (
    <div className={clsx('relative', className)}>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-purple-200 text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Suscribirse y Ahorrar</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      )}

      {/* Subscription Form */}
      {isOpen && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-purple-900">Auto-envío</span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setError(null);
              }}
              className="p-1 hover:bg-purple-100 rounded-lg transition"
            >
              <X className="w-5 h-5 text-purple-600" />
            </button>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-purple-900 mb-1.5">
              Cantidad
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-lg border border-purple-200 bg-white flex items-center justify-center hover:bg-purple-100 transition"
              >
                -
              </button>
              <span className="w-12 text-center font-bold text-lg text-purple-900">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(10, q + 1))}
                className="w-10 h-10 rounded-lg border border-purple-200 bg-white flex items-center justify-center hover:bg-purple-100 transition"
              >
                +
              </button>
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-purple-900 mb-1.5">
              Entregar cada
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 border border-purple-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-400 outline-none"
            >
              {FREQUENCY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <div className="flex justify-between text-sm">
              <span className="text-purple-700">
                {quantity} x {productName}
                {variantName && <span className="text-purple-500"> ({variantName})</span>}
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-purple-700">Cada {FREQUENCY_OPTIONS.find(o => o.value === frequency)?.label}</span>
              <span className="font-bold text-purple-900">{formatPrice(price * quantity)}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Subscribe Button */}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Iniciar Suscripción
              </>
            )}
          </button>

          <p className="text-xs text-purple-600 text-center">
            Puedes pausar o cancelar en cualquier momento
          </p>
        </div>
      )}
    </div>
  );
}
