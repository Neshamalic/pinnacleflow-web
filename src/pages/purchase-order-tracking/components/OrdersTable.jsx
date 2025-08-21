import React from 'react';
import Button from '../../../components/ui/Button';

const OrdersTable = ({
  currentLanguage = 'en',
  loading = false,
  orders = [],
  onView,
  onEdit,
  onDelete,
}) => {
  const tr = (en, es) => (currentLanguage === 'es' ? es : en);

  const fmtCur = (v, cur = 'CLP') =>
    new Intl.NumberFormat(currentLanguage === 'es' ? 'es-CL' : 'en-US', {
      style: 'currency',
      currency: cur,
      maximumFractionDigits: 0
    }).format(Number(v || 0));

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-muted/50">
          <tr className="text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 text-left">{tr('PO Number', 'N° OC')}</th>
            <th className="px-4 py-3 text-left">{tr('Supplier', 'Proveedor')}</th>
            <th className="px-4 py-3 text-left">{tr('Tender', 'Licitación')}</th>
            <th className="px-4 py-3 text-left">{tr('Order Date', 'Fecha Orden')}</th>
            <th className="px-4 py-3 text-left">{tr('Incoterm', 'Incoterm')}</th>
            <th className="px-4 py-3 text-right">{tr('Total Qty', 'Cant. Total')}</th>
            <th className="px-4 py-3 text-right">{tr('Total Value', 'Valor Total')}</th>
            <th className="px-4 py-3 text-left">{tr('Status', 'Estado')}</th>
            <th className="px-4 py-3 text-left">{tr('Actions', 'Acciones')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading && (
            <tr>
              <td colSpan={9} className="px-4 py-6 text-center text-muted-foreground">
                {tr('Loading…', 'Cargando…')}
              </td>
            </tr>
          )}

          {!loading && orders.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-6 text-center text-muted-foreground">
                {tr('No orders found', 'No hay órdenes')}
              </td>
            </tr>
          )}

          {!loading && orders.map((row) => (
            <tr key={row.poNumber} className="hover:bg-muted/50">
              <td className="px-4 py-3 font-medium text-foreground">{row.poNumber}</td>
              <td className="px-4 py-3">{row.supplier}</td>
              <td className="px-4 py-3">{row.tenderNumber}</td>
              <td className="px-4 py-3">{row.orderDate || '—'}</td>
              <td className="px-4 py-3">{row.incoterm || '—'}</td>
              <td className="px-4 py-3 text-right">{row.totalQty || 0}</td>
              <td className="px-4 py-3 text-right">{fmtCur(row.totalValue, row.currency)}</td>
              <td className="px-4 py-3">{row.status || 'open'}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" iconName="Eye" onClick={() => onView?.(row)}>
                    {tr('View', 'Ver')}
                  </Button>
                  <Button variant="ghost" size="sm" iconName="Edit" onClick={() => onEdit?.(row)}>
                    {tr('Edit', 'Editar')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    iconName="Trash2"
                    onClick={() => onDelete?.(row)}
                  >
                    {tr('Delete', 'Eliminar')}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;

