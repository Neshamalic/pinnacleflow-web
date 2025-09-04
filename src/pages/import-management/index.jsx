// src/pages/import-management/index.jsx
import React, { useEffect, useState } from "react";
import Header from "../../components/ui/Header";
import Breadcrumb from "../../components/ui/Breadcrumb";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";

import { fetchGoogleSheet } from "../../lib/googleSheet";
import { SHEET_ID } from "../../lib/sheetsConfig";

import ImportTable from "./components/ImportTable";
import ImportDetails from "./components/ImportDetails";

const ImportManagement = () => {
  const [currentLanguage, setCurrentLanguage] = useState("en");

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    broker: "",
    warehouse: "",
    dateRange: "",
  });

  const [importsData, setImportsData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openItems, setOpenItems] = useState(false);
  const [selectedImport, setSelectedImport] = useState(null);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "en";
    setCurrentLanguage(savedLanguage);

    const handleStorageChange = () => {
      const newLanguage = localStorage.getItem("language") || "en";
      setCurrentLanguage(newLanguage);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [imports, importItems] = await Promise.all([
          fetchGoogleSheet({ sheetId: SHEET_ID, sheetName: "imports" }),
          fetchGoogleSheet({ sheetId: SHEET_ID, sheetName: "import_items" }),
        ]);

        const itemsByOCI = (importItems || []).reduce((acc, it) => {
          const key = it?.oci_number;
          if (!key) return acc;
          (acc[key] = acc[key] || []).push(it);
          return acc;
        }, {});

        const list = (imports || []).map((imp, idx) => {
          const items = itemsByOCI[imp?.oci_number] || [];
          const totalReceived = items.reduce((s, it) => s + (Number(it?.qty_received) || 0), 0);
          const qaRequired =
            items.some(
              (it) => String(it?.qa_required).toLowerCase() === "true" || it?.qa_required === 1
            ) || false;

          return {
            id: idx + 1,
            ociNumber: imp?.oci_number || "",
            poNumber: imp?.po_number || "",
            blAwb: imp?.bl_awb || "",
            vessel: imp?.vessel || "",
            eta: imp?.eta || "",
            atd: imp?.atd || "",
            ata: imp?.ata || "",
            customsBroker: imp?.customs_broker || "",
            warehouse: imp?.warehouse || "",
            status: imp?.status || "open",
            items,
            totalReceived,
            qaRequired,
          };
        });

        setImportsData(list);
        setLastUpdated(new Date());
      } catch (e) {
        console.error("Error loading imports:", e);
        setImportsData([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleExport = () => {
    console.log("Export imports…", importsData.length);
  };

  const handleNewImport = () => {
    console.log("Create new import…");
  };

  const handleFiltersChange = (newFilters) => setFilters(newFilters);

  const norm = (s) => (s ? String(s).toLowerCase() : "");
  const filteredImports = importsData.filter((imp) => {
    if (filters?.search) {
      const q = norm(filters.search);
      const hit =
        norm(imp.ociNumber).includes(q) ||
        norm(imp.poNumber).includes(q) ||
        norm(imp.vessel).includes(q) ||
        norm(imp.blAwb).includes(q);
      if (!hit) return false;
    }
    if (filters?.status && norm(imp.status) !== norm(filters.status)) return false;
    if (filters?.broker && norm(imp.customsBroker) !== norm(filters.broker)) return false;
    if (filters?.warehouse && norm(imp.warehouse) !== norm(filters.warehouse)) return false;
    return true;
  });

  const lastUpdatedLabel = lastUpdated
    ? new Intl.DateTimeFormat(currentLanguage === "es" ? "es-CL" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(lastUpdated)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Encabezado */}
          <div className="mb-8">
            <Breadcrumb />
            <div className="flex items-center justify-between mt-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {currentLanguage === "es" ? "Gestión de Importaciones" : "Import Management"}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {currentLanguage === "es"
                    ? "Coordina BL/AWB, ETA/ATD/ATA y QA con tu agente y bodega."
                    : "Coordinate BL/AWB, ETA/ATD/ATA and QA with broker and warehouse."}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={handleExport} iconName="Download" iconPosition="left">
                  {currentLanguage === "es" ? "Exportar" : "Export"}
                </Button>
                <Button variant="default" onClick={handleNewImport} iconName="Plus" iconPosition="left">
                  {currentLanguage === "es" ? "Nueva Importación" : "New Import"}
                </Button>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                {currentLanguage === "es" ? "Importaciones" : "Imports"}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Clock" size={16} />
                <span>
                  {currentLanguage === "es"
                    ? `Última actualización: ${lastUpdatedLabel || "cargando…"}`
                    : `Last updated: ${lastUpdatedLabel || "loading…"}`}
                </span>
              </div>
            </div>

            <ImportTable
              currentLanguage={currentLanguage}
              importsData={filteredImports}
              loading={loading}
              onRowClick={(imp) => {
                setSelectedImport(imp);
                setOpenItems(true);
              }}
              onFiltersChange={handleFiltersChange}
            />
          </div>
        </div>
      </main>

      {/* Modal de detalle */}
      <ImportDetails
        open={openItems}
        onClose={() => setOpenItems(false)}
        imp={selectedImport}
        currentLanguage={currentLanguage}
      />
    </div>
  );
};

export default ImportManagement;


