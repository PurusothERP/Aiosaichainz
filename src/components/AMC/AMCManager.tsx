import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AMCContract, AMCStatus } from '../../types';
import {
  ShieldCheck,
  Plus,
  Calendar,
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Search,
  DollarSign,
  Briefcase
} from 'lucide-react';

interface Props {
  onGenerateAMCInvoice?: (amc: AMCContract) => void;
}

export const AMCManager: React.FC<Props> = ({ onGenerateAMCInvoice }) => {
  const { amcContracts, addAMCContract, updateAMCStatus, deleteAMCContract, formatCurrency } = useApp();

  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'UPCOMING' | 'EXPIRED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [clientCompany, setClientCompany] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [projectName, setProjectName] = useState('');
  const [officeLocation, setOfficeLocation] = useState<'India' | 'UAE' | 'Rwanda'>('India');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [annualAmount, setAnnualAmount] = useState(150000);
  const [billingCycle, setBillingCycle] = useState<'Annual' | 'Quarterly' | 'Monthly'>('Annual');
  const [scopeNotes, setScopeNotes] = useState('24/7 SLA Support, GPU Server Patches & Bug Fixes');
  const [autoRenew, setAutoRenew] = useState(true);

  const activeAMCs = amcContracts.filter(a => a.status === 'ACTIVE');
  const upcomingRenewals = amcContracts.filter(a => a.status === 'UPCOMING_RENEWAL');
  const expiredAMCs = amcContracts.filter(a => a.status === 'EXPIRED');

  const totalARR = activeAMCs.reduce((sum, a) => sum + a.annualAmount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientCompany || !projectName) return;

    addAMCContract({
      contractNumber: `AMC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      clientCompany,
      clientName,
      clientEmail,
      clientPhone,
      projectName,
      officeLocation,
      startDate,
      endDate,
      annualAmount: Number(annualAmount),
      currency: 'INR',
      billingCycle,
      status: 'ACTIVE',
      scopeNotes,
      autoRenew
    });

    setClientCompany('');
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setProjectName('');
    setShowAddModal(false);
  };

  const filteredContracts = amcContracts.filter(amc => {
    const matchesSearch = amc.clientCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          amc.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'ACTIVE') return matchesSearch && amc.status === 'ACTIVE';
    if (activeTab === 'UPCOMING') return matchesSearch && amc.status === 'UPCOMING_RENEWAL';
    if (activeTab === 'EXPIRED') return matchesSearch && amc.status === 'EXPIRED';
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" /> Annual Maintenance Contracts (AMC) Suite
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Manage client annual maintenance contracts, SLA support terms, expiry alerts & 1-click AMC invoicing.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-blue-600/20 transition"
        >
          <Plus className="w-4 h-4" /> Add AMC Contract
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 border-l-4 border-l-blue-600 shadow-sm">
          <span className="text-[11px] font-black text-slate-500 uppercase">ACTIVE AMC CONTRACTS</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">{activeAMCs.length} Contracts</span>
            <span className="text-xs font-mono font-bold text-blue-700">{formatCurrency(totalARR)} / yr</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 border-l-4 border-l-amber-500 shadow-sm">
          <span className="text-[11px] font-black text-slate-500 uppercase">UPCOMING RENEWALS</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-amber-700">{upcomingRenewals.length} Action Needed</span>
            <span className="text-xs font-bold text-amber-600">Expires soon</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 border-l-4 border-l-purple-600 shadow-sm">
          <span className="text-[11px] font-black text-slate-500 uppercase">TOTAL ANNUAL AMC RECURRING REVENUE</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-purple-900 font-mono">{formatCurrency(totalARR)}</span>
            <span className="text-xs font-bold text-purple-600">Contracted</span>
          </div>
        </div>
      </div>

      {/* Main Register & Filter Toolbar */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'ALL' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'}`}
            >
              All ({amcContracts.length})
            </button>
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'ACTIVE' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'}`}
            >
              Active ({activeAMCs.length})
            </button>
            <button
              onClick={() => setActiveTab('UPCOMING')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'UPCOMING' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'}`}
            >
              Renewals ({upcomingRenewals.length})
            </button>
            <button
              onClick={() => setActiveTab('EXPIRED')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'EXPIRED' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'}`}
            >
              Expired ({expiredAMCs.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search AMC Contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Master AMC Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Contract Ref</th>
                <th className="p-3.5">Client & Project</th>
                <th className="p-3.5">Contract Period</th>
                <th className="p-3.5">Billing Cycle</th>
                <th className="p-3.5 font-mono text-right">Annual Value</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredContracts.map(amc => (
                <tr key={amc.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-mono font-bold text-blue-700">{amc.contractNumber}</td>
                  <td className="p-3.5">
                    <p className="font-extrabold text-slate-900">{amc.clientCompany}</p>
                    <p className="text-slate-500 text-[10.5px] font-bold">{amc.projectName}</p>
                  </td>
                  <td className="p-3.5 font-mono text-slate-600">
                    <p>{amc.startDate} to {amc.endDate}</p>
                  </td>
                  <td className="p-3.5 font-bold text-slate-700">{amc.billingCycle}</td>
                  <td className="p-3.5 text-right font-mono font-extrabold text-emerald-700">{formatCurrency(amc.annualAmount)}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black ${
                      amc.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                      amc.status === 'UPCOMING_RENEWAL' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {amc.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-1.5">
                    {onGenerateAMCInvoice && (
                      <button
                        onClick={() => onGenerateAMCInvoice(amc)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-extrabold text-[11px] inline-flex items-center gap-1 shadow-sm"
                      >
                        <FileText className="w-3 h-3" /> Bill AMC
                      </button>
                    )}
                    <button
                      onClick={() => updateAMCStatus(amc.id, 'ACTIVE')}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 border border-slate-300"
                    >
                      <RefreshCw className="w-3 h-3 text-emerald-600" /> Renew
                    </button>
                    <button
                      onClick={() => deleteAMCContract(amc.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400 italic font-sans">
                    No AMC contracts found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add AMC Contract Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> Add Annual Maintenance Contract (AMC)
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Client Company</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Healthcare LLC"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
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

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Project / Software Scope</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Platform GPU Maintenance & SLA Uptime Support"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Annual Amount (INR)</label>
                  <input
                    type="number"
                    value={annualAmount}
                    onChange={(e) => setAnnualAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Billing Cycle</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="Annual">Annual</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
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
                  Save AMC Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
