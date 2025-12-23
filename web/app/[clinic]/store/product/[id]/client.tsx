'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Star,
  Check,
  AlertCircle,
  Loader2,
  ChevronRight,
  Minus,
  Plus,
  FileText,
} from 'lucide-react';
import type { StoreProductWithDetails, ReviewSummary, StoreProductQuestion } from '@/lib/types/store';
import { useCart } from '@/context/cart-context';
import ProductGallery from '@/components/store/product-detail/product-gallery';
import ProductTabs from '@/components/store/product-detail/product-tabs';
import RelatedProducts from '@/components/store/product-detail/related-products';

interface ProductDetailResponse {
  product: StoreProductWithDetails;
  review_summary: ReviewSummary;
  related_products: Array<{
    relation_type: string;
    product: {
      id: string;
      name: string;
      short_description: string | null;
      image_url: string | null;
      base_price: number;
      avg_rating: number;
      review_count: number;
      is_new_arrival: boolean;
      is_best_seller: boolean;
      store_inventory: { stock_quantity: number } | null;
    };
  }>;
  questions: Array<{
    id: string;
    question: string;
    answer: string;
    created_at: string;
    user_name: string;
    answerer_name: string;
    answered_at: string;
  }>;
}

interface Props {
  clinic: string;
  productId: string;
  clinicConfig: {
    name: string;
    settings?: {
      currency_symbol?: string;
    };
  };
}

export default function ProductDetailClient({ clinic, productId, clinicConfig }: Props) {
  const router = useRouter();
  const { addItem, items } = useCart();
  const [data, setData] = useState<ProductDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState('');
  const [showPrescriptionError, setShowPrescriptionError] = useState(false);

  const currencySymbol = clinicConfig.settings?.currency_symbol || 'Gs';

  useEffect(() => {
    fetchProduct();
  }, [productId, clinic]);

import { getStoreProduct, toggleWishlist as toggleWishlistAction } from '@/app/actions/store';

// ... inside ProductDetailClient component ...

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStoreProduct(clinic, productId);
      
      if (!result.success) {
        setError(result.error || 'Error al cargar el producto');
        return;
      }
      
      // Note: The original implementation expected a full ProductDetailResponse 
      // with review_summary, related_products, and questions.
      // For now, we only have the product data from getStoreProduct.
      // We'll wrap it to match the expected interface as much as possible.
      
      const productData = {
        product: result.data,
        review_summary: { average_rating: result.data.avg_rating || 0, total_reviews: result.data.review_count || 0, rating_distribution: {} },
        related_products: [],
        questions: []
      } as unknown as ProductDetailResponse;
      
      setData(productData);

      // Set default variant if exists
      const defaultVariant = productData.product.variants?.find((v: { is_default: boolean }) => v.is_default);
      if (defaultVariant) {
        setSelectedVariant(defaultVariant.id);
      }
    } catch (err) {
      setError('No se pudo cargar el producto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    try {
        const result = await toggleWishlistAction(clinic, productId);
        if (result.success) {
            setIsWishlisted(!isWishlisted);
        }
    } catch (err) {
        console.error('Failed to toggle wishlist:', err);
    }
  };
    if (!data?.product) return;
    const product = data.product;

    if (product.is_prescription_required && !prescriptionFile.trim()) {
      setShowPrescriptionError(true);
      // Scroll to error if needed (omitted for brevity)
      return;
    }

    setAddingToCart(true);
    
    const variant = selectedVariant
      ? product.variants.find(v => v.id === selectedVariant)
      : null;

    const price = variant
      ? product.current_price + variant.price_modifier
      : product.current_price;

    addItem({
      id: variant ? `${product.id}-${variant.id}` : product.id,
      name: variant ? `${product.name} - ${variant.name}` : product.name,
      price,
      type: 'product',
      image_url: product.image_url || undefined,
      description: product.short_description || undefined,
      stock: variant ? variant.stock_quantity : (product.inventory?.stock_quantity || 0),
      variant_id: variant?.id,
      sku: variant?.sku || product.sku || undefined,
      requires_prescription: product.is_prescription_required,
      prescription_file: product.is_prescription_required ? prescriptionFile : undefined,
    }, quantity);

    setAddingToCart(false);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    const maxStock = selectedVariant
      ? data?.product.variants.find(v => v.id === selectedVariant)?.stock_quantity || 0
      : data?.product.inventory?.stock_quantity || 0;

    if (newQty >= 1 && newQty <= Math.min(maxStock, 99)) {
      setQuantity(newQty);
    }
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return `${currencySymbol} 0`;
    return `${currencySymbol} ${price.toLocaleString('es-PY')}`;
  };

  const getStock = () => {
    if (selectedVariant) {
      return data?.product.variants.find(v => v.id === selectedVariant)?.stock_quantity || 0;
    }
    return data?.product.inventory?.stock_quantity || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.product) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            {error || 'Producto no encontrado'}
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">
            El producto que buscas no existe o no está disponible.
          </p>
          <Link
            href={`/${clinic}/store`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  const product = data.product;
  const stock = getStock();
  const inStock = stock > 0;
  const lowStock = stock > 0 && stock <= 5;

  const currentPrice = selectedVariant
    ? product.current_price + (product.variants.find(v => v.id === selectedVariant)?.price_modifier || 0)
    : product.current_price;

  const originalPrice = product.original_price
    ? (selectedVariant
      ? product.original_price + (product.variants.find(v => v.id === selectedVariant)?.price_modifier || 0)
      : product.original_price)
    : null;

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--bg-elevated)] border-b border-[var(--border-default)] shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Volver</span>
            </button>

            <Link
              href={`/${clinic}/cart`}
              className="relative p-2 hover:bg-[var(--bg-subtle)] rounded-full transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-[var(--text-primary)]" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--primary)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className="container mx-auto px-4 py-3">
        <ol className="flex items-center gap-2 text-sm text-[var(--text-secondary)] flex-wrap">
          <li>
            <Link href={`/${clinic}/store`} className="hover:text-[var(--primary)]">
              Tienda
            </Link>
          </li>
          {product.category && (
            <>
              <ChevronRight className="w-4 h-4" />
              <li>
                <Link
                  href={`/${clinic}/store?category=${product.category.slug}`}
                  className="hover:text-[var(--primary)]"
                >
                  {product.category.name}
                </Link>
              </li>
            </>
          )}
          {product.subcategory && (
            <>
              <ChevronRight className="w-4 h-4" />
              <li>
                <Link
                  href={`/${clinic}/store?subcategory=${product.subcategory.slug}`}
                  className="hover:text-[var(--primary)]"
                >
                  {product.subcategory.name}
                </Link>
              </li>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
          <li className="text-[var(--text-primary)] font-medium truncate max-w-[200px]">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Gallery */}
          <div>
            <ProductGallery
              images={product.images.length > 0 ? product.images : [{ id: '1', image_url: product.image_url || '/placeholder-product.svg', alt_text: product.name, is_primary: true, sort_order: 0, product_id: product.id, tenant_id: product.tenant_id, created_at: '' }]}
              productName={product.name}
              hasDiscount={product.has_discount}
              discountPercentage={product.discount_percentage}
              isNewArrival={product.is_new_arrival}
              isBestSeller={product.is_best_seller}
            />
          </div>

          {/* Right Column - Product Info */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {/* Brand */}
            {product.brand && (
              <Link
                href={`/${clinic}/store?brand=${product.brand.slug}`}
                className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] mb-2"
              >
                {product.brand.logo_url && (
                  <img src={product.brand.logo_url} alt={product.brand.name} className="h-5 w-auto" />
                )}
                <span>{product.brand.name}</span>
              </Link>
            )}

            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-2">
              {product.name}
            </h1>

            {/* Rating */}
            {product.review_count > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(product.avg_rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-[var(--text-secondary)]">
                  {product.avg_rating.toFixed(1)} ({product.review_count} reseñas)
                </span>
              </div>
            )}

            {/* SKU */}
            {product.sku && (
              <p className="text-sm text-[var(--text-muted)] mb-4">
                SKU: {product.sku}
              </p>
            )}

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-[var(--text-primary)]">
                  {formatPrice(currentPrice)}
                </span>
                {originalPrice && (
                  <span className="text-lg text-[var(--text-muted)] line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
              {product.has_discount && product.discount_percentage && (
                <p className="text-sm text-green-600 font-medium mt-1">
                  Ahorrás {formatPrice(originalPrice! - currentPrice)} ({product.discount_percentage}% OFF)
                </p>
              )}
            </div>

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  {product.variants[0].variant_type === 'size' ? 'Tamaño' :
                   product.variants[0].variant_type === 'flavor' ? 'Sabor' :
                   product.variants[0].variant_type === 'color' ? 'Color' : 'Variante'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedVariant(variant.id);
                        setQuantity(1);
                      }}
                      disabled={variant.stock_quantity === 0}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedVariant === variant.id
                          ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                          : variant.stock_quantity === 0
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-[var(--border-default)] hover:border-[var(--primary)] text-[var(--text-primary)]'
                      }`}
                    >
                      {variant.name}
                      {variant.price_modifier !== 0 && (
                        <span className="text-xs ml-1">
                          ({variant.price_modifier > 0 ? '+' : ''}{formatPrice(variant.price_modifier)})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="mb-6">
              {inStock ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">
                    {lowStock ? `¡Últimas ${stock} unidades!` : 'En Stock'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Sin Stock</span>
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            {inStock && (
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Quantity Selector */}
                <div className="flex items-center border border-[var(--border-default)] rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-[var(--bg-subtle)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= Math.min(stock, 99)}
                    className="p-3 hover:bg-[var(--bg-subtle)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || !inStock}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {addingToCart ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : addedToCart ? (
                    <>
                      <Check className="w-5 h-5" />
                      Agregado
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Agregar al Carrito
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Wishlist & Share */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={handleWishlistToggle}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                  isWishlisted
                    ? 'border-red-500 text-red-500 bg-red-50'
                    : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-red-500 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">
                  {isWishlisted ? 'En Lista de Deseos' : 'Agregar a Lista'}
                </span>
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product.name,
                      text: product.short_description || '',
                      url: window.location.href,
                    });
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 border border-[var(--border-default)] rounded-lg text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="hidden sm:inline">Compartir</span>
              </button>
            </div>

            {/* Prescription Warning & Input */}
            {product.is_prescription_required && (
              <div className={`bg-amber-50 border rounded-lg p-4 mb-6 ${showPrescriptionError ? 'border-red-500 ring-1 ring-red-500' : 'border-amber-200'}`}>
                <div className="flex items-start gap-3 mb-3">
                  <FileText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Requiere Receta Veterinaria</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Este producto requiere una receta válida.
                    </p>
                  </div>
                </div>
                
                <div className="mt-2">
                  <label htmlFor="prescription" className="block text-sm font-medium text-amber-900 mb-1">
                    Link a tu receta (Drive, Dropbox, etc.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    id="prescription"
                    value={prescriptionFile}
                    onChange={(e) => {
                      setPrescriptionFile(e.target.value);
                      if (e.target.value.trim()) setShowPrescriptionError(false);
                    }}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                  {showPrescriptionError && (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      Por favor ingresá el link de tu receta para continuar.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[var(--bg-subtle)] rounded-lg">
              <div className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-[var(--primary)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Envío Rápido</p>
                  <p className="text-xs text-[var(--text-muted)]">Recibí mañana</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-[var(--primary)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Compra Segura</p>
                  <p className="text-xs text-[var(--text-muted)]">100% protegida</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-6 h-6 text-[var(--primary)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Devolución</p>
                  <p className="text-xs text-[var(--text-muted)]">15 días gratis</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs (Description, Specs, Reviews) */}
        <div className="mt-12">
          <ProductTabs
            product={product}
            reviewSummary={data.review_summary}
            questions={data.questions}
            clinic={clinic}
            currencySymbol={currencySymbol}
          />
        </div>

        {/* Related Products */}
        {data.related_products.length > 0 && (
          <div className="mt-12">
            <RelatedProducts
              products={data.related_products}
              clinic={clinic}
              currencySymbol={currencySymbol}
            />
          </div>
        )}
      </main>

      {/* Mobile Sticky Add to Cart */}
      {inStock && (
        <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-elevated)] border-t border-[var(--border-default)] p-4 lg:hidden z-50">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xl font-bold text-[var(--text-primary)]">
                {formatPrice(currentPrice)}
              </span>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded-lg"
            >
              {addingToCart ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : addedToCart ? (
                <>
                  <Check className="w-5 h-5" />
                  Agregado
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Agregar
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
