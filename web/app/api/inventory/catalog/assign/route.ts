import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface AssignProductRequest {
  catalog_product_id: string;
  clinic_id: string;
  sale_price: number;
  min_stock_level?: number;
  location?: string;
  initial_stock?: number;
  requires_prescription?: boolean;
}

/**
 * POST /api/inventory/catalog/assign
 * Assign a global catalog product to a clinic
 *
 * Body:
 * - catalog_product_id: UUID of global catalog product
 * - clinic_id: tenant_id of clinic
 * - sale_price: Clinic's selling price
 * - min_stock_level?: Minimum stock level (optional)
 * - location?: Storage location (optional)
 * - initial_stock?: Initial stock quantity (optional)
 * - requires_prescription?: Override prescription requirement (optional)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: AssignProductRequest = await request.json();
    const {
      catalog_product_id,
      clinic_id,
      sale_price,
      min_stock_level,
      location,
      initial_stock,
      requires_prescription
    } = body;

    // Validation
    if (!catalog_product_id || !clinic_id || sale_price === undefined) {
      return NextResponse.json(
        { error: 'catalog_product_id, clinic_id, y sale_price son requeridos' },
        { status: 400 }
      );
    }

    if (sale_price < 0) {
      return NextResponse.json(
        { error: 'El precio de venta no puede ser negativo' },
        { status: 400 }
      );
    }

    if (initial_stock !== undefined && initial_stock < 0) {
      return NextResponse.json(
        { error: 'El stock inicial no puede ser negativo' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify the product exists in global catalog
    const { data: product, error: productError } = await supabase
      .from('store_products')
      .select('id, name, sku, base_price')
      .eq('id', catalog_product_id)
      .is('tenant_id', null)
      .eq('is_global_catalog', true)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Producto no encontrado en el catálogo global' },
        { status: 404 }
      );
    }

    // Start transaction - assign product to clinic
    const { data: assignment, error: assignmentError } = await supabase
      .from('clinic_product_assignments')
      .upsert({
        tenant_id: clinic_id,
        catalog_product_id: catalog_product_id,
        sale_price: sale_price,
        min_stock_level: min_stock_level || 5,
        location: location || null,
        requires_prescription: requires_prescription,
        is_active: true
      }, {
        onConflict: 'tenant_id,catalog_product_id'
      })
      .select()
      .single();

    if (assignmentError) {
      console.error('Assignment error:', assignmentError);
      return NextResponse.json(
        { error: 'Error al asignar producto a la clínica' },
        { status: 500 }
      );
    }

    // If initial stock is provided, create inventory record
    if (initial_stock && initial_stock > 0) {
      const { error: inventoryError } = await supabase
        .from('store_inventory')
        .upsert({
          product_id: catalog_product_id,
          tenant_id: clinic_id,
          stock_quantity: initial_stock,
          min_stock_level: min_stock_level || 5,
          location: location || null,
          weighted_average_cost: product.base_price || 0
        }, {
          onConflict: 'product_id'
        });

      if (inventoryError) {
        console.error('Inventory creation error:', inventoryError);
        return NextResponse.json(
          { error: 'Producto asignado pero error al crear inventario inicial' },
          { status: 500 }
        );
      }

      // Create inventory transaction record
      await supabase
        .from('store_inventory_transactions')
        .insert({
          tenant_id: clinic_id,
          product_id: catalog_product_id,
          type: 'purchase',
          quantity: initial_stock,
          unit_cost: product.base_price || 0,
          notes: 'Stock inicial al asignar producto del catálogo'
        });
    }

    // Return success with assignment details
    return NextResponse.json({
      success: true,
      message: 'Producto asignado exitosamente a la clínica',
      assignment: {
        id: assignment.id,
        catalog_product_id: assignment.catalog_product_id,
        sale_price: assignment.sale_price,
        min_stock_level: assignment.min_stock_level,
        location: assignment.location,
        requires_prescription: assignment.requires_prescription,
        initial_stock: initial_stock || 0
      },
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        base_price: product.base_price
      }
    });

  } catch (error) {
    console.error('Assign product API error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
