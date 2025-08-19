// src/pages/demand-forecasting/index.jsx
import React, { useEffect, useState } from "react";
import Header from "../../components/ui/Header";
import Breadcrumb from "../../components/ui/Breadcrumb";
import Icon from "../../components/AppIcon";
import { fetchGoogleSheet } from "../../lib/googleSheet";
import { SHEET_ID } from "../../lib/sheetsConfig";

import { fmtInt, fmtDate, fmtPercent } from "../../utils/format.js";

const DemandForecasting = () => {
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]); // demanda cruda
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("language") || "en";
    setLang(saved);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchGoogleSheet({
          sheetId: SHEET_ID,
          sheetName: "demand",
        });
        setRows(Array.isArray(data) ? data : []);
        setLastUpdated(new Date());
      } catch (e) {
        console.error("Demand load error:", e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const t = (en, es) => (lang === "es" ? es : en);

  // Totales simples
  const totalRequested = rows.reduce((s, r) => s + (Number(r?.qty_requested) || 0), 0);
  const totalStock = rows.reduce((s, r) => s + (Number(r?.current_stock) || 0), 0);

  // Agrupado por mes (AAAA-MM)
  const byMonth = rows.reduce((acc, r) => {
    const keyRaw = String(r?.month_of_supply || "").slice(0, 7); // "2024-05"
    const key = keyRaw || "N/A";
    const req = Number(r?.qty_requested) || 0;
    const stk = Number(r?.current_stock) || 0;
    acc[key] = acc[key] || { req: 0, stk: 0 };
    acc[key].req += req;
    acc[key].stk += stk;
    return acc;
  }, {});
  const monthRows = Object.entries(byMonth)
    .map(([month, v]) => ({ month, requested: v.req, stock: v.stk }))
    .sort((a, b) => (a.month > b.month ? 1 : -1));

  // Etiqueta amigable para el mes (usa helpers)
  const monthLabel = (key) => {
    if (!key || key === "N/A") return "-";
    // construimos día 1 para formatear el mes/año
    return fmtDate(`${key}-01`, lang, {
      year: "numeric",
      month: "short", // "may" / "may." / "may."
      day: undefined, // lo ignora igual, pero por si acaso
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumb />
          <div className="flex items-center justify-between mt-4 mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              {t("Demand Forecasting", "Pronóstico de Demanda")}
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

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card rounded-lg border border-border p-6 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-sky-500 rounded-lg p-3">
                  <Icon name="TrendingUp" size={24} color="white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">
                  {fmtInt(totalRequested, lang)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("Total Requested (all)", "Total Requerido (todo)")}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-emerald-500 rounded-lg p-3">
                  <Icon name="Package" size={24} color="white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">
                  {fmtInt(totalStock, lang)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("Current Stock (all)", "Stock Actual (todo)")}
                </p>
              </div>
            </div>
          </div>

          {/* Tabla por mes */}
          <div className="bg-card rounded-lg border border-border p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {t("Monthly Summary", "Resumen Mensual")}
            </h2>

            {loading ? (
              <div className="text-muted-foreground">{t("Loading…", "Cargando…")}</div>
            ) : monthRows.length === 0 ? (
              <div className="text-muted-foreground">{t("No data.", "Sin datos.")}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr className="text-sm text-muted-foreground">
                      <th className="px-4 py-3">{t("Month", "Mes")}</th>
                      <th className="px-4 py-3">{t("Requested", "Requerido")}</th>
                      <th className="px-4 py-3">{t("Current Stock", "Stock Actual")}</th>
                      <th className="px-4 py-3">{t("Coverage", "Cobertura")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {monthRows.map((r) => {
                      const cov =
                        r.requested > 0
                          ? fmtPercent((r.stock / r.requested) * 100, lang, 0)
                          : "-";
                      return (
                        <tr key={r.month} className="text-sm text-foreground">
                          <td className="px-4 py-3">{monthLabel(r.month)}</td>
                          <td className="px-4 py-3">{fmtInt(r.requested, lang)}</td>
                          <td className="px-4 py-3">{fmtInt(r.stock, lang)}</td>
                          <td className="px-4 py-3">{cov}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DemandForecasting;
