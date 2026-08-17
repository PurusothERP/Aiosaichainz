import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClientDocument } from '../../types';
import { exportToCSV, exportToPDFPrint } from '../../utils/exportUtils';
import {
  FolderOpen,
  Plus,
  ExternalLink,
  Search,
  Trash2,
  Building2,
  FileText,
  Calendar,
  Download,
  Printer,
  Link,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const DocumentsVault: React.FC = () => {
  const { clientDocuments, addClientDocument, deleteClientDocument, leads, documents } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [clientCompany, setClientCompany] = useState('');
  const [clientName, setClientName] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [category, setCategory] = useState<ClientDocument['category']>('Contract');
  const [description, setDescription] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');

  // Extract All Unique Client Companies from Leads, Invoices, and Client Documents
  const allClientCompanies = Array.from(new Set([
    ...leads.map(l => l.companyName),
    ...documents.map(d => d.clientCompany),
    ...clientDocuments.map(cd => cd.clientCompany)
  ])).filter(Boolean);

  const filteredDocuments = (clientDocuments || []).filter(doc => {
    if (!doc) return false;
    const matchesClient = selectedClientFilter === 'ALL' || doc.clientCompany === selectedClientFilter;
    const matchesSearch = !searchTerm ||
      (doc.documentTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.clientCompany || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClient && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientCompany || !documentTitle || !documentUrl) return;

    addClientDocument({
      clientCompany,
      clientName: clientName || 'Client Representative',
      documentTitle,
      category,
      description,
      documentUrl
    });

    setClientCompany('');
    setClientName('');
    setDocumentTitle('');
    setDescription('');
    setDocumentUrl('');
    setShowAddModal(false);
  };

  // Executive Dashboard Metrics for Documents Vault
  const legalDocsCount = clientDocuments.filter(d => ['Contract', 'MoU', 'SLA', 'NDA'].includes(d.category)).length;
  const driveAssetsCount = clientDocuments.filter(d => d.category === 'Google Drive Assets' || d.documentUrl.includes('drive.google.com')).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-indigo-600" /> Client Documents & Google Drive Vault
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Select involved clients, record contracts & MoU descriptions, and link Google Drive asset folders directly.
          </p>
        </div>

        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto">
          <button
            onClick={() => {
              const headers = ['Document Title', 'Category', 'Client Company', 'Client Name', 'Google Drive Link', 'Uploaded Date', 'Description'];
              const rows = filteredDocuments.length > 0
                ? filteredDocuments.map(d => [d.documentTitle, d.category, d.clientCompany, d.clientName, d.documentUrl, d.uploadedDate, d.description])
                : [['No Document records logged yet', '-', '-', '-', '-', '-', '-']];
              exportToCSV('Client_Documents_Vault', headers, rows);
            }}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border border-emerald-200 shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Export Excel
          </button>

          <button
            onClick={() => exportToPDFPrint('Client Documents Vault Report', 'documents-vault-table-print')}
            className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border border-blue-200 shadow-2xs"
          >
            <Printer className="w-4 h-4 text-blue-600" /> Print PDF
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" /> Add Document Record
          </button>
        </div>
      </div>

      {/* Executive Documents Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-indigo-600">
          <span className="text-[10.5px] font-black uppercase text-indigo-700 block">TOTAL VAULT DOCUMENTS</span>
          <p className="text-2xl font-black text-indigo-900 font-mono tracking-tight mt-1">{clientDocuments.length}</p>
          <p className="text-[11px] text-slate-500 font-bold mt-1">Logged Client Files & Agreements</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-blue-600">
          <span className="text-[10.5px] font-black uppercase text-blue-700 block">INVOLVED CLIENT COMPANIES</span>
          <p className="text-2xl font-black text-blue-900 font-mono tracking-tight mt-1">{allClientCompanies.length}</p>
          <p className="text-[11px] text-slate-500 font-bold mt-1">Unique Client Entities Managed</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-emerald-600">
          <span className="text-[10.5px] font-black uppercase text-emerald-700 block">LEGAL CONTRACTS & MOUs</span>
          <p className="text-2xl font-black text-emerald-900 font-mono tracking-tight mt-1">{legalDocsCount}</p>
          <p className="text-[11px] text-slate-500 font-bold mt-1">Active SLAs, NDAs & Agreements</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-purple-600">
          <span className="text-[10.5px] font-black uppercase text-purple-700 block">GOOGLE DRIVE ASSET LINKS</span>
          <p className="text-2xl font-black text-purple-900 font-mono tracking-tight mt-1">{driveAssetsCount}</p>
          <p className="text-[11px] text-slate-500 font-bold mt-1">Direct Cloud Drive Connections</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div>
            <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Filter by Client Company</label>
            <select
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Clients ({allClientCompanies.length})</option>
              {allClientCompanies.map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 sm:w-64">
            <label className="block text-[10px] text-slate-400 font-extrabold uppercase mb-1">Search Documents</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search title, client, scope..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="text-xs font-extrabold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          Total Documents Logged: <span className="text-indigo-600 font-black">{filteredDocuments.length}</span>
        </div>
      </div>

      {/* Documents Table / Grid View */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200" id="documents-vault-table-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Document Title & Category</th>
                <th className="p-3.5">Involved Client Company</th>
                <th className="p-3.5">Description / Scope</th>
                <th className="p-3.5">Uploaded Date</th>
                <th className="p-3.5 text-center">Google Drive Link</th>
                <th className="p-3.5 text-right no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredDocuments.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5">
                    <p className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-600" /> {doc.documentTitle}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-md border border-indigo-200">
                      {doc.category}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <p className="font-extrabold text-slate-900">{doc.clientCompany}</p>
                    <p className="text-slate-500 text-[10.5px]">{doc.clientName}</p>
                  </td>
                  <td className="p-3.5 text-slate-700 max-w-xs truncate">{doc.description || 'N/A'}</td>
                  <td className="p-3.5 font-mono text-slate-600">{doc.uploadedDate}</td>
                  <td className="p-3.5 text-center">
                    <a
                      href={doc.documentUrl.startsWith('http') ? doc.documentUrl : `https://${doc.documentUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs rounded-xl border border-blue-200 shadow-2xs transition"
                    >
                      <Link className="w-3.5 h-3.5 text-blue-600" /> Open Google Drive <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </td>
                  <td className="p-3.5 text-right no-print">
                    <button
                      onClick={() => deleteClientDocument(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Delete document record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredDocuments.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    No documents found in vault. Click "Add Document Record" above to attach Google Drive links.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-indigo-600" /> Add Client Document & Google Drive Link
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select / Type Client Company</label>
                <input
                  type="text"
                  required
                  list="client-company-options"
                  placeholder="e.g. Acme Tech Corporation"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-extrabold"
                />
                <datalist id="client-company-options">
                  {allClientCompanies.map(comp => (
                    <option key={comp} value={comp} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Client Representative / Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe (VP Engineering)"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Document Title / Item</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Services Agreement (MSA)"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="Contract">Contract / Agreement</option>
                    <option value="MoU">MoU / Intent Letter</option>
                    <option value="SLA">SLA / Service Scope</option>
                    <option value="Technical Architecture">Technical Architecture</option>
                    <option value="GST Certificate">GST / Tax Certificate</option>
                    <option value="NDA">NDA / Confidentiality</option>
                    <option value="Google Drive Assets">Google Drive Assets Folder</option>
                    <option value="Other">Other Document</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-blue-900 font-extrabold mb-1 flex items-center gap-1">
                  <span>🔗</span> Google Drive / Cloud Link URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/... or folder link"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  className="w-full bg-blue-50/70 border border-blue-300 rounded-xl p-2.5 text-blue-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Key terms, validity date, or scope summary..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md shadow-indigo-600/20"
                >
                  Save & Link Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
