/**
 * Google Sheets Data Validations
 * Dropdowns, constraints, and input validation rules
 */

import { batchUpdate } from './auth';
import { SPREADSHEET_ID, DROPDOWN_OPTIONS } from './config';

/**
 * Helper to create a dropdown validation rule with static options
 */
function createDropdown(
  sheetId: number,
  startRow: number,
  endRow: number,
  startCol: number,
  endCol: number,
  options: readonly string[],
  strict: boolean = true
): any {
  return {
    setDataValidation: {
      range: {
        sheetId,
        startRowIndex: startRow,
        endRowIndex: endRow,
        startColumnIndex: startCol,
        endColumnIndex: endCol,
      },
      rule: {
        condition: {
          type: 'ONE_OF_LIST',
          values: options.map(v => ({ userEnteredValue: v })),
        },
        showCustomUi: true,
        strict,
      },
    },
  };
}

/**
 * Helper to create a dropdown from another sheet's range (dynamic options)
 * @param sourceRange - Range formula like "='📂 Categorías'!$A$2:$A$101"
 */
function createDropdownFromRange(
  sheetId: number,
  startRow: number,
  endRow: number,
  startCol: number,
  endCol: number,
  sourceRange: string,
  strict: boolean = false
): any {
  return {
    setDataValidation: {
      range: {
        sheetId,
        startRowIndex: startRow,
        endRowIndex: endRow,
        startColumnIndex: startCol,
        endColumnIndex: endCol,
      },
      rule: {
        condition: {
          type: 'ONE_OF_RANGE',
          values: [{ userEnteredValue: sourceRange }],
        },
        showCustomUi: true,
        strict,
      },
    },
  };
}

/**
 * Apply all data validations to the spreadsheet
 */
export async function applyValidations(
  spreadsheetId: string,
  sheetMap: Record<string, number>
): Promise<void> {
  console.log('\n📋 Applying data validations...\n');

  const requests: any[] = [];

  // ========================
  // 📂 Categorías (Columns: 🔒 Código, Nombre, Nivel, Categoría Padre, Activo)
  // ========================
  const catSheetId = sheetMap['📂 Categorías'];
  if (catSheetId !== undefined) {
    console.log('  📂 Categorías...');

    // Nivel dropdown (C - index 2: 1, 2, 3)
    requests.push(createDropdown(catSheetId, 1, 101, 2, 3, DROPDOWN_OPTIONS.levels));

    // Activo dropdown (E - index 4: Sí, No)
    requests.push(createDropdown(catSheetId, 1, 101, 4, 5, DROPDOWN_OPTIONS.yesNo));
  }

  // ========================
  // 🏭 Proveedores
  // ========================
  const provSheetId = sheetMap['🏭 Proveedores'];
  if (provSheetId !== undefined) {
    console.log('  🏭 Proveedores...');

    // Tipo dropdown (C: Productos, Insumos, Ambos)
    requests.push(createDropdown(provSheetId, 1, 101, 2, 3, DROPDOWN_OPTIONS.providerTypes));

    // Activo dropdown (G)
    requests.push(createDropdown(provSheetId, 1, 101, 6, 7, DROPDOWN_OPTIONS.yesNo));
  }

  // ========================
  // 🏷️ Marcas
  // ========================
  const brandSheetId = sheetMap['🏷️ Marcas'];
  if (brandSheetId !== undefined) {
    console.log('  🏷️ Marcas...');

    // Activo dropdown (D)
    requests.push(createDropdown(brandSheetId, 1, 101, 3, 4, DROPDOWN_OPTIONS.yesNo));
  }

  // ========================
  // ⚙️ Configuración (Ubicaciones)
  // ========================
  const configSheetId = sheetMap['⚙️ Configuración'];
  if (configSheetId !== undefined) {
    console.log('  ⚙️ Configuración...');

    // Activo dropdown (D)
    requests.push(createDropdown(configSheetId, 1, 30, 3, 4, DROPDOWN_OPTIONS.yesNo));
  }

  // ========================
  // 🆕 Productos
  // Todos los dropdowns usan 🔧 Datos que filtra solo items activos
  // ========================
  const prodSheetId = sheetMap['🆕 Productos'];
  if (prodSheetId !== undefined) {
    console.log('  🆕 Productos...');

    // Categoría dropdown (C) - from 🔧 Datos (solo activas)
    requests.push(createDropdownFromRange(
      prodSheetId, 1, 501, 2, 3,
      "='🔧 Datos'!$A$2:$A$500"
    ));

    // Marca dropdown (D) - from 🔧 Datos (solo activas)
    requests.push(createDropdownFromRange(
      prodSheetId, 1, 501, 3, 4,
      "='🔧 Datos'!$B$2:$B$500"
    ));

    // Unidad dropdown (E) - not strict to allow custom units
    requests.push(createDropdown(prodSheetId, 1, 501, 4, 5, DROPDOWN_OPTIONS.units, false));

    // Requiere Receta dropdown (L)
    requests.push(createDropdown(prodSheetId, 1, 501, 11, 12, DROPDOWN_OPTIONS.yesNo));

    // Proveedor dropdown (M) - from 🔧 Datos (solo activos)
    requests.push(createDropdownFromRange(
      prodSheetId, 1, 501, 12, 13,
      "='🔧 Datos'!$C$2:$C$500"
    ));

    // Activo dropdown (O)
    requests.push(createDropdown(prodSheetId, 1, 501, 14, 15, DROPDOWN_OPTIONS.yesNo));
  }

  // ========================
  // 📦 Stock Inicial (Columns: Producto, Operación, Cantidad, Costo, Fecha, Ubicación, Notas)
  // Usa 🔧 Datos para filtrar solo items activos
  // ========================
  const stockSheetId = sheetMap['📦 Stock Inicial'];
  if (stockSheetId !== undefined) {
    console.log('  📦 Stock Inicial...');

    // Producto dropdown (A - index 0) - from 🔧 Datos (solo activos)
    requests.push(createDropdownFromRange(
      stockSheetId, 1, 501, 0, 1,
      "='🔧 Datos'!$D$2:$D$500"
    ));

    // Operación dropdown (B - index 1)
    requests.push(createDropdown(stockSheetId, 1, 501, 1, 2, DROPDOWN_OPTIONS.operations));

    // Ubicación dropdown (F - index 5) - from 🔧 Datos (solo activas)
    requests.push(createDropdownFromRange(
      stockSheetId, 1, 501, 5, 6,
      "='🔧 Datos'!$E$2:$E$500"
    ));
  }

  // ========================
  // ⚡ Carga Rápida (Columns: Nombre, Categoría, Unidad, PrecioCosto, PrecioVenta, Stock, Marca, Proveedor, Notas)
  // Usa 🔧 Datos para filtrar solo items activos
  // ========================
  const quickSheetId = sheetMap['⚡ Carga Rápida'];
  if (quickSheetId !== undefined) {
    console.log('  ⚡ Carga Rápida...');

    // Nombre dropdown (A - index 0) - from 🔧 Datos (productos activos)
    requests.push(createDropdownFromRange(
      quickSheetId, 1, 501, 0, 1,
      "='🔧 Datos'!$D$2:$D$500"
    ));

    // Categoría dropdown (B - index 1) - from 🔧 Datos (solo activas)
    requests.push(createDropdownFromRange(
      quickSheetId, 1, 501, 1, 2,
      "='🔧 Datos'!$A$2:$A$500"
    ));

    // Unidad dropdown (C - index 2) - not strict
    requests.push(createDropdown(quickSheetId, 1, 501, 2, 3, DROPDOWN_OPTIONS.units, false));

    // Marca dropdown (G - index 6) - from 🔧 Datos (solo activas)
    requests.push(createDropdownFromRange(
      quickSheetId, 1, 501, 6, 7,
      "='🔧 Datos'!$B$2:$B$500"
    ));

    // Proveedor dropdown (H - index 7) - from 🔧 Datos (solo activos)
    requests.push(createDropdownFromRange(
      quickSheetId, 1, 501, 7, 8,
      "='🔧 Datos'!$C$2:$C$500"
    ));
  }

  // Execute validations
  await batchUpdate(spreadsheetId, requests, 50);

  console.log('\n  ✅ Validations applied\n');
}
