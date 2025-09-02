import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchGoogleSheet } from '@/lib/googleSheet';

const SHEET_NAME = 'tender_items';

const columns = [
  { key: 'tender_number', label: 'Tender #' },
  { key: 'tender_name', label: 'Nombre' },
  { key: 'country', label: 'País' },
  { key: 'buyer', label: 'Comprador' },
  { key: 'supplier_name', label: 'Proveedor' },
  { key: 'presentation_code', label: 'Código' },
  { key: 'product_name', label: 'Producto' },
  { key: 'package_units', label: 'Pack' },
  { key: 'tender_qty_units', label: 'Cant. Licitada' },
  { key: 'tender_awarded_units', label: 'Cant. Adjudicada' },
  { key: 'unit_price', label: 'Precio Unit.' },
  { key: 'currency', label: 'Moneda' },
  { key: 'delivery_location', label: 'Entrega' },
  { key: 'incoterm', label: 'Incoterm' },
  { key: 'award_year', label: 'Año' },
  { key: 'status', label: 'Estado' },
];

function toNumber(n) {
  if (n === null || n === undefined || n === '') return null;
  const num = Number(String(n).toString().replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(num) ? num : null;
}
function fmtInt(n) {
  const x = toNumber(n);
  return x === null ? '—' : Math.round(x).toLocaleString();
}
function fmtCurr(n, currency = 'USD') {
  const x = toNumber(n);
  if (x === null) return '—';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    }).format(x);
  } catch {
    return x.toLocaleString();
  }
}

export default function TenderManagement() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchGoogleSheet({ sheetId: '', sheetName: SHEET_NAME });
        if (mounted) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setErr(String(e?.message || e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const statuses = useMemo(() => {
    const s = new Set();
    rows.forEach(r => {
      const v = String(r.status ?? '').trim();
      if (v) s.add(v);
    });
    return ['all', ...Array.from(s)];
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(r => {
      if (status !== 'all' && String(r.status ?? '').trim() !== status) return false;
      if (!needle) return true;
      // búsqueda simple sobre campos de texto más relevantes
      const haystack = [
        r.tender_number, r.tender_name, r.country, r.buyer, r.supplier_name,
        r.presentation_code, r.product_name, r.delivery_location, r.incoterm, r.currency
      ].map(v => String(v ?? '').toLowerCase()).join(' ');
      return haystack.includes(needle);
    });
  }, [rows, q, status]);

  return (
    <div className="min-h-screen w-full bg-neutral-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Tender Management</h1>
            <p className="text-sm text-neutral-500">Listado maestro de items de licitación</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por #, nombre, proveedor, país…"
              className="h-10 w-64 rounded-xl border px-3 outline-none focus:ring-2 focus:ring-black/10"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 rounded-xl border px-3"
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s === 'all' ? 'Todos los estados' : s}</option>
              ))}
            </select>
            <Link
              to="/tender-management/new"
              className="inline-flex h-10 items-center rounded-xl bg-black px-4 text-white hover:opacity-90"
            >
              + Nuevo
            </Link>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        {err ? (
          <div className="rounded-xl border bg-red-50 p-4 text-red-700">
            Error: {err}
          </div>
        ) : loading ? (
          <div className="rounded-xl border bg-white p-6">Cargando…</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-neutral-50 text-neutral-500">
                  <tr>
                    {columns.map(c => (
                      <th key={c.key} className="whitespace-nowrap px-4 py-3 text-left font-medium">{c.label}</th>
                    ))}
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, idx) => {
                    const currency = String(r.currency || 'USD').toUpperCase();
                    return (
                      <tr key={idx} className="border-t hover:bg-neutral-50/60">
                        <td className="px-4 py-3 font-medium">{r.tender_number || '—'}</td>
                        <td className="px-4 py-3">{r.tender_name || '—'}</td>
                        <td className="px-4 py-3">{r.country || '—'}</td>
                        <td className="px-4 py-3">{r.buyer || '—'}</td>
                        <td className="px-4 py-3">{r.supplier_name || '—'}</td>
                        <td className="px-4 py-3">{r.presentation_code || '—'}</td>
                        <td className="px-4 py-3">{r.product_name || '—'}</td>
                        <td className="px-4 py-3">{r.package_units || '—'}</td>
                        <td className="px-4 py-3">{fmtInt(r.tender_qty_units)}</td>
                        <td className="px-4 py-3">{fmtInt(r.tender_awarded_units)}</td>
                        <td className="px-4 py-3">{fmtCurr(r.unit_price, currency)}</td>
                        <td className="px-4 py-3">{currency}</td>
                        <td className="px-4 py-3">{r.delivery_location || '—'}</td>
                        <td className="px-4 py-3">{r.incoterm || '—'}</td>
                        <td className="px-4 py-3">{r.award_year || '—'}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full border px-2 py-0.5 text-xs">
                            {r.status || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => navigate(`/tender-management/${encodeURIComponent(r.tender_number || '')}`)}
                            className="rounded-lg border px-3 py-1.5 hover:bg-neutral-50"
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-neutral-500">
                        No hay resultados con los filtros actuales.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-neutral-500">
              <span>Total: {filtered.length.toLocaleString()} filas</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
