import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import TenderFilters from './components/TenderFilters';
import TenderToolbar from './components/TenderToolbar';
import TenderTable from './components/TenderTable';
import TenderCardView from './components/TenderCardView';
import TenderDetailModal from './components/TenderDetailModal';

const TenderManagement = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [selectedTenders, setSelectedTenders] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'createdDate', direction: 'desc' });
  const [selectedTender, setSelectedTender] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Mock tender data
  const mockTenders = [
    {
      id: 1,
      tenderId: 'CENABAST-2024-001',
      title: 'Suministro de Medicamentos Cardiovasculares Q1 2024',
      status: 'awarded',
      productsCount: 15,
      totalValue: 2450000,
      totalValueUSD: 2650,
      currency: 'CLP',
      stockCoverage: 45,
      deliveryDate: '2024-03-15',
      createdDate: '2024-01-10',
      isOverdue: false,
      completionPercentage: 75,
      tags: ['Cardiovascular', 'Q1', 'Urgente'],
      description: `Licitación para el suministro de medicamentos cardiovasculares para el primer trimestre de 2024.\nIncluye productos como Losartán, Enalapril y Amlodipino en diferentes presentaciones.\nEntrega programada en tres fases durante el trimestre.`,
      products: [
        { name: 'Losartán 50mg', code: 'LST-50', quantity: 10000, packagingUnits: 100, unitPrice: 45 },
        { name: 'Enalapril 10mg', code: 'ENP-10', quantity: 8000, packagingUnits: 30, unitPrice: 38 },
        { name: 'Amlodipino 5mg', code: 'AML-5', quantity: 12000, packagingUnits: 100, unitPrice: 52 }
      ],
      deliverySchedule: [
        { phase: 'Fase 1', quantity: 10000, date: '2024-02-15', status: 'completed' },
        { phase: 'Fase 2', quantity: 15000, date: '2024-03-15', status: 'pending' },
        { phase: 'Fase 3', quantity: 5000, date: '2024-04-15', status: 'scheduled' }
      ],
      deliveryAddress: 'Centro de Distribución CENABAST, Santiago, Chile',
      transportMethod: 'Transporte Terrestre',
      communications: [
        {
          subject: 'Confirmación de Adjudicación',
          content: 'Se confirma la adjudicación de la licitación CENABAST-2024-001',
          type: 'Email',
          date: '2024-01-25',
          sender: 'CENABAST',
          hasAttachment: true
        },
        {
          subject: 'Actualización de Cronograma',
          content: 'Modificación en las fechas de entrega de la Fase 2',
          type: 'WhatsApp',
          date: '2024-02-10',
          sender: 'Coordinador Logística',
          hasAttachment: false
        }
      ],
      recommendations: [
        {
          title: 'Acelerar Producción',
          description: 'Se recomienda acelerar la producción para la Fase 2 debido a la alta demanda',
          priority: 'high'
        },
        {
          title: 'Optimizar Transporte',
          description: 'Considerar transporte aéreo para productos críticos',
          priority: 'medium'
        }
      ]
    },
    {
      id: 2,
      tenderId: 'CENABAST-2024-002',
      title: 'Antibióticos de Amplio Espectro 2024',
      status: 'in_delivery',
      productsCount: 8,
      totalValue: 1850000,
      totalValueUSD: 2000,
      currency: 'CLP',
      stockCoverage: 22,
      deliveryDate: '2024-02-28',
      createdDate: '2024-01-15',
      isOverdue: false,
      completionPercentage: 60,
      tags: ['Antibióticos', 'Crítico'],
      description: `Suministro de antibióticos de amplio espectro para hospitales públicos.\nIncluye Amoxicilina, Ciprofloxacino y Azitromicina.\nEntrega urgente requerida.`,
      products: [
        { name: 'Amoxicilina 500mg', code: 'AMX-500', quantity: 15000, packagingUnits: 30, unitPrice: 28 },
        { name: 'Ciprofloxacino 500mg', code: 'CIP-500', quantity: 8000, packagingUnits: 10, unitPrice: 65 }
      ],
      deliverySchedule: [
        { phase: 'Entrega Única', quantity: 23000, date: '2024-02-28', status: 'in_progress' }
      ],
      deliveryAddress: 'Hospital Salvador, Providencia, Santiago',
      transportMethod: 'Transporte Refrigerado',
      communications: [
        {
          subject: 'Estado de Producción',
          content: 'Producción en proceso, estimado de finalización 20/02/2024',
          type: 'Email',
          date: '2024-02-05',
          sender: 'Pinnacle India',
          hasAttachment: false
        }
      ],
      recommendations: [
        {
          title: 'Monitoreo de Stock',
          description: 'Stock crítico, monitorear niveles diariamente',
          priority: 'high'
        }
      ]
    },
    {
      id: 3,
      tenderId: 'CENABAST-2024-003',
      title: 'Medicamentos para Diabetes Tipo 2',
      status: 'submitted',
      productsCount: 12,
      totalValue: 3200000,
      totalValueUSD: 3450,
      currency: 'CLP',
      stockCoverage: 67,
      deliveryDate: '2024-04-30',
      createdDate: '2024-02-01',
      isOverdue: false,
      completionPercentage: 25,
      tags: ['Diabetes', 'Crónico', 'Q2'],
      description: `Licitación para medicamentos antidiabéticos para el segundo trimestre.\nIncluye Metformina, Glibenclamida y nuevos medicamentos de última generación.\nCobertura para 6 meses de tratamiento.`,
      products: [
        { name: 'Metformina 850mg', code: 'MET-850', quantity: 25000, packagingUnits: 100, unitPrice: 35 },
        { name: 'Glibenclamida 5mg', code: 'GLB-5', quantity: 18000, packagingUnits: 30, unitPrice: 42 }
      ],
      deliverySchedule: [
        { phase: 'Entrega Completa', quantity: 43000, date: '2024-04-30', status: 'scheduled' }
      ],
      deliveryAddress: 'Almacén Central CENABAST, Maipú, Santiago',
      transportMethod: 'Transporte Estándar',
      communications: [],
      recommendations: [
        {
          title: 'Planificación Temprana',
          description: 'Iniciar producción con anticipación debido al volumen',
          priority: 'medium'
        }
      ]
    },
    {
      id: 4,
      tenderId: 'CENABAST-2024-004',
      title: 'Analgésicos y Antiinflamatorios',
      status: 'draft',
      productsCount: 20,
      totalValue: 1650000,
      totalValueUSD: 1780,
      currency: 'CLP',
      stockCoverage: 12,
      deliveryDate: '2024-03-20',
      createdDate: '2024-02-05',
      isOverdue: false,
      completionPercentage: 10,
      tags: ['Analgésicos', 'Borrador'],
      description: `Borrador de licitación para analgésicos y antiinflamatorios.\nIncluye Paracetamol, Ibuprofeno y Diclofenaco en múltiples presentaciones.\nPendiente de revisión y aprobación.`,
      products: [
        { name: 'Paracetamol 500mg', code: 'PAR-500', quantity: 30000, packagingUnits: 100, unitPrice: 15 },
        { name: 'Ibuprofeno 400mg', code: 'IBU-400', quantity: 20000, packagingUnits: 30, unitPrice: 25 }
      ],
      deliverySchedule: [
        { phase: 'Por Definir', quantity: 50000, date: '2024-03-20', status: 'scheduled' }
      ],
      deliveryAddress: 'Por Definir',
      transportMethod: 'Por Definir',
      communications: [],
      recommendations: [
        {
          title: 'Stock Crítico',
          description: 'Nivel de stock crítico, priorizar esta licitación',
          priority: 'high'
        }
      ]
    },
    {
      id: 5,
      tenderId: 'CENABAST-2024-005',
      title: 'Medicamentos Respiratorios',
      status: 'rejected',
      productsCount: 6,
      totalValue: 980000,
      totalValueUSD: 1060,
      currency: 'CLP',
      stockCoverage: 8,
      deliveryDate: '2024-02-15',
      createdDate: '2024-01-20',
      isOverdue: true,
      completionPercentage: 0,
      tags: ['Respiratorio', 'Rechazado'],
      description: `Licitación rechazada para medicamentos respiratorios.\nMotivo: Especificaciones técnicas no cumplidas.\nRequiere reformulación y nueva presentación.`,
      products: [
        { name: 'Salbutamol 100mcg', code: 'SAL-100', quantity: 5000, packagingUnits: 1, unitPrice: 85 }
      ],
      deliverySchedule: [],
      deliveryAddress: 'N/A',
      transportMethod: 'N/A',
      communications: [
        {
          subject: 'Notificación de Rechazo',
          content: 'La licitación ha sido rechazada por no cumplir especificaciones técnicas',
          type: 'Email',
          date: '2024-01-30',
          sender: 'CENABAST',
          hasAttachment: true
        }
      ],
      recommendations: [
        {
          title: 'Revisar Especificaciones',
          description: 'Revisar y corregir especificaciones técnicas antes de reenviar',
          priority: 'high'
        }
      ]
    }
  ];

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleTenderSelect = (tenderId) => {
    setSelectedTenders(prev => 
      prev?.includes(tenderId) 
        ? prev?.filter(id => id !== tenderId)
        : [...prev, tenderId]
    );
  };

  const handleTenderSelectAll = () => {
    setSelectedTenders(
      selectedTenders?.length === mockTenders?.length ? [] : mockTenders?.map(t => t?.id)
    );
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleTenderView = (tenderId) => {
    const tender = mockTenders?.find(t => t?.id === tenderId);
    setSelectedTender(tender);
    setIsDetailModalOpen(true);
  };

  const handleTenderEdit = (tenderId) => {
    // Navigate to edit page or open edit modal
    console.log('Edit tender:', tenderId);
  };

  const handleNewTender = () => {
    // Navigate to new tender page or open new tender modal
    console.log('Create new tender');
  };

  const handleExport = (format) => {
    console.log('Export to:', format);
  };

  const handleBulkAction = (action) => {
    console.log('Bulk action:', action, 'on tenders:', selectedTenders);
  };

  // Filter and sort tenders
  const filteredAndSortedTenders = mockTenders?.filter(tender => {
      if (filters?.search && !tender?.title?.toLowerCase()?.includes(filters?.search?.toLowerCase()) && 
          !tender?.tenderId?.toLowerCase()?.includes(filters?.search?.toLowerCase())) {
        return false;
      }
      if (filters?.status && tender?.status !== filters?.status) return false;
      
      // Filter by packaging units
      if (filters?.packagingUnits) {
        const hasMatchingPackagingUnits = tender?.products?.some(product => 
          product?.packagingUnits?.toString() === filters?.packagingUnits
        );
        if (!hasMatchingPackagingUnits) return false;
      }
      
      if (filters?.stockCoverage) {
        const coverage = tender?.stockCoverage;
        switch (filters?.stockCoverage) {
          case 'critical':
            if (coverage >= 15) return false;
            break;
          case 'low':
            if (coverage < 15 || coverage > 30) return false;
            break;
          case 'medium':
            if (coverage < 30 || coverage > 60) return false;
            break;
          case 'high':
            if (coverage <= 60) return false;
            break;
        }
      }
      return true;
    })?.sort((a, b) => {
      const aValue = a?.[sortConfig?.key];
      const bValue = b?.[sortConfig?.key];
      
      if (sortConfig?.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <div className="flex">
          {/* Filters Sidebar */}
          <TenderFilters
            onFiltersChange={handleFiltersChange}
            isCollapsed={isFiltersCollapsed}
            onToggleCollapse={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
          />

          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* Breadcrumb */}
            <div className="mb-6">
              <Breadcrumb />
            </div>

            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">
                {currentLanguage === 'es' ? 'Gestión de Licitaciones' : 'Tender Management'}
              </h1>
              <p className="text-muted-foreground mt-2">
                {currentLanguage === 'es' ?'Administra y supervisa todas las licitaciones de CENABAST desde el registro hasta la entrega.' :'Manage and oversee all CENABAST tenders from registration through delivery tracking.'
                }
              </p>
            </div>

            {/* Toolbar */}
            <TenderToolbar
              selectedCount={selectedTenders?.length}
              totalCount={filteredAndSortedTenders?.length}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onNewTender={handleNewTender}
              onExport={handleExport}
              onBulkAction={handleBulkAction}
            />

            {/* Content */}
            {viewMode === 'table' ? (
              <TenderTable
                tenders={filteredAndSortedTenders}
                selectedTenders={selectedTenders}
                onTenderSelect={handleTenderSelect}
                onTenderSelectAll={handleTenderSelectAll}
                onTenderView={handleTenderView}
                onTenderEdit={handleTenderEdit}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            ) : (
              <TenderCardView
                tenders={filteredAndSortedTenders}
                selectedTenders={selectedTenders}
                onTenderSelect={handleTenderSelect}
                onTenderView={handleTenderView}
                onTenderEdit={handleTenderEdit}
              />
            )}
          </div>
        </div>
      </div>
      {/* Detail Modal */}
      <TenderDetailModal
        tender={selectedTender}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleTenderEdit}
      />
    </div>
  );
};

export default TenderManagement;