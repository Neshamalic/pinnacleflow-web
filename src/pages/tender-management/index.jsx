// src/pages/tender-management/index.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGoogleSheet } from '@/lib/googleSheet';

const SHEET_NAME = 'tender_items';          // tu hoja principal
const COVERAGE_SHEET = 'stock_coverage';    // opcional, si la tienes

/* ------------ utilidades de formato ------------ */
const fmtCLP = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
    .format(Number.isFinite(n) ? n : 0);

const parseNumber = (v) => {
  if (v == null) return 0;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  // “CLP 62,000”, “62.000”, “89,000.50”, etc.
  const cleaned = String(v).replace(/[^\d.-]/g, '').replace(/(\..*)\./g, '$1');
  const num = Number(cleaned.replace(',', ''));
  return Number.isFinite(num) ? num : 0;
};

const fmtDate = (v) => {
  if (!v) return '—';
  // Soporta Date, ISO string, o Excel serial convertir via Date.parse
  const d = v instanceof Date ? v : new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

/* ------------ UI helpers (badges con iconos inline SVG) ------------ */
function Pill({ tone = 'default', children, icon = null }) {
  const toneMap = {
    default: 'bg-slate-50 text-slate-700 border-slate-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 border text-xs px-2 py-1 rounded-lg ${toneMap[tone] || toneMap.default}`}>
      {icon}
      {children}
    </span>
  );
}

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const IconFile = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2"/>
    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2"/>
  </svg>
);
const IconTruck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M3 7h13v8H3zM16 10h4l1 3v2h-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="2"/>
    <circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="2"/>
  </svg>
);
const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/* ------------ mapeo flexible de columnas ------------ */
const pick = (row, keys) => {
  for (const k of keys) {
    if (row[k] != null && row[k] !== '') return row[k];
  }
  return undefined;
};

const getTenderId = (r) => pick(r, ['tender_number','tender_id','tender','Tender','TENDER_ID']);
const getTitle = (r) => pick(r, ['tender_title','title','category','product_name','presentation_name']);
const getStatus = (r) => pick(r, ['status','tender_status','Status']);
const getDelivery = (r) => pick(r, ['first_delivery','first_delivery_date','delivery_date','DeliveryDate']);
const getQty = (r) => parseNumber(pick(r, ['qty','quantity','total_qty','QTY','Quantity']));
const getUnitPrice = (r) => parseNumber(pick(r, ['unit_price_clp','unit_price','price_clp','price','cost_clp','cost']));
const getRowTotalValue = (r) => {
  const explicitTotal = parseNumber(pick(r, ['line_total_clp','total_value','TotalValueCLP']));
  if (explicitTotal) return explicitTotal;
  const q = getQty(r);
  const p = getUnitPrice(r);
  return q * p;
};
const getRowCoverageDays = (r) =>
  parseNumber(pick(r, ['stock_coverage_days','stock_coverage','coverage_days','days_coverage']));

/* ------------ componente principal ------------ */
export default function TenderManagement() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [coverageRows, setCoverageRows] = useState([]); // opcional merge
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [base, coverage] = await Promise.all([
          fetchGoogleSheet({ sheetId: '', sheetName: SHEET_NAME }),
          // si falla / no existe, dejamos vacío
          fetchGoogleSheet({ sheetId: '', sheetName: COVERAGE_SHEET }).catch(() => []),
        ]);
        if (!cancelled) {
          setRows(Array.isArray(base) ? base : []);
          setCoverageRows(Array.isArray(coverage) ? coverage : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => (cancelled = true);
  }, []);

  // Indexar coverage por tenderId para merge rápido
  const coverageMap = useMemo(() => {
    const m = new Map();
    for (const r of coverageRows) {
      const id = getTenderId(r);
      if (!id) continue;
      const days = getRowCoverageDays(r);
      if (days) m.set(id, days);
    }
    return m;
  }, [coverageRows]);

  // Agregación por licitación (1 fila por tender)
  const tenders = useMemo(() => {
    const map = new Map();
    for (const r of rows) {
      const id = getTenderId(r);
      if (!id) continue;

      if (!map.has(id)) {
        map.set(id, {
          tenderId: id,
          title: getTitle(r) || '—',
          products: 0,
          status: getStatus(r) || 'awarded',
          deliveryDate: getDelivery(r) || null,
          stockCoverageDays: getRowCoverageDays(r) || null,
          totalValue: 0,
        });
      }
      const g = map.get(id);
      g.products += 1;

      // “mejor” fecha de entrega si la vemos en otra fila
      const d = getDelivery(r);
      if (d) g.deliveryDate = d;

      // merge coverage por fila, si no la tenemos aún
      if (!g.stockCoverageDays) {
        const c = getRowCoverageDays(r);
        if (c) g.stockCoverageDays = c;
      }

      // acumulamos total value
      g.totalValue += getRowTotalValue(r);
    }

    // merge opcional desde hoja stock_coverage
    for (const [id, g] of map) {
      if (!g.stockCoverageDays && coverageMap.has(id)) {
        g.stockCoverageDays = coverageMap.get(id);
      }
    }

    return Array.from(map.values());
  }, [rows, coverageMap]);

  // métricas
  const stats = useMemo(() => {
    const active = tenders.length;
    const awarded = tenders.filter(t => String(t.status).toLowerCase().includes('award')).length;
    const inDelivery = tenders.filter(t => String(t.status).toLowerCase().includes('deliver')).length;
    return { active, awarded, inDelivery };
  }, [tenders]);

  // navegación
  const handleNew = () => navigate('/tender-management/new');
  const handleView = (id) => navigate(`/tender-management/${encodeURIComponent(id)}`);
  const handleEdit = (id) => navigate(`/tender-management/${encodeURIComponent(id)}/edit`);

  // tono del badge por status
  const statusBadge = (statusRaw) => {
    const s = String(statusRaw || '').toLowerCase();
    if (s.includes('reject')) return <Pill tone="red" icon={<IconX/>}>rejected</Pill>;
    if (s.includes('submit')) return <Pill tone="blue" icon={<IconFile/>}>submitted</Pill>;
    if (s.includes('deliver')) return <Pill tone="yellow" icon={<IconTruck/>}>in delivery</Pill>;
    if (s.includes('draft')) return <Pill tone="default">draft</Pill>;
    return <Pill tone="green" icon={<IconCheck/>}>awarded</Pill>;
  };

  const coveragePill = (days) => {
    if (!Number.isFinite(+days)) return <span className="text-slate-400">—</span>;
    const n = +days;
    const tone = n <= 10 ? 'red' : n <= 30 ? 'yellow' : 'green';
    return <Pill tone={tone} icon={<IconClock/>}>{n} days</Pill>;
  };

  return (
    <div className="space-y-6">
      {/* encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-500">Dashboard &gt; Tender Management</div>
          <h1 className="text-2xl font-semibold">Tender Management</h1>
          <p className="text-slate-500 text-sm">
            Manage and oversee all CENABAST tenders from registration through delivery tracking.
          </p>
        </div>
        <button
          type="button"
          onClick={handleNew}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-lg"
        >
          + New Tender
        </button>
      </div>

      {/* métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-sm text-slate-500">Active</div>
          <div className="text-2xl font-semibold mt-1">{loading ? '—' : stats.active}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-sm text-slate-500">Awarded</div>
          <div className="text-2xl font-semibold mt-1">{loading ? '—' : stats.awarded}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-sm text-slate-500">In Delivery</div>
          <div className="text-2xl font-semibold mt-1">{loading ? '—' : stats.inDelivery}</div>
        </div>
      </div>

      {/* tabla */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
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
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr><td colSpan={8} className="px-4 py-4 text-slate-500">Loading…</td></tr>
              )}
              {!loading && tenders.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-4 text-slate-500">No tenders found in “{SHEET_NAME}”.</td></tr>
              )}

              {!loading && tenders.map((t) => (
                <tr key={t.tenderId}>
                  <td className="px-4 py-3 whitespace-nowrap font-medium">{t.tenderId}</td>
                  <td className="px-4 py-3">{t.title}</td>
                  <td className="px-4 py-3">{t.products}</td>
                  <td className="px-4 py-3">{statusBadge(t.status)}</td>
                  <td className="px-4 py-3">{fmtDate(t.deliveryDate)}</td>
                  <td className="px-4 py-3">{coveragePill(t.stockCoverageDays)}</td>
                  <td className="px-4 py-3">{fmtCLP(t.totalValue)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleView(t.tenderId)} className="text-slate-700 hover:text-slate-900 underline">View</button>
                      <button onClick={() => handleEdit(t.tenderId)} className="text-slate-700 hover:text-slate-900 underline">Edit</button>
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
