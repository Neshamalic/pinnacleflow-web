import React from 'react';
import Icon from '../../../components/AppIcon';

const OrderSummaryCards = ({ currentLanguage }) => {
  const summaryData = [
    {
      id: 'total-orders',
      titleEn: 'Total Orders',
      titleEs: 'Órdenes Totales',
      value: 47,
      change: '+12%',
      changeType: 'positive',
      icon: 'ShoppingCart',
      color: 'bg-blue-500'
    },
    {
      id: 'in-process',
      titleEn: 'In Process',
      titleEs: 'En Proceso',
      value: 18,
      change: '+5',
      changeType: 'positive',
      icon: 'Clock',
      color: 'bg-amber-500'
    },
    {
      id: 'ready',
      titleEn: 'Ready',
      titleEs: 'Listo',
      value: 15,
      change: '+8',
      changeType: 'positive',
      icon: 'CheckCircle',
      color: 'bg-green-500'
    },
    {
      id: 'shipped',
      titleEn: 'Shipped',
      titleEs: 'Enviado',
      value: 14,
      change: '+3',
      changeType: 'positive',
      icon: 'Truck',
      color: 'bg-purple-500'
    },
    {
      id: 'avg-timeline',
      titleEn: 'Avg. Production Time',
      titleEs: 'Tiempo Promedio',
      value: '45 días',
      change: '-3 días',
      changeType: 'positive',
      icon: 'Calendar',
      color: 'bg-indigo-500'
    }
  ];

  const getTitle = (item) => {
    return currentLanguage === 'es' ? item?.titleEs : item?.titleEn;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {summaryData?.map((item) => (
        <div key={item?.id} className="bg-card rounded-lg border border-border p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className={`${item?.color} rounded-lg p-3`}>
              <Icon name={item?.icon} size={24} color="white" />
            </div>
            <div className={`text-sm font-medium ${
              item?.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {item?.change}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-foreground">{item?.value}</p>
            <p className="text-sm text-muted-foreground">{getTitle(item)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderSummaryCards;