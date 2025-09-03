// src/index.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// skin y estilos
import "./styles/rocket-skin.css";
import "./styles/index.css";     // ← este es el que faltaba
import "./styles/tailwind.css";

createRoot(document.getElementById("root")).render(<App />);

