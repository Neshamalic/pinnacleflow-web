// src/lib/googleSheet.js
// Librería para LEER/ESCRIBIR usando tu Apps Script (sin preflight)
// + utilidades de formato y agregación (demand, coverage, etc.)

import { APP_SCRIPT_URL } from './sheetsConfig';

/* ============================================================
 *  HTTP helpers (Apps Script)
 * ============================================================ */

/** GET JSON simple (sin preflight extra) */
async function getJSON(url) {
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`GET ${res.status}: ${txt || res.statusText}`);
  }
  return res.json();
}

/** LECTURA: tu Apps Script expone route=table&name=... */
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
 */
export async function writeSheet(name, action, payload) {
  const url = `${APP_SCRIPT_URL}?name=${encodeURIComponent(name)}&action=${encodeURIComponent(
    action
  )}`;

  const bodyObj = { ...(payload || {}), action }; // action también en el body
  const res = await fetch(url, {
    method: 'POST', // SIEMPRE POST
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // text/plain evita preflight
    body: JSON.stringify(bodyObj),
  });

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

/* Wrappers convenientes para la UI */
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

/* ============================================================
 *  Utilidades de formato y parsing
 * ============================================================ */

/** Convierte strings/valores con símbolos a Number seguro */
export function toNumber(x) {
  const n = typeof x === 'string' ? Number(String(x).replace(/[^\d.-]/g, '')) : Number(x);
  return Number.isFinite(n) ? n : 0;
}

/** Convierte fechas tipo Excel serial a Date (Google Sheets suele usar serial) */
function excelSerialDateToJSDate(serial) {
  // Base: 1899-12-30 (Google/Excel)
  const ms = (serial - 25569) * 86400 * 1000;
  const d = new Date(ms);
  return isNaN(d.getTime()) ? null : d;
}

/** Intenta parsear fecha desde string/number */
export function parseMaybeDate(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number' && isFinite(v)) {
    return excelSerialDateToJSDate(v);
  }
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

/** Formato fecha “Mar 14, 2025” */
export function formatDateMDY(d) {
  if (!d) return '—';
  try {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '—';
  }
}

/** Formato CLP (sin decimales) */
export function formatCLP(n) {
  try {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(n || 0);
  } catch {
    return `CLP ${Math.round(n || 0).toLocaleString('es-CL')}`;
  }
}

/* ============================================================
 *  DEMAND: construir mapa y cobertura
 * ============================================================ */

/**
 * Construye un Map por presentation_code con:
 * { presentationCode, monthlyDemand, stockUnits, daysSupply }
 *
 * Espera columnas en demand:
 * - presentation_code
 * - monthly_demand_units
 * - current_stock_units
 * - days_supply  (opcional; si no, lo calculamos)
 */
export function buildDemandMap(rows) {
  const map = new Map();
  for (const r of rows || []) {
    const code = String(r.presentation_code || '').trim();
    if (!code) continue;

    const monthly = toNumber(r.monthly_demand_units);
    const stock = toNumber(r.current_stock_units);
    let days = toNumber(r.days_supply);

    if (!days && monthly > 0) {
      // días = stock / (demanda diaria)
      days = stock / (monthly / 30);
    }

    map.set(code, {
      presentationCode: code,
      monthlyDemand: monthly,
      stockUnits: stock,
      daysSupply: Number.isFinite(days) ? days : null,
    });
  }
  return map;
}

/**
 * Agrega datos a nivel tender (varios presentation_code por tender).
 * - tenderItems: filas del sheet tender_items (agrupadas por tender)
 * - demandMap: Map de buildDemandMap
 * - strategy: 'min' (bottleneck, por defecto) o 'weighted' (promedio ponderado por demanda)
 *
 * Devuelve:
 * {
 *   tenderId, title, productsCount, deliveryDate(Date),
 *   totalValue(Number), daysSupply(Number|null)
 * }
 */
export function aggregateTenderRow(tenderItems, demandMap, strategy = 'min') {
  const row = {};
  if (!tenderItems?.length) return row;

  // Campos básicos
  const t0 = tenderItems[0];
  const tenderId = t0.tender_id || t0.tender_number || t0.tender || '';
  row.tenderId = String(tenderId || '').trim();
  row.title = t0.title || t0.product_name || '—';

  // Distintos presentation codes
  const codes = [...new Set(tenderItems.map(i => String(i.presentation_code || '').trim()).filter(Boolean))];
  row.productsCount = codes.length;

  // Delivery date: elegir la más temprana disponible entre first_delivery/delivery_date/first_delivery_date
  let minDate = null;
  for (const it of tenderItems) {
    const d =
      parseMaybeDate(it.first_delivery) ||
      parseMaybeDate(it.delivery_date) ||
      parseMaybeDate(it.first_delivery_date);
    if (!d) continue;
    if (!minDate || d < minDate) minDate = d;
  }
  row.deliveryDate = minDate;

  // Total value: suma item_total_value; si no, unit_price * (awarded_qty/quantity)
  let total = 0;
  for (const it of tenderItems) {
    const lineTotal =
      toNumber(it.item_total_value) ||
      (toNumber(it.unit_price) *
        (toNumber(it.awarded_qty) || toNumber(it.quantity) || toNumber(it.qty) || 0));
    total += lineTotal;
  }
  row.totalValue = total;

  // Cobertura desde DEMAND
  const entries = [];
  for (const c of codes) {
    const d = demandMap.get(c);
    if (d && Number.isFinite(d.daysSupply)) entries.push(d);
  }

  if (!entries.length) {
    row.daysSupply = null;
  } else if (strategy === 'weighted') {
    // promedio ponderado por demanda mensual
    let sumW = 0,
      sumWD = 0;
    for (const e of entries) {
      const w = Math.max(1, e.monthlyDemand || 0); // si demanda=0, evita peso 0
      sumW += w;
      sumWD += e.daysSupply * w;
    }
    row.daysSupply = sumW > 0 ? sumWD / sumW : null;
  } else {
    // bottleneck = mínimo de días
    row.daysSupply = Math.min(...entries.map(e => e.daysSupply));
  }

  return row;
}

/**
 * Badge estilo Rocket según días de cobertura.
 * Devuelve { label, tone } donde tone ∈ { 'danger','warning','success','muted' }
 */
export function badgeForDays(days) {
  if (days == null || !Number.isFinite(days)) return { label: '—', tone: 'muted' };
  const d = Math.round(days);
  if (d < 10) return { label: `${d} days`, tone: 'danger' };   // rojo
  if (d < 30) return { label: `${d} days`, tone: 'warning' };  // amarillo
  return { label: `${d} days`, tone: 'success' };              // verde
}
