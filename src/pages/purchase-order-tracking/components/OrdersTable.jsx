import React from 'react';
import { fmtDate, fmtInt, fmtCurrency } from '../../../utils/format.js';

const OrdersTable = ({
  currentLanguage = 'en',
  loading = false,
  orders = [],
  onRowClick, // opcional: si lo pasas, habilita click en filas y botón "Ver ítems"
}) => {
  const lang = currentLanguage;
  const isClickable = typeof onRowClick === 'function';

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        {lang === 'es' ? 'Cargando órdenes…' : 'Loading orders…'}
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        {lang === 'es' ? 'No hay órdenes.' : 'No orders.'}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-card rounded-lg border border-border">
      <table className="min-w-full text-left">
        <thead className="bg-muted/50 border-b border-border">
          <tr className="text-sm text-muted-foreground">
            <th className="px-4 py-3">{lang === 'es' ? 'PO #' : 'PO #'}</th>
            <th className="px-4 py-3">{lang === 'es' ? 'Proveedor' : 'Supplier'}</th>
            <th className="px-4 py-3">{lang === 'es' ? 'Licitación' : 'Tender'}</th>
            <th className="px-4 py-3">{lang === 'es' ? 'Fecha Orden' : 'Order Date'}</th>
            <th className="px-4 py-3">Incoterm</th>
            <th className="px-4 py-3">{lang === 'es' ? 'Moneda' : 'Currency'}</th>
            <th className="px-4 py-3">{lang === 'es' ? 'Cant. Total' : 'Total Qty'}</th>
            <th className="px-4 py-3">{lang === 'es' ? 'Valor Total' : 'Total Value'}</th>
            <th className="px-4 py-3">{lang === 'es' ? 'Estado' : 'Status'}</th>
            <th className="px-4 py-3">{lang === 'es' ? 'Acciones' : 'Actions'}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((o, idx) => {
            const rowProps = isClickable
              ? {
                  onClick: () => onRowClick(o),
                  className:
                    'text-sm text-foreground hover:bg-muted/30 cursor-pointer',
                  title: lang === 'es' ? 'Ver ítems' : 'View items',
                }
              : {
                  className: 'text-sm text-foreground',
                };

            return (
              <tr key={o.poNumber || idx} {...rowProps}>
                <td className="px-4 py-3 font-medium">{o.poNumber || '-'}</td>
                <td className="px-4 py-3">{o.supplier || '-'}</td>
                <td className="px-4 py-3">{o.tenderNumber || '-'}</td>
                <td className="px-4 py-3">{fmtDate(o.orderDate, lang)}</td>
                <td className="px-4 py-3">{o.incoterm || '-'}</td>
                <td className="px-4 py-3">{o.currency || '-'}</td>
                <td className="px-4 py-3">{fmtInt(o.totalQty, lang)}</td>
                <td className="px-4 py-3">
                  {fmtCurrency(o.totalValue, o.currency || 'USD', lang)}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs">
                    {o.status || (lang === 'es' ? 'Abierta' : 'Open')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {isClickable ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(o);
                      }}
                      className="text-primary hover:underline text-sm"
                    >
                      {lang === 'es' ? 'Ver ítems' : 'View items'}
                    </button>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;

