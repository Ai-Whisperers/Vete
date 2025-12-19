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
  // ÁRBOL DE CATEGORÍAS COMPLETO PARA VETERINARIA
  await updateValues(spreadsheetId, "'📂 Categorías'!B2:E55", [
    // ═══════════════════════════════════════════════════════════
    // NIVEL 1: CATEGORÍAS PRINCIPALES
    // ═══════════════════════════════════════════════════════════
    ['Alimentos', '1', '', 'Sí'],           // ALI
    ['Medicamentos', '1', '', 'Sí'],        // MED
    ['Antiparasitarios', '1', '', 'Sí'],    // ANT
    ['Vacunas', '1', '', 'Sí'],             // VAC
    ['Insumos Clínicos', '1', '', 'Sí'],    // INS
    ['Accesorios', '1', '', 'Sí'],          // ACC
    ['Higiene', '1', '', 'Sí'],             // HIG

    // ═══════════════════════════════════════════════════════════
    // NIVEL 2: ALIMENTOS (ALI)
    // ═══════════════════════════════════════════════════════════
    ['Perros', '2', 'ALI', 'Sí'],           // ALI-PER
    ['Gatos', '2', 'ALI', 'Sí'],            // ALI-GAT
    ['Terapéuticos', '2', 'ALI', 'Sí'],     // ALI-TER (dietas prescripción)

    // NIVEL 3: Alimentos Perros (ALI-PER)
    ['Cachorros', '3', 'ALI-PER', 'Sí'],    // ALI-PER-CAC
    ['Adultos', '3', 'ALI-PER', 'Sí'],      // ALI-PER-ADU
    ['Senior', '3', 'ALI-PER', 'Sí'],       // ALI-PER-SEN
    ['Razas Pequeñas', '3', 'ALI-PER', 'Sí'],// ALI-PER-RAZ
    ['Razas Grandes', '3', 'ALI-PER', 'Sí'],// ALI-PER-RAZ (segundo match)

    // NIVEL 3: Alimentos Gatos (ALI-GAT)
    ['Kitten', '3', 'ALI-GAT', 'Sí'],       // ALI-GAT-KIT
    ['Adult', '3', 'ALI-GAT', 'Sí'],        // ALI-GAT-ADU
    ['Esterilizados', '3', 'ALI-GAT', 'Sí'],// ALI-GAT-EST

    // ═══════════════════════════════════════════════════════════
    // NIVEL 2: MEDICAMENTOS (MED)
    // ═══════════════════════════════════════════════════════════
    ['Antibióticos', '2', 'MED', 'Sí'],         // MED-ANT
    ['Antiinflamatorios', '2', 'MED', 'Sí'],    // MED-ANT (AINES)
    ['Corticoides', '2', 'MED', 'Sí'],          // MED-COR
    ['Analgésicos', '2', 'MED', 'Sí'],          // MED-ANA
    ['Dermatológicos', '2', 'MED', 'Sí'],       // MED-DER
    ['Oftálmicos', '2', 'MED', 'Sí'],           // MED-OFT
    ['Gastrointestinales', '2', 'MED', 'Sí'],   // MED-GAS
    ['Cardiovasculares', '2', 'MED', 'Sí'],     // MED-CAR
    ['Sueros', '2', 'MED', 'Sí'],               // MED-SUE

    // ═══════════════════════════════════════════════════════════
    // NIVEL 2: ANTIPARASITARIOS (ANT)
    // ═══════════════════════════════════════════════════════════
    ['Externos', '2', 'ANT', 'Sí'],         // ANT-EXT (pulgas, garrapatas)
    ['Internos', '2', 'ANT', 'Sí'],         // ANT-INT (gusanos)
    ['Combinados', '2', 'ANT', 'Sí'],       // ANT-COM (amplio espectro)

    // ═══════════════════════════════════════════════════════════
    // NIVEL 2: VACUNAS (VAC)
    // ═══════════════════════════════════════════════════════════
    ['Caninas', '2', 'VAC', 'Sí'],          // VAC-CAN
    ['Felinas', '2', 'VAC', 'Sí'],          // VAC-FEL
    ['Antirrábicas', '2', 'VAC', 'Sí'],     // VAC-ANT

    // ═══════════════════════════════════════════════════════════
    // NIVEL 2: INSUMOS CLÍNICOS (INS)
    // ═══════════════════════════════════════════════════════════
    ['Jeringas', '2', 'INS', 'Sí'],         // INS-JER
    ['Guantes', '2', 'INS', 'Sí'],          // INS-GUA
    ['Gasas y Vendas', '2', 'INS', 'Sí'],   // INS-GAS
    ['Catéteres', '2', 'INS', 'Sí'],        // INS-CAT
    ['Suturas', '2', 'INS', 'Sí'],          // INS-SUT
    ['Descartables', '2', 'INS', 'Sí'],     // INS-DES

    // ═══════════════════════════════════════════════════════════
    // NIVEL 2: ACCESORIOS (ACC)
    // ═══════════════════════════════════════════════════════════
    ['Collares y Correas', '2', 'ACC', 'Sí'],// ACC-COL
    ['Camas', '2', 'ACC', 'Sí'],             // ACC-CAM
    ['Juguetes', '2', 'ACC', 'Sí'],          // ACC-JUG
    ['Transportadoras', '2', 'ACC', 'Sí'],   // ACC-TRA
    ['Comederos', '2', 'ACC', 'Sí'],         // ACC-COM

    // ═══════════════════════════════════════════════════════════
    // NIVEL 2: HIGIENE (HIG)
    // ═══════════════════════════════════════════════════════════
    ['Shampoos', '2', 'HIG', 'Sí'],          // HIG-SHA
    ['Cepillos', '2', 'HIG', 'Sí'],          // HIG-CEP
    ['Limpieza Oídos', '2', 'HIG', 'Sí'],    // HIG-LIM
    ['Dental', '2', 'HIG', 'Sí'],            // HIG-DEN
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
  // PROVEEDORES REALES DE PARAGUAY
  await updateValues(spreadsheetId, "'🏭 Proveedores'!B2:G15", [
    // Distribuidores de Alimentos
    ['Caldetec S.A.', 'Productos', '021-615-2000', 'ventas@caldetec.com.py', 'Dist. oficial Royal Canin, Pro Plan. Entrega L-M-V', 'Sí'],
    ['Cedivep S.R.L.', 'Ambos', '021-290-4000', 'pedidos@cedivep.com.py', 'Dist. Boehringer (Nexgard, Frontline). Crédito 30 días', 'Sí'],
    ['Consult-Pec S.A.', 'Ambos', '021-550-7700', 'ventas@consultpec.com.py', 'Dist. Zoetis (Simparica, vacunas). Min. compra 500k', 'Sí'],
    ['Invet Paraguay', 'Insumos', '021-225-9000', 'insumos@invet.com.py', 'Insumos quirúrgicos, 3M, material descartable', 'Sí'],
    ['Droguería Alemana', 'Ambos', '021-497-5000', 'farmacia@droale.com.py', 'Farmacia veterinaria, antibióticos, corticoides', 'Sí'],
    ['Pet Food Paraguay', 'Productos', '021-660-8800', 'mayorista@petfood.com.py', 'Hills, Pedigree, Whiskas. Delivery gratis +1M', 'Sí'],
    ['Agrovet Central', 'Ambos', '021-510-3300', 'central@agrovet.com.py', 'Productos rurales y urbanos. Interior país', 'Sí'],
    ['Bio-Vet S.A.', 'Productos', '021-295-6600', 'bio@biovet.com.py', 'Biológicos, vacunas importadas', 'Sí'],
    ['Medic Vet Importadora', 'Insumos', '021-445-2200', 'import@medicvet.com.py', 'Equipos, monitores, anestesia', 'Sí'],
    ['Distribuidora San Lorenzo', 'Productos', '021-585-1100', 'sanlorenzo@dist.com.py', 'Accesorios, higiene, camas. Zona Central', 'Sí'],
    ['Farmavet Asunción', 'Ambos', '021-233-4400', 'compras@farmavet.com.py', 'Farmacia 24hs. Urgencias veterinarias', 'Sí'],
    ['ProVet Distribuciones', 'Productos', '021-677-9900', 'provet@distribuciones.com.py', 'Mars (Pedigree), Nestlé (Purina)', 'Sí'],
    ['Laboratorios Bagó Py', 'Ambos', '021-205-7000', 'vetpy@bago.com.py', 'Genéricos veterinarios, precios competitivos', 'Sí'],
    ['MSD Animal Health Py', 'Ambos', '021-612-8000', 'msd@animalhealth.com.py', 'Bravecto, Nobivac. Soporte técnico incluido', 'Sí'],
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
  // MARCAS/FABRICANTES REALES DEL MERCADO VETERINARIO
  await updateValues(spreadsheetId, "'🏷️ Marcas'!B2:D30", [
    // === ALIMENTOS PREMIUM ===
    ['Royal Canin', 'Francia', 'Sí'],       // Mars Petcare - Premium
    ['Pro Plan', 'USA', 'Sí'],              // Nestlé Purina - Premium
    ['Hills Science Diet', 'USA', 'Sí'],    // Colgate-Palmolive - Prescripción
    ['Eukanuba', 'USA', 'Sí'],              // Mars Petcare - Premium
    ['Acana', 'Canadá', 'Sí'],              // Champion Petfoods - Super Premium
    ['Orijen', 'Canadá', 'Sí'],             // Champion Petfoods - Ultra Premium
    // === ALIMENTOS ECONÓMICOS ===
    ['Pedigree', 'USA', 'Sí'],              // Mars Petcare - Económico
    ['Whiskas', 'USA', 'Sí'],               // Mars Petcare - Gatos
    ['Dog Chow', 'USA', 'Sí'],              // Nestlé Purina - Económico
    ['Cat Chow', 'USA', 'Sí'],              // Nestlé Purina - Gatos Económico
    // === ANTIPARASITARIOS ===
    ['Boehringer Ingelheim', 'Alemania', 'Sí'], // Nexgard, Frontline, NexGard Spectra
    ['Zoetis', 'USA', 'Sí'],                    // Simparica, Revolution, Convenia
    ['MSD Animal Health', 'USA', 'Sí'],         // Bravecto, Nobivac, Scalibor
    ['Elanco', 'USA', 'Sí'],                    // Credelio, Seresto, Advocate
    ['Virbac', 'Francia', 'Sí'],               // Effipro, Preventic, Milpro
    // === FARMACIA VETERINARIA ===
    ['Bayer Animal Health', 'Alemania', 'Sí'], // Drontal, Baytril, Advantage
    ['Dechra', 'Reino Unido', 'Sí'],           // Vetoryl, Felimazole, Atopica
    ['Ceva', 'Francia', 'Sí'],                 // Adaptil, Feliway, Vectra
    ['Laboratorios Bagó', 'Argentina', 'Sí'],  // Genéricos veterinarios
    ['Holliday-Scott', 'Argentina', 'Sí'],     // Otomax, genéricos
    // === INSUMOS MÉDICOS ===
    ['3M Health Care', 'USA', 'Sí'],           // Esparadrapos, material quirúrgico
    ['BD (Becton Dickinson)', 'USA', 'Sí'],    // Jeringas, agujas, catéteres
    ['Braun Veterinario', 'Alemania', 'Sí'],   // Sueros, soluciones IV
    ['Kruuse', 'Dinamarca', 'Sí'],             // Instrumental, ortopedia
    // === HIGIENE Y ACCESORIOS ===
    ['Trixie', 'Alemania', 'Sí'],              // Accesorios, juguetes
    ['Kong', 'USA', 'Sí'],                     // Juguetes resistentes
    ['Furminator', 'USA', 'Sí'],               // Cepillos, deslanadores
  ]);

  // ═══════════════════════════════════════════════════════════════════════════
  // 🆕 Productos (CATÁLOGO MASTER - Productos del mercado)
  // Este es el catálogo de referencia con precios del proveedor
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('  🆕 Productos (Catálogo Master)...');

  // Fórmulas para SKU auto-generado (columna A)
  const productFormulas: string[][] = [];
  for (let i = 2; i <= 500; i++) {
    productFormulas.push([`=IF(B${i}<>"",UPPER(LEFT(SUBSTITUTE(B${i}," ",""),3))&"-"&TEXT(SUMPRODUCT((UPPER(LEFT(SUBSTITUTE($B$2:B${i}," ",""),3))=UPPER(LEFT(SUBSTITUTE(B${i}," ",""),3)))*1),"000"),"")`]);
  }
  await updateValues(spreadsheetId, "'🆕 Productos'!A2:A501", productFormulas);

  // Fórmulas para Costo Unitario (columna I) = Precio Compra / Cant. Contenida
  const costFormulas: string[][] = [];
  for (let i = 2; i <= 500; i++) {
    costFormulas.push([`=IF(AND(H${i}<>"",F${i}<>"",F${i}>0),ROUND(H${i}/F${i},0),"")`]);
  }
  await updateValues(spreadsheetId, "'🆕 Productos'!I2:I501", costFormulas);

  // Datos del catálogo master (sin precio venta - eso va en Mis Productos)
  // Cols: Nombre(B), Categoría(C), Marca(D), Unid.Compra(E), Cant.Contenida(F), Unid.Venta(G),
  //       PrecioCompra(H), [CostoUnit=fórmula I], Proveedor(J), Descripción(K), Activo(L)
  await updateValues(spreadsheetId, "'🆕 Productos'!B2:L14", [
    // Alimentos (se compra y vende por bolsa)
    ['Royal Canin Adult Medium 15kg', 'ALI-PER-ADU', 'RO-001', 'Bolsa', 1, 'Bolsa', 580000, '', 'CAL-001', 'Alimento premium perros adultos razas medianas', 'Sí'],
    ['Royal Canin Puppy 10kg', 'ALI-PER-CAC', 'RO-001', 'Bolsa', 1, 'Bolsa', 485000, '', 'CAL-001', 'Alimento cachorros hasta 12 meses', 'Sí'],
    ['Pro Plan Cat Adult 7.5kg', 'ALI-GAT-ADU', 'PR-001', 'Bolsa', 1, 'Bolsa', 420000, '', 'CAL-001', 'Alimento premium gatos adultos', 'Sí'],
    // Antiparasitarios (se compra caja, se vende por tableta)
    ['Nexgard Spectra M 7-15kg', 'ANT-COM', 'BO-001', 'Caja', 3, 'Tableta', 195000, '', 'CED-001', 'Antiparasitario oral mensual perros', 'Sí'],
    ['Nexgard Spectra L 15-30kg', 'ANT-COM', 'BO-001', 'Caja', 3, 'Tableta', 225000, '', 'CED-001', 'Antiparasitario oral perros grandes', 'Sí'],
    ['Simparica Trio M 5-10kg', 'ANT-COM', 'ZO-001', 'Caja', 3, 'Tableta', 210000, '', 'CON-001', 'Triple acción pulgas garrapatas gusanos', 'Sí'],
    // Farmacia (se compra caja, se vende por unidad)
    ['Amoxicilina 500mg', 'MED-ANT', 'LA-001', 'Caja', 10, 'Tableta', 45000, '', 'DRO-001', 'Antibiótico amplio espectro', 'Sí'],
    ['Enrofloxacina 50mg', 'MED-ANT', 'BA-001', 'Caja', 10, 'Tableta', 38000, '', 'DRO-001', 'Fluoroquinolona infecciones', 'Sí'],
    ['Dexametasona 4mg/ml 10ml', 'MED-COR', 'LA-001', 'Caja', 5, 'Ampolla', 65000, '', 'DRO-001', 'Corticoide inyectable', 'Sí'],
    // Vacunas (se compra caja, se vende por dosis)
    ['Vacuna Óctuple Canina', 'VAC-CAN', 'ZO-001', 'Caja', 10, 'Dosis', 320000, '', 'CON-001', 'Vacuna polivalente canina', 'Sí'],
    ['Vacuna Triple Felina', 'VAC-FEL', 'ZO-001', 'Caja', 10, 'Dosis', 280000, '', 'CON-001', 'Vacuna polivalente felina', 'Sí'],
    // Insumos (se compra caja, se vende por unidad)
    ['Jeringa 5ml c/aguja', 'INS-JER', '3M-001', 'Caja', 100, 'Unidad', 85000, '', 'INV-001', 'Jeringas descartables estériles', 'Sí'],
    ['Guantes Látex M', 'INS-GUA', '3M-001', 'Caja', 100, 'Unidad', 55000, '', 'INV-001', 'Guantes de examen talla mediana', 'Sí'],
  ]);

  // ═══════════════════════════════════════════════════════════════════════════
  // 📋 Mis Productos (PRODUCTOS DE LA CLÍNICA)
  // Cada clínica define qué productos tiene, a qué precio los vende y su stock
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('  📋 Mis Productos...');

  // Fórmula para Margen % (columna C)
  // Busca el costo unitario del producto en el catálogo y calcula el margen
  const marginFormulas: string[][] = [];
  for (let i = 2; i <= 500; i++) {
    // VLOOKUP busca el producto en la columna B de Productos y trae la columna I (Costo Unit)
    marginFormulas.push([`=IF(AND(A${i}<>"",B${i}<>""),IFERROR(ROUND((B${i}-VLOOKUP(A${i},'🆕 Productos'!$B:$I,8,FALSE))/VLOOKUP(A${i},'🆕 Productos'!$B:$I,8,FALSE)*100,1)&"%","N/A"),"")`]);
  }
  await updateValues(spreadsheetId, "'📋 Mis Productos'!C2:C501", marginFormulas);

  // Datos de ejemplo: productos que la clínica tiene en stock
  // Cols: Producto(A), PrecioVenta(B), [Margen%=fórmula C], StockMín(D), StockInicial(E), Ubicación(F), Receta(G), Activo(H)
  await updateValues(spreadsheetId, "'📋 Mis Productos'!A2:B14", [
    ['Royal Canin Adult Medium 15kg', 750000],
    ['Royal Canin Puppy 10kg', 620000],
    ['Pro Plan Cat Adult 7.5kg', 550000],
    ['Nexgard Spectra M 7-15kg', 85000],
    ['Nexgard Spectra L 15-30kg', 95000],
    ['Simparica Trio M 5-10kg', 90000],
    ['Amoxicilina 500mg', 8000],
    ['Enrofloxacina 50mg', 6500],
    ['Dexametasona 4mg/ml 10ml', 18000],
    ['Vacuna Óctuple Canina', 48000],
    ['Vacuna Triple Felina', 42000],
    ['Jeringa 5ml c/aguja', 1500],
    ['Guantes Látex M', 1000],
  ]);

  await updateValues(spreadsheetId, "'📋 Mis Productos'!D2:H14", [
    [5, 20, 'Depósito Principal', 'No', 'Sí'],
    [3, 15, 'Depósito Principal', 'No', 'Sí'],
    [4, 12, 'Depósito Principal', 'No', 'Sí'],
    [10, 30, 'Farmacia', 'Sí', 'Sí'],
    [10, 25, 'Farmacia', 'Sí', 'Sí'],
    [10, 20, 'Farmacia', 'Sí', 'Sí'],
    [20, 50, 'Farmacia', 'Sí', 'Sí'],
    [20, 40, 'Farmacia', 'Sí', 'Sí'],
    [15, 25, 'Farmacia', 'Sí', 'Sí'],
    [20, 50, 'Farmacia', 'Sí', 'Sí'],
    [15, 30, 'Farmacia', 'Sí', 'Sí'],
    [5, 200, 'Consultorio', 'No', 'Sí'],
    [10, 300, 'Consultorio', 'No', 'Sí'],
  ]);

  // ═══════════════════════════════════════════════════════════════════════════
  // 📦 Movimientos Stock (Compras, Ventas, Ajustes)
  // Historial de movimientos de inventario
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('  📦 Movimientos Stock...');
  await updateValues(spreadsheetId, "'📦 Movimientos Stock'!A2:G10", [
    ['Royal Canin Adult Medium 15kg', 'Compra', 20, 580000, '15/12/2024', 'Depósito Principal', 'Factura #1234 Caldetec'],
    ['Royal Canin Puppy 10kg', 'Compra', 15, 485000, '15/12/2024', 'Depósito Principal', 'Factura #1234 Caldetec'],
    ['Nexgard Spectra M 7-15kg', 'Compra', 10, 65000, '10/12/2024', 'Farmacia', 'Lote VET2024-12 Cedivep'],
    ['Amoxicilina 500mg', 'Compra', 5, 4500, '10/12/2024', 'Farmacia', 'Lote MED2024-456'],
    ['Royal Canin Adult Medium 15kg', 'Venta', 8, '', '18/12/2024', '', 'Ventas semana'],
    ['Nexgard Spectra M 7-15kg', 'Venta', 15, '', '18/12/2024', '', 'Ventas semana'],
    ['Jeringa 5ml c/aguja', 'Ajuste', -20, '', '17/12/2024', 'Consultorio', 'Inventario físico'],
    ['Vacuna Óctuple Canina', 'Vencido', 5, '', '16/12/2024', 'Farmacia', 'Lote caducado'],
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

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔧 Datos - Hoja auxiliar con FILTER para dropdowns
  // Esta hoja alimenta los dropdowns de las otras hojas (solo items activos)
  // Columnas: Categorías, Marcas, Proveedores, Productos Catálogo, Mis Productos, Ubicaciones
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('  🔧 Datos (listas para dropdowns)...');
  await updateValues(spreadsheetId, "'🔧 Datos'!A2:F2", [
    [
      // A: Categorías activas (código de Categorías donde Activo = "Sí")
      '=FILTER(\'📂 Categorías\'!A:A, \'📂 Categorías\'!E:E="Sí")',
      // B: Marcas activas (código de Marcas donde Activo = "Sí")
      '=FILTER(\'🏷️ Marcas\'!A:A, \'🏷️ Marcas\'!D:D="Sí")',
      // C: Proveedores activos (código de Proveedores donde Activo = "Sí")
      '=FILTER(\'🏭 Proveedores\'!A:A, \'🏭 Proveedores\'!G:G="Sí")',
      // D: Productos del Catálogo activos (nombre de Productos donde Activo = "Sí")
      '=FILTER(\'🆕 Productos\'!B:B, \'🆕 Productos\'!L:L="Sí")',
      // E: Mis Productos activos (nombre de Mis Productos donde Activo = "Sí")
      '=FILTER(\'📋 Mis Productos\'!A:A, \'📋 Mis Productos\'!H:H="Sí")',
      // F: Ubicaciones activas (nombre de Configuración donde Activo = "Sí")
      '=FILTER(\'⚙️ Configuración\'!B:B, \'⚙️ Configuración\'!D:D="Sí")',
    ],
  ]);

  console.log('\n  ✅ Sample data added\n');
}
