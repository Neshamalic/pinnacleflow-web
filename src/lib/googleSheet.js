// src/lib/googleSheet.js
// Pequeña librería de acceso a tu Apps Script (Google Sheets backend)

import { APP_SCRIPT_URL } from './sheetsConfig';

/**
 * Lee una hoja (GET). Devuelve un array de filas (objetos).
 * - sheetName: nombre de la hoja, ej: 'tender_items'
 * - sheetId: NO se usa porque tu Apps Script ya conoce el spreadsheet por ID
 */
export async function fetchGoogleSheet({ sheetId, sheetName }) {
  const url = `${APP_SCRIPT_URL}?route=table&name=${encodeURIComponent(sheetName)}`;

  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`GET failed (${res.status}): ${txt || 'No details'}`);
  }
  const json = await res.json().catch(() => null);
  if (!json || json.ok !== true) {
    throw new Error(json?.error || 'GET returned not ok');
  }
  return json.rows || [];
}

/**
 * Crea una fila (POST)
 * - name: nombre de la hoja
 * - row: objeto con los campos (coincidir con encabezados de la hoja)
 */
export async function createRow({ name, row }) {
  const url = `${APP_SCRIPT_URL}?name=${encodeURIComponent(name)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ row }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || `POST failed (${res.status})`);
  }
  return json.result || json;
}

/**
 * Actualiza (o inserta si no existe) una fila (PUT)
 * - name: nombre de la hoja
 * - row: objeto con LLAVES requeridas por tu Apps Script:
 *   * tender_items:        tender_number + presentation_code
 *   * purchase_orders:     po_number
 *   * purchase_order_items:po_number + presentation_code
 *   * imports:             oci_number
 *   * import_items:        oci_number + presentation_code + lot_number
 *   * demand:              month_of_supply + presentation_code
 */
export async function updateRow({ name, row }) {
  const url = `${APP_SCRIPT_URL}?name=${encodeURIComponent(name)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ row }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || `PUT failed (${res.status})`);
  }
  return json.updated || json.upserted || json;
}

/**
 * Elimina una fila (DELETE)
 * - name: nombre de la hoja
 * - where: objeto con la(s) llave(s) para encontrar la fila.
 *   Ej: { tender_number: '621-299-LR25', presentation_code: 'PC00071' }
 */
export async function deleteRow({ name, where }) {
  const url = `${APP_SCRIPT_URL}?name=${encodeURIComponent(name)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ where }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || `DELETE failed (${res.status})`);
  }
  return json.removed || json;
}

/**
 * API de conveniencia para quien ya usaba writeSheet:
 * - mode: 'insert' (POST) | 'update' (PUT) | 'delete' (DELETE) | 'upsert' (PUT)
 */
export async function writeSheet({ name, row, where, mode = 'upsert' }) {
  if (mode === 'insert') return createRow({ name, row });
  if (mode === 'update') return updateRow({ name, row });
  if (mode === 'delete') return deleteRow({ name, where });
  // 'upsert' por defecto usa PUT
  return updateRow({ name, row });
}

// Export por defecto (opcional) para compatibilidad
export default {
  fetchGoogleSheet,
  createRow,
  updateRow,
  deleteRow,
  writeSheet,
};

