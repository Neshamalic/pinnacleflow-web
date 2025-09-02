// src/pages/tender-management/index.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { fetchGoogleSheet } from '@/lib/googleSheet'; // la función que ya usas para leer la sheet
import {
  buildDemandMap,
  aggregateTenderRow,
  badgeForDays,
  formatDateMDY,
  formatCLP,
} from '@/lib/googleSheet';

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
const SHEET_TENDER_ITEMS = 'tender_items';
const SHEET_DEMAND = 'demand';

export default function TenderManagement() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [tenderItems, demand] = await Promise.all([
          fetchGoogleSheet({ sheetId: SHEET_ID, sheetName: SHEET_TENDER_ITEMS }),
          fetchGoogleSheet({ sheetId: SHEET_ID, sheetName: SHEET_DEMAND }),
        ]);

        const demandMap = buildDemandMap(demand || []);

        // Agrupar tender_items por tender
        const byTender = new Map();
        for (const r of tenderItems || []) {
          const key =
            String(r.tender_id || r.tender_number || r.tender || '').trim();
          if (!key) continue;
          if (!byTender.has(key)) byTender.set(key, []);
          byTender.get(key).push(r);
        }

        const aggregated = [];
        for (const [tenderId, items] of byTender.entries()) {
          const agg = aggregateTenderRow(items, demandMap, 'min'); // o 'weighted'
          // agrega otros campos de tus items si quieres
          aggregated.push(agg);
        }

        setRows(aggregated);
      } catch (e) {
        console.error('TenderManagement load error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Tender Management</h1>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 font-medium">
            <tr>
              <th className="px-3 py-2 text-left">Tender ID</th>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-center">Products</th>
              <th className="px-3 py-2 text-left">Delivery Date</th>
              <th className="px-3 py-2 text-left">Stock Coverage</th>
              <th className="px-3 py-2 text-right">Total Value</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => {
              const badge = badgeForDays(r.daysSupply);
              return (
                <tr key={r.tenderId} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{r.tenderId || '—'}</td>
                  <td className="px-3 py-2">{r.title || '—'}</td>
                  <td className="px-3 py-2 text-center">{r.productsCount || 0}</td>
                  <td className="px-3 py-2">{formatDateMDY(r.deliveryDate)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        badge.tone === 'danger'
                          ? 'inline-flex text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5'
                          : badge.tone === 'warning'
                          ? 'inline-flex text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5'
                          : badge.tone === 'success'
                          ? 'inline-flex text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5'
                          : 'inline-flex text-gray-600 bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5'
                      }
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">{formatCLP(r.totalValue)}</td>
                  <td className="px-3 py-2">
                    <button className="text-indigo-600 hover:underline mr-3">View</button>
                    <button className="text-indigo-600 hover:underline">Edit</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

