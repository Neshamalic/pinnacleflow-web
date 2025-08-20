import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../../../components/AppIcon.jsx';
import Button from '../../../components/ui/Button.jsx';
import CommunicationEntry from './CommunicationEntry.jsx';

const CommunicationTimeline = ({
  communications = [],
  filters = {},
  onExport = () => {},
}) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  const labels = {
    en: {
      communicationsTimeline: 'Communications Timeline',
      sortBy: 'Sort by',
      date: 'Date',
      type: 'Type',
      subject: 'Subject',
      participants: 'Participants',
      ascending: 'Ascending',
      descending: 'Descending',
      exportReport: 'Export Report',
      noCommunications: 'No communications found',
      noCommunicationsDesc: 'Try adjusting your filters or create a new communication.',
      loadMore: 'Load More',
      showingResults: 'Showing {count} of {total} communications',
      today: 'Today',
      yesterday: 'Yesterday',
    },
    es: {
      communicationsTimeline: 'Cronología de Comunicaciones',
      sortBy: 'Ordenar por',
      date: 'Fecha',
      type: 'Tipo',
      subject: 'Asunto',
      participants: 'Participantes',
      ascending: 'Ascendente',
      descending: 'Descendente',
      exportReport: 'Exportar Reporte',
      noCommunications: 'No se encontraron comunicaciones',
      noCommunicationsDesc: 'Intenta ajustar tus filtros o crear una nueva comunicación.',
      loadMore: 'Cargar Más',
      showingResults: 'Mostrando {count} de {total} comunicaciones',
      today: 'Hoy',
      yesterday: 'Ayer',
    },
  };

  const t = labels?.[currentLanguage];

  const sortOptions = [
    { value: 'date', label: t?.date },
    { value: 'type', label: t?.type },
    { value: 'subject', label: t?.subject },
    { value: 'participants', label: t?.participants },
  ];

  // ------- Helpers -------
  const normalize = (s) => (s ? String(s).toLowerCase() : '');
  const withinRange = (d, start, end) =>
    (!start || d >= start) && (!end || d <= end);

  const getPresetRange = (key) => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    switch (key) {
      case 'today':
        return { start, end };
      case 'thisWeek': {
        const day = start.getDay(); // 0=Sun
        const diff = (day + 6) % 7; // to Monday
        const weekStart = new Date(start);
        weekStart.setDate(start.getDate() - diff);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return { start: weekStart, end: weekEnd };
      }
      case 'thisMonth': {
        const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const mEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        return { start: mStart, end: mEnd };
      }
      case 'last30Days': {
        const s = new Date(now);
        s.setDate(now.getDate() - 29);
        s.setHours(0, 0, 0, 0);
        return { start: s, end };
      }
      default:
        return { start: null, end: null };
    }
  };

  const matchesEntity = (rel = '', wanted = '') => {
    if (!wanted) return true;
    const r = normalize(rel);
    switch (wanted) {
      case 'tenders':
        return r.includes('tnd') || r.includes('tender');
      case 'orders':
        return r.includes('po') || r.includes('order');
      case 'imports':
        return r.includes('imp') || r.includes('import');
      default:
        return true;
    }
  };

  // ------- Filtering -------
  const filtered = useMemo(() => {
    const {
      searchQuery = '',
      communicationType = '',
      dateRange = '',
      participants = '',
      linkedEntity = '',
      hasAttachments = false,
      startDate = '',
      endDate = '',
    } = filters || {};

    const q = normalize(searchQuery);

    // Date range
    let start = null;
    let end = null;
    if (dateRange === 'custom') {
      start = startDate ? new Date(startDate) : null;
      end = endDate ? new Date(endDate) : null;
      if (end) end.setHours(23, 59, 59, 999);
    } else {
      const preset = getPresetRange(dateRange);
      start = preset.start;
      end = preset.end;
    }

    return (communications || []).filter((c) => {
      const d = new Date(c?.date);

      // search on subject, content, preview, from
      const haystack = `${c?.subject || ''} ${c?.content || ''} ${c?.preview || ''} ${c?.from || ''}`.toLowerCase();
      if (q && !haystack.includes(q)) return false;

      if (communicationType && normalize(c?.type) !== normalize(communicationType)) return false;

      if (participants) {
        const list = Array.isArray(c?.participants) ? c.participants : [];
        const has = list.map(normalize).includes(normalize(participants));
        if (!has) return false;
      }

      if (linkedEntity && !matchesEntity(c?.relatedTo, linkedEntity)) return false;

      if (hasAttachments) {
        const hasAtt = Boolean(c?.hasAttachment) || (Array.isArray(c?.attachments) && c.attachments.length > 0);
        if (!hasAtt) return false;
      }

      if ((start || end) && isFinite(d)) {
        if (!withinRange(d, start, end)) return false;
      }

      return true;
    });
  }, [communications, filters]);

  // ------- Sorting -------
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let aValue;
      let bValue;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a?.date).getTime() || 0;
          bValue = new Date(b?.date).getTime() || 0;
          break;
        case 'type':
          aValue = normalize(a?.type);
          bValue = normalize(b?.type);
          break;
        case 'subject':
          aValue = normalize(a?.subject);
          bValue = normalize(b?.subject);
          break;
        case 'participants':
          aValue = Array.isArray(a?.participants) ? a.participants.length : 0;
          bValue = Array.isArray(b?.participants) ? b.participants.length : 0;
          break;
        default:
          aValue = new Date(a?.date).getTime() || 0;
          bValue = new Date(b?.date).getTime() || 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortBy, sortOrder]);

  // ------- Grouping (preserves sorted order) -------
  const groupedEntries = useMemo(() => {
    const map = new Map(); // key: dateString => array
    sorted.forEach((comm) => {
      const k = new Date(comm?.date).toDateString();
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(comm);
    });
    return Array.from(map.entries()); // [ [dateKey, comms[]], ... ] in order
  }, [sorted]);

  const formatDateGroup = (dateKey) => {
    const date = new Date(dateKey);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return currentLanguage === 'es' ? t?.today : t?.today;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return currentLanguage === 'es' ? t?.yesterday : t?.yesterday;
    }
    return new Intl.DateTimeFormat(currentLanguage === 'es' ? 'es-CL' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  if (!communications?.length) {
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
          {/* Sort Controls */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">{t?.sortBy}:</span>
            <div className="flex items-center space-x-1">
              {sortOptions.map((option) => (
                <Button
                  key={option?.value}
                  variant={sortBy === option?.value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() =>
                    setSortBy((prev) => (prev === option.value ? prev : option.value))
                  }
                  iconName={
                    sortBy === option?.value ? (sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown') : undefined
                  }
                  iconPosition="right"
                >
                  {option?.label}
                </Button>
              ))}
              {/* Toggle asc/desc */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder((d) => (d === 'asc' ? 'desc' : 'asc'))}
              >
                {sortOrder === 'asc' ? t?.ascending : t?.descending}
              </Button>
            </div>
          </div>

          <Button variant="outline" iconName="Download" onClick={onExport}>
            {t?.exportReport}
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          {t?.showingResults
            ?.replace('{count}', String(sorted.length))
            ?.replace('{total}', String(communications.length))}
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {groupedEntries.map(([dateKey, dayComms]) => (
          <div key={dateKey}>
            {/* Date Header */}
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-32">
                <h3 className="text-lg font-semibold text-foreground">
                  {formatDateGroup(dateKey)}
                </h3>
              </div>
              <div className="flex-1 h-px bg-border ml-4" />
            </div>

            {/* Communications for this date */}
            <div className="space-y-4 ml-36">
              {dayComms.map((communication) => (
                <CommunicationEntry
                  key={communication?.id}
                  communication={communication}
                  currentLanguage={currentLanguage}
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
