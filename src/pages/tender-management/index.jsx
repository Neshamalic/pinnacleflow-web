// src/pages/tender-management/index.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  fetchGoogleSheet,
  buildDemandMap,
  aggregateTenderRow,
  badgeForDays,
  formatDateMDY,
  formatCLP,
} from '@/lib/googleSheet';

// Hojas que leemos en Google Sheets
const SHEET_TENDER_ITEMS = 'tender_items';
const SHEET_DEMAND = 'demand';

/* ----------------------------- Iconos y Pills ----------------------------- */
function Pill({ tone = 'muted', children, icon = null }) {
  const tones = {
    muted: 'bg-slate-50 text-slate-600 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    default: 'bg-slate-50 text-slate-700 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 border text-xs px-2 py-1 rounded-lg ${tones[tone] || tones.default}`}>
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

/* ------------------------- utilidades para mapeo -------------------------- */
const pick = (row, keys) => {
  for (const k of keys) if (row[k] != null && row[k] !== '') return row[k];
  return undefined;
};
const getTenderId = (r) => String(pick(r, ['tender_number','tender_id','tender','Tender','TENDER_ID']) || '').trim();
const getTitle = (r) => pick(r, ['tender_title','title','category','product_name','presentation_name']) || '—';
const getStatusRaw = (r) => String(pick(r, ['status','tender_status','Status']) || '').toLowerCase();

/** Normaliza el status y prioriza el más “crítico”, parecido a Rocket. */
function resolveTenderStatus(items) {
  // prioridad: rejected > submitted > in delivery > draft > awarded (default)
  let has = { rejected:false, submitted:false, delivery:false, draft:false, awarded:false };
  for (const r of items) {
    const s = getStatusRaw(r);
    if (s.includes('reject')) has.rejected = true;
    else if (s.includes('submit')) has.submitted = true;
    else if (s.includes('deliver')) has.delivery = true;
    else if (s.includes('draft')) has.draft = true;
    else if (s.includes('award')) has.awarded = true;
  }
  if (has.rejected) return 'rejected';
  if (has.submitted) return 'submitted';
  if (has.delivery) return 'in_delivery';
  if (has.draft) return 'draft';
  return 'awarded';
}

function StatusBadge({ status }) {
  switch (status) {
    case 'rejected':    return <Pill tone="danger"  icon={<IconX/>}>rejected</Pill>;
    case 'submitted':   return <Pill tone="info"    icon={<IconFile/>}>submitted</Pill>;
    case 'in_delivery': return <Pill tone="warning" icon={<IconTruck/>}>in delivery</Pill>;
    case 'draft':       return <Pill tone="muted">draft</Pill>;
    default:            return <Pill tone="success" icon={<IconCheck/>}>awarded</Pill>;
  }
}

function CoverageBadge({ days }) {
  const b = badgeForDays(days); // { label, tone }
  const toneMap = { success:'success', warning:'warning', danger:'danger', muted:'muted' };
  return <Pill tone={toneMap[b.tone] || 'muted'} icon={<IconClock/>}>{b.label}</Pill>;
}

/* ============================== Componente ================================ */
export default function TenderManagement() {
  const navigate = useNavigate();
  const [tenderItems, setTenderItems] = useState([]);
  const [demandRows, setDemandRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [items, demand] = await Promise.all([
          fetchGoogleSheet({ sheetId: '', sheetName: SHEET_TENDER_ITEMS }),
          fetchGoogleSheet({ sheetId: '', sheetName: SHEET_DEMAND }).catch(() => []),
        ]);
        if (!cancelled) {
          setTenderItems(Array.isArray(items) ? items : []);
          setDemandRows(Array.isArray(demand) ? demand : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Mapa de demanda por presentation_code
  const demandMap = useMemo(() => buildDemandMap(demandRows), [demandRows]);

  // Agrupación por tender y agregados (total value, delivery date, coverage, etc.)
  const tenders = useMemo(() => {
    const byTender = new Map();
    for (const r of tenderItems) {
      const id = getTenderId(r);
      if (!id) continue;
      if (!byTender.has(id)) byTender.set(id, []);
      byTender.get(id).push(r);
    }

    const out = [];
    for (const [id, items] of byTender) {
      const agg = aggregateTenderRow(items, demandMap, 'min'); // cobertura "bottleneck"
      agg.title = getTitle(items[0]);              // título
      agg.status = resolveTenderStatus(items);     // status normalizado
      out.push(agg);
    }

    // ordenar por fecha de entrega asc
    out.sort((a, b) => {
      const da = a.deliveryDate ? +a.deliveryDate : Infinity;
      const db = b.deliveryDate ? +b.deliveryDate : Infinity;
      return da - db;
    });

    return out;
  }, [tenderItems, demandMap]);

  // métricas
  const stats = useMemo(() => {
    const active = tenders.length;
    const awarded = tenders.filter(t => t.status === 'awarded').length;
    const inDelivery = tenders.filter(t => t.status === 'in_delivery').length;
    return { active, awarded, inDelivery };
  }, [tenders]);

  // navegación
  const handleNew = () => navigate('/tender-management/new');
  const handleView = (id) => navigate(`/tender-management/${encodeURIComponent(id)}`);
  const handleEdit = (id) => navigate(`/tender-management/${encodeURIComponent(id)}/edit`);

  // ⬇️⬇️⬇️ EL WRAPPER ARRANCA COMO RECOMENDADO
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
        <div className="card p-4">
          <div className="text-sm text-slate-500">Active</div>
          <div className="text-2xl font-semibold mt-1">{loading ? '—' : stats.active}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-500">Awarded</div>
          <div className="text-2xl font-semibold mt-1">{loading ? '—' : stats.awarded}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-500">In Delivery</div>
          <div className="text-2xl font-semibold mt-1">{loading ? '—' : stats.inDelivery}</div>
        </div>
      </div>

      {/* tabla */}
      <div className="table-container">
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
                <tr><td colSpan={8} className="px-4 py-4 text-slate-500">No tenders found in “{SHEET_TENDER_ITEMS}”.</td></tr>
              )}

              {!loading && tenders.map((t) => (
                <tr key={t.tenderId}>
                  <td className="px-4 py-3 whitespace-nowrap font-medium">{t.tenderId}</td>
                  <td className="px-4 py-3">{t.title}</td>
                  <td className="px-4 py-3">{t.productsCount}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3">{formatDateMDY(t.deliveryDate)}</td>
                  <td className="px-4 py-3"><CoverageBadge days={t.daysSupply} /></td>
                  <td className="px-4 py-3">{formatCLP(t.totalValue)}</td>
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
