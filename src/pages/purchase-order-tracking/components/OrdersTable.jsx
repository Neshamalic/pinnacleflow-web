import React from "react";

const OrdersTable = ({ currentLanguage, filters, orders = [], loading, onRowClick }) => {
  const fmtMoney = (currency) =>
    new Intl.NumberFormat(currentLanguage === "es" ? "es-CL" : "en-US", {
      style: "currency",
      currency: currency || "CLP",
      maximumFractionDigits: 0,
    });

  const fmtDate = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    if (isNaN(date)) return String(d);
    return new Intl.DateTimeFormat(
      currentLanguage === "es" ? "es-CL" : "en-US",
      { year: "numeric", month: "2-digit", day: "2-digit" }
    ).format(date);
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        {currentLanguage === "es" ? "Cargando órdenes…" : "Loading orders…"}
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        {currentLanguage === "es" ? "No hay órdenes para mostrar." : "No orders to display."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-card rounded-lg border border-border">
      <table className="min-w-full text-left">
        <thead className="bg-muted/50 border-b border-border">
          <tr className="text-sm text-muted-foreground">
            <th className="px-4 py-3">PO #</th>
            <th className="px-4 py-3">{currentLanguage === "es" ? "Proveedor" : "Supplier"}</th>
            <th className="px-4 py-3">Tender</th>
            <th className="px-4 py-3">{currentLanguage === "es" ? "Fecha Orden" : "Order Date"}</th>
            <th className="px-4 py-3">Incoterm</th>
            <th className="px-4 py-3">{currentLanguage === "es" ? "Moneda" : "Currency"}</th>
            <th className="px-4 py-3">{currentLanguage === "es" ? "Cant. Total" : "Total Qty"}</th>
            <th className="px-4 py-3">{currentLanguage === "es" ? "Valor Total" : "Total Value"}</th>
            <th className="px-4 py-3">{currentLanguage === "es" ? "Estado" : "Status"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((o) => (
            <tr
              key={o.poNumber}
              className="text-sm text-foreground hover:bg-muted/40 cursor-pointer"
              onClick={() => onRowClick && onRowClick(o)}
              title={currentLanguage === "es" ? "Ver ítems" : "View items"}
            >
              <td className="px-4 py-3 font-medium">{o.poNumber || "-"}</td>
              <td className="px-4 py-3">{o.supplier || "-"}</td>
              <td className="px-4 py-3">{o.tenderNumber || "-"}</td>
              <td className="px-4 py-3">{fmtDate(o.orderDate)}</td>
              <td className="px-4 py-3">{o.incoterm || "-"}</td>
              <td className="px-4 py-3">{o.currency || "CLP"}</td>
              <td className="px-4 py-3">{o.totalQty ?? 0}</td>
              <td className="px-4 py-3">{fmtMoney(o.currency).format(o.totalValue ?? 0)}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs">
                  {o.status || (currentLanguage === "es" ? "Abierta" : "Open")}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
