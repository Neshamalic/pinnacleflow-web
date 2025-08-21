// src/lib/googleSheet.js
import { APPS_SCRIPT_URL } from './sheetsConfig';

/**
 * Lee una hoja usando el Apps Script (GET)
 */
export async function fetchSheetTable(name) {
  const url = `${APPS_SCRIPT_URL}?route=table&name=${encodeURIComponent(name)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network error');
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Fetch failed');
  return json.rows || [];
}

/**
 * Escribe en la hoja usando el Apps Script (POST)
 * action: 'create' | 'update' | 'delete'
 * row: objeto con columnas (para create/update)
 * where: objeto con llaves (para delete) — si no envías where, usa row
 */
export async function writeSheet({ name, action = 'create', row = {}, where = null }) {
  const payload = {
    route: 'write',
    action,
    name,
    row,
    ...(where ? { where } : {})
  };

  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error('Network error');
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Write failed');
  return json;
}
