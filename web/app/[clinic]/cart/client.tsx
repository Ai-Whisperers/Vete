"use client";
import { useParams } from 'next/navigation';
import { useCart, CartItem } from '@/context/cart-context';
import Link from 'next/link';
import { ShoppingBag, X, ArrowRight, Trash2, ArrowLeft, ShieldCheck, Plus, Minus, Tag, AlertCircle, PawPrint, Package, User, Stethoscope } from 'lucide-react';
import LoyaltyRedemption from '@/components/commerce/loyalty-redemption';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { ClinicConfig } from '@/lib/clinics';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { AuthGate } from '@/components/auth/auth-gate';
import { organizeCart } from '@/lib/utils/cart-utils';
import { formatPriceGs, SIZE_SHORT_LABELS, getSizeBadgeColor, SIZE_LABELS, type PetSizeCategory } from '@/lib/utils/pet-size';

interface CartPageClientProps {
  readonly config: ClinicConfig;
}

// Maximum quantity per item to prevent abuse
const MAX_QUANTITY_PER_ITEM = 99;

export default function CartPageClient({ config }: CartPageClientProps) {
  const { clinic } = useParams() as { clinic: string };
  const { items, clearCart, total, removeItem, updateQuantity, discount } = useCart();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantityWarning, setQuantityWarning] = useState<string | null>(null);

  // Memoize supabase client
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Auth session error:', error);
        }
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('Failed to get session:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const finalTotal = Math.max(0, total - discount);
  const labels = config.ui_labels?.cart || {};
  const currency = config.settings?.currency || 'PYG';
  const whatsappNumber = config.contact?.whatsapp_number;

  // Organize cart items by type (products vs services) and group services by pet
  const organizedCart = useMemo(() => organizeCart(items), [items]);

  // Safe quantity update with validation
  const handleQuantityUpdate = useCallback((itemId: string, delta: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + delta;

    // Validate against maximum
    if (newQuantity > MAX_QUANTITY_PER_ITEM) {
      setQuantityWarning(`Máximo ${MAX_QUANTITY_PER_ITEM} unidades por producto`);
      setTimeout(() => setQuantityWarning(null), 3000);
      return;
    }

    // Validate against stock if available
    if (item.stock !== undefined && newQuantity > item.stock) {
      setQuantityWarning(`Solo hay ${item.stock} unidades disponibles`);
      setTimeout(() => setQuantityWarning(null), 3000);
      return;
    }

    updateQuantity(itemId, delta);
  }, [items, updateQuantity]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
    </div>
  );

  // Cart preview for unauthenticated users
  const cartPreview = items.length > 0 ? (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="space-y-3">
        {items.slice(0, 3).map((item) => (
          <div key={item.id} className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-8 h-8 object-contain" />
              ) : (
                <ShoppingBag className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <span className="flex-1 truncate text-gray-700">{item.name}</span>
            <span className="text-gray-500">x{item.quantity}</span>
          </div>
        ))}
        {items.length > 3 && (
          <p className="text-xs text-gray-400 text-center">+{items.length - 3} productos más</p>
        )}
        <div className="pt-3 border-t border-gray-100 flex justify-between font-bold">
          <span>Total:</span>
          <span className="text-[var(--primary)]">
            {new Intl.NumberFormat('es-PY', { style: 'currency', currency: currency }).format(total)}
          </span>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm mb-8">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href={`/${clinic}/store`} className="flex items-center gap-2 font-bold text-gray-400 hover:text-[var(--primary)] transition-all">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Tienda</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{labels.title || "Tu Carrito"}</h1>
            <div className="w-20"></div>
        </div>
      </div>

      <AuthGate
        clinic={clinic}
        redirect={`/${clinic}/cart`}
        whatsappNumber={whatsappNumber}
        title="Inicia sesión para tu carrito"
        description="Necesitas una cuenta para completar tu compra y acumular puntos de fidelidad."
        icon="cart"
        preview={cartPreview}
      >
        <div className="container mx-auto px-4">
        {items.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2rem] shadow-sm border border-gray-100 max-w-2xl mx-auto px-6">
             <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                <ShoppingBag className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-3">{labels.empty || "Tu carrito está vacío"}</h2>
            <p className="text-gray-500 mb-10 max-w-md mx-auto text-lg leading-relaxed">Parece que aún no has agregado productos. Explora nuestra tienda para encontrar lo mejor para tu mascota.</p>
            <Link href={`/${clinic}/store`} className="inline-flex items-center gap-3 px-10 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-[var(--primary)] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95">
                Ir a la Tienda <ArrowRight className="w-5 h-5" />
            </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start max-w-7xl mx-auto">
            {/* Left Column: Items */}
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-4 px-4">
                    <span className="font-bold text-gray-400 uppercase tracking-wider text-xs">{items.reduce((acc, i) => acc + i.quantity, 0)} items</span>
                    <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-500 font-bold flex items-center gap-1.5 transition-colors uppercase tracking-wider">
                        <Trash2 className="w-3.5 h-3.5" /> {labels.clear_btn || "Vaciar todo"}
                    </button>
                </div>

                {/* Quantity warning toast */}
                {quantityWarning && (
                  <div className="mb-4 mx-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-700 text-sm font-medium animate-in slide-in-from-top">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {quantityWarning}
                  </div>
                )}

                {/* Products Section */}
                {organizedCart.products.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-3 p-5 bg-gradient-to-r from-gray-50 to-transparent border-b border-gray-100">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg font-bold text-gray-900">Productos para Ti</h3>
                        <p className="text-sm text-gray-500">{organizedCart.products.length} producto{organizedCart.products.length !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Subtotal</p>
                        <p className="text-xl font-black text-[var(--primary)]">{formatPriceGs(organizedCart.productsSubtotal)}</p>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {organizedCart.products.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                              <Package className="w-7 h-7 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-grow min-w-0">
                            <p className="font-bold text-gray-900 truncate">{item.name}</p>
                            <p className="text-sm text-gray-500">{formatPriceGs(item.price)} c/u</p>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                            <button
                              onClick={() => handleQuantityUpdate(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center bg-white text-gray-500 rounded-lg shadow-sm hover:text-red-500 transition-all disabled:opacity-50"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-6 text-center font-bold text-gray-700">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityUpdate(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white text-gray-500 rounded-lg shadow-sm hover:text-[var(--primary)] transition-all disabled:opacity-50"
                              disabled={item.quantity >= MAX_QUANTITY_PER_ITEM || (item.stock !== undefined && item.quantity >= item.stock)}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right w-24">
                            <p className="text-lg font-black text-[var(--primary)]">{formatPriceGs(item.price * item.quantity)}</p>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Services Grouped by Pet */}
                {organizedCart.petGroups.map((group) => (
                  <div key={group.pet_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Pet Header */}
                    <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-[var(--primary)]/10 via-[var(--primary)]/5 to-transparent border-b border-gray-100">
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center border-2 border-white shadow-md">
                        <PawPrint className="w-7 h-7 text-[var(--primary)]" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-black text-gray-900">{group.pet_name}</h3>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getSizeBadgeColor(group.pet_size)}`}>
                            {SIZE_SHORT_LABELS[group.pet_size]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{SIZE_LABELS[group.pet_size]} • {group.services.length} servicio{group.services.length !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Subtotal</p>
                        <p className="text-2xl font-black text-[var(--primary)]">{formatPriceGs(group.subtotal)}</p>
                      </div>
                    </div>
                    {/* Services */}
                    <div className="divide-y divide-gray-100">
                      {group.services.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                          <div className="w-1.5 h-12 bg-[var(--primary)]/30 rounded-full" />
                          {item.image_url && (
                            <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                          )}
                          <div className="flex-grow min-w-0">
                            <p className="font-bold text-gray-900">{item.name.split(' - ')[0]}</p>
                            {item.variant_name && <p className="text-sm text-gray-500">{item.variant_name}</p>}
                            {item.base_price && item.base_price !== item.price && (
                              <p className="text-xs text-amber-600 mt-1">Base: {formatPriceGs(item.base_price)} → Ajustado por tamaño</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                            <button
                              onClick={() => handleQuantityUpdate(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center bg-white text-gray-500 rounded-lg shadow-sm hover:text-red-500 transition-all disabled:opacity-50"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-6 text-center font-bold text-gray-700">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityUpdate(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white text-gray-500 rounded-lg shadow-sm hover:text-[var(--primary)] transition-all disabled:opacity-50"
                              disabled={item.quantity >= MAX_QUANTITY_PER_ITEM}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right w-24">
                            {item.quantity > 1 && <p className="text-xs text-gray-400">{formatPriceGs(item.price)} c/u</p>}
                            <p className="text-lg font-black text-[var(--primary)]">{formatPriceGs(item.price * item.quantity)}</p>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Ungrouped Services (without pet) */}
                {organizedCart.ungroupedServices.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-3 p-5 bg-gray-50 border-b border-gray-100">
                      <Stethoscope className="w-6 h-6 text-gray-500" />
                      <h3 className="text-lg font-bold text-gray-900">Otros Servicios</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {organizedCart.ungroupedServices.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
                          ) : (
                            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Stethoscope className="w-6 h-6 text-[var(--primary)]" />
                            </div>
                          )}
                          <div className="flex-grow">
                            <p className="font-bold text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">{formatPriceGs(item.price)} c/u</p>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                            <button
                              onClick={() => handleQuantityUpdate(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center bg-white text-gray-500 rounded-lg shadow-sm hover:text-red-500 transition-all disabled:opacity-50"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-6 text-center font-bold text-gray-700">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityUpdate(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white text-gray-500 rounded-lg shadow-sm hover:text-[var(--primary)] transition-all disabled:opacity-50"
                              disabled={item.quantity >= MAX_QUANTITY_PER_ITEM}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right w-24">
                            <p className="text-lg font-black text-[var(--primary)]">{formatPriceGs(item.price * item.quantity)}</p>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Right Column: Summary Card */}
            <div className="lg:sticky lg:top-24 mt-6 lg:mt-0">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    
                    <h3 className="font-bold text-2xl text-gray-900 mb-8 flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6 text-[var(--primary)]" /> Resumen
                    </h3>
                    
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-gray-500 font-medium">
                            <span>Subtotal</span>
                            <span className="text-gray-900">{new Intl.NumberFormat('es-PY', { style: 'currency', currency: currency }).format(total)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-green-600 font-bold items-center">
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    <span>Descuento Puntos</span>
                                </div>
                                <span>-{new Intl.NumberFormat('es-PY', { style: 'currency', currency: currency }).format(discount)}</span>
                            </div>
                        )}
                         <div className="flex justify-between text-gray-400 text-sm">
                            <span>Envío/Gestión</span>
                            <span className="font-bold text-[var(--primary)] uppercase tracking-tighter text-xs">Por WhatsApp</span>
                        </div>
                        <div className="h-px bg-gray-100 my-4"></div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{labels.total_label || "Total Estimado"}</p>
                                <span className="text-3xl font-black text-gray-900 leading-none">
                                    {new Intl.NumberFormat('es-PY', { style: 'currency', currency: currency }).format(finalTotal)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {user && <LoyaltyRedemption userId={user.id} />}

                    <Link 
                        href={`/${clinic}/cart/checkout`} 
                        className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-[var(--primary)] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 duration-200"
                    >
                         {labels.checkout_btn || "Continuar compra"} <ArrowRight className="w-5 h-5" />
                    </Link>
                    
                    <div className="mt-8 space-y-3">
                        <div className="flex items-center gap-3 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                           <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
                           <p>Tu pedido será procesado de forma segura vía **WhatsApp** directamente con la clínica.</p>
                        </div>
                        <p className="text-[10px] text-gray-300 text-center uppercase tracking-tighter">Precios sujetos a disponibilidad local</p>
                    </div>
                </div>
            </div>
        </div>
      )}
        </div>
      </AuthGate>
    </div>
  );
}

