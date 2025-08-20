import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';

import { fetchGoogleSheet } from '../../lib/googleSheet';
import { SHEET_ID } from '../../lib/sheetsConfig';
import { fmtDate } from '../../utils/format.js';

const TenderForm = () => {
  const navigate = useNavigate();
  const { tenderId } = useParams();
  const isEdit = !!tenderId;

  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(isEdit);
  const [items, setItems] = useState([]);

  const [form, setForm] = useState({
    tenderId: '',
    title: '',
    currency: 'CLP',
    firstDate: '',
    lastDate: '',
    notes: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('language') || 'en';
    setLang(saved);
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    async function load() {
      try {
        setLoading(true);
        const rows = await fetchGoogleSheet({
          sheetId: SHEET_ID,
          sheetName: 'tender_items',
        });

        const mine = (rows || []).filter((r) => r?.tender_number === tenderId);
        const currency = mine[0]?.currency || 'CLP';
        const firstDates = mine.map((it) => it?.first_delivery_date).filter(Boolean).sort();
        const lastDates  = mine.map((it) => it?.last_delivery_date ).filter(Boolean).sort();

        setItems(mine);
        setForm((prev) => ({
          ...prev,
          tenderId: tenderId,
          title: tenderId,
          currency,
          firstDate: firstDates[0] || '',
          lastDate: lastDates[lastDates.length - 1] || '',
        }));
      } catch (e) {
        console.error('TenderForm load error:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isEdit, tenderId]);

  const t = (en, es) => (lang === 'es' ? es : en);
  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const onCancel = () => navigate('/tender-management');
  const onSave = () => {
    console.log('SAVE TENDER (demo):', form);
    navigate('/tender-management');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Breadcrumb />

          <div className="flex items-center justify-between mt-4 mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              {isEdit ? t('Edit Tender', 'Editar Licitación') : t('New Tender', 'Nueva Licitación')}
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onCancel} iconName="X" iconPosition="left">
                {t('Cancel', 'Cancelar')}
              </Button>
              <Button onClick={onSave} iconName="Save" iconPosition="left">
                {t('Save', 'Guardar')}
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('Tender ID', 'ID Licitación')}
              </label>
              <input
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none"
                value={form.tenderId}
                onChange={(e) => handleChange('tenderId', e.target.value)}
                placeholder={t('e.g. 621-299-LR25', 'ej. 621-299-LR25')}
                disabled={isEdit}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('Title', 'Título')}</label>
              <input
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder={t('Short title', 'Título corto')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('Currency', 'Moneda')}</label>
              <select
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none"
                value={form.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
              >
                <option value="CLP">CLP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t('First Delivery', 'Primera Entrega')}</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none"
                  value={form.firstDate || ''}
                  onChange={(e) => handleChange('firstDate', e.target.value)}
                />
                {isEdit && form.firstDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('Loaded from sheet:', 'Cargado de la hoja:')} {fmtDate(form.firstDate, lang)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t('Last Delivery', 'Última Entrega')}</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none"
                  value={form.lastDate || ''}
                  onChange={(e) => handleChange('lastDate', e.target.value)}
                />
                {isEdit && form.lastDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('Loaded from sheet:', 'Cargado de la hoja:')} {fmtDate(form.lastDate, lang)}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('Notes', 'Notas')}</label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none"
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder={t('Internal notes (optional)…', 'Notas internas (opcional)…')}
              />
            </div>
          </div>

          {isEdit && (
            <div className="mt-8 bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {t('Items (read-only from sheet)', 'Ítems (solo lectura de la hoja)')}
              </h2>
              {loading ? (
                <div className="text-muted-foreground">{t('Loading…', 'Cargando…')}</div>
              ) : items.length === 0 ? (
                <div className="text-muted-foreground">{t('No items found.', 'Sin ítems.')}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr className="text-sm text-muted-foreground">
                        <th className="px-4 py-3">{t('Code', 'Código')}</th>
                        <th className="px-4 py-3">{t('Description', 'Descripción')}</th>
                        <th className="px-4 py-3">{t('Qty', 'Cant.')}</th>
                        <th className="px-4 py-3">{t('Unit Price', 'Precio Unit.')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {items.map((it, idx) => (
                        <tr key={idx} className="text-sm text-foreground">
                          <td className="px-4 py-3">{it?.presentation_code}</td>
                          <td className="px-4 py-3">{it?.description || '-'}</td>
                          <td className="px-4 py-3">{it?.awarded_qty || 0}</td>
                          <td className="px-4 py-3">{it?.unit_price || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TenderForm;
