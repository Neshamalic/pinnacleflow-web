import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Tus estilos base
import "./styles/tailwind.css";
import "./styles/index.css";

// >>> Piel Rocket, debe ir al final para sobrescribir <<<
import "./styles/rocket-skin.css";

createRoot(document.getElementById("root")).render(<App />);
