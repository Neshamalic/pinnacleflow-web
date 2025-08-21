// src/pages/dashboard/index.jsx
import React, { useEffect, useMemo, useState } from 'react';

import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

import { fetchGoogleSheet } from '../../lib/googleSheet';
import { SHEET_ID } from '../../lib/sheetsConfig';

function fmtNumber(n) {
  if (n == null || isNaN(n)) return '0';
  return new Intl.NumberFormat().format(n);
}

function toYMD(dateLike) {
  const d = new Date(dateLike);
  if (isNaN(d)) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Datos crudos
  const [tenderItems, setTenderItems] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [purchaseOrderItems, setPurchaseOrderItems] = useState([]);
  const [imports, setImports] = useState([]);
  const [demand, setDemand] = useState([]);

  async function loadAll() {
    setLoading(true);
    try {
      const [
        tenderRows,
        poRows,
        poiRows,
        importRows,
        demandRows,
      ] = await Promise.all([
        fetchGoogleSheet({ sheetId: SHEET_ID, sheetName: 'tender_items' }),
        // si tienes la hoja purchase_orders la usamos, y como respaldo usamos purchase_order_items
        fetchGoogleSheet({ sheetId: SHEET_ID, sheetName: 'purchase_orders' }).catch(() => []),
        fetchGoogleSheet({ sheetId: SHEET_ID, sheetName: 'purchase_order_items' }).catch(() => []),
        fetchGoogleSheet({ sheetId: SHEET_ID, sheetName: 'imports' }).catch(() => []),
        fetchGoogleSheet({ sheetId: SHEET_ID, sheetName: 'demand' }).catch(() => []),
      ]);

      setTenderItems(tenderRows || []);
      setPurchaseOrders(poRows || []);
      setPurchaseOrderItems(poiRows || []);
      setImports(importRows || []);
      setDemand(demandRows || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard load error:', err);
      setTenderItems([]);
      setPurchaseOrders([]);
      setPurchaseOrderItems([]);
      setImports([]);
      setDemand([]);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  // ====== KPIs ===============================================================
  const kpis = useMemo(() => {
    // Tenders = # licitaciones únicas por tender_number
    const tenderCount = new Set(
      (tenderItems || []).map(r => String(r?.tender_number || '').trim()).filter(Boolean)
    ).size;

    // Purchase Orders = si existe hoja purchase_orders, contamos sus po_number;
    // si no, contamos po uniques de purchase_order_items
    let poCount = 0;
    if ((purchaseOrders || []).length) {
      poCount = new Set(
        purchaseOrders.map(r => String(r?.po_number || '').trim()).filter(Boolean)
      ).size;
    } else {
      poCount = new Set(
        (purchaseOrderItems || []).map(r => String(r?.po_number || '').trim()).filter(Boolean)
      ).size;
    }

    // Imports = # OCI (oci_number) únicos
    const importCount = new Set(
      (imports || []).map(r => String(r?.oci_number || '').trim()).filter(Boolean)
    ).size;

    // Next Month Demand (simple): sumamos “demand_qty” del próximo mes si existe
    let nextMonthDemand = 0;
    try {
      const now = new Date();
      const nm = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const y = nm.getFullYear();
      const m = String(nm.getMonth() + 1).padStart(2, '0');

      const rowsNextMonth = (demand || []).filter(r => {
        // intentamos reconocer columnas tipo "month_of_supply" (YYYY-MM) o "month"
        const mo = String(r?.month_of_supply || r?.month || '').slice(0, 7);
        return mo === `${y}-${m}`;
      });

      nextMonthDemand = rowsNextMonth.reduce((acc, r) => {
        const v = Number(r?.demand_qty ?? r?.qty ?? 0);
        return acc + (isNaN(v) ? 0 : v);
      }, 0);
    } catch (_err) {
      nextMonthDemand = 0;
    }

    return {
      tenders: tenderCount,
      purchaseOrders: poCount,
      imports: importCount,
      nextMonthDemand: nextMonthDemand,
    };
  }, [tenderItems, purchaseOrders, purchaseOrderItems, imports, demand]);

  // ====== Milestones =========================================================
  // Tomamos ETA de imports (si existe), próximos 90 días
  const milestones = useMemo(() => {
    const list = [];

    (imports || []).forEach(row => {
      const eta = row?.eta || row?.arrival_date || row?.expected_arrival;
      if (!eta) return;
      const d = new Date(eta);
      if (isNaN(d)) return;

      const daysAhead = (d - new Date()) / (1000 * 60 * 60 * 24);
      if (daysAhead < -1 || daysAhead > 90) return;

      const label =
        (row?.oci_number ? `OCI ${row.oci_number}` : '') +
        (row?.po_number ? ` / PO ${row.po_number}` : '');

      list.push({
        date: d,
        type: 'Import ETA',
        detail: label || 'Incoming shipment',
      });
    });

    // Puedes añadir milestones de órdenes (ej: promised_date) si tu hoja lo tiene
    (purchaseOrders || []).forEach(row => {
      const pd = row?.promised_date || row?.eta;
      if (!pd) return;
      const d = new Date(pd);
      if (isNaN(d)) return;

      const daysAhead = (d - new Date()) / (1000 * 60 * 60 * 24);
      if (daysAhead < -1 || daysAhead > 90) return;

      list.push({
        date: d,
        type: 'PO Milestone',
        detail: row?.po_number ? `PO ${row.po_number}` : 'Purchase order',
      });
    });

    // orden por fecha asc
    return list.sort((a, b) => a.date - b.date).slice(0, 12);
  }, [imports, purchaseOrders]);

  const lastUpdatedLabel = lastUpdated
    ? new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(lastUpdated)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Encabezado + acciones */}
          <div className="mb-6">
            <Breadcrumb />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                  Overview of Pinnacle Chile supply chain operations
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  iconName="RefreshCcw"
                  iconPosition="left"
                >
                  Refresh Data
                </Button>
                <Button variant="default" iconName="Download" iconPosition="left">
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <KpiCard
              title="Tenders"
              value={fmtNumber(kpis.tenders)}
              icon="FileText"
              subtitle="+0% vs last month"
            />
            <KpiCard
              title="Purchase Orders"
              value={fmtNumber(kpis.purchaseOrders)}
              icon="ShoppingCart"
              subtitle="+0% vs last week"
              accent="green"
            />
            <KpiCard
              title="Imports"
              value={fmtNumber(kpis.imports)}
              icon="Truck"
              subtitle="+0% trend"
              accent="blue"
            />
            <KpiCard
              title="Next Month Demand"
              value={fmtNumber(kpis.nextMonthDemand)}
              icon="Calendar"
              subtitle="Projected units"
              accent="amber"
            />
          </div>

          {/* Barra estado / última actualización */}
          <div className="flex items-center justify-end text-sm text-muted-foreground mb-4">
            <Icon name="Clock" size={16} className="mr-2" />
            <span>Last updated: {lastUpdatedLabel || 'loading…'}</span>
          </div>

          {/* Upcoming Milestones */}
          <section className="bg-card border border-border rounded-xl">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Upcoming Milestones</h2>
              <div className="text-sm text-muted-foreground">
                Showing {milestones.length} {milestones.length === 1 ? 'item' : 'items'}
              </div>
            </div>

            <div className="p-2">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td className="px-4 py-4 text-muted-foreground" colSpan={3}>
                          Loading…
                        </td>
                      </tr>
                    ) : milestones.length === 0 ? (
                      <tr>
                        <td className="px-4 py-6 text-muted-foreground" colSpan={3}>
                          No upcoming milestones in the next 90 days.
                        </td>
                      </tr>
                    ) : (
                      milestones.map((m, i) => (
                        <tr
                          key={`${m.type}-${i}-${m.date.toISOString()}`}
                          className="border-t border-border hover:bg-muted/40"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            {toYMD(m.date)}
                          </td>
                          <td className="px-4 py-3">
                            <TypeBadge type={m.type} />
                          </td>
                          <td className="px-4 py-3">{m.detail || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* =====================  UI helpers (cards / badges)  ===================== */

function KpiCard({ title, value, icon = 'FileText', subtitle, accent = 'slate' }) {
  const iconClasses = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
  }[accent] || 'bg-slate-100 text-slate-700';

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${iconClasses}`}>
          <Icon name={icon} size={18} />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="mt-1 text-3xl font-semibold text-foreground">{value}</div>
        {subtitle ? (
          <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>
        ) : null}
      </div>
    </div>
  );
}

function TypeBadge({ type }) {
  const config =
    type === 'Import ETA'
      ? { icon: 'Truck', cls: 'bg-blue-100 text-blue-700' }
      : { icon: 'ShoppingCart', cls: 'bg-emerald-100 text-emerald-700' };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs ${config.cls}`}>
      <Icon name={config.icon} size={14} />
      {type}
    </span>
  );
}
