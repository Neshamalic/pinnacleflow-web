import React from "react";

const ImportTable = ({ currentLanguage, importsData = [], loading, onRowClick }) => {
  // Formateador de fechas: soporta "Date(yyyy,mm,dd)", "dd/mm/yyyy", ISO, timestamp, etc.
  const fmtDate = (value) => {
    if (!value) return "-";

    if (typeof value === "string") {
      // Date(2024,10,26)
      const m = value.match(/^Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)$/i);
      if (m) {
        const y = Number(m[1]);
        const mo = Number(m[2]); // 1..12
        const d = Number(m[3]);
        const dt = new Date(y, mo - 1, d);
        return new Intl.DateTimeFormat(
          currentLanguage === "es" ? "es-CL" : "en-US",
          { year: "numeric", month: "2-digit", day: "2-digit" }
        ).format(dt);
      }
      // dd/mm/yyyy
      const m2 = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (m2) {
        const d = Number(m2[1]), mo = Number(m2[2]), y = Number(m2[3]);
        const dt = new Date(y, mo - 1, d);
        return new Intl.DateTimeFormat(
          currentLanguage === "es" ? "es-CL" : "en-US",
          { year: "numeric", month: "2-digit", day: "2-digit" }
        ).format(dt);
      }
    }

    // ISO, timestamp u otros
    const dt = new Date(value);
    if (!isNaN(dt)) {
      return new Intl.DateTimeFormat(
        currentLanguage === "es" ? "es-CL" : "en-US",
        { year: "numeric", month: "2-digit", day: "2-digit" }
      ).format(dt);
    }

    return String(value);
  };

  // Separador de miles
  const fmtInt = (n) =>
    new Intl.NumberFormat(currentLanguage === "es" ? "es-CL" : "en-US").format(
      Number(n) || 0
    );

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
              <td className="px-4 py-3">{fmtInt(i
