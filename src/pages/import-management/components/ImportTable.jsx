import React from "react";

const ImportTable = ({ currentLanguage, importsData = [], loading, onRowClick }) => {
  const fmtDate = (d) => {
    if (!d) return "-";
    const dt = new Date(d);
    if (isNaN(dt)) return String(d);
    return new Intl.DateTimeFormat(
      currentLanguage === "es" ? "es-CL" : "en-US",
      { year: "numeric", month: "2-digit", day: "2-digit" }
    ).format(dt);
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        {currentLanguage === "es" ? "Cargando importaciones…" : "Loading imports…"}
      </div>
    );
  }

  if (!importsData.length) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        {currentLanguage === "es" ? "No hay importaciones." : "No imports."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-card rounded-lg border border-border">
      <table className="min-w-full text-left">
        <thead className="bg-muted/50 border-b border-border">
          <tr className="text-sm text-muted-foreground">
            <th className="px-4 py-3">OCI</th>
            <th className="px-4 py-3">PO</th>
            <th className="px-4 py-3">BL/AWB</th>
            <th className="px-4 py-3">{currentLanguage === "es" ? "Nave/Avión" : "Vessel/Aircraft"}</th>
            <th className="px-4 py-3">ETA</th>
            <th className="px-4 py-3">ATD</th>
            <th className="px-4 py-3">ATA</th>
            <th className="px-4 py-3">{currentLanguage === "es" ? "Agente" : "Broker"}</th>
            <th className="px-4 py-3">{currentLanguage === "es" ? "Bodega" : "Warehouse"}</th>
            <th className="px-4 py-3">{currentLanguage === "es" ? "Estado" : "Status"}</th>
            <th className="px-4 py-3">{currentLanguage === "es" ? "Recibido" : "Received"}</th>
            <th className="px-4 py-3">QA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {importsData.map((imp) => (
            <tr
              key={imp.ociNumber}
              className="text-sm text-foreground hover:bg-muted/40 cursor-pointer"
              onClick={() => onRowClick && onRowClick(imp)}
              title={currentLanguage === "es" ? "Ver ítems" : "View items"}
            >
              <td className="px-4 py-3 font-medium">{imp.ociNumber || "-"}</td>
              <td className="px-4 py-3">{imp.poNumber || "-"}</td>
              <td className="px-4 py-3">{imp.blAwb || "-"}</td>
              <td className="px-4 py-3">{imp.vessel || "-"}</td>
              <td className="px-4 py-3">{fmtDate(imp.eta)}</td>
              <td className="px-4 py-3">{fmtDate(imp.atd)}</td>
              <td className="px-4 py-3">{fmtDate(imp.ata)}</td>
              <td className="px-4 py-3">{imp.customsBroker || "-"}</td>
              <td className="px-4 py-3">{imp.warehouse || "-"}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs">
                  {imp.status || (currentLanguage === "es" ? "Abierto" : "Open")}
                </span>
              </td>
              <td className="px-4 py-3">{imp.totalReceived ?? 0}</td>
              <td className="px-4 py-3">
                {imp.qaRequired ? (
                  <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs">
                    QA
                  </span>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ImportTable;
