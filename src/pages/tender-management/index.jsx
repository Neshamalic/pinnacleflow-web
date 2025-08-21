import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';

import TenderFilters from './components/TenderFilters';
import TenderToolbar from './components/TenderToolbar';
import TenderTable from './components/TenderTable';
import TenderCardView from './components/TenderCardView';
import TenderDetailModal from './components/TenderDetailModal';

import { fetchGoogleSheet, writeSheet } from '../../lib/googleSheet';
import { SHEET_ID } from '../../lib/sheetsConfig';

const TenderManagement = () => {
  const navigate = useNavigate();

  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [selectedTenders, setSelectedTenders] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'createdDate', direction: 'desc' });

  // mantenemos por compatibilidad con el modal
  const [selectedTender, setSelectedTender] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [tenders, setTenders] = useState([]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  // Carga y agrupa por tender_number
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
            id: idx + 1,
            tenderId: g.tenderId,
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
            // guardamos items para poder borrar en cascada por presentation_code
            _items: g.items,
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

  // Filtros
  const handleFiltersChange = (newFilters) => setFilters(newFilters);

  // Selección
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

  // Orden
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Navegación
  const goToDetail = (rowId) => {
    const t = tenders.find((x) => x.id === rowId);
    if (!t) return;
    navigate(`/tender-management/${encodeURIComponent(t.tenderId)}`);
  };
  const goToEdit = (rowId) => {
    const t = tenders.find((x) => x.id === rowId);
    if (!t) return;
    navigate(`/tender-management/${encodeURIComponent(t.tenderId)}/edit`);
  };
  const goToNew = () => navigate('/tender-management/new');

  const handleTenderView = goToDetail;
  const handleTenderEdit = goToEdit;
  const handleNewTender = goToNew;

  const handleExport = (format) => {
    console.log('Export to:', format);
  };

  // Delete a nivel “tender”: borra TODAS las filas de ese tender_number en tender_items
  const handleTenderDelete = async (tenderRow) => {
    const tn = tenderRow?.tenderId;
    if (!tn) return;

    const confirmText = currentLanguage === 'es'
      ? `Vas a eliminar TODAS las filas de ${tn} en tender_items. ¿Confirmas?`
      : `This will delete ALL items for ${tn} in tender_items. Confirm?`;

    if (!window.confirm(confirmText)) return;

    try {
      const items = tenderRow?._items || [];
      for (const it of items) {
        const tender_number = String(it?.tender_number || '');
        const presentation_code = String(it?.presentation_code || '');
        if (!tender_number || !presentation_code) continue;

        await writeSheet('tender_items', 'delete', {
          where: { tender_number, presentation_code },
        });
      }
      // refresca la lista en memoria
      setTenders((prev) => prev.filter((x) => x.tenderId !== tn));
      alert(currentLanguage === 'es' ? 'Eliminado correctamente.' : 'Deleted successfully.');
    } catch (err) {
      console.error('Delete error:', err);
      alert((currentLanguage === 'es' ? 'Error al eliminar: ' : 'Delete error: ') + (err?.message || err));
    }
  };

  const handleBulkAction = async (action) => {
    if (action !== 'delete') return;
    const rows = tenders.filter((t) => selectedTenders.includes(t.id));
    for (const r of rows) {
      // reutiliza el mismo delete por tender
      // eslint-disable-next-line no-await-in-loop
      await handleTenderDelete(r);
    }
    setSelectedTenders([]);
  };

  // Aplica filtros + orden
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
      return true;
    })
    .sort((a, b) => {
      const aValue = a?.[sortConfig.key];
      const bValue = b?.[sortConfig.key];
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
              onNewTender={handleNewTender}
              onExport={handleExport}
              onBulkAction={handleBulkAction}
              currentLanguage={currentLanguage}
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
                onTenderDelete={handleTenderDelete}  // <- NUEVO
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
                onTenderDelete={handleTenderDelete}  // <- NUEVO
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal legado (sin uso) */}
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
