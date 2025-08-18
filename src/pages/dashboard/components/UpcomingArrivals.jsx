import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UpcomingArrivals = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const navigate = useNavigate();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  const mockArrivals = [
    {
      id: 1,
      shipmentId: 'SHP-2024-008',
      tenderId: 'CENABAST-2024-001',
      products: ['Losartán 50mg', 'Enalapril 10mg'],
      packagingUnits: [100, 30],
      eta: '2024-02-28',
      port: 'Valparaíso',
      status: 'in-transit',
      priority: 'high'
    },
    {
      id: 2,
      shipmentId: 'SHP-2024-009',
      tenderId: 'CENABAST-2024-002',
      products: ['Amoxicilina 500mg'],
      packagingUnits: [30],
      eta: '2024-03-05',
      port: 'San Antonio',
      status: 'customs',
      priority: 'medium'
    },
    {
      id: 3,
      shipmentId: 'SHP-2024-010',
      tenderId: 'CENABAST-2024-003',
      products: ['Metformina 850mg', 'Glibenclamida 5mg'],
      packagingUnits: [100, 30],
      eta: '2024-03-12',
      port: 'Valparaíso',
      status: 'scheduled',
      priority: 'low'
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      'in-transit': {
        color: 'bg-blue-100 text-blue-800',
        label: currentLanguage === 'es' ? 'En Tránsito' : 'In Transit',
        icon: 'Truck'
      },
      'customs': {
        color: 'bg-yellow-100 text-yellow-800',
        label: currentLanguage === 'es' ? 'En Aduana' : 'At Customs',
        icon: 'Clock'
      },
      'scheduled': {
        color: 'bg-gray-100 text-gray-800',
        label: currentLanguage === 'es' ? 'Programado' : 'Scheduled',
        icon: 'Calendar'
      }
    };

    const config = statusConfig?.[status] || statusConfig?.scheduled;
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config?.color}`}>
        <Icon name={config?.icon} size={12} className="mr-1" />
        {config?.label}
      </div>
    );
  };

  const getPriorityIndicator = (priority) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return <div className={`w-2 h-2 rounded-full ${colors?.[priority] || colors?.low}`} />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString(currentLanguage === 'es' ? 'es-CL' : 'en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatProducts = (products, packagingUnits) => {
    return products?.map((product, index) => {
      const units = packagingUnits?.[index];
      return `${product} (${units} ${currentLanguage === 'es' ? 'unidades' : 'units'})`;
    })?.join(', ');
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="Ship" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            {currentLanguage === 'es' ? 'Próximas Llegadas' : 'Upcoming Arrivals'}
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/import-management')}
          iconName="ExternalLink"
          iconPosition="right"
        >
          {currentLanguage === 'es' ? 'Ver Todo' : 'View All'}
        </Button>
      </div>

      <div className="space-y-4">
        {mockArrivals?.map((arrival) => (
          <div
            key={arrival?.id}
            className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            onClick={() => navigate('/import-management')}
          >
            <div className="flex-shrink-0">
              {getPriorityIndicator(arrival?.priority)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {arrival?.shipmentId}
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatDate(arrival?.eta)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {formatProducts(arrival?.products, arrival?.packagingUnits)}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  {arrival?.port}
                </span>
                {getStatusBadge(arrival?.status)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {mockArrivals?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Ship" size={48} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            {currentLanguage === 'es' ?'No hay llegadas programadas' :'No scheduled arrivals'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default UpcomingArrivals;