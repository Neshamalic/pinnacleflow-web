import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../../components/AppIcon.jsx';
import Button from '../../../components/ui/Button.jsx';

const TenderToolbar = ({
  selectedCount,
  totalCount,
  viewMode,
  onViewModeChange,
  onNewTender,
  onExport,
  onBulkAction,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  const exportRef = useRef(null);
  const bulkRef = useRef(null);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  // Cerrar menús al hacer click fuera
  useEffect(() => {
    const onClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
      if (bulkRef.current && !bulkRef.current.contains(e.target)) {
        setShowBulkMenu(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowExportMenu(false);
        setShowBulkMenu(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const exportOptions = [
    {
      value: 'excel',
      label: currentLanguage === 'es' ? 'Exportar a Excel' : 'Export to Excel',
      icon: 'FileSpreadsheet',
    },
    {
      value: 'csv',
      label: currentLanguage === 'es' ? 'Exportar a CSV' : 'Export to CSV',
      icon: 'FileText',
    },
    {
      value: 'pdf',
      label: currentLanguage === 'es' ? 'Exportar a PDF' : 'Export to PDF',
      icon: 'FileDown',
    },
  ];

  const bulkActions = [
    {
      value: 'update_status',
      label: currentLanguage === 'es' ? 'Actualizar Estado' : 'Update Status',
      icon: 'Edit',
    },
    {
      value: 'assign_manager',
      label: currentLanguage === 'es' ? 'Asignar Gerente' : 'Assign Manager',
      icon: 'User',
    },
    {
      value: 'set_priority',
      label: currentLanguage === 'es' ? 'Establecer Prioridad' : 'Set Priority',
      icon: 'Flag',
    },
    {
      value: 'archive',
      label: currentLanguage === 'es' ? 'Archivar' : 'Archive',
      icon: 'Archive',
    },
  ];

  const handleExport = (format) => {
    onExport && onExport(format);
    setShowExportMenu(false);
  };

  const handleBulk = (action) => {
    onBulkAction && onBulkAction(action);
    setShowBulkMenu(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Izquierda: info de resultados */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {currentLanguage === 'es'
              ? `Mostrando ${totalCount} licitaciones`
              : `Showing ${totalCount} tenders`}
          </div>

          {selectedCount > 0 && (
            <div className="flex items-center space-x-2" ref={bulkRef}>
              <span className="text-sm font-medium text-primary">
                {selectedCount} {currentLanguage === 'es' ? 'seleccionadas' : 'selected'}
              </span>

              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowBulkMenu((v) => !v);
                    setShowExportMenu(false);
                  }}
                  iconName="ChevronDown"
                  iconPosition="right"
                  aria-haspopup="menu"
                  aria-expanded={showBulkMenu}
                >
                  {currentLanguage === 'es' ? 'Acciones' : 'Actions'}
                </Button>

                {showBulkMenu && (
                  <div
                    role="menu"
                    className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-md shadow-lg z-10"
                  >
                    {bulkActions.map((action) => (
                      <button
                        key={action.value}
                        onClick={() => handleBulk(action.value)}
                        className="w-full flex items-center px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        role="menuitem"
                      >
                        <Icon name={action.icon} size={16} className="mr-2" />
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Derecha: acciones */}
        <div className="flex items-center space-x-3">
          {/* Toggle vista */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => onViewModeChange && onViewModeChange('table')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={currentLanguage === 'es' ? 'Vista de tabla' : 'Table view'}
              aria-pressed={viewMode === 'table'}
            >
              <Icon name="Table" size={16} />
            </button>
            <button
              onClick={() => onViewModeChange && onViewModeChange('card')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'card'
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={currentLanguage === 'es' ? 'Vista de tarjetas' : 'Card view'}
              aria-pressed={viewMode === 'card'}
            >
              <Icon name="Grid3X3" size={16} />
            </button>
          </div>

          {/* Exportar */}
          <div className="relative" ref={exportRef}>
            <Button
              variant="outline"
              onClick={() => {
                setShowExportMenu((v) => !v);
                setShowBulkMenu(false);
              }}
              iconName="Download"
              iconPosition="left"
              aria-haspopup="menu"
              aria-expanded={showExportMenu}
            >
              {currentLanguage === 'es' ? 'Exportar' : 'Export'}
            </Button>

            {showExportMenu && (
              <div
                role="menu"
                className="absolute top-full right-0 mt-1 w-56 bg-card border border-border rounded-md shadow-lg z-10"
              >
                {exportOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleExport(option.value)}
                    className="w-full flex items-center px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    role="menuitem"
                  >
                    <Icon name={option.icon} size={16} className="mr-2" />
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nueva licitación */}
          <Button variant="default" onClick={onNewTender} iconName="Plus" iconPosition="left">
            {currentLanguage === 'es' ? 'Nueva Licitación' : 'New Tender'}
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas (mock) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">12</div>
          <div className="text-xs text-muted-foreground">
            {currentLanguage === 'es' ? 'Activas' : 'Active'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">8</div>
          <div className="text-xs text-muted-foreground">
            {currentLanguage === 'es' ? 'Adjudicadas' : 'Awarded'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">5</div>
          <div className="text-xs text-muted-foreground">
            {currentLanguage === 'es' ? 'En Entrega' : 'In Delivery'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">3</div>
          <div className="text-xs text-muted-foreground">
            {currentLanguage === 'es' ? 'Críticas' : 'Critical'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenderToolbar;
