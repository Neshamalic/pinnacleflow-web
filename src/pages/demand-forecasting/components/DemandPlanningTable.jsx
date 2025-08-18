import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DemandPlanningTable = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  const mockPlanningData = [
    {
      id: 1,
      product: 'Paracetamol 500mg',
      currentStock: 15000,
      packagingUnits: 100,
      monthlyDemand: 12000,
      forecastedDemand: 14500,
      suggestedOrder: 25000,
      leadTime: 45,
      status: 'urgent'
    },
    {
      id: 2,
      product: 'Amoxicilina 500mg',
      currentStock: 8000,
      packagingUnits: 30,
      monthlyDemand: 9500,
      forecastedDemand: 11200,
      suggestedOrder: 20000,
      leadTime: 52,
      status: 'normal'
    },
    {
      id: 3,
      product: 'Ibuprofeno 400mg',
      currentStock: 22000,
      packagingUnits: 30,
      monthlyDemand: 8000,
      forecastedDemand: 8800,
      suggestedOrder: 15000,
      leadTime: 40,
      status: 'optimal'
    },
    {
      id: 4,
      product: 'Losartán 50mg',
      currentStock: 5000,
      packagingUnits: 100,
      monthlyDemand: 6500,
      forecastedDemand: 7200,
      suggestedOrder: 18000,
      leadTime: 48,
      status: 'critical'
    },
    {
      id: 5,
      product: 'Metformina 850mg',
      currentStock: 18500,
      packagingUnits: 100,
      monthlyDemand: 10500,
      forecastedDemand: 12000,
      suggestedOrder: 22000,
      leadTime: 35,
      status: 'normal'
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      critical: {
        color: 'bg-red-100 text-red-800',
        label: currentLanguage === 'es' ? 'Crítico' : 'Critical',
        icon: 'AlertTriangle'
      },
      urgent: {
        color: 'bg-orange-100 text-orange-800',
        label: currentLanguage === 'es' ? 'Urgente' : 'Urgent',
        icon: 'Clock'
      },
      normal: {
        color: 'bg-blue-100 text-blue-800',
        label: currentLanguage === 'es' ? 'Normal' : 'Normal',
        icon: 'Info'
      },
      optimal: {
        color: 'bg-green-100 text-green-800',
        label: currentLanguage === 'es' ? 'Óptimo' : 'Optimal',
        icon: 'CheckCircle'
      }
    };

    const config = statusConfig?.[status] || statusConfig?.normal;
    return (
      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config?.color}`}>
        <Icon name={config?.icon} size={12} className="mr-1" />
        {config?.label}
      </div>
    );
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat(currentLanguage === 'es' ? 'es-CL' : 'en-US')?.format(num);
  };

  const formatPackagingInfo = (packagingUnits) => {
    return `${packagingUnits} ${currentLanguage === 'es' ? 'unidades' : 'units'}`;
  };

  const calculateDaysOfSupply = (stock, demand) => {
    if (demand === 0) return Infinity;
    return Math.floor((stock / demand) * 30);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...mockPlanningData]?.sort((a, b) => {
    if (!sortConfig?.key) return 0;

    const aValue = a?.[sortConfig?.key];
    const bValue = b?.[sortConfig?.key];

    if (aValue < bValue) {
      return sortConfig?.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig?.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const getSortIcon = (column) => {
    if (sortConfig?.key !== column) {
      return <Icon name="ArrowUpDown" size={14} className="opacity-50" />;
    }
    return sortConfig?.direction === 'asc' 
      ? <Icon name="ArrowUp" size={14} />
      : <Icon name="ArrowDown" size={14} />;
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-soft overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">
          {currentLanguage === 'es' ? 'Planificación de Demanda' : 'Demand Planning'}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <button
                  onClick={() => handleSort('product')}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors"
                >
                  <span>{currentLanguage === 'es' ? 'Producto' : 'Product'}</span>
                  {getSortIcon('product')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <button
                  onClick={() => handleSort('currentStock')}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors"
                >
                  <span>{currentLanguage === 'es' ? 'Stock' : 'Stock'}</span>
                  {getSortIcon('currentStock')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span>{currentLanguage === 'es' ? 'Empaque' : 'Package'}</span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <button
                  onClick={() => handleSort('forecastedDemand')}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors"
                >
                  <span>{currentLanguage === 'es' ? 'Demanda' : 'Demand'}</span>
                  {getSortIcon('forecastedDemand')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span>{currentLanguage === 'es' ? 'Días Suministro' : 'Days Supply'}</span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <button
                  onClick={() => handleSort('suggestedOrder')}
                  className="flex items-center space-x-1 hover:text-foreground transition-colors"
                >
                  <span>{currentLanguage === 'es' ? 'Orden Sugerida' : 'Suggested Order'}</span>
                  {getSortIcon('suggestedOrder')}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span>{currentLanguage === 'es' ? 'Estado' : 'Status'}</span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span>{currentLanguage === 'es' ? 'Acciones' : 'Actions'}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedData?.map((item) => {
              const daysOfSupply = calculateDaysOfSupply(item?.currentStock, item?.forecastedDemand);
              return (
                <tr key={item?.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{item?.product}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{formatNumber(item?.currentStock)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-muted-foreground">
                      {formatPackagingInfo(item?.packagingUnits)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{formatNumber(item?.forecastedDemand)}</div>
                    <div className="text-xs text-muted-foreground">
                      {currentLanguage === 'es' ? 'mensual' : 'monthly'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`font-medium ${
                      daysOfSupply <= 15 ? 'text-red-600' :
                      daysOfSupply <= 30 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {daysOfSupply === Infinity ? '∞' : `${daysOfSupply}d`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{formatNumber(item?.suggestedOrder)}</div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(item?.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" iconName="ShoppingCart">
                        {currentLanguage === 'es' ? 'Ordenar' : 'Order'}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DemandPlanningTable;