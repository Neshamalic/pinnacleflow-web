import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import TenderManagement from "./pages/tender-management/index.jsx";

function Dummy({ title }) {
  return (
    <div className="pf-page">
      <div className="pf-card" style={{ padding: 16 }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <p style={{ marginTop: 8, color: "#64748b" }}>
          (Vista placeholder; solo para que la navegación funcione)
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      {/* Top nav muy simple */}
      <div style={{
        background: "#ffffff", borderBottom: "1px solid #e5e7eb",
        position: "sticky", top: 0, zIndex: 10
      }}>
        <div className="pf-page" style={{ paddingTop: 12, paddingBottom: 12 }}>
          <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <strong>PinnacleFlow</strong>
            <NavLink to="/" className="pf-link">Dashboard</NavLink>
            <NavLink to="/tender-management" className="pf-link">Tenders</NavLink>
            <NavLink to="/orders" className="pf-link">Orders</NavLink>
            <NavLink to="/imports" className="pf-link">Imports</NavLink>
            <NavLink to="/forecasting" className="pf-link">Forecasting</NavLink>
            <NavLink to="/communications" className="pf-link">Communications</NavLink>
          </nav>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Dummy title="Dashboard" />} />
        <Route path="/tender-management" element={<TenderManagement />} />
        <Route path="/tender-management/new" element={<Dummy title="New Tender" />} />
        <Route path="/tender-management/:id" element={<Dummy title="Tender Detail (View)" />} />
        <Route path="/tender-management/:id/edit" element={<Dummy title="Tender Edit" />} />

        <Route path="/orders" element={<Dummy title="Orders" />} />
        <Route path="/imports" element={<Dummy title="Imports" />} />
        <Route path="/forecasting" element={<Dummy title="Forecasting" />} />
        <Route path="/communications" element={<Dummy title="Communications" />} />
      </Routes>
    </>
  );
}
