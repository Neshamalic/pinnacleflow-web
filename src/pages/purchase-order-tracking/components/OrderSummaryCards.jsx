import React from 'react';
import Icon from '../../../components/AppIcon';

const Card = ({ bg, iconBg, iconColor, icon, title, value, subtitle }) => (
  <div className="bg-card rounded-lg border border-border p-6">
    <div className="flex items-center justify-between mb-3">
      <div className={`${iconBg} rounded-lg p-3`}>
        <Icon name={icon} size={24} className={iconColor} />
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
      {subtitle ? (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      ) : null}
    </div>
  </div>
);

const OrderSummaryCards = ({ currentLanguage = 'en', summary = {} }) => {
  // Valores que vienen calculados desde la página padre
  const {
    total = 0,
    inProcess = 0,
    ready = 0,
    shipped = 0,
    avgAgeDays = null, // puede venir null si no se puede calcular
  } = summary;

  const locale = currentLanguage === 'es' ? 'es-CL' : 'en-US';
  const nf = new Intl.NumberFormat(locale);

  // Textos en ambos idiomas
  const labels = currentLanguage === 'es'
    ? {
        total: 'Órdenes Totales',
        inProcess: 'En Proceso',
        ready: 'Listo',
        shipped: 'Enviado',
        avg: 'Tiempo Promedio',
        days: 'días',
        noData: '—',
      }
    : {
        total: 'Total Orders',
        inProcess: 'In Process',
        ready: 'Ready',
        shipped: 'Shipped',
        avg: 'Average Time',
        days: 'days',
        noData: '—',
      };

  // Tarjetas (mismo orden que ves en la UI)
  const cards = [
    {
      key: 'total',
      title: labels.total,
      value: nf.format(total),
      icon: 'ShoppingCart',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      key: 'inProcess',
      title: labels.inProcess,
      value: nf.format(inProcess),
      icon: 'Clock',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      key: 'ready',
      title: labels.ready,
      value: nf.format(ready),
      icon: 'CheckCircle',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      key: 'shipped',
      title: labels.shipped,
      value: nf.format(shipped),
      icon: 'Truck',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      // mostramos también el “tiempo promedio” como subtítulo de esta tarjeta
      subtitle:
        avgAgeDays == null
          ? `${labels.avg}: ${labels.noData}`
          : `${labels.avg}: ${avgAgeDays} ${labels.days}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((c) => (
        <Card
          key={c.key}
          bg={c.bg}
          iconBg={c.iconBg}
          iconColor={c.iconColor}
          icon={c.icon}
          title={c.title}
          value={c.value}
          subtitle={c.subtitle}
        />
      ))}
    </div>
  );
};

export default OrderSummaryCards;
