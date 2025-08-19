import React, { useEffect, useState } from "react";
import Header from "../../components/ui/Header";
import Breadcrumb from "../../components/ui/Breadcrumb";
import Icon from "../../components/AppIcon";
import { fetchGoogleSheet } from "../../lib/googleSheet";
import { SHEET_ID } from "../../lib/sheetsConfig";

import { fmtInt, fmtDate, toDate } from "../../utils/format.js";

const Card = ({ color, icon, label, value }) => (
  <div className="bg-card rounded-lg border border-border p-6 shadow-soft">
    <div className="flex items-center justify-between mb-3">
      <div className={`${color} rounded-lg p-3`}>
        <Icon name={icon} size={24} color="white" />
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold text-foreground mb-4">{title}</h2>
    <div className="bg-card rounded-lg border border-border p-4">{children}</div>
  </div>
);

const Dashboard = () => {
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    tenders: 0,
    pos: 0,
    imports: 0,
    nextMonthDemand: 0,
  });
  const [upcoming, setUpcoming] = useState([]); // hitos próximos
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("language") || "en";
    setLang(saved);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [
          tenderItems,
          purchaseOrders,
          purchaseOrderItems,
          imports,
          importItems,
          demand,
        ] = await Promise.all([
          fetchGoogleSheet({ sheetId: SHEET_ID, sheetName: "tender_items" }),
          fetchGoogleSheet({ sheetId: SHEET_ID, sheetName: "purchase_orders" }),
          fetchGoogleSheet({ sheetId: SHEET_ID, sheetName: "purchase_order_items" }),
          fetchGoogleSheet({ sheetId: SHEET_ID, sheetName: "imports" }),
          fetchGoogleSheet({ sheetId: SHEET_ID, sheetName: "import_items" }),
          fetchGoogleSheet({ sheetId: SHEET_ID, sheetName: "demand" }),
        ]);

        // KPIs
        const tenders = new Set((tenderItems || []).map((r) => r?.tender_number)).size;
        const pos = (purchaseOrders || []).length;
        const imps = (imports || []).length;

        // Demanda del próximo mes
        const now = new Date();
        const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const yyyyMm = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
        const nextMonthDemand = (demand || [])
          .filter((d) => String(d?.month_of_supply || "").startsWith(yyyyMm))
          .reduce((s, d) => s + (Number(d?.qty_requested) || 0), 0);

        // Hitos próximos (usar toDate para parse robusto)
        const importMilestones = (imports || [])
          .map((imp) => ({
            type: "Import ETA",
            key: imp?.oci_number,
            date: imp?.eta,
            detail: `${imp?.oci_number} / PO ${imp?.po_number || "-"}`,
          }))
          .filter((x) => x.date);

        const tenderMilestones = (tenderItems || [])
          .map((it) => ({
            type: "Tender Delivery",
            key: it?.tender_number,
            date: it?.last_delivery_date || it?.first_delivery_date,
            detail: `${it?.tender_number} / ${it?.presentation_code || ""}`,
          }))
          .filter((x) => x.date);

        const merged = [...importMilestones, ...tenderMilestones]
          .map((e) => {
            const d = toDate(e.date);
            return { ...e, ts: d ? d.getTime() : NaN };
          })
          .filter((e) => !isNaN(e.ts))
          .sort((a, b) => a.ts - b.ts)
          .slice(0, 10);

        setKpis({ tenders, pos, imports: imps, nextMonthDemand });
        setUpcoming(merged);
        setLastUpdated(new Date());
      } catch (e) {
        console.error("Dashboard load error:", e);
        setKpis({ tenders: 0, pos: 0, imports: 0, nextMonthDemand: 0 });
        setUpcoming([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const t = (en, es) => (lang === "es" ? es : en);

  const lastUpdatedLabel = lastUpdated
    ? new Intl.DateTimeFormat(lang === "es" ? "es-CL" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(lastUpdated)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumb />
          <div className="flex items-center justify-between mt-4 mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              {t("Dashboard", "Panel de Control")}
            </h1>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Icon name="Clock" size={16} />
              {t("Last updated:", "Última actualización:")} {lastUpdatedLabel || t("loading…", "cargando…")}
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card
              color="bg-blue-500"
              icon="FileText"
              label={t("Tenders", "Licitaciones")}
              value={fmtInt(kpis.tenders, lang)}
            />
            <Card
              color="bg-emerald-500"
              icon="ShoppingCart"
              label={t("Purchase Orders", "Órdenes de Compra")}
              value={fmtInt(kpis.pos, lang)}
            />
            <Card
              color="bg-purple-500"
              icon="Truck"
              label={t("Imports", "Importaciones")}
              value={fmtInt(kpis.imports, lang)}
            />
            <Card
              color="bg-amber-500"
              icon="Calendar"
              label={t("Next Month Demand", "Demanda Próx. Mes")}
              value={fmtInt(kpis.nextMonthDemand, lang)}
            />
          </div>

          {/* Próximos hitos */}
          <Section title={t("Upcoming Milestones", "Próximos Hitos")}>
            {loading ? (
              <div className="text-muted-foreground">{t("Loading…", "Cargando…")}</div>
            ) : upcoming.length === 0 ? (
              <div className="text-muted-foreground">{t("No upcoming items.", "Sin hitos próximos.")}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr className="text-sm text-muted-foreground">
                      <th className="px-4 py-3">{t("Date", "Fecha")}</th>
                      <th className="px-4 py-3">{t("Type", "Tipo")}</th>
                      <th className="px-4 py-3">{t("Detail", "Detalle")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {upcoming.map((u, i) => (
                      <tr key={i} className="text-sm text-foreground">
                        <td className="px-4 py-3">
                          {fmtDate(u.date, lang)}
                        </td>
                        <td className="px-4 py-3">{u.type}</td>
                        <td className="px-4 py-3">{u.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
