import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import OrderSummaryCards from './components/OrderSummaryCards';
import OrderFilters from './components/OrderFilters';
import OrdersTable from './components/OrdersTable';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

// ⬇️ NUEVO: lector de Google Sheets
import { fetchGoogleSheet } from '../../lib/googleSheet';
import { SHEET_ID } from '../../lib/sheetsConfig';

const PurchaseOrderTracking = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // filtros existentes (se mantienen)
  const [filters, setFilters] = useState({
    search: '',
    manufacturingStatus: '',
    qcStatus: '',
    transportType: '',
    dateRange: '',
    productCategory: ''
  });

  // ⬇️ NUEVO: estado para órdenes reales desde Google Sheets
  const [orders, setOrders] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);

    const handleStorageChange = () => {
      const newLanguage = localStorage.getItem('language') || 'en';
      setCurrentLanguage(newLanguage);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ⬇️ NUEVO: carga purchase_orders + purchase_order_items
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [po, poi] = await Promise.all([
          fetchGoogleSheet({ sheetId: SHEET_ID, sheetName: 'purchase_orders' }),
          fetchGoogleSheet({ sheetId: SHEET_ID, sheetName: 'purchase_order_items' })
        ]);

        // indexar ítems por po_number
        const itemsByPO = poi.reduce((acc, it) => {
          const key = it?.po_number;
          if (!key) return acc;
          (acc[key] = acc[key] || []).push(it);
          return acc;
        }, {});

        // construir lista para la UI
        const list = po.map((o, idx) => {
          const its = itemsByPO[o?.po_number] || [];
          const totalQty = its.reduce((s, it) => s + (Number(it?.qty_ordered) || 0), 0);
          const totalValue = its.reduce(
            (s, it) => s + (Number(it?.qty_ordered) || 0) * (Number(it?.unit_price) || 0),
            0
          );

          return {
            id: idx + 1,
            poNumber: o?.po_number || '',
            supplier: o?.supplier_name || '',
            tenderNumber: o?.tender_number || '',
            orderDate: o?.order_date || '',
            incoterm: o?.incoterm || '',
            currency: o?.currency || 'CLP',
            status: o?.status || 'open',
            items: its,           // [{ presentation_code, qty_ordered, unit_price, notes }, ...]
            totalQty,
            totalValue
          };
        });

        setOrders(list);
        setLastUpdated(new Date());
      } catch (e) {
        console.error('Error loading purchase orders:', e);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleExportData = () => {
    // Aquí puedes exportar "orders" (CSV/JSON) si lo deseas
    console.log('Exporting order data...', orders.length, 'orders');
  };

  const handleCreateOrder = () => {
    console.log('Creating new order...');
  };

  // ⬇️ NUEVO: filtrado básico de órdenes (según los campos disponibles)
  const filteredOrders = orders.filter((o) => {
    // búsqueda libre: poNumber, supplier, tenderNumber
    if (filters?.search) {
      const q = String(filters.search).toLowerCase();
      const hit =
        o.poNumber?.toLowerCase().includes(q) ||
        o.supplier?.toLowerCase().includes(q) ||
        o.tenderNumber?.toLowerCase().includes(q);
      if (!hit) return false;
    }

    // productCategory: no existe como tal; probamos contra "notes" de los items
    if (filters?.productCategory) {
      const q = String(filters.productCategory).toLowerCase();
      const hit = (o.items || []).some((it) => String(it?.notes || '').toLowerCase().includes(q));
      if (!hit) return false;
    }

    // manufacturingStatus / qcStatus / transportType / dateRange:
    // estos campos no están en las hojas base; si los agregas más adelante,
    // puedes mapearlos aquí. Por ahora se ignoran de forma segura.
    return true;
  });

  // Texto "última actualización"
  const lastUpdatedLabel = lastUpdated
    ? new Intl.DateTimeFormat(currentLanguage === 'es' ? 'es-CL' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(lastUpdated)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <Breadcrumb />
            <div className="flex items-center justify-between mt-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {currentLanguage === 'es'
                    ? 'Seguimiento de Órdenes de Compra'
                    : 'Purchase Order Tracking'}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {currentLanguage === 'es'
                    ? 'Monitorea el estado de producción y envío de órdenes a India'
                    : 'Monitor production status and shipment coordination for orders to India'}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  iconName="Download"
                  iconPosition="left"
                >
                  {currentLanguage === 'es' ? 'Exportar' : 'Export'}
                </Button>
                <Button
                  variant="default"
                  onClick={handleCreateOrder}
                  iconName="Plus"
                  iconPosition="left"
                >
                  {currentLanguage === 'es' ? 'Nueva Orden' : 'New Order'}
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Cards (si más adelante quieres usar datos reales, podemos pasar props) */}
          <OrderSummaryCards currentLanguage={currentLanguage} />

          {/* Filters */}
          <OrderFilters
            currentLanguage={currentLanguage}
            onFiltersChange={handleFiltersChange}
          />

          {/* Orders Table */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                {currentLanguage === 'es' ? 'Órdenes de Compra' : 'Purchase Orders'}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Clock" size={16} />
                <span>
                  {currentLanguage === 'es'
                    ? `Última actualización: ${lastUpdatedLabel || 'cargando…'}`
                    : `Last updated: ${lastUpdatedLabel || 'loading…'}`}
                </span>
              </div>
            </div>

            {/* ⬇️ Pasamos los datos reales filtrados a la tabla */}
            <OrdersTable
              currentLanguage={currentLanguage}
              filters={filters}
              loading={loading}
              orders={filteredOrders}
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-lg border border-border p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {currentLanguage === 'es' ? 'Acciones Rápidas' : 'Quick Actions'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                iconName="FileText"
                iconPosition="left"
              >
                <div className="text-left">
                  <div className="font-medium">
                    {currentLanguage === 'es' ? 'Generar Reporte' : 'Generate Report'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentLanguage === 'es' ? 'Estado de órdenes' : 'Order status report'}
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                iconName="Bell"
                iconPosition="left"
              >
                <div className="text-left">
                  <div className="font-medium">
                    {currentLanguage === 'es' ? 'Configurar Alertas' : 'Setup Alerts'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentLanguage === 'es' ? 'Notificaciones ETA' : 'ETA notifications'}
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                iconName="MessageSquare"
                iconPosition="left"
              >
                <div className="text-left">
                  <div className="font-medium">
                    {currentLanguage === 'es' ? 'Comunicaciones' : 'Communications'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentLanguage === 'es' ? 'Con proveedores India' : 'With India suppliers'}
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                iconName="Settings"
                iconPosition="left"
              >
                <div className="text-left">
                  <div className="font-medium">
                    {currentLanguage === 'es' ? 'Configuración' : 'Settings'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentLanguage === 'es' ? 'Preferencias sistema' : 'System preferences'}
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PurchaseOrderTracking;
