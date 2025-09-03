// src/pages/dashboard/index.jsx
import React from "react";

export default function Dashboard() {
  return (
    <div className="pf-page">
      <div className="pf-header">
        <div>
          <div className="pf-breadcrumb">Dashboard</div>
          <h1>Dashboard</h1>
        </div>
      </div>

      <div className="pf-card" style={{ padding: 16 }}>
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <p style={{ marginTop: 6, color: "#64748b" }}>
          (Vista placeholder; solo para que la navegación funcione)
        </p>
      </div>
    </div>
  );
}
