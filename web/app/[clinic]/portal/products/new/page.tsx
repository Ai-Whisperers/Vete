"use client";

import { useActionState } from "react";
import { ArrowLeft, Loader2, AlertCircle, Info, Package, DollarSign, Boxes } from "lucide-react";
import { createProduct } from "@/app/actions/create-product";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ActionResult, FieldErrors } from "@/lib/types/action-result";

// Helper component for field errors
function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="mt-1 text-sm text-red-600 flex items-start gap-1">
      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <span>{error}</span>
    </p>
  );
}

// Helper component for field hints
function FieldHint({ children }: { children: React.ReactNode }) {
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
function inputClass(hasError: boolean) {
  const base = "w-full px-4 py-3 rounded-xl border outline-none transition-colors";
  return hasError
    ? `${base} border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200`
    : `${base} border-gray-200 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20`;
}

export default function NewProductPage() {
  const { clinic } = useParams();
  const [state, formAction, isPending] = useActionState(createProduct, null);
  const fieldErrors = getFieldErrors(state);

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/${clinic}/portal/products`} className="p-2 rounded-xl hover:bg-white transition-colors" aria-label="Volver a productos">
          <ArrowLeft className="w-6 h-6 text-[var(--text-secondary)]" aria-hidden="true" />
        </Link>
        <div>
          <h1 className="text-3xl font-black font-heading text-[var(--text-primary)]">Nuevo Producto</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Agrega un nuevo producto al inventario</p>
        </div>
      </div>

      {/* Global error message */}
      {state && !state.success && (
        <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold">No se pudo crear el producto</p>
            <p className="text-sm mt-1">{state.error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="clinic" value={clinic} />

          {/* Required fields notice */}
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] pb-2 border-b border-gray-100">
            <Info className="w-4 h-4" aria-hidden="true" />
            <span>Los campos marcados con <span className="text-red-500">*</span> son obligatorios</span>
          </div>

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
                className={`${inputClass(!!fieldErrors.category)} bg-white`}
                aria-invalid={!!fieldErrors.category}
              >
                <option value="dog">Perros 🐕</option>
                <option value="cat">Gatos 🐈</option>
                <option value="exotic">Exóticos 🦜</option>
                <option value="other">Otro 📦</option>
              </select>
              <FieldError error={fieldErrors.category} />
              <FieldHint>Selecciona la categoría principal del producto</FieldHint>
            </div>

            {/* SKU (Optional) */}
            <div>
              <label htmlFor="sku" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                Código SKU
              </label>
              <input
                id="sku"
                name="sku"
                type="text"
                placeholder="Ej: PIP-001, COL-XL-001"
                className={inputClass(!!fieldErrors.sku)}
                aria-invalid={!!fieldErrors.sku}
              />
              <FieldError error={fieldErrors.sku} />
              <FieldHint>Código interno para identificar el producto (opcional)</FieldHint>
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
                  placeholder="50000"
                  className={inputClass(!!fieldErrors.price)}
                  aria-invalid={!!fieldErrors.price}
                />
                <FieldError error={fieldErrors.price} />
              </div>

              {/* Stock */}
              <div>
                <label htmlFor="stock" className="block text-sm font-bold text-[var(--text-secondary)] mb-1">
                  <Boxes className="w-3 h-3 inline mr-1" aria-hidden="true" />
                  Stock Inicial <span className="text-red-500">*</span>
                </label>
                <input
                  id="stock"
                  name="stock"
                  required
                  type="number"
                  min="0"
                  placeholder="10"
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
                placeholder="Describe el producto, sus características, uso recomendado..."
                className={`${inputClass(!!fieldErrors.description)} resize-none`}
                aria-invalid={!!fieldErrors.description}
              />
              <FieldError error={fieldErrors.description} />
              <FieldHint>Información adicional visible para el personal (opcional)</FieldHint>
            </div>
          </div>

          {/* Info Alert */}
          <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm text-blue-700">
              <p className="font-bold">Información</p>
              <p className="mt-1">
                Los productos creados solo serán visibles para el personal de esta clínica.
                Podrás editar el stock y precio en cualquier momento.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" aria-hidden="true" />
                <span>Creando...</span>
              </>
            ) : (
              "Crear Producto"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
