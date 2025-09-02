// src/App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "@/layouts/AppShell";

// Importa tus páginas (ajusta paths si fuera necesario)
const Dashboard = lazy(() => import("@/pages/dashboard"));
const TenderManagement = lazy(() => import("@/pages/tender-management"));
const PurchaseOrderTracking = lazy(() =>
  import("@/pages/purchase-order-tracking")
);
const ImportManagement = lazy(() => import("@/pages/import-management"));
const Forecasting = lazy(() => import("@/pages/forecasting"));
const CommunicationsLog = lazy(() => import("@/pages/communications-log"));

// Fallback muy simple mientras cargan los chunks
function Loader() {
  return (
    <div className="grid place-items-center py-10 text-slate-600">Loading…</div>
  );
}

// 404 simple
function NotFound() {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="text-slate-600">The page you requested does not exist.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Layout global: TODO lo que esté dentro usa AppShell */}
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tender-management/*" element={<TenderManagement />} />
            <Route
              path="/purchase-order-tracking"
              element={<PurchaseOrderTracking />}
            />
            <Route path="/import-management" element={<ImportManagement />} />
            <Route path="/forecasting" element={<Forecasting />} />
            <Route path="/communications-log" element={<CommunicationsLog />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
