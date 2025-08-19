import React, { useEffect, useState } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

// Componentes correctos de esta página
import OrderSummaryCards from './components/OrderSummaryCards';
import OrderFilters from './components/OrderFilters';
import OrdersTable from './components/OrdersTable';

// Google Sheets
import { fetchGoogleSheet } from '../../lib/googleSheet';
import { SHEET_ID } from '../../lib/sheetsConfig';

const PurchaseOrderTracking = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const [filters, setFilters] = useState({
    search: '',
    manufacturingStatus: '',
    qcStatus: '',
    transportType: '',
    dateRange: '',
    productCategory: ''
  });

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

  // Carga purchase_orders + purchase_order_items desde Google Sheets
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [po, poi] = await Promise.all([
          fetchGoogleSheet({ sheetId: SHEET_ID, sheetName: 'purchase_orders' }),
          fetchGoogleSheet({ sheetId: SHEET_ID, sheetName: 'purchase_order_items' })
        ]);

        // indexar ítems por po_number
        const itemsByPO = (poi || []).reduce((acc, it) => {
          const key = it?.po_number;
          if (!key) return acc;
          (acc[key] = acc[key] || []).push(it);
          return acc;
        }, {});

        // construir lista para la UI
        const list = (po || []).map((o, idx) => {
          const its = itemsByPO[o?.po_number] || [];
          const totalQty = its.reduce((s, it) => s + (Number(it?.qty_ordered) || 0), 0);
          const totalValue = its.reduce(
            (s, it) =>
              s + (Number(it?.qty_ordered) || 0) * (Number(it?.unit_price) || 0),
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
            items: its, // [{ presentation_code, qty_ordered, unit_price, notes }, ...]
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

  const handleFiltersChange = (newFilters) => setFilters(newFilters);

  const handleExportData = () => {
    console.log('Exporting order data...', orders.length, 'orders');
  };

  const handleCreateOrder = () => {
    console.log('Creating new order...');
  };

  // Filtrado básico
  const filteredOrders = orders.filter((o) => {
    if (filters?.search) {
      const q = String(filters.search).toLowerCase();
      const hit =
        o.poNumber?.toLowerCase().includes(q) ||
        o.supplier?.toLowerCase().includes(q) ||
        o.tenderNumber?.toLowerCase().includes(q);
      if (!hit) return false;
    }
    if (filters?.productCategory) {
      const q = String(filters.productCategory).toLowerCase();
      const hit = (o.items || []).some((it) =>
        String(it?.notes || '').toLowerCase().includes(q)
      );
      if (!hit) return false;
    }
    // otros filtros (manufacturingStatus, qcStatus, transportType, dateRange) se pueden mapear después
    return true;
  });

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

          {/* Summary Cards */}
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

            <OrdersTable
              currentLanguage={currentLanguage}
              filters={filters}
              loading={loading}
              orders={filteredOrders}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PurchaseOrderTracking;
