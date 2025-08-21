// src/lib/googleSheet.js
// Pequeña librería para LEER/ESCRIBIR usando tu Apps Script evitando preflight

import { APP_SCRIPT_URL } from './sheetsConfig';

/** Helper simple para GET JSON */
async function getJSON(url) {
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`GET ${res.status}: ${txt || res.statusText}`);
  }
  return res.json();
}

/** LECTURA: usa tu Apps Script con route=table&name=... */
export async function fetchGoogleSheet({ sheetId, sheetName }) {
  // sheetId se ignora; tu Apps Script ya conoce el Spreadsheet ID fijo.
  const url = `${APP_SCRIPT_URL}?route=table&name=${encodeURIComponent(sheetName)}`;
  const json = await getJSON(url);
  if (!json?.ok) throw new Error(json?.error || 'Unknown error');
  return json.rows || [];
}

/**
 * ESCRITURA: POST + text/plain (sin preflight)
 * action: 'create' | 'update' | 'delete'
 * payload = { row }  ó  { where }
 *
 * Enviamos la action tanto en el querystring como en el body,
 * para ser compatibles con doPost que lea e.parameter.action o body.action.
 */
export async function writeSheet(name, action, payload) {
  const url = `${APP_SCRIPT_URL}?name=${encodeURIComponent(name)}&action=${encodeURIComponent(
    action
  )}`;

  const bodyObj = { ...(payload || {}), action }; // <- action también va en el body
  const res = await fetch(url, {
    method: 'POST', // <- SIEMPRE POST
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // <- text/plain evita preflight
    body: JSON.stringify(bodyObj),
  });

  // Si CORS fallara, ni siquiera llegas aquí (verías "Failed to fetch")
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`POST ${res.status}: ${txt || res.statusText}`);
  }

  const json = await res.json().catch(async () => {
    const t = await res.text();
    throw new Error(`Respuesta no JSON: ${t}`);
  });

  if (!json?.ok) throw new Error(json?.error || 'Unknown error');
  return json; // { ok:true, ... }
}

/* Wrappers convenientes para tu UI (crear / actualizar / eliminar) */
export async function createRow({ sheetName, row }) {
  if (!sheetName) throw new Error('sheetName required');
  if (!row || typeof row !== 'object') throw new Error('row object required');
  return writeSheet(sheetName, 'create', { row });
}

export async function updateRow({ sheetName, row }) {
  if (!sheetName) throw new Error('sheetName required');
  if (!row || typeof row !== 'object') throw new Error('row object required');
  return writeSheet(sheetName, 'update', { row });
}

export async function deleteRow({ sheetName, where }) {
  if (!sheetName) throw new Error('sheetName required');
  if (!where || typeof where !== 'object') throw new Error('where object required');
  return writeSheet(sheetName, 'delete', { where });
}

