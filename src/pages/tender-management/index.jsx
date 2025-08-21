// src/pages/tender-management/index.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';

import TenderFilters from './components/TenderFilters';
import TenderToolbar from './components/TenderToolbar';
import TenderTable from './components/TenderTable';
import TenderCardView from './components/TenderCardView';
import TenderDetailModal from './components/TenderDetailModal';

import { fetchGoogleSheet } from '../../lib/googleSheet';
import { SHEET_ID } from '../../lib/sheetsConfig';

const TenderManagement = () => {
  const navigate = useNavigate();

  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [selectedTenders, setSelectedTenders] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'createdDate', direction: 'desc' });

  // Solo por compatibilidad con el modal (la navegación ya va por rutas)
  const [selectedTender, setSelectedTender] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [tenders, setTenders] = useState([]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  // Carga desde Google Sheets y agrupa por tender_number
  useEffect(() => {
    async function load() {
      try {
        const rows = await fetchGoogleSheet({
          sheetId: SHEET_ID,
          sheetName: 'tender_items',
        });

        const groups = {};
        (rows || []).forEach((r) => {
          const tn = r?.tender_number;
          if (!tn) return;
          if (!groups[tn]) groups[tn] = { tenderId: tn, items: [], currency: r?.currency || 'CLP' };
          groups[tn].items.push(r);
        });

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
            id: idx + 1,               // id interno para la tabla
            tenderId: g.tenderId,      // ej: "621-299-LR25" -> usado en la URL
            title: g.tenderId,
            status: 'awarded',
            productsCount,
            totalValue: total,
            totalValueUSD: null,
            currency: g.currency || 'CLP',
            stockCoverage: 30,
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

  // -------- Filtros --------
  const handleFiltersChange = (newFilters) => setFilters(newFilters);

  // -------- Selección --------
  const handleTenderSelect = (rowId) => {
    setSelectedTenders((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };

  const handleTenderSelectAll = () => {
    setSelectedTenders(
      selectedTenders.length === (tenders?.length || 0) ? [] : (tenders || []).map((t) => t.id)
    );
  };

  // -------- Orden --------
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Utilidad para aceptar id numérico, tenderId string u objeto
  const resolveTender = (arg) => {
    if (typeof arg === 'number') return (tenders || []).find((x) => x.id === arg) || null;
    if (typeof arg === 'string') return (tenders || []).find((x) => x.tenderId === arg) || { tenderId: arg };
    if (arg && typeof arg === 'object') return arg;
    return null;
  };

  // -------- Navegación --------
  const goToDetail = (rowOrTender) => {
    const t = resolveTender(rowOrTender);
    if (!t || !t.tenderId) return;
    navigate(`/tender-management/${encodeURIComponent(t.tenderId)}`);
  };

  const goToEdit = (rowOrTender) => {
    const t = resolveTender(rowOrTender);
    if (!t || !t.tenderId) return;
    navigate(`/tender-management/${encodeURIComponent(t.tenderId)}/edit`);
  };

  const goToNew = () => {
    navigate('/tender-management/new');
  };

  // Aliases esperados por Toolbar/Table/CardView
  const handleTenderView = goToDetail;
  const handleTenderEdit = goToEdit;
  const handleNewTender = goToNew;

  const handleExport = (format) => {
    console.log('Export to:', format);
  };

  const handleBulkAction = (action) => {
    console.log('Bulk action:', action, 'on tenders:', selectedTenders);
  };

  // -------- Filtro + Orden --------
  const filteredAndSortedTenders = (tenders || [])
    .filter((tender) => {
      if (
        filters?.search &&
        !tender?.title?.toLowerCase()?.includes(String(filters.search).toLowerCase()) &&
        !tender?.tenderId?.toLowerCase()?.includes(String(filters.search).toLowerCase())
      ) {
        return false;
      }
      if (filters?.status && tender?.status !== filters?.status) return false;

      if (filters?.packagingUnits) {
        const hasMatchingPackagingUnits = tender?.products?.some(
          (product) => String(product?.packagingUnits) === String(filters?.packagingUnits)
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
    .sort((a, b) => {
      const aValue = a?.[sortConfig.key];
      const bValue = b?.[sortConfig.key];

      // ordenar números/fechas/strings de forma robusta
      if (aValue == null && bValue != null) return 1;
      if (aValue != null && bValue == null) return -1;
      if (aValue == null && bValue == null) return 0;

      let comp = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comp = aValue - bValue;
      } else if (
        typeof aValue === 'string' &&
        typeof bValue === 'string' &&
        /^\d{4}-\d{2}-\d{2}/.test(aValue) &&
        /^\d{4}-\d{2}-\d{2}/.test(bValue)
      ) {
        comp = new Date(aValue).getTime() - new Date(bValue).getTime();
      } else {
        comp = String(aValue).localeCompare(String(bValue));
      }

      return sortConfig.direction === 'asc' ? comp : -comp;
    });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <div className="flex">
          <TenderFilters
            onFiltersChange={handleFiltersChange}
            isCollapsed={isFiltersCollapsed}
            onToggleCollapse={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
          />

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
              selectedCount={selectedTenders.length}
              totalCount={filteredAndSortedTenders.length}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onNewTender={handleNewTender}  // -> /tender-management/new
              onExport={handleExport}
              onBulkAction={handleBulkAction}
            />

            {viewMode === 'table' ? (
              <TenderTable
                currentLanguage={currentLanguage}
                tenders={filteredAndSortedTenders}
                selectedTenders={selectedTenders}
                onTenderSelect={handleTenderSelect}
                onTenderSelectAll={handleTenderSelectAll}
                onTenderView={handleTenderView}   // -> /tender-management/:tenderId
                onTenderEdit={handleTenderEdit}   // -> /tender-management/:tenderId/edit
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            ) : (
              <TenderCardView
                currentLanguage={currentLanguage}
                tenders={filteredAndSortedTenders}
                selectedTenders={selectedTenders}
                onTenderSelect={handleTenderSelect}
                onTenderView={handleTenderView}   // -> /tender-management/:tenderId
                onTenderEdit={handleTenderEdit}   // -> /tender-management/:tenderId/edit
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal sin uso en la navegación nueva; se mantiene por compatibilidad */}
      <TenderDetailModal
        tender={selectedTender}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={(id) => handleTenderEdit(id)}
      />
    </div>
  );
};

export default TenderManagement;
