import React from 'react';
import { fmtDate, fmtInt, fmtCurrency } from '../../../utils/format.js';

const TenderTable = ({
  currentLanguage = 'en',
  tenders = [],
  selectedTenders = [],
  onTenderSelect,
  onTenderSelectAll,
  onTenderView,
  onTenderEdit,
  sortConfig,
  onSort,
}) => {
  const lang = currentLanguage;

  const allSelected =
    selectedTenders?.length > 0 && selectedTenders?.length === (tenders?.length || 0);

  const th = (key, label) => (
    <th
      className="px-4 py-3 cursor-pointer select-none"
      onClick={() => onSort && onSort(key)}
      title={lang === 'es' ? 'Ordenar' : 'Sort'}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {sortConfig?.key === key ? (
          <span className="text-muted-foreground">
            {sortConfig?.direction === 'asc' ? '▲' : '▼'}
          </span>
        ) : (
          <span className="text-muted-foreground">↕</span>
        )}
      </div>
    </th>
  );

  if (!tenders?.length) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        {lang === 'es' ? 'No hay licitaciones.' : 'No tenders.'}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-card rounded-lg border border-border">
      <table className="min-w-full text-left">
        <thead className="bg-muted/50 border-b border-border">
          <tr className="text-sm text-muted-foreground">
            <th className="px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onTenderSelectAll}
                aria-label={lang === 'es' ? 'Seleccionar todo' : 'Select all'}
              />
            </th>
            {th('tenderId', lang === 'es' ? 'ID Licitación' : 'Tender ID')}
            {th('title', lang === 'es' ? 'Título' : 'Title')}
            {th('productsCount', lang === 'es' ? 'Productos' : 'Products')}
            {th('status', lang === 'es' ? 'Estado' : 'Status')}
            {th('deliveryDate', lang === 'es' ? 'F. Entrega' : 'Delivery Date')}
            {th('stockCoverage', lang === 'es' ? 'Cobertura' : 'Stock Coverage')}
            {th('totalValue', lang === 'es' ? 'Valor Total' : 'Total Value')}
            <th className="px-4 py-3">{lang === 'es' ? 'Acciones' : 'Actions'}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tenders.map((t) => {
            const checked = selectedTenders?.includes(t.id);
            return (
              <tr key={t.id} className="text-sm text-foreground hover:bg-muted/30">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={!!checked}
                    onChange={() => onTenderSelect && onTenderSelect(t.id)}
                    aria-label={lang === 'es' ? 'Seleccionar' : 'Select'}
                  />
                </td>
                <td className="px-4 py-3 font-medium">{t.tenderId}</td>
                <td className="px-4 py-3">{t.title}</td>
                <td className="px-4 py-3">{fmtInt(t.productsCount, lang)}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs">
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3">{fmtDate(t.deliveryDate, lang)}</td> {/* ✅ fechas */}
                <td className="px-4 py-3">{fmtInt(t.stockCoverage, lang)}%</td>
                <td className="px-4 py-3">
                  {fmtCurrency(t.totalValue, t.currency || 'CLP', lang)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      className="text-primary hover:underline"
                      onClick={() => onTenderView && onTenderView(t.id)}
                    >
                      {lang === 'es' ? 'Ver' : 'View'}
                    </button>
                    <button
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => onTenderEdit && onTenderEdit(t.id)}
                    >
                      {lang === 'es' ? 'Editar' : 'Edit'}
                    </button>
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
