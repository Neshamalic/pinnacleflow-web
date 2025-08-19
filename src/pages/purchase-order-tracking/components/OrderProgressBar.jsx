import React, { useMemo } from 'react';

const STATUS_STEPS = ['draft', 'created', 'in-process', 'ready', 'shipped'];

const getStepIndex = (status) => {
  const s = String(status || '').toLowerCase().trim();
  const idx = STATUS_STEPS.indexOf(s);
  // draft/created -> 0, in-process -> 2, ready -> 3, shipped -> 4
  return idx >= 0 ? idx : 0;
};

const colorForStep = (idx) => {
  // Puedes ajustar colores según tu sistema de diseño
  if (idx >= 4) return { bar: 'bg-purple-500', track: 'bg-purple-100' }; // shipped
  if (idx >= 3) return { bar: 'bg-green-500', track: 'bg-green-100' };   // ready
  if (idx >= 2) return { bar: 'bg-amber-500', track: 'bg-amber-100' };   // in-process
  return { bar: 'bg-gray-500', track: 'bg-gray-100' };                    // draft/created/unknown
};

const labels = (lang = 'en') => ({
  started: lang === 'es' ? 'Iniciado' : 'Started',
  ready:   lang === 'es' ? 'Listo'     : 'Ready',
  shipped: lang === 'es' ? 'Enviado'   : 'Shipped',
});

const OrderProgressBar = React.memo(function OrderProgressBar({
  status,
  currentLanguage = 'en',
}) {
  const stepIndex = useMemo(() => getStepIndex(status), [status]);
  const percentage = useMemo(() => {
    // 0..4 → 0%, 50%, 75%, 90%, 100% (ajusta si prefieres)
    const map = [0, 50, 66, 85, 100];
    return map[Math.min(stepIndex, map.length - 1)];
  }, [stepIndex]);

  const { bar, track } = colorForStep(stepIndex);
  const L = labels(currentLanguage);

  return (
    <div className="w-full">
      <div
        className={`w-full h-2 rounded-full ${track}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        aria-label={currentLanguage === 'es' ? 'Progreso de la orden' : 'Order progress'}
      >
        <div
          className={`h-2 rounded-full transition-all duration-300 ${bar}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>{L.started}</span>
        <span>{L.ready}</span>
        <span>{L.shipped}</span>
      </div>
    </div>
  );
});

export default OrderProgressBar;
