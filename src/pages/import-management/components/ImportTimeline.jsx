// src/pages/import-management/components/ImportTimeline.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { fmtDate } from '../../../utils/format.js';

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
      estimated: 'Estimated',
      seaInProgress: 'Sea freight in progress',
      airInProgress: 'Air freight in progress',
      departedFrom: (p) => `Departed from ${p}`,
      arrivedAt: (p) => `Arrived at ${p}`,
      customsStatus: (s) => `Customs status: ${s}`,
      qcStatus: (s) => `QC status: ${s}`,
      warehouseDesc: 'Entry to distribution warehouse',
      inventoryDesc: 'Integration with inventory system',
      overallProgress: 'Overall Progress',
    },
    es: {
      timeline: 'Cronología de Importación',
      departure: 'Salida de India',
      inTransit: 'En Tránsito',
      arrival: 'Llegada al Puerto',
      customsClearance: 'Despacho Aduanero',
      qualityControl: 'Control de Calidad',
      warehouseEntry: 'Entrada a Bodega',
      inventoryIntegration: 'Integración de Inventario',
      completed: 'Completado',
      inProgress: 'En Proceso',
      pending: 'Pendiente',
      estimated: 'Estimado',
      seaInProgress: 'Transporte marítimo en curso',
      airInProgress: 'Transporte aéreo en curso',
      departedFrom: (p) => `Salida desde ${p}`,
      arrivedAt: (p) => `Arribó a ${p}`,
      customsStatus: (s) => `Estado aduanas: ${s}`,
      qcStatus: (s) => `Estado QC: ${s}`,
      warehouseDesc: 'Ingreso a bodega de distribución',
      inventoryDesc: 'Integración con sistema de inventario',
      overallProgress: 'Progreso General',
    },
  };

  const t = labels[currentLanguage] || labels.en;

  const getTimelineSteps = () => {
    const origin = importData?.originPort || (currentLanguage === 'es' ? 'Mumbai, India' : 'Mumbai, India');
    const dest =
      importData?.destinationPort ||
      (currentLanguage === 'es' ? 'Puerto de Valparaíso' : 'Valparaíso Port');
    const transport = String(importData?.transportType || '').toLowerCase();

    return [
      {
        id: 'departure',
        title: t.departure,
        icon: 'Plane',
        status: 'completed',
        date: importData?.departureDate,
        description: t.departedFrom(origin),
      },
      {
        id: 'in-transit',
        title: t.inTransit,
        icon: transport === 'sea' ? 'Ship' : 'Plane',
        status: 'completed',
        date: importData?.transitDate,
        description: transport === 'sea' ? t.seaInProgress : t.airInProgress,
      },
      {
        id: 'arrival',
        title: t.arrival,
        icon: 'MapPin',
        status: 'completed',
        date: importData?.arrivalDate,
        description: t.arrivedAt(dest),
      },
      {
        id: 'customs',
        title: t.customsClearance,
        icon: 'FileCheck',
        status:
          importData?.customsStatus === 'cleared'
            ? 'completed'
            : importData?.customsStatus === 'in-clearance'
            ? 'in-progress'
            : 'pending',
        date: importData?.customsClearanceDate,
        description: t.customsStatus(importData?.customsStatus || '-'),
      },
      {
        id: 'qc',
        title: t.qualityControl,
        icon: 'Shield',
        status:
          importData?.qcStatus === 'approved'
            ? 'completed'
            : importData?.qcStatus === 'in-progress'
            ? 'in-progress'
            : 'pending',
        date: importData?.qcCompletionDate,
        description: t.qcStatus(importData?.qcStatus || '-'),
      },
      {
        id: 'warehouse',
        title: t.warehouseEntry,
        icon: 'Warehouse',
        status: importData?.warehouseStatus || 'pending',
        date: importData?.warehouseEntryDate,
        description: t.warehouseDesc,
      },
      {
        id: 'integration',
        title: t.inventoryIntegration,
        icon: 'Database',
        status: importData?.inventoryStatus || 'pending',
        date: importData?.inventoryIntegrationDate,
        description: t.inventoryDesc,
      },
    ];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
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

  // Usa helper de formato con hora/minuto
  const d = (value) =>
    fmtDate(value, currentLanguage, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }) || t.estimated;

  const timelineSteps = getTimelineSteps();
  const completedCount = timelineSteps.filter((s) => s.status === 'completed').length;
  const progressPct = Math.round((completedCount / timelineSteps.length) * 100);

  // Traducción del estado para la pill
  const statusLabel = (status) => {
    if (status === 'completed') return t.completed;
    if (status === 'in-progress') return t.inProgress;
    return t.pending;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
        <Icon name="Clock" size={20} className="mr-2" />
        {t.timeline}
      </h3>

      <div className="relative">
        {timelineSteps.map((step, index) => (
          <div key={step.id} className="relative flex items-start mb-8 last:mb-0">
            {/* Connector Line */}
            {index < timelineSteps.length - 1 && (
              <div className={`absolute left-6 top-12 w-0.5 h-16 ${getConnectorColor(step.status)}`} />
            )}

            {/* Step Icon */}
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full ${getStatusColor(
                step.status
              )} mr-4 z-10`}
            >
              <Icon name={step.icon} size={20} />
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-foreground">{step.title}</h4>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    step.status
                  )}`}
                >
                  {statusLabel(step.status)}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-2">{step.description}</p>

              <div className="flex items-center text-xs text-secondary">
                <Icon name="Calendar" size={14} className="mr-1" />
                <span>{d(step.date)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t.overallProgress}</span>
          <span className="font-medium text-foreground">{progressPct}%</span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImportTimeline;
