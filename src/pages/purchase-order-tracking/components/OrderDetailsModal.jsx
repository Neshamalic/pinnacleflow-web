import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import OrderStatusBadge from './OrderStatusBadge';
import OrderProgressBar from './OrderProgressBar';

const OrderDetailsModal = ({ order, isOpen, onClose, currentLanguage }) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!isOpen || !order) return null;

  const tabs = [
    { id: 'details', labelEn: 'Details', labelEs: 'Detalles' },
    { id: 'products', labelEn: 'Products', labelEs: 'Productos' },
    { id: 'timeline', labelEn: 'Timeline', labelEs: 'Cronología' },
    { id: 'communications', labelEn: 'Communications', labelEs: 'Comunicaciones' }
  ];

  const getTabLabel = (tab) => {
    return currentLanguage === 'es' ? tab?.labelEs : tab?.labelEn;
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat(currentLanguage === 'es' ? 'es-CL' : 'en-US', {
      style: 'currency',
      currency: currency
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat(currentLanguage === 'es' ? 'es-CL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })?.format(new Date(date));
  };

  const mockProducts = [
    {
      id: 1,
      code: 'AMX-500',
      name: 'Amoxicilina 500mg',
      quantity: 50000,
      unit: 'tablets',
      status: 'ready'
    },
    {
      id: 2,
      code: 'IBU-400',
      name: 'Ibuprofeno 400mg',
      quantity: 30000,
      unit: 'tablets',
      status: 'in-process'
    }
  ];

  const mockTimeline = [
    {
      id: 1,
      date: '2025-01-15',
      event: currentLanguage === 'es' ? 'Orden creada' : 'Order created',
      status: 'completed'
    },
    {
      id: 2,
      date: '2025-01-18',
      event: currentLanguage === 'es' ? 'Producción iniciada' : 'Production started',
      status: 'completed'
    },
    {
      id: 3,
      date: '2025-02-10',
      event: currentLanguage === 'es' ? 'Control de calidad' : 'Quality control',
      status: 'in-progress'
    },
    {
      id: 4,
      date: '2025-02-20',
      event: currentLanguage === 'es' ? 'Envío programado' : 'Shipment scheduled',
      status: 'pending'
    }
  ];

  const mockCommunications = [
    {
      id: 1,
      date: '2025-02-05',
      type: 'email',
      subject: currentLanguage === 'es' ? 'Actualización de producción' : 'Production update',
      from: 'production@pinnaclelife.in',
      content: currentLanguage === 'es' ?'La producción está en curso según lo programado. Se espera completar el 15 de febrero.' :'Production is on track as scheduled. Expected completion by February 15th.'
    },
    {
      id: 2,
      date: '2025-02-08',
      type: 'phone',
      subject: currentLanguage === 'es' ? 'Llamada de seguimiento' : 'Follow-up call',
      from: 'Rajesh Kumar',
      content: currentLanguage === 'es' ?'Discusión sobre el cronograma de envío y opciones de transporte.' :'Discussion about shipping timeline and transport options.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-card rounded-lg shadow-modal max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {currentLanguage === 'es' ? 'Detalles de la Orden' : 'Order Details'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {order?.poNumber} - {order?.tenderRef}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                activeTab === tab?.id
                  ? 'text-primary border-b-2 border-primary' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {currentLanguage === 'es' ? 'Estado de Fabricación' : 'Manufacturing Status'}
                    </label>
                    <div className="mt-1">
                      <OrderStatusBadge 
                        status={order?.manufacturingStatus} 
                        type="manufacturing" 
                        currentLanguage={currentLanguage} 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {currentLanguage === 'es' ? 'Estado QC' : 'QC Status'}
                    </label>
                    <div className="mt-1">
                      <OrderStatusBadge 
                        status={order?.qcStatus} 
                        type="qc" 
                        currentLanguage={currentLanguage} 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {currentLanguage === 'es' ? 'Tipo de Transporte' : 'Transport Type'}
                    </label>
                    <div className="mt-1">
                      <OrderStatusBadge 
                        status={order?.transportType} 
                        type="transport" 
                        currentLanguage={currentLanguage} 
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {currentLanguage === 'es' ? 'ETA' : 'ETA'}
                    </label>
                    <p className="text-foreground font-medium">{formatDate(order?.eta)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {currentLanguage === 'es' ? 'Costo USD' : 'Cost USD'}
                    </label>
                    <p className="text-foreground font-medium">{formatCurrency(order?.costUsd, 'USD')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {currentLanguage === 'es' ? 'Costo CLP' : 'Cost CLP'}
                    </label>
                    <p className="text-foreground font-medium">{formatCurrency(order?.costClp, 'CLP')}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  {currentLanguage === 'es' ? 'Progreso de Producción' : 'Production Progress'}
                </label>
                <OrderProgressBar status={order?.manufacturingStatus} currentLanguage={currentLanguage} />
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-4">
              {mockProducts?.map((product) => (
                <div key={product?.id} className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">{product?.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {currentLanguage === 'es' ? 'Código' : 'Code'}: {product?.code}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {currentLanguage === 'es' ? 'Cantidad' : 'Quantity'}: {product?.quantity?.toLocaleString()} {product?.unit}
                      </p>
                    </div>
                    <OrderStatusBadge 
                      status={product?.status} 
                      type="manufacturing" 
                      currentLanguage={currentLanguage} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {mockTimeline?.map((item, index) => (
                <div key={item?.id} className="flex items-start space-x-4">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    item?.status === 'completed' ? 'bg-green-500' :
                    item?.status === 'in-progress' ? 'bg-amber-500' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground">{item?.event}</h4>
                      <span className="text-sm text-muted-foreground">{formatDate(item?.date)}</span>
                    </div>
                    {index < mockTimeline?.length - 1 && (
                      <div className="w-px h-8 bg-border ml-1.5 mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'communications' && (
            <div className="space-y-4">
              {mockCommunications?.map((comm) => (
                <div key={comm?.id} className="bg-muted rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Icon name={comm?.type === 'email' ? 'Mail' : 'Phone'} size={16} />
                      <h4 className="font-medium text-foreground">{comm?.subject}</h4>
                    </div>
                    <span className="text-sm text-muted-foreground">{formatDate(comm?.date)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {currentLanguage === 'es' ? 'De' : 'From'}: {comm?.from}
                  </p>
                  <p className="text-sm text-foreground">{comm?.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            {currentLanguage === 'es' ? 'Cerrar' : 'Close'}
          </Button>
          <Button variant="default">
            {currentLanguage === 'es' ? 'Actualizar Estado' : 'Update Status'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;