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
  onTenderDelete, // <- delete opcional
  sortConfig = { key: 'createdDate', direction: 'desc' },
  onSort,
}) => {
  const tr = (en, es) => (currentLanguage === 'es' ? es : en);

  const allSelected = tenders.length > 0 && selectedTenders.length === tenders.length;

  const Th = ({ k, label }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none"
      onClick={() => onSort?.(k)}
    >
      <div className="inline-flex items-center gap-1">
        {label}
        {sortConfig?.key === k && (
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
            <Th k="tenderId" label={tr('Tender', 'Licitación')} />
            <Th k="productsCount" label={tr('Products', 'Productos')} />
            <Th k="totalValue" label={tr('Total Value', 'Valor Total')} />
            <Th k="createdDate" label={tr('First Delivery', 'Primera Entrega')} />
            <Th k="deliveryDate" label={tr('Last Delivery', 'Última Entrega')} />
            <Th k="stockCoverage" label={tr('Coverage', 'Cobertura')} />
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {tr('Actions', 'Acciones')}
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {tenders.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                {tr('No tenders found', 'No hay licitaciones')}
              </td>
            </tr>
          )}

          {tenders.map((row) => {
            const checked = selectedTenders.includes(row.id);
            const coveragePct = Math.max(0, Math.min(100, Number(row.stockCoverage || 0)));

            return (
              <tr key={row.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={checked}
                    onChange={() => onTenderSelect?.(row.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{row.tenderId}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        row.isOverdue
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {row.isOverdue ? tr('Overdue', 'Atrasada') : tr('On Track', 'En Curso')}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground">{row.productsCount || 0}</td>
                <td className="px-4 py-3 text-foreground">{fmtCur(row.totalValue, row.currency)}</td>
                <td className="px-4 py-3 text-muted-foreground">{fmtDate(row.createdDate)}</td>
                <td className="px-4 py-3 text-muted-foreground">{fmtDate(row.deliveryDate)}</td>
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
                    <Button variant="ghost" size="sm" onClick={() => onTenderView?.(row.id)} iconName="Eye">
                      {tr('View', 'Ver')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onTenderEdit?.(row.id)} iconName="Edit">
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

