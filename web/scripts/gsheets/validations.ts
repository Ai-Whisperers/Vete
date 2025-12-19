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
  // 🆕 Productos (CATÁLOGO MASTER - Productos del mercado)
  // Columnas: SKU, Nombre, Categoría, Marca, Unid.Compra, Cant.Contenida, Unid.Venta,
  //           PrecioCompra, CostoUnit(calc), Proveedor, Descripción, Activo
  // Índices:  0     1        2          3      4            5              6
  //           7            8              9          10           11
  // ========================
  const prodSheetId = sheetMap['🆕 Productos'];
  if (prodSheetId !== undefined) {
    console.log('  🆕 Productos (Catálogo Master)...');

    // Categoría dropdown (C - col 2) - from 🔧 Datos
    requests.push(createDropdownFromRange(
      prodSheetId, 1, 501, 2, 3,
      "='🔧 Datos'!$A$2:$A$500"
    ));

    // Marca dropdown (D - col 3) - from 🔧 Datos
    requests.push(createDropdownFromRange(
      prodSheetId, 1, 501, 3, 4,
      "='🔧 Datos'!$B$2:$B$500"
    ));

    // Unid. Compra dropdown (E - col 4)
    requests.push(createDropdown(prodSheetId, 1, 501, 4, 5, DROPDOWN_OPTIONS.unitsBuy, false));

    // Unid. Venta dropdown (G - col 6)
    requests.push(createDropdown(prodSheetId, 1, 501, 6, 7, DROPDOWN_OPTIONS.unitsSell, false));

    // Proveedor dropdown (J - col 9) - from 🔧 Datos
    requests.push(createDropdownFromRange(
      prodSheetId, 1, 501, 9, 10,
      "='🔧 Datos'!$C$2:$C$500"
    ));

    // Activo dropdown (L - col 11)
    requests.push(createDropdown(prodSheetId, 1, 501, 11, 12, DROPDOWN_OPTIONS.yesNo));
  }

  // ========================
  // 📋 Mis Productos (PRODUCTOS DE LA CLÍNICA)
  // Columnas: Producto, PrecioVenta, Margen%(calc), StockMín, StockInicial, Ubicación, Receta, Activo
  // Índices:  0         1            2              3         4             5          6       7
  // ========================
  const myProdSheetId = sheetMap['📋 Mis Productos'];
  if (myProdSheetId !== undefined) {
    console.log('  📋 Mis Productos...');

    // Producto dropdown (A - col 0) - from 🔧 Datos (productos del catálogo)
    requests.push(createDropdownFromRange(
      myProdSheetId, 1, 501, 0, 1,
      "='🔧 Datos'!$D$2:$D$500"
    ));

    // Ubicación dropdown (F - col 5) - from 🔧 Datos
    requests.push(createDropdownFromRange(
      myProdSheetId, 1, 501, 5, 6,
      "='🔧 Datos'!$F$2:$F$500"
    ));

    // Requiere Receta dropdown (G - col 6)
    requests.push(createDropdown(myProdSheetId, 1, 501, 6, 7, DROPDOWN_OPTIONS.yesNo));

    // Activo dropdown (H - col 7)
    requests.push(createDropdown(myProdSheetId, 1, 501, 7, 8, DROPDOWN_OPTIONS.yesNo));
  }

  // ========================
  // 📦 Movimientos Stock (Compras, Ventas, Ajustes)
  // Columnas: Producto, Operación, Cantidad, CostoUnit, Fecha, Ubicación, Notas
  // Índices:  0         1          2         3          4      5          6
  // ========================
  const stockSheetId = sheetMap['📦 Movimientos Stock'];
  if (stockSheetId !== undefined) {
    console.log('  📦 Movimientos Stock...');

    // Producto dropdown (A - col 0) - from 🔧 Datos (Mis Productos activos)
    requests.push(createDropdownFromRange(
      stockSheetId, 1, 501, 0, 1,
      "='🔧 Datos'!$E$2:$E$500"
    ));

    // Operación dropdown (B - col 1)
    requests.push(createDropdown(stockSheetId, 1, 501, 1, 2, DROPDOWN_OPTIONS.operations));

    // Ubicación dropdown (F - col 5) - from 🔧 Datos
    requests.push(createDropdownFromRange(
      stockSheetId, 1, 501, 5, 6,
      "='🔧 Datos'!$F$2:$F$500"
    ));
  }

  // Execute validations
  await batchUpdate(spreadsheetId, requests, 50);

  console.log('\n  ✅ Validations applied\n');
}
