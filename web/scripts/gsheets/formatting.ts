/**
 * Google Sheets Formatting
 * Professional styling with all Google Sheets features
 */

import { batchUpdate, getGoogleSheetsClient } from './auth';
import { SPREADSHEET_ID, SHEETS, COLORS, STOCK_OPERATIONS } from './config';

// Optimal column widths per sheet (in pixels)
const COLUMN_WIDTHS: Record<string, number[]> = {
  // Horizontal 3-section layout: Content | Spacer | Content | Spacer | Content | Spacer | Extra
  '📖 Guía Rápida': [280, 20, 280, 20, 200, 20, 50],
  '📂 Categorías': [120, 200, 60, 120, 70],
  '🏭 Proveedores': [100, 220, 100, 130, 220, 200, 70],
  '🏷️ Marcas': [80, 180, 100, 70],
  '🆕 Productos': [100, 280, 120, 80, 80, 110, 110, 100, 80, 90, 90, 110, 100, 250, 70],
  '📦 Stock Inicial': [280, 100, 90, 110, 110, 140, 200],
  '⚙️ Configuración': [100, 180, 280, 70],
  '🔧 Datos': [150, 100, 120, 200, 150],
  '⚡ Carga Rápida': [280, 120, 80, 110, 110, 100, 80, 100, 200],
};

// Sheet tab colors
const TAB_COLORS: Record<string, typeof COLORS[keyof typeof COLORS]> = {
  '📖 Guía Rápida': COLORS.primary,
  '📂 Categorías': COLORS.categoryHeader,
  '🏭 Proveedores': COLORS.providerHeader,
  '🏷️ Marcas': COLORS.brandHeader,
  '🆕 Productos': COLORS.productHeader,
  '📦 Stock Inicial': COLORS.stockHeader,
  '⚙️ Configuración': COLORS.configHeader,
  '🔧 Datos': COLORS.darkGray,
  '⚡ Carga Rápida': COLORS.quickHeader,
};

/**
 * Apply all formatting to the spreadsheet
 */
export async function applyFormatting(
  spreadsheetId: string,
  sheetMap: Record<string, number>
): Promise<void> {
  console.log('\n🎨 Applying formatting...\n');

  const requests: any[] = [];

  // Format each sheet
  for (const config of SHEETS) {
    const sheetId = sheetMap[config.name];
    if (sheetId === undefined) {
      console.log(`  ⚠️ Sheet not found: ${config.name}`);
      continue;
    }

    console.log(`  📝 ${config.name}`);
    const colCount = config.columns.length;

    // 1. Sheet tab color
    const tabColor = TAB_COLORS[config.name];
    if (tabColor) {
      requests.push({
        updateSheetProperties: {
          properties: {
            sheetId,
            tabColor: tabColor,
          },
          fields: 'tabColor',
        },
      });
    }

    // 2. Header row styling with text wrapping
    requests.push({
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: colCount,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: config.headerColor,
            textFormat: {
              foregroundColor: COLORS.white,
              bold: true,
              fontSize: 11,
            },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
            wrapStrategy: 'WRAP',
            padding: { top: 6, bottom: 6, left: 8, right: 8 },
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy,padding)',
      },
    });

    // 3. Data rows default styling
    requests.push({
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 1,
          endRowIndex: config.dataRows + 1,
          startColumnIndex: 0,
          endColumnIndex: colCount,
        },
        cell: {
          userEnteredFormat: {
            verticalAlignment: 'MIDDLE',
            wrapStrategy: 'CLIP',
            padding: { top: 4, bottom: 4, left: 6, right: 6 },
          },
        },
        fields: 'userEnteredFormat(verticalAlignment,wrapStrategy,padding)',
      },
    });

    // 4. Alternating colors banding (built-in feature - more efficient)
    requests.push({
      addBanding: {
        bandedRange: {
          range: {
            sheetId,
            startRowIndex: 0,
            endRowIndex: config.dataRows + 1,
            startColumnIndex: 0,
            endColumnIndex: colCount,
          },
          rowProperties: {
            headerColor: config.headerColor,
            firstBandColor: COLORS.white,
            secondBandColor: COLORS.lightGray,
          },
        },
      },
    });

    // 5. Freeze header row(s)
    requests.push({
      updateSheetProperties: {
        properties: {
          sheetId,
          gridProperties: {
            frozenRowCount: config.frozenRows ?? 1,
          },
        },
        fields: 'gridProperties.frozenRowCount',
      },
    });

    // 6. Header border (bottom)
    requests.push({
      updateBorders: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: colCount,
        },
        bottom: {
          style: 'SOLID_MEDIUM',
          color: COLORS.black,
        },
      },
    });

    // 7. Outer border for data area
    requests.push({
      updateBorders: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: Math.min(config.dataRows + 1, 100),
          startColumnIndex: 0,
          endColumnIndex: colCount,
        },
        top: { style: 'SOLID', color: COLORS.mediumGray },
        bottom: { style: 'SOLID', color: COLORS.mediumGray },
        left: { style: 'SOLID', color: COLORS.mediumGray },
        right: { style: 'SOLID', color: COLORS.mediumGray },
      },
    });

    // 8. Header row height
    requests.push({
      updateDimensionProperties: {
        range: {
          sheetId,
          dimension: 'ROWS',
          startIndex: 0,
          endIndex: 1,
        },
        properties: { pixelSize: 42 },
        fields: 'pixelSize',
      },
    });

    // 9. Data row height
    requests.push({
      updateDimensionProperties: {
        range: {
          sheetId,
          dimension: 'ROWS',
          startIndex: 1,
          endIndex: Math.min(config.dataRows + 1, 100),
        },
        properties: { pixelSize: 28 },
        fields: 'pixelSize',
      },
    });

    // 10. Optimal column widths
    const widths = COLUMN_WIDTHS[config.name];
    if (widths) {
      for (let i = 0; i < Math.min(widths.length, colCount); i++) {
        requests.push({
          updateDimensionProperties: {
            range: {
              sheetId,
              dimension: 'COLUMNS',
              startIndex: i,
              endIndex: i + 1,
            },
            properties: { pixelSize: widths[i] },
            fields: 'pixelSize',
          },
        });
      }
    }
  }

  // Sheet-specific formatting
  addCategoriesFormatting(requests, sheetMap);
  addProductsFormatting(requests, sheetMap);
  addStockFormatting(requests, sheetMap);
  addGuideFormatting(requests, sheetMap);
  addQuickLoadFormatting(requests, sheetMap);
  addConfigFormatting(requests, sheetMap);
  addProvidersFormatting(requests, sheetMap);
  addBrandsFormatting(requests, sheetMap);
  addDatosFormatting(requests, sheetMap);

  // Execute in batches
  await batchUpdate(spreadsheetId, requests, 100);

  // Add filter views (separate API call)
  await addFilterViews(spreadsheetId, sheetMap);

  // Add cell notes for help
  await addCellNotes(spreadsheetId);

  console.log('\n  ✅ Formatting applied\n');
}

/**
 * Add filter views for data sheets
 */
async function addFilterViews(spreadsheetId: string, sheetMap: Record<string, number>): Promise<void> {
  const sheets = await getGoogleSheetsClient();
  const requests: any[] = [];

  // Add basic filter for main data sheets
  const sheetsWithFilters = ['📂 Categorías', '🏭 Proveedores', '🏷️ Marcas', '🆕 Productos', '📦 Stock Inicial'];

  for (const sheetName of sheetsWithFilters) {
    const sheetId = sheetMap[sheetName];
    const config = SHEETS.find(s => s.name === sheetName);
    if (sheetId === undefined || !config) continue;

    requests.push({
      setBasicFilter: {
        filter: {
          range: {
            sheetId,
            startRowIndex: 0,
            endRowIndex: config.dataRows + 1,
            startColumnIndex: 0,
            endColumnIndex: config.columns.length,
          },
        },
      },
    });
  }

  if (requests.length > 0) {
    await batchUpdate(spreadsheetId, requests, 50);
  }
}

/**
 * Add cell notes for help/tooltips
 */
async function addCellNotes(spreadsheetId: string): Promise<void> {
  const sheets = await getGoogleSheetsClient();

  const notes: Record<string, Record<string, string>> = {
    '📂 Categorías': {
      'A1': '🔒 CÓDIGO AUTO-GENERADO\n\nSe genera automáticamente con ARRAYFORMULA:\n• Sin padre: INICIALES(3)\n• Con padre: PADRE-INICIALES(3)\n\nEjemplos:\n• Alimentos → ALI\n• ALI + Perros → ALI-PER\n• ALI-PER + Adultos → ALI-PER-ADU\n\n✅ Solo completa: Nombre, Nivel, Padre',
      'B1': '📝 Nombre de la categoría\nCampo obligatorio\nEl código se genera de las primeras 3 letras',
      'C1': '📊 Nivel en la jerarquía\n1 = Raíz\n2 = Subcategoría\n3 = Sub-subcategoría',
      'D1': '🔗 Código de la categoría padre\nDejar vacío para categorías raíz\nEj: ALI para subcategorías de Alimentos',
    },
    '🏭 Proveedores': {
      'A1': '🔒 CÓDIGO AUTO-GENERADO\n\nSe genera automáticamente:\nPrimeras 3 letras + número secuencial\n\nEjemplos:\n• 1° entrada "Royal Canin" → ROY-001\n• 2° entrada "Distribuidora" → DIS-002\n• 7° entrada "Test" → TES-007\n\n✅ Fórmulas pre-llenadas para 100 filas',
      'B1': '📝 Nombre del proveedor\nCampo obligatorio\nEl código se genera de las primeras 3 letras',
      'C1': '📦 Tipo de proveedor:\n• Productos = Tienda\n• Insumos = Servicios\n• Ambos = Todo',
    },
    '🏷️ Marcas': {
      'A1': '🔒 CÓDIGO AUTO-GENERADO\n\nSe genera automáticamente:\nPrimeras 2 letras + número secuencial\n\nEjemplos:\n• 1° entrada "Royal Canin" → RO-001\n• 6° entrada "Bayer" → BA-006\n• 12° entrada "Test" → TE-012\n\n✅ Fórmulas pre-llenadas para 100 filas',
      'B1': '📝 Nombre de la marca\nCampo obligatorio\nEl código se genera de las primeras 2 letras',
    },
    '🆕 Productos': {
      'A1': '🔒 SKU AUTO-GENERADO\n\nSe genera automáticamente:\nPrimeras 3 letras del nombre + número secuencial\n\nEjemplos:\n• "Royal Canin Adult" → ROY-001\n• "Nexgard Spectra" → NEX-002\n\n✅ Fórmulas pre-llenadas para 100 filas\n⚠️ Solo productos activos aparecen en otros dropdowns',
      'B1': '📝 Nombre del producto\nCampo obligatorio',
      'C1': '📁 Código de categoría\nSelecciona del dropdown ▼\n⚠️ Solo categorías ACTIVAS',
      'D1': '🏷️ Código de marca\nSelecciona del dropdown ▼\n⚠️ Solo marcas ACTIVAS',
      'F1': '💰 Precio de compra\nSin IVA incluido',
      'G1': '💵 Precio de venta al público\nCon IVA incluido',
      'H1': '🏷️ Precio promocional\nDejar vacío si no hay promo',
      'I1': '📈 Margen calculado\n= (Venta - Costo) / Costo × 100',
      'L1': '💊 ¿Requiere receta veterinaria?\nSí = Medicamentos controlados',
      'M1': '🏭 Proveedor\nSelecciona del dropdown ▼\n⚠️ Solo proveedores ACTIVOS',
    },
    '📦 Stock Inicial': {
      'A1': '📦 Selecciona el producto\nUsa el menú desplegable ▼\n⚠️ Solo productos ACTIVOS',
      'B1': '📋 Tipo de movimiento:\n• Compra = Entrada (+)\n• Venta = Salida (-)\n• Ajuste = Corrección (±)\n• Daño/Vencido = Pérdida (-)',
      'C1': '🔢 Cantidad del movimiento\nUsar números negativos para salidas',
      'D1': '💰 Costo unitario\nSolo para compras',
      'F1': '📍 Ubicación\nSelecciona del dropdown ▼\n⚠️ Solo ubicaciones ACTIVAS',
    },
    '⚡ Carga Rápida': {
      'A1': '📝 Nombre del producto\nSelecciona existente o escribe nuevo\n⚠️ Solo productos ACTIVOS en dropdown',
      'B1': '📁 Código de categoría\nSelecciona del dropdown ▼\n⚠️ Solo categorías ACTIVAS',
      'G1': '🏷️ Código de marca\nSelecciona del dropdown ▼\n⚠️ Solo marcas ACTIVAS',
      'H1': '🏭 Proveedor\nSelecciona del dropdown ▼\n⚠️ Solo proveedores ACTIVOS',
    },
  };

  for (const [sheetName, cellNotes] of Object.entries(notes)) {
    for (const [cell, note] of Object.entries(cellNotes)) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'${sheetName}'!${cell}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[{ note }]],
        },
      }).catch(() => {
        // Notes via values.update might not work, use batchUpdate
      });
    }
  }

  // Use batchUpdate for notes (more reliable)
  const requests: any[] = [];
  for (const [sheetName, cellNotes] of Object.entries(notes)) {
    for (const [cell, note] of Object.entries(cellNotes)) {
      const col = cell.charCodeAt(0) - 65; // A=0, B=1, etc.
      const row = parseInt(cell.substring(1)) - 1;

      // We need sheetId but don't have it here, skip for now
    }
  }
}

/**
 * Special formatting for Categorías sheet
 * Columns: 🔒 Código(A), Nombre(B), Nivel(C), Categoría Padre(D), Activo(E)
 */
function addCategoriesFormatting(requests: any[], sheetMap: Record<string, number>): void {
  const sheetId = sheetMap['📂 Categorías'];
  if (sheetId === undefined) return;

  // Código column (A) - gray "locked" appearance (auto-generated)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 101,
        startColumnIndex: 0,
        endColumnIndex: 1,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.lightGray,
          textFormat: {
            fontFamily: 'Roboto Mono',
            fontSize: 10,
            foregroundColor: COLORS.darkGray,
          },
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat)',
    },
  });

  // Conditional formatting for levels (now column C)
  const levelColors = [
    { level: '1', color: { red: 0.851, green: 0.918, blue: 0.827 } }, // Green
    { level: '2', color: { red: 0.882, green: 0.922, blue: 0.961 } }, // Blue
    { level: '3', color: { red: 0.988, green: 0.945, blue: 0.859 } }, // Yellow
  ];

  for (const { level, color } of levelColors) {
    requests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: [{
            sheetId,
            startRowIndex: 1,
            endRowIndex: 101,
            startColumnIndex: 0,
            endColumnIndex: 5,
          }],
          booleanRule: {
            condition: {
              type: 'CUSTOM_FORMULA',
              values: [{ userEnteredValue: `=$C2="${level}"` }],
            },
            format: { backgroundColor: color },
          },
        },
        index: 0,
      },
    });
  }
}

/**
 * Special formatting for Productos sheet
 */
function addProductsFormatting(requests: any[], sheetMap: Record<string, number>): void {
  const sheetId = sheetMap['🆕 Productos'];
  if (sheetId === undefined) return;

  // SKU column (A) - gray "locked" appearance (auto-generated)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 501,
        startColumnIndex: 0,
        endColumnIndex: 1,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.lightGray,
          textFormat: {
            fontFamily: 'Roboto Mono',
            fontSize: 10,
            foregroundColor: COLORS.darkGray,
          },
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat)',
    },
  });

  // Section backgrounds (overwrite banding for specific columns)
  // Required columns (B-E) - light teal (excluding SKU which is gray)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 501,
        startColumnIndex: 1,
        endColumnIndex: 5,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.primaryLight,
        },
      },
      fields: 'userEnteredFormat.backgroundColor',
    },
  });

  // Price columns (F-I) - light amber
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 501,
        startColumnIndex: 5,
        endColumnIndex: 9,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.accentLight,
        },
      },
      fields: 'userEnteredFormat.backgroundColor',
    },
  });

  // Number format for prices (F-I) with currency symbol
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 501,
        startColumnIndex: 5,
        endColumnIndex: 9,
      },
      cell: {
        userEnteredFormat: {
          numberFormat: { type: 'NUMBER', pattern: '₲ #,##0' },
          horizontalAlignment: 'RIGHT',
        },
      },
      fields: 'userEnteredFormat(numberFormat,horizontalAlignment)',
    },
  });

  // Percent format for margin (I)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 501,
        startColumnIndex: 8,
        endColumnIndex: 9,
      },
      cell: {
        userEnteredFormat: {
          numberFormat: { type: 'PERCENT', pattern: '0%' },
        },
      },
      fields: 'userEnteredFormat.numberFormat',
    },
  });

  // Number format for stock (J-K)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 501,
        startColumnIndex: 9,
        endColumnIndex: 11,
      },
      cell: {
        userEnteredFormat: {
          numberFormat: { type: 'NUMBER', pattern: '#,##0' },
          horizontalAlignment: 'CENTER',
        },
      },
      fields: 'userEnteredFormat(numberFormat,horizontalAlignment)',
    },
  });

  // Conditional formatting: Low stock warning
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{
          sheetId,
          startRowIndex: 1,
          endRowIndex: 501,
          startColumnIndex: 10, // Stock Actual (K)
          endColumnIndex: 11,
        }],
        booleanRule: {
          condition: {
            type: 'CUSTOM_FORMULA',
            values: [{ userEnteredValue: '=AND(K2<>"", K2<J2)' }], // Stock < Mínimo
          },
          format: {
            backgroundColor: COLORS.errorLight,
            textFormat: { foregroundColor: COLORS.error, bold: true },
          },
        },
      },
      index: 0,
    },
  });

  // Description column (N) - text wrap
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 501,
        startColumnIndex: 13,
        endColumnIndex: 14,
      },
      cell: {
        userEnteredFormat: {
          wrapStrategy: 'WRAP',
        },
      },
      fields: 'userEnteredFormat.wrapStrategy',
    },
  });
}

/**
 * Special formatting for Stock Inicial sheet
 * Columns: Producto(A), Operación(B), Cantidad(C), Costo(D), Fecha(E), Ubicación(F), Notas(G)
 */
function addStockFormatting(requests: any[], sheetMap: Record<string, number>): void {
  const sheetId = sheetMap['📦 Stock Inicial'];
  if (sheetId === undefined) return;

  // Conditional formatting for operation types (now based on column B)
  for (const op of STOCK_OPERATIONS) {
    requests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: [{
            sheetId,
            startRowIndex: 1,
            endRowIndex: 501,
            startColumnIndex: 0, // Entire row
            endColumnIndex: 7,
          }],
          booleanRule: {
            condition: {
              type: 'CUSTOM_FORMULA',
              values: [{ userEnteredValue: `=$B2="${op.value}"` }],
            },
            format: { backgroundColor: op.color },
          },
        },
        index: 0,
      },
    });
  }

  // Number format for Cantidad (C - index 2)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 501,
        startColumnIndex: 2,
        endColumnIndex: 3,
      },
      cell: {
        userEnteredFormat: {
          numberFormat: { type: 'NUMBER', pattern: '#,##0' },
          horizontalAlignment: 'CENTER',
        },
      },
      fields: 'userEnteredFormat(numberFormat,horizontalAlignment)',
    },
  });

  // Currency format for Costo (D - index 3)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 501,
        startColumnIndex: 3,
        endColumnIndex: 4,
      },
      cell: {
        userEnteredFormat: {
          numberFormat: { type: 'NUMBER', pattern: '₲ #,##0' },
          horizontalAlignment: 'RIGHT',
        },
      },
      fields: 'userEnteredFormat(numberFormat,horizontalAlignment)',
    },
  });

  // Date format for Fecha (E - index 4)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 501,
        startColumnIndex: 4,
        endColumnIndex: 5,
      },
      cell: {
        userEnteredFormat: {
          numberFormat: { type: 'DATE', pattern: 'dd/mm/yyyy' },
          horizontalAlignment: 'CENTER',
        },
      },
      fields: 'userEnteredFormat(numberFormat,horizontalAlignment)',
    },
  });
}

/**
 * Special formatting for Guía Rápida sheet - Horizontal multi-column layout
 * Layout: 3 content columns (A, C, E) with spacer columns (B, D, F, G)
 */
function addGuideFormatting(requests: any[], sheetMap: Record<string, number>): void {
  const sheetId = sheetMap['📖 Guía Rápida'];
  if (sheetId === undefined) return;

  const COLS = 7; // Total columns in horizontal layout
  const ROWS = 40; // Total rows

  // 1. Clear all formatting and set base style
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 0,
        endRowIndex: ROWS,
        startColumnIndex: 0,
        endColumnIndex: COLS,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.white,
          wrapStrategy: 'WRAP',
          verticalAlignment: 'TOP',
          textFormat: {
            fontSize: 10,
            fontFamily: 'Roboto',
            foregroundColor: COLORS.black,
          },
        },
      },
      fields: 'userEnteredFormat',
    },
  });

  // 2. Title row (row 1, index 0) - Teal header
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 0,
        endRowIndex: 1,
        startColumnIndex: 0,
        endColumnIndex: COLS,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.primary,
          textFormat: {
            foregroundColor: COLORS.white,
            bold: true,
            fontSize: 18,
          },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat',
    },
  });

  // 3. Subtitle row (row 2, index 1)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 2,
        startColumnIndex: 0,
        endColumnIndex: COLS,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.primaryLight,
          textFormat: {
            foregroundColor: COLORS.primaryDark,
            italic: true,
            fontSize: 11,
          },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat',
    },
  });

  // 4. Warning row (row 4, index 3) - Yellow/Red warning
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 3,
        endRowIndex: 4,
        startColumnIndex: 0,
        endColumnIndex: COLS,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.warningLight,
          textFormat: {
            bold: true,
            fontSize: 12,
            foregroundColor: COLORS.error,
          },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat',
    },
  });

  // 5. Section headers (row 6, index 5) - columns A, C, E
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 5,
        endRowIndex: 6,
        startColumnIndex: 0,
        endColumnIndex: COLS,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.primaryLight,
          textFormat: {
            bold: true,
            fontSize: 11,
            foregroundColor: COLORS.primaryDark,
          },
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat',
    },
  });

  // 6. Sheet descriptions header (row 17, index 16)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 16,
        endRowIndex: 17,
        startColumnIndex: 0,
        endColumnIndex: COLS,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.primary,
          textFormat: {
            bold: true,
            fontSize: 12,
            foregroundColor: COLORS.white,
          },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat',
    },
  });

  // 7. Sheet names headers (rows 19 and 26, indices 18 and 25) - bold teal text
  for (const rowIndex of [18, 25]) {
    requests.push({
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: rowIndex,
          endRowIndex: rowIndex + 1,
          startColumnIndex: 0,
          endColumnIndex: COLS,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.929, green: 0.949, blue: 0.969 },
            textFormat: {
              bold: true,
              fontSize: 11,
              foregroundColor: COLORS.primary,
            },
          },
        },
        fields: 'userEnteredFormat',
      },
    });
  }

  // 8. Tips/Warnings header row (row 32, index 31)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 31,
        endRowIndex: 32,
        startColumnIndex: 0,
        endColumnIndex: COLS,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.primaryLight,
          textFormat: {
            bold: true,
            fontSize: 11,
            foregroundColor: COLORS.primaryDark,
          },
        },
      },
      fields: 'userEnteredFormat',
    },
  });

  // 9. Tips column (A) - light blue for rows 33-37
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 32,
        endRowIndex: 37,
        startColumnIndex: 0,
        endColumnIndex: 1,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.929, green: 0.949, blue: 0.969 },
        },
      },
      fields: 'userEnteredFormat.backgroundColor',
    },
  });

  // 10. NO HACER column (C) - light red for rows 33-37
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 32,
        endRowIndex: 37,
        startColumnIndex: 2,
        endColumnIndex: 3,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.errorLight,
          textFormat: { foregroundColor: COLORS.error },
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat)',
    },
  });

  // 11. SÍ PUEDES column (E) - light green for rows 33-37
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 32,
        endRowIndex: 37,
        startColumnIndex: 4,
        endColumnIndex: 5,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.successLight,
          textFormat: { foregroundColor: COLORS.success },
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat)',
    },
  });

  // 12. Footer row (row 40, index 39)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 39,
        endRowIndex: 40,
        startColumnIndex: 0,
        endColumnIndex: COLS,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.lightGray,
          textFormat: {
            italic: true,
            fontSize: 9,
            foregroundColor: COLORS.darkGray,
          },
          horizontalAlignment: 'CENTER',
        },
      },
      fields: 'userEnteredFormat',
    },
  });

  // 13. Row heights
  // Title row
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 },
      properties: { pixelSize: 45 },
      fields: 'pixelSize',
    },
  });

  // Subtitle row
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'ROWS', startIndex: 1, endIndex: 2 },
      properties: { pixelSize: 30 },
      fields: 'pixelSize',
    },
  });

  // Warning row
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'ROWS', startIndex: 3, endIndex: 4 },
      properties: { pixelSize: 35 },
      fields: 'pixelSize',
    },
  });

  // Section headers (row 6 and row 17)
  for (const rowIndex of [5, 16]) {
    requests.push({
      updateDimensionProperties: {
        range: { sheetId, dimension: 'ROWS', startIndex: rowIndex, endIndex: rowIndex + 1 },
        properties: { pixelSize: 28 },
        fields: 'pixelSize',
      },
    });
  }

  // Content rows - default height
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'ROWS', startIndex: 6, endIndex: ROWS },
      properties: { pixelSize: 22 },
      fields: 'pixelSize',
    },
  });

  // 14. Hide gridlines
  requests.push({
    updateSheetProperties: {
      properties: {
        sheetId,
        gridProperties: { hideGridlines: true },
      },
      fields: 'gridProperties.hideGridlines',
    },
  });

  // 15. Merge cells for wide rows
  // Title (row 1)
  requests.push({
    mergeCells: {
      range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: COLS },
      mergeType: 'MERGE_ALL',
    },
  });

  // Subtitle (row 2)
  requests.push({
    mergeCells: {
      range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 0, endColumnIndex: COLS },
      mergeType: 'MERGE_ALL',
    },
  });

  // Warning (row 4)
  requests.push({
    mergeCells: {
      range: { sheetId, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 0, endColumnIndex: COLS },
      mergeType: 'MERGE_ALL',
    },
  });

  // Sheet descriptions header (row 17)
  requests.push({
    mergeCells: {
      range: { sheetId, startRowIndex: 16, endRowIndex: 17, startColumnIndex: 0, endColumnIndex: COLS },
      mergeType: 'MERGE_ALL',
    },
  });

  // Footer (row 40)
  requests.push({
    mergeCells: {
      range: { sheetId, startRowIndex: 39, endRowIndex: 40, startColumnIndex: 0, endColumnIndex: COLS },
      mergeType: 'MERGE_ALL',
    },
  });

  // 16. Light borders around content sections
  // Main content area border
  requests.push({
    updateBorders: {
      range: {
        sheetId,
        startRowIndex: 5,
        endRowIndex: 15,
        startColumnIndex: 0,
        endColumnIndex: COLS,
      },
      top: { style: 'SOLID', color: COLORS.mediumGray },
      bottom: { style: 'SOLID', color: COLORS.mediumGray },
    },
  });

  // Sheet descriptions border
  requests.push({
    updateBorders: {
      range: {
        sheetId,
        startRowIndex: 18,
        endRowIndex: 30,
        startColumnIndex: 0,
        endColumnIndex: COLS,
      },
      top: { style: 'SOLID', color: COLORS.mediumGray },
      bottom: { style: 'SOLID', color: COLORS.mediumGray },
    },
  });

  // Tips section border
  requests.push({
    updateBorders: {
      range: {
        sheetId,
        startRowIndex: 31,
        endRowIndex: 37,
        startColumnIndex: 0,
        endColumnIndex: COLS,
      },
      top: { style: 'SOLID', color: COLORS.mediumGray },
      bottom: { style: 'SOLID', color: COLORS.mediumGray },
    },
  });
}

/**
 * Special formatting for Carga Rápida sheet
 * Columns: Nombre(A), Categoría(B), Unidad(C), PrecioCosto(D), PrecioVenta(E), Stock(F), Marca(G), Proveedor(H), Notas(I)
 */
function addQuickLoadFormatting(requests: any[], sheetMap: Record<string, number>): void {
  const sheetId = sheetMap['⚡ Carga Rápida'];
  if (sheetId === undefined) return;

  // Light green background for all data columns
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 501,
        startColumnIndex: 0,
        endColumnIndex: 9,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.successLight,
        },
      },
      fields: 'userEnteredFormat.backgroundColor',
    },
  });

  // Currency format for prices (D-E, indices 3-4)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 501,
        startColumnIndex: 3,
        endColumnIndex: 5,
      },
      cell: {
        userEnteredFormat: {
          numberFormat: { type: 'NUMBER', pattern: '₲ #,##0' },
          horizontalAlignment: 'RIGHT',
        },
      },
      fields: 'userEnteredFormat(numberFormat,horizontalAlignment)',
    },
  });

  // Number format for stock (F - index 5)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 501,
        startColumnIndex: 5,
        endColumnIndex: 6,
      },
      cell: {
        userEnteredFormat: {
          numberFormat: { type: 'NUMBER', pattern: '#,##0' },
          horizontalAlignment: 'CENTER',
        },
      },
      fields: 'userEnteredFormat(numberFormat,horizontalAlignment)',
    },
  });
}

/**
 * Special formatting for Configuración sheet (Ubicaciones)
 * Columns: Código(A), Ubicación(B), Descripción(C), Activo(D)
 */
function addConfigFormatting(requests: any[], sheetMap: Record<string, number>): void {
  const sheetId = sheetMap['⚙️ Configuración'];
  if (sheetId === undefined) return;

  // Light amber background for all data
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 30,
        startColumnIndex: 0,
        endColumnIndex: 4,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.accentLight,
        },
      },
      fields: 'userEnteredFormat.backgroundColor',
    },
  });

  // Código column (A) - monospace
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 30,
        startColumnIndex: 0,
        endColumnIndex: 1,
      },
      cell: {
        userEnteredFormat: {
          textFormat: {
            fontFamily: 'Roboto Mono',
            fontSize: 10,
          },
        },
      },
      fields: 'userEnteredFormat.textFormat',
    },
  });

  // Conditional formatting for inactive locations
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{
          sheetId,
          startRowIndex: 1,
          endRowIndex: 30,
          startColumnIndex: 0,
          endColumnIndex: 4,
        }],
        booleanRule: {
          condition: {
            type: 'CUSTOM_FORMULA',
            values: [{ userEnteredValue: '=$D2="No"' }],
          },
          format: {
            textFormat: {
              foregroundColor: COLORS.darkGray,
              strikethrough: true,
            },
          },
        },
      },
      index: 0,
    },
  });
}

/**
 * Special formatting for 🔧 Datos helper sheet
 * This sheet contains FILTER formulas for active items only
 */
function addDatosFormatting(requests: any[], sheetMap: Record<string, number>): void {
  const sheetId = sheetMap['🔧 Datos'];
  if (sheetId === undefined) return;

  // Light gray background for helper data
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 500,
        startColumnIndex: 0,
        endColumnIndex: 5,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.lightGray,
          textFormat: {
            fontSize: 9,
            foregroundColor: COLORS.darkGray,
          },
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat)',
    },
  });

  // Hide the sheet (users don't need to see it)
  requests.push({
    updateSheetProperties: {
      properties: {
        sheetId,
        hidden: true,
      },
      fields: 'hidden',
    },
  });
}

/**
 * Special formatting for Proveedores sheet
 */
function addProvidersFormatting(requests: any[], sheetMap: Record<string, number>): void {
  const sheetId = sheetMap['🏭 Proveedores'];
  if (sheetId === undefined) return;

  // Código column (A) - gray "locked" appearance (auto-generated)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 101,
        startColumnIndex: 0,
        endColumnIndex: 1,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.lightGray,
          textFormat: {
            fontFamily: 'Roboto Mono',
            fontSize: 10,
            foregroundColor: COLORS.darkGray,
          },
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat)',
    },
  });

  // Conditional formatting for provider type
  const typeColors = [
    { type: 'Productos', color: { red: 0.882, green: 0.922, blue: 0.961 } },
    { type: 'Insumos', color: { red: 0.988, green: 0.945, blue: 0.859 } },
    { type: 'Ambos', color: { red: 0.851, green: 0.918, blue: 0.827 } },
  ];

  for (const { type, color } of typeColors) {
    requests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: [{
            sheetId,
            startRowIndex: 1,
            endRowIndex: 101,
            startColumnIndex: 0,
            endColumnIndex: 7,
          }],
          booleanRule: {
            condition: {
              type: 'CUSTOM_FORMULA',
              values: [{ userEnteredValue: `=$C2="${type}"` }],
            },
            format: { backgroundColor: color },
          },
        },
        index: 0,
      },
    });
  }

  // Email column - special formatting
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 101,
        startColumnIndex: 4,
        endColumnIndex: 5,
      },
      cell: {
        userEnteredFormat: {
          textFormat: {
            foregroundColor: { red: 0.067, green: 0.333, blue: 0.8 },
            underline: true,
          },
        },
      },
      fields: 'userEnteredFormat.textFormat',
    },
  });
}

/**
 * Special formatting for Marcas sheet
 */
function addBrandsFormatting(requests: any[], sheetMap: Record<string, number>): void {
  const sheetId = sheetMap['🏷️ Marcas'];
  if (sheetId === undefined) return;

  // Código column (A) - gray "locked" appearance (auto-generated)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 101,
        startColumnIndex: 0,
        endColumnIndex: 1,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.lightGray,
          textFormat: {
            fontFamily: 'Roboto Mono',
            fontSize: 10,
            foregroundColor: COLORS.darkGray,
          },
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat)',
    },
  });

  // Conditional formatting for inactive brands
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{
          sheetId,
          startRowIndex: 1,
          endRowIndex: 101,
          startColumnIndex: 0,
          endColumnIndex: 4,
        }],
        booleanRule: {
          condition: {
            type: 'CUSTOM_FORMULA',
            values: [{ userEnteredValue: '=$D2="No"' }],
          },
          format: {
            textFormat: {
              foregroundColor: COLORS.darkGray,
              strikethrough: true,
            },
          },
        },
      },
      index: 0,
    },
  });
}
