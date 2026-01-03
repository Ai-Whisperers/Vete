"use client";
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useCart } from '@/context/cart-context';
import Link from 'next/link';
import { ShoppingBag, Printer, MessageCircle, Loader2, AlertCircle, CheckCircle, FileWarning, Star, Gift } from 'lucide-react';
import type { ClinicConfig } from '@/lib/clinics';
import { PrescriptionUpload } from '@/components/store/prescription-upload';
import LoyaltyRedemption from '@/components/commerce/loyalty-redemption';

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
  const { items, total, clearCart, discount } = useCart();
  const labels = config.ui_labels?.checkout || {};
  const currency = config.settings?.currency || 'PYG';
  const whatsappNumber = config.contact?.whatsapp_number;

  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [stockErrors, setStockErrors] = useState<StockError[]>([]);

  // Prescription tracking: map of item.id -> prescription file URL
  const [prescriptions, setPrescriptions] = useState<Record<string, string>>({});

  // Items that require prescriptions
  const prescriptionItems = useMemo(
    () => items.filter((item) => item.type === 'product' && item.requires_prescription),
    [items]
  );

  // Check if all prescription items have uploads
  const missingPrescriptions = useMemo(
    () => prescriptionItems.filter((item) => !prescriptions[item.id]),
    [prescriptionItems, prescriptions]
  );

  const canCheckout = items.length > 0 && missingPrescriptions.length === 0;

  const handlePrescriptionUpload = (itemId: string, fileUrl: string) => {
    setPrescriptions((prev) => ({ ...prev, [itemId]: fileUrl }));
  };

  const handlePrescriptionRemove = (itemId: string) => {
    setPrescriptions((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return null;

  const handleCheckout = async () => {
    // Validate prescriptions before checkout
    if (missingPrescriptions.length > 0) {
      setCheckoutError('Por favor, sube las recetas médicas requeridas para continuar.');
      return;
    }

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
            quantity: item.quantity,
            requires_prescription: item.requires_prescription,
            prescription_file_url: prescriptions[item.id] || null,
          })),
          clinic,
          requires_prescription_review: prescriptionItems.length > 0,
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
          {/* Prescription warning banner */}
          {prescriptionItems.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <FileWarning className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800">Receta Médica Requerida</p>
                <p className="text-sm text-amber-700">
                  {prescriptionItems.length === 1
                    ? 'Un producto requiere receta médica para su despacho.'
                    : `${prescriptionItems.length} productos requieren receta médica para su despacho.`}
                </p>
              </div>
            </div>
          )}

          {items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <ShoppingBag className="w-12 h-12 text-[var(--primary)]" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[var(--text-primary)]">{item.name}</p>
                      {item.requires_prescription && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          <FileWarning className="w-3 h-3" />
                          Receta
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {item.type === 'service' ? 'Servicio' : 'Producto'} × {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-[var(--primary)]">
                  {new Intl.NumberFormat('es-PY', { style: 'currency', currency: currency }).format(item.price * item.quantity)}
                </span>
              </div>

              {/* Prescription upload section for items that require it */}
              {item.requires_prescription && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                  <PrescriptionUpload
                    clinic={clinic}
                    productId={item.id}
                    initialUrl={prescriptions[item.id]}
                    onUpload={(url) => handlePrescriptionUpload(item.id, url)}
                    onRemove={() => handlePrescriptionRemove(item.id)}
                    compact={false}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Loyalty Points Redemption */}
          {user && (
            <LoyaltyRedemption userId={user.id} />
          )}

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[var(--text-secondary)]">Subtotal</span>
              <span className="font-medium">{new Intl.NumberFormat('es-PY', { style: 'currency', currency: currency }).format(total)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center mb-4 text-green-600">
                <span className="flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Descuento Puntos
                </span>
                <span className="font-medium">-{new Intl.NumberFormat('es-PY', { style: 'currency', currency: currency }).format(discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center mb-4">
              <span className="text-[var(--text-secondary)]">IVA (10%)</span>
              <span className="font-medium">{new Intl.NumberFormat('es-PY', { style: 'currency', currency: currency }).format((total - discount) * 0.1)}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-xl font-bold text-[var(--text-primary)]">Total</span>
              <span className="text-xl font-bold text-[var(--primary)]">
                {new Intl.NumberFormat('es-PY', { style: 'currency', currency: currency }).format(Math.max(0, total - discount) * 1.1)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleCheckout}
              disabled={isProcessing || !canCheckout}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:brightness-110 transition font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Procesando...
                </>
              ) : missingPrescriptions.length > 0 ? (
                <>
                  <FileWarning className="w-5 h-5" /> Faltan {missingPrescriptions.length} receta{missingPrescriptions.length > 1 ? 's' : ''}
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
