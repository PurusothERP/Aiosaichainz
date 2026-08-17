import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lead, LeadStage } from '../../types';
import { ClientHistoryModal } from './ClientHistoryModal';
import { exportToCSV, exportToPDFPrint } from '../../utils/exportUtils';
import {
  Plus,
  Target,
  User,
  Building,
  Building2,
  Mail,
  Phone,
  DollarSign,
  FileText,
  Trash2,
  CheckCircle2,
  Clock,
  GripVertical,
  Layers,
  ArrowRight,
  Search,
  Briefcase,
  Users,
  ExternalLink,
  Download,
  Printer
} from 'lucide-react';

interface Props {
  onConvertToQuotation: (lead: Lead) => void;
}

export const SalesPipeline: React.FC<Props> = ({ onConvertToQuotation }) => {
  const { leads, documents, addLead, updateLeadStage, deleteLead, formatCurrency, getInvoiceBalance } = useApp();

  const [activeTab, setActiveTab] = useState<'KANBAN' | 'TABLE' | 'CLIENTS'>('KANBAN');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Selected Client for History Modal
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<string | null>(null);

  // Search Filter for Client Directory & Pipeline
  const [clientSearch, setClientSearch] = useState('');

  // Drag and Drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // Form State for Add Lead
  const [selectedExistingClient, setSelectedExistingClient] = useState<string>('__NEW__');
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [office, setOffice] = useState<'India' | 'UAE' | 'Rwanda'>('India');
  const [value, setValue] = useState(250000);
  const [projectDescription, setProjectDescription] = useState('');
  const [leadDate, setLeadDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Unique Clients Derived from Leads and Documents
  const uniqueClientMap = new Map<string, {
    companyName: string;
    clientName: string;
    email: string;
    phone: string;
    office: 'India' | 'UAE' | 'Rwanda';
    projectsCount: number;
    totalLTV: number;
  }>();

  leads.forEach(l => {
    const key = l.companyName.trim().toLowerCase();
    if (!uniqueClientMap.has(key)) {
      uniqueClientMap.set(key, {
        companyName: l.companyName,
        clientName: l.clientName,
        email: l.email,
        phone: l.phone,
        office: l.office,
        projectsCount: 1,
        totalLTV: 0
      });
    } else {
      const existing = uniqueClientMap.get(key)!;
      existing.projectsCount += 1;
    }
  });

  documents.forEach(d => {
    const key = d.clientCompany.trim().toLowerCase();
    if (uniqueClientMap.has(key)) {
      const existing = uniqueClientMap.get(key)!;
      if (d.docType === 'INVOICE' && d.status === 'PAID') {
        existing.totalLTV += d.total;
      }
    } else {
      uniqueClientMap.set(key, {
        companyName: d.clientCompany,
        clientName: d.clientName,
        email: d.clientEmail,
        phone: d.clientPhone,
        office: d.officeLocation,
        projectsCount: 1,
        totalLTV: (d.docType === 'INVOICE' && d.status === 'PAID') ? d.total : 0
      });
    }
  });

  const uniqueClientsList = Array.from(uniqueClientMap.values());

  const handleSelectExistingClient = (companyKey: string) => {
    setSelectedExistingClient(companyKey);
    if (companyKey === '__NEW__') {
      setCompanyName('');
      setClientName('');
      setEmail('');
      setPhone('');
      setOffice('India');
    } else {
      const client = uniqueClientMap.get(companyKey);
      if (client) {
        setCompanyName(client.companyName);
        setClientName(client.clientName);
        setEmail(client.email);
        setPhone(client.phone);
        setOffice(client.office);
      }
    }
  };

  const handleOpenAddModalForClient = (compName?: string) => {
    if (compName) {
      const key = compName.trim().toLowerCase();
      handleSelectExistingClient(key);
    } else {
      handleSelectExistingClient('__NEW__');
    }
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !companyName) return;
    addLead({
      clientName,
      companyName,
      email,
      phone,
      office,
      stage: 'NEW',
      value: Number(value),
      currency: 'INR',
      projectDescription,
      createdAt: leadDate || new Date().toISOString().split('T')[0]
    });
    setClientName('');
    setCompanyName('');
    setEmail('');
    setPhone('');
    setProjectDescription('');
    setShowAddModal(false);
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStage: LeadStage) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (leadId) {
      updateLeadStage(leadId, targetStage);
      setDraggedLeadId(null);
    }
  };

  const stages: { key: LeadStage; label: string; bg: string; border: string; text: string }[] = [
    { key: 'NEW', label: 'Leads', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    { key: 'CONTACTED', label: 'Contacted', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
    { key: 'PROPOSAL_SENT', label: 'Quotation', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
    { key: 'IN_PROGRESS', label: 'In Progress', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
    { key: 'COMPLETED', label: 'Win', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    { key: 'LOST', label: 'Lost', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' }
  ];

  const filteredClients = uniqueClientsList.filter(c => 
    c.companyName.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.clientName.toLowerCase().includes(clientSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" /> Sales Pipeline & Client CRM
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Recent deals & balance due pinned at top, vertical column scrolling, repeat client project creation & Client Directory.
          </p>
        </div>

        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto">
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex gap-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('KANBAN')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'KANBAN' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setActiveTab('TABLE')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'TABLE' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Table View
            </button>
            <button
              onClick={() => setActiveTab('CLIENTS')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'CLIENTS' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Client Directory ({uniqueClientsList.length})
            </button>
          </div>

          <button
            onClick={() => {
              const headers = ['ID', 'Client Name', 'Company Name', 'Stage', 'Value (INR)', 'Created Date', 'Email', 'Phone', 'Branch', 'Description'];
              const rows = leads.map(l => [l.id, l.clientName, l.companyName, l.stage, l.value, l.createdAt, l.email, l.phone, l.office, l.projectDescription]);
              exportToCSV('Sales_Pipeline_Report', headers, rows);
            }}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-extrabold flex items-center gap-1 border border-emerald-200 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" /> Export Excel
          </button>

          <button
            onClick={() => exportToPDFPrint('Sales Pipeline & CRM Report', 'pipeline-table-print')}
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-extrabold flex items-center gap-1 border border-blue-200 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" /> Print PDF
          </button>

          <button
            onClick={() => handleOpenAddModalForClient()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-blue-600/20 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Summary KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 shrink-0">
        {/* Card 1: Total Leads */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between border-l-4 border-l-blue-600">
          <div className="flex justify-between items-center text-blue-700 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">TOTAL LEADS</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">{leads.length}</span>
            <span className="text-xs font-mono font-bold text-blue-700">{formatCurrency(leads.reduce((s, l) => s + (l.value || 0), 0))}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium mt-2">Active deals in pipeline</span>
        </div>

        {/* Card 2: Quotation Sent */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between border-l-4 border-l-amber-500">
          <div className="flex justify-between items-center text-amber-700 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">QUOTATIONS</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-amber-900">{leads.filter(l => l.stage === 'PROPOSAL_SENT').length}</span>
            <span className="text-xs font-mono font-bold text-amber-700">{formatCurrency(leads.filter(l => l.stage === 'PROPOSAL_SENT').reduce((s, l) => s + (l.value || 0), 0))}</span>
          </div>
          <span className="text-[10px] text-amber-600 font-bold mt-2">Pending client decision</span>
        </div>

        {/* Card 3: In Progress (Execution) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between border-l-4 border-l-indigo-500">
          <div className="flex justify-between items-center text-indigo-700 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">IN PROGRESS</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-indigo-900">{leads.filter(l => l.stage === 'IN_PROGRESS').length}</span>
            <span className="text-xs font-mono font-bold text-indigo-700">{formatCurrency(leads.filter(l => l.stage === 'IN_PROGRESS').reduce((s, l) => s + (l.value || 0), 0))}</span>
          </div>
          <span className="text-[10px] text-indigo-600 font-bold mt-2">Engineering in execution</span>
        </div>

        {/* Card 4: Won Deals (Win) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-center text-emerald-700 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">WON DEALS (WIN)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-emerald-900">{leads.filter(l => l.stage === 'COMPLETED').length}</span>
            <span className="text-xs font-mono font-bold text-emerald-700">{formatCurrency(leads.filter(l => l.stage === 'COMPLETED').reduce((s, l) => s + (l.value || 0), 0))}</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-2">Successfully closed revenue</span>
        </div>

        {/* Card 5: Pipeline Conversion Win Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between border-l-4 border-l-purple-500">
          <div className="flex justify-between items-center text-purple-700 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">WIN RATE %</span>
            <Target className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-purple-900">
              {((leads.filter(l => l.stage === 'COMPLETED').length / Math.max(1, leads.filter(l => l.stage === 'COMPLETED' || l.stage === 'LOST').length)) * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-purple-700 font-bold">Closed Deals</span>
          </div>
          <span className="text-[10px] text-purple-600 font-bold mt-2">Deal conversion ratio</span>
        </div>
      </div>

      {/* 1. KANBAN BOARD VIEW (RECENT DEALS & BALANCE DUE PINNED AT TOP, VERTICAL COLUMNS ONLY) */}
      {activeTab === 'KANBAN' && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 overflow-x-auto min-h-0 pb-2">
          {stages.map(stage => {
            // Sort: 1) Pending balance due > 0 pinned to top, 2) Newest createdAt / ID first
            const stageLeads = leads
              .filter(l => l.stage === stage.key)
              .slice()
              .sort((a, b) => {
                const docA = documents.find(d => d.leadId === a.id || (d.clientCompany && a.companyName && d.clientCompany.toLowerCase().trim() === a.companyName.toLowerCase().trim()));
                const balA = docA ? getInvoiceBalance(docA.id) : (a.value || 0);

                const docB = documents.find(d => d.leadId === b.id || (d.clientCompany && b.companyName && d.clientCompany.toLowerCase().trim() === b.companyName.toLowerCase().trim()));
                const balB = docB ? getInvoiceBalance(docB.id) : (b.value || 0);

                if (balA > 0 && balB <= 0) return -1;
                if (balB > 0 && balA <= 0) return 1;

                const timeA = new Date(a.createdAt || 0).getTime() || parseInt(a.id.replace(/\D/g, '')) || 0;
                const timeB = new Date(b.createdAt || 0).getTime() || parseInt(b.id.replace(/\D/g, '')) || 0;
                return timeB - timeA;
              });

            return (
              <div
                key={stage.key}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.key)}
                className={`p-3.5 rounded-2xl border ${stage.border} bg-white flex flex-col h-full min-h-0 min-w-[240px] shadow-sm transition-colors`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100 shrink-0">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${stage.bg} ${stage.text}`}>
                    {stage.label}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards Container with Vertical Scroll ONLY */}
                <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
                  {stageLeads.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-xs italic">
                      Drag lead here
                    </div>
                  ) : (
                    stageLeads.map(lead => {
                      const isSelected = selectedLead?.id === lead.id;
                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          onClick={() => setSelectedLead(lead)}
                          className={`p-3.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md ${
                            isSelected
                              ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                              : 'bg-slate-50/90 border-slate-200/90 hover:border-blue-400 hover:bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <div className="flex items-center gap-1">
                              <GripVertical className="w-3.5 h-3.5 text-slate-400 cursor-grab" />
                              <h4 className="font-extrabold text-xs text-slate-900 hover:text-blue-600 transition-colors truncate max-w-[150px]">
                                {lead.companyName}
                              </h4>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteLead(lead.id);
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="text-[11px] text-slate-600 font-bold mb-2 pl-4 truncate">{lead.clientName}</p>

                          <p className="text-[10.5px] text-slate-700 line-clamp-2 mb-2 bg-white p-2 rounded-lg border border-slate-200 leading-tight font-sans">
                            {lead.projectDescription}
                          </p>

                          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                            <span className="font-mono font-extrabold text-emerald-700 text-[11px]">
                              {formatCurrency(lead.value)}
                            </span>
                            <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                              {lead.office} Office
                            </span>
                          </div>

                          {/* Quick Convert Action */}
                          <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onConvertToQuotation(lead);
                              }}
                              className="w-full flex items-center justify-center gap-1 text-[11px] font-extrabold bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg shadow-sm transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" /> Create Quote
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. TABLE VIEW (NEWEST AT TOP) */}
      {activeTab === 'TABLE' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 space-y-4">
          <div className="overflow-x-auto max-h-[700px]">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="p-3.5">Company & Client</th>
                  <th className="p-3.5">Contact Details</th>
                  <th className="p-3.5">Branch Office</th>
                  <th className="p-3.5">Estimated Deal Value</th>
                  <th className="p-3.5">Pipeline Stage</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {leads.slice().reverse().map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5">
                      <p className="font-extrabold text-slate-900">{lead.companyName}</p>
                      <p className="text-slate-500 text-[11px] font-bold">{lead.clientName}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="text-slate-800 font-bold">{lead.email}</p>
                      <p className="text-slate-500 text-[11px] font-mono">{lead.phone}</p>
                    </td>
                    <td className="p-3.5 font-bold text-slate-700">{lead.office}</td>
                    <td className="p-3.5 font-mono font-extrabold text-emerald-700">{formatCurrency(lead.value)}</td>
                    <td className="p-3.5">
                      <select
                        value={lead.stage}
                        onChange={(e) => updateLeadStage(lead.id, e.target.value as LeadStage)}
                        className="bg-white text-slate-800 text-xs border border-slate-300 rounded-lg px-2.5 py-1 font-extrabold focus:outline-none"
                      >
                        {stages.map(s => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedClientForHistory(lead.companyName)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs inline-flex items-center gap-1 border border-slate-300"
                      >
                        <Building2 className="w-3.5 h-3.5 text-blue-600" /> History
                      </button>
                      <button
                        onClick={() => onConvertToQuotation(lead)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-extrabold text-xs inline-flex items-center gap-1 shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" /> Quote
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CLIENT DIRECTORY & CRM VIEW */}
      {activeTab === 'CLIENTS' && (
        <div className="space-y-6">
          {/* Top Search Bar & Summary Badges */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search Client Directory by Name..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
              <span>Total Enterprise Clients: <strong className="text-blue-700 font-extrabold text-sm">{uniqueClientsList.length}</strong></span>
            </div>
          </div>

          {/* Client Cards Master Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClients.map(client => (
              <div
                key={client.companyName}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-base font-black text-slate-900">{client.companyName}</h4>
                      <p className="text-xs text-slate-500 font-bold flex items-center gap-1 mt-0.5">
                        <User className="w-3.5 h-3.5 text-blue-600" /> {client.clientName}
                      </p>
                    </div>

                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-blue-50 text-blue-800 border border-blue-200">
                      {client.office} Hub
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 font-medium pt-2 border-t border-slate-100">
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-purple-600" /> {client.email}
                    </p>
                    <p className="flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" /> {client.phone}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs mt-3">
                    <div>
                      <span className="text-[9.5px] text-slate-500 font-bold uppercase block">Projects Count</span>
                      <span className="font-extrabold text-slate-900 text-xs">{client.projectsCount} Deals</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-500 font-bold uppercase block">Lifetime LTV</span>
                      <span className="font-mono font-black text-emerald-700 text-xs">{formatCurrency(client.totalLTV)}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      const existingLead = leads.find(l => l.companyName.toLowerCase().trim() === client.companyName.toLowerCase().trim());
                      if (existingLead) {
                        onConvertToQuotation(existingLead);
                      } else {
                        const tempLead: Lead = {
                          id: `LEAD-QTN-${Date.now().toString().slice(-4)}`,
                          clientName: client.clientName,
                          companyName: client.companyName,
                          email: client.email,
                          phone: client.phone,
                          office: client.office,
                          stage: 'PROPOSAL_SENT',
                          value: 250000,
                          currency: 'INR',
                          projectDescription: `Custom Software Engineering Services for ${client.companyName}`,
                          createdAt: new Date().toISOString().split('T')[0]
                        };
                        onConvertToQuotation(tempLead);
                      }
                    }}
                    className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" /> Create Quotation
                  </button>

                  <button
                    onClick={() => handleOpenAddModalForClient(client.companyName)}
                    className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-extrabold border border-blue-200 flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Project
                  </button>

                  <button
                    onClick={() => setSelectedClientForHistory(client.companyName)}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-1"
                  >
                    <Building2 className="w-3.5 h-3.5" /> History
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Lead Modal (With Repeat Client Selector) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Create New Client Lead
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Existing Client Selector for Repeat Business */}
              <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200">
                <label className="block text-blue-900 font-extrabold mb-1">
                  Client Type (Repeat vs New)
                </label>
                <select
                  value={selectedExistingClient}
                  onChange={(e) => handleSelectExistingClient(e.target.value)}
                  className="w-full bg-white border border-blue-300 rounded-xl p-2.5 text-slate-900 font-extrabold"
                >
                  <option value="__NEW__">+ Add Brand New Client Company...</option>
                  {uniqueClientsList.map(c => (
                    <option key={c.companyName.toLowerCase()} value={c.companyName.toLowerCase()}>
                      Existing Client: {c.companyName} ({c.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Healthcare LLC"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Client Representative</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Tariq Al-Mansoor"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="client@apexhealth.ae"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Phone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+971 50 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Office Branch</label>
                  <select
                    value={office}
                    onChange={(e) => setOffice(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="India">India (UDYAM)</option>
                    <option value="UAE">UAE Office</option>
                    <option value="Rwanda">Rwanda (REG)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Estimated Deal Value (INR)</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Project Scope & Requirements</label>
                <textarea
                  rows={3}
                  placeholder="Describe new product software engineering scope..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md shadow-blue-600/20"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* On-Click Client History Drawer Modal */}
      {selectedClientForHistory && (
        <ClientHistoryModal
          clientCompanyName={selectedClientForHistory}
          onClose={() => setSelectedClientForHistory(null)}
          onCreateNewLeadForClient={(compName) => handleOpenAddModalForClient(compName)}
          onConvertToQuotation={(lead) => onConvertToQuotation(lead)}
        />
      )}
    </div>
  );
};
