import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

import { fetchGoogleSheet } from '../../lib/googleSheet';
import { SHEET_ID } from '../../lib/sheetsConfig';
import { fmtInt, fmtDate } from '../../utils/format.js';

const TenderDetail = () => {
  const navigate = useNavigate();
  const { tenderId } = useParams();

  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({
    productsCount: 0,
    totalValue: 0,
    currency: 'CLP',
    firstDate: null,
    lastDate: null,
  });

  useEffect(() => {
    const saved = localStorage.getItem('language') || 'en';
    setLang(saved);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const rows = await fetchGoogleSheet({
          sheetId: SHEET_ID,
          sheetName: 'tender_items',
        });

        const mine = (rows || []).filter((r) => r?.tender_number === tenderId);
        const currency = mine[0]?.currency || 'CLP';

        const totalValue = mine.reduce((s, it) => {
          const qty = Number(it?.awarded_qty) || 0;
          const price = Number(it?.unit_price) || 0;
          return s + qty * price;
        }, 0);
        const productsCount = new Set(mine.map((it) => it?.presentation_code)).size;

        const firstDates = mine.map((it) => it?.first_delivery_date).filter(Boolean).sort();
        const lastDates  = mine.map((it) => it?.last_delivery_date ).filter(Boolean).sort();

        setSummary({
          productsCount,
          totalValue,
          currency,
          firstDate: firstDates[0] || null,
          lastDate: lastDates[lastDates.length - 1] || null,
        });
        setItems(mine);
      } catch (e) {
        console.error('TenderDetail load error:', e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tenderId]);

  const t = (en, es) => (lang === 'es' ? es : en);
  const goBack = () => navigate('/tender-management');
  const goEdit = () => navigate(`/tender-management/${encodeURIComponent(tenderId)}/edit`);

  const fmtMoney = (val, curr) =>
    new Intl.NumberFormat(lang === 'es' ? 'es-CL' : 'en-US', {
      style: 'currency',
      currency: curr || 'CLP',
      maximumFractionDigits: 0,
    }).format(Number(val || 0));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumb />

          <div className="flex items-center justify-between mt-4 mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              {t('Tender Detail', 'Detalle de Licitación')} — {tenderId}
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={goBack} iconName="ArrowLeft" iconPosition="left">
                {t('Back', 'Volver')}
              </Button>
              <Button onClick={goEdit} iconName="Edit3" iconPosition="left">
                {t('Edit', 'Editar')}
              </Button>
            </div>
          </div>

          {/* Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{t('Products', 'Productos')}</span>
                <Icon name="Package" size={18} className="text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">{fmtInt(summary.productsCount, lang)}</div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{t('Total Value', 'Valor Total')}</span>
                <Icon name="Coins" size={18} className="text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">{fmtMoney(summary.totalValue, summary.currency)}</div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{t('Delivery Window', 'Ventana de Entrega')}</span>
                <Icon name="Calendar" size={18} className="text-amber-600" />
              </div>
              <div className="text-sm text-foreground">
                {summary.firstDate ? fmtDate(summary.firstDate, lang) : '—'} → {summary.lastDate ? fmtDate(summary.lastDate, lang) : '—'}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t('Items', 'Ítems')}</h2>

            {loading ? (
              <div className="text-muted-foreground">{t('Loading…', 'Cargando…')}</div>
            ) : items.length === 0 ? (
              <div className="text-muted-foreground">{t('No items found for this tender.', 'No hay ítems para esta licitación.')}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr className="text-sm text-muted-foreground">
                      <th className="px-4 py-3">{t('Code', 'Código')}</th>
                      <th className="px-4 py-3">{t('Description', 'Descripción')}</th>
                      <th className="px-4 py-3">{t('Qty Awarded', 'Cant. Adjudicada')}</th>
                      <th className="px-4 py-3">{t('Unit Price', 'Precio Unit.')}</th>
                      <th className="px-4 py-3">{t('First Delivery', 'Primera Entrega')}</th>
                      <th className="px-4 py-3">{t('Last Delivery', 'Última Entrega')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((it, idx) => (
                      <tr key={idx} className="text-sm text-foreground">
                        <td className="px-4 py-3">{it?.presentation_code}</td>
                        <td className="px-4 py-3">{it?.description || '-'}</td>
                        <td className="px-4 py-3">{fmtInt(it?.awarded_qty || 0, lang)}</td>
                        <td className="px-4 py-3">{new Intl.NumberFormat().format(Number(it?.unit_price || 0))}</td>
                        <td className="px-4 py-3">{it?.first_delivery_date ? fmtDate(it?.first_delivery_date, lang) : '—'}</td>
                        <td className="px-4 py-3">{it?.last_delivery_date ? fmtDate(it?.last_delivery_date, lang) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TenderDetail;
