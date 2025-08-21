import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TenderTable = ({
  currentLanguage = 'en',
  tenders = [],
  selectedTenders = [],
  onTenderSelect,
  onTenderSelectAll,
  onTenderView,
  onTenderEdit,
  onTenderDelete, // <- nuevo
  sortConfig = { key: 'createdDate', direction: 'desc' },
  onSort,
}) => {
  const t = (en, es) => (currentLanguage === 'es' ? es : en);

  const allSelected = tenders.length > 0 && selectedTenders.length === tenders.length;

  const th = (key, label) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none"
      onClick={() => onSort?.(key)}
    >
      <div className="inline-flex items-center gap-1">
        {label}
        {sortConfig?.key === key && (
          <Icon name={sortConfig?.direction === 'asc' ? 'ArrowUp' : 'ArrowDown'} size={14} />
        )}
      </div>
    </th>
  );

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
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3">
              <input
                type="checkbox"
                className="accent-primary"
                checked={allSelected}
                onChange={onTenderSelectAll}
              />
            </th>
            {th('tenderId', t('Tender', 'Licitación'))}
            {th('productsCount', t('Products', 'Productos'))}
            {th('totalValue', t('Total Value', 'Valor Total'))}
            {th('createdDate', t('First Delivery', 'Primera Entrega'))}
            {th('deliveryDate', t('Last Delivery', 'Última Entrega'))}
            {th('stockCoverage', t('Coverage', 'Cobertura'))}
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('Actions', 'Acciones')}
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {tenders.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                {t('No tenders found', 'No hay licitaciones')}
              </td>
            </tr>
          )}

          {tenders.map((t) => {
            const checked = selectedTenders.includes(t.id);
            const coveragePct = Math.max(0, Math.min(100, Number(t.stockCoverage || 0)));

            return (
              <tr key={t.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={checked}
                    onChange={() => onTenderSelect?.(t.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{t.tenderId}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      t.isOverdue
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {t.isOverdue ? t('Overdue', 'Atrasada') : t('On Track', 'En Curso')}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground">{t.productsCount || 0}</td>
                <td className="px-4 py-3 text-foreground">{fmtCur(t.totalValue, t.currency)}</td>
                <td className="px-4 py-3 text-muted-foreground">{fmtDate(t.createdDate)}</td>
                <td className="px-4 py-3 text-muted-foreground">{fmtDate(t.deliveryDate)}</td>
                <td className="px-4 py-3">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${coveragePct}%` }}
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onTenderView?.(t.id)} iconName="Eye">
                      {t('View', 'Ver')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onTenderEdit?.(t.id)} iconName="Edit">
                      {t('Edit', 'Editar')}
                    </Button>
                    {onTenderDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => onTenderDelete(t)}
                        iconName="Trash2"
                      >
                        {t('Delete', 'Eliminar')}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TenderTable;
