import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import OrderStatusBadge from './OrderStatusBadge';
import OrderDetailsModal from './OrderDetailsModal';

const OrdersTable = ({ currentLanguage, filters }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const mockOrders = [
    {
      id: 1,
      poNumber: 'PO-2025-001',
      tenderRef: 'TEN-2024-045',
      manufacturingStatus: 'ready',
      qcStatus: 'approved',
      transportType: 'sea',
      eta: '2025-03-15',
      costUsd: 125000,
      costClp: 120000000,
      createdDate: '2025-01-15',
      products: ['Amoxicilina 500mg', 'Ibuprofeno 400mg']
    },
    {
      id: 2,
      poNumber: 'PO-2025-002',
      tenderRef: 'TEN-2024-046',
      manufacturingStatus: 'in-process',
      qcStatus: 'pending',
      transportType: 'air',
      eta: '2025-02-28',
      costUsd: 89000,
      costClp: 85000000,
      createdDate: '2025-01-20',
      products: ['Paracetamol 500mg']
    },
    {
      id: 3,
      poNumber: 'PO-2025-003',
      tenderRef: 'TEN-2024-047',
      manufacturingStatus: 'shipped',
      qcStatus: 'approved',
      transportType: 'sea',
      eta: '2025-02-25',
      costUsd: 156000,
      costClp: 149000000,
      createdDate: '2025-01-10',
      products: ['Metformina 850mg', 'Losartán 50mg']
    },
    {
      id: 4,
      poNumber: 'PO-2025-004',
      tenderRef: 'TEN-2024-048',
      manufacturingStatus: 'in-process',
      qcStatus: 'pending',
      transportType: 'air',
      eta: '2025-03-10',
      costUsd: 67000,
      costClp: 64000000,
      createdDate: '2025-01-25',
      products: ['Omeprazol 20mg']
    },
    {
      id: 5,
      poNumber: 'PO-2025-005',
      tenderRef: 'TEN-2024-049',
      manufacturingStatus: 'ready',
      qcStatus: 'rejected',
      transportType: 'sea',
      eta: '2025-03-20',
      costUsd: 98000,
      costClp: 94000000,
      createdDate: '2025-01-30',
      products: ['Atorvastatina 20mg']
    }
  ];

  const columns = [
    { 
      key: 'poNumber', 
      labelEn: 'PO Number', 
      labelEs: 'Número PO',
      sortable: true 
    },
    { 
      key: 'tenderRef', 
      labelEn: 'Tender Ref', 
      labelEs: 'Ref. Licitación',
      sortable: true 
    },
    { 
      key: 'manufacturingStatus', 
      labelEn: 'Manufacturing', 
      labelEs: 'Fabricación',
      sortable: true 
    },
    { 
      key: 'qcStatus', 
      labelEn: 'QC Status', 
      labelEs: 'Estado QC',
      sortable: true 
    },
    { 
      key: 'transportType', 
      labelEn: 'Transport', 
      labelEs: 'Transporte',
      sortable: true 
    },
    { 
      key: 'eta', 
      labelEn: 'ETA', 
      labelEs: 'ETA',
      sortable: true 
    },
    { 
      key: 'costUsd', 
      labelEn: 'Cost (USD)', 
      labelEs: 'Costo (USD)',
      sortable: true 
    },
    { 
      key: 'actions', 
      labelEn: 'Actions', 
      labelEs: 'Acciones',
      sortable: false 
    }
  ];

  const getColumnLabel = (column) => {
    return currentLanguage === 'es' ? column?.labelEs : column?.labelEn;
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat(currentLanguage === 'es' ? 'es-CL' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat(currentLanguage === 'es' ? 'es-CL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })?.format(new Date(date));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const filteredOrders = mockOrders?.filter(order => {
    if (filters?.search && !order?.poNumber?.toLowerCase()?.includes(filters?.search?.toLowerCase()) &&
        !order?.tenderRef?.toLowerCase()?.includes(filters?.search?.toLowerCase())) {
      return false;
    }
    if (filters?.manufacturingStatus && order?.manufacturingStatus !== filters?.manufacturingStatus) {
      return false;
    }
    if (filters?.qcStatus && order?.qcStatus !== filters?.qcStatus) {
      return false;
    }
    if (filters?.transportType && order?.transportType !== filters?.transportType) {
      return false;
    }
    return true;
  });

  const sortedOrders = [...filteredOrders]?.sort((a, b) => {
    if (!sortConfig?.key) return 0;
    
    let aValue = a?.[sortConfig?.key];
    let bValue = b?.[sortConfig?.key];
    
    if (sortConfig?.key === 'eta' || sortConfig?.key === 'createdDate') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (aValue < bValue) {
      return sortConfig?.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig?.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return (
    <>
      <div className="bg-card rounded-lg border border-border shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                {columns?.map((column) => (
                  <th key={column?.key} className="px-6 py-4 text-left">
                    {column?.sortable ? (
                      <button
                        onClick={() => handleSort(column?.key)}
                        className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
                      >
                        <span>{getColumnLabel(column)}</span>
                        {sortConfig?.key === column?.key && (
                          <Icon 
                            name={sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                            size={16} 
                          />
                        )}
                      </button>
                    ) : (
                      <span className="text-sm font-medium text-foreground">
                        {getColumnLabel(column)}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedOrders?.map((order) => (
                <tr key={order?.id} className="hover:bg-muted/50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{order?.poNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(order?.createdDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{order?.tenderRef}</div>
                    <div className="text-sm text-muted-foreground">
                      {order?.products?.length} {currentLanguage === 'es' ? 'productos' : 'products'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge 
                      status={order?.manufacturingStatus} 
                      type="manufacturing" 
                      currentLanguage={currentLanguage} 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge 
                      status={order?.qcStatus} 
                      type="qc" 
                      currentLanguage={currentLanguage} 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge 
                      status={order?.transportType} 
                      type="transport" 
                      currentLanguage={currentLanguage} 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{formatDate(order?.eta)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{formatCurrency(order?.costUsd, 'USD')}</div>
                    <div className="text-sm text-muted-foreground">{formatCurrency(order?.costClp, 'CLP')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                        iconName="Eye"
                        iconPosition="left"
                      >
                        {currentLanguage === 'es' ? 'Ver' : 'View'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Edit"
                        iconPosition="left"
                      >
                        {currentLanguage === 'es' ? 'Editar' : 'Edit'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedOrders?.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {currentLanguage === 'es' ? 'No se encontraron órdenes' : 'No orders found'}
            </h3>
            <p className="text-muted-foreground">
              {currentLanguage === 'es' ?'Intenta ajustar los filtros para ver más resultados.' :'Try adjusting the filters to see more results.'
              }
            </p>
          </div>
        )}
      </div>
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentLanguage={currentLanguage}
      />
    </>
  );
};

export default OrdersTable;