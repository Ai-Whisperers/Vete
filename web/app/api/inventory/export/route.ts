import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';

interface ProductFromDB {
  sku: string;
  name: string;
  description: string | null;
  base_price: number;
  barcode: string | null;
  is_active: boolean;
  store_categories: { name: string } | null;
  store_inventory: {
    stock_quantity: number;
    weighted_average_cost: number | null;
    min_stock_level: number | null;
    expiry_date: string | null;
    batch_number: string | null;
    supplier_name: string | null;
  } | null;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    const supabase = await createClient();

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'vet')) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'catalog';

    const workbook = XLSX.utils.book_new();

    if (type === 'template') {
        // =====================================================================
        // COMPREHENSIVE TEMPLATE WITH MULTIPLE SHEETS
        // =====================================================================

        // -----------------------------------------------------------------
        // SHEET 1: INSTRUCTIONS (Instrucciones)
        // -----------------------------------------------------------------
        const instructionsData = [
            ['═══════════════════════════════════════════════════════════════════════════════════'],
            ['                    PLANTILLA DE INVENTARIO - GUÍA DE USO'],
            ['═══════════════════════════════════════════════════════════════════════════════════'],
            [''],
            ['DESCRIPCIÓN GENERAL'],
            ['────────────────────────────────────────────────────────────────────────────────────'],
            ['Esta plantilla permite importar y gestionar el inventario de su clínica veterinaria.'],
            ['Puede crear nuevos productos, registrar compras, ajustar stock y más.'],
            [''],
            ['HOJAS DISPONIBLES EN ESTA PLANTILLA'],
            ['────────────────────────────────────────────────────────────────────────────────────'],
            ['1. Instrucciones     - Esta guía de uso (no importar)'],
            ['2. Nuevos Productos  - Para agregar productos nuevos al catálogo'],
            ['3. Movimientos Stock - Para compras, ventas, ajustes, pérdidas'],
            ['4. Ejemplos          - Ejemplos completos de cada operación (no importar)'],
            ['5. Categorías        - Lista de categorías disponibles (referencia)'],
            [''],
            ['OPERACIONES DISPONIBLES'],
            ['────────────────────────────────────────────────────────────────────────────────────'],
            ['Operación', 'Descripción', 'Cantidad', 'Costo Unitario'],
            ['New Product', 'Crear un producto nuevo en el catálogo', 'Stock inicial (opcional)', 'Costo de compra (opcional)'],
            ['Purchase', 'Registrar compra de stock (aumenta inventario)', 'Positiva (+)', 'REQUERIDO - Costo por unidad'],
            ['Sale', 'Registrar venta (disminuye inventario)', 'Negativa (-)', 'Opcional'],
            ['Adjustment', 'Ajuste manual de stock (inventario físico)', '+/- según diferencia', 'Opcional'],
            ['Damage', 'Registrar productos dañados', 'Negativa (-)', 'Opcional'],
            ['Theft', 'Registrar productos robados/perdidos', 'Negativa (-)', 'Opcional'],
            ['Price Update', 'Solo actualizar precio de venta', 'No aplica (0)', 'No aplica'],
            [''],
            ['CAMPOS OBLIGATORIOS POR OPERACIÓN'],
            ['────────────────────────────────────────────────────────────────────────────────────'],
            ['New Product:', 'Nombre, Categoría, Precio Venta'],
            ['Purchase:', 'SKU (existente), Cantidad (+), Costo Unitario'],
            ['Sale:', 'SKU (existente), Cantidad (-)'],
            ['Adjustment:', 'SKU (existente), Cantidad (+/-)'],
            ['Price Update:', 'SKU (existente), Precio Venta (nuevo)'],
            [''],
            ['NOTAS IMPORTANTES'],
            ['────────────────────────────────────────────────────────────────────────────────────'],
            ['• El SKU es único por producto. Si deja vacío en "New Product", se genera automáticamente.'],
            ['• Las compras (Purchase) actualizan el Costo Promedio Ponderado automáticamente.'],
            ['• Las categorías se crean automáticamente si no existen.'],
            ['• Máximo 1000 filas por importación.'],
            ['• Formatos de archivo aceptados: .xlsx, .xls, .csv'],
            ['• Las columnas "Stock Actual" y "Costo Promedio" son solo lectura al exportar.'],
            [''],
            ['FORMATO DE FECHAS'],
            ['────────────────────────────────────────────────────────────────────────────────────'],
            ['Fecha de Vencimiento: YYYY-MM-DD (ej: 2025-06-30)'],
            [''],
            ['CONTACTO Y SOPORTE'],
            ['────────────────────────────────────────────────────────────────────────────────────'],
            ['Si tiene dudas, contacte al administrador de su clínica.'],
        ];
        const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
        wsInstructions['!cols'] = [{ wch: 25 }, { wch: 50 }, { wch: 25 }, { wch: 25 }];
        XLSX.utils.book_append_sheet(workbook, wsInstructions, 'Instrucciones');

        // -----------------------------------------------------------------
        // SHEET 2: NEW PRODUCTS (Nuevos Productos)
        // -----------------------------------------------------------------
        const newProductsData = [
            {
                'Operación': 'New Product',
                'SKU (Opcional)': '',
                'Código de Barras': '',
                'Nombre (Requerido)': '',
                'Categoría (Requerido)': '',
                'Descripción': '',
                'Precio Venta (Requerido)': 0,
                'Stock Inicial': 0,
                'Costo Unitario': 0,
                'Stock Mínimo (Alerta)': 0,
                'Fecha Vencimiento (YYYY-MM-DD)': '',
                'Número de Lote': '',
                'Proveedor': '',
                'Activo (SI/NO)': 'SI'
            }
        ];
        const wsNewProducts = XLSX.utils.json_to_sheet(newProductsData);
        wsNewProducts['!cols'] = [
            { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 30 }, { wch: 22 },
            { wch: 40 }, { wch: 20 }, { wch: 14 }, { wch: 16 }, { wch: 18 },
            { wch: 28 }, { wch: 18 }, { wch: 22 }, { wch: 15 }
        ];
        XLSX.utils.book_append_sheet(workbook, wsNewProducts, 'Nuevos Productos');

        // -----------------------------------------------------------------
        // SHEET 3: STOCK MOVEMENTS (Movimientos de Stock)
        // -----------------------------------------------------------------
        const stockMovementsData = [
            {
                'Operación (Requerido)': 'Purchase | Sale | Adjustment | Damage | Theft | Price Update',
                'SKU (Requerido)': '',
                'Cantidad (+/-)': 0,
                'Costo Unitario (Compras)': 0,
                'Nuevo Precio Venta': 0,
                'Fecha Vencimiento': '',
                'Número de Lote': '',
                'Proveedor': '',
                'Notas': ''
            }
        ];
        const wsStockMovements = XLSX.utils.json_to_sheet(stockMovementsData);
        wsStockMovements['!cols'] = [
            { wch: 55 }, { wch: 20 }, { wch: 16 }, { wch: 22 }, { wch: 20 },
            { wch: 20 }, { wch: 18 }, { wch: 22 }, { wch: 40 }
        ];
        XLSX.utils.book_append_sheet(workbook, wsStockMovements, 'Movimientos Stock');

        // -----------------------------------------------------------------
        // SHEET 4: EXAMPLES (Ejemplos)
        // -----------------------------------------------------------------
        const examplesData = [
            // Header explanation row
            ['═══ EJEMPLOS DE NUEVOS PRODUCTOS ═══', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['Operación', 'SKU', 'Código Barras', 'Nombre', 'Categoría', 'Descripción', 'Precio Venta', 'Stock Inicial', 'Costo Unitario', 'Stock Mínimo', 'Fecha Venc.', 'Lote', 'Proveedor', 'Activo'],

            // Example 1: Dog food - complete
            ['New Product', 'ALI-DOG-001', '7891234567890', 'Royal Canin Adult Perro 15kg', 'Alimento Perros', 'Alimento premium para perros adultos de razas medianas', 185000, 10, 145000, 3, '2025-12-31', 'RC2024-A1', 'Distribuidora PetFood', 'SI'],

            // Example 2: Cat food - minimal
            ['New Product', '', '', 'Whiskas Adulto Atún 1kg', 'Alimento Gatos', '', 25000, 20, 18000, 5, '', '', '', 'SI'],

            // Example 3: Medicine - with expiry
            ['New Product', 'MED-ANTI-001', '', 'Frontline Plus Perro M', 'Antiparasitarios', 'Pipeta antiparasitaria para perros 10-20kg', 85000, 15, 62000, 5, '2025-06-30', 'FL2024-123', 'Merial Paraguay', 'SI'],

            // Example 4: Accessory
            ['New Product', 'ACC-COL-001', '7897654321098', 'Collar Nylon Mediano Rojo', 'Accesorios', 'Collar ajustable para perros medianos', 35000, 8, 22000, 2, '', '', 'Pet Accesorios SA', 'SI'],

            // Example 5: Shampoo
            ['New Product', 'HIG-SHA-001', '', 'Shampoo Antipulgas 500ml', 'Higiene', 'Shampoo medicado para control de pulgas', 45000, 12, 28000, 4, '2026-03-15', 'SH2025-001', 'Laboratorio VetCare', 'SI'],

            ['', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['═══ EJEMPLOS DE MOVIMIENTOS DE STOCK ═══', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['Operación', 'SKU', 'Cantidad', 'Costo Unit.', 'Nuevo Precio', 'Fecha Venc.', 'Lote', 'Proveedor', 'Notas', '', '', '', '', ''],

            // Example: Purchase
            ['Purchase', 'ALI-DOG-001', 20, 142000, '', '2026-01-15', 'RC2025-B2', 'Distribuidora PetFood', 'Compra mensual enero', '', '', '', '', ''],

            // Example: Sale (recorded manually if not using POS)
            ['Sale', 'ALI-DOG-001', -1, '', '', '', '', '', 'Venta mostrador', '', '', '', '', ''],

            // Example: Adjustment (inventory count difference)
            ['Adjustment', 'ACC-COL-001', -2, '', '', '', '', '', 'Diferencia inventario físico 15/01', '', '', '', '', ''],

            // Example: Damage
            ['Damage', 'HIG-SHA-001', -1, '', '', '', '', '', 'Envase roto en almacén', '', '', '', '', ''],

            // Example: Theft
            ['Theft', 'MED-ANTI-001', -3, '', '', '', '', '', 'Faltante detectado 20/01', '', '', '', '', ''],

            // Example: Price Update only
            ['Price Update', 'ALI-DOG-001', 0, '', 195000, '', '', '', 'Actualización precio 2025', '', '', '', '', ''],

            ['', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['═══ NOTAS SOBRE LOS EJEMPLOS ═══', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['• Las cantidades positivas (+) aumentan el stock', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['• Las cantidades negativas (-) disminuyen el stock', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['• El Costo Unitario es OBLIGATORIO solo para operación "Purchase"', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['• El campo "Nuevo Precio" solo aplica para operación "Price Update"', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ['• Al importar, elimine esta hoja de ejemplos o déjela - será ignorada', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ];
        const wsExamples = XLSX.utils.aoa_to_sheet(examplesData);
        wsExamples['!cols'] = [
            { wch: 15 }, { wch: 16 }, { wch: 35 }, { wch: 22 }, { wch: 45 },
            { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
            { wch: 14 }, { wch: 18 }, { wch: 22 }, { wch: 8 }
        ];
        XLSX.utils.book_append_sheet(workbook, wsExamples, 'Ejemplos');

        // -----------------------------------------------------------------
        // SHEET 5: CATEGORIES (Categorías)
        // -----------------------------------------------------------------
        const categoriesData = [
            { 'Categoría': 'Alimento Perros', 'Slug (Auto)': 'alimento-perros', 'Descripción': 'Alimentos balanceados para perros de todas las edades' },
            { 'Categoría': 'Alimento Gatos', 'Slug (Auto)': 'alimento-gatos', 'Descripción': 'Alimentos balanceados para gatos de todas las edades' },
            { 'Categoría': 'Antiparasitarios', 'Slug (Auto)': 'antiparasitarios', 'Descripción': 'Productos contra pulgas, garrapatas y parásitos internos' },
            { 'Categoría': 'Accesorios', 'Slug (Auto)': 'accesorios', 'Descripción': 'Collares, correas, juguetes y más' },
            { 'Categoría': 'Higiene', 'Slug (Auto)': 'higiene', 'Descripción': 'Shampoos, cepillos y productos de limpieza' },
            { 'Categoría': 'Medicamentos', 'Slug (Auto)': 'medicamentos', 'Descripción': 'Medicamentos veterinarios con receta' },
            { 'Categoría': 'Suplementos', 'Slug (Auto)': 'suplementos', 'Descripción': 'Vitaminas, minerales y suplementos nutricionales' },
            { 'Categoría': 'Camas y Casas', 'Slug (Auto)': 'camas-casas', 'Descripción': 'Camas, cuchas y casas para mascotas' },
            { 'Categoría': 'Transportadoras', 'Slug (Auto)': 'transportadoras', 'Descripción': 'Jaulas y transportadoras para viajes' },
            { 'Categoría': 'Snacks y Premios', 'Slug (Auto)': 'snacks-premios', 'Descripción': 'Golosinas y premios para entrenamiento' },
            { 'Categoría': 'Alimento Aves', 'Slug (Auto)': 'alimento-aves', 'Descripción': 'Semillas y alimentos para aves' },
            { 'Categoría': 'Alimento Roedores', 'Slug (Auto)': 'alimento-roedores', 'Descripción': 'Alimentos para hamsters, conejos y más' },
            { 'Categoría': 'Acuarios', 'Slug (Auto)': 'acuarios', 'Descripción': 'Productos para acuarios y peces' },
            { 'Categoría': '', 'Slug (Auto)': '', 'Descripción': '' },
            { 'Categoría': '═══ NOTA ═══', 'Slug (Auto)': '', 'Descripción': 'Puede crear categorías nuevas simplemente escribiéndolas en la columna Categoría al importar productos.' },
        ];
        const wsCategories = XLSX.utils.json_to_sheet(categoriesData);
        wsCategories['!cols'] = [{ wch: 25 }, { wch: 22 }, { wch: 60 }];
        XLSX.utils.book_append_sheet(workbook, wsCategories, 'Categorías');

        // -----------------------------------------------------------------
        // SHEET 6: QUICK IMPORT (Importación Rápida) - Single sheet format
        // -----------------------------------------------------------------
        const quickImportData = [
            {
                'Operation (Required)': '',
                'SKU': '',
                'Name': '',
                'Category': '',
                'Description': '',
                'Base Price (Sell)': 0,
                'Quantity (Add/Remove)': 0,
                'Unit Cost (Buy)': 0,
                'Min Stock Level': 0,
                'Expiry Date (YYYY-MM-DD)': '',
                'Batch Number': '',
                'Supplier': '',
                'Barcode': ''
            }
        ];
        const wsQuickImport = XLSX.utils.json_to_sheet(quickImportData);
        wsQuickImport['!cols'] = [
            { wch: 55 }, { wch: 18 }, { wch: 30 }, { wch: 22 }, { wch: 40 },
            { wch: 18 }, { wch: 22 }, { wch: 18 }, { wch: 16 }, { wch: 25 },
            { wch: 16 }, { wch: 22 }, { wch: 18 }
        ];
        XLSX.utils.book_append_sheet(workbook, wsQuickImport, 'Importación Rápida');

    } else {
        // =====================================================================
        // CATALOG EXPORT - Current inventory with all details
        // =====================================================================
        const { data: products, error } = await supabase
            .from('store_products')
            .select(`
                sku,
                name,
                description,
                base_price,
                barcode,
                is_active,
                store_categories(name),
                store_inventory(
                    stock_quantity,
                    weighted_average_cost,
                    min_stock_level,
                    expiry_date,
                    batch_number,
                    supplier_name
                )
            `)
            .eq('tenant_id', profile.tenant_id)
            .order('name');

        if (error) return new NextResponse(error.message, { status: 500 });

        // Main catalog sheet
        const catalogData = (products as ProductFromDB[]).map((p) => ({
            'Operation (Optional)': '',
            'SKU': p.sku || '',
            'Barcode': p.barcode || '',
            'Name': p.name,
            'Category': p.store_categories?.name || '',
            'Description': p.description || '',
            'Base Price (Sell)': p.base_price,
            'Quantity (Add/Remove)': 0,
            'Unit Cost (Buy)': 0,
            'Min Stock Level': p.store_inventory?.min_stock_level || 0,
            'Expiry Date': p.store_inventory?.expiry_date || '',
            'Batch Number': p.store_inventory?.batch_number || '',
            'Supplier': p.store_inventory?.supplier_name || '',
            'Active': p.is_active ? 'SI' : 'NO',
            '── READ ONLY ──': '│',
            'Current Stock': p.store_inventory?.stock_quantity || 0,
            'Avg Cost': p.store_inventory?.weighted_average_cost || 0,
            'Inventory Value': (p.store_inventory?.stock_quantity || 0) * (p.store_inventory?.weighted_average_cost || 0)
        }));

        const wsCatalog = XLSX.utils.json_to_sheet(catalogData);
        wsCatalog['!cols'] = [
            { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 35 }, { wch: 20 },
            { wch: 40 }, { wch: 18 }, { wch: 22 }, { wch: 18 }, { wch: 16 },
            { wch: 15 }, { wch: 16 }, { wch: 22 }, { wch: 8 }, { wch: 15 },
            { wch: 14 }, { wch: 14 }, { wch: 16 }
        ];
        XLSX.utils.book_append_sheet(workbook, wsCatalog, 'Catálogo');

        // Summary sheet
        const totalProducts = catalogData.length;
        const totalValue = catalogData.reduce((sum, p) => sum + (p['Inventory Value'] as number), 0);
        const lowStockCount = catalogData.filter(p =>
            (p['Current Stock'] as number) <= (p['Min Stock Level'] as number) &&
            (p['Min Stock Level'] as number) > 0
        ).length;
        const activeCount = catalogData.filter(p => p['Active'] === 'SI').length;

        const summaryData = [
            ['═══════════════════════════════════════════════════════════'],
            ['                 RESUMEN DE INVENTARIO'],
            ['═══════════════════════════════════════════════════════════'],
            [''],
            ['Fecha de Exportación:', new Date().toLocaleString('es-PY')],
            [''],
            ['ESTADÍSTICAS GENERALES'],
            ['────────────────────────────────────────────────────────────'],
            ['Total de Productos:', totalProducts],
            ['Productos Activos:', activeCount],
            ['Productos Bajo Stock Mínimo:', lowStockCount],
            ['Valor Total del Inventario:', `Gs. ${totalValue.toLocaleString('es-PY')}`],
            [''],
            ['INSTRUCCIONES PARA ACTUALIZAR'],
            ['────────────────────────────────────────────────────────────'],
            ['1. En la hoja "Catálogo", complete la columna "Operation" con la acción deseada'],
            ['2. Para compras (Purchase): indique cantidad positiva y costo unitario'],
            ['3. Para ajustes (Adjustment): indique cantidad +/- según diferencia'],
            ['4. Para cambio de precio (Price Update): modifique "Base Price (Sell)"'],
            ['5. Las columnas después de "── READ ONLY ──" son solo de referencia'],
            ['6. Guarde el archivo y súbalo en el sistema'],
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        wsSummary['!cols'] = [{ wch: 35 }, { wch: 30 }];
        XLSX.utils.book_append_sheet(workbook, wsSummary, 'Resumen');
    }

    // Write to buffer
    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const filename = type === 'template'
        ? `plantilla_inventario_${profile.tenant_id}.xlsx`
        : `inventario_${profile.tenant_id}_${new Date().toISOString().split('T')[0]}.xlsx`;

    return new NextResponse(buf, {
        headers: {
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
    });
}
