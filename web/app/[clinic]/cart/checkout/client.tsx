"use client";
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useCart } from '@/context/cart-context';
import Link from 'next/link';
import { ShoppingBag, Printer, MessageCircle, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import type { ClinicConfig } from '@/lib/clinics';

// TICKET-BIZ-003: Proper checkout with stock validation

interface StockError {
  id: string;
  name: string;
  requested: number;
  available: number;
}

interface CheckoutResult {
  success: boolean;
  invoice?: {
    id: string;
    invoice_number: string;
    total: number;
  };
  error?: string;
  stockErrors?: StockError[];
}

interface CheckoutClientProps {
  readonly config: ClinicConfig;
}

export default function CheckoutClient({ config }: CheckoutClientProps) {
  const { clinic } = useParams() as { clinic: string };
  const { user, loading } = useAuthRedirect();
  const { items, total, clearCart } = useCart();
  const labels = config.ui_labels?.checkout || {};
  const currency = config.settings?.currency || 'PYG';
  const whatsappNumber = config.contact?.whatsapp_number;

  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [stockErrors, setStockErrors] = useState<StockError[]>([]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return null;

  const handleCheckout = async () => {
    setIsProcessing(true);
    setCheckoutError(null);
    setStockErrors([]);

    try {
      const response = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            type: item.type,
            quantity: item.quantity
          })),
          clinic
        })
      });

      const result: CheckoutResult = await response.json();

      if (response.ok && result.success) {
        setCheckoutResult(result);
        clearCart();
      } else {
        setCheckoutError(result.error || 'Error al procesar el pedido');
        if (result.stockErrors) {
          setStockErrors(result.stockErrors);
        }
      }
    } catch (e) {
      setCheckoutError('Error de conexión. Por favor intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    globalThis?.print?.();
  };

  const generateWhatsAppLink = (invoiceNumber?: string) => {
    if (!whatsappNumber) return '#';

    let message = invoiceNumber
      ? `Hola *${config.name}*, acabo de realizar el pedido *${invoiceNumber}*.\n\n`
      : `Hola *${config.name}*, me gustaría realizar el siguiente pedido:\n\n`;

    if (!invoiceNumber) {
      items.forEach(item => {
        message += `• ${item.quantity}x ${item.name} (${item.type === 'service' ? 'Servicio' : 'Producto'})\n`;
      });
    }

    const formattedTotal = new Intl.NumberFormat('es-PY', { style: 'currency', currency: currency }).format(total);
    message += `\n*Total: ${formattedTotal}*\n`;
    message += `\nMis datos: ${user.email}`;

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  // Success state - order completed
  if (checkoutResult?.success) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] p-8">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-[var(--text-primary)]">¡Pedido Confirmado!</h1>
          <p className="text-[var(--text-secondary)] mb-2">
            Tu pedido ha sido procesado exitosamente.
          </p>
          <p className="text-lg font-bold text-[var(--primary)] mb-6">
            Número de pedido: {checkoutResult.invoice?.invoice_number}
          </p>

          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <p className="text-[var(--text-secondary)] mb-4">
              Total a pagar:
            </p>
            <p className="text-3xl font-bold text-[var(--primary)]">
              {new Intl.NumberFormat('es-PY', { style: 'currency', currency: currency }).format(checkoutResult.invoice?.total || 0)}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {whatsappNumber && (
              <a
                href={generateWhatsAppLink(checkoutResult.invoice?.invoice_number)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl hover:brightness-110 transition font-bold shadow-md"
              >
                <MessageCircle className="w-5 h-5" /> Coordinar entrega por WhatsApp
              </a>
            )}
            <Link
              href={`/${clinic}/store`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:brightness-110 transition font-bold"
            >
              Seguir comprando
            </Link>
            <Link
              href={`/${clinic}/portal/dashboard`}
              className="text-[var(--text-secondary)] hover:text-[var(--primary)]"
            >
              Ir al portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-default)] p-8">
      <h1 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">{labels.title || "Resumen del Pedido"}</h1>

      {/* Error display */}
      {checkoutError && (
        <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700">{checkoutError}</p>
            {stockErrors.length > 0 && (
              <ul className="mt-2 text-sm text-red-600">
                {stockErrors.map((err) => (
                  <li key={err.id}>
                    {err.name}: Solicitado {err.requested}, disponible {err.available}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-[var(--text-secondary)]">{labels.empty || "No hay items en el carrito."}</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded" />
                ) : (
                  <ShoppingBag className="w-12 h-12 text-[var(--primary)]" />
                )}
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{item.name}</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {item.type === 'service' ? 'Servicio' : 'Producto'} × {item.quantity}
                  </p>
                </div>
              </div>
              <span className="font-bold text-[var(--primary)]">
                {new Intl.NumberFormat('es-PY', { style: 'currency', currency: currency }).format(item.price * item.quantity)}
              </span>
            </div>
          ))}

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[var(--text-secondary)]">Subtotal</span>
              <span className="font-medium">{new Intl.NumberFormat('es-PY', { style: 'currency', currency: currency }).format(total)}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[var(--text-secondary)]">IVA (10%)</span>
              <span className="font-medium">{new Intl.NumberFormat('es-PY', { style: 'currency', currency: currency }).format(total * 0.1)}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-xl font-bold text-[var(--text-primary)]">Total</span>
              <span className="text-xl font-bold text-[var(--primary)]">
                {new Intl.NumberFormat('es-PY', { style: 'currency', currency: currency }).format(total * 1.1)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:brightness-110 transition font-bold shadow-md disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" /> Confirmar Pedido
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition font-bold"
            >
              <Printer className="w-5 h-5" /> {labels.print_btn || "Imprimir"}
            </button>
          </div>
        </div>
      )}
      <Link href={`/${clinic}/cart`} className="mt-6 inline-block text-blue-600 hover:underline">{labels.back_cart || "Volver al carrito"}</Link>
    </div>
  );
}
