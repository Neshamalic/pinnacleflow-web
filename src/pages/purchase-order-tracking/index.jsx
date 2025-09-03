import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { fetchGoogleSheet } from '../../lib/googleSheet';
import { SHEET_ID } from '../../lib/sheetsConfig';

// Nombres de hojas (usa los que ya definiste en Apps Script)
const SHEET_PO = 'purchase_orders';
const SHEET_PO_ITEMS = 'purchase_order_items';

// -----------------------------
// UI helpers
// -----------------------------
const cardBase =
  'flex items-center justify-between rounded-xl border border-border bg-card px-4 py-4 md:px-6 md:py-5 shadow-sm';

const StatCard = ({ icon, title, value, footnote }) => (
  <div className={cardBase}>
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon name={icon || 'ShoppingCart'} size={18} className="text-primary" />
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-2xl font-semibold text-foreground">{value}</div>
      </div>
    </div>
    {footnote ? <div className="text-xs text-muted-foreground">{footnote}</div> : null}
  </div>
);

const pillColor = {
  default: 'bg-muted text-foreground',
  ready: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  inprocess: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  shipped: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

function StatusPill({ label }) {
  const key = String(label || '')
    .toLowerCase()
    .replace(/\s+/g, '');

  let cls = pillColor.default;
  if (key.includes('ready') || key.includes('approved')) cls = pillColor.ready || pillColor.default;
  else if (key.includes('process') || key.includes('pending')) cls = pillColor.inprocess || pillColor.default;
  else if (key.includes('ship')) cls = pillColor.shipped || pillColor.default;
  else if (key.includes('rejected')) cls = pillColor.rejected || pillColor.default;

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label || '—'}
    </span>
  );
}

function fmtMoney(n) {
  const num = Number(n);
  if (!isFinite(num)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
}
function fmtDateISO(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return '—';
  return dt.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
}
function daysBetween(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  if (isNaN(da) || isNaN(db)) return null;
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}

// -----------------------------
// Página principal
// -----------------------------
const PurchaseOrderTracking = () => {
  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [filters, setFilters] = useState({
    q: '',
    mfg: '',
    qc: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('language') || 'en';
    setLang(saved);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [poRows, itemRows] = await Promise.all([
          fetchGoogleSheet({ sheetId: SHEET_ID, sheetName: SHEET_PO }),
          fetchGoogleSheet({ sheetId: SHEET_ID, sheetName: SHEET_PO_ITEMS }),
        ]);

        // Agrupar items por PO para totalizar cantidad y valor
        const itemsByPO = (itemRows || []).reduce((acc, it) => {
          const k = it?.po_number || it?.po || '';
          if (!k) return acc;
          (acc[k] = acc[k] || []).push(it);
          return acc;
        }, {});

        const list = mapOrders(poRows || [], itemsByPO);
        setOrders(list);
        setLastUpdated(new Date());
      } catch (e) {
        console.error('PO load error:', e);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // KPI
  const totalOrders = orders.length;
  const inProcessCount = orders.filter((o) => includesAny(o.manufacturingStatus, ['process', 'pending'])).length;
  const readyCount = orders.filter((o) => includesAny(o.manufacturingStatus, ['ready', 'approved'])).length;
  const shippedCount = orders.filter((o) => includesAny(o.transportStatus, ['ship'])).length;

  // Promedio (ETA - OrderDate) de órdenes con ambas fechas válidas
  const avgProdDays = useMemo(() => {
    const diffs = orders
      .map((o) => daysBetween(o.orderDate, o.eta))
      .filter((d) => d !== null && isFinite(d) && d >= 0);
    if (!diffs.length) return '—';
    const avg = Math.round(diffs.reduce((s, d) => s + d, 0) / diffs.length);
    return `${avg} ${lang === 'es' ? 'días' : 'days'}`;
  }, [orders, lang]);

  // Filtros
  const filtered = useMemo(() => {
    const q = (filters.q || '').toLowerCase().trim();
    return orders
      .filter((o) => {
        if (q) {
          const hay =
            String(o.poNumber || '').toLowerCase().includes(q) ||
            String(o.tenderRef || '').toLowerCase().includes(q) ||
            String(o.supplier || '').toLowerCase().includes(q);
          if (!hay) return false;
        }
        if (filters.mfg && !equalsIgnoreCase(o.manufacturingStatus, filters.mfg)) return false;
        if (filters.qc && !equalsIgnoreCase(o.qcStatus, filters.qc)) return false;
        return true;
      })
      .sort((a, b) => {
        // Orden por fecha de pedido desc
        const ta = new Date(a.orderDate).getTime() || 0;
        const tb = new Date(b.orderDate).getTime() || 0;
        return tb - ta;
      });
  }, [orders, filters]);

  const t = (en, es) => (lang === 'es' ? es : en);
  const lastUpdatedLabel = lastUpdated
    ? new Intl.DateTimeFormat(lang === 'es' ? 'es-CL' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(lastUpdated)
    : '—';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <Breadcrumb />

          {/* Título + acciones */}
          <div className="mt-4 mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t('Purchase Order Tracking', 'Purchase Order Tracking')}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {t(
                  'Monitor production status and shipment coordination for orders to India',
                  'Monitor production status and shipment coordination for orders to India'
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" iconName="Download" iconPosition="left">
                {t('Export', 'Export')}
              </Button>
              <Button variant="default" iconName="Plus" iconPosition="left">
                {t('New Order', 'New Order')}
              </Button>
            </div>
          </div>

          {/* KPIs */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard icon="ShoppingCart" title={t('Total Orders', 'Total Orders')} value={totalOrders} />
            <StatCard icon="Clock" title={t('In Process', 'In Process')} value={inProcessCount} />
            <StatCard icon="CheckCircle" title={t('Ready', 'Ready')} value={readyCount} />
            <StatCard icon="Truck" title={t('Shipped', 'Shipped')} value={shippedCount} />
            <StatCard icon="Timer" title={t('Avg. Production Time', 'Avg. Production Time')} value={avgProdDays} />
          </div>

          {/* Filtros */}
          <div className={cardBase + ' mb-6'}>
            <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  {t('Search by PO, tender…', 'Search by PO, tender…')}
                </label>
                <input
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t('Search by PO, tender…', 'Search by PO, tender…')}
                  value={filters.q}
                  onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                />
              </div>

              <div className="grid flex-none grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    {t('Manufacturing Status', 'Manufacturing Status')}
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={filters.mfg}
                    onChange={(e) => setFilters((f) => ({ ...f, mfg: e.target.value }))}
                  >
                    <option value="">{t('All', 'All')}</option>
                    <option value="In Process">In Process</option>
                    <option value="Ready">Ready</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('QC Status', 'QC Status')}</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={filters.qc}
                    onChange={(e) => setFilters((f) => ({ ...f, qc: e.target.value }))}
                  >
                    <option value="">{t('All', 'All')}</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-none items-end md:items-center">
                <Button
                  variant="ghost"
                  onClick={() => setFilters({ q: '', mfg: '', qc: '' })}
                  iconName="Eraser"
                  iconPosition="left"
                >
                  {t('Clear Filters', 'Clear Filters')}
                </Button>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-4 py-3 text-xs text-muted-foreground">
              <div>{t('Purchase Orders', 'Purchase Orders')}</div>
              <div className="flex items-center gap-2">
                <Icon name="Clock" size={14} />
                <span>
                  {t('Last updated:', 'Last updated:')} {lastUpdatedLabel}
                </span>
              </div>
            </div>

            <div className="relative w-full overflow-x-auto">
              <table className="w-full whitespace-nowrap text-left text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">PO Number</th>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3">Tender Ref</th>
                    <th className="px-4 py-3">Manufacturing</th>
                    <th className="px-4 py-3">QC Status</th>
                    <th className="px-4 py-3">Transport</th>
                    <th className="px-4 py-3">ETA</th>
                    <th className="px-4 py-3">Total QTY</th>
                    <th className="px-4 py-3">Cost (USD)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">
                        {t('Loading…', 'Loading…')}
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">
                        {t('No orders found', 'No orders found')}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((o) => (
                      <tr key={o.poNumber} className="border-t border-border">
                        <td className="px-4 py-3 font-medium">{o.poNumber || '—'}</td>
                        <td className="px-4 py-3">{o.supplier || '—'}</td>
                        <td className="px-4 py-3">{o.tenderRef || '—'}</td>
                        <td className="px-4 py-3">
                          <StatusPill label={o.manufacturingStatus} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill label={o.qcStatus} />
                        </td>
                        <td className="px-4 py-3">{o.transport || '—'}</td>
                        <td className="px-4 py-3">{fmtDateISO(o.eta)}</td>
                        <td className="px-4 py-3">{isFinite(o.totalQty) ? o.totalQty : '—'}</td>
                        <td className="px-4 py-3">{fmtMoney(o.totalValueUSD)}</td>
                        <td className="px-4 py-3">
                          <StatusPill label={o.transportStatus || o.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-3 text-xs">
                            <button className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                              <Icon name="Eye" size={14} /> View
                            </button>
                            <button className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                              <Icon name="Pencil" size={14} /> Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className={cardBase + ' hover:shadow'}>
              <div className="flex items-center gap-3">
                <Icon name="FileBarChart2" size={18} />
                <div>
                  <div className="text-sm font-medium">Generate Report</div>
                  <div className="text-xs text-muted-foreground">Order status report</div>
                </div>
              </div>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </div>
            <div className={cardBase + ' hover:shadow'}>
              <div className="flex items-center gap-3">
                <Icon name="BellRing" size={18} />
                <div>
                  <div className="text-sm font-medium">Setup Alerts</div>
                  <div className="text-xs text-muted-foreground">ETA notifications</div>
                </div>
              </div>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </div>
            <div className={cardBase + ' hover:shadow'}>
              <div className="flex items-center gap-3">
                <Icon name="MessagesSquare" size={18} />
                <div>
                  <div className="text-sm font-medium">Communications</div>
                  <div className="text-xs text-muted-foreground">With India suppliers</div>
                </div>
              </div>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </div>
            <div className={cardBase + ' hover:shadow'}>
              <div className="flex items-center gap-3">
                <Icon name="Settings" size={18} />
                <div>
                  <div className="text-sm font-medium">Settings</div>
                  <div className="text-xs text-muted-foreground">System preferences</div>
                </div>
              </div>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PurchaseOrderTracking;

// -----------------------------
// Utilidades de mapeo/normalización
// -----------------------------
function includesAny(value, tokens = []) {
  const v = String(value || '').toLowerCase();
  return tokens.some((t) => v.includes(t));
}
function equalsIgnoreCase(a, b) {
  if (!a && !b) return true;
  return String(a || '').toLowerCase() === String(b || '').toLowerCase();
}

/**
 * Convierte las filas de purchase_orders + items agrupados a objetos "orden"
 * con valores seguros para la UI. Ajusta aquí si tus columnas tienen otros nombres.
 */
function mapOrders(poRows, itemsByPO) {
  return (poRows || []).map((r) => {
    const po = r?.po_number || r?.po || r?.PO || '';
    const items = itemsByPO[po] || [];

    const totalQty = items.reduce((s, it) => s + (Number(it?.qty) || Number(it?.quantity) || 0), 0);
    // Si no tienes cost_usd en la hoja de órdenes, estimamos por ítems (qty * unit_price_usd || unit_price)
    const sumItems = items.reduce((s, it) => {
      const q = Number(it?.qty) || Number(it?.quantity) || 0;
      const p =
        Number(it?.unit_price_usd) ||
        Number(it?.unit_price) ||
        Number(it?.price_usd) ||
        Number(it?.price) ||
        0;
      return s + q * p;
    }, 0);
    const costUsd =
      Number(r?.cost_usd) ||
      Number(r?.total_cost_usd) ||
      Number(r?.cost) ||
      Number(r?.total_value) ||
      sumItems;

    return {
      poNumber: po,
      supplier: r?.supplier_name || r?.supplier || '',
      tenderRef: r?.tender_ref || r?.tender || r?.tender_number || '',
      orderDate: r?.order_date || r?.date || '',
      incoterm: r?.incoterm || '',
      manufacturingStatus: r?.manufacturing_status || r?.manufacturing || r?.status || '',
      qcStatus: r?.qc_status || r?.qc || '',
      transport: r?.transport || r?.mode || '',
      eta: r?.eta || r?.arrival_eta || '',
      transportStatus: r?.transport_status || r?.shipping_status || '',
      status: r?.status || '',
      totalQty,
      totalValueUSD: costUsd,
    };
  });
}

export default function Orders() {
  return (
    <div className="pf-card" style={{ padding:16 }}>
      (Vista placeholder; solo para que la navegación funcione)
    </div>
  );
}

