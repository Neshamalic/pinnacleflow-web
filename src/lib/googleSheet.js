// src/lib/googleSheet.js
// Librería para hablar con tu Apps Script (Google Sheets backend)

import { APP_SCRIPT_URL } from './sheetsConfig';

/** Lee una hoja completa (usa tu Apps Script) */
export async function fetchGoogleSheet({ sheetName }) {
  const url = `${APP_SCRIPT_URL}?route=table&name=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${sheetName} failed: ${await res.text()}`);
  const data = await res.json();
  if (data?.ok === false) throw new Error(data?.error || 'GET failed');
  return data?.rows || [];
}

/** Crea una fila nueva en una hoja */
export async function createRow({ sheetName, row }) {
  const url = `${APP_SCRIPT_URL}?name=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ row }),
  });
  const out = await res.json();
  if (!res.ok || out?.ok === false) {
    throw new Error(out?.error || `POST ${sheetName} failed`);
  }
  return out;
}

/** Actualiza una fila (upsert si no la encuentra) */
export async function updateRow({ sheetName, row }) {
  // IMPORTANTE: para tender_items, debes incluir
  // tender_number y presentation_code (llaves) en row
  const url = `${APP_SCRIPT_URL}?name=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ row }),
  });
  const out = await res.json();
  if (!res.ok || out?.ok === false) {
    throw new Error(out?.error || `PUT ${sheetName} failed`);
  }
  return out;
}

/** Borra una fila por llaves (o id si existiera) */
export async function deleteRow({ sheetName, where }) {
  const url = `${APP_SCRIPT_URL}?name=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ where }),
  });
  const out = await res.json();
  if (!res.ok || out?.ok === false) {
    throw new Error(out?.error || `DELETE ${sheetName} failed`);
  }
  return out;
}

