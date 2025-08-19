import React from "react";

const Backdrop = ({ onClose }) => (
  <div onClick={onClose} className="fixed inset-0 bg-black/40 z-40" aria-hidden="true" />
);

const Row = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-sm text-foreground">{value || "-"}</span>
  </div>
);

const ImportDetails = ({ open, onClose, imp, currentLanguage }) => {
  if (!open) return null;

  const t = (en, es) => (currentLanguage === "es" ? es : en);
  const items = imp?.items || [];

  const fmtDate = (d) => {
    if (!d) return "-";
    const dt = new Date(d);
    if (isNaN(dt)) return String(d);
    return new Intl.DateTimeFormat(
      currentLanguage === "es" ? "es-CL" : "en-US",
      { year: "numeric", month: "2-digit", day: "2-digit" }
    ).format(dt);
  };

  return (
    <>
      <Backdrop onClose={onClose} />
      <div className="fixed z-50 inset-0 flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-foreground">
                {t("Import Detail", "Detalle de Importación")} · {imp?.ociNumber || "-"}
              </h3>
              <div className="text-sm text-muted-foreground">
                {t("PO", "PO")}: {imp?.poNumber || "-"} · BL/AWB: {imp?.blAwb || "-"}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              {t("Close", "Cerrar")}
            </button>
          </div>

          {/* Summary */}
          <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 border-b border-border">
            <Row label="Vessel/Aircraft" value={imp?.vessel} />
            <Row label="ETA" value={fmtDate(imp?.eta)} />
            <Row label="ATD" value={fmtDate(imp?.atd)} />
            <Row label="ATA" value={fmtDate(imp?.ata)} />
            <Row label={t("Broker", "Agente")} value={imp?.customsBroker} />
            <Row label={t("Warehouse", "Bodega")} value={imp?.warehouse} />
          </div>

          {/* Items */}
          <div className="p-6 overflow-x-auto">
            <h4 className="text-sm font-medium text-foreground mb-3">
              {t("Items", "Ítems")} ({items.length})
              {imp?.qaRequired ? (
                <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs">
                  QA
                </span>
              ) : null}
            </h4>

            {!items.length ? (
              <div className="text-muted-foreground">{t("No items.", "Sin ítems.")}</div>
            ) : (
              <table className="min-w-full text-left">
                <thead className="bg-muted/50 border-b border-border">
                  <tr className="text-sm text-muted-foreground">
                    <th className="px-4 py-3">{t("Presentation", "Presentación")}</th>
                    <th className="px-4 py-3">{t("Lot", "Lote")}</th>
                    <th className="px-4 py-3">{t("Mfg Date", "F. Fab.")}</th>
                    <th className="px-4 py-3">{t("Exp Date", "F. Venc.")}</th>
                    <th className="px-4 py-3">{t("Received Qty", "Cant. Recibida")}</th>
                    <th className="px-4 py-3">QA</th>
                    <th className="px-4 py-3">{t("Notes", "Notas")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((it, i) => (
                    <tr key={i} className="text-sm text-foreground">
                      <td className="px-4 py-3">{it?.presentation_code || "-"}</td>
                      <td className="px-4 py-3">{it?.lot_number || "-"}</td>
                      <td className="px-4 py-3">{it?.mfg_date || "-"}</td>
                      <td className="px-4 py-3">{it?.exp_date || "-"}</td>
                      <td className="px-4 py-3">{it?.qty_received ?? 0}</td>
                      <td className="px-4 py-3">
                        {String(it?.qa_required).toLowerCase() === "true" || it?.qa_required === 1
                          ? t("Yes", "Sí")
                          : "-"}
                      </td>
                      <td className="px-4 py-3">{it?.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ImportDetails;
