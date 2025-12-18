/**
 * Generates the inventory template Excel file for Google Sheets upload
 *
 * Run with: npx tsx scripts/generate-inventory-template.ts
 * Output: inventory_template_vete.xlsx (in current directory)
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

function generateTemplate(): void {
    const workbook = XLSX.utils.book_new();

    // ========================================================================
    // SHEET 1: 📖 Instrucciones
    // ========================================================================
    const instructionsData = [
        [''],
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
        ['📋  PLANTILLA DE GESTIÓN DE INVENTARIO - VETE'],
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
        [''],
        ['🎯 PROPÓSITO'],
        ['Esta plantilla permite gestionar tu inventario de forma masiva:'],
        ['   ✓ Agregar nuevos productos al catálogo'],
        ['   ✓ Registrar compras a proveedores'],
        ['   ✓ Ajustar stock (pérdidas, daños, robos)'],
        ['   ✓ Actualizar precios de venta'],
        ['   ✓ Registrar vencimientos y lotes'],
        [''],
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
        ['📑 HOJAS DISPONIBLES'],
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
        [''],
        ['   🆕 Nuevos Productos    → Para agregar productos que NO existen en el sistema'],
        ['   📦 Movimientos         → Para registrar compras, ajustes y cambios de precio'],
        ['   📚 Ejemplos            → Ejemplos completos de cada tipo de operación'],
        ['   🏷️ Categorías          → Lista de categorías válidas para productos'],
        ['   ⚡ Importación Rápida  → Formato simplificado para importaciones básicas'],
        [''],
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
        ['🔧 OPERACIONES DISPONIBLES'],
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
        [''],
        ['   OPERACIÓN          DESCRIPCIÓN                              CANTIDAD    COSTO'],
        ['   ─────────────────────────────────────────────────────────────────────────────'],
        ['   New Product        Crear producto nuevo                     Inicial     Compra'],
        ['   Purchase           Compra a proveedor                       + Positiva  ⭐ Requerido'],
        ['   Sale               Venta (se descuenta)                     - Negativa  Opcional'],
        ['   Adjustment         Ajuste de inventario                     +/-         Opcional'],
        ['   Damage             Productos dañados                        - Negativa  N/A'],
        ['   Theft              Pérdida por robo                         - Negativa  N/A'],
        ['   Expired            Productos vencidos                       - Negativa  N/A'],
        ['   Return             Devolución de cliente                    + Positiva  Opcional'],
        ['   Price Update       Solo actualizar precio                   0           N/A'],
        [''],
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
        ['💲 COSTO PROMEDIO PONDERADO (WAC)'],
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
        [''],
        ['   El sistema calcula automáticamente el costo promedio ponderado'],
        ['   cada vez que registras una COMPRA (Purchase).'],
        [''],
        ['   Fórmula: WAC = (Stock Actual × Costo Actual + Cantidad Nueva × Costo Nuevo)'],
        ['                  ─────────────────────────────────────────────────────────────'],
        ['                              (Stock Actual + Cantidad Nueva)'],
        [''],
        ['   Ejemplo:'],
        ['   • Stock actual: 10 unidades a Gs. 50,000 c/u'],
        ['   • Nueva compra: 5 unidades a Gs. 60,000 c/u'],
        ['   • Nuevo WAC: (10×50,000 + 5×60,000) / 15 = Gs. 53,333'],
        [''],
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
        ['⚠️ NOTAS IMPORTANTES'],
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
        [''],
        ['   • Los campos marcados con ⭐ son OBLIGATORIOS'],
        ['   • El SKU se genera automáticamente para productos nuevos'],
        ['   • Las fechas deben estar en formato YYYY-MM-DD (ej: 2025-06-15)'],
        ['   • Los precios y costos NO deben incluir separadores de miles'],
        ['   • Activo: SI/NO determina si el producto aparece en la tienda'],
        [''],
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
    wsInstructions['!cols'] = [{ wch: 90 }];

    // ========================================================================
    // SHEET 2: 🆕 Nuevos Productos
    // ========================================================================
    const newProductsData = [
        [''],
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
        ['🆕 AGREGAR NUEVOS PRODUCTOS AL CATÁLOGO'],
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
        ['Use esta hoja para agregar productos que NO existen en el sistema. El SKU se generará automáticamente.'],
        [''],
        [
            '⭐ Nombre del Producto',
            '⭐ Categoría ▼',
            'Descripción',
            '⭐ Precio Venta (Gs)',
            '⭐ Cantidad Inicial',
            '⭐ Costo Unitario (Gs)',
            'Código de Barras',
            'Stock Mínimo (Alerta)',
            'Fecha Vencimiento (YYYY-MM-DD)',
            'Número de Lote',
            'Proveedor',
            'Activo (SI/NO)'
        ],
        // Example row
        [
            'Royal Canin Adult Medium 15kg',
            'Alimentos',
            'Alimento premium para perros adultos medianos',
            450000,
            20,
            320000,
            '7891234567890',
            5,
            '2026-03-15',
            'LOT2025A',
            'Pet Food Paraguay',
            'SI'
        ],
    ];

    const wsNewProducts = XLSX.utils.aoa_to_sheet(newProductsData);
    wsNewProducts['!cols'] = [
        { wch: 35 }, { wch: 18 }, { wch: 45 }, { wch: 20 },
        { wch: 18 }, { wch: 22 }, { wch: 18 }, { wch: 18 },
        { wch: 28 }, { wch: 15 }, { wch: 25 }, { wch: 15 }
    ];

    // Data validation for categories
    wsNewProducts['!dataValidation'] = [{
        sqref: 'B8:B500',
        type: 'list',
        formula1: '"Alimentos,Medicamentos,Accesorios,Higiene,Juguetes,Suplementos,Antiparasitarios,Snacks y Premios,Camas y Casas,Transportadoras,Ropa y Disfraces,Otro"'
    }];

    // ========================================================================
    // SHEET 3: 📦 Movimientos de Stock
    // ========================================================================
    const movementsData = [
        [''],
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
        ['📦 MOVIMIENTOS DE INVENTARIO (PRODUCTOS EXISTENTES)'],
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
        ['Use esta hoja para productos que YA EXISTEN. Necesita el SKU del producto.'],
        [''],
        [
            '⭐ SKU del Producto',
            '⭐ Operación ▼',
            '⭐ Cantidad',
            'Costo Unitario (Gs)',
            'Nuevo Precio Venta (Gs)',
            'Fecha Vencimiento',
            'Número de Lote',
            'Proveedor',
            'Notas / Razón'
        ],
        // Example rows
        [
            'prod_abc123',
            'Purchase',
            50,
            280000,
            '',
            '2026-06-30',
            'LOT2025B',
            'Distribuidora Central',
            'Compra mensual'
        ],
        [
            'prod_def456',
            'Adjustment',
            -3,
            '',
            '',
            '',
            '',
            '',
            'Ajuste por conteo físico'
        ],
        [
            'prod_ghi789',
            'Price Update',
            0,
            '',
            550000,
            '',
            '',
            '',
            'Aumento por inflación'
        ],
    ];

    const wsMovements = XLSX.utils.aoa_to_sheet(movementsData);
    wsMovements['!cols'] = [
        { wch: 22 }, { wch: 18 }, { wch: 14 }, { wch: 22 },
        { wch: 24 }, { wch: 20 }, { wch: 16 }, { wch: 25 }, { wch: 35 }
    ];

    wsMovements['!dataValidation'] = [{
        sqref: 'B8:B500',
        type: 'list',
        formula1: '"Purchase,Sale,Adjustment,Damage,Theft,Price Update,Expired,Return"'
    }];

    // ========================================================================
    // SHEET 4: 📚 Ejemplos Completos
    // ========================================================================
    const examplesData = [
        [''],
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
        ['📚 EJEMPLOS PRÁCTICOS DE CADA TIPO DE OPERACIÓN'],
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
        [''],
        ['─── 🆕 EJEMPLO 1: PRODUCTO NUEVO ───'],
        ['Situación: Quieres agregar "Collar LED Recargable" que no existe en el sistema'],
        [''],
        ['Nombre', 'Categoría', 'Descripción', 'Precio Venta', 'Cantidad', 'Costo', 'Código Barras', 'Stock Mín', 'Vencimiento', 'Lote', 'Proveedor', 'Activo'],
        ['Collar LED Recargable M', 'Accesorios', 'Collar con luz LED, USB recargable, talla M', 85000, 15, 45000, '7894561230123', 3, '', '', 'ImportPet SA', 'SI'],
        [''],
        ['─── 📥 EJEMPLO 2: COMPRA A PROVEEDOR ───'],
        ['Situación: Llegó un pedido de 100 bolsas de alimento que YA existe (SKU: prod_royal_15kg)'],
        [''],
        ['SKU', 'Operación', 'Cantidad', 'Costo Unit.', 'Precio Venta', 'Vencimiento', 'Lote', 'Proveedor', 'Notas'],
        ['prod_royal_15kg', 'Purchase', 100, 320000, '', '2026-08-20', 'RC2025-08', 'Royal Canin Paraguay', 'Pedido agosto'],
        [''],
        ['💡 NOTA: El costo promedio se recalcula automáticamente con cada compra'],
        [''],
        ['─── ⚖️ EJEMPLO 3: AJUSTE DE INVENTARIO ───'],
        ['Situación: Al hacer conteo físico, encontraste 3 unidades menos de un producto'],
        [''],
        ['SKU', 'Operación', 'Cantidad', 'Costo Unit.', 'Precio Venta', 'Vencimiento', 'Lote', 'Proveedor', 'Notas'],
        ['prod_juguete_peluche', 'Adjustment', -3, '', '', '', '', '', 'Diferencia en conteo físico 15/12'],
        [''],
        ['─── 💥 EJEMPLO 4: PRODUCTOS DAÑADOS ───'],
        ['Situación: 2 bolsas de alimento se mojaron y no se pueden vender'],
        [''],
        ['SKU', 'Operación', 'Cantidad', 'Costo Unit.', 'Precio Venta', 'Vencimiento', 'Lote', 'Proveedor', 'Notas'],
        ['prod_dog_chow_21kg', 'Damage', -2, '', '', '', '', '', 'Daño por humedad en depósito'],
        [''],
        ['─── 💰 EJEMPLO 5: ACTUALIZAR PRECIO ───'],
        ['Situación: Necesitas aumentar el precio de venta de un producto'],
        [''],
        ['SKU', 'Operación', 'Cantidad', 'Costo Unit.', 'Precio Venta', 'Vencimiento', 'Lote', 'Proveedor', 'Notas'],
        ['prod_shampoo_premium', 'Price Update', 0, '', 125000, '', '', '', 'Ajuste por nuevo costo'],
        [''],
        ['─── 🗓️ EJEMPLO 6: PRODUCTOS VENCIDOS ───'],
        ['Situación: 5 medicamentos pasaron su fecha de vencimiento'],
        [''],
        ['SKU', 'Operación', 'Cantidad', 'Costo Unit.', 'Precio Venta', 'Vencimiento', 'Lote', 'Proveedor', 'Notas'],
        ['prod_antiparasitario_xl', 'Expired', -5, '', '', '', 'LOT2024-03', '', 'Vencido 01/12/2024'],
        [''],
        ['─── ↩️ EJEMPLO 7: DEVOLUCIÓN DE CLIENTE ───'],
        ['Situación: Un cliente devolvió un producto en buen estado'],
        [''],
        ['SKU', 'Operación', 'Cantidad', 'Costo Unit.', 'Precio Venta', 'Vencimiento', 'Lote', 'Proveedor', 'Notas'],
        ['prod_transportadora_l', 'Return', 1, '', '', '', '', '', 'Devolución - cliente cambió de mascota'],
        [''],
    ];

    const wsExamples = XLSX.utils.aoa_to_sheet(examplesData);
    wsExamples['!cols'] = [
        { wch: 25 }, { wch: 15 }, { wch: 45 }, { wch: 14 },
        { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 10 },
        { wch: 14 }, { wch: 14 }, { wch: 22 }, { wch: 10 }
    ];

    // ========================================================================
    // SHEET 5: 🏷️ Categorías
    // ========================================================================
    const categoriesData = [
        [''],
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
        ['🏷️ CATEGORÍAS VÁLIDAS PARA PRODUCTOS'],
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
        [''],
        ['Categoría', 'Descripción', 'Ejemplos'],
        [''],
        ['🐕 Alimentos', 'Alimentos balanceados y naturales', 'Royal Canin, Pro Plan, Dog Chow, alimento húmedo'],
        ['💊 Medicamentos', 'Productos farmacéuticos veterinarios', 'Antibióticos, antiinflamatorios, vitaminas'],
        ['🦠 Antiparasitarios', 'Control de parásitos internos y externos', 'Pipetas, collares, tabletas desparasitantes'],
        ['🧴 Higiene', 'Productos de limpieza y cuidado', 'Shampoos, cepillos, cortauñas, toallitas'],
        ['🎾 Juguetes', 'Entretenimiento para mascotas', 'Pelotas, cuerdas, peluches, rascadores'],
        ['🦴 Snacks y Premios', 'Golosinas y premios', 'Galletas, huesos, treats de entrenamiento'],
        ['🛋️ Camas y Casas', 'Descanso y refugio', 'Camas, casas, mantas, cuchas'],
        ['✈️ Transportadoras', 'Transporte de mascotas', 'Kennel, bolsos, mochilas'],
        ['👔 Ropa y Disfraces', 'Vestimenta para mascotas', 'Abrigos, impermeables, disfraces'],
        ['🔗 Accesorios', 'Collares, correas y más', 'Collares, arneses, correas, placas ID'],
        ['💉 Suplementos', 'Complementos nutricionales', 'Omega 3, probióticos, condroprotectores'],
        ['📦 Otro', 'Productos que no encajan en otras categorías', 'Artículos especiales'],
        [''],
    ];

    const wsCategories = XLSX.utils.aoa_to_sheet(categoriesData);
    wsCategories['!cols'] = [{ wch: 22 }, { wch: 40 }, { wch: 50 }];

    // ========================================================================
    // SHEET 6: ⚡ Importación Rápida
    // ========================================================================
    const quickImportData = [
        [''],
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
        ['⚡ IMPORTACIÓN RÁPIDA - FORMATO SIMPLIFICADO'],
        ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
        ['Para importaciones rápidas cuando solo necesitas los campos básicos.'],
        [''],
        [
            'Operación',
            'SKU (vacío=nuevo)',
            'Nombre',
            'Categoría',
            'Cantidad',
            'Costo Unitario',
            'Precio Venta'
        ],
        // Pre-filled examples
        ['New Product', '', 'Producto Ejemplo 1', 'Alimentos', 10, 50000, 75000],
        ['Purchase', 'SKU_EXISTENTE', '', '', 25, 48000, ''],
        ['Adjustment', 'SKU_EXISTENTE', '', '', -2, '', ''],
        ['Price Update', 'SKU_EXISTENTE', '', '', 0, '', 85000],
    ];

    const wsQuickImport = XLSX.utils.aoa_to_sheet(quickImportData);
    wsQuickImport['!cols'] = [
        { wch: 15 }, { wch: 22 }, { wch: 30 }, { wch: 18 },
        { wch: 12 }, { wch: 18 }, { wch: 18 }
    ];

    wsQuickImport['!dataValidation'] = [{
        sqref: 'A8:A500',
        type: 'list',
        formula1: '"New Product,Purchase,Sale,Adjustment,Damage,Theft,Price Update,Expired,Return"'
    }];

    // ========================================================================
    // Add all sheets to workbook
    // ========================================================================
    XLSX.utils.book_append_sheet(workbook, wsInstructions, '📖 Instrucciones');
    XLSX.utils.book_append_sheet(workbook, wsNewProducts, '🆕 Nuevos Productos');
    XLSX.utils.book_append_sheet(workbook, wsMovements, '📦 Movimientos');
    XLSX.utils.book_append_sheet(workbook, wsExamples, '📚 Ejemplos');
    XLSX.utils.book_append_sheet(workbook, wsCategories, '🏷️ Categorías');
    XLSX.utils.book_append_sheet(workbook, wsQuickImport, '⚡ Importación Rápida');

    // Write to file
    const outputPath = path.join(process.cwd(), 'inventory_template_vete.xlsx');
    XLSX.writeFile(workbook, outputPath);

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Template generated successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`📁 File: ${outputPath}`);
    console.log('');
    console.log('📋 Next steps to create Google Sheets template:');
    console.log('');
    console.log('   1. Go to https://drive.google.com');
    console.log('   2. Upload this file (drag & drop or New → File upload)');
    console.log('   3. Right-click the file → "Open with" → "Google Sheets"');
    console.log('   4. File → Share → "Anyone with the link" → "Viewer"');
    console.log('   5. Copy the URL and add "/copy" at the end');
    console.log('');
    console.log('   Example URL format:');
    console.log('   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/copy');
    console.log('');
    console.log('   6. Update config.json with this URL:');
    console.log('   "inventory_template_google_sheet_url": "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/copy"');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

generateTemplate();
