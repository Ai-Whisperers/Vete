/**
 * Generates the comprehensive inventory template Excel file for Google Sheets upload
 *
 * This template allows clinics to configure:
 * - Category hierarchies (Category → Sub-category → Sub-sub-category)
 * - Suppliers with full contact details
 * - Units of measure
 * - Tax configurations
 * - Brands
 * - Storage locations
 * - Complete product details with all attributes
 * - Stock movements and pricing
 *
 * Run with: npx tsx scripts/generate-inventory-template.ts
 * Output: inventory_template_vete.xlsx (in current directory)
 */

import * as XLSX from 'xlsx';
import * as path from 'path';

// Style constants for consistent formatting
const TITLE_SEPARATOR = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
const SECTION_SEPARATOR = '────────────────────────────────────────────────────────────────────────────────────────────────────────';

function generateTemplate(): void {
    const workbook = XLSX.utils.book_new();

    // ========================================================================
    // SHEET 1: 📖 Instrucciones
    // ========================================================================
    const instructionsData = [
        [''],
        [TITLE_SEPARATOR],
        ['📋  PLANTILLA COMPLETA DE GESTIÓN DE INVENTARIO - SISTEMA VETERINARIO VETE'],
        [TITLE_SEPARATOR],
        [''],
        ['🎯 PROPÓSITO DE ESTA PLANTILLA'],
        ['Esta plantilla profesional permite configurar TODO tu inventario de forma masiva:'],
        [''],
        ['   ✅ Configurar categorías con múltiples niveles de jerarquía'],
        ['   ✅ Registrar todos tus proveedores con información completa'],
        ['   ✅ Definir unidades de medida personalizadas'],
        ['   ✅ Configurar impuestos aplicables'],
        ['   ✅ Catalogar marcas de productos'],
        ['   ✅ Establecer ubicaciones de almacenamiento'],
        ['   ✅ Agregar productos con TODOS los atributos posibles'],
        ['   ✅ Registrar movimientos de stock (compras, ajustes, etc.)'],
        ['   ✅ Configurar precios por volumen'],
        [''],
        [SECTION_SEPARATOR],
        ['📑 HOJAS DISPONIBLES EN ESTA PLANTILLA'],
        [SECTION_SEPARATOR],
        [''],
        ['   HOJA                      DESCRIPCIÓN                                              PRIORIDAD'],
        ['   ──────────────────────────────────────────────────────────────────────────────────────────────'],
        ['   🏢 Configuración          Datos generales de la clínica                            ⭐ Alta'],
        ['   📂 Categorías             Jerarquía completa de categorías                         ⭐ Alta'],
        ['   🏭 Proveedores            Directorio de proveedores                                ⭐ Alta'],
        ['   📏 Unidades               Unidades de medida (kg, ml, unidad, etc.)                Media'],
        ['   💰 Impuestos              Configuración de tasas impositivas                       Media'],
        ['   🏷️ Marcas                 Catálogo de marcas comerciales                           Media'],
        ['   📍 Ubicaciones            Zonas de almacenamiento en la clínica                    Baja'],
        ['   🆕 Productos              Catálogo completo de productos                           ⭐ Alta'],
        ['   📦 Movimientos            Registro de entradas/salidas de stock                    ⭐ Alta'],
        ['   💲 Precios por Cantidad   Descuentos por volumen                                   Opcional'],
        ['   📚 Ejemplos               Ejemplos detallados de cada operación                    Referencia'],
        ['   ⚡ Importación Rápida     Formato simplificado para carga básica                   Opcional'],
        [''],
        [SECTION_SEPARATOR],
        ['🔄 ORDEN RECOMENDADO PARA COMPLETAR'],
        [SECTION_SEPARATOR],
        [''],
        ['   1️⃣  Configuración    → Define nombre, moneda y ajustes básicos'],
        ['   2️⃣  Categorías       → Crea la estructura de categorías (puedes tener hasta 3 niveles)'],
        ['   3️⃣  Proveedores      → Registra tus proveedores principales'],
        ['   4️⃣  Marcas           → Lista las marcas que manejas'],
        ['   5️⃣  Unidades         → Verifica/agrega unidades de medida necesarias'],
        ['   6️⃣  Ubicaciones      → Define dónde guardas los productos (opcional)'],
        ['   7️⃣  Productos        → Carga tu catálogo completo'],
        ['   8️⃣  Movimientos      → Registra el stock inicial como "Purchase"'],
        [''],
        [SECTION_SEPARATOR],
        ['📊 TIPOS DE OPERACIONES DE INVENTARIO'],
        [SECTION_SEPARATOR],
        [''],
        ['   OPERACIÓN          DESCRIPCIÓN                              CANTIDAD    COSTO      EFECTO'],
        ['   ─────────────────────────────────────────────────────────────────────────────────────────────'],
        ['   New Product        Crear producto nuevo en catálogo         Inicial     ⭐ Req.    Stock inicial'],
        ['   Purchase           Compra a proveedor                       + Positiva  ⭐ Req.    Aumenta stock'],
        ['   Sale               Venta a cliente                          - Negativa  Opcional   Reduce stock'],
        ['   Adjustment         Ajuste manual de inventario              +/-         Opcional   Corrección'],
        ['   Damage             Productos dañados (baja)                 - Negativa  N/A        Reduce stock'],
        ['   Theft              Pérdida por robo                         - Negativa  N/A        Reduce stock'],
        ['   Expired            Productos vencidos (baja)                - Negativa  N/A        Reduce stock'],
        ['   Return             Devolución de cliente                    + Positiva  Opcional   Aumenta stock'],
        ['   Transfer           Traslado entre ubicaciones               +/-         N/A        Mueve stock'],
        ['   Price Update       Actualización de precio (sin stock)      0           N/A        Cambia precio'],
        [''],
        [SECTION_SEPARATOR],
        ['💲 COSTO PROMEDIO PONDERADO (WAC - Weighted Average Cost)'],
        [SECTION_SEPARATOR],
        [''],
        ['   El sistema calcula automáticamente el costo promedio ponderado'],
        ['   cada vez que registras una COMPRA (Purchase).'],
        [''],
        ['   Fórmula:'],
        ['   ┌──────────────────────────────────────────────────────────────────────┐'],
        ['   │  WAC = (Stock Actual × Costo Actual) + (Cantidad Nueva × Costo Nuevo)│'],
        ['   │        ─────────────────────────────────────────────────────────────  │'],
        ['   │                    (Stock Actual + Cantidad Nueva)                    │'],
        ['   └──────────────────────────────────────────────────────────────────────┘'],
        [''],
        ['   Ejemplo Práctico:'],
        ['   • Stock actual: 10 unidades a Gs. 50,000 c/u = Gs. 500,000 total'],
        ['   • Nueva compra: 5 unidades a Gs. 60,000 c/u = Gs. 300,000 total'],
        ['   • Stock total: 15 unidades'],
        ['   • Nuevo WAC: (500,000 + 300,000) / 15 = Gs. 53,333 por unidad'],
        [''],
        [SECTION_SEPARATOR],
        ['⚠️ NOTAS IMPORTANTES'],
        [SECTION_SEPARATOR],
        [''],
        ['   • Los campos marcados con ⭐ son OBLIGATORIOS'],
        ['   • Los campos con ▼ tienen lista desplegable de opciones válidas'],
        ['   • Las fechas deben estar en formato YYYY-MM-DD (ej: 2025-06-15)'],
        ['   • Los precios y costos son NÚMEROS sin separadores de miles'],
        ['   • El SKU se genera automáticamente para productos nuevos'],
        ['   • Activo: SI/NO determina si el producto aparece en la tienda online'],
        ['   • Usa "ID_Padre" en categorías para crear jerarquías'],
        [''],
        [SECTION_SEPARATOR],
        ['🆘 SOPORTE'],
        [SECTION_SEPARATOR],
        [''],
        ['   Si tienes dudas sobre cómo completar esta plantilla:'],
        ['   • Revisa la hoja "📚 Ejemplos" con casos prácticos'],
        ['   • Contacta al soporte técnico de tu clínica'],
        ['   • Consulta la documentación en el portal de administración'],
        [''],
        [TITLE_SEPARATOR],
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
    wsInstructions['!cols'] = [{ wch: 120 }];

    // ========================================================================
    // SHEET 2: 🏢 Configuración de la Clínica
    // ========================================================================
    const configData = [
        [''],
        [TITLE_SEPARATOR],
        ['🏢 CONFIGURACIÓN GENERAL DE LA CLÍNICA'],
        [TITLE_SEPARATOR],
        ['Complete estos datos básicos de configuración. Estos valores se usarán en todo el sistema.'],
        [''],
        ['CONFIGURACIÓN', 'VALOR', 'DESCRIPCIÓN', 'EJEMPLO'],
        [''],
        ['Nombre de la Clínica', '', 'Nombre comercial de tu clínica', 'Veterinaria Adris'],
        ['Moneda Principal', 'PYG', 'Código ISO de moneda (PYG, USD, etc.)', 'PYG'],
        ['Símbolo de Moneda', 'Gs', 'Símbolo que aparece en precios', 'Gs'],
        ['IVA por Defecto (%)', '10', 'Porcentaje de IVA estándar', '10'],
        ['Zona Horaria', 'America/Asuncion', 'Zona horaria para fechas', 'America/Asuncion'],
        [''],
        [SECTION_SEPARATOR],
        ['⚙️ OPCIONES DE INVENTARIO'],
        [SECTION_SEPARATOR],
        [''],
        ['CONFIGURACIÓN', 'VALOR ▼', 'DESCRIPCIÓN'],
        [''],
        ['Permitir Stock Negativo', 'NO', 'SI = Permitir ventas sin stock / NO = Bloquear'],
        ['Alertas de Stock Bajo', 'SI', 'Notificar cuando el stock esté bajo el mínimo'],
        ['Alertas de Vencimiento', 'SI', 'Notificar productos próximos a vencer'],
        ['Días Anticipación Vencimiento', '30', 'Días antes del vencimiento para alertar'],
        ['Seguimiento de Lotes', 'SI', 'SI = Registrar lotes / NO = Sin control de lotes'],
        ['Código de Barras Obligatorio', 'NO', 'Requerir código de barras en productos'],
        ['Costo Automático (WAC)', 'SI', 'Calcular costo promedio ponderado automáticamente'],
        [''],
        [SECTION_SEPARATOR],
        ['📧 NOTIFICACIONES'],
        [SECTION_SEPARATOR],
        [''],
        ['CONFIGURACIÓN', 'VALOR', 'DESCRIPCIÓN'],
        [''],
        ['Email para Alertas', '', 'Email donde recibir alertas de stock', 'admin@tuvetclinica.com'],
        ['WhatsApp para Alertas', '', 'Número WhatsApp para notificaciones', '+595981123456'],
        [''],
    ];

    const wsConfig = XLSX.utils.aoa_to_sheet(configData);
    wsConfig['!cols'] = [{ wch: 35 }, { wch: 30 }, { wch: 50 }, { wch: 25 }];

    // ========================================================================
    // SHEET 3: 📂 Categorías (Jerarquía Completa)
    // ========================================================================
    const categoriesData = [
        [''],
        [TITLE_SEPARATOR],
        ['📂 JERARQUÍA DE CATEGORÍAS DE PRODUCTOS'],
        [TITLE_SEPARATOR],
        ['Define tu estructura de categorías. Usa ID_Padre para crear subcategorías.'],
        ['Puedes tener hasta 3 niveles: Categoría Principal → Subcategoría → Sub-subcategoría'],
        [''],
        [SECTION_SEPARATOR],
        ['📋 CÓMO FUNCIONA LA JERARQUÍA'],
        [SECTION_SEPARATOR],
        [''],
        ['   Nivel 1 (Principal): Dejar "ID_Padre" vacío'],
        ['   Nivel 2 (Sub):       Poner el ID de la categoría padre'],
        ['   Nivel 3 (Sub-sub):   Poner el ID de la subcategoría padre'],
        [''],
        ['   Ejemplo de estructura:'],
        ['   🐕 Alimentos (CAT-001)'],
        ['      └── 🥩 Alimento Seco (CAT-001-01)'],
        ['          └── 🐶 Perros Adultos (CAT-001-01-01)'],
        ['          └── 🐱 Gatos Adultos (CAT-001-01-02)'],
        ['      └── 🥫 Alimento Húmedo (CAT-001-02)'],
        [''],
        [SECTION_SEPARATOR],
        ['📝 LISTADO DE CATEGORÍAS'],
        [SECTION_SEPARATOR],
        [''],
        [
            '⭐ ID Categoría',
            '⭐ Nombre',
            'ID_Padre (vacío=principal)',
            'Icono',
            'Descripción',
            'Orden de Visualización',
            'Activa ▼',
            'Visible en Tienda ▼'
        ],
        [''],
        // Pre-filled category structure
        ['CAT-001', '🐕 Alimentos', '', '🐕', 'Alimentos balanceados y naturales para mascotas', 1, 'SI', 'SI'],
        ['CAT-001-01', 'Alimento Seco', 'CAT-001', '🥩', 'Croquetas y alimentos secos', 1, 'SI', 'SI'],
        ['CAT-001-01-01', 'Perros Adultos', 'CAT-001-01', '🐶', 'Alimento seco para perros adultos', 1, 'SI', 'SI'],
        ['CAT-001-01-02', 'Perros Cachorros', 'CAT-001-01', '🐕', 'Alimento seco para cachorros', 2, 'SI', 'SI'],
        ['CAT-001-01-03', 'Perros Senior', 'CAT-001-01', '🐕', 'Alimento para perros mayores', 3, 'SI', 'SI'],
        ['CAT-001-01-04', 'Gatos Adultos', 'CAT-001-01', '🐱', 'Alimento seco para gatos adultos', 4, 'SI', 'SI'],
        ['CAT-001-01-05', 'Gatos Cachorros', 'CAT-001-01', '🐱', 'Alimento para gatitos', 5, 'SI', 'SI'],
        ['CAT-001-02', 'Alimento Húmedo', 'CAT-001', '🥫', 'Latas y sobres húmedos', 2, 'SI', 'SI'],
        ['CAT-001-02-01', 'Húmedo Perros', 'CAT-001-02', '🐶', 'Alimento húmedo para perros', 1, 'SI', 'SI'],
        ['CAT-001-02-02', 'Húmedo Gatos', 'CAT-001-02', '🐱', 'Alimento húmedo para gatos', 2, 'SI', 'SI'],
        ['CAT-001-03', 'Dietas Especiales', 'CAT-001', '⚕️', 'Alimentos medicados y especiales', 3, 'SI', 'SI'],
        ['CAT-001-03-01', 'Renal', 'CAT-001-03', '💧', 'Para problemas renales', 1, 'SI', 'SI'],
        ['CAT-001-03-02', 'Gastrointestinal', 'CAT-001-03', '🩺', 'Para problemas digestivos', 2, 'SI', 'SI'],
        ['CAT-001-03-03', 'Hipoalergénico', 'CAT-001-03', '🌿', 'Para alergias alimentarias', 3, 'SI', 'SI'],
        [''],
        ['CAT-002', '💊 Medicamentos', '', '💊', 'Productos farmacéuticos veterinarios', 2, 'SI', 'SI'],
        ['CAT-002-01', 'Antibióticos', 'CAT-002', '💉', 'Antibióticos veterinarios', 1, 'SI', 'NO'],
        ['CAT-002-02', 'Antiinflamatorios', 'CAT-002', '💊', 'AINES y corticoides', 2, 'SI', 'NO'],
        ['CAT-002-03', 'Analgésicos', 'CAT-002', '💊', 'Control del dolor', 3, 'SI', 'NO'],
        ['CAT-002-04', 'Cardiovascular', 'CAT-002', '❤️', 'Medicamentos cardíacos', 4, 'SI', 'NO'],
        ['CAT-002-05', 'Dermatológicos', 'CAT-002', '🧴', 'Tratamientos de piel', 5, 'SI', 'NO'],
        [''],
        ['CAT-003', '🦠 Antiparasitarios', '', '🦠', 'Control de parásitos', 3, 'SI', 'SI'],
        ['CAT-003-01', 'Externos', 'CAT-003', '🐜', 'Pulgas, garrapatas, etc.', 1, 'SI', 'SI'],
        ['CAT-003-01-01', 'Pipetas', 'CAT-003-01', '💧', 'Antiparasitarios en pipeta', 1, 'SI', 'SI'],
        ['CAT-003-01-02', 'Collares', 'CAT-003-01', '⭕', 'Collares antiparasitarios', 2, 'SI', 'SI'],
        ['CAT-003-01-03', 'Sprays', 'CAT-003-01', '🌫️', 'Sprays antiparasitarios', 3, 'SI', 'SI'],
        ['CAT-003-02', 'Internos', 'CAT-003', '🪱', 'Desparasitantes internos', 2, 'SI', 'SI'],
        ['CAT-003-02-01', 'Tabletas', 'CAT-003-02', '💊', 'Desparasitantes en tabletas', 1, 'SI', 'SI'],
        ['CAT-003-02-02', 'Pastas', 'CAT-003-02', '🧪', 'Desparasitantes en pasta', 2, 'SI', 'SI'],
        [''],
        ['CAT-004', '🧴 Higiene y Cuidado', '', '🧴', 'Productos de limpieza y cuidado', 4, 'SI', 'SI'],
        ['CAT-004-01', 'Shampoos', 'CAT-004', '🛁', 'Shampoos y acondicionadores', 1, 'SI', 'SI'],
        ['CAT-004-02', 'Cepillado', 'CAT-004', '🪮', 'Cepillos y peines', 2, 'SI', 'SI'],
        ['CAT-004-03', 'Dental', 'CAT-004', '🦷', 'Cuidado dental', 3, 'SI', 'SI'],
        ['CAT-004-04', 'Oídos y Ojos', 'CAT-004', '👀', 'Limpieza de oídos y ojos', 4, 'SI', 'SI'],
        [''],
        ['CAT-005', '🎾 Juguetes', '', '🎾', 'Entretenimiento para mascotas', 5, 'SI', 'SI'],
        ['CAT-005-01', 'Juguetes Perros', 'CAT-005', '🐶', 'Juguetes para perros', 1, 'SI', 'SI'],
        ['CAT-005-02', 'Juguetes Gatos', 'CAT-005', '🐱', 'Juguetes para gatos', 2, 'SI', 'SI'],
        ['CAT-005-03', 'Juguetes Interactivos', 'CAT-005', '🎮', 'Juguetes con tecnología', 3, 'SI', 'SI'],
        [''],
        ['CAT-006', '🦴 Snacks y Premios', '', '🦴', 'Golosinas y premios', 6, 'SI', 'SI'],
        ['CAT-006-01', 'Snacks Perros', 'CAT-006', '🐶', 'Premios para perros', 1, 'SI', 'SI'],
        ['CAT-006-02', 'Snacks Gatos', 'CAT-006', '🐱', 'Premios para gatos', 2, 'SI', 'SI'],
        ['CAT-006-03', 'Huesos y Masticables', 'CAT-006', '🦴', 'Huesos naturales y sintéticos', 3, 'SI', 'SI'],
        [''],
        ['CAT-007', '🛋️ Camas y Descanso', '', '🛋️', 'Productos de descanso', 7, 'SI', 'SI'],
        ['CAT-007-01', 'Camas', 'CAT-007', '🛏️', 'Camas para mascotas', 1, 'SI', 'SI'],
        ['CAT-007-02', 'Casas', 'CAT-007', '🏠', 'Casas y refugios', 2, 'SI', 'SI'],
        ['CAT-007-03', 'Mantas', 'CAT-007', '🧶', 'Mantas y cobijas', 3, 'SI', 'SI'],
        [''],
        ['CAT-008', '✈️ Transportadoras', '', '✈️', 'Transporte de mascotas', 8, 'SI', 'SI'],
        ['CAT-008-01', 'Kennels', 'CAT-008', '📦', 'Kennels rígidos', 1, 'SI', 'SI'],
        ['CAT-008-02', 'Bolsos', 'CAT-008', '👜', 'Bolsos de transporte', 2, 'SI', 'SI'],
        ['CAT-008-03', 'Mochilas', 'CAT-008', '🎒', 'Mochilas para mascotas', 3, 'SI', 'SI'],
        [''],
        ['CAT-009', '🔗 Accesorios', '', '🔗', 'Collares, correas y más', 9, 'SI', 'SI'],
        ['CAT-009-01', 'Collares', 'CAT-009', '⭕', 'Collares para mascotas', 1, 'SI', 'SI'],
        ['CAT-009-02', 'Correas', 'CAT-009', '➰', 'Correas y guías', 2, 'SI', 'SI'],
        ['CAT-009-03', 'Arneses', 'CAT-009', '🦺', 'Arneses de paseo', 3, 'SI', 'SI'],
        ['CAT-009-04', 'Placas ID', 'CAT-009', '🏷️', 'Placas de identificación', 4, 'SI', 'SI'],
        [''],
        ['CAT-010', '💉 Suplementos', '', '💉', 'Complementos nutricionales', 10, 'SI', 'SI'],
        ['CAT-010-01', 'Vitaminas', 'CAT-010', '💊', 'Vitaminas y minerales', 1, 'SI', 'SI'],
        ['CAT-010-02', 'Condroprotectores', 'CAT-010', '🦴', 'Para articulaciones', 2, 'SI', 'SI'],
        ['CAT-010-03', 'Omega y Ácidos Grasos', 'CAT-010', '🐟', 'Omega 3, 6, 9', 3, 'SI', 'SI'],
        ['CAT-010-04', 'Probióticos', 'CAT-010', '🦠', 'Flora intestinal', 4, 'SI', 'SI'],
        [''],
        ['CAT-011', '👔 Ropa', '', '👔', 'Vestimenta para mascotas', 11, 'SI', 'SI'],
        ['CAT-011-01', 'Abrigos', 'CAT-011', '🧥', 'Abrigos y sweaters', 1, 'SI', 'SI'],
        ['CAT-011-02', 'Impermeables', 'CAT-011', '🌧️', 'Ropa para lluvia', 2, 'SI', 'SI'],
        ['CAT-011-03', 'Disfraces', 'CAT-011', '🎭', 'Disfraces especiales', 3, 'SI', 'SI'],
        [''],
        ['CAT-012', '🍽️ Comederos y Bebederos', '', '🍽️', 'Para alimentación', 12, 'SI', 'SI'],
        ['CAT-012-01', 'Comederos', 'CAT-012', '🥣', 'Platos y comederos', 1, 'SI', 'SI'],
        ['CAT-012-02', 'Bebederos', 'CAT-012', '💧', 'Bebederos y fuentes', 2, 'SI', 'SI'],
        ['CAT-012-03', 'Dispensadores', 'CAT-012', '⏰', 'Dispensadores automáticos', 3, 'SI', 'SI'],
        [''],
        ['CAT-013', '🏥 Insumos Clínicos', '', '🏥', 'Materiales para uso clínico', 13, 'SI', 'NO'],
        ['CAT-013-01', 'Jeringas y Agujas', 'CAT-013', '💉', 'Material de inyección', 1, 'SI', 'NO'],
        ['CAT-013-02', 'Guantes', 'CAT-013', '🧤', 'Guantes de examen', 2, 'SI', 'NO'],
        ['CAT-013-03', 'Vendajes', 'CAT-013', '🩹', 'Vendas y gasas', 3, 'SI', 'NO'],
        ['CAT-013-04', 'Sutura', 'CAT-013', '🪡', 'Material de sutura', 4, 'SI', 'NO'],
        ['CAT-013-05', 'Diagnóstico', 'CAT-013', '🔬', 'Reactivos y tests', 5, 'SI', 'NO'],
        [''],
        ['CAT-099', '📦 Otros', '', '📦', 'Productos varios', 99, 'SI', 'SI'],
        [''],
    ];

    const wsCategories = XLSX.utils.aoa_to_sheet(categoriesData);
    wsCategories['!cols'] = [
        { wch: 18 }, { wch: 28 }, { wch: 28 }, { wch: 8 },
        { wch: 40 }, { wch: 22 }, { wch: 12 }, { wch: 20 }
    ];

    // ========================================================================
    // SHEET 4: 🏭 Proveedores
    // ========================================================================
    const suppliersData = [
        [''],
        [TITLE_SEPARATOR],
        ['🏭 DIRECTORIO DE PROVEEDORES'],
        [TITLE_SEPARATOR],
        ['Registra todos tus proveedores con su información completa.'],
        [''],
        [
            '⭐ ID Proveedor',
            '⭐ Nombre/Razón Social',
            'RUC/CI',
            'Nombre Contacto',
            'Teléfono',
            'Email',
            'WhatsApp',
            'Dirección',
            'Ciudad',
            'País',
            'Categorías que Provee',
            'Días de Crédito',
            'Descuento Habitual (%)',
            'Notas',
            'Activo ▼'
        ],
        [''],
        // Pre-filled examples
        ['PROV-001', 'Royal Canin Paraguay', '80012345-6', 'María González', '+595 21 123456', 'ventas@royalcanin.com.py', '+595981123456', 'Av. Aviadores del Chaco 1234', 'Asunción', 'Paraguay', 'Alimentos', 30, 5, 'Proveedor premium exclusivo', 'SI'],
        ['PROV-002', 'Pet Food Distribuidora', '80023456-7', 'Carlos Martínez', '+595 21 234567', 'pedidos@petfood.com.py', '+595982234567', 'Ruta 2 Km 15', 'San Lorenzo', 'Paraguay', 'Alimentos, Snacks', 15, 3, 'Entrega los martes y viernes', 'SI'],
        ['PROV-003', 'Veterquímica SA', '80034567-8', 'Ana Rodríguez', '+595 21 345678', 'ventas@veterquimica.com', '+595983345678', 'Zona Industrial', 'Luque', 'Paraguay', 'Medicamentos, Antiparasitarios', 45, 8, 'Mínimo de compra Gs. 500.000', 'SI'],
        ['PROV-004', 'Accesorios Pet Shop', '3456789-0', 'Juan Pérez', '+595 21 456789', 'accesorios@petshop.com', '+595984456789', 'Shopping del Sol Local 45', 'Asunción', 'Paraguay', 'Accesorios, Juguetes, Camas', 0, 0, 'Pago contra entrega', 'SI'],
        ['PROV-005', 'Importadora Animal', '80045678-9', 'Laura Sánchez', '+595 21 567890', 'importaciones@animal.com.py', '+595985567890', 'Puerto Asunción', 'Asunción', 'Paraguay', 'Todos', 60, 10, 'Importador mayorista', 'SI'],
        ['PROV-006', '', '', '', '', '', '', '', '', '', '', '', '', '', 'SI'],
        ['PROV-007', '', '', '', '', '', '', '', '', '', '', '', '', '', 'SI'],
        ['PROV-008', '', '', '', '', '', '', '', '', '', '', '', '', '', 'SI'],
        ['PROV-009', '', '', '', '', '', '', '', '', '', '', '', '', '', 'SI'],
        ['PROV-010', '', '', '', '', '', '', '', '', '', '', '', '', '', 'SI'],
        [''],
    ];

    const wsSuppliers = XLSX.utils.aoa_to_sheet(suppliersData);
    wsSuppliers['!cols'] = [
        { wch: 14 }, { wch: 30 }, { wch: 14 }, { wch: 20 },
        { wch: 18 }, { wch: 28 }, { wch: 16 }, { wch: 35 },
        { wch: 15 }, { wch: 12 }, { wch: 30 }, { wch: 15 },
        { wch: 20 }, { wch: 35 }, { wch: 10 }
    ];

    // ========================================================================
    // SHEET 5: 📏 Unidades de Medida
    // ========================================================================
    const unitsData = [
        [''],
        [TITLE_SEPARATOR],
        ['📏 UNIDADES DE MEDIDA'],
        [TITLE_SEPARATOR],
        ['Define las unidades de medida para tus productos.'],
        [''],
        [
            '⭐ Código',
            '⭐ Nombre',
            'Símbolo',
            'Tipo ▼',
            'Descripción',
            'Factor de Conversión',
            'Unidad Base'
        ],
        [''],
        // Pre-filled common units
        ['UN', 'Unidad', 'un', 'Cantidad', 'Unidad individual', 1, ''],
        ['PZ', 'Pieza', 'pz', 'Cantidad', 'Pieza individual', 1, 'UN'],
        ['PAQ', 'Paquete', 'paq', 'Cantidad', 'Paquete (varias unidades)', 1, ''],
        ['CAJ', 'Caja', 'caja', 'Cantidad', 'Caja completa', 1, ''],
        ['DOC', 'Docena', 'doc', 'Cantidad', '12 unidades', 12, 'UN'],
        [''],
        ['KG', 'Kilogramo', 'kg', 'Peso', 'Kilogramo', 1000, 'GR'],
        ['GR', 'Gramo', 'g', 'Peso', 'Gramo', 1, ''],
        ['MG', 'Miligramo', 'mg', 'Peso', 'Miligramo', 0.001, 'GR'],
        ['LB', 'Libra', 'lb', 'Peso', 'Libra (454g)', 454, 'GR'],
        ['OZ', 'Onza', 'oz', 'Peso', 'Onza (28.35g)', 28.35, 'GR'],
        [''],
        ['LT', 'Litro', 'L', 'Volumen', 'Litro', 1000, 'ML'],
        ['ML', 'Mililitro', 'ml', 'Volumen', 'Mililitro', 1, ''],
        ['GAL', 'Galón', 'gal', 'Volumen', 'Galón (3.785L)', 3785, 'ML'],
        [''],
        ['MT', 'Metro', 'm', 'Longitud', 'Metro', 100, 'CM'],
        ['CM', 'Centímetro', 'cm', 'Longitud', 'Centímetro', 1, ''],
        ['PUL', 'Pulgada', 'in', 'Longitud', 'Pulgada (2.54cm)', 2.54, 'CM'],
        [''],
        ['TAB', 'Tableta', 'tab', 'Farmacéutico', 'Tableta/Comprimido', 1, ''],
        ['CAP', 'Cápsula', 'cap', 'Farmacéutico', 'Cápsula', 1, ''],
        ['AMP', 'Ampolla', 'amp', 'Farmacéutico', 'Ampolla inyectable', 1, ''],
        ['FCO', 'Frasco', 'fco', 'Farmacéutico', 'Frasco/Vial', 1, ''],
        ['TUB', 'Tubo', 'tubo', 'Farmacéutico', 'Tubo (cremas, geles)', 1, ''],
        ['SOB', 'Sobre', 'sobre', 'Farmacéutico', 'Sobre individual', 1, ''],
        ['PIP', 'Pipeta', 'pip', 'Farmacéutico', 'Pipeta antiparasitaria', 1, ''],
        [''],
    ];

    const wsUnits = XLSX.utils.aoa_to_sheet(unitsData);
    wsUnits['!cols'] = [
        { wch: 12 }, { wch: 18 }, { wch: 10 }, { wch: 14 },
        { wch: 35 }, { wch: 22 }, { wch: 14 }
    ];

    // ========================================================================
    // SHEET 6: 💰 Impuestos
    // ========================================================================
    const taxesData = [
        [''],
        [TITLE_SEPARATOR],
        ['💰 CONFIGURACIÓN DE IMPUESTOS'],
        [TITLE_SEPARATOR],
        ['Define los impuestos aplicables a tus productos.'],
        [''],
        [
            '⭐ Código',
            '⭐ Nombre',
            '⭐ Porcentaje (%)',
            'Descripción',
            'Aplica a Categorías',
            'Por Defecto ▼',
            'Activo ▼'
        ],
        [''],
        ['IVA10', 'IVA 10%', 10, 'IVA estándar Paraguay', 'Todos', 'SI', 'SI'],
        ['IVA5', 'IVA 5%', 5, 'IVA reducido', 'Alimentos básicos', 'NO', 'SI'],
        ['EXE', 'Exento', 0, 'Productos exentos de IVA', 'Medicamentos específicos', 'NO', 'SI'],
        ['', '', '', '', '', 'NO', 'SI'],
        ['', '', '', '', '', 'NO', 'SI'],
        [''],
    ];

    const wsTaxes = XLSX.utils.aoa_to_sheet(taxesData);
    wsTaxes['!cols'] = [
        { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 30 },
        { wch: 30 }, { wch: 15 }, { wch: 10 }
    ];

    // ========================================================================
    // SHEET 7: 🏷️ Marcas
    // ========================================================================
    const brandsData = [
        [''],
        [TITLE_SEPARATOR],
        ['🏷️ CATÁLOGO DE MARCAS'],
        [TITLE_SEPARATOR],
        ['Lista las marcas de productos que manejas en tu inventario.'],
        [''],
        [
            '⭐ Código',
            '⭐ Nombre de Marca',
            'País de Origen',
            'Sitio Web',
            'Categorías Principales',
            'Nivel de Precio ▼',
            'Notas',
            'Activa ▼'
        ],
        [''],
        // Pre-filled popular brands
        ['RC', 'Royal Canin', 'Francia', 'www.royalcanin.com', 'Alimentos', 'Premium', 'Líder en nutrición especializada', 'SI'],
        ['PP', 'Pro Plan (Purina)', 'USA', 'www.proplan.com', 'Alimentos', 'Premium', 'Nutrición avanzada', 'SI'],
        ['HSD', 'Hills Science Diet', 'USA', 'www.hillspet.com', 'Alimentos, Dietas Especiales', 'Super Premium', 'Veterinaria exclusiva', 'SI'],
        ['EUK', 'Eukanuba', 'USA', 'www.eukanuba.com', 'Alimentos', 'Premium', 'Nutrición deportiva', 'SI'],
        ['DC', 'Dog Chow (Purina)', 'USA', 'www.dogchow.com', 'Alimentos', 'Económico', 'Línea económica', 'SI'],
        ['PN', 'Pedigree (Mars)', 'USA', 'www.pedigree.com', 'Alimentos, Snacks', 'Económico', 'Masivo', 'SI'],
        ['WHS', 'Whiskas (Mars)', 'USA', 'www.whiskas.com', 'Alimentos Gatos', 'Económico', 'Masivo', 'SI'],
        ['FEL', 'Felix (Purina)', 'USA', 'www.felix.com', 'Alimentos Gatos', 'Económico', 'Alimento húmedo', 'SI'],
        [''],
        ['FRO', 'Frontline', 'Francia', 'www.frontline.com', 'Antiparasitarios', 'Premium', 'Líder en control de pulgas', 'SI'],
        ['NEX', 'NexGard', 'USA', 'www.nexgard.com', 'Antiparasitarios', 'Premium', 'Tabletas masticables', 'SI'],
        ['BRA', 'Bravecto', 'USA', 'www.bravecto.com', 'Antiparasitarios', 'Super Premium', '3 meses de protección', 'SI'],
        ['ADV', 'Advantage', 'Alemania', 'www.advantage.com', 'Antiparasitarios', 'Premium', 'Control de pulgas', 'SI'],
        [''],
        ['VIR', 'Virbac', 'Francia', 'www.virbac.com', 'Higiene, Medicamentos', 'Premium', 'Productos veterinarios', 'SI'],
        ['ZOE', 'Zoetis', 'USA', 'www.zoetis.com', 'Medicamentos', 'Premium', 'Farmacéutica veterinaria líder', 'SI'],
        ['BVT', 'Boehringer Vet', 'Alemania', 'www.boehringer.com', 'Medicamentos', 'Premium', 'Innovación farmacéutica', 'SI'],
        [''],
        ['KONG', 'KONG', 'USA', 'www.kongcompany.com', 'Juguetes', 'Premium', 'Juguetes resistentes', 'SI'],
        ['CHK', 'Chuckit!', 'USA', 'www.chuckit.com', 'Juguetes', 'Premium', 'Juguetes de exterior', 'SI'],
        [''],
        ['', '', '', '', '', 'Económico', '', 'SI'],
        ['', '', '', '', '', 'Económico', '', 'SI'],
        ['', '', '', '', '', 'Económico', '', 'SI'],
        [''],
    ];

    const wsBrands = XLSX.utils.aoa_to_sheet(brandsData);
    wsBrands['!cols'] = [
        { wch: 10 }, { wch: 25 }, { wch: 15 }, { wch: 25 },
        { wch: 30 }, { wch: 15 }, { wch: 35 }, { wch: 10 }
    ];

    // ========================================================================
    // SHEET 8: 📍 Ubicaciones de Almacenamiento
    // ========================================================================
    const locationsData = [
        [''],
        [TITLE_SEPARATOR],
        ['📍 UBICACIONES DE ALMACENAMIENTO'],
        [TITLE_SEPARATOR],
        ['Define las zonas donde guardas productos en tu clínica.'],
        [''],
        [
            '⭐ Código',
            '⭐ Nombre',
            'Tipo ▼',
            'Capacidad',
            'Temperatura',
            'Productos Permitidos',
            'Notas',
            'Activa ▼'
        ],
        [''],
        ['ALM-01', 'Almacén Principal', 'Almacén', 'Alta', 'Ambiente', 'Alimentos, Accesorios, Juguetes', 'Depósito general', 'SI'],
        ['ALM-02', 'Farmacia', 'Farmacia', 'Media', 'Controlada', 'Medicamentos, Antiparasitarios', 'Acceso restringido', 'SI'],
        ['ALM-03', 'Refrigerador', 'Refrigerado', 'Baja', '2-8°C', 'Vacunas, Biológicos', 'Control de temperatura obligatorio', 'SI'],
        ['ALM-04', 'Estantería Tienda', 'Exhibición', 'Media', 'Ambiente', 'Todos los vendibles', 'Productos de venta directa', 'SI'],
        ['ALM-05', 'Bodega Secundaria', 'Almacén', 'Alta', 'Ambiente', 'Stock de reserva', 'Overflow de almacén principal', 'SI'],
        ['ALM-06', 'Consultorio 1', 'Consultorio', 'Baja', 'Ambiente', 'Insumos clínicos', 'Materiales de uso diario', 'SI'],
        ['ALM-07', 'Consultorio 2', 'Consultorio', 'Baja', 'Ambiente', 'Insumos clínicos', 'Materiales de uso diario', 'SI'],
        ['ALM-08', 'Quirófano', 'Quirófano', 'Baja', 'Controlada', 'Material quirúrgico', 'Estéril', 'SI'],
        ['', '', 'Almacén', '', '', '', '', 'SI'],
        ['', '', 'Almacén', '', '', '', '', 'SI'],
        [''],
    ];

    const wsLocations = XLSX.utils.aoa_to_sheet(locationsData);
    wsLocations['!cols'] = [
        { wch: 12 }, { wch: 22 }, { wch: 14 }, { wch: 12 },
        { wch: 14 }, { wch: 35 }, { wch: 35 }, { wch: 10 }
    ];

    // ========================================================================
    // SHEET 9: 🆕 Productos (Catálogo Completo)
    // ========================================================================
    const productsData = [
        [''],
        [TITLE_SEPARATOR],
        ['🆕 CATÁLOGO COMPLETO DE PRODUCTOS'],
        [TITLE_SEPARATOR],
        ['Agrega productos nuevos con TODA la información disponible.'],
        ['Los campos con ⭐ son obligatorios. Los demás son opcionales pero recomendados.'],
        [''],
        [SECTION_SEPARATOR],
        ['📝 INFORMACIÓN BÁSICA'],
        [SECTION_SEPARATOR],
        [''],
        [
            // Basic Information (columns A-L)
            '⭐ Nombre del Producto',
            '⭐ Categoría (ID o Nombre)',
            'Subcategoría',
            'Sub-subcategoría',
            '⭐ Marca',
            'Descripción',
            'Descripción Corta (para tienda)',
            'Código de Barras / EAN',
            'SKU Proveedor',
            'Modelo',
            'Parte de Kit ▼',
            'Nombre del Kit',
        ],
        [''],
        // Example row - basic info
        [
            'Royal Canin Medium Adult 15kg',
            'CAT-001-01-01',
            '',
            '',
            'RC',
            'Alimento seco premium para perros adultos de razas medianas (11-25kg). Fórmula con antioxidantes para reforzar defensas naturales.',
            'Alimento perros adultos medianos',
            '3182550402224',
            'RC-MED-15',
            '',
            'NO',
            '',
        ],
        [''],
        [SECTION_SEPARATOR],
        ['💰 PRECIOS Y COSTOS'],
        [SECTION_SEPARATOR],
        [''],
        [
            // Pricing (columns A-H)
            '⭐ Precio Venta (Gs)',
            'Precio Venta USD',
            '⭐ Costo Unitario (Gs)',
            'Costo USD',
            'Margen Mínimo (%)',
            'Impuesto ▼',
            'Precio Promocional',
            'Promoción Válida Hasta',
        ],
        [''],
        [
            450000,
            '',
            320000,
            '',
            25,
            'IVA10',
            399000,
            '2025-01-31',
        ],
        [''],
        [SECTION_SEPARATOR],
        ['📦 INVENTARIO Y STOCK'],
        [SECTION_SEPARATOR],
        [''],
        [
            // Stock (columns A-J)
            '⭐ Cantidad Inicial',
            'Stock Mínimo (Alerta)',
            'Stock Máximo',
            'Punto de Reorden',
            'Cantidad Reorden Sugerida',
            'Unidad de Medida ▼',
            'Unidad de Compra',
            'Factor Conversión',
            'Ubicación Principal ▼',
            'Ubicación Secundaria',
        ],
        [''],
        [
            20,
            5,
            50,
            10,
            20,
            'UN',
            'UN',
            1,
            'ALM-01',
            '',
        ],
        [''],
        [SECTION_SEPARATOR],
        ['📋 TRAZABILIDAD Y VENCIMIENTO'],
        [SECTION_SEPARATOR],
        [''],
        [
            // Traceability (columns A-G)
            'Fecha de Vencimiento',
            'Número de Lote',
            'Fecha de Fabricación',
            'Registro Sanitario',
            'Requiere Receta ▼',
            'Producto Controlado ▼',
            'Cadena de Frío ▼',
        ],
        [''],
        [
            '2026-06-15',
            'LOT2024A-0892',
            '2024-06-15',
            'REG-12345',
            'NO',
            'NO',
            'NO',
        ],
        [''],
        [SECTION_SEPARATOR],
        ['📐 DIMENSIONES Y PESO'],
        [SECTION_SEPARATOR],
        [''],
        [
            // Dimensions (columns A-H)
            'Peso Neto (kg)',
            'Peso Bruto (kg)',
            'Ancho (cm)',
            'Alto (cm)',
            'Profundidad (cm)',
            'Volumen (L)',
            'Unidades por Caja',
            'Cajas por Pallet',
        ],
        [''],
        [
            15,
            15.5,
            45,
            60,
            15,
            40.5,
            4,
            40,
        ],
        [''],
        [SECTION_SEPARATOR],
        ['🏷️ ATRIBUTOS ADICIONALES'],
        [SECTION_SEPARATOR],
        [''],
        [
            // Attributes (columns A-J)
            'Especie ▼',
            'Etapa de Vida ▼',
            'Tamaño Raza ▼',
            'Condición Especial',
            'Sabor/Variedad',
            'Color',
            'Material',
            'Talla ▼',
            'Tags/Etiquetas',
            'Palabras Clave SEO',
        ],
        [''],
        [
            'Perro',
            'Adulto',
            'Mediano',
            '',
            'Pollo',
            '',
            '',
            '',
            'premium, alta digestibilidad',
            'alimento perro adulto mediano royal canin',
        ],
        [''],
        [SECTION_SEPARATOR],
        ['🏭 PROVEEDOR Y COMPRAS'],
        [SECTION_SEPARATOR],
        [''],
        [
            // Supplier (columns A-G)
            '⭐ Proveedor Principal',
            'Proveedor Alternativo',
            'Tiempo de Entrega (días)',
            'Cantidad Mín. Compra',
            'Descuento Proveedor (%)',
            'Última Compra',
            'Notas de Compra',
        ],
        [''],
        [
            'PROV-001',
            'PROV-005',
            7,
            5,
            5,
            '2024-12-01',
            'Pedido mensual',
        ],
        [''],
        [SECTION_SEPARATOR],
        ['🌐 TIENDA ONLINE'],
        [SECTION_SEPARATOR],
        [''],
        [
            // E-commerce (columns A-I)
            'Activo en Tienda ▼',
            'Destacado ▼',
            'Nuevo ▼',
            'Más Vendido ▼',
            'Orden de Visualización',
            'URL Imagen Principal',
            'URL Imagen 2',
            'URL Imagen 3',
            'Video URL',
        ],
        [''],
        [
            'SI',
            'SI',
            'NO',
            'SI',
            1,
            '/images/products/royal-canin-medium-adult.jpg',
            '',
            '',
            '',
        ],
        [''],
        [SECTION_SEPARATOR],
        ['📊 CONFIGURACIÓN AVANZADA'],
        [SECTION_SEPARATOR],
        [''],
        [
            // Advanced (columns A-H)
            'Permite Venta Fraccionada ▼',
            'Vender sin Stock ▼',
            'Producto Digital ▼',
            'Requiere Envío ▼',
            'Peso Envío (kg)',
            'Costo Envío Fijo',
            'Envío Gratis ▼',
            'Notas Internas',
        ],
        [''],
        [
            'NO',
            'NO',
            'NO',
            'SI',
            16,
            '',
            'NO',
            'Best seller de la categoría',
        ],
        [''],
        [SECTION_SEPARATOR],
        ['✏️ AGREGA MÁS PRODUCTOS AQUÍ (copia las filas de arriba como guía)'],
        [SECTION_SEPARATOR],
        [''],
    ];

    const wsProducts = XLSX.utils.aoa_to_sheet(productsData);
    wsProducts['!cols'] = [
        { wch: 35 }, { wch: 25 }, { wch: 20 }, { wch: 20 },
        { wch: 15 }, { wch: 60 }, { wch: 35 }, { wch: 18 },
        { wch: 15 }, { wch: 15 }, { wch: 14 }, { wch: 20 }
    ];

    // ========================================================================
    // SHEET 10: 📦 Movimientos de Stock
    // ========================================================================
    const movementsData = [
        [''],
        [TITLE_SEPARATOR],
        ['📦 REGISTRO DE MOVIMIENTOS DE INVENTARIO'],
        [TITLE_SEPARATOR],
        ['Registra todas las entradas y salidas de stock.'],
        ['Para productos EXISTENTES, usa el SKU. Para NUEVOS, usa la hoja "Productos".'],
        [''],
        [
            '⭐ SKU / Código Producto',
            '⭐ Operación ▼',
            '⭐ Cantidad',
            'Costo Unitario (Gs)',
            'Nuevo Precio Venta (Gs)',
            'Proveedor',
            'Factura/Remito',
            'Fecha Vencimiento',
            'Número de Lote',
            'Ubicación Destino',
            'Ubicación Origen',
            'Fecha Operación',
            'Responsable',
            'Notas / Motivo'
        ],
        [''],
        // Pre-filled examples
        ['prod_rc_medium_15kg', 'Purchase', 50, 315000, '', 'PROV-001', 'FAC-001-0012345', '2026-08-20', 'LOT2025-A', 'ALM-01', '', '2024-12-15', 'Admin', 'Compra mensual'],
        ['prod_frontline_l', 'Purchase', 100, 85000, '', 'PROV-003', 'FAC-003-0005678', '2026-03-15', 'FL2025B', 'ALM-02', '', '2024-12-15', 'Admin', 'Reposición stock'],
        ['prod_kong_classic_m', 'Adjustment', -2, '', '', '', '', '', '', 'ALM-04', '', '2024-12-14', 'Admin', 'Diferencia en conteo físico'],
        ['prod_shampoo_virbac', 'Damage', -3, '', '', '', '', '', '', '', '', '2024-12-13', 'Recepción', 'Frascos rotos en transporte'],
        ['prod_hills_renal', 'Transfer', 5, '', '', '', '', '', '', 'ALM-04', 'ALM-01', '2024-12-12', 'Admin', 'Traslado a tienda'],
        ['prod_nexgard_m', 'Price Update', 0, '', 125000, '', '', '', '', '', '', '2024-12-10', 'Admin', 'Ajuste por inflación'],
        ['prod_cama_ortopedica', 'Return', 1, '', '', '', '', '', '', 'ALM-04', '', '2024-12-08', 'Ventas', 'Devolución cliente - cambio talla'],
        ['prod_antibiotico_amp', 'Expired', -10, '', '', '', '', '2024-11-30', 'AB2024C', '', '', '2024-12-01', 'Farmacia', 'Baja por vencimiento'],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        [''],
    ];

    const wsMovements = XLSX.utils.aoa_to_sheet(movementsData);
    wsMovements['!cols'] = [
        { wch: 25 }, { wch: 14 }, { wch: 12 }, { wch: 20 },
        { wch: 22 }, { wch: 15 }, { wch: 20 }, { wch: 18 },
        { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 16 },
        { wch: 15 }, { wch: 40 }
    ];

    // ========================================================================
    // SHEET 11: 💲 Precios por Cantidad (Volume Pricing)
    // ========================================================================
    const volumePricingData = [
        [''],
        [TITLE_SEPARATOR],
        ['💲 PRECIOS POR CANTIDAD / VOLUMEN'],
        [TITLE_SEPARATOR],
        ['Configura descuentos por volumen de compra para productos específicos.'],
        [''],
        [
            '⭐ SKU Producto',
            'Nombre Producto (referencia)',
            '⭐ Cantidad Mínima',
            '⭐ Cantidad Máxima',
            '⭐ Precio Unitario (Gs)',
            'Descuento (%)',
            'Cliente Tipo ▼',
            'Válido Desde',
            'Válido Hasta',
            'Activo ▼'
        ],
        [''],
        ['prod_rc_medium_15kg', 'Royal Canin Medium Adult 15kg', 1, 4, 450000, 0, 'Todos', '', '', 'SI'],
        ['prod_rc_medium_15kg', 'Royal Canin Medium Adult 15kg', 5, 9, 427500, 5, 'Todos', '', '', 'SI'],
        ['prod_rc_medium_15kg', 'Royal Canin Medium Adult 15kg', 10, 999, 405000, 10, 'Todos', '', '', 'SI'],
        [''],
        ['prod_frontline_l', 'Frontline Plus L', 1, 2, 125000, 0, 'Todos', '', '', 'SI'],
        ['prod_frontline_l', 'Frontline Plus L', 3, 5, 118750, 5, 'Todos', '', '', 'SI'],
        ['prod_frontline_l', 'Frontline Plus L', 6, 999, 112500, 10, 'Todos', '', '', 'SI'],
        [''],
        ['', '', '', '', '', '', 'Todos', '', '', 'SI'],
        ['', '', '', '', '', '', 'Todos', '', '', 'SI'],
        ['', '', '', '', '', '', 'Todos', '', '', 'SI'],
        [''],
    ];

    const wsVolumePricing = XLSX.utils.aoa_to_sheet(volumePricingData);
    wsVolumePricing['!cols'] = [
        { wch: 22 }, { wch: 35 }, { wch: 18 }, { wch: 18 },
        { wch: 22 }, { wch: 14 }, { wch: 15 }, { wch: 14 },
        { wch: 14 }, { wch: 10 }
    ];

    // ========================================================================
    // SHEET 12: 📚 Ejemplos Completos
    // ========================================================================
    const examplesData = [
        [''],
        [TITLE_SEPARATOR],
        ['📚 EJEMPLOS DETALLADOS DE CADA OPERACIÓN'],
        [TITLE_SEPARATOR],
        [''],
        [SECTION_SEPARATOR],
        ['🆕 EJEMPLO 1: CREAR CATEGORÍA CON JERARQUÍA'],
        [SECTION_SEPARATOR],
        [''],
        ['Situación: Quieres crear una nueva subcategoría "Alimento Natural" dentro de "Alimentos"'],
        [''],
        ['Paso 1: Ir a la hoja "📂 Categorías"'],
        ['Paso 2: Agregar una nueva fila:'],
        [''],
        ['ID Categoría', 'Nombre', 'ID_Padre', 'Icono', 'Descripción', 'Orden', 'Activa', 'Visible'],
        ['CAT-001-04', 'Alimento Natural', 'CAT-001', '🥩', 'Alimentos naturales y BARF', 4, 'SI', 'SI'],
        [''],
        ['Paso 3: Si quieres sub-subcategorías, agrega más filas usando CAT-001-04 como padre:'],
        [''],
        ['ID Categoría', 'Nombre', 'ID_Padre', 'Icono', 'Descripción', 'Orden', 'Activa', 'Visible'],
        ['CAT-001-04-01', 'BARF Congelado', 'CAT-001-04', '🧊', 'Dieta BARF congelada', 1, 'SI', 'SI'],
        ['CAT-001-04-02', 'Deshidratados', 'CAT-001-04', '🥓', 'Alimentos deshidratados naturales', 2, 'SI', 'SI'],
        [''],
        [SECTION_SEPARATOR],
        ['🏭 EJEMPLO 2: REGISTRAR NUEVO PROVEEDOR'],
        [SECTION_SEPARATOR],
        [''],
        ['Situación: Tienes un nuevo proveedor de juguetes importados'],
        [''],
        ['Ir a la hoja "🏭 Proveedores" y agregar:'],
        [''],
        ['ID', 'Nombre', 'RUC', 'Contacto', 'Teléfono', 'Email', 'WhatsApp', 'Dirección', 'Ciudad', 'País', 'Categorías', 'Crédito', 'Desc', 'Notas', 'Activo'],
        ['PROV-011', 'Mascotas Import SRL', '80111222-3', 'Roberto Giménez', '+595 21 888999', 'ventas@mascotasimport.com', '+595987888999', 'Zona Industrial Norte', 'Fernando de la Mora', 'Paraguay', 'Juguetes, Accesorios', 45, 8, 'Importador de USA y China', 'SI'],
        [''],
        [SECTION_SEPARATOR],
        ['📦 EJEMPLO 3: AGREGAR PRODUCTO COMPLETO'],
        [SECTION_SEPARATOR],
        [''],
        ['Situación: Quieres agregar un nuevo shampoo medicado al catálogo'],
        [''],
        ['Ir a la hoja "🆕 Productos" y completar TODAS las secciones:'],
        [''],
        ['SECCIÓN INFORMACIÓN BÁSICA:'],
        ['Nombre: "Shampoo Medicado Clorhexidina 4% 500ml"'],
        ['Categoría: CAT-004-01 (Shampoos)'],
        ['Marca: VIR (Virbac)'],
        ['Descripción: "Shampoo antiséptico con clorhexidina 4%. Ideal para dermatitis, piodermas y otras infecciones de piel."'],
        ['Código de barras: 7891234567890'],
        [''],
        ['SECCIÓN PRECIOS:'],
        ['Precio Venta: 185000'],
        ['Costo: 125000'],
        ['Impuesto: IVA10'],
        [''],
        ['SECCIÓN STOCK:'],
        ['Cantidad Inicial: 15'],
        ['Stock Mínimo: 5'],
        ['Unidad: UN'],
        ['Ubicación: ALM-02 (Farmacia)'],
        [''],
        ['SECCIÓN TRAZABILIDAD:'],
        ['Vencimiento: 2026-12-31'],
        ['Lote: SH2024-DEC'],
        ['Requiere Receta: NO'],
        [''],
        [SECTION_SEPARATOR],
        ['📥 EJEMPLO 4: REGISTRAR COMPRA A PROVEEDOR'],
        [SECTION_SEPARATOR],
        [''],
        ['Situación: Llegó un pedido de 50 bolsas de Royal Canin Medium 15kg'],
        [''],
        ['Ir a la hoja "📦 Movimientos" y agregar:'],
        [''],
        ['SKU', 'Operación', 'Cantidad', 'Costo', 'Precio', 'Proveedor', 'Factura', 'Vencimiento', 'Lote', 'Ubicación', 'Origen', 'Fecha', 'Responsable', 'Notas'],
        ['prod_rc_medium_15kg', 'Purchase', 50, 315000, '', 'PROV-001', 'FAC-001-0012345', '2026-08-20', 'RC2025-A08', 'ALM-01', '', '2024-12-20', 'Admin', 'Pedido mensual diciembre'],
        [''],
        ['💡 El costo promedio ponderado (WAC) se recalculará automáticamente'],
        [''],
        [SECTION_SEPARATOR],
        ['⚖️ EJEMPLO 5: AJUSTE DE INVENTARIO POR CONTEO'],
        [SECTION_SEPARATOR],
        [''],
        ['Situación: Al hacer inventario físico, encontraste 3 collares menos de lo que dice el sistema'],
        [''],
        ['SKU', 'Operación', 'Cantidad', 'Costo', 'Precio', 'Proveedor', 'Factura', 'Vencimiento', 'Lote', 'Ubicación', 'Origen', 'Fecha', 'Responsable', 'Notas'],
        ['prod_collar_nylon_m', 'Adjustment', -3, '', '', '', '', '', '', 'ALM-04', '', '2024-12-15', 'Inventario', 'Diferencia detectada en conteo físico trimestral'],
        [''],
        [SECTION_SEPARATOR],
        ['🔄 EJEMPLO 6: TRASLADO ENTRE UBICACIONES'],
        [SECTION_SEPARATOR],
        [''],
        ['Situación: Necesitas mover 10 unidades de un producto del almacén a la tienda'],
        [''],
        ['SKU', 'Operación', 'Cantidad', 'Costo', 'Precio', 'Proveedor', 'Factura', 'Vencimiento', 'Lote', 'Ubicación Destino', 'Ubicación Origen', 'Fecha', 'Responsable', 'Notas'],
        ['prod_juguete_kong_m', 'Transfer', 10, '', '', '', '', '', '', 'ALM-04', 'ALM-01', '2024-12-18', 'Admin', 'Reposición para tienda'],
        [''],
        [SECTION_SEPARATOR],
        ['💲 EJEMPLO 7: CONFIGURAR PRECIOS POR VOLUMEN'],
        [SECTION_SEPARATOR],
        [''],
        ['Situación: Quieres ofrecer descuentos por cantidad en un producto'],
        [''],
        ['Ir a la hoja "💲 Precios por Cantidad":'],
        [''],
        ['SKU', 'Nombre', 'Min', 'Max', 'Precio', 'Desc%', 'Cliente', 'Desde', 'Hasta', 'Activo'],
        ['prod_vacuna_octuple', 'Vacuna Óctuple', 1, 4, 95000, 0, 'Todos', '', '', 'SI'],
        ['prod_vacuna_octuple', 'Vacuna Óctuple', 5, 9, 85500, 10, 'Todos', '', '', 'SI'],
        ['prod_vacuna_octuple', 'Vacuna Óctuple', 10, 999, 76000, 20, 'Todos', '', '', 'SI'],
        [''],
        ['Resultado: Comprando 1-4 unidades paga Gs. 95.000 c/u'],
        ['          Comprando 5-9 unidades paga Gs. 85.500 c/u (10% desc)'],
        ['          Comprando 10+ unidades paga Gs. 76.000 c/u (20% desc)'],
        [''],
    ];

    const wsExamples = XLSX.utils.aoa_to_sheet(examplesData);
    wsExamples['!cols'] = [
        { wch: 28 }, { wch: 18 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 15 }, { wch: 18 }, { wch: 14 },
        { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 14 },
        { wch: 14 }, { wch: 45 }
    ];

    // ========================================================================
    // SHEET 13: ⚡ Importación Rápida
    // ========================================================================
    const quickImportData = [
        [''],
        [TITLE_SEPARATOR],
        ['⚡ IMPORTACIÓN RÁPIDA - FORMATO SIMPLIFICADO'],
        [TITLE_SEPARATOR],
        ['Para carga rápida cuando solo necesitas los campos básicos.'],
        ['Ideal para: pequeñas compras, ajustes rápidos, o si no necesitas todos los detalles.'],
        [''],
        [
            '⭐ Operación ▼',
            'SKU (vacío = nuevo)',
            'Nombre Producto',
            'Categoría',
            'Marca',
            '⭐ Cantidad',
            'Costo Unitario',
            'Precio Venta',
            'Proveedor',
            'Notas'
        ],
        [''],
        // Pre-filled examples
        ['New Product', '', 'Producto Nuevo Ejemplo', 'CAT-001', 'RC', 10, 50000, 75000, 'PROV-001', 'Producto de prueba'],
        ['Purchase', 'prod_existente_123', '', '', '', 25, 48000, '', 'PROV-002', 'Compra regular'],
        ['Adjustment', 'prod_existente_456', '', '', '', -2, '', '', '', 'Ajuste por conteo'],
        ['Price Update', 'prod_existente_789', '', '', '', 0, '', 95000, '', 'Nuevo precio'],
        ['Damage', 'prod_existente_abc', '', '', '', -1, '', '', '', 'Empaque dañado'],
        ['', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', ''],
        [''],
    ];

    const wsQuickImport = XLSX.utils.aoa_to_sheet(quickImportData);
    wsQuickImport['!cols'] = [
        { wch: 14 }, { wch: 22 }, { wch: 30 }, { wch: 15 },
        { wch: 10 }, { wch: 12 }, { wch: 18 }, { wch: 18 },
        { wch: 15 }, { wch: 35 }
    ];

    // ========================================================================
    // Add all sheets to workbook
    // ========================================================================
    XLSX.utils.book_append_sheet(workbook, wsInstructions, '📖 Instrucciones');
    XLSX.utils.book_append_sheet(workbook, wsConfig, '🏢 Configuración');
    XLSX.utils.book_append_sheet(workbook, wsCategories, '📂 Categorías');
    XLSX.utils.book_append_sheet(workbook, wsSuppliers, '🏭 Proveedores');
    XLSX.utils.book_append_sheet(workbook, wsUnits, '📏 Unidades');
    XLSX.utils.book_append_sheet(workbook, wsTaxes, '💰 Impuestos');
    XLSX.utils.book_append_sheet(workbook, wsBrands, '🏷️ Marcas');
    XLSX.utils.book_append_sheet(workbook, wsLocations, '📍 Ubicaciones');
    XLSX.utils.book_append_sheet(workbook, wsProducts, '🆕 Productos');
    XLSX.utils.book_append_sheet(workbook, wsMovements, '📦 Movimientos');
    XLSX.utils.book_append_sheet(workbook, wsVolumePricing, '💲 Precios Volumen');
    XLSX.utils.book_append_sheet(workbook, wsExamples, '📚 Ejemplos');
    XLSX.utils.book_append_sheet(workbook, wsQuickImport, '⚡ Importación Rápida');

    // Write to file
    const outputPath = path.join(process.cwd(), 'inventory_template_vete.xlsx');
    XLSX.writeFile(workbook, outputPath);

    console.log('');
    console.log(TITLE_SEPARATOR);
    console.log('✅ PLANTILLA DE INVENTARIO GENERADA EXITOSAMENTE');
    console.log(TITLE_SEPARATOR);
    console.log('');
    console.log(`📁 Archivo: ${outputPath}`);
    console.log('');
    console.log('📊 HOJAS INCLUIDAS (13 total):');
    console.log('');
    console.log('   📖 Instrucciones      → Guía completa de uso');
    console.log('   🏢 Configuración      → Datos de la clínica');
    console.log('   📂 Categorías         → Jerarquía de 3 niveles con 70+ categorías pre-cargadas');
    console.log('   🏭 Proveedores        → Directorio completo de proveedores');
    console.log('   📏 Unidades           → 25+ unidades de medida pre-cargadas');
    console.log('   💰 Impuestos          → Configuración de IVA');
    console.log('   🏷️ Marcas             → 18+ marcas populares pre-cargadas');
    console.log('   📍 Ubicaciones        → Zonas de almacenamiento');
    console.log('   🆕 Productos          → Catálogo con 50+ campos por producto');
    console.log('   📦 Movimientos        → Registro de stock con 14 campos');
    console.log('   💲 Precios Volumen    → Descuentos por cantidad');
    console.log('   📚 Ejemplos           → 7 ejemplos prácticos detallados');
    console.log('   ⚡ Importación Rápida → Formato simplificado');
    console.log('');
    console.log(SECTION_SEPARATOR);
    console.log('🚀 PRÓXIMOS PASOS PARA SUBIR A GOOGLE SHEETS:');
    console.log(SECTION_SEPARATOR);
    console.log('');
    console.log('   1. Abrir https://drive.google.com');
    console.log('   2. Arrastrar el archivo .xlsx o Nuevo → Subir archivo');
    console.log('   3. Click derecho → "Abrir con" → "Hojas de cálculo de Google"');
    console.log('   4. Archivo → Compartir → "Cualquiera con el enlace" → "Lector"');
    console.log('   5. Copiar URL y agregar "/copy" al final');
    console.log('');
    console.log('   Formato final del URL:');
    console.log('   https://docs.google.com/spreadsheets/d/TU_ID/copy');
    console.log('');
    console.log('   6. Actualizar config.json con el nuevo URL');
    console.log('');
    console.log(TITLE_SEPARATOR);
}

generateTemplate();
