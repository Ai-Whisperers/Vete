import { createClient } from '@/lib/supabase/server';
import { redirect } from "next/navigation";
import Link from "next/link";
import { RefreshCw, ShoppingBag, ArrowLeft, Package } from "lucide-react";
import { SubscriptionsClient } from "./client";

interface SubscriptionsPageProps {
  params: Promise<{ clinic: string }>;
}

export default async function SubscriptionsPage({ params }: SubscriptionsPageProps) {
  const supabase = await createClient();
  const { clinic } = await params;

  // Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${clinic}/portal/login?returnTo=/${clinic}/portal/subscriptions`);
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect(`/${clinic}/portal/login`);
  }

  // Fetch subscriptions using the helper function
  const { data: subscriptions, error } = await supabase.rpc('get_customer_subscriptions', {
    p_customer_id: user.id,
    p_tenant_id: profile.tenant_id,
  });

  // Transform data for client
  const subscriptionsList = (subscriptions || []).map((sub: {
    id: string;
    product_id: string;
    product_name: string;
    product_image: string | null;
    variant_id: string | null;
    variant_name: string | null;
    quantity: number;
    frequency_days: number;
    next_order_date: string;
    status: string;
    subscribed_price: number;
    current_price: number;
    price_changed: boolean;
  }) => ({
    id: sub.id,
    productId: sub.product_id,
    productName: sub.product_name,
    productImage: sub.product_image,
    variantId: sub.variant_id,
    variantName: sub.variant_name,
    quantity: sub.quantity,
    frequencyDays: sub.frequency_days,
    nextOrderDate: sub.next_order_date,
    status: sub.status,
    subscribedPrice: sub.subscribed_price,
    currentPrice: sub.current_price,
    priceChanged: sub.price_changed,
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/${clinic}/store`}
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la tienda
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                Mis Suscripciones
              </h1>
              <p className="text-[var(--text-muted)]">
                {subscriptionsList.length} {subscriptionsList.length === 1 ? 'suscripción activa' : 'suscripciones'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {subscriptionsList.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            No tienes suscripciones activas
          </h2>
          <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">
            Suscríbete a tus productos favoritos para recibirlos automáticamente cada cierto tiempo.
          </p>
          <Link
            href={`/${clinic}/store`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:brightness-110 transition"
          >
            <Package className="w-5 h-5" />
            Explorar Tienda
          </Link>
        </div>
      ) : (
        <SubscriptionsClient
          clinic={clinic}
          initialSubscriptions={subscriptionsList}
        />
      )}
    </div>
  );
}
