// src/pages/tender-management/index.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { fetchGoogleSheet } from '@/lib/googleSheet';

// === Config ===
const SHEET_NAME = 'tender_items';

// === Helpers muy defensivos para distintos encabezados ===
function n(v) {
  // convierte "CLP 1.234.567" o "1,234.56" a número
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
  // acepta "2025-03-14", "03/14/2025", etc.
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
  // capitaliza la primera
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Agrupa filas de tender_items en una fila por licitación.
 * Intenta leer los campos con varios nombres posibles para que funcione con tus headers actuales.
 */
function aggregateTenders(rows) {
  const byId = new Map();

  for (const r of rows) {
    // claves tolerantes
    const tenderId =
      (r.tender_number ?? r.tender_id ?? r.tender ?? r['tender id'] ?? r['tender_number'])?.toString().trim();

    if (!tenderId) continue;

    const title =
      r.tender_title ??
      r.title ??
      r['tender title'] ??
      r['title'] ??
      ''; // si no existe, muestra vacío (Rocket pone el "Title" de la licitación)

    const status = normalizeStatus(r.tender_status ?? r.status ?? '');

    // valores por ítem (se suman)
    // probamos varias columnas: total_value, amount, value, net_value, etc.
    const itemValue =
      n(r.total_value) || n(r.value) || n(r.amount) || n(r.net_value) || 0;

    // fechas candidatas a "Delivery Date" (usamos la más temprana)
    const d1 = parseDateLoose(r.first_delivery ?? r.first_delivery_date ?? r.delivery_date ?? r['delivery date']);
    const d2 = parseDateLoose(r['first delivery']);
    const deliveryCandidate = d1 || d2 || null;

    // producto/presentación para contar únicos
    const pres =
      (r.presentation_code ?? r.presentation ?? r['presentation code'] ?? r.product_code ?? r['product code'])?.toString();

    let acc = byId.get(tenderId);
    if (!acc) {
      acc = {
        tenderId,
        title,
        // mantenemos el último status no vacío, priorizando "Awarded" sobre otros
        status: status || 'Draft',
        productSet: new Set(),
        deliveryDates: [],
        totalValue: 0,
        // si quieres: aquí podrías acumular cobertura usando tus hojas de demand/stock
        stockDays: null,
      };
      byId.set(tenderId, acc);
    }

    // prioriza Awarded si aparece en alguna fila
    if (acc.status !== 'Awarded' && status) {
      acc.status = status;
    }

    if (pres) acc.productSet.add(pres);
    if (deliveryCandidate) acc.deliveryDates.push(deliveryCandidate);
    acc.totalValue += itemValue;
  }

  const out = [];
  for (const acc of byId.values()) {
    const earliest = minDate(acc.deliveryDates);
    out.push({
      tenderId: acc.tenderId,
      title: acc.title || acc.tenderId, // fallback: muestra el id si no hay título
      products: acc.productSet.size,
      status: acc.status,
      deliveryDate: earliest,
      stockDays: acc.stockDays, // aún no calculamos cobertura real
      totalValue: acc.totalValue,
    });
  }

  // orden por Delivery Date asc (como Rocket suele ordenar por alguna columna)
  out.sort((a, b) => {
    const aa = a.deliveryDate ? a.deliveryDate.getTime() : Infinity;
    const bb = b.deliveryDate ? b.deliveryDate.getTime() : Infinity;
    return aa - bb;
  });

  return out;
}

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

export default function TenderManagement() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const rows = await fetchGoogleSheet({ sheetId: '', sheetName: SHEET_NAME });
        setItems(Array.isArray(rows) ? rows : []);
      } catch (e) {
        console.error(e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const tenders = useMemo(() => aggregateTenders(items), [items]);

  // KPIs superiores (simples)
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
                  <td className="px-4 py-3">
                    {/* De momento no calculamos cobertura real; deja un placeholder o “—” */}
                    {row.stockDays ? <Badge kind={row.stockDays < 10 ? 'red' : row.stockDays < 20 ? 'yellow' : 'green'}>
                      {row.stockDays} days
                    </Badge> : '—'}
                  </td>
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
