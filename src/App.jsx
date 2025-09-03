// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

// Layout base (igual al de Tenders)
const PageShell = ({ title, children, right = null, breadcrumb = "Dashboard" }) => (
  <div className="pf-page">
    <div className="pf-header">
      <div>
        <div className="pf-breadcrumb">{breadcrumb} &gt; {title}</div>
        <h1>{title}</h1>
      </div>
      {right}
    </div>
    {children}
  </div>
);

// Navbar superior (estilo simple tipo Rocket)
const TopNav = () => {
  const link = ({ isActive }) =>
    "nav-tab" + (isActive ? " active" : "");
  return (
    <div style={{
      height: 52, display: "flex", alignItems: "center", gap: 18,
      padding: "0 16px", borderBottom: "1px solid var(--pf-border)", background: "#fff"
    }}>
      <div style={{ fontWeight: 700 }}>PinnacleFlow</div>
      <NavLink className={link} to="/">Dashboard</NavLink>
      <NavLink className={link} to="/tender-management">Tenders</NavLink>
      <NavLink className={link} to="/orders">Orders</NavLink>
      <NavLink className={link} to="/imports">Imports</NavLink>
      <NavLink className={link} to="/forecasting">Forecasting</NavLink>
      <NavLink className={link} to="/communications">Communications</NavLink>
    </div>
  );
};

// Páginas
import Dashboard from "@/pages/dashboard";
import TenderManagement from "@/pages/tender-management";     // ← tu página real
import Orders from "@/pages/orders";
import Imports from "@/pages/imports";
import Forecasting from "@/pages/forecasting";
import Communications from "@/pages/communications";

export default function App() {
  return (
    <BrowserRouter>
      <TopNav />
      <Routes>
        <Route path="/" element={
          <PageShell title="Dashboard">
            <Dashboard />
          </PageShell>
        } />
        <Route path="/tender-management" element={
          <PageShell title="Tender Management" breadcrumb="Dashboard">
            <TenderManagement />
          </PageShell>
        } />
        <Route path="/orders" element={
          <PageShell title="Orders"><Orders /></PageShell>
        } />
        <Route path="/imports" element={
          <PageShell title="Imports"><Imports /></PageShell>
        } />
        <Route path="/forecasting" element={
          <PageShell title="Forecasting"><Forecasting /></PageShell>
        } />
        <Route path="/communications" element={
          <PageShell title="Communications"><Communications /></PageShell>
        } />
        <Route path="*" element={
          <PageShell title="Not found">
            <div className="pf-card" style={{ padding:16 }}>404</div>
          </PageShell>
        } />
      </Routes>
    </BrowserRouter>
  );
}
