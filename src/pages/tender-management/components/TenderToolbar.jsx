import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const TenderToolbar = ({
  selectedCount = 0,
  totalCount = 0,
  viewMode = 'table',
  onViewModeChange,
  onNewTender,
  onExport,
  onBulkAction,
  currentLanguage = 'en',
}) => {
  const t = (en, es) => (currentLanguage === 'es' ? es : en);

  return (
    <div className="mb-4">
      <div className="bg-card rounded-lg border border-border p-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Left: count + view toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground bg-muted/60 px-3 py-1 rounded-full">
              {t(`${totalCount} tenders`, `${totalCount} licitaciones`)}
            </span>

            <div className="inline-flex rounded-md border border-border overflow-hidden">
              <button
                className={`px-3 py-1.5 text-sm flex items-center gap-1 ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-muted'}`}
                onClick={() => onViewModeChange?.('table')}
              >
                <Icon name="Table" size={14} />
                {t('Table', 'Tabla')}
              </button>
              <button
                className={`px-3 py-1.5 text-sm flex items-center gap-1 ${viewMode === 'cards' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-muted'}`}
                onClick={() => onViewModeChange?.('cards')}
              >
                <Icon name="LayoutGrid" size={14} />
                {t('Cards', 'Tarjetas')}
              </button>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                iconName="Download"
                onClick={() => onExport?.('csv')}
              >
                {t('Export', 'Exportar')}
              </Button>
            </div>

            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                iconName="Settings"
                disabled={selectedCount === 0}
                onClick={() => onBulkAction?.('delete')}
              >
                {t('Actions', 'Acciones')}
                {selectedCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {selectedCount}
                  </span>
                )}
              </Button>
            </div>

            <Button
              variant="default"
              size="sm"
              iconName="Plus"
              onClick={onNewTender}
            >
              {t('New Tender', 'Nueva Licitación')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenderToolbar;
