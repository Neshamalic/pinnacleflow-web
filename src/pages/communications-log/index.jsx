import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';

import CommunicationFilters from './components/CommunicationFilters';
import CommunicationTimeline from './components/CommunicationTimeline';
import CommunicationModal from './components/CommunicationModal';

const CommunicationsLog = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [filteredCommunications, setFilteredCommunications] = useState([]);

  // Mock communications data
  const mockCommunications = [
    {
      id: 1,
      type: 'email',
      subject: 'Tender 2024-001 - Antibiotics Supply Update',
      preview: 'Following up on the antibiotics tender submission. We have received confirmation from CENABAST regarding the technical evaluation phase...',
      content: `Following up on the antibiotics tender submission. We have received confirmation from CENABAST regarding the technical evaluation phase.

The technical committee has completed their review and we are pleased to inform you that our proposal has passed the initial screening. The next phase will involve price evaluation scheduled for next week.

Key points discussed:
- Product specifications compliance: ✓ Approved
- Manufacturing certifications: ✓ Approved  
- Delivery timeline: Under review
- Quality assurance protocols: ✓ Approved

Please prepare the final pricing documentation as discussed in our previous meeting. The deadline for submission is December 15th, 2024.

Best regards,
Carlos Rodriguez`,
      date: '2024-12-08T10:30:00Z',
      participants: [
        {
          name: 'Carlos Rodriguez',
          email: 'carlos.rodriguez@pinnacle.cl',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        {
          name: 'Maria Gonzalez',
          email: 'maria.gonzalez@pinnacle.cl',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
        },
        {
          name: 'Rajesh Kumar',
          email: 'rajesh.kumar@pinnaclelife.in',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        }
      ],
      linkedEntities: [
        { type: 'tender', id: '2024-001' }
      ],
      attachments: [
        {
          name: 'Technical_Evaluation_Report.pdf',
          size: '2.4 MB',
          url: '#'
        },
        {
          name: 'Pricing_Template.xlsx',
          size: '156 KB',
          url: '#'
        }
      ]
    },
    {
      id: 2,
      type: 'whatsapp',
      subject: 'Urgent: Manufacturing Status Update - Metformin 850mg',
      preview: 'Hi team, quick update on the Metformin production. The batch is ready for QC testing and should be completed by tomorrow...',
      content: `Hi team, quick update on the Metformin production. 

The batch is ready for QC testing and should be completed by tomorrow. Manufacturing team confirms:

✅ Production completed: 50,000 units
✅ Packaging: In progress (80% complete)
⏳ QC Testing: Starting tomorrow morning
📦 Expected ready for shipment: December 12th

Any concerns or questions? Let me know ASAP.

Thanks!`,
      date: '2024-12-08T08:15:00Z',
      participants: [
        {
          name: 'Priya Sharma',
          email: 'priya.sharma@pinnaclelife.in',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        },
        {
          name: 'Juan Silva',
          email: 'juan.silva@pinnacle.cl',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
        }
      ],
      linkedEntities: [
        { type: 'order', id: 'PO-2024-046' },
        { type: 'import', id: 'IMP-2024-013' }
      ],
      attachments: []
    },
    {
      id: 3,
      type: 'meeting',
      subject: 'Weekly Supply Chain Review - Q4 2024',
      preview: 'Weekly review meeting covering current tender status, manufacturing updates, and upcoming shipments. Key discussion points included...',
      content: `Weekly Supply Chain Review Meeting - December 7, 2024

Attendees: Carlos Rodriguez, Maria Gonzalez, Ana Martinez, Rajesh Kumar, Amit Patel

AGENDA & DISCUSSION POINTS:

1. TENDER STATUS REVIEW
   - Tender 2024-001 (Antibiotics): Technical evaluation passed, awaiting price review
   - Tender 2024-002 (Cardiovascular): Submission deadline extended to Dec 20th
   - New tender opportunities: 3 identified for Q1 2025

2. MANUFACTURING UPDATES
   - Amoxicillin 500mg: Production completed, QC approved
   - Metformin 850mg: 80% packaging complete, QC scheduled
   - Atorvastatin 20mg: Production delayed by 3 days due to raw material shortage

3. SHIPMENT PLANNING
   - December shipment: Sea freight confirmed for non-urgent items
   - January emergency stock: Air freight recommended for fast-moving items
   - Cost analysis: Sea vs Air freight savings of 40% for bulk orders

4. ACTION ITEMS
   - Carlos: Follow up on Tender 2024-001 pricing submission
   - Maria: Coordinate with India team on raw material procurement
   - Ana: Prepare Q1 2025 demand forecast
   - Rajesh: Expedite Atorvastatin production schedule
   - Amit: Finalize December shipment documentation

NEXT MEETING: December 14, 2024 at 10:00 AM Chile Time`,
      date: '2024-12-07T14:00:00Z',
      participants: [
        {
          name: 'Carlos Rodriguez',
          email: 'carlos.rodriguez@pinnacle.cl',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        {
          name: 'Maria Gonzalez',
          email: 'maria.gonzalez@pinnacle.cl',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
        },
        {
          name: 'Ana Martinez',
          email: 'ana.martinez@pinnacle.cl',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
        },
        {
          name: 'Rajesh Kumar',
          email: 'rajesh.kumar@pinnaclelife.in',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        },
        {
          name: 'Amit Patel',
          email: 'amit.patel@pinnaclelife.in',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
        }
      ],
      linkedEntities: [
        { type: 'tender', id: '2024-001' },
        { type: 'tender', id: '2024-002' },
        { type: 'order', id: 'PO-2024-045' },
        { type: 'order', id: 'PO-2024-046' }
      ],
      attachments: [
        {
          name: 'Weekly_Review_Slides.pptx',
          size: '4.2 MB',
          url: '#'
        },
        {
          name: 'Action_Items_Tracker.xlsx',
          size: '89 KB',
          url: '#'
        }
      ]
    },
    {
      id: 4,
      type: 'phone',
      subject: 'Urgent Call - Shipment Delay Notification',
      preview: 'Emergency call regarding potential shipment delay for December batch. Discussed alternative solutions and contingency plans...',
      content: `PHONE CALL SUMMARY
Date: December 6, 2024
Time: 16:45 Chile Time
Duration: 25 minutes

PARTICIPANTS:
- Carlos Rodriguez (Pinnacle Chile)
- Amit Patel (Pinnacle Life Science India)

TOPIC: Urgent Shipment Delay Notification

DISCUSSION SUMMARY:
Amit called to inform about potential 5-day delay in December shipment due to port congestion in Mumbai. The delay affects:
- Import IMP-2024-012: Antibiotics shipment (50% of December stock)
- Import IMP-2024-013: Diabetes medications (30% of December stock)

IMMEDIATE CONCERNS:
1. Stock coverage for Amoxicillin will drop to 8 days by December 20th
2. Metformin stock critically low - only 12 days coverage remaining
3. CENABAST delivery commitments at risk for 3 major contracts

SOLUTIONS DISCUSSED:
1. Partial air freight for critical items (Amoxicillin, Metformin)
2. Expedite QC process to reduce processing time by 2 days
3. Coordinate with local distributors for emergency stock sharing
4. Communicate proactively with CENABAST about potential delays

AGREED ACTIONS:
- Amit: Confirm air freight costs and capacity by December 7th
- Carlos: Prepare communication for CENABAST stakeholders
- Both: Daily check-ins until shipment resolution

FOLLOW-UP:
Next call scheduled for December 7th at 17:00 Chile Time`,
      date: '2024-12-06T19:45:00Z',
      participants: [
        {
          name: 'Carlos Rodriguez',
          email: 'carlos.rodriguez@pinnacle.cl',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        {
          name: 'Amit Patel',
          email: 'amit.patel@pinnaclelife.in',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
        }
      ],
      linkedEntities: [
        { type: 'import', id: 'IMP-2024-012' },
        { type: 'import', id: 'IMP-2024-013' }
      ],
      attachments: []
    },
    {
      id: 5,
      type: 'email',
      subject: 'QC Approval - Amoxicillin 500mg Batch #AMX-2024-089',
      preview: 'Quality Control department has completed testing for Amoxicillin 500mg batch. All parameters meet specifications...',
      content: `QUALITY CONTROL APPROVAL NOTIFICATION

Batch Information:
- Product: Amoxicillin 500mg Capsules
- Batch Number: AMX-2024-089
- Manufacturing Date: November 28, 2024
- Quantity: 75,000 units
- Expiry Date: November 2027

QC TEST RESULTS:
✅ Assay: 98.7% (Specification: 95.0-105.0%)
✅ Dissolution: Compliant (>80% in 30 minutes)
✅ Moisture Content: 2.1% (Specification: ≤5.0%)
✅ Microbial Limits: Compliant
✅ Heavy Metals: Within limits
✅ Packaging Integrity: Approved

REGULATORY COMPLIANCE:
✅ Chilean ANAMED requirements: Met
✅ WHO-GMP standards: Compliant
✅ Stability data: Available and satisfactory

RELEASE STATUS: APPROVED FOR SHIPMENT

The batch is cleared for immediate shipment to Chile. All documentation including Certificate of Analysis, Batch Manufacturing Record, and Stability Data has been prepared and will accompany the shipment.

Estimated shipping date: December 10, 2024
Expected arrival in Chile: December 28, 2024 (Sea freight)

For any questions regarding this approval, please contact the QC department.

Best regards,
Dr. Priya Sharma
Head of Quality Control
Pinnacle Life Science India`,
      date: '2024-12-05T11:20:00Z',
      participants: [
        {
          name: 'Priya Sharma',
          email: 'priya.sharma@pinnaclelife.in',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        },
        {
          name: 'Carlos Rodriguez',
          email: 'carlos.rodriguez@pinnacle.cl',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        {
          name: 'Maria Gonzalez',
          email: 'maria.gonzalez@pinnacle.cl',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
        }
      ],
      linkedEntities: [
        { type: 'order', id: 'PO-2024-045' },
        { type: 'import', id: 'IMP-2024-012' }
      ],
      attachments: [
        {
          name: 'Certificate_of_Analysis_AMX-2024-089.pdf',
          size: '1.8 MB',
          url: '#'
        },
        {
          name: 'Batch_Manufacturing_Record.pdf',
          size: '3.2 MB',
          url: '#'
        },
        {
          name: 'Stability_Data_Summary.xlsx',
          size: '245 KB',
          url: '#'
        }
      ]
    }
  ];

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    // Apply filters to communications
    let filtered = mockCommunications;

    if (filters?.searchQuery) {
      const query = filters?.searchQuery?.toLowerCase();
      filtered = filtered?.filter(comm => 
        comm?.subject?.toLowerCase()?.includes(query) ||
        comm?.content?.toLowerCase()?.includes(query) ||
        comm?.participants?.some(p => p?.name?.toLowerCase()?.includes(query))
      );
    }

    if (filters?.communicationType) {
      filtered = filtered?.filter(comm => comm?.type === filters?.communicationType);
    }

    if (filters?.participants) {
      filtered = filtered?.filter(comm => 
        comm?.participants?.some(p => p?.email === filters?.participants)
      );
    }

    if (filters?.linkedEntity) {
      filtered = filtered?.filter(comm => 
        comm?.linkedEntities && comm?.linkedEntities?.some(entity => 
          entity?.type === filters?.linkedEntity
        )
      );
    }

    if (filters?.hasAttachments) {
      filtered = filtered?.filter(comm => 
        comm?.attachments && comm?.attachments?.length > 0
      );
    }

    if (filters?.dateRange) {
      const now = new Date();
      let startDate;

      switch (filters?.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'thisWeek':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
          break;
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'last30Days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'custom':
          if (filters?.startDate) {
            startDate = new Date(filters.startDate);
          }
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered?.filter(comm => {
          const commDate = new Date(comm.date);
          if (filters?.dateRange === 'custom' && filters?.endDate) {
            const endDate = new Date(filters.endDate);
            return commDate >= startDate && commDate <= endDate;
          }
          return commDate >= startDate;
        });
      }
    }

    setFilteredCommunications(filtered);
  }, [filters]);

  const labels = {
    en: {
      communicationsLog: 'Communications Log',
      newCommunication: 'New Communication'
    },
    es: {
      communicationsLog: 'Registro de Comunicaciones',
      newCommunication: 'Nueva Comunicación'
    }
  };

  const t = labels?.[currentLanguage];

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSaveCommunication = (communicationData) => {
    // In a real app, this would save to the backend
    console.log('Saving communication:', communicationData);
  };

  const handleExport = () => {
    // In a real app, this would generate and download a report
    console.log('Exporting communications report...');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="p-6 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <Breadcrumb />
              <h1 className="text-3xl font-bold text-foreground mt-2">{t?.communicationsLog}</h1>
            </div>
            <Button 
              iconName="Plus" 
              onClick={() => setIsModalOpen(true)}
            >
              {t?.newCommunication}
            </Button>
          </div>
        </div>

        <div className="flex">
          <CommunicationFilters
            onFiltersChange={handleFiltersChange}
            totalCount={filteredCommunications?.length}
          />
          
          <CommunicationTimeline
            communications={filteredCommunications}
            filters={filters}
            onExport={handleExport}
          />
        </div>
      </main>
      <CommunicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCommunication}
      />
    </div>
  );
};

export default CommunicationsLog;