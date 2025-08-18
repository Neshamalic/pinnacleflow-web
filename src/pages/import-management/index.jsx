import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ImportStatusCard from './components/ImportStatusCard';
import ImportFilters from './components/ImportFilters';
import ImportTable from './components/ImportTable';
import ImportTimeline from './components/ImportTimeline';
import ImportDetails from './components/ImportDetails';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const ImportManagement = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [selectedImport, setSelectedImport] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filteredImports, setFilteredImports] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  // Mock import data
  const mockImports = [
    {
      id: 'IMP-2025-001',
      shipmentId: 'SHP-IN-2025-001',
      arrivalDate: '2025-01-15',
      departureDate: '2024-12-20',
      transitDate: '2024-12-21',
      transportType: 'sea',
      qcStatus: 'approved',
      customsStatus: 'cleared',
      totalCost: 45000000,
      currentLocation: 'Almacén Central Santiago',
      originPort: 'Mumbai, India',
      destinationPort: 'Valparaíso, Chile',
      customsClearanceDate: '2025-01-16',
      qcCompletionDate: '2025-01-18',
      warehouseEntryDate: '2025-01-20',
      warehouseStatus: 'completed',
      inventoryStatus: 'completed',
      inventoryIntegrationDate: '2025-01-21',
      products: [
        {
          code: 'AMX-500',
          name: 'Amoxicilina 500mg',
          quantity: 50000,
          unitCost: 0.45,
          totalCost: 22500,
          packaging: 'Blister 10 tabs',
          expiryDate: '2026-12-31'
        },
        {
          code: 'IBU-400',
          name: 'Ibuprofeno 400mg',
          quantity: 30000,
          unitCost: 0.32,
          totalCost: 9600,
          packaging: 'Blister 20 tabs',
          expiryDate: '2026-11-30'
        }
      ],
      costBreakdown: {
        productValue: 32100,
        shipping: 8500000,
        customs: 3200000,
        handling: 800000,
        insurance: 400000,
        other: 0
      },
      documents: [
        {
          type: 'Bill of Lading',
          uploadDate: '2025-01-15',
          status: 'approved'
        },
        {
          type: 'QC Certificate',
          uploadDate: '2025-01-18',
          status: 'approved'
        },
        {
          type: 'Customs Declaration',
          uploadDate: '2025-01-16',
          status: 'approved'
        }
      ],
      communications: [
        {
          type: 'Email',
          date: '2025-01-15',
          subject: 'Shipment Arrival Notification',
          content: 'Shipment SHP-IN-2025-001 has arrived at Valparaíso Port and is ready for customs clearance.',
          attachments: ['arrival_notice.pdf']
        },
        {
          type: 'Phone',
          date: '2025-01-18',
          subject: 'QC Approval Confirmation',
          content: 'Quality control inspection completed successfully. All products meet required standards.',
          attachments: []
        }
      ]
    },
    {
      id: 'IMP-2025-002',
      shipmentId: 'SHP-IN-2025-002',
      arrivalDate: '2025-01-20',
      departureDate: '2025-01-05',
      transitDate: '2025-01-06',
      transportType: 'air',
      qcStatus: 'in-progress',
      customsStatus: 'cleared',
      totalCost: 28000000,
      currentLocation: 'Centro QC Santiago',
      originPort: 'Delhi, India',
      destinationPort: 'Santiago Airport',
      customsClearanceDate: '2025-01-21',
      qcCompletionDate: null,
      warehouseEntryDate: null,
      warehouseStatus: 'pending',
      inventoryStatus: 'pending',
      products: [
        {
          code: 'MET-850',
          name: 'Metformina 850mg',
          quantity: 25000,
          unitCost: 0.28,
          totalCost: 7000,
          packaging: 'Blister 30 tabs',
          expiryDate: '2027-01-31'
        },
        {
          code: 'ATO-20',
          name: 'Atorvastatina 20mg',
          quantity: 15000,
          unitCost: 0.65,
          totalCost: 9750,
          packaging: 'Blister 30 tabs',
          expiryDate: '2026-10-31'
        }
      ],
      costBreakdown: {
        productValue: 16750,
        shipping: 18000000,
        customs: 2800000,
        handling: 600000,
        insurance: 350000,
        other: 250000
      },
      documents: [
        {
          type: 'Air Waybill',
          uploadDate: '2025-01-20',
          status: 'approved'
        },
        {
          type: 'QC Certificate',
          uploadDate: null,
          status: 'pending'
        }
      ],
      communications: [
        {
          type: 'WhatsApp',
          date: '2025-01-20',
          subject: 'Air Shipment Arrival',
          content: 'Urgent shipment arrived via air freight. Priority QC inspection scheduled.',
          attachments: ['priority_notice.pdf']
        }
      ]
    },
    {
      id: 'IMP-2025-003',
      shipmentId: 'SHP-IN-2025-003',
      arrivalDate: '2025-02-01',
      departureDate: '2025-01-10',
      transitDate: '2025-01-11',
      transportType: 'sea',
      qcStatus: 'pending',
      customsStatus: 'in-clearance',
      totalCost: 62000000,
      currentLocation: 'Puerto Valparaíso - Aduana',
      originPort: 'Chennai, India',
      destinationPort: 'Valparaíso, Chile',
      customsClearanceDate: null,
      qcCompletionDate: null,
      warehouseEntryDate: null,
      warehouseStatus: 'pending',
      inventoryStatus: 'pending',
      products: [
        {
          code: 'CIP-500',
          name: 'Ciprofloxacino 500mg',
          quantity: 40000,
          unitCost: 0.55,
          totalCost: 22000,
          packaging: 'Blister 10 tabs',
          expiryDate: '2027-03-31'
        },
        {
          code: 'OMP-20',
          name: 'Omeprazol 20mg',
          quantity: 35000,
          unitCost: 0.38,
          totalCost: 13300,
          packaging: 'Blister 14 caps',
          expiryDate: '2026-12-31'
        }
      ],
      costBreakdown: {
        productValue: 35300,
        shipping: 12000000,
        customs: 4500000,
        handling: 1200000,
        insurance: 800000,
        other: 200000
      },
      documents: [
        {
          type: 'Bill of Lading',
          uploadDate: '2025-02-01',
          status: 'pending'
        },
        {
          type: 'Commercial Invoice',
          uploadDate: '2025-02-01',
          status: 'pending'
        }
      ],
      communications: [
        {
          type: 'Email',
          date: '2025-02-01',
          subject: 'Customs Documentation Required',
          content: 'Additional documentation required for customs clearance. Please provide updated certificates.',
          attachments: ['customs_request.pdf']
        }
      ]
    }
  ];

  useEffect(() => {
    setFilteredImports(mockImports);
  }, []);

  const labels = {
    en: {
      title: 'Import Management',
      subtitle: 'Track incoming shipments from arrival through quality control completion',
      activeImports: 'Active Imports',
      pendingQC: 'Pending QC',
      customsClearance: 'Customs Clearance',
      totalValue: 'Total Import Value',
      exportData: 'Export Data',
      refreshData: 'Refresh Data',
      viewTimeline: 'View Timeline',
      closeTimeline: 'Close Timeline'
    },
    es: {
      title: 'Gestión de Importaciones',
      subtitle: 'Seguimiento de envíos desde llegada hasta finalización del control de calidad',
      activeImports: 'Importaciones Activas',
      pendingQC: 'QC Pendiente',
      customsClearance: 'Despacho Aduanero',
      totalValue: 'Valor Total Importaciones',
      exportData: 'Exportar Datos',
      refreshData: 'Actualizar Datos',
      viewTimeline: 'Ver Cronología',
      closeTimeline: 'Cerrar Cronología'
    }
  };

  const handleFiltersChange = (filters) => {
    setActiveFilters(filters);
    let filtered = [...mockImports];

    // Apply search filter
    if (filters?.searchTerm) {
      filtered = filtered?.filter(imp => 
        imp?.shipmentId?.toLowerCase()?.includes(filters?.searchTerm?.toLowerCase()) ||
        imp?.currentLocation?.toLowerCase()?.includes(filters?.searchTerm?.toLowerCase())
      );
    }

    // Apply transport type filter
    if (filters?.transportType) {
      filtered = filtered?.filter(imp => imp?.transportType === filters?.transportType);
    }

    // Apply QC status filter
    if (filters?.qcStatus) {
      filtered = filtered?.filter(imp => imp?.qcStatus === filters?.qcStatus);
    }

    // Apply customs status filter
    if (filters?.customsStatus) {
      filtered = filtered?.filter(imp => imp?.customsStatus === filters?.customsStatus);
    }

    // Apply date range filter
    if (filters?.dateRange?.start || filters?.dateRange?.end) {
      filtered = filtered?.filter(imp => {
        const arrivalDate = new Date(imp.arrivalDate);
        const startDate = filters?.dateRange?.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters?.dateRange?.end ? new Date(filters.dateRange.end) : null;

        if (startDate && arrivalDate < startDate) return false;
        if (endDate && arrivalDate > endDate) return false;
        return true;
      });
    }

    setFilteredImports(filtered);
  };

  const handleResetFilters = () => {
    setActiveFilters({});
    setFilteredImports(mockImports);
  };

  const handleImportSelect = (importData) => {
    setSelectedImport(importData);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedImport(null);
  };

  const getStatusCounts = () => {
    return {
      activeImports: mockImports?.length,
      pendingQC: mockImports?.filter(imp => imp?.qcStatus === 'pending' || imp?.qcStatus === 'in-progress')?.length,
      customsClearance: mockImports?.filter(imp => imp?.customsStatus === 'in-clearance' || imp?.customsStatus === 'pending')?.length,
      totalValue: mockImports?.reduce((sum, imp) => sum + imp?.totalCost, 0)
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(currentLanguage === 'es' ? 'es-CL' : 'en-US', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(amount);
  };

  const statusCounts = getStatusCounts();
  const t = labels?.[currentLanguage];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb />
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{t?.title}</h1>
                <p className="text-muted-foreground">{t?.subtitle}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  iconName="Download"
                  iconPosition="left"
                >
                  {t?.exportData}
                </Button>
                <Button
                  variant="default"
                  iconName="RefreshCw"
                  iconPosition="left"
                >
                  {t?.refreshData}
                </Button>
              </div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ImportStatusCard
              title={t?.activeImports}
              value={statusCounts?.activeImports}
              subtitle="Total shipments in system"
              icon="Package"
              color="blue"
              trend={12}
            />
            <ImportStatusCard
              title={t?.pendingQC}
              value={statusCounts?.pendingQC}
              subtitle="Awaiting quality control"
              icon="Shield"
              color="orange"
              trend={-5}
            />
            <ImportStatusCard
              title={t?.customsClearance}
              value={statusCounts?.customsClearance}
              subtitle="In customs process"
              icon="FileCheck"
              color="purple"
              trend={8}
            />
            <ImportStatusCard
              title={t?.totalValue}
              value={formatCurrency(statusCounts?.totalValue)}
              subtitle="Combined import value"
              icon="DollarSign"
              color="green"
              trend={15}
            />
          </div>

          {/* Filters */}
          <ImportFilters
            onFiltersChange={handleFiltersChange}
            onReset={handleResetFilters}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Import Table */}
            <div className="lg:col-span-2">
              <ImportTable
                imports={filteredImports}
                onImportSelect={handleImportSelect}
                selectedImport={selectedImport}
              />
            </div>

            {/* Timeline Sidebar */}
            <div className="lg:col-span-1">
              {selectedImport ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">
                      {t?.viewTimeline}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedImport(null)}
                      iconName="X"
                    >
                      {t?.closeTimeline}
                    </Button>
                  </div>
                  <ImportTimeline importData={selectedImport} />
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg p-8 text-center shadow-soft">
                  <Icon name="MousePointer" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {currentLanguage === 'es' ? 'Selecciona una Importación' : 'Select an Import'}
                  </h3>
                  <p className="text-muted-foreground">
                    {currentLanguage === 'es' ?'Haz clic en cualquier importación para ver su cronología detallada' :'Click on any import to view its detailed timeline'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {/* Import Details Modal */}
      {showDetails && selectedImport && (
        <ImportDetails
          importData={selectedImport}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default ImportManagement;