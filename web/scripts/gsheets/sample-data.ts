/**
 * Google Sheets Sample Data
 * Realistic examples to help clinic staff understand the format
 */

import { updateValues } from './auth';
import { SPREADSHEET_ID } from './config';

/**
 * Comprehensive guide content - Horizontal multi-column layout
 */
function getGuideContent(): string[][] {
  return [
    // Row 1: Main title (will be merged)
    ['🏥 PLANTILLA DE INVENTARIO VETERINARIO', '', '', '', '', '', ''],
    // Row 2: Subtitle
    ['Sistema de Gestión de Datos para Clínicas Veterinarias', '', '', '', '', '', ''],
    // Row 3: Empty spacer
    ['', '', '', '', '', '', ''],

    // Row 4: IMPORTANT WARNING - Make a copy (will be merged and highlighted)
    ['⚠️ IMPORTANTE: Antes de comenzar, ve a Archivo → Hacer una copia. Trabaja SOLO en tu copia personal.', '', '', '', '', '', ''],
    // Row 5: Empty spacer
    ['', '', '', '', '', '', ''],

    // Row 6: Section headers
    ['📋 ¿QUÉ ES ESTO?', '', '🔄 ¿CÓMO FUNCIONA?', '', '📝 ORDEN DE LLENADO', '', ''],
    // Row 7: Content
    ['Configura y actualiza los datos', '', '1. Completa las hojas', '', '1️⃣ ⚙️ Configuración', '', ''],
    ['de tu clínica de forma masiva.', '', '2. Ve al Panel web de tu clínica', '', '2️⃣ 📂 Categorías', '', ''],
    ['', '', '3. Selecciona "Importar desde Sheets"', '', '3️⃣ 🏭 Proveedores', '', ''],
    ['Úsala para:', '', '4. Pega el enlace de TU COPIA', '', '4️⃣ 🏷️ Marcas', '', ''],
    ['• Configuración inicial', '', '5. Revisa la VISTA PREVIA', '', '5️⃣ 🆕 Productos', '', ''],
    ['• Carga masiva de productos', '', '6. Confirma los cambios', '', '6️⃣ 📦 Stock Inicial', '', ''],
    ['• Actualización de precios', '', '', '', '', '', ''],
    ['• Ajustes de stock', '', '🛡️ El sistema mostrará qué se va', '', '', '', ''],
    ['• Gestión de proveedores', '', 'a crear/modificar antes de aplicar.', '', '', '', ''],
    // Row 16: Empty spacer
    ['', '', '', '', '', '', ''],

    // Row 17: Sheet descriptions header
    ['📑 DESCRIPCIÓN DE LAS HOJAS', '', '', '', '', '', ''],
    // Row 18: Empty
    ['', '', '', '', '', '', ''],

    // Row 19-24: Sheet descriptions in 3 columns
    ['📂 CATEGORÍAS', '', '🆕 PRODUCTOS', '', '📦 STOCK INICIAL', '', ''],
    ['Árbol jerárquico de productos', '', 'Catálogo completo para venta', '', 'Movimientos de inventario', '', ''],
    ['• Nivel 1: Categorías principales', '', '• Verde: Datos obligatorios', '', '• Compra: Entrada (+)', '', ''],
    ['• Nivel 2: Subcategorías', '', '• Amarillo: Precios', '', '• Venta: Salida (-)', '', ''],
    ['• Nivel 3: Sub-subcategorías', '', '• Alerta si stock < mínimo', '', '• Ajuste: Corrección (±)', '', ''],
    ['', '', '', '', '• Daño/Vencido: Pérdida (-)', '', ''],

    // Row 25: Empty
    ['', '', '', '', '', '', ''],

    // Row 26-30: More sheet descriptions
    ['🏭 PROVEEDORES', '', '🏷️ MARCAS', '', '⚙️ CONFIGURACIÓN', '', ''],
    ['Información de contacto', '', 'Marcas comercializadas', '', 'Parámetros generales', '', ''],
    ['• Productos: Para venta', '', 'Útil para filtrar y reportes', '', '• Unidades de medida', '', ''],
    ['• Insumos: Para servicios', '', '', '', '• Tasas de impuestos', '', ''],
    ['• Ambos: Todo', '', '', '', '• Ubicaciones de stock', '', ''],

    // Row 31: Empty
    ['', '', '', '', '', '', ''],

    // Row 32: Tips and warnings header
    ['💡 CONSEJOS', '', '⚠️ NO HACER', '', '✅ SÍ PUEDES', '', ''],
    // Row 33-38: Tips and warnings
    ['Usa los menús desplegables ▼', '', 'Eliminar filas de encabezado', '', 'Agregar más filas de datos', '', ''],
    ['Precios en Guaraníes (₲)', '', 'Cambiar nombres de hojas', '', 'Dejar campos opcionales vacíos', '', ''],
    ['Fechas: dd/mm/yyyy', '', 'Dejar SKU/Nombre vacíos', '', 'Usar tus propios códigos', '', ''],
    ['Usa filtros en cabeceras', '', 'Usar códigos duplicados', '', 'Modificar datos de ejemplo', '', ''],
    ['Códigos únicos sin espacios', '', 'Editar la plantilla original', '', 'Borrar datos de ejemplo', '', ''],

    // Row 39: Empty + version
    ['', '', '', '', '', '', ''],
    ['Versión 2.0 | Vete - Sistema Veterinario | ¿Dudas? Contacta soporte técnico', '', '', '', '', '', ''],
  ];
}

/**
 * Add all sample data to the spreadsheet
 */
export async function addSampleData(spreadsheetId: string = SPREADSHEET_ID): Promise<void> {
  console.log('\n📝 Adding sample data...\n');

  // 📖 Guía Rápida - Horizontal layout
  console.log('  📖 Guía Rápida...');
  const guideContent = getGuideContent();
  await updateValues(spreadsheetId, `'📖 Guía Rápida'!A1:G${guideContent.length}`, guideContent);

  // 📂 Categorías - Código auto-generado con ARRAYFORMULA
  // Columns: 🔒 Código, Nombre, Nivel, Categoría Padre, Activo
  // Fórmula: Si tiene padre -> Padre-INICIALES(3), Si no -> INICIALES(3)
  console.log('  📂 Categorías...');

  // ARRAYFORMULA en A2 que se aplica a toda la columna
  await updateValues(spreadsheetId, "'📂 Categorías'!A2", [
    ['=ARRAYFORMULA(IF(B2:B<>"", IF(D2:D<>"", D2:D&"-", "") & UPPER(LEFT(SUBSTITUTE(B2:B," ",""),3)), ""))'],
  ]);

  // Data sin la columna A (se genera automáticamente)
  await updateValues(spreadsheetId, "'📂 Categorías'!B2:E24", [
    // Level 1 categories
    ['Alimentos', '1', '', 'Sí'],
    ['Medicamentos', '1', '', 'Sí'],
    ['Accesorios', '1', '', 'Sí'],
    ['Higiene', '1', '', 'Sí'],
    ['Insumos Clínicos', '1', '', 'Sí'],
    // Level 2 - Alimentos
    ['Perros', '2', 'ALI', 'Sí'],
    ['Gatos', '2', 'ALI', 'Sí'],
    ['Aves', '2', 'ALI', 'Sí'],
    // Level 3 - Alimentos Perros
    ['Cachorros', '3', 'ALI-PER', 'Sí'],
    ['Adultos', '3', 'ALI-PER', 'Sí'],
    ['Senior', '3', 'ALI-PER', 'Sí'],
    // Level 2 - Medicamentos
    ['Antibióticos', '2', 'MED', 'Sí'],
    ['Desparasitantes', '2', 'MED', 'Sí'],
    ['Vacunas', '2', 'MED', 'Sí'],
    // Level 2 - Accesorios
    ['Correas y Collares', '2', 'ACC', 'Sí'],
    ['Camas', '2', 'ACC', 'Sí'],
    ['Juguetes', '2', 'ACC', 'Sí'],
    // Level 2 - Higiene
    ['Shampoos', '2', 'HIG', 'Sí'],
    ['Cepillos', '2', 'HIG', 'Sí'],
    // Level 2 - Insumos
    ['Jeringas', '2', 'INS', 'Sí'],
    ['Guantes', '2', 'INS', 'Sí'],
    ['Gasas y Vendas', '2', 'INS', 'Sí'],
  ]);

  // 🏭 Proveedores - Código auto-generado (secuencial POR PREFIJO)
  console.log('  🏭 Proveedores...');

  // Fórmulas: SUMPRODUCT cuenta cuántas veces aparece el mismo prefijo hasta la fila actual
  // Resultado: ROY-001, DIS-001, ROY-002 (secuencial dentro de cada prefijo)
  const providerFormulas: string[][] = [];
  for (let i = 2; i <= 100; i++) {
    // Count how many rows from 2 to i have the same 3-letter prefix
    providerFormulas.push([`=IF(B${i}<>"",UPPER(LEFT(SUBSTITUTE(B${i}," ",""),3))&"-"&TEXT(SUMPRODUCT((UPPER(LEFT(SUBSTITUTE($B$2:B${i}," ",""),3))=UPPER(LEFT(SUBSTITUTE(B${i}," ",""),3)))*1),"000"),"")`]);
  }
  await updateValues(spreadsheetId, "'🏭 Proveedores'!A2:A101", providerFormulas);

  // Data sin la columna A (se genera automáticamente)
  await updateValues(spreadsheetId, "'🏭 Proveedores'!B2:G7", [
    ['Royal Canin Paraguay', 'Productos', '021-555-0001', 'ventas@royalcanin.com.py', 'Entrega lunes y jueves', 'Sí'],
    ['Distribuidora VetMed', 'Ambos', '021-555-0002', 'pedidos@vetmed.com.py', 'Medicamentos y consumibles', 'Sí'],
    ['PetShop Importadora', 'Productos', '021-555-0003', 'importadora@petshop.py', 'Accesorios importados', 'Sí'],
    ['Laboratorio Bayer', 'Productos', '021-555-0004', 'vet@bayer.com.py', 'Solo antiparasitarios', 'Sí'],
    ['MediVet Insumos', 'Insumos', '021-555-0005', 'insumos@medivet.py', 'Material quirúrgico', 'Sí'],
    ['Distribuidora Sur', 'Ambos', '021-555-0006', 'ventas@delsur.py', 'Entrega en 24hs', 'Sí'],
  ]);

  // 🏷️ Marcas - Código auto-generado (secuencial POR PREFIJO)
  console.log('  🏷️ Marcas...');

  // Fórmulas: SUMPRODUCT cuenta cuántas veces aparece el mismo prefijo hasta la fila actual
  // Resultado: RO-001, PR-001, RO-002, TE-001, TE-002 (secuencial dentro de cada prefijo)
  const brandFormulas: string[][] = [];
  for (let i = 2; i <= 100; i++) {
    // Count how many rows from 2 to i have the same 2-letter prefix
    brandFormulas.push([`=IF(B${i}<>"",UPPER(LEFT(SUBSTITUTE(B${i}," ",""),2))&"-"&TEXT(SUMPRODUCT((UPPER(LEFT(SUBSTITUTE($B$2:B${i}," ",""),2))=UPPER(LEFT(SUBSTITUTE(B${i}," ",""),2)))*1),"000"),"")`]);
  }
  await updateValues(spreadsheetId, "'🏷️ Marcas'!A2:A101", brandFormulas);

  // Data sin la columna A (se genera automáticamente)
  await updateValues(spreadsheetId, "'🏷️ Marcas'!B2:D12", [
    ['Royal Canin', 'Francia', 'Sí'],
    ['Pro Plan', 'USA', 'Sí'],
    ['Hills', 'USA', 'Sí'],
    ['Pedigree', 'USA', 'Sí'],
    ['Whiskas', 'USA', 'Sí'],
    ['Bayer', 'Alemania', 'Sí'],
    ['Zoetis', 'USA', 'Sí'],
    ['MSD Animal Health', 'USA', 'Sí'],
    ['3M Veterinario', 'USA', 'Sí'],
    ['FrontPro', 'España', 'Sí'],
    ['Nexgard', 'Francia', 'Sí'],
  ]);

  // 🆕 Productos - SKU auto-generado (secuencial POR PREFIJO)
  console.log('  🆕 Productos...');

  // Fórmulas: SUMPRODUCT cuenta cuántas veces aparece el mismo prefijo hasta la fila actual
  // Resultado: ROY-001, ROY-002, NEX-001, COM-001, COM-002 (secuencial dentro de cada prefijo)
  const productFormulas: string[][] = [];
  for (let i = 2; i <= 100; i++) {
    // Count how many rows from 2 to i have the same 3-letter prefix from name
    productFormulas.push([`=IF(B${i}<>"",UPPER(LEFT(SUBSTITUTE(B${i}," ",""),3))&"-"&TEXT(SUMPRODUCT((UPPER(LEFT(SUBSTITUTE($B$2:B${i}," ",""),3))=UPPER(LEFT(SUBSTITUTE(B${i}," ",""),3)))*1),"000"),"")`]);
  }

  // Aplicar fórmulas a las primeras 100 filas
  await updateValues(spreadsheetId, "'🆕 Productos'!A2:A101", productFormulas);

  // Sample data (sin columna A que se genera automáticamente)
  await updateValues(spreadsheetId, "'🆕 Productos'!B2:O14", [
    ['Royal Canin Adult Medium 15kg', 'ALI-PER-ADU', 'RO-001', 'Bolsa', 180000, 250000, 235000, 39, 5, 12, 'No', 'ROY-001', 'Alimento premium para perros adultos medianos', 'Sí'],
    ['Royal Canin Puppy 10kg', 'ALI-PER-CAC', 'RO-001', 'Bolsa', 150000, 210000, '', 40, 3, 8, 'No', 'ROY-001', 'Alimento para cachorros hasta 12 meses', 'Sí'],
    ['Pro Plan Cat Adult 7.5kg', 'ALI-GAT', 'PR-002', 'Bolsa', 120000, 175000, '', 46, 4, 6, 'No', 'ROY-001', 'Alimento premium para gatos adultos', 'Sí'],
    ['Nexgard Spectra M (7-15kg)', 'MED-DES', 'NE-011', 'Caja', 45000, 75000, '', 67, 10, 25, 'Sí', 'DIS-002', 'Antiparasitario oral mensual', 'Sí'],
    ['Amoxicilina 500mg x 10', 'MED-ANT', 'BA-006', 'Caja', 15000, 28000, '', 87, 8, 20, 'Sí', 'DIS-002', 'Antibiótico de amplio espectro', 'Sí'],
    ['Vacuna Óctuple', 'MED-VAC', 'ZO-007', 'Unidad', 35000, 60000, '', 71, 20, 45, 'Sí', 'DIS-002', 'Vacuna polivalente canina', 'Sí'],
    ['Collar Antipulgas Seresto L', 'ACC-COR', 'BA-006', 'Unidad', 95000, 150000, 140000, 58, 5, 10, 'No', 'LAB-004', 'Collar 8 meses protección', 'Sí'],
    ['Cama Premium Grande', 'ACC-CAM', 'FR-010', 'Unidad', 80000, 130000, '', 63, 2, 4, 'No', 'PET-003', 'Cama ortopédica lavable', 'Sí'],
    ['Shampoo Dermocalmante 500ml', 'HIG-SHA', '3M-009', 'Frasco', 25000, 45000, '', 80, 6, 15, 'No', 'PET-003', 'Para pieles sensibles', 'Sí'],
    ['Jeringa 5ml c/aguja x100', 'INS-JER', '3M-009', 'Caja', 35000, 55000, '', 57, 5, 8, 'No', 'MED-005', 'Jeringas descartables estériles', 'Sí'],
    ['Guantes Látex M x100', 'INS-GUA', '3M-009', 'Caja', 18000, 30000, '', 67, 10, 15, 'No', 'MED-005', 'Guantes de examen', 'Sí'],
    ['Royal Canin Senior 12kg', 'ALI-PER-ADU', 'RO-001', 'Bolsa', 185000, 260000, '', 41, 3, 5, 'No', 'ROY-001', 'Alimento para perros senior +7 años', 'Sí'],
    ['Frontline Plus Perro M', 'MED-DES', 'FR-010', 'Caja', 38000, 65000, '', 71, 8, 18, 'No', 'DIS-002', 'Pipeta antiparasitaria externa', 'Sí'],
  ]);

  // 📦 Stock Inicial (sin SKU - Producto seleccionable desde dropdown)
  console.log('  📦 Stock Inicial...');
  await updateValues(spreadsheetId, "'📦 Stock Inicial'!A2:G10", [
    ['Royal Canin Adult Medium 15kg', 'Compra', 20, 180000, '15/12/2024', 'Depósito Principal', 'Factura #1234'],
    ['Royal Canin Puppy 10kg', 'Compra', 15, 150000, '15/12/2024', 'Depósito Principal', 'Factura #1234'],
    ['Nexgard Spectra M (7-15kg)', 'Compra', 50, 45000, '10/12/2024', 'Farmacia', 'Lote VET2024-12'],
    ['Amoxicilina 500mg x 10', 'Compra', 30, 15000, '10/12/2024', 'Farmacia', 'Lote MED2024-456'],
    ['Royal Canin Adult Medium 15kg', 'Venta', 8, '', '18/12/2024', '', 'Ventas semana'],
    ['Nexgard Spectra M (7-15kg)', 'Venta', 25, '', '18/12/2024', '', 'Ventas semana'],
    ['Jeringa 5ml c/aguja x100', 'Ajuste', -2, '', '17/12/2024', 'Consultorio', 'Inventario físico'],
    ['Vacuna Óctuple', 'Vencido', 5, '', '16/12/2024', 'Farmacia', 'Lote caducado'],
    ['Collar Antipulgas Seresto L', 'Daño', 1, '', '14/12/2024', 'Exhibición', 'Empaque roto'],
  ]);

  // ⚙️ Configuración - Solo Ubicaciones
  console.log('  ⚙️ Configuración...');
  await updateValues(spreadsheetId, "'⚙️ Configuración'!A2:D6", [
    ['DEP-MAIN', 'Depósito Principal', 'Almacén general de inventario', 'Sí'],
    ['DEP-FARM', 'Farmacia', 'Medicamentos y productos refrigerados', 'Sí'],
    ['DEP-CONS', 'Consultorio', 'Stock de uso diario en consultas', 'Sí'],
    ['DEP-EXHI', 'Exhibición', 'Productos en tienda para venta', 'Sí'],
    ['DEP-ARCH', 'Archivo', 'Ubicación para items dados de baja', 'No'],
  ]);

  // 🔧 Datos - Hoja auxiliar con FILTER para items activos
  // Esta hoja se usa para los dropdowns (solo muestra items con Activo = "Sí")
  console.log('  🔧 Datos (listas activas)...');
  await updateValues(spreadsheetId, "'🔧 Datos'!A2:E2", [
    [
      // Categorías activas (columna A de Categorías donde E = "Sí")
      '=FILTER(\'📂 Categorías\'!A:A, \'📂 Categorías\'!E:E="Sí")',
      // Marcas activas (columna A de Marcas donde D = "Sí")
      '=FILTER(\'🏷️ Marcas\'!A:A, \'🏷️ Marcas\'!D:D="Sí")',
      // Proveedores activos (columna A de Proveedores donde G = "Sí")
      '=FILTER(\'🏭 Proveedores\'!A:A, \'🏭 Proveedores\'!G:G="Sí")',
      // Productos activos - Nombre (columna B de Productos donde O = "Sí")
      '=FILTER(\'🆕 Productos\'!B:B, \'🆕 Productos\'!O:O="Sí")',
      // Ubicaciones activas (columna B de Configuración donde D = "Sí")
      '=FILTER(\'⚙️ Configuración\'!B:B, \'⚙️ Configuración\'!D:D="Sí")',
    ],
  ]);

  // ⚡ Carga Rápida (sin SKU - se genera en Supabase al importar)
  console.log('  ⚡ Carga Rápida...');

  // Columns: Nombre, Categoría, Unidad, PrecioCosto, PrecioVenta, Stock, Marca, Proveedor, Notas
  await updateValues(spreadsheetId, "'⚡ Carga Rápida'!A2:I5", [
    ['Producto de prueba 1', 'ALI-PER-ADU', 'Bolsa', 100000, 150000, 10, 'RO-001', 'ROY-001', ''],
    ['Producto de prueba 2', 'MED-ANT', 'Caja', 50000, 85000, 20, 'BA-006', 'DIS-002', 'Requiere receta'],
    ['Producto de prueba 3', 'ALI-PER-ADU', 'Bolsa', 120000, 180000, 5, 'PR-002', 'ROY-001', ''],
    ['', '', '', '', '', '', '', '', ''],
  ]);

  console.log('\n  ✅ Sample data added\n');
}
