// src/lib/appsScriptApi.js
import { APPS_SCRIPT_URL } from './sheetsConfig';

async function http(method, params = {}, body = null) {
  const url = new URL(APPS_SCRIPT_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!data?.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data;
}

// === Endpoints “bonitos” ===
export const getTable = (sheetName) =>
  http('GET', { route: 'table', name: sheetName });

export const createRow = (sheetName, row) =>
  http('POST', { name: sheetName }, { row });

export const updateRow = (sheetName, row) =>
  http('PUT', { name: sheetName }, { row }); // incluye llaves + campos a cambiar

export const deleteRow = (sheetName, where) =>
  http('DELETE', { name: sheetName }, { where });
