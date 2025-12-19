/**
 * Google Sheets API Authentication
 * Handles service account authentication and API client creation
 */

import { google, sheets_v4 } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

let sheetsClient: sheets_v4.Sheets | null = null;

/**
 * Get authenticated Google Sheets API client
 * Uses service account credentials from config directory
 */
export async function getGoogleSheetsClient(): Promise<sheets_v4.Sheets> {
  if (sheetsClient) {
    return sheetsClient;
  }

  const credPath = path.join(__dirname, '../../config/google-service-account.json');

  if (!fs.existsSync(credPath)) {
    throw new Error(
      `Service account credentials not found at ${credPath}\n` +
      `Please create a service account and save the JSON key file there.`
    );
  }

  const credentials = JSON.parse(fs.readFileSync(credPath, 'utf8'));

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

/**
 * Get sheet IDs from a spreadsheet
 * Returns a map of sheet name to sheet ID
 */
export async function getSheetIds(spreadsheetId: string): Promise<Record<string, number>> {
  const sheets = await getGoogleSheetsClient();

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties',
  });

  const sheetMap: Record<string, number> = {};
  spreadsheet.data.sheets?.forEach((sheet) => {
    if (sheet.properties?.title && sheet.properties.sheetId !== undefined) {
      sheetMap[sheet.properties.title] = sheet.properties.sheetId;
    }
  });

  return sheetMap;
}

/**
 * Execute batch update with automatic chunking for large requests
 */
export async function batchUpdate(
  spreadsheetId: string,
  requests: any[],
  batchSize: number = 100
): Promise<void> {
  const sheets = await getGoogleSheetsClient();

  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: batch },
    });
  }
}

/**
 * Update values in a range
 */
export async function updateValues(
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<void> {
  const sheets = await getGoogleSheetsClient();

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
}
