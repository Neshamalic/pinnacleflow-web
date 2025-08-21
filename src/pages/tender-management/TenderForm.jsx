// src/pages/tenders/TenderForm.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';

import { fetchGoogleSheet, createRow, updateRow } from '../../lib/googleSheet';

const SHEET_NAME = 'tender_items';

const TenderForm = () => {
  const navigate = useNavigate();
  const { tenderId } = useParams(); // en /new no viene; en /:tenderId/edit sí
  const isEdit = Boolean(tenderId);

  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(true);

  // Para editar: listado de filas del tender y dropdown de presentation_code
  const [existingRows, setExistingRows] = useState([]);
  const [selectedPC, setSelectedPC] = useState(''); // presentation_code a editar

  // Form
  const [form, setForm] = useState({
    tender_number: '',
    presentation_code: '',
    supplier_name: '',
    awarded_qty: '',
    currency: 'CLP',
    unit_price: '',
    first_delivery_date: '',
    last_delivery_date: '',
    notes: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('language') || 'en';
    setLang(saved);
  }, []);

  // Carga para EDIT: trae filas del tender y preselecciona si hay solo una
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (isEdit) {
          const all = await fetchGoogleSheet({ sheetName: SHEET_NAME });
          const rows = (all || []).filter(
            (r) => String(r?.tender_number) === String(tenderId)
          );
          setExistingRows(rows);

          if (rows.length === 1) {
            setSelectedPC(rows[0]?.presentation_code || '');
            hydrateForm(rows[0]);
          } else {
            // sólo setea tender_number y espera a que elijas el PC en el select
            setForm((f) => ({ ...f, tender_number: tenderId }));
          }
        } else {
          // NEW
          setExistingRows([]);
          setForm({
            tender_number: '',
            presentation_code: '',
            supplier_name: '',
            awarded_qty: '',
            currency: 'CLP',
            unit_price: '',
            first_delivery_date: '',
            last_delivery_date: '',
            notes: '',
          });
        }
      } catch (e) {
        console.error('TenderForm load error:', e);
        setExistingRows([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isEdit, tenderId]);

  const t = (en, es) => (lang === 'es' ? es : en);

  const pcOptions = useMemo(() => {
    const opts = existingRows.map((r) => ({
      value: r?.presentation_code,
      label: `${r?.presentation_code} — ${r?.notes || ''}`,
    }));
    return [{ value: '', label: t('Select item…', 'Selecciona ítem…') }, ...opts];
  }, [existingRows, lang]);

  function hydrateForm(row) {
    setForm({
      tender_number: row?.tender_number || tenderId || '',
      presentation_code: row?.presentation_code || '',
      supplier_name: row?.supplier_name || '',
      awarded_qty: row?.awarded_qty || '',
      currency: row?.currency || 'CLP',
      unit_price: row?.unit_price || '',
      first_delivery_date: row?.first_delivery_date
        ? toYMD(row?.first_delivery_date)
        : '',
      last_delivery_date: row?.last_delivery_date
        ? toYMD(row?.last_delivery_date)
        : '',
      notes: row?.notes || '',
    });
  }

  function toYMD(d) {
    // convierte date o string ISO a 'YYYY-MM-DD' para <input type="date">
    const date = new Date(d);
    if (isNaN(date)) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  function onChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // Cuando en EDIT eliges un presentation_code del tender
  function onSelectPC(pc) {
    setSelectedPC(pc);
    const row = existingRows.find((r) => String(r?.presentation_code) === String(pc));
    if (row) hydrateForm(row);
    else {
      // Si limpias la selección, deja sólo el tender_number
      setForm((f) => ({
        ...f,
        tender_number: tenderId || '',
        presentation_code: '',
        supplier_name: '',
        awarded_qty: '',
        currency: 'CLP',
        unit_price: '',
        first_delivery_date: '',
        last_delivery_date: '',
        notes: '',
      }));
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      // Validación mínima de llaves
      if (!form.tender_number || !form.presentation_code) {
        alert(
          t(
            'You must fill tender_number and presentation_code (keys).',
            'Debes completar tender_number y presentation_code (llaves).'
          )
        );
        return;
      }

      const rowToSend = {
        tender_number: String(form.tender_number).trim(),
        presentation_code: String(form.presentation_code).trim(),
        supplier_name: form.supplier_name,
        awarded_qty: Number(form.awarded_qty || 0),
        currency: form.currency || 'CLP',
        unit_price: Number(form.unit_price || 0),
        // Enviar en formato ISO a tu Apps Script (puede recibirlo tal cual)
        first_delivery_date: form.first_delivery_date || '',
        last_delivery_date: form.last_delivery_date || '',
        notes: form.notes || '',
      };

      if (isEdit) {
        // PUT (upsert por llaves)
        await updateRow({ sheetName: SHEET_NAME, row: rowToSend });
        alert(t('Updated successfully.', 'Actualizado correctamente.'));
      } else {
        // POST (nueva fila)
        await createRow({ sheetName: SHEET_NAME, row: rowToSend });
        alert(t('Created successfully.', 'Creado correctamente.'));
      }

      // Vuelve al listado
      navigate('/tender-management');
    } catch (err) {
      console.error('Save error:', err);
      alert(`${t('Save error:', 'Error al guardar:')} ${err?.message || err}`);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Breadcrumb />

          <div className="mt-4 mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">
              {isEdit ? t('Edit Tender Item', 'Editar Ítem de Licitación') : t('New Tender Item', 'Nuevo Ítem de Licitación')}
            </h1>
            <Button variant="outline" onClick={() => navigate('/tender-management')}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              {t('Back', 'Volver')}
            </Button>
          </div>

          {loading ? (
            <div className="text-muted-foreground">{t('Loading…', 'Cargando…')}</div>
          ) : (
            <form onSubmit={onSubmit} className="bg-card rounded-lg border border-border p-6 space-y-4">
              {/* Para editar: selector de ítem por presentation_code */}
              {isEdit && (
                <Select
                  label={t('Item to edit (presentation_code)', 'Ítem a editar (presentation_code)')}
                  options={pcOptions}
                  value={selectedPC}
                  onChange={onSelectPC}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="tender_number *"
                  value={form.tender_number}
                  onChange={(e) => onChange('tender_number', e.target.value)}
                  placeholder="621-299-LR25"
                />
                <Input
                  label="presentation_code *"
                  value={form.presentation_code}
                  onChange={(e) => onChange('presentation_code', e.target.value)}
                  placeholder="PC00071"
                />
                <Input
                  label={t('Supplier', 'Proveedor')}
                  value={form.supplier_name}
                  onChange={(e) => onChange('supplier_name', e.target.value)}
                  placeholder="PLS"
                />
                <Input
                  label={t('Awarded Qty', 'Cantidad Adjudicada')}
                  type="number"
                  value={form.awarded_qty}
                  onChange={(e) => onChange('awarded_qty', e.target.value)}
                  placeholder="0"
                />
                <Input
                  label={t('Currency', 'Moneda')}
                  value={form.currency}
                  onChange={(e) => onChange('currency', e.target.value)}
                  placeholder="CLP"
                />
                <Input
                  label={t('Unit Price', 'Precio Unitario')}
                  type="number"
                  step="0.01"
                  value={form.unit_price}
                  onChange={(e) => onChange('unit_price', e.target.value)}
                  placeholder="0"
                />
                <Input
                  label={t('First Delivery Date', 'Primera Fecha Entrega')}
                  type="date"
                  value={form.first_delivery_date}
                  onChange={(e) => onChange('first_delivery_date', e.target.value)}
                />
                <Input
                  label={t('Last Delivery Date', 'Última Fecha Entrega')}
                  type="date"
                  value={form.last_delivery_date}
                  onChange={(e) => onChange('last_delivery_date', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('Notes', 'Notas')}</label>
                <textarea
                  className="w-full border border-border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => onChange('notes', e.target.value)}
                  placeholder={t('Optional notes…', 'Notas opcionales…')}
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => navigate('/tender-management')}>
                  {t('Cancel', 'Cancelar')}
                </Button>
                <Button type="submit">
                  {isEdit ? t('Save Changes', 'Guardar Cambios') : t('Create', 'Crear')}
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default TenderForm;

