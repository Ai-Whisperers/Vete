"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/lib/types/action-result";

export async function deleteProduct(productId: string, clinic: string): Promise<ActionResult> {
  const supabase = await createClient();

  // Auth Check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return {
      success: false,
      error: "Debes iniciar sesión para eliminar productos."
    };
  }

  // Validate Staff Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return {
      success: false,
      error: "Solo veterinarios y administradores pueden eliminar productos."
    };
  }

  if (!profile.tenant_id) {
    return {
      success: false,
      error: "No se encontró tu perfil de clínica. Contacta a soporte."
    };
  }

  // Check product exists and belongs to this tenant
  const { data: existingProduct, error: fetchError } = await supabase
    .from('products')
    .select('id, tenant_id, name, image_url')
    .eq('id', productId)
    .single();

  if (fetchError || !existingProduct) {
    return {
      success: false,
      error: "Producto no encontrado."
    };
  }

  if (existingProduct.tenant_id !== profile.tenant_id) {
    return {
      success: false,
      error: "No tienes permiso para eliminar este producto."
    };
  }

  // Delete the product
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('tenant_id', profile.tenant_id);

  if (deleteError) {
    console.error("Delete Product Error:", deleteError);

    // Check for foreign key constraint (product might be referenced in invoices, etc.)
    if (deleteError.code === "23503") {
      return {
        success: false,
        error: "No se puede eliminar este producto porque está siendo utilizado en facturas u otros registros."
      };
    }

    return {
      success: false,
      error: "No se pudo eliminar el producto. Por favor, intenta de nuevo."
    };
  }

  // Try to delete the image from storage (non-blocking)
  if (existingProduct.image_url) {
    try {
      const urlParts = existingProduct.image_url.split('/');
      const fileName = urlParts.slice(-3).join('/'); // products/tenant_id/timestamp.ext
      await supabase.storage.from('products').remove([fileName]);
    } catch (e) {
      // Silently fail - not critical if image cleanup fails
      console.warn("Failed to delete product image:", e);
    }
  }

  revalidatePath(`/${clinic}/portal/products`);

  return {
    success: true
  };
}
