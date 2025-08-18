import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const ImportTimeline = ({ importData }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  const labels = {
    en: {
      timeline: 'Import Timeline',
      departure: 'Departure from India',
      inTransit: 'In Transit',
      arrival: 'Arrival at Port',
      customsClearance: 'Customs Clearance',
      qualityControl: 'Quality Control',
      warehouseEntry: 'Warehouse Entry',
      inventoryIntegration: 'Inventory Integration',
      completed: 'Completed',
      inProgress: 'In Progress',
      pending: 'Pending',
      estimated: 'Estimated'
    },
    es: {
      timeline: 'Cronología de Importación',
      departure: 'Salida de India',
      inTransit: 'En Tránsito',
      arrival: 'Llegada al Puerto',
      customsClearance: 'Despacho Aduanero',
      qualityControl: 'Control de Calidad',
      warehouseEntry: 'Entrada a Almacén',
      inventoryIntegration: 'Integración de Inventario',
      completed: 'Completado',
      inProgress: 'En Proceso',
      pending: 'Pendiente',
      estimated: 'Estimado'
    }
  };

  const getTimelineSteps = () => {
    return [
      {
        id: 'departure',
        title: labels?.[currentLanguage]?.departure,
        icon: 'Plane',
        status: 'completed',
        date: importData?.departureDate,
        description: `Departed from ${importData?.originPort || 'Mumbai, India'}`
      },
      {
        id: 'in-transit',
        title: labels?.[currentLanguage]?.inTransit,
        icon: importData?.transportType === 'sea' ? 'Ship' : 'Plane',
        status: 'completed',
        date: importData?.transitDate,
        description: `${importData?.transportType === 'sea' ? 'Sea' : 'Air'} freight in progress`
      },
      {
        id: 'arrival',
        title: labels?.[currentLanguage]?.arrival,
        icon: 'MapPin',
        status: 'completed',
        date: importData?.arrivalDate,
        description: `Arrived at ${importData?.destinationPort || 'Valparaíso Port'}`
      },
      {
        id: 'customs',
        title: labels?.[currentLanguage]?.customsClearance,
        icon: 'FileCheck',
        status: importData?.customsStatus === 'cleared' ? 'completed' : 
                importData?.customsStatus === 'in-clearance' ? 'in-progress' : 'pending',
        date: importData?.customsClearanceDate,
        description: `Customs status: ${importData?.customsStatus}`
      },
      {
        id: 'qc',
        title: labels?.[currentLanguage]?.qualityControl,
        icon: 'Shield',
        status: importData?.qcStatus === 'approved' ? 'completed' : 
                importData?.qcStatus === 'in-progress' ? 'in-progress' : 'pending',
        date: importData?.qcCompletionDate,
        description: `QC status: ${importData?.qcStatus}`
      },
      {
        id: 'warehouse',
        title: labels?.[currentLanguage]?.warehouseEntry,
        icon: 'Warehouse',
        status: importData?.warehouseStatus || 'pending',
        date: importData?.warehouseEntryDate,
        description: 'Entry to distribution warehouse'
      },
      {
        id: 'integration',
        title: labels?.[currentLanguage]?.inventoryIntegration,
        icon: 'Database',
        status: importData?.inventoryStatus || 'pending',
        date: importData?.inventoryIntegrationDate,
        description: 'Integration with inventory system'
      }
    ];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getConnectorColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600';
      case 'in-progress':
        return 'bg-blue-600';
      default:
        return 'bg-gray-300';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return labels?.[currentLanguage]?.estimated;
    const date = new Date(dateString);
    return date?.toLocaleDateString(currentLanguage === 'es' ? 'es-CL' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const timelineSteps = getTimelineSteps();
  const t = labels?.[currentLanguage];

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
        <Icon name="Clock" size={20} className="mr-2" />
        {t?.timeline}
      </h3>
      <div className="relative">
        {timelineSteps?.map((step, index) => (
          <div key={step?.id} className="relative flex items-start mb-8 last:mb-0">
            {/* Connector Line */}
            {index < timelineSteps?.length - 1 && (
              <div 
                className={`absolute left-6 top-12 w-0.5 h-16 ${getConnectorColor(step?.status)}`}
              />
            )}

            {/* Step Icon */}
            <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getStatusColor(step?.status)} mr-4 z-10`}>
              <Icon name={step?.icon} size={20} />
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-foreground">
                  {step?.title}
                </h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(step?.status)}`}>
                  {t?.[step?.status] || step?.status}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                {step?.description}
              </p>
              
              <div className="flex items-center text-xs text-secondary">
                <Icon name="Calendar" size={14} className="mr-1" />
                <span>{formatDate(step?.date)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Progress Summary */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {currentLanguage === 'es' ? 'Progreso General' : 'Overall Progress'}
          </span>
          <span className="font-medium text-foreground">
            {Math.round((timelineSteps?.filter(step => step?.status === 'completed')?.length / timelineSteps?.length) * 100)}%
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(timelineSteps?.filter(step => step?.status === 'completed')?.length / timelineSteps?.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImportTimeline;