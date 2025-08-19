import React from 'react';

const DEFAULT_CFG = {
  labelEn: 'Unknown',
  labelEs: 'Desconocido',
  className: 'bg-gray-100 text-gray-800 border-gray-200',
};

const MAPS = {
  manufacturing: {
    'in-process': { labelEn: 'In Process', labelEs: 'En Proceso', className: 'bg-amber-100 text-amber-800 border-amber-200' },
    ready:        { labelEn: 'Ready',      labelEs: 'Listo',      className: 'bg-green-100 text-green-800 border-green-200' },
    shipped:      { labelEn: 'Shipped',    labelEs: 'Enviado',    className: 'bg-purple-100 text-purple-800 border-purple-200' },
    // opcionales por si aparecen:
    draft:        { labelEn: 'Draft',      labelEs: 'Borrador',   className: 'bg-gray-100 text-gray-800 border-gray-200' },
    created:      { labelEn: 'Created',    labelEs: 'Creado',     className: 'bg-gray-100 text-gray-800 border-gray-200' },
  },
  qc: {
    pending:  { labelEn: 'Pending',  labelEs: 'Pendiente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    approved: { labelEn: 'Approved', labelEs: 'Aprobado',  className: 'bg-green-100 text-green-800 border-green-200' },
    rejected: { labelEn: 'Rejected', labelEs: 'Rechazado', className: 'bg-red-100 text-red-800 border-red-200' },
  },
  transport: {
    sea: { labelEn: 'Sea', labelEs: 'Marítimo', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    air: { labelEn: 'Air', labelEs: 'Aéreo',    className: 'bg-sky-100 text-sky-800 border-sky-200' },
  },
};

const norm = (v) => String(v || '').toLowerCase().trim();

const OrderStatusBadge = React.memo(function OrderStatusBadge({
  status = '',
  type = 'manufacturing',
  currentLanguage = 'en',
}) {
  const t = norm(type);
  const s = norm(status);

  const cfg =
    (MAPS[t] && MAPS[t][s])        ? MAPS[t][s] :
    (MAPS[t] && MAPS[t]['unknown'])? MAPS[t]['unknown'] :
    DEFAULT_CFG;

  const label = currentLanguage === 'es' ? cfg.labelEs : cfg.labelEn;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}
      title={label}
    >
      {label}
    </span>
  );
});

export default OrderStatusBadge;
