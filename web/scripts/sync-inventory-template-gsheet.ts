/**
 * Sync Inventory Template to Google Sheets
 *
 * This script creates or updates a Google Sheets template for inventory management.
 * It requires a Google Cloud service account with Sheets and Drive API access.
 *
 * Setup (one-time):
 * 1. Go to https://console.cloud.google.com
 * 2. Create a project (or use existing)
 * 3. Enable "Google Sheets API" and "Google Drive API"
 * 4. Create a Service Account (IAM → Service Accounts → Create)
 * 5. Create a JSON key for the service account
 * 6. Save the JSON file as: web/config/google-service-account.json
 * 7. Add to .gitignore: config/google-service-account.json
 *
 * Run:
 *   npx tsx scripts/sync-inventory-template-gsheet.ts
 *
 * Options:
 *   --create    Create a new spreadsheet (default if no ID exists)
 *   --update    Update existing spreadsheet
 *   --sheet-id=ID  Specify spreadsheet ID to update
 */

import { google, sheets_v4, drive_v3 } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Configuration
// ============================================================================

const CONFIG_PATH = path.join(process.cwd(), 'config', 'google-service-account.json');
const SHEET_ID_FILE = path.join(process.cwd(), 'config', 'inventory-template-sheet-id.txt');
const SPREADSHEET_TITLE = 'Plantilla de Inventario - Vete';

// ============================================================================
// Types
// ============================================================================

interface SheetData {
    title: string;
    data: (string | number | null)[][];
    columnWidths: number[];
    freezeRows?: number;
    freezeCols?: number;
    headerColor?: { red: number; green: number; blue: number };
}

// ============================================================================
// Authentication
// ============================================================================

async function getAuthClient(): Promise<any> {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error('');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ Google Service Account credentials not found!');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('');
        console.error('Please follow these steps to set up Google Sheets API:');
        console.error('');
        console.error('1. Go to https://console.cloud.google.com');
        console.error('2. Create a new project or select existing one');
        console.error('3. Enable APIs:');
        console.error('   - Go to "APIs & Services" → "Enable APIs"');
        console.error('   - Search and enable "Google Sheets API"');
        console.error('   - Search and enable "Google Drive API"');
        console.error('4. Create Service Account:');
        console.error('   - Go to "IAM & Admin" → "Service Accounts"');
        console.error('   - Click "Create Service Account"');
        console.error('   - Name it (e.g., "vete-sheets-sync")');
        console.error('   - Click "Create and Continue"');
        console.error('   - Skip role assignment, click "Done"');
        console.error('5. Create JSON Key:');
        console.error('   - Click on the service account you created');
        console.error('   - Go to "Keys" tab');
        console.error('   - "Add Key" → "Create new key" → JSON');
        console.error('   - Save the downloaded file as:');
        console.error(`   ${CONFIG_PATH}`);
        console.error('');
        console.error('6. Add to .gitignore:');
        console.error('   config/google-service-account.json');
        console.error('');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        process.exit(1);
    }

    const credentials = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive',
        ],
    });

    return auth;
}

// ============================================================================
// Template Data
// ============================================================================

function getTemplateSheets(): SheetData[] {
    return [
        // Sheet 1: Instructions
        {
            title: '📖 Instrucciones',
            headerColor: { red: 0.2, green: 0.2, blue: 0.2 },
            columnWidths: [700],
            data: [
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
            ],
        },

        // Sheet 2: New Products
        {
            title: '🆕 Nuevos Productos',
            headerColor: { red: 0.2, green: 0.6, blue: 0.2 },
            freezeRows: 6,
            columnWidths: [250, 130, 300, 140, 130, 150, 130, 130, 180, 120, 180, 100],
            data: [
                [''],
                ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
                ['🆕 AGREGAR NUEVOS PRODUCTOS AL CATÁLOGO'],
                ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
                ['Use esta hoja para agregar productos que NO existen en el sistema. El SKU se generará automáticamente.'],
                [''],
                ['⭐ Nombre del Producto', '⭐ Categoría', 'Descripción', '⭐ Precio Venta (Gs)', '⭐ Cantidad Inicial', '⭐ Costo Unitario (Gs)', 'Código de Barras', 'Stock Mínimo', 'Fecha Vencimiento', 'Número de Lote', 'Proveedor', 'Activo'],
                ['Royal Canin Adult Medium 15kg', 'Alimentos', 'Alimento premium para perros adultos medianos', 450000, 20, 320000, '7891234567890', 5, '2026-03-15', 'LOT2025A', 'Pet Food Paraguay', 'SI'],
                ['Frontline Plus Perro L', 'Antiparasitarios', 'Pipeta antipulgas para perros grandes 20-40kg', 185000, 30, 120000, '7891234567891', 10, '2026-06-30', 'FL2025B', 'Merial Paraguay', 'SI'],
                ['Collar Reflectivo LED M', 'Accesorios', 'Collar con luz LED recargable USB, talla M', 95000, 15, 52000, '7891234567892', 3, '', '', 'ImportPet SA', 'SI'],
            ],
        },

        // Sheet 3: Stock Movements
        {
            title: '📦 Movimientos',
            headerColor: { red: 0.2, green: 0.4, blue: 0.8 },
            freezeRows: 7,
            columnWidths: [160, 130, 100, 150, 170, 140, 120, 180, 250],
            data: [
                [''],
                ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
                ['📦 MOVIMIENTOS DE INVENTARIO (PRODUCTOS EXISTENTES)'],
                ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
                ['Use esta hoja para productos que YA EXISTEN. Necesita el SKU del producto.'],
                [''],
                ['⭐ SKU del Producto', '⭐ Operación', '⭐ Cantidad', 'Costo Unitario (Gs)', 'Nuevo Precio Venta (Gs)', 'Fecha Vencimiento', 'Número de Lote', 'Proveedor', 'Notas / Razón'],
                ['prod_abc123', 'Purchase', 50, 280000, null, '2026-06-30', 'LOT2025B', 'Distribuidora Central', 'Compra mensual'],
                ['prod_def456', 'Adjustment', -3, null, null, null, null, null, 'Ajuste por conteo físico'],
                ['prod_ghi789', 'Price Update', 0, null, 550000, null, null, null, 'Aumento por inflación'],
                ['prod_jkl012', 'Damage', -2, null, null, null, null, null, 'Bolsas rotas en depósito'],
                ['prod_mno345', 'Expired', -5, null, null, null, 'LOT2024-01', null, 'Vencido 01/12/2024'],
            ],
        },

        // Sheet 4: Examples
        {
            title: '📚 Ejemplos',
            headerColor: { red: 0.6, green: 0.4, blue: 0.2 },
            columnWidths: [180, 110, 300, 100, 90, 100, 130, 80, 110, 110, 160, 80],
            data: [
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
            ],
        },

        // Sheet 5: Categories
        {
            title: '🏷️ Categorías',
            headerColor: { red: 0.5, green: 0.2, blue: 0.6 },
            columnWidths: [180, 300, 350],
            data: [
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
            ],
        },

        // Sheet 6: Quick Import
        {
            title: '⚡ Importación Rápida',
            headerColor: { red: 0.9, green: 0.6, blue: 0.1 },
            freezeRows: 7,
            columnWidths: [120, 160, 220, 130, 100, 140, 140],
            data: [
                [''],
                ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
                ['⚡ IMPORTACIÓN RÁPIDA - FORMATO SIMPLIFICADO'],
                ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
                ['Para importaciones rápidas cuando solo necesitas los campos básicos.'],
                [''],
                ['Operación', 'SKU (vacío=nuevo)', 'Nombre', 'Categoría', 'Cantidad', 'Costo Unitario', 'Precio Venta'],
                ['New Product', '', 'Producto Ejemplo 1', 'Alimentos', 10, 50000, 75000],
                ['Purchase', 'prod_existente', '', '', 25, 48000, ''],
                ['Adjustment', 'prod_existente', '', '', -2, '', ''],
                ['Price Update', 'prod_existente', '', '', 0, '', 85000],
            ],
        },
    ];
}

// ============================================================================
// Spreadsheet Operations
// ============================================================================

async function createSpreadsheet(sheets: sheets_v4.Sheets, drive: drive_v3.Drive): Promise<string> {
    console.log('📝 Creating new spreadsheet...');

    const templateSheets = getTemplateSheets();

    // Create spreadsheet with all sheets
    const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
            properties: {
                title: SPREADSHEET_TITLE,
                locale: 'es_PY',
            },
            sheets: templateSheets.map((sheet, index) => ({
                properties: {
                    title: sheet.title,
                    index,
                    gridProperties: {
                        frozenRowCount: sheet.freezeRows || 0,
                        frozenColumnCount: sheet.freezeCols || 0,
                    },
                },
            })),
        },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId!;
    console.log(`   ✓ Created spreadsheet: ${spreadsheetId}`);

    // Populate each sheet with data
    for (let i = 0; i < templateSheets.length; i++) {
        const sheet = templateSheets[i];
        console.log(`   📄 Populating "${sheet.title}"...`);

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `'${sheet.title}'!A1`,
            valueInputOption: 'RAW',
            requestBody: {
                values: sheet.data,
            },
        });
    }

    // Apply formatting
    await applyFormatting(sheets, spreadsheetId, templateSheets);

    // Add data validation
    await addDataValidation(sheets, spreadsheetId);

    // Make publicly accessible (anyone with link can view)
    console.log('🔓 Setting permissions (anyone with link can view)...');
    await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: {
            role: 'reader',
            type: 'anyone',
        },
    });

    // Save spreadsheet ID
    fs.writeFileSync(SHEET_ID_FILE, spreadsheetId);
    console.log(`   ✓ Saved spreadsheet ID to ${SHEET_ID_FILE}`);

    return spreadsheetId;
}

async function updateSpreadsheet(sheets: sheets_v4.Sheets, spreadsheetId: string): Promise<void> {
    console.log(`📝 Updating spreadsheet: ${spreadsheetId}`);

    const templateSheets = getTemplateSheets();

    // Clear and repopulate each sheet
    for (let i = 0; i < templateSheets.length; i++) {
        const sheet = templateSheets[i];
        console.log(`   📄 Updating "${sheet.title}"...`);

        // Clear existing data
        await sheets.spreadsheets.values.clear({
            spreadsheetId,
            range: `'${sheet.title}'!A:Z`,
        });

        // Add new data
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `'${sheet.title}'!A1`,
            valueInputOption: 'RAW',
            requestBody: {
                values: sheet.data,
            },
        });
    }

    // Reapply formatting
    await applyFormatting(sheets, spreadsheetId, templateSheets);

    // Reapply data validation
    await addDataValidation(sheets, spreadsheetId);

    console.log('   ✓ Spreadsheet updated successfully');
}

async function applyFormatting(
    sheets: sheets_v4.Sheets,
    spreadsheetId: string,
    templateSheets: SheetData[]
): Promise<void> {
    console.log('🎨 Applying formatting...');

    // Get sheet IDs
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetList = spreadsheet.data.sheets || [];

    const requests: sheets_v4.Schema$Request[] = [];

    for (let i = 0; i < templateSheets.length; i++) {
        const template = templateSheets[i];
        const sheetId = sheetList[i]?.properties?.sheetId;

        if (sheetId === undefined) continue;

        // Set column widths
        template.columnWidths.forEach((width, colIndex) => {
            requests.push({
                updateDimensionProperties: {
                    range: {
                        sheetId,
                        dimension: 'COLUMNS',
                        startIndex: colIndex,
                        endIndex: colIndex + 1,
                    },
                    properties: {
                        pixelSize: width,
                    },
                    fields: 'pixelSize',
                },
            });
        });

        // Format header row (row 6 or 7 depending on sheet structure)
        const headerRow = template.freezeRows ? template.freezeRows - 1 : 5;
        if (template.headerColor) {
            requests.push({
                repeatCell: {
                    range: {
                        sheetId,
                        startRowIndex: headerRow,
                        endRowIndex: headerRow + 1,
                    },
                    cell: {
                        userEnteredFormat: {
                            backgroundColor: template.headerColor,
                            textFormat: {
                                bold: true,
                                foregroundColor: { red: 1, green: 1, blue: 1 },
                            },
                        },
                    },
                    fields: 'userEnteredFormat(backgroundColor,textFormat)',
                },
            });
        }
    }

    if (requests.length > 0) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: { requests },
        });
    }

    console.log('   ✓ Formatting applied');
}

async function addDataValidation(sheets: sheets_v4.Sheets, spreadsheetId: string): Promise<void> {
    console.log('✅ Adding data validation...');

    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetList = spreadsheet.data.sheets || [];

    const requests: sheets_v4.Schema$Request[] = [];

    // Categories for new products (sheet index 1, column B)
    const newProductsSheetId = sheetList[1]?.properties?.sheetId;
    if (newProductsSheetId !== undefined) {
        requests.push({
            setDataValidation: {
                range: {
                    sheetId: newProductsSheetId,
                    startRowIndex: 7,
                    endRowIndex: 500,
                    startColumnIndex: 1,
                    endColumnIndex: 2,
                },
                rule: {
                    condition: {
                        type: 'ONE_OF_LIST',
                        values: [
                            { userEnteredValue: 'Alimentos' },
                            { userEnteredValue: 'Medicamentos' },
                            { userEnteredValue: 'Antiparasitarios' },
                            { userEnteredValue: 'Higiene' },
                            { userEnteredValue: 'Juguetes' },
                            { userEnteredValue: 'Snacks y Premios' },
                            { userEnteredValue: 'Camas y Casas' },
                            { userEnteredValue: 'Transportadoras' },
                            { userEnteredValue: 'Ropa y Disfraces' },
                            { userEnteredValue: 'Accesorios' },
                            { userEnteredValue: 'Suplementos' },
                            { userEnteredValue: 'Otro' },
                        ],
                    },
                    showCustomUi: true,
                    strict: false,
                },
            },
        });
    }

    // Operations for movements (sheet index 2, column B)
    const movementsSheetId = sheetList[2]?.properties?.sheetId;
    if (movementsSheetId !== undefined) {
        requests.push({
            setDataValidation: {
                range: {
                    sheetId: movementsSheetId,
                    startRowIndex: 7,
                    endRowIndex: 500,
                    startColumnIndex: 1,
                    endColumnIndex: 2,
                },
                rule: {
                    condition: {
                        type: 'ONE_OF_LIST',
                        values: [
                            { userEnteredValue: 'Purchase' },
                            { userEnteredValue: 'Sale' },
                            { userEnteredValue: 'Adjustment' },
                            { userEnteredValue: 'Damage' },
                            { userEnteredValue: 'Theft' },
                            { userEnteredValue: 'Expired' },
                            { userEnteredValue: 'Return' },
                            { userEnteredValue: 'Price Update' },
                        ],
                    },
                    showCustomUi: true,
                    strict: true,
                },
            },
        });
    }

    // Operations for quick import (sheet index 5, column A)
    const quickImportSheetId = sheetList[5]?.properties?.sheetId;
    if (quickImportSheetId !== undefined) {
        requests.push({
            setDataValidation: {
                range: {
                    sheetId: quickImportSheetId,
                    startRowIndex: 7,
                    endRowIndex: 500,
                    startColumnIndex: 0,
                    endColumnIndex: 1,
                },
                rule: {
                    condition: {
                        type: 'ONE_OF_LIST',
                        values: [
                            { userEnteredValue: 'New Product' },
                            { userEnteredValue: 'Purchase' },
                            { userEnteredValue: 'Sale' },
                            { userEnteredValue: 'Adjustment' },
                            { userEnteredValue: 'Damage' },
                            { userEnteredValue: 'Theft' },
                            { userEnteredValue: 'Expired' },
                            { userEnteredValue: 'Return' },
                            { userEnteredValue: 'Price Update' },
                        ],
                    },
                    showCustomUi: true,
                    strict: true,
                },
            },
        });
    }

    if (requests.length > 0) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: { requests },
        });
    }

    console.log('   ✓ Data validation added');
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Google Sheets Inventory Template Sync');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    // Parse args
    const args = process.argv.slice(2);
    const forceCreate = args.includes('--create');
    const forceUpdate = args.includes('--update');
    let sheetId = args.find(a => a.startsWith('--sheet-id='))?.split('=')[1];

    // Authenticate
    console.log('🔐 Authenticating with Google...');
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });
    console.log('   ✓ Authenticated successfully');
    console.log('');

    // Check for existing sheet ID
    if (!sheetId && fs.existsSync(SHEET_ID_FILE)) {
        sheetId = fs.readFileSync(SHEET_ID_FILE, 'utf-8').trim();
    }

    let spreadsheetId: string;

    if (forceCreate || (!sheetId && !forceUpdate)) {
        // Create new spreadsheet
        spreadsheetId = await createSpreadsheet(sheets, drive);
    } else if (sheetId) {
        // Update existing spreadsheet
        spreadsheetId = sheetId;
        await updateSpreadsheet(sheets, spreadsheetId);
    } else {
        console.error('❌ No spreadsheet ID found. Use --create to create a new one.');
        process.exit(1);
    }

    // Output URLs
    const viewUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    const copyUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/copy`;

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DONE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📋 Spreadsheet ID:');
    console.log(`   ${spreadsheetId}`);
    console.log('');
    console.log('🔗 View URL:');
    console.log(`   ${viewUrl}`);
    console.log('');
    console.log('📥 Copy URL (use this in config.json):');
    console.log(`   ${copyUrl}`);
    console.log('');
    console.log('📝 Update config.json:');
    console.log(`   "inventory_template_google_sheet_url": "${copyUrl}"`);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(console.error);
