// src/Routes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Páginas principales
import Dashboard from './pages/dashboard';
import TenderManagement from './pages/tender-management';
import TenderDetail from './pages/tender-management/TenderDetail';
import TenderForm from './pages/tender-management/TenderForm';

import PurchaseOrderTracking from './pages/purchase-order-tracking';
import OrderForm from './pages/purchase-order-tracking/OrderForm'; // <- NUEVO

import ImportManagement from './pages/import-management';
import Forecasting from './pages/demand-forecasting';
import CommunicationsLog from './pages/communications-log';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Home → Dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Licitaciones */}
      <Route path="/tender-management" element={<TenderManagement />} />
      <Route path="/tender-management/new" element={<TenderForm />} />
      <Route path="/tender-management/:tenderId" element={<TenderDetail />} />
      <Route path="/tender-management/:tenderId/edit" element={<TenderForm />} />

      {/* Órdenes de compra */}
      <Route path="/orders" element={<PurchaseOrderTracking />} />
      <Route path="/orders/new" element={<OrderForm />} />                 {/* <- NUEVA */}
      <Route path="/orders/:poNumber/edit" element={<OrderForm />} />      {/* <- NUEVA */}

      {/* Importaciones */}
      <Route path="/import-management" element={<ImportManagement />} />

      {/* Pronósticos (alias por si usas ambos en botones/links) */}
      <Route path="/forecasting" element={<Forecasting />} />
      <Route path="/demand-forecasting" element={<Forecasting />} />

      {/* Comunicaciones */}
      <Route path="/communications-log" element={<CommunicationsLog />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

