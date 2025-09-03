import React, { useEffect, useState } from "react";
import Header from "../../components/ui/Header";
import Breadcrumb from "../../components/ui/Breadcrumb";
import Icon from "../../components/AppIcon";
import { fetchGoogleSheet } from "../../lib/googleSheet";
import { SHEET_ID } from "../../lib/sheetsConfig";
// 👇 Importa helpers de formato (ruta relativa + .js)
import { fmtDate, toDate } from "../../utils/format.js";

const CommunicationsLog = () => {
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("language") || "en";
    setLang(saved);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchGoogleSheet({
          sheetId: SHEET_ID,
          sheetName: "communications",
        });
        setRows(Array.isArray(data) ? data : []);
        setLastUpdated(new Date());
      } catch (e) {
        console.error("Communications load error:", e);
        setError("missing");
        setRows([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const t = (en, es) => (lang === "es" ? es : en);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumb />
          <div className="flex items-center justify-between mt-4 mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              {t("Communications Log", "Registro de Comunicaciones")}
            </h1>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Icon name="Clock" size={16} />
              {t("Last updated:", "Última actualización:")}{" "}
              {lastUpdated
                ? new Intl.DateTimeFormat(lang === "es" ? "es-CL" : "en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(lastUpdated)
                : t("loading…", "cargando…")}
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6 shadow-soft">
            {loading ? (
              <div className="text-muted-foreground">{t("Loading…", "Cargando…")}</div>
            ) : error === "missing" ? (
              <div className="text-muted-foreground">
                {t(
                  "No 'communications' sheet found. Create it in your Google Sheet with columns: date, subject, content, type, sender, tender_number, po_number, has_attachment.",
                  "No se encontró la pestaña 'communications'. Créala en tu Google Sheet con columnas: date, subject, content, type, sender, tender_number, po_number, has_attachment."
                )}
              </div>
            ) : rows.length === 0 ? (
              <div className="text-muted-foreground">{t("No communications.", "Sin comunicaciones.")}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr className="text-sm text-muted-foreground">
                      <th className="px-4 py-3">{t("Date", "Fecha")}</th>
                      <th className="px-4 py-3">{t("Subject", "Asunto")}</th>
                      <th className="px-4 py-3">{t("Type", "Tipo")}</th>
                      <th className="px-4 py-3">{t("Sender", "Remitente")}</th>
                      <th className="px-4 py-3">Tender #</th>
                      <th className="px-4 py-3">PO #</th>
                      <th className="px-4 py-3">{t("Attachment", "Adjunto")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows
                      .slice()
                      // ordena con parser robusto
                      .sort((a, b) => {
                        const da = toDate(a?.date);
                        const db = toDate(b?.date);
                        return (db?.getTime?.() || 0) - (da?.getTime?.() || 0);
                      })
                      .map((r, i) => (
                        <tr key={i} className="text-sm text-foreground">
                          <td className="px-4 py-3">{fmtDate(r?.date, lang)}</td>
                          <td className="px-4 py-3">{r?.subject || "-"}</td>
                          <td className="px-4 py-3">{r?.type || "-"}</td>
                          <td className="px-4 py-3">{r?.sender || "-"}</td>
                          <td className="px-4 py-3">{r?.tender_number || "-"}</td>
                          <td className="px-4 py-3">{r?.po_number || "-"}</td>
                          <td className="px-4 py-3">
                            {String(r?.has_attachment).toLowerCase() === "true" || r?.has_attachment === 1
                              ? t("Yes", "Sí")
                              : "-"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );

  export default function Communications() {
  return (
    <div className="pf-card" style={{ padding:16 }}>
      (Vista placeholder; solo para que la navegación funcione)
    </div>
  );
}

};

export default CommunicationsLog;
