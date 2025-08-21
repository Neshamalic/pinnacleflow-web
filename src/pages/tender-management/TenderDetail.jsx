// src/pages/tenders/TenderDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

import { fetchGoogleSheet } from '../../lib/googleSheet';

const SHEET_NAME = 'tender_items';

const TenderDetail = () => {
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState('en');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = (en, es) => (lang === 'es' ? es : en);

  useEffect(() => {
    const saved = localStorage.getItem('language') || 'en';
    setLang(saved);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const all = await fetchGoogleSheet({ sheetName: SHEET_NAME });
        setRows((all || []).filter((r) => String(r?.tender_number) === String(tenderId)));
      } catch (e) {
        console.error('Detail load error:', e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tenderId]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Breadcrumb />
          <div className="mt-4 mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">
              {t('Tender', 'Licitación')} {tenderId}
            </h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(`/tender-management/${encodeURIComponent(tenderId)}/edit`)}>
                <Icon name="Pencil" size={16} className="mr-2" />
                {t('Edit', 'Editar')}
              </Button>
              <Button variant="outline" onClick={() => navigate('/tender-management')}>
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                {t('Back', 'Volver')}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-muted-foreground">{t('Loading…', 'Cargando…')}</div>
          ) : rows.length === 0 ? (
            <div className="text-muted-foreground">{t('No items found.', 'No hay ítems.')}</div>
          ) : (
            <div className="overflow-x-auto bg-card border border-border rounded-lg">
              <table className="min-w-full text-left">
                <thead className="bg-muted/50 border-b border-border">
                  <tr className="text-sm text-muted-foreground">
                    <th className="px-4 py-3">presentation_code</th>
                    <th className="px-4 py-3">supplier_name</th>
                    <th className="px-4 py-3">awarded_qty</th>
                    <th className="px-4 py-3">currency</th>
                    <th className="px-4 py-3">unit_price</th>
                    <th className="px-4 py-3">first_delivery_date</th>
                    <th className="px-4 py-3">last_delivery_date</th>
                    <th className="px-4 py-3">notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3">{r?.presentation_code}</td>
                      <td className="px-4 py-3">{r?.supplier_name}</td>
                      <td className="px-4 py-3">{r?.awarded_qty}</td>
                      <td className="px-4 py-3">{r?.currency}</td>
                      <td className="px-4 py-3">{r?.unit_price}</td>
                      <td className="px-4 py-3">{String(r?.first_delivery_date || '').slice(0,10)}</td>
                      <td className="px-4 py-3">{String(r?.last_delivery_date || '').slice(0,10)}</td>
                      <td className="px-4 py-3">{r?.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TenderDetail;

