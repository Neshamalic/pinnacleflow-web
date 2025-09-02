// src/pages/tender-management/index.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { fetchGoogleSheet } from '@/lib/googleSheet';

// ============ Config ============
// Hoja fuente de ítems de licitación (una fila por producto)
const TENDER_ITEMS_SHEET = 'tender_items';
// Hoja con stock y demanda mensual por presentación/producto
const DEMAND_SHEET = 'demand';

// ============ Utilidades ============
// convierte "CLP 1.234.567" o "1,234.56" a número
function n(v) {
  if (v == null || v === '') return 0;
  const num = Number(String(v).replace(/[^\d.-]/g, ''));
  return Number.isFinite(num) ? num : 0;
}
function fmtCLP(v) {
  try {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(v || 0);
  } catch {
    return `CLP ${Math.round(v || 0).toLocaleString('es-CL')}`;
  }
}
function parseDateLoose(v) {
  if (!v) return null;
  if (v instanceof Date && !isNaN(v)) return v;
  const try1 = new Date(v);
  return isNaN(try1) ? null : try1;
}
function minDate(arr) {
  const valid = arr.filter(Boolean);
  if (!valid.length) return null;
  return new Date(Math.min(...valid.map(d => d.getTime())));
}
function formatDate(d) {
  if (!d) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }); // ej: Mar 14, 2025
}
function normalizeStatus(s) {
  if (!s) return 'Draft';
  s = String(s).toLowerCase();
  if (s.includes('award')) return 'Awarded';
  if (s.includes('deliver')) return 'In Delivery';
  if (s.includes('submit')) return 'Submitted';
  if (s.includes('reject')) return 'Rejected';
  if (s.includes('draft')) return 'Draft';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ========= Badge UI =========
function Badge({ kind = 'neutral', children }) {
  const map = {
    neutral: 'bg-gray-100 text-gray-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[kind]}`}>
      {children}
    </span>
  );
}
function statusBadge(status) {
  const s = normalizeStatus(status);
  if (s === 'Awarded') return <Badge kind="green">Awarded</Badge>;
  if (s === 'In Delivery') return <Badge kind="yellow">In Delivery</Badge>;
  if (s === 'Submitted') return <Badge kind="blue">Submitted</Badge>;
  if (s === 'Rejected') return <Badge kind="red">Rejected</Badge>;
  return <Badge>Draft</Badge>;
}
function coverageBadge(days) {
  if (days == null || days === '') return '—';
  if (days < 10) return <Badge kind="red">{Math.round(days)} days</Badge>;
  if (days < 30) return <Badge kind="yellow">{Math.round(days)} days</Badge>;
  return <Badge kind="green">{Math.round(days)} days</Badge>;
}

// ========= Índice de cobertura por presentación/producto =========
/**
 * Devuelve un diccionario: { presentation_code -> stock_coverage_days }
 * rows puede tener encabezados alternativos (ver abajo).
 */
function buildCoverageIndex(rows) {
  const index = {};

  for (const r of rows || []) {
    // 1) código de producto/presentación
    const code =
      (r.presentation_code ?? r.product_code ?? r.code ?? r.presentation ?? r['presentation code'] ?? r['product code'])?.toString().trim();
    if (!code) continue;

    // 2) stock actual
    const stock = n(r.current_stock ?? r.stock ?? r.stock_units ?? r.current_qty);

    // 3) demanda mensual
    const demandMonthly = n(r.monthly_demand ?? r.demand ?? r.demand_units_month);
    if (demandMonthly <= 0) {
      // si no hay demanda, dejamos cobertura vacía
      index[code] = null;
      continue;
    }
    const daily = demandMonthly / 30;
    const days = stock / (daily || 1);
    index[code] = Number.isFinite(days) ? days : null;
  }

  return index;
}

// ========= Agregado por licitación =========
/**
 * rows: tender_items (una fila por producto)
 * coverageIdx: { presentation_code -> days }
 */
function aggregateTenders(rows, coverageIdx) {
  const byId = new Map();

  for (const r of rows) {
    const tenderId =
      (r.tender_number ?? r.tender_id ?? r.tender ?? r['tender id'] ?? r['tender_number'])?.toString().trim();
    if (!tenderId) continue;

    const title =
      r.tender_title ?? r.title ?? r['tender title'] ?? r['title'] ?? '';

    const status = normalizeStatus(r.tender_status ?? r.status ?? '');

    const itemValue = n(r.total_value) || n(r.value) || n(r.amount) || n(r.net_value) || 0;

    const d1 = parseDateLoose(r.first_delivery ?? r.first_delivery_date ?? r.delivery_date ?? r['delivery date']);
    const d2 = parseDateLoose(r['first delivery']);
    const deliveryCandidate = d1 || d2 || null;

    const pres =
      (r.presentation_code ?? r.presentation ?? r['presentation code'] ?? r.product_code ?? r['product code'])?.toString();

    let acc = byId.get(tenderId);
    if (!acc) {
      acc = {
        tenderId,
        title,
        status: status || 'Draft',
        productSet: new Set(),
        deliveryDates: [],
        totalValue: 0,
        coverageDaysList: [], // guardamos la cobertura por producto para calcular la del tender
      };
      byId.set(tenderId, acc);
    }

    if (acc.status !== 'Awarded' && status) acc.status = status;
    if (pres) {
      acc.productSet.add(pres);
      // si tenemos cobertura para ese producto, la añadimos
      const days = coverageIdx ? coverageIdx[pres] : null;
      if (days != null) acc.coverageDaysList.push(days);
    }
    if (deliveryCandidate) acc.deliveryDates.push(deliveryCandidate);
    acc.totalValue += itemValue;
  }

  const out = [];
  for (const acc of byId.values()) {
    const earliest = minDate(acc.deliveryDates);
    // Estrategia: cobertura del tender = MÍNIMO de las coberturas de sus productos (bottleneck)
    let tenderCoverage = null;
    if (acc.coverageDaysList.length) {
      tenderCoverage = Math.min(...acc.coverageDaysList);
    }

    out.push({
      tenderId: acc.tenderId,
      title: acc.title || acc.tenderId,
      products: acc.productSet.size,
      status: acc.status,
      deliveryDate: earliest,
      stockDays: tenderCoverage,
      totalValue: acc.totalValue,
    });
  }

  out.sort((a, b) => {
    const aa = a.deliveryDate ? a.deliveryDate.getTime() : Infinity;
    const bb = b.deliveryDate ? b.deliveryDate.getTime() : Infinity;
    return aa - bb;
  });

  return out;
}

// ========= Página =========
export default function TenderManagement() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [demandRows, setDemandRows] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        // Leemos ítems de licitación + demanda/stock en paralelo
        const [rows, dem] = await Promise.all([
          fetchGoogleSheet({ sheetName: TENDER_ITEMS_SHEET }),
          fetchGoogleSheet({ sheetName: DEMAND_SHEET }),
        ]);
        setItems(Array.isArray(rows) ? rows : []);
        setDemandRows(Array.isArray(dem) ? dem : []);
      } catch (e) {
        console.error(e);
        setItems([]);
        setDemandRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const coverageIdx = useMemo(() => buildCoverageIndex(demandRows), [demandRows]);
  const tenders = useMemo(() => aggregateTenders(items, coverageIdx), [items, coverageIdx]);

  const total = tenders.length;
  const awarded = tenders.filter(t => normalizeStatus(t.status) === 'Awarded').length;
  const inDelivery = tenders.filter(t => normalizeStatus(t.status) === 'In Delivery').length;

  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <div className="text-sm text-gray-500">Dashboard &gt; Tender Management</div>
        <h1 className="text-2xl font-semibold mt-1">Tender Management</h1>
        <p className="text-gray-500">Manage and oversee all CENABAST tenders from registration through delivery tracking.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs text-gray-500 mb-1">Active</div>
          <div className="text-2xl font-semibold">{total}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs text-gray-500 mb-1">Awarded</div>
          <div className="text-2xl font-semibold">{awarded}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs text-gray-500 mb-1">In Delivery</div>
          <div className="text-2xl font-semibold">{inDelivery}</div>
        </div>
        <div className="rounded-lg border bg-white p-4 flex items-center justify-end">
          <button className="px-3 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-500">
            + New Tender
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left font-medium px-4 py-3">Tender ID</th>
                <th className="text-left font-medium px-4 py-3">Title</th>
                <th className="text-left font-medium px-4 py-3">Products</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-left font-medium px-4 py-3">Delivery Date</th>
                <th className="text-left font-medium px-4 py-3">Stock Coverage</th>
                <th className="text-left font-medium px-4 py-3">Total Value</th>
                <th className="text-left font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-400">Loading…</td>
                </tr>
              )}
              {!loading && tenders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-400">No tenders</td>
                </tr>
              )}
              {!loading && tenders.map(row => (
                <tr key={row.tenderId} className="border-t">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.tenderId}</td>
                  <td className="px-4 py-3 text-gray-700">{row.title}</td>
                  <td className="px-4 py-3">{row.products || 0}</td>
                  <td className="px-4 py-3">{statusBadge(row.status)}</td>
                  <td className="px-4 py-3">{formatDate(row.deliveryDate)}</td>
                  <td className="px-4 py-3">{coverageBadge(row.stockDays)}</td>
                  <td className="px-4 py-3">{fmtCLP(row.totalValue)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 text-indigo-600">
                      <button className="hover:underline">View</button>
                      <button className="hover:underline">Edit</button>
                      <button className="text-gray-400 hover:text-gray-600">•••</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
