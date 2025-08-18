import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import TenderManagement from "./pages/tender-management";
import ImportManagement from "./pages/import-management";
import CommunicationsLog from "./pages/communications-log";
import Dashboard from "./pages/dashboard";
import DemandForecasting from "./pages/demand-forecasting";
import PurchaseOrderTracking from "./pages/purchase-order-tracking";
import SheetTest from "./pages/SheetTest";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          <Route path="/" element={<CommunicationsLog />} />
          <Route path="/tender-management" element={<TenderManagement />} />
          <Route path="/import-management" element={<ImportManagement />} />
          <Route path="/communications-log" element={<CommunicationsLog />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sheet-test" element={<SheetTest />} />
          <Route path="/demand-forecasting" element={<DemandForecasting />} />
          <Route path="/purchase-order-tracking" element={<PurchaseOrderTracking />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;

