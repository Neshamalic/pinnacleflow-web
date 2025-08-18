import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LowStockAlerts = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const navigate = useNavigate();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  const mockAlerts = [
    {
      id: 1,
      product: 'Paracetamol 500mg',
      currentStock: 5000,
      packagingUnits: 100,
      minThreshold: 15000,
      daysRemaining: 8,
      status: 'critical',
      lastRestock: '2024-01-15'
    },
    {
      id: 2,
      product: 'Amoxicilina 500mg',
      currentStock: 12000,
      packagingUnits: 30,
      minThreshold: 25000,
      daysRemaining: 18,
      status: 'low',
      lastRestock: '2024-01-22'
    },
    {
      id: 3,
      product: 'Ibuprofeno 400mg',
      currentStock: 8000,
      packagingUnits: 30,
      minThreshold: 20000,
      daysRemaining: 12,
      status: 'critical',
      lastRestock: '2024-01-18'
    },
    {
      id: 4,
      product: 'Losartán 50mg',
      currentStock: 18000,
      packagingUnits: 100,
      minThreshold: 30000,
      daysRemaining: 25,
      status: 'warning',
      lastRestock: '2024-02-01'
    }
  ];

  const getStatusBadge = (status, days) => {
    const statusConfig = {
      critical: {
        color: 'bg-red-100 text-red-800 border-red-200',
        label: currentLanguage === 'es' ? 'Crítico' : 'Critical',
        icon: 'AlertTriangle'
      },
      low: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: currentLanguage === 'es' ? 'Bajo' : 'Low',
        icon: 'AlertCircle'
      },
      warning: {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        label: currentLanguage === 'es' ? 'Alerta' : 'Warning',
        icon: 'Clock'
      }
    };

    const config = statusConfig?.[status] || statusConfig?.warning;
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded border text-xs font-medium ${config?.color}`}>
        <Icon name={config?.icon} size={12} className="mr-1" />
        <span>{config?.label}</span>
        <span className="ml-1">({days}d)</span>
      </div>
    );
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat(currentLanguage === 'es' ? 'es-CL' : 'en-US')?.format(num);
  };

  const formatPackagingInfo = (packagingUnits) => {
    return `${packagingUnits} ${currentLanguage === 'es' ? 'unidades/empaque' : 'units/package'}`;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="AlertTriangle" size={20} className="text-red-500" />
          <h3 className="text-lg font-semibold text-foreground">
            {currentLanguage === 'es' ? 'Alertas de Stock Bajo' : 'Low Stock Alerts'}
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/demand-forecasting')}
          iconName="ExternalLink"
          iconPosition="right"
        >
          {currentLanguage === 'es' ? 'Ver Todo' : 'View All'}
        </Button>
      </div>

      <div className="space-y-4">
        {mockAlerts?.map((alert) => (
          <div
            key={alert?.id}
            className="p-4 bg-muted/50 rounded-lg border-l-4 border-l-red-400 hover:bg-muted transition-colors cursor-pointer"
            onClick={() => navigate('/demand-forecasting')}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground text-sm">
                    {alert?.product}
                  </h4>
                  {getStatusBadge(alert?.status, alert?.daysRemaining)}
                </div>
                
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{currentLanguage === 'es' ? 'Stock actual:' : 'Current stock:'}</span>
                    <span className="font-medium">{formatNumber(alert?.currentStock)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{currentLanguage === 'es' ? 'Empaque:' : 'Package:'}</span>
                    <span className="font-medium">{formatPackagingInfo(alert?.packagingUnits)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{currentLanguage === 'es' ? 'Umbral mín:' : 'Min threshold:'}</span>
                    <span className="font-medium">{formatNumber(alert?.minThreshold)}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        alert?.status === 'critical' ? 'bg-red-500' :
                        alert?.status === 'low' ? 'bg-yellow-500' : 'bg-orange-500'
                      }`}
                      style={{
                        width: `${Math.max(10, (alert?.currentStock / alert?.minThreshold) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mockAlerts?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="CheckCircle" size={48} className="mx-auto text-green-500 mb-3" />
          <p className="text-sm text-muted-foreground">
            {currentLanguage === 'es' ?'No hay alertas de stock bajo' :'No low stock alerts'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default LowStockAlerts;