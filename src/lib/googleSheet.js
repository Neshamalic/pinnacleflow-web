import { APPS_SCRIPT_URL } from './sheetsConfig';

export async function fetchGoogleSheet({ sheetId, sheetName }) {
  const url = `${APPS_SCRIPT_URL}?route=table&name=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url, { method: 'GET' });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Failed to fetch sheet');
  return data.rows || [];
}

export async function createRow({ sheetName, row }) {
  const res = await fetch(`${APPS_SCRIPT_URL}?name=${encodeURIComponent(sheetName)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ row }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Failed to create row');
  return data.result;
}

export async function updateRow({ sheetName, row }) {
  const res = await fetch(`${APPS_SCRIPT_URL}?name=${encodeURIComponent(sheetName)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ row }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Failed to update row');
  return data.updated || data.upserted;
}

export async function deleteRow({ sheetName, where }) {
  const res = await fetch(`${APPS_SCRIPT_URL}?name=${encodeURIComponent(sheetName)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ where }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Failed to delete row');
  return data.removed;
}
