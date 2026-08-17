import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CompletedProject } from '../../types';
import {
  FolderCheck,
  Globe,
  Coins,
  Github,
  FileCode,
  Plus,
  Edit,
  ExternalLink,
  Copy,
  CheckCircle,
  Building,
  DollarSign,
  Maximize2,
  X,
  FileText,
  ShieldCheck,
  Code2,
  Layers,
  Trash2
} from 'lucide-react';

interface DeliverableItemInput {
  category: string;
  title: string;
  details: string;
}

export const ClientProjectsVault: React.FC = () => {
  const { completedProjects, addCompletedProject, updateCompletedProject, serviceCategories, addServiceCategory, formatCurrency } = useApp();

  const [activeDetailProject, setActiveDetailProject] = useState<CompletedProject | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Form State
  const [clientCompany, setClientCompany] = useState('');
  const [clientName, setClientName] = useState('');
  const [officeLocation, setOfficeLocation] = useState<'India' | 'UAE' | 'Rwanda'>('India');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [tokenContractAddress, setTokenContractAddress] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [sourceCodeFileName, setSourceCodeFileName] = useState('');
  const [totalAmount, setTotalAmount] = useState(350000);
  const [slaWarranty, setSlaWarranty] = useState('1-Year Uptime & SLA Bug Fix Guarantee');
  const [techStackText, setTechStackText] = useState('React, TypeScript, Node.js, Solidity, AWS');

  // Dynamic Deliverable Scope Items Array
  const [deliverableItems, setDeliverableItems] = useState<DeliverableItemInput[]>([
    { category: 'Web Application', title: 'Enterprise AI & Analytics Platform', details: 'Full stack dashboard with OAuth and REST APIs' },
    { category: 'Tokenization - Crypto', title: 'Smart Contract Audit & Testnet Deployment', details: 'Audited ERC-20 token contract with Sepolia testnet verification' }
  ]);

  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleAddDeliverableRow = () => {
    setDeliverableItems([
      ...deliverableItems,
      { category: serviceCategories[0] || 'Web Application', title: '', details: '' }
    ]);
  };

  const handleRemoveDeliverableRow = (index: number) => {
    setDeliverableItems(deliverableItems.filter((_, i) => i !== index));
  };

  const handleDeliverableItemChange = (index: number, field: keyof DeliverableItemInput, value: string) => {
    const updated = [...deliverableItems];
    updated[index] = { ...updated[index], [field]: value };
    setDeliverableItems(updated);
  };

  const handleOpenEdit = (proj: CompletedProject) => {
    setActiveDetailProject(null);
    setClientCompany(proj.clientCompany);
    setClientName(proj.clientName);
    setOfficeLocation(proj.officeLocation);
    setWebsiteUrl(proj.websiteUrl || '');
    setTokenContractAddress(proj.tokenContractAddress || '');
    setGithubLink(proj.githubLink || '');
    setSourceCodeFileName(proj.sourceCodeFileName || '');
    setTotalAmount(proj.totalAmount || 350000);

    // Convert string array to items
    const items: DeliverableItemInput[] = (proj.quotationItems || []).map(str => ({
      category: 'Software Service',
      title: str,
      details: 'Production verified deliverable'
    }));
    setDeliverableItems(items.length > 0 ? items : [
      { category: 'Web Application', title: 'Custom Engineering Deliverable', details: 'Production deployment completed' }
    ]);

    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDetailProject) return;
    
    const formattedItems = deliverableItems.map(item => 
      item.title ? `${item.category}: ${item.title}` : item.category
    );

    updateCompletedProject(activeDetailProject.id, {
      clientCompany,
      clientName,
      officeLocation,
      websiteUrl,
      tokenContractAddress,
      githubLink,
      sourceCodeFileName,
      totalAmount: Number(totalAmount),
      quotationItems: formattedItems
    });
    setShowEditModal(false);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientCompany) return;

    const formattedItems = deliverableItems.map(item => 
      item.title ? `${item.category}: ${item.title}` : item.category
    );

    addCompletedProject({
      invoiceId: `MANUAL-${Date.now().toString().slice(-4)}`,
      invoiceNo: `INV-${Date.now().toString().slice(-4)}`,
      clientCompany,
      clientName,
      officeLocation,
      quotationItems: formattedItems,
      websiteUrl,
      tokenContractAddress,
      githubLink,
      sourceCodeFileName,
      completionDate: new Date().toISOString().split('T')[0],
      totalAmount: Number(totalAmount),
      currency: 'INR'
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <FolderCheck className="w-5 h-5 text-emerald-600" /> Completed Client Work & Technical Vault
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Archive of completed deliverables: Click any client card to inspect detailed technical deliverables, contracts, and zips.
          </p>
        </div>

        <button
          onClick={() => {
            setClientCompany('');
            setClientName('');
            setWebsiteUrl('');
            setTokenContractAddress('');
            setGithubLink('');
            setSourceCodeFileName('');
            setTotalAmount(350000);
            setDeliverableItems([
              { category: 'Web Application', title: 'Enterprise AI Software Platform', details: 'Production cloud build' }
            ]);
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" /> Add Completed Work
        </button>
      </div>

      {/* Projects Cards Master Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {completedProjects.map(proj => (
          <div
            key={proj.id}
            onClick={() => setActiveDetailProject(proj)}
            className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-md transition cursor-pointer space-y-4 relative group"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Ref: {proj.invoiceNo}
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg mt-2 group-hover:text-emerald-700 transition-colors">
                  {proj.clientCompany}
                </h3>
                <p className="text-xs text-slate-500 font-bold">{proj.clientName} • {proj.officeLocation} Office</p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDetailProject(proj);
                }}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-200 shadow-2xs"
              >
                <Maximize2 className="w-4 h-4 text-emerald-600" /> View Details
              </button>
            </div>

            {/* Delivered Quotation Services Badges */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Delivered Scope Items:</span>
              <div className="flex flex-wrap gap-1.5">
                {proj.quotationItems.map((item, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Technical Deliverables Fields Grid */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs font-medium">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5 font-bold">
                  <Globe className="w-3.5 h-3.5 text-blue-600" /> Website URL:
                </span>
                <span className="text-blue-700 font-mono font-bold text-[11px] truncate max-w-[200px]">
                  {proj.websiteUrl || 'Not set'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5 font-bold">
                  <Coins className="w-3.5 h-3.5 text-purple-600" /> Token Contract:
                </span>
                <span className="font-mono text-[11px] text-purple-700 font-bold">
                  {proj.tokenContractAddress && proj.tokenContractAddress !== '0x...' ? `${proj.tokenContractAddress.slice(0, 8)}...${proj.tokenContractAddress.slice(-6)}` : 'No Token Address'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">Completed: {proj.completionDate}</span>
              <span className="font-mono font-black text-emerald-700 text-base">{formatCurrency(proj.totalAmount)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Inspection Drawer / Modal */}
      {activeDetailProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl p-6 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Ref: {activeDetailProject.invoiceNo}
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{activeDetailProject.clientCompany}</h3>
                <p className="text-xs text-slate-500 font-bold">{activeDetailProject.clientName} • {activeDetailProject.officeLocation} Office Hub</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(activeDetailProject)}
                  className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-extrabold rounded-xl border border-amber-200 flex items-center gap-1 shadow-2xs"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Deliverables
                </button>
                <button onClick={() => setActiveDetailProject(null)} className="text-slate-400 hover:text-slate-700 p-1 text-xl font-bold">
                  ✕
                </button>
              </div>
            </div>

            {/* Delivered Services Scope Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" /> Delivered Technical Scope & Items ({activeDetailProject.quotationItems.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeDetailProject.quotationItems.map((item, i) => (
                  <div key={i} className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 space-y-0.5">
                    <span className="text-[10px] font-extrabold text-blue-800 uppercase block">Deliverable #{i + 1}</span>
                    <p className="text-xs font-bold text-slate-900">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Links & Smart Contract Credentials */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Production Technical Credentials</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Website */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-bold flex items-center gap-1.5 text-[11px]">
                    <Globe className="w-4 h-4 text-blue-600" /> Website URL:
                  </span>
                  {activeDetailProject.websiteUrl ? (
                    <a
                      href={activeDetailProject.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline font-mono font-bold text-xs flex items-center gap-1 truncate block"
                    >
                      {activeDetailProject.websiteUrl} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not set</span>
                  )}
                </div>

                {/* Token Smart Contract Address */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-bold flex items-center gap-1.5 text-[11px]">
                    <Coins className="w-4 h-4 text-purple-600" /> Token Smart Contract:
                  </span>
                  {activeDetailProject.tokenContractAddress && activeDetailProject.tokenContractAddress !== '0x...' ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-xs text-purple-900 truncate">
                        {activeDetailProject.tokenContractAddress}
                      </span>
                      <button
                        onClick={() => handleCopyAddress(activeDetailProject.tokenContractAddress)}
                        className="text-slate-500 hover:text-slate-900 p-1 flex-shrink-0"
                        title="Copy Contract Address"
                      >
                        <Copy className="w-3.5 h-3.5 text-purple-600" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">No Token Contract</span>
                  )}
                </div>

                {/* GitHub Link */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-bold flex items-center gap-1.5 text-[11px]">
                    <Github className="w-4 h-4 text-slate-800" /> GitHub Repository:
                  </span>
                  {activeDetailProject.githubLink ? (
                    <a
                      href={activeDetailProject.githubLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:underline font-mono font-bold text-xs flex items-center gap-1 truncate block"
                    >
                      Open GitHub Repo <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Private Repository</span>
                  )}
                </div>

                {/* Source Code File Name */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-bold flex items-center gap-1.5 text-[11px]">
                    <FileCode className="w-4 h-4 text-amber-600" /> Source Code Zip Package:
                  </span>
                  <span className="font-mono font-bold text-xs text-amber-800 block truncate">
                    {activeDetailProject.sourceCodeFileName || 'production-source.zip'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-bold">Delivery Date: {activeDetailProject.completionDate}</span>
              <span className="font-mono font-black text-emerald-700 text-lg">{formatCurrency(activeDetailProject.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vault Modal (Spacious max-w-3xl Grid with Dynamic + Add Item Rows) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl p-6 space-y-4 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-emerald-600" /> Update Deliverables Vault & Scope Items
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-700 p-1 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Client Company</label>
                  <input
                    type="text"
                    required
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Client Representative</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* Dynamic + Add Deliverable Scope Items */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" /> Deliverable Scope & Services List ({deliverableItems.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddDeliverableRow}
                    className="text-xs text-blue-700 hover:text-blue-800 font-extrabold flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Scope Item
                  </button>
                </div>

                {deliverableItems.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex gap-2 items-center">
                      <select
                        value={item.category}
                        onChange={(e) => {
                          if (e.target.value === '__ADD_NEW__') {
                            const custom = window.prompt('Enter new custom service category title:');
                            if (custom && custom.trim()) {
                              addServiceCategory(custom.trim());
                              handleDeliverableItemChange(idx, 'category', custom.trim());
                            }
                          } else {
                            handleDeliverableItemChange(idx, 'category', e.target.value);
                          }
                        }}
                        className="w-48 bg-white border border-slate-300 rounded-lg p-2 font-bold text-blue-700"
                      >
                        {serviceCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="__ADD_NEW__">➕ Add Custom Category...</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Deliverable Title (e.g. AI Pipeline Setup)"
                        value={item.title}
                        onChange={(e) => handleDeliverableItemChange(idx, 'title', e.target.value)}
                        className="flex-1 bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverableRow(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Credentials Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Website URL</label>
                  <input
                    type="text"
                    placeholder="https://clientwebsite.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Token Smart Contract Address</label>
                  <input
                    type="text"
                    placeholder="0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
                    value={tokenContractAddress}
                    onChange={(e) => setTokenContractAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">GitHub Repository Link</label>
                  <input
                    type="text"
                    placeholder="https://github.com/aichainz-org/repo"
                    value={githubLink}
                    onChange={(e) => setGithubLink(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Source Code Zip Package Name</label>
                  <input
                    type="text"
                    placeholder="aichainz-project-v1.0.zip"
                    value={sourceCodeFileName}
                    onChange={(e) => setSourceCodeFileName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md shadow-emerald-600/20"
                >
                  Save Deliverables Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Vault Modal (Spacious max-w-3xl Grid with Dynamic + Add Item Rows) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl p-6 space-y-4 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" /> Log Completed Client Deliverables Vault
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 p-1 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveNew} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Client Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Crypto Pay LLC"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Client Representative</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Branch Office</label>
                  <select
                    value={officeLocation}
                    onChange={(e) => setOfficeLocation(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="India">India (UDYAM)</option>
                    <option value="UAE">UAE Office</option>
                    <option value="Rwanda">Rwanda (REG)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic + Add Deliverable Scope Items */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" /> Deliverable Scope & Services List ({deliverableItems.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddDeliverableRow}
                    className="text-xs text-blue-700 hover:text-blue-800 font-extrabold flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Scope Item
                  </button>
                </div>

                {deliverableItems.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex gap-2 items-center">
                      <select
                        value={item.category}
                        onChange={(e) => handleDeliverableItemChange(idx, 'category', e.target.value)}
                        className="w-44 bg-white border border-slate-300 rounded-lg p-2 font-bold text-blue-700"
                      >
                        {serviceCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Deliverable Title (e.g. AI Pipeline Setup)"
                        value={item.title}
                        onChange={(e) => handleDeliverableItemChange(idx, 'title', e.target.value)}
                        className="flex-1 bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverableRow(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Credentials Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Website URL</label>
                  <input
                    type="text"
                    placeholder="https://clientapp.io"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Token Contract Address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={tokenContractAddress}
                    onChange={(e) => setTokenContractAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">GitHub Repository Link</label>
                  <input
                    type="text"
                    placeholder="https://github.com/..."
                    value={githubLink}
                    onChange={(e) => setGithubLink(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Source Code File Name</label>
                  <input
                    type="text"
                    placeholder="source-code-v1.zip"
                    value={sourceCodeFileName}
                    onChange={(e) => setSourceCodeFileName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md shadow-emerald-600/20"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
