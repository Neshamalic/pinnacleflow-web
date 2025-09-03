// src/lib/googleSheet.js
import { APP_SCRIPT_URL } from './sheetsConfig'; // deja tu URL aquí

/* ------------ Fetch básico ------------- */
async function getJSON(url) {
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`GET ${res.status}: ${txt || res.statusText}`);
  }
  return res.json();
}

/* ---------- LECTURA: route=table&name=... en tu Apps Script ---------- */
export async function fetchGoogleSheet({ sheetId = '', sheetName }) {
  const url = `${APP_SCRIPT_URL}?route=table&name=${encodeURIComponent(sheetName)}`;
  const json = await getJSON(url);
  if (!json?.ok) throw new Error(json?.error || 'Unknown error');
  return json.rows || [];
}

/* ================== Helpers de business ================== */
const pick = (row, keys) => {
  for (const k of keys) if (row[k] !== undefined && row[k] !== '') return row[k];
  return undefined;
};

export const toNumber = (v) => {
  if (v == null) return 0;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const cleaned = String(v).replace(/[^\d.-]/g, '').replace(/(\..*)\./g, '$1');
  const num = Number(cleaned.replace(',', ''));
  return Number.isFinite(num) ? num : 0;
};

export const formatCLP = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
    .format(Number.isFinite(n) ? n : 0);

export function formatDateMDY(d) {
  if (!d) return '—';
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(+dt)) return '—';
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ---------------- Demanda: construir mapa por presentation_code ---------------- */
export function buildDemandMap(demandRows) {
  const map = new Map();
  for (const r of demandRows || []) {
    const code = String(pick(r, ['presentation_code','presentation','code']) || '').trim();
    if (!code) continue;
    const monthly = toNumber(pick(r, ['monthly_demand_units','monthly_demand','demand_units']));
    const stockUnits = toNumber(pick(r, ['current_stock_units','stock_units']));
    const packSize = toNumber(pick(r, ['package_size','pack_size']));
    map.set(code, { monthly, stockUnits, packSize });
  }
  return map;
}

/* ---------------- Badge de cobertura ---------------- */
export function badgeForDays(days) {
  const n = Number(days);
  if (!Number.isFinite(n) || n < 0) return { label: '—', tone: 'muted' };
  if (n <= 10) return { label: `${n} days`, tone: 'danger' };
  if (n <= 30) return { label: `${n} days`, tone: 'warning' };
  return { label: `${n} days`, tone: 'success' };
}

/* ---------------- Agregación por Tender ----------------
   items: filas de tender_items de un mismo tender
   demandMap: mapa por presentation_code
   coverageMode: 'min' → bottleneck (recomendado)
*/
export function aggregateTenderRow(items, demandMap, coverageMode = 'min') {
  const first = items[0] || {};
  const tenderId = String(pick(first, ['tender_number','tender_id','tender']) || '').trim();

  let productsCount = 0;
  let totalValue = 0;
  let deliveryDate = null;

  // cobertura por item → luego agregamos
  const itemCoverages = [];

  for (const it of items) {
    productsCount += 1;

    const qty = toNumber(pick(it, ['qty','quantity','total_qty']));
    const unit = toNumber(pick(it, ['unit_price_clp','unit_price','price_clp','price','cost_clp']));
    totalValue += qty * unit;

    const d = pick(it, ['first_delivery','first_delivery_date','delivery_date']);
    if (d && !deliveryDate) deliveryDate = new Date(d);

    const code = String(pick(it, ['presentation_code','presentation','code']) || '').trim();
    if (code && demandMap.has(code)) {
      const { monthly, stockUnits } = demandMap.get(code);
      const daily = monthly > 0 ? (monthly / 30) : 0;
      const days = daily > 0 ? Math.floor(stockUnits / daily) : null;
      if (Number.isFinite(days)) itemCoverages.push(days);
    }
  }

  let daysSupply = null;
  if (itemCoverages.length) {
    daysSupply = coverageMode === 'min'
      ? Math.min(...itemCoverages)
      : Math.round(itemCoverages.reduce((a,b) => a+b, 0) / itemCoverages.length);
  }

  return { tenderId, productsCount, totalValue, deliveryDate, daysSupply };
}

