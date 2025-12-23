"use client";
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useCart } from '@/context/cart-context';
import Link from 'next/link';
import { ShoppingBag, Printer, MessageCircle, Loader2, AlertCircle, CheckCircle, Stethoscope, Package, PawPrint, User, ArrowLeft, Edit3 } from 'lucide-react';
import { SIZE_SHORT_LABELS, SIZE_LABELS, getSizeBadgeColor, formatPriceGs, type PetSizeCategory } from '@/lib/utils/pet-size';
import { organizeCart } from '@/lib/utils/cart-utils';
import type { ClinicConfig } from '@/lib/clinics';

// TICKET-BIZ-003: Proper checkout with stock validation

interface StockError {
  id: string;
  name: string;
  requested: number;
  available: number;
}

interface PrescriptionError {
  id: string;
  name: string;
  error: string;
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
  prescriptionErrors?: PrescriptionError[]; // Added support for prescription errors
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
  const [prescriptionErrors, setPrescriptionErrors] = useState<PrescriptionError[]>([]);

  // Organize cart by owner products and pet services
  const organizedCart = useMemo(() => organizeCart(items), [items]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return null;

  const handleCheckout = async () => {
    setIsProcessing(true);
    setCheckoutError(null);
    setStockErrors([]);
    setPrescriptionErrors([]);

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
            // Include service-specific pet info
            ...(item.type === 'service' && {
              pet_id: item.pet_id,
              pet_name: item.pet_name,
              pet_size: item.pet_size,
              service_id: item.service_id,
              variant_name: item.variant_name,
              base_price: item.base_price
            }),
            // Include product-specific info including prescription
            ...(item.type === 'product' && {
              requires_prescription: item.requires_prescription,
              prescription_file: item.prescription_file
            })
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
        if (result.prescriptionErrors) {
          setPrescriptionErrors(result.prescriptionErrors);
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
      // Use organized cart for cleaner message
      if (organizedCart.products.length > 0) {
        message += `*🛒 Productos:*\n`;
        organizedCart.products.forEach(item => {
          message += `• ${item.quantity}x ${item.name}\n`;
        });
        message += `\n`;
      }

      if (organizedCart.petGroups.length > 0) {
        organizedCart.petGroups.forEach(group => {
          message += `*🐾 Servicios para ${group.pet_name}:*\n`;
          group.services.forEach(item => {
            const serviceName = item.name.split(' - ')[0];
            message += `• ${item.quantity}x ${serviceName}`;
            if (item.variant_name) {
              message += ` (${item.variant_name})`;
            }
            message += `\n`;
          });
          message += `\n`;
        });
      }

      if (organizedCart.ungroupedServices.length > 0) {
        message += `*📋 Otros Servicios:*\n`;
        organizedCart.ungroupedServices.forEach(item => {
          message += `• ${item.quantity}x ${item.name}\n`;
        });
        message += `\n`;
      }
    }

    const formattedTotal = new Intl.NumberFormat('es-PY', { style: 'currency', currency: currency }).format(total);
    message += `*Total: ${formattedTotal}*\n`;
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
    <div className="min-h-screen bg-[var(--bg-default)]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm mb-8">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/${clinic}/cart`} className="flex items-center gap-2 font-bold text-gray-400 hover:text-[var(--primary)] transition-all">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Carrito</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{labels.title || "Resumen del Pedido"}</h1>
          <Link href={`/${clinic}/cart`} className="flex items-center gap-2 text-sm font-bold text-[var(--primary)] hover:opacity-80 transition-all">
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline">Editar</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">

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
            {prescriptionErrors.length > 0 && (
              <ul className="mt-2 text-sm text-red-600">
                {prescriptionErrors.map((err) => (
                  <li key={err.id}>
                    {err.name}: {err.error}
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
        <div className="space-y-6">
          {/* Products Section (For the Owner) */}
          {organizedCart.products.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 p-5 bg-gradient-to-r from-gray-50 to-transparent border-b border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-subtle)] flex items-center justify-center">
                  <User className="w-6 h-6 text-[var(--text-secondary)]" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">Productos para Ti</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    {organizedCart.products.length} producto{organizedCart.products.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--text-muted)]">Subtotal</p>
                  <p className="text-xl font-black text-[var(--primary)]">
                    {formatPriceGs(organizedCart.productsSubtotal)}
                  </p>
                </div>
              </div>
              {/* Items (Read-only) */}
              <div className="divide-y divide-gray-100">
                {organizedCart.products.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />
                    ) : (
                      <div className="w-16 h-16 bg-[var(--bg-subtle)] rounded-xl flex items-center justify-center">
                        <Package className="w-7 h-7 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-grow min-w-0">
                      <p className="font-bold text-[var(--text-primary)]">{item.name}</p>
                      <p className="text-sm text-[var(--text-muted)]">{formatPriceGs(item.price)} c/u</p>
                    </div>
                    <div className="px-3 py-1.5 bg-gray-100 rounded-lg">
                      <span className="font-bold text-gray-700">×{item.quantity}</span>
                    </div>
                    <div className="text-right w-28">
                      <p className="text-lg font-black text-[var(--primary)]">
                        {formatPriceGs(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services by Pet */}
          {organizedCart.petGroups.map((group) => (
            <div key={group.pet_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Pet Header */}
              <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-[var(--primary)]/10 via-[var(--primary)]/5 to-transparent border-b border-gray-100">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center border-2 border-white shadow-md">
                  <PawPrint className="w-7 h-7 text-[var(--primary)]" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-black text-[var(--text-primary)]">{group.pet_name}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getSizeBadgeColor(group.pet_size)}`}>
                      {SIZE_SHORT_LABELS[group.pet_size]}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">
                    {SIZE_LABELS[group.pet_size]} • {group.services.length} servicio{group.services.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--text-muted)]">Subtotal</p>
                  <p className="text-2xl font-black text-[var(--primary)]">
                    {formatPriceGs(group.subtotal)}
                  </p>
                </div>
              </div>
              {/* Services (Read-only) */}
              <div className="divide-y divide-gray-100">
                {group.services.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4">
                    <div className="w-1.5 h-12 bg-[var(--primary)]/30 rounded-full" />
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                    )}
                    <div className="flex-grow min-w-0">
                      <p className="font-bold text-[var(--text-primary)]">
                        {item.name.split(' - ')[0]}
                      </p>
                      {item.variant_name && (
                        <p className="text-sm text-[var(--text-muted)]">{item.variant_name}</p>
                      )}
                      {item.base_price && item.base_price !== item.price && (
                        <p className="text-xs text-amber-600 mt-1">
                          Base: {formatPriceGs(item.base_price)} → Ajustado por tamaño
                        </p>
                      )}
                    </div>
                    <div className="px-3 py-1.5 bg-gray-100 rounded-lg">
                      <span className="font-bold text-gray-700">×{item.quantity}</span>
                    </div>
                    <div className="text-right w-28">
                      {item.quantity > 1 && (
                        <p className="text-xs text-[var(--text-muted)]">{formatPriceGs(item.price)} c/u</p>
                      )}
                      <p className="text-lg font-black text-[var(--primary)]">
                        {formatPriceGs(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Ungrouped Services */}
          {organizedCart.ungroupedServices.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-3 p-5 bg-gray-50 border-b border-gray-100">
                <Stethoscope className="w-6 h-6 text-[var(--text-secondary)]" />
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Otros Servicios</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {organizedCart.ungroupedServices.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
                    ) : (
                      <div className="w-14 h-14 bg-[var(--bg-subtle)] rounded-lg flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-[var(--primary)]" />
                      </div>
                    )}
                    <div className="flex-grow">
                      <p className="font-bold text-[var(--text-primary)]">{item.name}</p>
                      <p className="text-sm text-[var(--text-muted)]">{formatPriceGs(item.price)} c/u</p>
                    </div>
                    <div className="px-3 py-1.5 bg-gray-100 rounded-lg">
                      <span className="font-bold text-gray-700">×{item.quantity}</span>
                    </div>
                    <div className="text-right w-28">
                      <p className="text-lg font-black text-[var(--primary)]">
                        {formatPriceGs(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Edit cart prompt */}
          <p className="text-center text-sm text-[var(--text-muted)] mt-6">
            ¿Necesitas hacer cambios?{' '}
            <Link href={`/${clinic}/cart`} className="text-[var(--primary)] font-bold hover:underline">
              Editar carrito
            </Link>
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
