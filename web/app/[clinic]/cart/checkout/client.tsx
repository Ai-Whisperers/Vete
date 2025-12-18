"use client";
import { useParams } from 'next/navigation';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useCart } from '@/context/cart-context';
import Link from 'next/link';
import { ShoppingBag, Printer, MessageCircle } from 'lucide-react';

interface CheckoutClientProps {
  readonly config: any;
}

export default function CheckoutClient({ config }: CheckoutClientProps) {
  const { clinic } = useParams() as { clinic: string };
  const { user, loading } = useAuthRedirect();
  const { items, total } = useCart();
  const labels = config.ui_labels?.checkout || {};
  const currency = config.settings?.currency || 'PYG';
  const whatsappNumber = config.contact?.whatsapp_number;

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return null;

  const handlePrint = () => {
    globalThis?.print?.();
  };

  const generateWhatsAppLink = () => {
    if (!whatsappNumber) return '#';
    
    let message = `Hola *${config.name}*, me gustaría realizar el siguiente pedido:\n\n`;
    items.forEach(item => {
        message += `• ${item.quantity}x ${item.name} (${item.type === 'service' ? 'Servicio' : 'Producto'})\n`;
    });
    
    const formattedTotal = new Intl.NumberFormat('es-PY', { style: 'currency', currency: currency }).format(total);
    message += `\n*Total Estimado: ${formattedTotal}*\n`;
    message += `\nMis datos: ${user.email}`;
    
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-default)] p-8">
      <h1 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">{labels.title || "Resumen del Pedido"}</h1>
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
                  <p className="text-sm text-[var(--text-secondary)]">{item.type === 'service' ? 'Servicio' : 'Producto'}</p>
                </div>
              </div>
              <span className="font-bold text-[var(--primary)]">{new Intl.NumberFormat('es-PY', { style: 'currency', currency: currency }).format(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-4 border-t flex-wrap gap-4">
            <div className="text-xl font-bold text-[var(--primary)]">Total: {new Intl.NumberFormat('es-PY', { style: 'currency', currency: currency }).format(total)}</div>
            
            <div className="flex gap-2">
                <button onClick={handlePrint} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition font-bold">
                <Printer className="w-5 h-5" /> {labels.print_btn || "Imprimir"}
                </button>
                
                {whatsappNumber && (
                    <a 
                        href={generateWhatsAppLink()} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-xl hover:brightness-110 transition font-bold shadow-md"
                    >
                        <MessageCircle className="w-5 h-5" /> {labels.whatsapp_btn || "Pedir por WhatsApp"}
                    </a>
                )}
            </div>
          </div>
        </div>
      )}
      <Link href={`/${clinic}/cart`} className="mt-6 inline-block text-blue-600 hover:underline">{labels.back_cart || "Volver al carrito"}</Link>
    </div>
  );
}
