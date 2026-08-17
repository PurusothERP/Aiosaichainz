import React from 'react';
import { useApp } from '../../context/AppContext';
import { Lead, BusinessDocument } from '../../types';
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  Plus,
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';

interface Props {
  clientCompanyName: string;
  onClose: () => void;
  onCreateNewLeadForClient: (companyName: string) => void;
  onConvertToQuotation: (lead: Lead) => void;
}

export const ClientHistoryModal: React.FC<Props> = ({
  clientCompanyName,
  onClose,
  onCreateNewLeadForClient,
  onConvertToQuotation
}) => {
  const { leads, documents, formatCurrency } = useApp();

  const clientLeads = leads.filter(l => l.companyName.toLowerCase() === clientCompanyName.toLowerCase());
  const clientDocs = documents.filter(d => d.clientCompany.toLowerCase() === clientCompanyName.toLowerCase());

  const sampleLead = clientLeads[0];
  const sampleDoc = clientDocs[0];

  const primaryContact = sampleLead?.clientName || sampleDoc?.clientName || 'Valued Enterprise Client';
  const email = sampleLead?.email || sampleDoc?.clientEmail || 'contact@client.com';
  const phone = sampleLead?.phone || sampleDoc?.clientPhone || '+91 98765 43210';
  const office = sampleLead?.office || sampleDoc?.officeLocation || 'India';
  const gst = sampleDoc?.clientGST || 'GST Registered';

  const totalBilledLTV = clientDocs
    .filter(d => d.docType === 'INVOICE' && d.status === 'PAID')
    .reduce((sum, d) => sum + d.total, 0);

  const totalPipelineValue = clientLeads.reduce((sum, l) => sum + (l.value || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-slate-900 text-white p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black">{clientCompanyName}</h3>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase">
                  {office} Office Hub
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Enterprise Client Relationship & Lifetime Transaction History</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 text-xl font-bold">✕</button>
        </div>

        {/* Client Metadata Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 font-bold block text-[10px] uppercase">Primary Representative</span>
            <span className="font-extrabold text-slate-900 text-xs">{primaryContact}</span>
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-[10px] uppercase">Contact Email & Phone</span>
            <span className="font-bold text-slate-800 text-xs truncate block">{email}</span>
            <span className="font-mono text-slate-500 text-[10.5px]">{phone}</span>
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-[10px] uppercase">Lifetime Realized LTV</span>
            <span className="font-mono font-black text-emerald-700 text-sm">{formatCurrency(totalBilledLTV)}</span>
          </div>
          <div>
            <span className="text-slate-500 font-bold block text-[10px] uppercase">Pipeline Value</span>
            <span className="font-mono font-black text-blue-700 text-sm">{formatCurrency(totalPipelineValue)}</span>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>Total Projects: {clientLeads.length} | Invoices: {clientDocs.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                const existingLead = clientLeads[0];
                if (existingLead) {
                  onConvertToQuotation(existingLead);
                } else {
                  const tempLead: Lead = {
                    id: `LEAD-QTN-${Date.now().toString().slice(-4)}`,
                    clientName: primaryContact,
                    companyName: clientCompanyName,
                    email: email,
                    phone: phone,
                    office: office,
                    stage: 'PROPOSAL_SENT',
                    value: 250000,
                    currency: 'INR',
                    projectDescription: `Software Engineering Services for ${clientCompanyName}`,
                    createdAt: new Date().toISOString().split('T')[0]
                  };
                  onConvertToQuotation(tempLead);
                }
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-purple-600/20 flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" /> + Create Quotation
            </button>
            <button
              onClick={() => {
                onClose();
                onCreateNewLeadForClient(clientCompanyName);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> + Create New Lead
            </button>
          </div>
        </div>

        {/* Body: Two Scrollable Lists (Projects/Leads & Quotations/Invoices) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* Projects / Leads History */}
          <div className="space-y-3">
            <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" /> Client Projects & Pipeline History ({clientLeads.length})
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Project Title & Description</th>
                    <th className="p-3">Stage</th>
                    <th className="p-3 font-mono text-right">Deal Value</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {clientLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-slate-50">
                      <td className="p-3 font-sans">
                        <p className="font-extrabold text-slate-900">{lead.projectDescription}</p>
                        <p className="text-slate-500 text-[10.5px]">Branch: {lead.office} Office</p>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black ${
                          lead.stage === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          lead.stage === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {lead.stage}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-black text-emerald-700">{formatCurrency(lead.value)}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            onClose();
                            onConvertToQuotation(lead);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 shadow-sm"
                        >
                          <FileText className="w-3 h-3" /> Quote
                        </button>
                      </td>
                    </tr>
                  ))}
                  {clientLeads.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400 italic">No project leads recorded yet for this client.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quotations & Invoices History */}
          <div className="space-y-3">
            <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" /> Quotations & Invoices Generated ({clientDocs.length})
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Doc Ref</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Issue Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 font-mono text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {clientDocs.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-blue-700">{doc.docNumber}</td>
                      <td className="p-3 font-sans font-bold text-slate-800">{doc.docType}</td>
                      <td className="p-3 text-slate-500">{doc.issueDate}</td>
                      <td className="p-3 font-sans">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black ${
                          doc.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                          doc.status === 'SENT' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-black text-emerald-700">{formatCurrency(doc.total)}</td>
                    </tr>
                  ))}
                  {clientDocs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-400 italic font-sans">No quotations or invoices generated yet for this client.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
