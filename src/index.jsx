// src/index.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// 1) Skin Rocket
import "./styles/rocket-skin.css";
// 2) (opcional) tu index.css con utilidades propias
import "./styles/index.css";
// 3) Tailwind si lo usas
import "./styles/tailwind.css";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
