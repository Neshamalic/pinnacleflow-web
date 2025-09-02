/* ============== Theme base (claro) ============== */
:root {
  --bg: #f8fafc;                /* fondo general */
  --card: #ffffff;              /* tarjetas y tablas */
  --border: #e5e7eb;            /* bordes suaves */
  --muted: #f1f5f9;             /* encabezados de tabla, cajas sutiles */
  --muted-foreground: #64748b;  /* texto suave */
  --foreground: #0f172a;        /* texto principal */
  --shadow: 0 1px 2px rgba(0,0,0,0.06), 0 1px 6px rgba(0,0,0,0.04);

  --primary: #2563eb;           /* azul botones */
  --primary-foreground: #ffffff;

  --success-bg: #ecfdf5;
  --success-fg: #047857;

  --warning-bg: #fef9c3;
  --warning-fg: #a16207;

  --danger-bg: #fee2e2;
  --danger-fg: #b91c1c;

  --info-bg: #eff6ff;
  --info-fg: #1d4ed8;

  --muted-badge-bg: #f1f5f9;
  --muted-badge-fg: #475569;
}

html, body, #root {
  height: 100%;
}

body {
  background: var(--bg);
  color: var(--foreground);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
}

/* ============== Botones mínimos reutilizables ============== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  font-size: .875rem;
  line-height: 1.25rem;
  padding: .5rem .75rem;
  border-radius: .5rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background .15s ease, color .15s ease, border-color .15s ease, box-shadow .15s ease;
}

.btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--primary);
}
.btn-primary:hover { filter: brightness(0.95); }

.btn-outline {
  background: transparent;
  color: var(--foreground);
  border-color: var(--border);
}
.btn-outline:hover { background: var(--muted); }

/* ============== Tarjetas ============== */
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 1rem;           /* 16px: look tipo Rocket */
  box-shadow: var(--shadow);
}

/* ============== Contenedor de tabla estilo Rocket ============== */
.table-container {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 1rem;
  box-shadow: var(--shadow);
  overflow: hidden;              /* redondeado visible */
}

/* Tabla base */
.table-container table {
  width: 100%;
  border-collapse: separate;     /* respeta padding + bordes suaves */
  border-spacing: 0;
  font-size: 0.875rem;           /* 14px */
}

/* Encabezados */
.table-container thead tr {
  background: var(--muted);
}
.table-container thead th {
  color: var(--muted-foreground);
  font-weight: 600;
  text-align: left;
  padding: 0.75rem 1rem;         /* px-4 py-3 */
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

/* Filas */
.table-container tbody tr {
  background: var(--card);
}
.table-container tbody td {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border);
  vertical-align: middle;
}

/* Hover fila */
.table-container tbody tr:hover {
  background: #fafafa;
}

/* ============== Pills/Badges (si prefieres clases vs. inline) ============== */
.pill {
  display: inline-flex;
  align-items: center;
  gap: .25rem;
  padding: .25rem .5rem;
  font-size: .75rem;
  line-height: 1rem;
  border-radius: .5rem;
  border: 1px solid transparent;
  white-space: nowrap;
}

.pill-success {
  background: var(--success-bg);
  color: var(--success-fg);
  border-color: rgba(4, 120, 87, 0.2);
}

.pill-warning {
  background: var(--warning-bg);
  color: var(--warning-fg);
  border-color: rgba(161, 98, 7, 0.2);
}

.pill-danger {
  background: var(--danger-bg);
  color: var(--danger-fg);
  border-color: rgba(185, 28, 28, 0.2);
}

.pill-info {
  background: var(--info-bg);
  color: var(--info-fg);
  border-color: rgba(29, 78, 216, 0.2);
}

.pill-muted {
  background: var(--muted-badge-bg);
  color: var(--muted-badge-fg);
  border-color: rgba(71, 85, 105, 0.2);
}

/* ============== Utilidades menores ============== */
.text-muted { color: var(--muted-foreground); }
.divider-y > * + * { border-top: 1px solid var(--border); }
.rounded-xl { border-radius: 1rem; }
