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

  const [selectedTender, setSelectedTender] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [tenders, setTenders] = useState([]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  // Cargar licitaciones desde Google Sheets
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
            id: idx + 1,                 // id interno (numérico)
            tenderId: g.tenderId,        // id visible (ej. "621-299-LR25")
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
            // campos para futuras expansiones
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

  // --- Filtros / Orden ---
  const handleFiltersChange = (newFilters) => setFilters(newFilters);

  const handleTenderSelect = (tenderInternalId) => {
    setSelectedTenders((prev) =>
      prev?.includes(tenderInternalId)
        ? prev?.filter((id) => id !== tenderInternalId)
        : [...prev, tenderInternalId]
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

  // --- Acciones fila / toolbar ---
  const handleTenderView = (tenderInternalId) => {
    const tender = tenders?.find((t) => t?.id === tenderInternalId);
    setSelectedTender(tender || null);
    setIsDetailModalOpen(true);
  };

  const handleTenderEdit = (tenderIdOrInternal) => {
    // Acepta tanto el id interno (numérico) como el tenderId string
    const found =
      tenders.find((t) => t.id === tenderIdOrInternal) ||
      tenders.find((t) => t.tenderId === tenderIdOrInternal);

    const tenderKey = found ? found.tenderId : tenderIdOrInternal;
    navigate(`/tenders/${encodeURIComponent(tenderKey)}/edit`);
  };

  const handleNewTender = () => {
    navigate('/tenders/new');
  };

  const filteredAndSortedTenders = tenders
    ?.filter((tender) => {
      if (
        filters?.search &&
        !tender?.title?.toLowerCase()?.includes(String(filters?.search).toLowerCase()) &&
        !tender?.tenderId?.toLowerCase()?.includes(String(filters?.search).toLowerCase())
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
    ?.sort((a, b) => {
      const aValue = a?.[sortConfig?.key];
      const bValue = b?.[sortConfig?.key];
      if (sortConfig?.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Exportar lo visible (o lo seleccionado si hay selección)
  const handleExport = (format = 'csv') => {
    const list =
      selectedTenders.length > 0
        ? filteredAndSortedTenders.filter((t) => selectedTenders.includes(t.id))
        : filteredAndSortedTenders;

    if (!list || list.length === 0) return;

    const headers = [
      'Tender ID',
      'Title',
      'Status',
      'Products',
      'Delivery Date',
      'Stock Coverage (days)',
      'Total Value',
      'Currency',
    ];

    const rows = list.map((t) => [
      t.tenderId || '',
      t.title || '',
      t.status || '',
      String(t.productsCount ?? ''),
      t.deliveryDate || '',
      String(t.stockCoverage ?? ''),
      String(t.totalValue ?? ''),
      t.currency || '',
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenders_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkAction = (action) => {
    // Placeholder para futuras acciones masivas
    console.log('Bulk action:', action, 'on:', selectedTenders);
  };

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
              selectedCount={selectedTenders?.length}
              totalCount={filteredAndSortedTenders?.length}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onNewTender={handleNewTender}
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
                onTenderView={handleTenderView}
                onTenderEdit={handleTenderEdit}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            ) : (
              <TenderCardView
                currentLanguage={currentLanguage}
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

      <TenderDetailModal
        tender={selectedTender}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={() => handleTenderEdit(selectedTender?.tenderId || selectedTender?.id)}
      />
    </div>
  );
};

export default TenderManagement;
