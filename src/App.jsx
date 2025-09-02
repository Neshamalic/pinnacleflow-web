// src/App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes";

// Estilos globales (si no están ya en index.jsx)
import "./styles/tailwind.css";
import "./styles/index.css";

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
