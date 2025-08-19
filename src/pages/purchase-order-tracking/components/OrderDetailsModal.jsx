import React, { useEffect } from "react";
import { fmtCurrency, fmtInt } from "../../../utils/format.js";

const Backdrop = ({ onClose }) => (
  <div
    onClick={onClose}
    className="fixed inset-0 bg-black/40 z-40"
    aria-hidden="true"
  />
);

const OrderItemsModal = ({ open, onClose, order, currentLanguage = "en" }) => {
  if (!open) return null;

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const t = (en, es) => (currentLanguage === "es" ? es : en);

  const items = order?.items || [];
  const currency = order?.currency || "CLP";

  const total = items.reduce(
    (s, it) =>
      s + (Number(it?.qty_ordered) || 0) * (Number(it?.unit_price) || 0),
    0
  );

  return (
    <>
      <Backdrop onClose={onClose} />
      <div
        className="fixed z-50 inset-0 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-3xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-xl font-semibold text-foreground">
              {t("Order Items", "Ítems de la Orden")} · {order?.poNumber || "-"}
            </h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              {t("Close", "Cerrar")}
            </button>
          </div>

          <div className="p-6 overflow-x-auto">
            {!items.length ? (
              <div className="text-muted-foreground">
                {t("No items.", "Sin ítems.")}
              </div>
            ) : (
              <table className="min-w-full text-left">
                <thead className="bg-muted/50 border-b border-border">
                  <tr className="text-sm text-muted-foreground">
                    <th className="px-4 py-3">
                      {t("Presentation", "Presentación")}
                    </th>
                    <th className="px-4 py-3">{t("Qty", "Cant.")}</th>
                    <th className="px-4 py-3">
                      {t("Unit Price", "Precio Unit.")}
                    </th>
                    <th className="px-4 py-3">{t("Line Total", "Total Línea")}</th>
                    <th className="px-4 py-3">{t("Notes", "Notas")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((it, i) => {
                    const qty = Number(it?.qty_ordered) || 0;
                    const price = Number(it?.unit_price) || 0;
                    return (
                      <tr key={i} className="text-sm text-foreground">
                        <td className="px-4 py-3">
                          {it?.presentation_code || "-"}
                        </td>
                        <td className="px-4 py-3">{fmtInt(qty, currentLanguage)}</td>
                        <td className="px-4 py-3">
                          {fmtCurrency(price, currency, currentLanguage)}
                        </td>
                        <td className="px-4 py-3">
                          {fmtCurrency(qty * price, currency, currentLanguage)}
                        </td>
                        <td className="px-4 py-3">{it?.notes || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-muted/30">
                  <tr>
                    <td className="px-4 py-3 font-medium" colSpan={3}>
                      {t("Total", "Total")}
                    </td>
                    <td className="px-4 py-3 font-bold">
                      {fmtCurrency(total, currency, currentLanguage)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderItemsModal;
