import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import CommunicationEntry from './CommunicationEntry';

const CommunicationTimeline = ({ communications, filters, onExport }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  const labels = {
    en: { communicationsTimeline:'Communications Timeline', sortBy:'Sort by', date:'Date', type:'Type', subject:'Subject', participants:'Participants', exportReport:'Export Report', noCommunications:'No communications found', noCommunicationsDesc:'Try adjusting your filters or create a new communication.', showingResults:'Showing {count} of {total} communications', today:'Today', yesterday:'Yesterday' },
    es: { communicationsTimeline:'Cronología de Comunicaciones', sortBy:'Ordenar por', date:'Fecha', type:'Tipo', subject:'Asunto', participants:'Participantes', exportReport:'Exportar Reporte', noCommunications:'No se encontraron comunicaciones', noCommunicationsDesc:'Intenta ajustar tus filtros o crear una nueva comunicación.', showingResults:'Mostrando {count} de {total} comunicaciones', today:'Hoy', yesterday:'Ayer' },
  };
  const t = labels?.[currentLanguage];

  const sortOptions = [
    { value:'date', label:t?.date },
    { value:'type', label:t?.type },
    { value:'subject', label:t?.subject },
    { value:'participants', label:t?.participants },
  ];

  const handleExpand = (id) => {
    const next = new Set(expandedEntries);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedEntries(next);
  };

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(field); setSortOrder('desc'); }
  };

  const sorted = [...(communications || [])].sort((a, b) => {
    let aValue, bValue;
    switch (sortBy) {
      case 'date': aValue = new Date(a.date); bValue = new Date(b.date); break;
      case 'type': aValue = a?.type || ''; bValue = b?.type || ''; break;
      case 'subject': aValue = (a?.subject || '').toLowerCase(); bValue = (b?.subject || '').toLowerCase(); break;
      case 'participants': aValue = a?.participants?.length || 0; bValue = b?.participants?.length || 0; break;
      default: aValue = a?.date || ''; bValue = b?.date || '';
    }
    return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
  });

  const groups = sorted.reduce((acc, comm) => {
    const key = new Date(comm.date).toDateString();
    (acc[key] ||= []).push(comm);
    return acc;
  }, {});

  const formatDateGroup = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return t?.today;
    if (date.toDateString() === yesterday.toDateString()) return t?.yesterday;
    return new Intl.DateTimeFormat(currentLanguage === 'es' ? 'es-CL' : 'en-US', {
      weekday:'long', year:'numeric', month:'long', day:'numeric'
    }).format(date);
  };

  if (!communications || communications.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Icon name="MessageSquare" size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">{t?.noCommunications}</h3>
          <p className="text-muted-foreground">{t?.noCommunicationsDesc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">{t?.communicationsTimeline}</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">{t?.sortBy}:</span>
            <div className="flex items-center space-x-1">
              {sortOptions.map((opt) => (
                <Button
                  key={opt.value}
                  variant={sortBy === opt.value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleSort(opt.value)}
                  iconName={sortBy === opt.value ? (sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown') : undefined}
                  iconPosition="right"
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
          <Button variant="outline" iconName="Download" onClick={onExport}>{t?.exportReport}</Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          {t?.showingResults?.replace('{count}', communications.length)?.replace('{total}', communications.length)}
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(groups).map(([dateKey, dayComms]) => (
          <div key={dateKey}>
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-32">
                <h3 className="text-lg font-semibold text-foreground">{formatDateGroup(dateKey)}</h3>
              </div>
              <div className="flex-1 h-px bg-border ml-4" />
            </div>

            <div className="space-y-4 ml-36">
              {dayComms.map((c) => (
                <CommunicationEntry
                  key={c.id}
                  communication={c}
                  currentLanguage={currentLanguage}
                  isExpanded={expandedEntries.has(c.id)}
                  onToggle={() => handleExpand(c.id)}
                  onView={() => {}}
                  onReply={() => {}}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunicationTimeline;
