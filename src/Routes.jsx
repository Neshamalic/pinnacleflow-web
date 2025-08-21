// src/Routes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './pages/dashboard';
import TenderManagement from './pages/tender-management';
import TenderDetail from './pages/tender-management/TenderDetail';
import TenderForm from './pages/tender-management/TenderForm';
import PurchaseOrderTracking from './pages/purchase-order-tracking';
import ImportManagement from './pages/import-management';
import Forecasting from './pages/demand-forecasting';
import CommunicationsLog from './pages/communications-log';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={<Dashboard />} />

      {/* Licitaciones */}
      <Route path="/tender-management" element={<TenderManagement />} />
      <Route path="/tender-management/new" element={<TenderForm />} />
      <Route path="/tender-management/:tenderId" element={<TenderDetail />} />
      <Route path="/tender-management/:tenderId/edit" element={<TenderForm />} />

      {/* Órdenes de compra (dos alias válidos) */}
      <Route path="/orders" element={<PurchaseOrderTracking />} />
      <Route path="/purchase-order-tracking" element={<PurchaseOrderTracking />} />

      {/* Importaciones */}
      <Route path="/import-management" element={<ImportManagement />} />

      {/* Pronósticos */}
      <Route path="/forecasting" element={<Forecasting />} />
      <Route path="/demand-forecasting" element={<Forecasting />} />

      {/* Comunicaciones */}
      <Route path="/communications-log" element={<CommunicationsLog />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

