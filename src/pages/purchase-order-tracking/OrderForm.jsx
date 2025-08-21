// src/pages/purchase-order-tracking/OrderForm.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';

import { fetchGoogleSheet, createRow, updateRow, writeSheet } from '../../lib/googleSheet';

const SHEET_ORDERS = 'purchase_orders';
const SHEET_ITEMS  = 'purchase_order_items';

const OrderForm = () => {
  const navigate = useNavigate();
  const { poNumber } = useParams(); // en /orders/new no viene; en /orders/:poNumber/edit sí
  const isEdit = Boolean(poNumber);

  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(true);

  // Para editar: listado de ítems de la PO y dropdown de presentation_code
  const [existingItems, setExistingItems] = useState([]);
  const [selectedPC, setSelectedPC] = useState('');

  // Form (campos de purchase_order_items)
  const [form, setForm] = useState({
    po_number: '',
    presentation_code: '',
    qty_ordered: '',
    unit_price: '',
    notes: '',
    // básicos de purchase_orders (para asegurar fila madre)
    supplier_name: '',
    tender_number: '',
    order_date: '',
    incoterm: '',
    currency: 'CLP',
    status: 'open',
  });

  useEffect(() => {
    const saved = localStorage.getItem('language') || 'en';
    setLang(saved);
  }, []);

  // Carga para EDIT
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (isEdit) {
          const allItems = await fetchGoogleSheet({ sheetName: SHEET_ITEMS });
          const rows = (allItems || []).filter(
            (r) => String(r?.po_number) === String(poNumber)
          );
          setExistingItems(rows);

          // Carga también la fila madre (purchase_orders) para sugerir datos básicos
          const allOrders = await fetchGoogleSheet({ sheetName: SHEET_ORDERS });
          const head = (allOrders || []).find((r) => String(r?.po_number) === String(poNumber));

          if (rows.length === 1) {
            hydrateForm(rows[0], head);
            setSelectedPC(rows[0]?.presentation_code || '');
          } else {
            setForm((f) => ({
              ...f,
              po_number: poNumber || '',
              supplier_name: head?.supplier_name || '',
              tender_number: head?.tender_number || '',
              order_date: head?.order_date || '',
              incoterm: head?.incoterm || '',
              currency: head?.currency || 'CLP',
              status: head?.status || 'open',
            }));
          }
        } else {
          // NEW
          setExistingItems([]);
          setForm({
            po_number: '',
            presentation_code: '',
            qty_ordered: '',
            unit_price: '',
            notes: '',
            supplier_name: '',
            tender_number: '',
            order_date: '',
            incoterm: '',
            currency: 'CLP',
            status: 'open',
          });
        }
      } catch (e) {
        console.error('OrderForm load error:', e);
        setExistingItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isEdit, poNumber]);

  const t = (en, es) => (lang === 'es' ? es : en);

  const pcOptions = useMemo(() => {
    const opts = existingItems.map((r) => ({
      value: r?.presentation_code,
      label: `${r?.presentation_code} — ${r?.notes || ''}`,
    }));
    return [{ value: '', label: t('Select item…', 'Selecciona ítem…') }, ...opts];
  }, [existingItems, lang]);

  function hydrateForm(itemRow, orderHead) {
    setForm({
      po_number: itemRow?.po_number || poNumber || '',
      presentation_code: itemRow?.presentation_code || '',
      qty_ordered: itemRow?.qty_ordered || '',
      unit_price: itemRow?.unit_price || '',
      notes: itemRow?.notes || '',
      supplier_name: orderHead?.supplier_name || '',
      tender_number: orderHead?.tender_number || '',
      order_date: orderHead?.order_date || '',
      incoterm: orderHead?.incoterm || '',
      currency: orderHead?.currency || 'CLP',
      status: orderHead?.status || 'open',
    });
  }

  function onChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function onSelectPC(pc) {
    setSelectedPC(pc);
    const row = existingItems.find((r) => String(r?.presentation_code) === String(pc));
    if (row) {
      // Cargar head también
      hydrateForm(row, {
        supplier_name: form.supplier_name,
        tender_number: form.tender_number,
        order_date: form.order_date,
        incoterm: form.incoterm,
        currency: form.currency,
        status: form.status,
      });
    } else {
      setForm((f) => ({
        ...f,
        presentation_code: '',
        qty_ordered: '',
        unit_price: '',
        notes: '',
      }));
    }
  }

  async function ensurePOHeader() {
    // Garantiza que exista la fila madre en purchase_orders (upsert por po_number)
    const head = {
      po_number: String(form.po_number || '').trim(),
      supplier_name: form.supplier_name || '',
      tender_number: form.tender_number || '',
      order_date: form.order_date || '',
      incoterm: form.incoterm || '',
      currency: form.currency || 'CLP',
      status: form.status || 'open',
    };
    if (!head.po_number) return;
    await updateRow({ sheetName: SHEET_ORDERS, row: head }); // upsert
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      if (!form.po_number || !form.presentation_code) {
        alert(
          t(
            'You must fill po_number and presentation_code (keys).',
            'Debes completar po_number y presentation_code (llaves).'
          )
        );
        return;
      }

      // Asegura fila madre
      await ensurePOHeader();

      const item = {
        po_number: String(form.po_number).trim(),
        presentation_code: String(form.presentation_code).trim(),
        qty_ordered: Number(form.qty_ordered || 0),
        unit_price: Number(form.unit_price || 0),
        notes: form.notes || '',
      };

      if (isEdit) {
        await updateRow({ sheetName: SHEET_ITEMS, row: item });
        alert(t('Updated successfully.', 'Actualizado correctamente.'));
      } else {
        await createRow({ sheetName: SHEET_ITEMS, row: item });
        alert(t('Created successfully.', 'Creado correctamente.'));
      }

      navigate('/orders');
    } catch (err) {
      console.error('Save error:', err);
      alert(`${t('Save error:', 'Error al guardar:')} ${err?.message || err}`);
    }
  }

  async function onDelete() {
    if (!isEdit) return;
    const yes = window.confirm(
      t('Delete this item? This cannot be undone.', '¿Eliminar este ítem? No se puede deshacer.')
    );
    if (!yes) return;

    try {
      await writeSheet(SHEET_ITEMS, 'delete', {
        po_number: String(form.po_number),
        presentation_code: String(form.presentation_code),
      });
      alert(t('Item deleted.', 'Ítem eliminado.'));
      navigate('/orders');
    } catch (err) {
      console.error('Delete error:', err);
      alert(`${t('Delete error:', 'Error al eliminar:')} ${err?.message || err}`);
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
              {isEdit ? t('Edit Purchase Order Item', 'Editar Ítem de OC') : t('New Purchase Order Item', 'Nuevo Ítem de OC')}
            </h1>
            <Button variant="outline" onClick={() => navigate('/orders')}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              {t('Back', 'Volver')}
            </Button>
          </div>

          {loading ? (
            <div className="text-muted-foreground">{t('Loading…', 'Cargando…')}</div>
          ) : (
            <form onSubmit={onSubmit} className="bg-card rounded-lg border border-border p-6 space-y-4">
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
                  label="po_number *"
                  value={form.po_number}
                  onChange={(e) => onChange('po_number', e.target.value)}
                  placeholder="PO-2024-001"
                />
                <Input
                  label="presentation_code *"
                  value={form.presentation_code}
                  onChange={(e) => onChange('presentation_code', e.target.value)}
                  placeholder="PC00071"
                />

                <Input
                  label={t('Qty Ordered', 'Cantidad Ordenada')}
                  type="number"
                  value={form.qty_ordered}
                  onChange={(e) => onChange('qty_ordered', e.target.value)}
                  placeholder="0"
                />
                <Input
                  label={t('Unit Price', 'Precio Unitario')}
                  type="number"
                  step="0.01"
                  value={form.unit_price}
                  onChange={(e) => onChange('unit_price', e.target.value)}
                  placeholder="0"
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

              {/* Datos madre básicos (opcional, para asegurar header) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
                <Input
                  label={t('Supplier', 'Proveedor')}
                  value={form.supplier_name}
                  onChange={(e) => onChange('supplier_name', e.target.value)}
                />
                <Input
                  label={t('Tender', 'Licitación')}
                  value={form.tender_number}
                  onChange={(e) => onChange('tender_number', e.target.value)}
                />
                <Input
                  label={t('Order Date', 'Fecha Orden')}
                  type="date"
                  value={form.order_date}
                  onChange={(e) => onChange('order_date', e.target.value)}
                />
                <Input
                  label="Incoterm"
                  value={form.incoterm}
                  onChange={(e) => onChange('incoterm', e.target.value)}
                />
                <Input
                  label={t('Currency', 'Moneda')}
                  value={form.currency}
                  onChange={(e) => onChange('currency', e.target.value)}
                />
                <Input
                  label={t('Status', 'Estado')}
                  value={form.status}
                  onChange={(e) => onChange('status', e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                {isEdit && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    iconName="Trash2"
                    onClick={onDelete}
                  >
                    {t('Delete', 'Eliminar')}
                  </Button>
                )}
                <Button variant="outline" type="button" onClick={() => navigate('/orders')}>
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

export default OrderForm;
