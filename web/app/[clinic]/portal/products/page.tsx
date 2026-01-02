import * as Icons from "lucide-react";
import { createClient } from '@/lib/supabase/server'
import { redirect } from "next/navigation";
import Link from "next/link";
import { SuccessToast } from "./success-toast";

interface ProductsPageProps {
  params: Promise<{ clinic: string }>;
  searchParams: Promise<{ success?: string }>;
}

// Helper to get category display name from target_species
function getCategoryDisplay(targetSpecies: string[] | null): string {
  if (!targetSpecies || targetSpecies.length === 0) return 'Otro';
  const species = targetSpecies[0];
  const categoryLabels: Record<string, string> = {
    'dog': 'Perros',
    'cat': 'Gatos',
    'exotic': 'Exóticos',
  };
  return categoryLabels[species] || 'Otro';
}

export default async function ProductsPage({ params, searchParams }: ProductsPageProps): Promise<React.ReactElement> {
  const supabase = await createClient();
  const { clinic } = await params;
  const { success } = await searchParams;

  // Success messages
  const successMessages: Record<string, string> = {
    product_created: "Producto creado exitosamente",
    product_updated: "Producto actualizado exitosamente",
    product_deleted: "Producto eliminado exitosamente",
  };

  // 1. Auth Check & Role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${clinic}/portal/login`);

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  const isStaff = profile?.role === 'vet' || profile?.role === 'admin';

  if (!isStaff) {
      return (
        <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-red-500">Acceso Restringido</h1>
            <p className="text-gray-500">Solo el personal de la clínica puede ver esta sección.</p>
            <Link href={`/${clinic}/portal/dashboard`} className="mt-4 inline-block text-blue-500 hover:underline">
                Volver al Dashboard
            </Link>
        </div>
      )
  }

  // 2. Fetch Products with inventory
  const { data: products } = await supabase
    .from('store_products')
    .select(`
      id,
      name,
      description,
      base_price,
      sku,
      image_url,
      target_species,
      is_active,
      store_inventory (
        stock_quantity
      )
    `)
    .eq('tenant_id', profile.tenant_id)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  // Transform products to include stock from inventory
  const productsWithStock = products?.map(product => {
    const inventory = Array.isArray(product.store_inventory)
      ? product.store_inventory[0]
      : product.store_inventory;
    return {
      ...product,
      price: product.base_price,
      stock: inventory?.stock_quantity ?? 0,
      category: getCategoryDisplay(product.target_species),
    };
  }) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        {/* Success Toast */}
        {success && successMessages[success] && (
          <SuccessToast message={successMessages[success]} />
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <h1 className="text-3xl font-black font-heading text-[var(--text-primary)]">
                    Inventario de Productos
                </h1>
                <p className="text-[var(--text-secondary)]">Gestiona el stock y precios de la clínica.</p>
             </div>

             <div className="flex gap-3">
                 <Link href={`/${clinic}/portal/products/new`} className="flex items-center justify-center gap-2 text-[var(--primary)] font-bold bg-[var(--primary)]/10 hover:bg-[var(--primary)] hover:text-white px-6 py-3 rounded-xl transition-all shrink-0">
                     <Icons.Plus className="w-5 h-5" /> <span className="hidden md:inline">Nuevo Producto</span>
                 </Link>
             </div>
        </div>

        {/* Empty State */}
        {productsWithStock.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
                    <Icons.Package className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-600">Sin productos registrados</h3>
                <p className="text-gray-500 mb-6">Comienza a agregar productos.</p>
            </div>
        )}

        {/* Product Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsWithStock.map((product) => (
                <div key={product.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all">
                    {/* Image / Placeholder */}
                    <div className="h-48 bg-gray-100 relative">
                        {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Icons.ShoppingBag className="w-12 h-12" />
                            </div>
                        )}
                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-600">
                            {product.category}
                        </span>
                    </div>

                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-lg font-bold text-[var(--text-primary)] leading-tight">{product.name}</h2>
                            <span className="font-heading font-black text-lg text-[var(--primary)]">
                                ${product.price}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-4">
                            <Icons.Package className="w-4 h-4" />
                            <span>Stock: <span className={product.stock < 5 ? "text-red-500 font-bold" : "font-bold"}>{product.stock}</span> u.</span>
                        </div>

                        <div className="flex gap-2">
                             <Link
                                href={`/${clinic}/portal/products/${product.id}`}
                                className="flex-1 py-2 bg-gray-50 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-100 transition-colors text-center"
                             >
                                Editar
                             </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}
