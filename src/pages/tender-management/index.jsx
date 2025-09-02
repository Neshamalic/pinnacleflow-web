// src/pages/tender-management/index.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGoogleSheet } from '@/lib/googleSheet';

const SHEET_NAME = 'tender_items'; // tu hoja

function StatCard({ title, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex-1">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function Pill({ children, tone = 'default' }) {
  const toneClass =
    tone === 'red'
      ? 'bg-red-50 text-red-700 border-red-200'
      : tone === 'green'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : tone === 'yellow'
      ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
      : 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center border text-xs px-2 py-1 rounded-lg ${toneClass}`}>
      {children}
    </span>
  );
}

export default function TenderManagement() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1) Carga de datos desde Apps Script
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchGoogleSheet({ sheetId: '', sheetName: SHEET_NAME });
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching tender_items:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => (cancelled = true);
  }, []);

  // 2) Agrupa por tender_number para mostrar 1 fila por licitación
  const tenders = useMemo(() => {
    const map = new Map();
    for (const r of rows) {
      const id =
        r.tender_number ||
        r.tender_id ||
        r.tender ||
        ''; // ajusta si tu campo se llama distinto
      if (!id) continue;

      if (!map.has(id)) {
        map.set(id, {
          tenderId: id,
          // trata de encontrar un título “bonito”
          title:
            r.tender_title ||
            r.title ||
            r.category ||
            r.product_name ||
            r.presentation_name ||
            '—',
          products: 0,
          status: r.status || r.tender_status || 'Awarded',
          deliveryDate:
            r.first_delivery ||
            r.first_delivery_date ||
            r.delivery_date ||
            r.deliveryDate ||
            '',
          stockCoverageDays: r.stock_coverage_days || r.stock_coverage || null,
          totalValue: r.total_value || 0,
        });
      }
      const g = map.get(id);
      g.products += 1;
      // si en alguna fila viene una fecha “mejor”, la dejamos
      if (r.first_delivery || r.first_delivery_date) {
        g.deliveryDate = r.first_delivery || r.first_delivery_date;
      }
      if (r.stock_coverage_days && !g.stockCoverageDays) {
        g.stockCoverageDays = r.stock_coverage_days;
      }
      if (r.total_value) {
        const n = Number(String(r.total_value).replace(/[^\d.-]/g, ''));
        if (!Number.isNaN(n)) g.totalValue += n;
      }
    }
    return Array.from(map.values());
  }, [rows]);

  // 3) Métricas
  const stats = useMemo(() => {
    const active = tenders.length; // simplificado
    const awarded = tenders.filter(t => String(t.status).toLowerCase().includes('award')).length;
    const inDelivery = tenders.filter(t =>
      String(t.status).toLowerCase().includes('deliver')
    ).length;
    return { active, awarded, inDelivery };
  }, [tenders]);

  const fmtCLP = (n) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(
      Number.isFinite(n) ? n : 0
    );

  const handleNew = () => navigate('/tender-management/new');
  const handleView = (id) => navigate(`/tender-management/${encodeURIComponent(id)}`);
  const handleEdit = (id) => navigate(`/tender-management/${encodeURIComponent(id)}/edit`);

  return (
    <div className="space-y-6">
      {/* Encabezado + acciones */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-500">Dashboard &gt; Tender Management</div>
          <h1 className="text-2xl font-semibold">Tender Management</h1>
          <p className="text-slate-500 text-sm">
            Manage and oversee all CENABAST tenders from registration through delivery tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNew}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-lg"
          >
            + New Tender
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Active" value={loading ? '—' : stats.active} />
        <StatCard title="Awarded" value={loading ? '—' : stats.awarded} />
        <StatCard title="In Delivery" value={loading ? '—' : stats.inDelivery} />
      </div>

      {/* Tabla */}
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
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan={8}>
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && tenders.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan={8}>
                    No tenders found in “{SHEET_NAME}”.
                  </td>
                </tr>
              )}
              {!loading &&
                tenders.map((t) => {
                  const statusText = String(t.status || '').toLowerCase();
                  let tone = 'default';
                  if (statusText.includes('reject') || statusText.includes('overdue')) tone = 'red';
                  else if (statusText.includes('award') || statusText.includes('ready')) tone = 'green';
                  else if (statusText.includes('deliver') || statusText.includes('pending')) tone = 'yellow';

                  const stockPill = Number.isFinite(+t.stockCoverageDays) ? (
                    <Pill tone={+t.stockCoverageDays <= 10 ? 'red' : +t.stockCoverageDays <= 30 ? 'yellow' : 'green'}>
                      {+t.stockCoverageDays} days
                    </Pill>
                  ) : (
                    <span className="text-slate-400">—</span>
                  );

                  return (
                    <tr key={t.tenderId}>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">{t.tenderId}</td>
                      <td className="px-4 py-3">{t.title}</td>
                      <td className="px-4 py-3">{t.products}</td>
                      <td className="px-4 py-3">
                        <Pill tone={tone}>{t.status || '—'}</Pill>
                      </td>
                      <td className="px-4 py-3">{t.deliveryDate || '—'}</td>
                      <td className="px-4 py-3">{stockPill}</td>
                      <td className="px-4 py-3">{fmtCLP(t.totalValue)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleView(t.tenderId)}
                            className="text-slate-700 hover:text-slate-900 underline"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(t.tenderId)}
                            className="text-slate-700 hover:text-slate-900 underline"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
