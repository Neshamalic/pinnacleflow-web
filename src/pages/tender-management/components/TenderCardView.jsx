import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TenderCardView = ({
  currentLanguage = 'en',
  tenders = [],
  selectedTenders = [],
  onTenderSelect,
  onTenderView,
  onTenderEdit,
  onTenderDelete, // opcional
}) => {
  const tr = (en, es) => (currentLanguage === 'es' ? es : en);

  const fmtCur = (v, cur) => {
    const n = Number(v || 0);
    return new Intl.NumberFormat(currentLanguage === 'es' ? 'es-CL' : 'en-US', {
      style: 'currency',
      currency: cur || 'CLP',
      maximumFractionDigits: 0,
    }).format(n);
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    if (isNaN(date)) return String(d);
    return date.toLocaleDateString(currentLanguage === 'es' ? 'es-CL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {tenders.map((row) => {
        const checked = selectedTenders.includes(row.id);
        const coveragePct = Math.max(0, Math.min(100, Number(row.stockCoverage || 0)));

        return (
          <div key={row.id} className="bg-card rounded-lg border border-border p-4 hover:shadow-sm transition">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-primary mt-0.5"
                  checked={checked}
                  onChange={() => onTenderSelect?.(row.id)}
                />
                <h4 className="font-semibold text-foreground">{row.tenderId}</h4>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  row.isOverdue ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {row.isOverdue ? tr('Overdue', 'Atrasada') : tr('On Track', 'En Curso')}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{tr('Products', 'Productos')}</span>
                <span className="text-foreground font-medium">{row.productsCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{tr('Total Value', 'Valor Total')}</span>
                <span className="text-foreground font-medium">{fmtCur(row.totalValue, row.currency)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{tr('First Delivery', 'Prim. Entrega')}</span>
                <span className="text-foreground">{fmtDate(row.createdDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{tr('Last Delivery', 'Últ. Entrega')}</span>
                <span className="text-foreground">{fmtDate(row.deliveryDate)}</span>
              </div>

              <div className="pt-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${coveragePct}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {tr('Coverage', 'Cobertura')}: {coveragePct}%
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onTenderView?.(row.id)} iconName="Eye">
                {tr('View', 'Ver')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => onTenderEdit?.(row.id)} iconName="Edit">
                {tr('Edit', 'Editar')}
              </Button>
              {onTenderDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => onTenderDelete(row)}
                  iconName="Trash2"
                >
                  {tr('Delete', 'Eliminar')}
                </Button>
              )}
            </div>
          </div>
        );
      })}

      {tenders.length === 0 && (
        <div className="col-span-full text-center text-muted-foreground py-8">
          {tr('No tenders found', 'No hay licitaciones')}
        </div>
      )}
    </div>
  );
};

export default TenderCardView;
