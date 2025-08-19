// src/pages/import-management/components/ImportTable.jsx
import React from "react";
import { fmtDate, fmtInt } from "../../../utils/format.js"; // 👈 helpers con extensión

const ImportTable = ({
  currentLanguage = "en",
  importsData = [],
  loading = false,
  onRowClick,
}) => {
  // Helpers “curriados” para no repetir el idioma en cada llamada
  const d = (value) => fmtDate(value, currentLanguage);
  const i = (value) => fmtInt(value, currentLanguage);

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        {currentLanguage === "es" ? "Cargando importaciones…" : "Loading imports…"}
      </div>
    );
  }

  if (!importsData?.length) {
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
            <th className="px-4 py-3">
              {currentLanguage === "es" ? "Nave/Avión" : "Vessel/Aircraft"}
            </th>
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
          {importsData.map((imp, idx) => {
            const qaYes =
              imp?.qaRequired === true ||
              String(imp?.qaRequired).toLowerCase() === "true" ||
              imp?.qaRequired === 1 ||
              imp?.qaRequired === "1";

            return (
              <tr
                key={imp?.ociNumber || imp?.id || idx}
                className="text-sm text-foreground hover:bg-muted/40 cursor-pointer"
                onClick={() => onRowClick && onRowClick(imp)}
                title={currentLanguage === "es" ? "Ver ítems" : "View items"}
                aria-label={currentLanguage === "es" ? "Ver ítems" : "View items"}
              >
                <td className="px-4 py-3 font-medium">{imp?.ociNumber || "-"}</td>
                <td className="px-4 py-3">{imp?.poNumber || "-"}</td>
                <td className="px-4 py-3">{imp?.blAwb || "-"}</td>
                <td className="px-4 py-3">{imp?.vessel || "-"}</td>
                <td className="px-4 py-3">{d(imp?.eta)}</td>
                <td className="px-4 py-3">{d(imp?.atd)}</td>
                <td className="px-4 py-3">{d(imp?.ata)}</td>
                <td className="px-4 py-3">{imp?.customsBroker || "-"}</td>
                <td className="px-4 py-3">{imp?.warehouse || "-"}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs">
                    {imp?.status || (currentLanguage === "es" ? "Abierto" : "Open")}
                  </span>
                </td>
                <td className="px-4 py-3">{i(imp?.totalReceived)}</td>
                <td className="px-4 py-3">
                  {qaYes ? (
                    <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs">
                      QA
                    </span>
                  ) : (
                    "-"
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

export default ImportTable;
