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

const SHEET_TENDER_ITEMS = 'tender_items';
const SHEET_DEMAND = 'demand';

/* Pills & Icons */
function Pill({ tone = 'muted', children, icon = null }) {
  return <span className={`pf-pill ${tone}`}>{icon}{children}</span>;
}
const IconCheck  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconX      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const IconFile   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2"/><path d="M14 2v6h6" stroke="currentColor" strokeWidth="2"/></svg>;
const IconTruck  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 7h13v8H3zM16 10h4l1 3v2h-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="2"/><circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="2"/></svg>;
const IconClock  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;

/* Mapping helpers */
const pick = (row, keys) => { for (const k of keys) if (row[k] != null && row[k] !== '') return row[k]; };
const getTenderId   = (r) => String(pick(r, ['tender_number','tender_id','tender','Tender','TENDER_ID']) || '').trim();
const getTitle      = (r) => pick(r, ['tender_title','title','category','product_name','presentation_name']) || '—';
const getStatusRaw  = (r) => String(pick(r, ['status','tender_status','Status']) || '').toLowerCase();

/* Normaliza status (prioridad) */
function resolveTenderStatus(items) {
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
    case 'rejected':    return <Pill tone="danger"><IconX/>rejected</Pill>;
    case 'submitted':   return <Pill tone="info"><IconFile/>submitted</Pill>;
    case 'in_delivery': return <Pill tone="warning"><IconTruck/>in delivery</Pill>;
    case 'draft':       return <Pill tone="muted">draft</Pill>;
    default:            return <Pill tone="success"><IconCheck/>awarded</Pill>;
  }
}

function CoverageBadge({ days }) {
  const b = badgeForDays(days);
  return <Pill tone={b.tone}><IconClock/>{b.label}</Pill>;
}

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

  const demandMap = useMemo(() => buildDemandMap(demandRows), [demandRows]);

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
      const agg = aggregateTenderRow(items, demandMap, 'min');
      agg.title = getTitle(items[0]);
      agg.status = resolveTenderStatus(items);
      out.push(agg);
    }

    out.sort((a,b) => {
      const da = a.deliveryDate ? +a.deliveryDate : Infinity;
      const db = b.deliveryDate ? +b.deliveryDate : Infinity;
      return da - db;
    });
    return out;
  }, [tenderItems, demandMap]);

  const stats = useMemo(() => ({
    active: tenders.length,
    awarded: tenders.filter(t => t.status === 'awarded').length,
    inDelivery: tenders.filter(t => t.status === 'in_delivery').length,
  }), [tenders]);

  const handleNew  = () => navigate('/tender-management/new');
  const handleView = (id) => navigate(`/tender-management/${encodeURIComponent(id)}`);
  const handleEdit = (id) => navigate(`/tender-management/${encodeURIComponent(id)}/edit`);

  return (
    <div className="pf-page">
      {/* header */}
      <div className="pf-header">
        <div>
          <div className="pf-breadcrumb">Dashboard &gt; Tender Management</div>
          <h1>Tender Management</h1>
          <div style={{ color: "#64748b", fontSize: 14 }}>
            Manage and oversee all CENABAST tenders from registration through delivery tracking.
          </div>
        </div>
        <button className="pf-btn-primary" onClick={handleNew}>+ New Tender</button>
      </div>

      {/* stats */}
      <div className="pf-stats">
        <div className="pf-card pf-stat">
          <div className="label">Active</div>
          <div className="value">{loading ? '—' : stats.active}</div>
        </div>
        <div className="pf-card pf-stat">
          <div className="label">Awarded</div>
          <div className="value">{loading ? '—' : stats.awarded}</div>
        </div>
        <div className="pf-card pf-stat">
          <div className="label">In Delivery</div>
          <div className="value">{loading ? '—' : stats.inDelivery}</div>
        </div>
      </div>

      {/* table */}
      <div className="pf-card">
        <div className="pf-table-wrap">
          <table className="pf-table">
            <thead>
              <tr>
                <th>Tender ID</th>
                <th>Title</th>
                <th>Products</th>
                <th>Status</th>
                <th>Delivery Date</th>
                <th>Stock Coverage</th>
                <th>Total Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan="8" style={{ color: "#64748b", padding: 16 }}>Loading…</td></tr>
              )}
              {!loading && tenders.length === 0 && (
                <tr><td colSpan="8" style={{ color: "#64748b", padding: 16 }}>
                  No tenders found in “{SHEET_TENDER_ITEMS}”.
                </td></tr>
              )}

              {!loading && tenders.map(t => (
                <tr key={t.tenderId}>
                  <td style={{ whiteSpace: "nowrap", fontWeight: 600 }}>{t.tenderId}</td>
                  <td>{t.title}</td>
                  <td>{t.productsCount}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td>{formatDateMDY(t.deliveryDate)}</td>
                  <td><CoverageBadge days={t.daysSupply} /></td>
                  <td>{formatCLP(t.totalValue)}</td>
                  <td>
                    <div className="pf-actions">
                      <button className="pf-link" onClick={() => handleView(t.tenderId)}>View</button>
                      <button className="pf-link" onClick={() => handleEdit(t.tenderId)}>Edit</button>
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
