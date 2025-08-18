import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ImportDetails = ({ importData, isOpen, onClose }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  if (!isOpen || !importData) return null;

  const tabs = [
    {
      id: 'overview',
      label: currentLanguage === 'es' ? 'Resumen' : 'Overview',
      icon: 'FileText'
    },
    {
      id: 'products',
      label: currentLanguage === 'es' ? 'Productos' : 'Products',
      icon: 'Package'
    },
    {
      id: 'documents',
      label: currentLanguage === 'es' ? 'Documentos' : 'Documents',
      icon: 'FileText'
    },
    {
      id: 'timeline',
      label: currentLanguage === 'es' ? 'Cronología' : 'Timeline',
      icon: 'Clock'
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString(currentLanguage === 'es' ? 'es-CL' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat(currentLanguage === 'es' ? 'es-CL' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    })?.format(amount);
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {currentLanguage === 'es' ? 'ID de Importación' : 'Import ID'}
            </label>
            <p className="text-lg font-semibold text-foreground">{importData?.importId}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {currentLanguage === 'es' ? 'Estado' : 'Status'}
            </label>
            <div className="mt-1">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                importData?.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                importData?.status === 'in-transit' ? 'bg-yellow-100 text-yellow-800' :
                importData?.status === 'customs' ? 'bg-orange-100 text-orange-800' :
                importData?.status === 'delivered'? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {importData?.status}
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {currentLanguage === 'es' ? 'Proveedor' : 'Supplier'}
            </label>
            <p className="text-foreground">{importData?.supplier}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {currentLanguage === 'es' ? 'Valor Total' : 'Total Value'}
            </label>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(importData?.value)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {currentLanguage === 'es' ? 'ETA' : 'ETA'}
            </label>
            <p className="text-foreground">{formatDate(importData?.eta)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {currentLanguage === 'es' ? 'Puerto de Destino' : 'Destination Port'}
            </label>
            <p className="text-foreground">{importData?.destinationPort}</p>
          </div>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium text-muted-foreground">
          {currentLanguage === 'es' ? 'Productos' : 'Products'}
        </label>
        <p className="text-foreground mt-1">{importData?.productsCount} {currentLanguage === 'es' ? 'productos' : 'products'}</p>
      </div>
    </div>
  );

  const renderProductsTab = () => {
    const mockProducts = [
      {
        id: 1,
        name: 'Paracetamol 500mg',
        code: 'PAR-500',
        quantity: 50000,
        packagingUnits: 100,
        unitPrice: 0.15
      },
      {
        id: 2,
        name: 'Amoxicilina 500mg',
        code: 'AMX-500',
        quantity: 30000,
        packagingUnits: 30,
        unitPrice: 0.28
      },
      {
        id: 3,
        name: 'Ibuprofeno 400mg',
        code: 'IBU-400',
        quantity: 25000,
        packagingUnits: 30,
        unitPrice: 0.22
      }
    ];

    return (
      <div className="space-y-4">
        {mockProducts?.map((product) => (
          <div key={product?.id} className="border border-border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h5 className="font-medium text-foreground">{product?.name}</h5>
                <p className="text-sm text-muted-foreground">{product?.code}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <span className="text-muted-foreground">
                    {currentLanguage === 'es' ? 'Cantidad:' : 'Quantity:'} {product?.quantity?.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    {currentLanguage === 'es' ? 'Empaque:' : 'Package:'} {product?.packagingUnits} {currentLanguage === 'es' ? 'unidades' : 'units'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">{formatCurrency(product?.unitPrice)}</p>
                <p className="text-sm text-muted-foreground">
                  {currentLanguage === 'es' ? 'por unidad' : 'per unit'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDocumentsTab = () => {
    const mockDocuments = [
      {
        id: 1,
        name: 'Invoice',
        type: 'PDF',
        size: '2.1 MB',
        uploadDate: '2024-02-01',
        status: 'approved'
      },
      {
        id: 2,
        name: 'Packing List',
        type: 'PDF',
        size: '1.8 MB',
        uploadDate: '2024-02-01',
        status: 'approved'
      },
      {
        id: 3,
        name: 'Certificate of Analysis',
        type: 'PDF',
        size: '3.2 MB',
        uploadDate: '2024-02-02',
        status: 'pending'
      }
    ];

    return (
      <div className="space-y-3">
        {mockDocuments?.map((doc) => (
          <div key={doc?.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="FileText" size={20} className="text-primary" />
              <div>
                <p className="font-medium text-foreground">{doc?.name}</p>
                <p className="text-sm text-muted-foreground">{doc?.type} • {doc?.size}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded ${
                doc?.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {doc?.status}
              </span>
              <Button variant="ghost" size="sm" iconName="Download">
                {currentLanguage === 'es' ? 'Descargar' : 'Download'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTimelineTab = () => {
    const mockTimeline = [
      {
        id: 1,
        date: '2024-01-15',
        event: currentLanguage === 'es' ? 'Orden creada' : 'Order created',
        status: 'completed'
      },
      {
        id: 2,
        date: '2024-01-20',
        event: currentLanguage === 'es' ? 'Producción iniciada' : 'Production started',
        status: 'completed'
      },
      {
        id: 3,
        date: '2024-02-01',
        event: currentLanguage === 'es' ? 'Enviado desde India' : 'Shipped from India',
        status: 'completed'
      },
      {
        id: 4,
        date: '2024-02-15',
        event: currentLanguage === 'es' ? 'En tránsito marítimo' : 'Sea transit',
        status: 'in_progress'
      },
      {
        id: 5,
        date: '2024-03-01',
        event: currentLanguage === 'es' ? 'Llegada estimada' : 'Estimated arrival',
        status: 'pending'
      }
    ];

    return (
      <div className="space-y-4">
        {mockTimeline?.map((item, index) => (
          <div key={item?.id} className="flex items-start space-x-4">
            <div className={`w-3 h-3 rounded-full mt-2 ${
              item?.status === 'completed' ? 'bg-green-500' :
              item?.status === 'in_progress' ? 'bg-amber-500' : 'bg-gray-300'
            }`} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">{item?.event}</h4>
                <span className="text-sm text-muted-foreground">{formatDate(item?.date)}</span>
              </div>
              {index < mockTimeline?.length - 1 && (
                <div className="w-px h-8 bg-border ml-1.5 mt-2" />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'products':
        return renderProductsTab();
      case 'documents':
        return renderDocumentsTab();
      case 'timeline':
        return renderTimelineTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-background/80 backdrop-blur-sm" onClick={onClose} />
        
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-card shadow-xl rounded-lg border border-border">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">{importData?.shipmentId}</h2>
              <p className="text-muted-foreground">{importData?.importId}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab?.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  <span>{tab?.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportDetails;