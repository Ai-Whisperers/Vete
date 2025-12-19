/**
 * Google Sheets Inventory Template - Configuration
 * Centralized constants, colors, and sheet definitions
 */

// Default spreadsheet ID - can be overridden via environment
export const SPREADSHEET_ID = process.env.GSHEET_ID || '15hPrnWt0VcLAJkC2s2l-g5PLbM4Fe8e6KAsaSZUF6uk';

// Professional veterinary color palette
export const COLORS = {
  // Primary brand colors
  primary: { red: 0.157, green: 0.545, blue: 0.506 },      // #289082 - Teal
  primaryDark: { red: 0.118, green: 0.412, blue: 0.384 },  // #1E6962 - Dark teal
  primaryLight: { red: 0.878, green: 0.949, blue: 0.941 }, // #E0F2F0 - Light teal

  // Accent colors
  accent: { red: 0.984, green: 0.714, blue: 0.322 },       // #FBB652 - Amber
  accentLight: { red: 1, green: 0.953, blue: 0.878 },      // #FFF3E0 - Light amber

  // Status colors
  success: { red: 0.263, green: 0.627, blue: 0.278 },      // #43A047 - Green
  successLight: { red: 0.91, green: 0.961, blue: 0.914 },  // #E8F5E9 - Light green
  warning: { red: 0.976, green: 0.659, blue: 0.145 },      // #F9A825 - Yellow
  warningLight: { red: 1, green: 0.973, blue: 0.882 },     // #FFFDE1 - Light yellow
  error: { red: 0.898, green: 0.224, blue: 0.208 },        // #E53935 - Red
  errorLight: { red: 1, green: 0.922, blue: 0.933 },       // #FFEBEE - Light red

  // Neutral colors
  white: { red: 1, green: 1, blue: 1 },
  lightGray: { red: 0.969, green: 0.969, blue: 0.969 },    // #F7F7F7
  mediumGray: { red: 0.878, green: 0.878, blue: 0.878 },   // #E0E0E0
  darkGray: { red: 0.38, green: 0.38, blue: 0.38 },        // #616161
  black: { red: 0.129, green: 0.129, blue: 0.129 },        // #212121

  // Sheet-specific header colors
  guideHeader: { red: 0.157, green: 0.545, blue: 0.506 },    // Teal
  categoryHeader: { red: 0.282, green: 0.471, blue: 0.855 }, // Blue
  providerHeader: { red: 0.608, green: 0.349, blue: 0.714 }, // Purple
  brandHeader: { red: 0.937, green: 0.325, blue: 0.314 },    // Coral
  productHeader: { red: 0.157, green: 0.545, blue: 0.506 },  // Teal
  stockHeader: { red: 0.984, green: 0.549, blue: 0.235 },    // Orange
  configHeader: { red: 0.475, green: 0.333, blue: 0.282 },   // Brown
  quickHeader: { red: 0.263, green: 0.627, blue: 0.278 },    // Green

  // For conditional formatting
  lightBlue: { red: 0.929, green: 0.949, blue: 0.969 },
} as const;

// Sheet definitions with all metadata
export interface SheetConfig {
  name: string;
  headerColor: typeof COLORS[keyof typeof COLORS];
  columns: string[];
  dataRows: number;
  frozenRows?: number;
  frozenCols?: number;
}

export const SHEETS: SheetConfig[] = [
  {
    name: '📖 Guía Rápida',
    headerColor: COLORS.guideHeader,
    columns: ['', '', '', '', '', '', ''],  // 7 columns for horizontal layout
    dataRows: 40,  // Compact horizontal layout
    frozenRows: 0,
  },
  {
    name: '📂 Categorías',
    headerColor: COLORS.categoryHeader,
    columns: ['🔒 Código', 'Nombre', 'Nivel', 'Categoría Padre', 'Activo'],
    dataRows: 100,
  },
  {
    // PROVEEDORES: Can be global (platform) or local (clinic-specific)
    name: '🏭 Proveedores',
    headerColor: COLORS.providerHeader,
    columns: [
      '🔒 Código', 'Nombre', 'Razón Social', 'RUC',
      'Tipo', 'Teléfono', 'Email', 'Condiciones Pago',
      'Días Entrega', 'Notas', 'Activo'
    ],
    dataRows: 100,
  },
  {
    name: '🏷️ Marcas',
    headerColor: COLORS.brandHeader,
    columns: ['🔒 Código', 'Nombre', 'País', 'Activo'],
    dataRows: 100,
  },
  {
    // CATÁLOGO MASTER (B2B): Todos los productos disponibles en el mercado
    // Dual-unit inventory: Buy in boxes, sell by pill
    // Precios de referencia del proveedor, NO precios de venta de la clínica
    name: '🆕 Productos',
    headerColor: COLORS.productHeader,
    columns: [
      '🔒 SKU', 'Nombre', 'Categoría', 'Marca',
      'Unid. Compra', 'Cant. Contenida', 'Unid. Venta',
      'Precio Compra', '💹 Costo Unit.',
      'Proveedor', 'Especies', 'Receta', 'Descripción', 'Activo'
    ],
    dataRows: 500,
  },
  {
    // PRODUCTOS DE LA CLÍNICA: Solo los que la clínica tiene en stock
    // Cada clínica define su propio precio de venta y stock
    name: '📋 Mis Productos',
    headerColor: COLORS.quickHeader,
    columns: [
      'Producto', 'Precio Venta', '📊 Margen %',
      'Stock Mín.', 'Stock Inicial', 'Ubicación',
      'Requiere Receta', 'Activo'
    ],
    dataRows: 500,
  },
  {
    // MOVIMIENTOS DE STOCK: Compras, ventas, ajustes
    name: '📦 Movimientos Stock',
    headerColor: COLORS.stockHeader,
    columns: ['Producto', 'Operación', 'Cantidad', 'Costo Unit.', 'Fecha', 'Ubicación', 'Notas'],
    dataRows: 500,
  },
  {
    name: '⚙️ Configuración',
    headerColor: COLORS.configHeader,
    columns: ['Código', 'Ubicación', 'Descripción', 'Activo'],
    dataRows: 30,
    frozenRows: 1,
  },
  {
    // HOJA AUXILIAR: Listas filtradas para dropdowns
    name: '🔧 Datos',
    headerColor: COLORS.darkGray,
    columns: ['Categorías', 'Marcas', 'Proveedores', 'Productos Catálogo', 'Mis Productos', 'Ubicaciones'],
    dataRows: 500,
    frozenRows: 1,
  },
];

// Stock operation types with colors
export const STOCK_OPERATIONS = [
  { value: 'Compra', color: COLORS.successLight },
  { value: 'Venta', color: COLORS.errorLight },
  { value: 'Ajuste', color: COLORS.warningLight },
  { value: 'Daño', color: COLORS.errorLight },
  { value: 'Vencido', color: COLORS.errorLight },
  { value: 'Devolución', color: COLORS.successLight },
  { value: 'Traslado', color: COLORS.lightBlue },
] as const;

// Common dropdown options
export const DROPDOWN_OPTIONS = {
  yesNo: ['Sí', 'No'],
  levels: ['1', '2', '3'],
  providerTypes: ['Productos', 'Servicios', 'Ambos'],

  // Unidades de COMPRA (cómo llega la factura del proveedor)
  // Must match CHECK constraint in store_products.purchase_unit
  unitsBuy: ['Unidad', 'Caja', 'Pack', 'Bolsa', 'Frasco', 'Bulto', 'Display', 'Blister', 'Paquete', 'Kg', 'L'],

  // Unidades de VENTA (cómo se vende al cliente)
  // Must match CHECK constraint in store_products.sale_unit
  unitsSell: ['Unidad', 'Tableta', 'Ampolla', 'ml', 'g', 'Kg', 'Dosis', 'Aplicación', 'Bolsa', 'Frasco', 'Caja'],

  // Mantener units para compatibilidad con otras hojas
  units: ['Unidad', 'Caja', 'Paquete', 'Kg', 'g', 'L', 'ml', 'Bolsa', 'Frasco', 'Ampolla'],

  // Species for product targeting
  species: ['Perro', 'Gato', 'Perro y Gato', 'Aves', 'Roedores', 'Reptiles', 'Equinos', 'Bovinos', 'Todos'],

  // Payment terms for suppliers
  paymentTerms: ['Contado', '15 días', '30 días', '60 días', '90 días'],

  operations: STOCK_OPERATIONS.map(op => op.value),
} as const;

// Helper to get sheet by name
export function getSheetConfig(name: string): SheetConfig | undefined {
  return SHEETS.find(s => s.name === name);
}
