"use client";

import { useActionState, useState, useEffect } from "react";
import { ArrowLeft, Loader2, AlertCircle, Info, Package, DollarSign, Boxes, Trash2, Save, ImageIcon } from "lucide-react";
import { updateProduct } from "@/app/actions/update-product";
import { deleteProduct } from "@/app/actions/delete-product";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ActionResult, FieldErrors } from "@/lib/types/action-result";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string | null;
  sku: string | null;
  image_url: string | null;
}

// Helper component for field errors
function FieldError({ error }: { error?: string }): React.ReactElement | null {
  if (!error) return null;
  return (
    <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <span>{error}</span>
    </p>
  );
}

// Helper component for field hints
function FieldHint({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <p className="mt-1 text-xs text-[var(--text-muted)] flex items-start gap-1">
      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

// Get field errors from state
function getFieldErrors(state: ActionResult | null): FieldErrors {
  if (!state || state.success) return {};
  return state.fieldErrors || {};
}

// Input class with error state
function inputClass(hasError: boolean): string {
  const base = "w-full px-4 py-3 rounded-xl border outline-none transition-colors";
  return hasError
    ? `${base} border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200`
    : `${base} border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20`;
}

export default function EditProductPage(): React.ReactElement {
  const { clinic, id } = useParams() as { clinic: string; id: string };
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateProduct, null);
  const fieldErrors = getFieldErrors(state);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchProduct(): Promise<void> {
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !data) {
        setError("Producto no encontrado");
        setLoading(false);
        return;
      }

      setProduct(data);
      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  const handleDelete = async (): Promise<void> => {
    setIsDeleting(true);
    const result = await deleteProduct(id, clinic);

    if (result.success) {
      router.push(`/${clinic}/portal/products?success=product_deleted`);
    } else {
      setError(result.error);
      setShowDeleteModal(false);
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/${clinic}/portal/products`} className="p-2 rounded-xl hover:bg-white transition-colors">
            <ArrowLeft className="w-6 h-6 text-[var(--text-secondary)]" />
          </Link>
          <h1 className="text-3xl font-black font-heading text-[var(--text-primary)]">Error</h1>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold">Producto no encontrado</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href={`/${clinic}/portal/products`} className="p-2 rounded-xl hover:bg-white transition-colors" aria-label="Volver a productos">
            <ArrowLeft className="w-6 h-6 text-[var(--text-secondary)]" aria-hidden="true" />
          </Link>
          <div>
            <h1 className="text-3xl font-black font-heading text-[var(--text-primary)]">Editar Producto</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">{product?.name}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
          title="Eliminar producto"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Global error message */}
      {((state && !state.success) || error) && (
        <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold">No se pudo actualizar el producto</p>
            <p className="text-sm mt-1">{state && !state.success ? state.error : error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="clinic" value={clinic} />
          <input type="hidden" name="id" value={id} />

          {/* Current Image */}
          {product?.image_url && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-xl"
              />
              <div>
                <p className="text-sm font-bold text-[var(--text-secondary)]">Imagen actual</p>
                <p className="text-xs text-[var(--text-muted)]">Sube una nueva imagen para reemplazarla</p>
              </div>
            </div>
          )}

          {/* Product Info Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Package className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" />
              Información del Producto
            </h3>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                Nombre del Producto <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                required
                type="text"
                defaultValue={product?.name}
                placeholder="Ej: Pipeta Antipulgas, Collar Isabelino"
                className={inputClass(!!fieldErrors.name)}
                aria-invalid={!!fieldErrors.name}
              />
              <FieldError error={fieldErrors.name} />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                defaultValue={product?.category}
                className={`${inputClass(!!fieldErrors.category)} bg-white`}
                aria-invalid={!!fieldErrors.category}
              >
                <option value="dog">Perros</option>
                <option value="cat">Gatos</option>
                <option value="exotic">Exóticos</option>
                <option value="other">Otro</option>
              </select>
              <FieldError error={fieldErrors.category} />
            </div>

            {/* SKU */}
            <div>
              <label htmlFor="sku" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                Código SKU
              </label>
              <input
                id="sku"
                name="sku"
                type="text"
                defaultValue={product?.sku || ''}
                placeholder="Ej: PIP-001, COL-XL-001"
                className={inputClass(!!fieldErrors.sku)}
                aria-invalid={!!fieldErrors.sku}
              />
              <FieldError error={fieldErrors.sku} />
              <FieldHint>Código interno para identificar el producto</FieldHint>
            </div>
          </div>

          {/* Pricing & Stock Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" />
              Precio y Stock
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                  Precio (Gs.) <span className="text-red-500">*</span>
                </label>
                <input
                  id="price"
                  name="price"
                  required
                  type="number"
                  step="1"
                  min="0"
                  defaultValue={product?.price}
                  className={inputClass(!!fieldErrors.price)}
                  aria-invalid={!!fieldErrors.price}
                />
                <FieldError error={fieldErrors.price} />
              </div>

              {/* Stock */}
              <div>
                <label htmlFor="stock" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                  <Boxes className="w-3 h-3 inline mr-1" aria-hidden="true" />
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  id="stock"
                  name="stock"
                  required
                  type="number"
                  min="0"
                  defaultValue={product?.stock}
                  className={inputClass(!!fieldErrors.stock)}
                  aria-invalid={!!fieldErrors.stock}
                />
                <FieldError error={fieldErrors.stock} />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={product?.description || ''}
                placeholder="Describe el producto, sus características, uso recomendado..."
                className={`${inputClass(!!fieldErrors.description)} resize-none`}
                aria-invalid={!!fieldErrors.description}
              />
              <FieldError error={fieldErrors.description} />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[var(--primary)]" aria-hidden="true" />
              Imagen del Producto
            </h3>
            <div>
              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="w-full text-sm text-[var(--text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[var(--primary)]/10 file:text-[var(--primary)] hover:file:bg-[var(--primary)]/20 file:cursor-pointer"
              />
              <FieldHint>JPG, PNG, GIF o WebP. Máximo 5MB.</FieldHint>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Link
              href={`/${clinic}/portal/products`}
              className="flex-1 py-4 text-center font-bold text-[var(--text-secondary)] rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" aria-hidden="true" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-center text-[var(--text-primary)] mb-2">
                ¿Eliminar producto?
              </h3>
              <p className="text-center text-[var(--text-secondary)] mb-6">
                Esta acción no se puede deshacer. El producto <strong>{product?.name}</strong> será eliminado permanentemente.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 py-3 font-bold text-[var(--text-secondary)] rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      <span>Eliminando...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      <span>Eliminar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
