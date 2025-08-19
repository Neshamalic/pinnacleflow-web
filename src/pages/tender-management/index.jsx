import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import TenderFilters from './components/TenderFilters';
import TenderToolbar from './components/TenderToolbar';
import TenderTable from './components/TenderTable';
import TenderCardView from './components/TenderCardView';
import TenderDetailModal from './components/TenderDetailModal';

// Google Sheets
import { fetchGoogleSheet } from '../../lib/googleSheet';
import { SHEET_ID } from '../../lib/sheetsConfig';

const TenderManagement = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [selectedTenders, setSelectedTenders] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'createdDate', direction: 'desc' });
  const [selectedTender, setSelectedTender] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Datos reales desde Google Sheets
  const [tenders, setTenders] = useState([]);

  // Idioma guardado
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  // Cargar hoja `tender_items` y mapear al formato del UI
  useEffect(() => {
    async function load() {
      try {
        const rows = await fetchGoogleSheet({
          sheetId: SHEET_ID,
          sheetName: 'tender_items',
        });

        // Agrupar por número de licitación
        const groups = {};
        rows.forEach((r) => {
          const tn = r?.tender_number;
          if (!tn) return;
          if (!groups[tn]) groups[tn] = { tenderId: tn, items: [], currency: r?.currency || 'CLP' };
          groups[tn].items.push(r);
        });

        // Construir objetos esperados por la UI
        const list = Object.values(groups).map((g, idx) => {
          const total = g.items.reduce((sum, it) => {
            const qty = Number(it?.awarded_qty) || 0;
            const price = Number(it?.unit_price) || 0;
            return sum + qty * price;
          }, 0);

          const productsCount = new Set(g.items.map((it) => it?.presentation_code)).size;

          const firstDates = g.items.map((it) => it?.first_delivery_date).filter(Boolean).sort();
          const lastDates  = g.items.map((it) => it?.last_delivery_date ).filter(Boolean).sort();

          const firstDate = firstDates[0] || null;
          const lastDate  = lastDates[lastDates.length - 1] || null;

          const deliveryDate = lastDate || firstDate;
          const createdDate  = firstDate || lastDate;

          const isOverdue = deliveryDate ? new Date(deliveryDate) < new Date() : false;

          return {
            id: idx + 1,
            tenderId: g.tenderId,
            title: g.tenderId, // si no existe título, usamos el ID
            status: 'awarded',
            productsCount,
            totalValue: total,
            totalValueUSD: null,
            currency: g.currency || 'CLP',
            stockCoverage: 30, // placeholder
            deliveryDate,
            createdDate,
            isOverdue,
            completionPercentage: 0,
            tags: [],
            description: '',
            products: [],
            deliverySchedule: [],
            deliveryAddress: '',
            transportMethod: '',
            communications: [],
            recommendations: [],
          };
        });

        setTenders(list);
      } catch (err) {
        console.error('Error loading tenders from Google Sheets:', err);
        setTenders([]);
      }
    }
    load();
  }, []);

  const handleFiltersChange = (newFilters) => setFilters(newFilters);

  const handleTenderSelect = (tenderId) => {
    setSelectedTenders((prev) =>
      prev?.includes(tenderId) ? prev?.filter((id) => id !== tenderId) : [...prev, tenderId]
    );
  };

  const handleTenderSelectAll = () => {
    setSelectedTenders(
      selectedTenders?.length === tenders?.length ? [] : tenders?.map((t) => t?.id)
    );
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleTenderView = (tenderId) => {
    const tender = tenders?.find((t) => t?.id === tenderId);
    setSelectedTender(tender);
    setIsDetailModalOpen(true);
  };

  const handleTenderEdit = (tenderId) => {
    console.log('Edit tender:', tenderId);
  };

  const handleNewTender = () => {
    console.log('Create new tender');
  };

  const handleExport = (format) => {
    console.log('Export to:', format);
  };

  const handleBulkAction = (action) => {
    console.log('Bulk action:', action, 'on tenders:', selectedTenders);
  };

  // Filtrado + orden
  const filteredAndSortedTenders = tenders
    ?.filter((tender) => {
      if (
        filters?.search &&
        !tender?.title?.toLowerCase()?.includes(filters?.search?.toLowerCase()) &&
        !tender?.tenderId?.toLowerCase()?.includes(filters?.search?.toLowerCase())
      ) {
        return false;
      }
      if (filters?.status && tender?.status !== filters?.status) return false;

      // Filtrar por packaging units (si existieran products[])
      if (filters?.packagingUnits) {
        const hasMatchingPackagingUnits = tender?.products?.some(
          (product) => product?.packagingUnits?.toString() === filters?.packagingUnits
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
          default:
            break;
        }
      }
      return true;
    })
    ?.sort((a, b) => {
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
          {/* Sidebar de filtros */}
          <TenderFilters
            onFiltersChange={handleFiltersChange}
            isCollapsed={isFiltersCollapsed}
            onToggleCollapse={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
          />

          {/* Contenido principal */}
          <div className="flex-1 p-6">
            <div className="mb-6">
              <Breadcrumb />
            </div>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">
                {currentLanguage === 'es' ? 'Gestión de Licitaciones' : 'Tender Management'}
              </h1>
              <p className="text-muted-foreground mt-2">
                {currentLanguage === 'es'
                  ? 'Administra y supervisa todas las licitaciones de CENABAST desde el registro hasta la entrega.'
                  : 'Manage and oversee all CENABAST tenders from registration through delivery tracking.'}
              </p>
            </div>

            <TenderToolbar
              selectedCount={selectedTenders?.length}
              totalCount={filteredAndSortedTenders?.length}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onNewTender={handleNewTender}
              onExport={handleExport}
              onBulkAction={handleBulkAction}
            />

            {/* Tabla o tarjetas */}
            {viewMode === 'table' ? (
              <TenderTable
                currentLanguage={currentLanguage}        {/* ✅ pasa el idioma */}
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
                currentLanguage={currentLanguage}        {/* opcional si formateas también en cards */}
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

      {/* Modal de detalle */}
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
