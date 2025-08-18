import React from 'react';
import Icon from '../../../components/AppIcon';

const OrderSummaryCards = ({ currentLanguage, orders = [] }) => {
  // Helpers
  const t = (en, es) => (currentLanguage === 'es' ? es : en);
  const fmtInt = (n) =>
    typeof n === 'number'
      ? new Intl.NumberFormat(currentLanguage === 'es' ? 'es-CL' : 'en-US').format(n)
      : n;

  // Normalize status strings (e.g., "in process", "in_process" -> "inprocess")
  const norm = (s) => (s ? String(s).toLowerCase().replace(/\s|_/g, '') : '');

  // Metrics from real orders
  const totalOrders = orders.length;

  const inProcess = orders.filter((o) =>
    ['inprocess', 'processing', 'manufacturing', 'production', 'open'].includes(norm(o?.status))
  ).length;

  const ready = orders.filter((o) =>
    ['ready', 'completed', 'complete'].includes(norm(o?.status))
  ).length;

  const shipped = orders.filter((o) =>
    ['shipped', 'intransit', 'dispatched', 'despatched'].includes(norm(o?.status))
  ).length;

  // "Avg. Production Time": as a simple proxy, average days since orderDate (valid dates only)
  const dayDiffs = orders
    .map((o) => {
      const d = new Date(o?.orderDate);
      if (isNaN(d)) return null;
      const diffDays = Math.max(0, Math.round((Date.now() - d.getTime()) / 86_400_000));
      return diffDays;
    })
    .filter((v) => v !== null);

  const avgDays = dayDiffs.length
    ? Math.round(dayDiffs.reduce((a, b) => a + b, 0) / dayDiffs.length)
    : null;

  const summaryData = [
    {
      id: 'total-orders',
      titleEn: 'Total Orders',
      titleEs: 'Órdenes Totales',
      value: fmtInt(totalOrders),
      change: null,
      changeType: 'neutral',
      icon: 'ShoppingCart',
      color: 'bg-blue-500',
    },
    {
      id: 'in-process',
      titleEn: 'In Process',
      titleEs: 'En Proceso',
      value: fmtInt(inProcess),
      change: null,
      changeType: 'neutral',
      icon: 'Clock',
      color: 'bg-amber-500',
    },
    {
      id: 'ready',
      titleEn: 'Ready',
      titleEs: 'Listo',
      value: fmtInt(ready),
      change: null,
      changeType: 'neutral',
      icon: 'CheckCircle',
      color: 'bg-green-500',
    },
    {
      id: 'shipped',
      titleEn: 'Shipped',
      titleEs: 'Enviado',
      value: fmtInt(shipped),
      change: null,
      changeType: 'neutral',
      icon: 'Truck',
      color: 'bg-purple-500',
    },
    {
      id: 'avg-timeline',
      titleEn: 'Avg. Production Time',
      titleEs: 'Tiempo Promedio',
      value:
        avgDays === null
          ? '-'
          : `${fmtInt(avgDays)} ${t('days', 'días')}`,
      change: null,
      changeType: 'neutral',
      icon: 'Calendar',
      color: 'bg-indigo-500',
    },
  ];

  const getTitle = (item) => (currentLanguage === 'es' ? item?.titleEs : item?.titleEn);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {summaryData.map((item) => (
        <div key={item.id} className="bg-card rounded-lg border border-border p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className={`${item.color} rounded-lg p-3`}>
              <Icon name={item.icon} size={24} color="white" />
            </div>
            {item.change ? (
              <div
                className={`text-sm font-medium ${
                  item.changeType === 'positive'
                    ? 'text-green-600'
                    : item.changeType === 'negative'
                    ? 'text-red-600'
                    : 'text-muted-foreground'
                }`}
              >
                {item.change}
              </div>
            ) : (
              <div className="text-sm text-transparent select-none">—</div>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-foreground">{item.value}</p>
            <p className="text-sm text-muted-foreground">{getTitle(item)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderSummaryCards;
