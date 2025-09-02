// src/pages/tender-management/index.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchGoogleSheet } from '@/lib/googleSheet';

// Utiles de formato
const fmtCLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
const fmtDate = (s) => {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }); // 03/19/2024
};

// Mapeo de estilos de status (idéntico a Rocket)
const STATUS_STYLE = {
  Draft: { bg: '#F3F4F6', fg: '#4B5563', label: 'Draft' },            // gris
  Submitted: { bg: '#E0EAFF', fg: '#1D4ED8', label: 'Submitted' },    // azul
  Rejected: { bg: '#FDE2E2', fg: '#B91C1C', label: 'Rejected' },      // rojo
  'In Delivery': { bg: '#FEF3C7', fg: '#92400E', label: 'In Delivery' }, // amarillo
  Awarded: { bg: '#DCFCE7', fg: '#166534', label: 'Awarded' },        // verde
};

// Colorea la "pill" de coverage por tramos (igual que Rocket)
function coveragePill(days) {
  const n = Number(days) || 0;
  if (n <= 0) return { bg: '#F3F4F6', fg: '#4B5563', label: '—' };
  if (n < 10) return { bg: '#FDE2E2', fg: '#B91C1C', label: `${n} days`, bar: '#EF4444' };        // rojo
  if (n < 30) return { bg: '#FEF3C7', fg: '#92400E', label: `${n} days`, bar: '#F59E0B' };       // amarillo
  return { bg: '#DCFCE7', fg: '#166534', label: `${n} days`, bar: '#22C55E' };                   // verde
}

function StatusPill({ status }) {
  const st = STATUS_STYLE[status] || STATUS_STYLE.Draft;
  return (
    <span
      style={{
        background: st.bg,
        color: st.fg,
        borderRadius: 20,
        padding: '4px 10px',
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {st.label}
    </span>
  );
}

function CoverageCell({ days }) {
  const cfg = coveragePill(days);
  // barrita pequeñita como en Rocket (~100px) con esquinas redondeadas
  const pct = Math.max(0, Math.min(100, (Number(days) || 0) / 90 * 100)); // 90 días = 100%
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          background: cfg.bg,
          color: cfg.fg,
          borderRadius: 999,
          padding: '4px 10px',
          fontSize: 12,
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        {cfg.label}
      </span>
      <div style={{ width: 120, height: 6, background: '#E5E7EB', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: cfg.bar || '#9CA3AF' }} />
      </div>
    </div>
  );
}

// Adaptador: normaliza lo que viene de Sheets a nuestro modelo de UI
function normalizeRow(r) {
  return {
    id: r.tender_id || r.tender || r.id || '',
    title: r.title || '',
    createdAt: r.created_at || '',
    products: Number(r.products_count || r.products || 0),
    status: (r.status || 'Draft').trim(),
    deliveryDate: r.delivery_date || '',
    coverageDays: Number(r.stock_coverage_days || r.coverage_days || r.coverage || 0),
    totalValue: Number(r.total_value_clp || r.total_value || 0),
  };
}

export default function TenderManagement() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchGoogleSheet({ sheetId: null, sheetName: 'tenders' });
        if (!alive) return;
        setRows((data || []).map(normalizeRow));
      } catch (e) {
        setErr(e?.message || 'Error fetching tenders');
      } finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const headerStyle = { color: '#6B7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' };
  const cellStyle = { fontSize: 14, color: '#111827' };

  return (
    <div style={{ padding: 24 }}>
      {/* Breadcrumb + título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6B7280', fontSize: 12, marginBottom: 8 }}>
        <span>Dashboard</span>
        <span>›</span>
        <span style={{ color: '#111827', fontWeight: 600 }}>Tender Management</span>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Tender Management</h1>
      <p style={{ color: '#6B7280', marginBottom: 20 }}>
        Manage and oversee all CENABAST tenders from registration through delivery tracking.
      </p>

      {/* Top KPIs (mock) */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <KpiCard label="Active" value={12} />
        <KpiCard label="Awarded" value={8} />
        <KpiCard label="In Delivery" value={5} />
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff' }}>
            Export
          </button>
          <button
            className="btn-primary"
            style={{ padding: '8px 12px', borderRadius: 8, background: '#2563EB', color: '#fff', fontWeight: 600 }}
            onClick={() => navigate('/tender-management/new')}
          >
            + New Tender
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead style={{ background: '#F9FAFB' }}>
              <tr>
                <th style={{ ...headerStyle, textAlign: 'left', padding: '12px 16px', width: 36 }}>
                  <input type="checkbox" aria-label="select all" />
                </th>
                <th style={{ ...headerStyle, textAlign: 'left', padding: '12px 16px', width: 220 }}>Tender ID</th>
                <th style={{ ...headerStyle, textAlign: 'left', padding: '12px 16px' }}>Title</th>
                <th style={{ ...headerStyle, textAlign: 'left', padding: '12px 16px', width: 110 }}>Products</th>
                <th style={{ ...headerStyle, textAlign: 'left', padding: '12px 16px', width: 140 }}>Status</th>
                <th style={{ ...headerStyle, textAlign: 'left', padding: '12px 16px', width: 140 }}>Delivery Date</th>
                <th style={{ ...headerStyle, textAlign: 'left', padding: '12px 16px', width: 230 }}>Stock Coverage</th>
                <th style={{ ...headerStyle, textAlign: 'right', padding: '12px 16px', width: 160 }}>Total Value</th>
                <th style={{ ...headerStyle, textAlign: 'center', padding: '12px 12px', width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} style={{ padding: 24, textAlign: 'center', color: '#6B7280' }}>Loading…</td>
                </tr>
              )}
              {!!err && !loading && (
                <tr>
                  <td colSpan={9} style={{ padding: 24, textAlign: 'center', color: '#B91C1C' }}>{err}</td>
                </tr>
              )}
              {!loading && !err && rows.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: 24, textAlign: 'center', color: '#6B7280' }}>No tenders found.</td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '14px 16px' }}><input type="checkbox" aria-label={`select ${r.id}`} /></td>
                  <td style={{ ...cellStyle, padding: '14px 16px', fontWeight: 600 }}>{r.id}</td>
                  <td style={{ ...cellStyle, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontWeight: 600, color: '#111827' }}>{r.title || '—'}</span>
                      {r.createdAt ? (
                        <span style={{ color: '#6B7280', fontSize: 12 }}>Created: {fmtDate(r.createdAt)}</span>
                      ) : null}
                    </div>
                  </td>
                  <td style={{ ...cellStyle, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700 }}>{r.products}</span>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M11 2v2.07a7.002 7.002 0 014.95 4.95H18v2h-2.05a7.002 7.002 0 01-4.95 4.95V18h-2v-2.05A7.002 7.002 0 014.05 11H2v-2h2.05A7.002 7.002 0 019 4.05V2h2zm-1 4a5 5 0 100 10A5 5 0 0010 6z" fill="#9CA3AF"/></svg>
                    </div>
                  </td>
                  <td style={{ ...cellStyle, padding: '14px 16px' }}>
                    <StatusPill status={r.status} />
                  </td>
                  <td style={{ ...cellStyle, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#111827' }}>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M6 2a2 2 0 00-2 2v1h12V4a2 2 0 00-2-2H6zM4 7v9a2 2 0 002 2h8a2 2 0 002-2V7H4z" fill="#9CA3AF"/></svg>
                      {fmtDate(r.deliveryDate)}
                    </div>
                  </td>
                  <td style={{ ...cellStyle, padding: '14px 16px' }}>
                    <CoverageCell days={r.coverageDays} />
                  </td>
                  <td style={{ ...cellStyle, padding: '14px 16px', textAlign: 'right', fontWeight: 700 }}>
                    {fmtCLP.format(r.totalValue || 0)}
                  </td>
                  <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <Link to={`/tender-management/${encodeURIComponent(r.id)}`} title="View" aria-label="View">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12a5 5 0 110-10 5 5 0 010 10z" fill="#6B7280"/></svg>
                      </Link>
                      <Link to={`/tender-management/${encodeURIComponent(r.id)}/edit`} title="Edit" aria-label="Edit">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="#6B7280"/></svg>
                      </Link>
                      {/* Kebab igual que Rocket (aquí sin menú aún, puedes abrir un menu si quieres) */}
                      <button
                        title="More"
                        aria-label="More"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6 }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 8a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" fill="#6B7280"/></svg>
                      </button>
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

function KpiCard({ label, value }) {
  return (
    <div style={{
      minWidth: 160,
      border: '1px solid #E5E7EB',
      borderRadius: 12,
      padding: 16,
      background: '#fff'
    }}>
      <div style={{ color: '#6B7280', fontSize: 12, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{value}</div>
    </div>
  );
}
