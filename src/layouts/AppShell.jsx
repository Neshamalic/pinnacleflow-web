// src/layouts/AppShell.jsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";

/** Estilos activos/inactivos de los links del topbar */
const linkBase =
  "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium";
const linkClass = ({ isActive }) =>
  isActive
    ? `${linkBase} bg-slate-100 text-slate-900`
    : `${linkBase} text-slate-600 hover:text-slate-900 hover:bg-slate-50`;

/** Iconitos simples (opcional) */
const Dot = () => (
  <svg width="6" height="6" viewBox="0 0 6 6" className="-ml-1">
    <circle cx="3" cy="3" r="3" fill="currentColor" />
  </svg>
);

export default function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <a
                href="/"
                className="text-slate-900 font-semibold tracking-tight flex items-center gap-2"
              >
                <span className="text-blue-600">⚡</span> PinnacleFlow
              </a>

              <nav className="hidden md:flex items-center gap-1">
                <NavLink to="/dashboard" className={linkClass}>
                  <Dot />
                  Dashboard
                </NavLink>
                <NavLink to="/tender-management" className={linkClass}>
                  <Dot />
                  Tenders
                </NavLink>
                <NavLink to="/purchase-order-tracking" className={linkClass}>
                  <Dot />
                  Orders
                </NavLink>
                <NavLink to="/import-management" className={linkClass}>
                  <Dot />
                  Imports
                </NavLink>
                <NavLink to="/forecasting" className={linkClass}>
                  <Dot />
                  Forecasting
                </NavLink>
                <NavLink to="/communications-log" className={linkClass}>
                  <Dot />
                  Communications
                </NavLink>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido de cada página */}
      <main className="mx-auto max-w-7xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
