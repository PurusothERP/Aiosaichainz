import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DetailedProjectPL } from '../../types';
import { exportToPDFPrint } from '../../utils/exportUtils';
import {
  Briefcase,
  Building,
  FileText,
  Printer,
  Receipt,
  Plus,
  Trash2,
  Edit,
  Search,
  DollarSign,
  Tag
} from 'lucide-react';

export const ProjectPLStudio: React.FC = () => {
  const [expSearchQuery, setExpSearchQuery] = useState('');
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [matrixSearchQuery, setMatrixSearchQuery] = useState('');
  const {
    projectPLRecords,
    documents,
    leads,
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    bankAccounts,
    expenseCategories,
    addExpenseCategory,
    getProjectPLStatement,
    getCompanyPLStatement,
    formatCurrency
  } = useApp();

  // Dynamically derive ALL active projects from projectPLRecords, invoices, and leads
  const projectMap = new Map<string, {
    id: string;
    projectCode: string;
    projectName: string;
    clientCompany: string;
    clientName: string;
  }>();

  // 1. Registered project P&L records
  projectPLRecords.forEach(p => {
    projectMap.set(p.id, {
      id: p.id,
      projectCode: p.projectCode,
      projectName: p.projectName,
      clientCompany: p.clientCompany,
      clientName: p.clientName
    });
  });

  // 2. Invoices & Quotations (e.g. Mexapay)
  documents.forEach(d => {
    const key = d.clientCompany.trim().toLowerCase();
    const existing = Array.from(projectMap.values()).find(p => p.clientCompany.trim().toLowerCase() === key);
    if (!existing) {
      const projCode = d.docNumber || `PRJ-${d.clientCompany.slice(0, 4).toUpperCase()}`;
      const projName = d.items[0]?.description || `${d.clientCompany} Client Project`;
      projectMap.set(d.id, {
        id: d.id,
        projectCode: projCode,
        projectName: projName,
        clientCompany: d.clientCompany,
        clientName: d.clientName
      });
    }
  });

  // 3. Leads
  leads.forEach(l => {
    const key = l.companyName.trim().toLowerCase();
    const existing = Array.from(projectMap.values()).find(p => p.clientCompany.trim().toLowerCase() === key);
    if (!existing) {
      projectMap.set(l.id, {
        id: l.id,
        projectCode: `PRJ-${l.companyName.slice(0, 4).toUpperCase()}`,
        projectName: l.projectDescription || `${l.companyName} Lead Project`,
        clientCompany: l.companyName,
        clientName: l.clientName
      });
    }
  });

  const allProjectsList = Array.from(projectMap.values());

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    allProjectsList[0]?.id || 'PROJ-001'
  );
  const [activeTab, setActiveTab] = useState<'STATEMENT' | 'EXPENSES' | 'COMPANY_PL' | 'COST_MATRIX'>('STATEMENT');

  // Log Project Expense Modal State
  const [showLogExpenseModal, setShowLogExpenseModal] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<any>('API & Cloud');
  const [expAmount, setExpAmount] = useState<number>(15000);
  const [expPaidTo, setExpPaidTo] = useState('');
  const [expPaymentStatus, setExpPaymentStatus] = useState<'PAID' | 'PAYABLE'>('PAID');
  const [expPaymentMethod, setExpPaymentMethod] = useState<'Bank Transfer' | 'Corporate Credit Card' | 'UPI' | 'Crypto USDT' | 'Cash'>('Bank Transfer');
  const [expBankAccountId, setExpBankAccountId] = useState<string>('');
  const [expDate, setExpDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [expNotes, setExpNotes] = useState<string>('');

  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // Add Custom Category Modal State
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (allProjectsList.length > 0 && (!selectedProjectId || !allProjectsList.some(p => p.id === selectedProjectId || p.projectCode === selectedProjectId))) {
      setSelectedProjectId(allProjectsList[0].id);
    }
  }, [allProjectsList]);

  const currentPL: DetailedProjectPL = getProjectPLStatement(selectedProjectId);
  const companyPL = getCompanyPLStatement();

  const currentProjectExpenses = expenses.filter(exp => {
    if (exp.isMultiProject && exp.allocations) {
      return exp.allocations.some(a => a.projectId === selectedProjectId || a.projectCode === currentPL.projectCode);
    }
    return (
      exp.projectId === selectedProjectId || 
      exp.projectCode === currentPL.projectCode ||
      (exp.paidTo && currentPL.clientCompany && exp.paidTo.toLowerCase().trim() === currentPL.clientCompany.toLowerCase().trim()) ||
      (exp.notes && currentPL.clientCompany && exp.notes.toLowerCase().includes(currentPL.clientCompany.toLowerCase().trim()))
    );
  });

  const handleStartEditExpense = (exp: any) => {
    setEditingExpenseId(exp.id);
    setExpCategory(exp.category);
    setExpAmount(exp.totalAmount || exp.amount);
    setExpPaidTo(exp.paidTo || '');
    setExpPaymentStatus(exp.paymentStatus || 'PAID');
    setExpPaymentMethod(exp.paymentMode || 'Bank Transfer');
    setExpBankAccountId(exp.bankAccountId || '');
    setExpDate(exp.date || new Date().toISOString().split('T')[0]);
    setExpNotes(exp.notes || '');
    setShowLogExpenseModal(true);
  };

  const handleLogProjectExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount) return;

    if (editingExpenseId) {
      updateExpense(editingExpenseId, {
        title: expCategory,
        category: expCategory,
        amount: Number(expAmount),
        taxAmount: 0,
        totalAmount: Number(expAmount),
        paidTo: expPaidTo || currentPL.clientCompany || 'Vendor',
        paymentStatus: expPaymentStatus,
        paymentMode: expPaymentMethod as any,
        bankAccountId: expBankAccountId || bankAccounts[0]?.id || '',
        date: expDate || new Date().toISOString().split('T')[0],
        notes: expNotes
      });
      setEditingExpenseId(null);
    } else {
      addExpense({
        title: expCategory,
        category: expCategory,
        amount: Number(expAmount),
        taxAmount: 0,
        totalAmount: Number(expAmount),
        currency: 'INR',
        paidTo: expPaidTo || currentPL.clientCompany || 'Vendor',
        paymentStatus: expPaymentStatus,
        paymentMode: expPaymentMethod as any,
        bankAccountId: expBankAccountId || bankAccounts[0]?.id || '',
        date: expDate || new Date().toISOString().split('T')[0],
        notes: expNotes || `Project direct expense for ${currentPL.projectName} (${currentPL.projectCode})`,
        officeLocation: 'India',
        projectId: selectedProjectId,
        projectCode: currentPL.projectCode
      });
    }

    setShowLogExpenseModal(false);
    setExpAmount(15000);
    setExpPaidTo('');
    setExpNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" /> Project Financial Accounting & P&L Studio
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Single-entry automatic expense flow, project-wise profit & loss, resource cost allocation, and company-wide P&L.
          </p>
        </div>

        {/* Project Selector & Log Expense Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600">Select Project:</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-900 shadow-2xs focus:bg-white"
            >
              {allProjectsList.map(p => (
                <option key={p.id} value={p.id}>{p.projectCode} • {p.projectName} ({p.clientCompany})</option>
              ))}
              {allProjectsList.length === 0 && (
                <option value="PROJ-001">PROJ-001 • Enterprise Platform Development</option>
              )}
            </select>
          </div>

          <button
            onClick={() => {
              setExpTitle('');
              setExpPaidTo(currentPL.clientCompany || '');
              setShowLogExpenseModal(true);
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" /> + Log Project Expense
          </button>
        </div>
      </div>

      {/* Project Financial Summary Dashboard Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 p-6 rounded-2xl text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              PROJECT CODE: {currentPL.projectCode}
            </span>
            <h3 className="text-2xl font-black mt-1 text-white">{currentPL.projectName}</h3>
            <p className="text-xs text-slate-300 font-medium">Client: {currentPL.clientCompany} ({currentPL.clientName})</p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
              currentPL.grossProfit >= 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
            }`}>
              {currentPL.grossProfit >= 0 ? `✓ PROFITABLE (${currentPL.grossMarginPercent.toFixed(1)}% MARGIN)` : '❌ LOSS MAKING'}
            </span>
          </div>
        </div>

        {/* 6 Metric Pill Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center">
            <span className="text-[9.5px] text-slate-300 font-bold uppercase block">CONTRACT VALUE</span>
            <span className="text-base font-black text-white font-mono">{formatCurrency(currentPL.contractValue)}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center">
            <span className="text-[9.5px] text-blue-300 font-bold uppercase block">INVOICED REVENUE</span>
            <span className="text-base font-black text-blue-300 font-mono">{formatCurrency(currentPL.invoicedRevenue)}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center">
            <span className="text-[9.5px] text-emerald-300 font-bold uppercase block">CASH RECEIVED</span>
            <span className="text-base font-black text-emerald-400 font-mono">{formatCurrency(currentPL.cashReceived)}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center">
            <span className="text-[9.5px] text-rose-300 font-bold uppercase block">RECEIVABLE DUE</span>
            <span className="text-base font-black text-rose-300 font-mono">{formatCurrency(currentPL.receivableBalance)}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center">
            <span className="text-[9.5px] text-amber-300 font-bold uppercase block">TOTAL DIRECT EXPENSES</span>
            <span className="text-base font-black text-amber-300 font-mono">{formatCurrency(currentPL.totalDirectExpenses)}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center">
            <span className="text-[9.5px] text-purple-300 font-bold uppercase block">NET PROFIT</span>
            <span className="text-base font-black text-purple-300 font-mono">{formatCurrency(currentPL.netProfit)}</span>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-bold no-print max-w-3xl">
        <button
          onClick={() => setActiveTab('STATEMENT')}
          className={`flex-1 py-2 rounded-lg transition ${activeTab === 'STATEMENT' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Project P&L Statement
        </button>
        <button
          onClick={() => setActiveTab('EXPENSES')}
          className={`flex-1 py-2 rounded-lg transition ${activeTab === 'EXPENSES' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Project Expenses ({currentProjectExpenses.length})
        </button>
        <button
          onClick={() => setActiveTab('COMPANY_PL')}
          className={`flex-1 py-2 rounded-lg transition ${activeTab === 'COMPANY_PL' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Company-Wide P&L
        </button>
        <button
          onClick={() => setActiveTab('COST_MATRIX')}
          className={`flex-1 py-2 rounded-lg transition ${activeTab === 'COST_MATRIX' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Project Cost & Budget Matrix
        </button>
      </div>

      {/* TAB 1: FORMAL PROJECT P&L STATEMENT */}
      {activeTab === 'STATEMENT' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-3xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Project Profit & Loss Statement
              </h3>
              <p className="text-xs text-slate-500 font-medium">Project: {currentPL.projectName} ({currentPL.projectCode})</p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-lg border border-slate-300 flex items-center gap-1 no-print"
            >
              <Printer className="w-3.5 h-3.5" /> Print P&L
            </button>
          </div>

          <div className="space-y-6 text-xs text-slate-800 font-mono">
            {/* REVENUE SECTION */}
            <div className="space-y-2">
              <h4 className="font-sans font-black text-sm text-blue-900 uppercase border-b border-blue-100 pb-1">
                1. REVENUE
              </h4>
              <div className="pl-4 space-y-1">
                <div className="flex justify-between text-slate-700">
                  <span>├── Recognized Invoice Revenue</span>
                  <span className="font-bold text-slate-900">{formatCurrency(currentPL.invoicedRevenue)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>│   ├── Cash Received (Realized)</span>
                  <span className="text-emerald-700 font-bold">{formatCurrency(currentPL.cashReceived)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>│   └── Accounts Receivable (Balance Due)</span>
                  <span className="text-rose-700 font-bold">{formatCurrency(currentPL.receivableBalance)}</span>
                </div>
              </div>
              <div className="flex justify-between font-extrabold text-slate-900 pt-2 border-t border-slate-200 text-xs">
                <span>└── TOTAL PROJECT REVENUE</span>
                <span className="text-blue-800 font-black">{formatCurrency(currentPL.invoicedRevenue)}</span>
              </div>
            </div>

            {/* DIRECT EXPENSES SECTION */}
            <div className="space-y-2">
              <h4 className="font-sans font-black text-sm text-rose-900 uppercase border-b border-rose-100 pb-1">
                2. DIRECT PROJECT EXPENSES
              </h4>
              <div className="pl-4 space-y-1">
                <div className="flex justify-between text-slate-700">
                  <span>├── Personnel / Employee Resource Cost</span>
                  <span className="font-bold">{formatCurrency(currentPL.employeeCost)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>├── Freelancer / Contractor Cost</span>
                  <span className="font-bold">{formatCurrency(currentPL.freelancerCost)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>├── Software & Licenses</span>
                  <span className="font-bold">{formatCurrency(currentPL.softwareCost)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>├── Cloud Infrastructure & Hosting</span>
                  <span className="font-bold">{formatCurrency(currentPL.cloudCost)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>├── Travel & Field Trips</span>
                  <span className="font-bold">{formatCurrency(currentPL.travelCost)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>├── Accommodation Cost</span>
                  <span className="font-bold">{formatCurrency(currentPL.accommodationCost)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>├── Marketing & Lead Gen</span>
                  <span className="font-bold">{formatCurrency(currentPL.marketingCost)}</span>
                </div>

                {/* DYNAMIC CUSTOM CATEGORIES LOGGED BY USER */}
                {(currentPL.categoryBreakdown || []).filter(item => {
                  const cLower = item.category.toLowerCase().trim();
                  const standardKeywords = ['personnel', 'employee', 'salaries', 'payroll', 'freelancer', 'contractor', 'subcontractor', 'software', 'license', 'saas', 'tool', 'cloud', 'api', 'infrastructure', 'hosting', 'server', 'aws', 'travel', 'field', 'accommodation', 'hotel', 'lodging', 'marketing', 'lead', 'advertising'];
                  return !standardKeywords.some(kw => cLower.includes(kw));
                }).map(customCat => (
                  <div key={customCat.category} className="flex justify-between text-indigo-900 font-semibold">
                    <span>├── {customCat.category}</span>
                    <span className="font-extrabold">{formatCurrency(customCat.amount)}</span>
                  </div>
                ))}

                <div className="flex justify-between text-slate-700">
                  <span>└── Other Direct Project Expenses</span>
                  <span className="font-bold">{formatCurrency(currentPL.otherDirectExpenses)}</span>
                </div>
              </div>
              <div className="flex justify-between font-extrabold text-rose-900 pt-2 border-t border-slate-200 text-xs">
                <span>└── TOTAL DIRECT EXPENSES</span>
                <span className="font-black text-rose-800">-{formatCurrency(currentPL.totalDirectExpenses)}</span>
              </div>
            </div>

            {/* GROSS PROFIT SECTION */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between text-sm font-black text-slate-900 font-sans">
                <span>GROSS PROJECT PROFIT</span>
                <span className={currentPL.grossProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                  {formatCurrency(currentPL.grossProfit)}
                </span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-600 font-sans">
                <span>GROSS MARGIN PERCENTAGE</span>
                <span>{currentPL.grossMarginPercent.toFixed(2)}%</span>
              </div>
            </div>

            {/* INDIRECT OVERHEADS */}
            <div className="space-y-2">
              <h4 className="font-sans font-black text-sm text-purple-900 uppercase border-b border-purple-100 pb-1">
                3. INDIRECT / ALLOCATED OVERHEADS
              </h4>
              <div className="pl-4 space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span>└── Allocated Corporate Overheads (10%)</span>
                  <span className="font-bold">-{formatCurrency(currentPL.allocatedOverheads)}</span>
                </div>
              </div>
            </div>

            {/* NET PROFIT SECTION */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 rounded-2xl text-white space-y-2 font-sans">
              <div className="flex justify-between text-lg font-black">
                <span>NET PROJECT PROFIT</span>
                <span className={currentPL.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {formatCurrency(currentPL.netProfit)}
                </span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>NET PROJECT MARGIN</span>
                <span className="text-purple-300 font-mono text-sm">{currentPL.netMarginPercent.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROJECT DIRECT EXPENSES LIST */}
      {activeTab === 'EXPENSES' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rose-600" /> Direct Project Expenses ({currentProjectExpenses.length})
              </h3>
              <p className="text-xs text-slate-500 font-medium">Expenses assigned directly or allocated via multi-project split to {currentPL.projectName}.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search expenses by title, category, vendor..."
                  value={expSearchQuery}
                  onChange={(e) => setExpSearchQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 font-bold outline-none focus:bg-white w-64"
                />
              </div>

              <button
                onClick={() => {
                  setExpTitle('');
                  setExpPaidTo(currentPL.clientCompany || '');
                  setShowLogExpenseModal(true);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-600/20"
              >
                <Plus className="w-4 h-4" /> + Log New Project Expense
              </button>
            </div>
          </div>

          {(() => {
            const filteredExp = currentProjectExpenses.filter(e => {
              if (!expSearchQuery) return true;
              const q = expSearchQuery.toLowerCase();
              return (
                (e.id || '').toLowerCase().includes(q) ||
                (e.title || '').toLowerCase().includes(q) ||
                (e.category || '').toLowerCase().includes(q) ||
                (e.paidTo || '').toLowerCase().includes(q) ||
                (e.notes || '').toLowerCase().includes(q)
              );
            });

            const totalExpSum = filteredExp.reduce((sum, e) => {
              let projAllocAmount = e.amount;
              if (e.isMultiProject && e.allocations) {
                const alloc = e.allocations.find(a => a.projectId === selectedProjectId || a.projectCode === currentPL.projectCode);
                if (alloc) projAllocAmount = alloc.amount;
              }
              return sum + projAllocAmount;
            }, 0);

            return (
              <div className="overflow-x-auto overflow-y-auto max-h-[450px] custom-scrollbar rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-extrabold uppercase text-[10px] sticky top-0 z-10">
                    <tr>
                      <th className="p-3">Expense ID</th>
                      <th className="p-3">Title</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Vendor / Paid To</th>
                      <th className="p-3">Allocation Type</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Project Amount</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredExp.map(exp => {
                      let projAllocAmount = exp.amount;
                      if (exp.isMultiProject && exp.allocations) {
                        const alloc = exp.allocations.find(a => a.projectId === selectedProjectId || a.projectCode === currentPL.projectCode);
                        if (alloc) projAllocAmount = alloc.amount;
                      }

                      return (
                        <tr key={exp.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-blue-700">{exp.id}</td>
                          <td className="p-3 font-bold text-slate-900">{exp.title}</td>
                          <td className="p-3"><span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold border border-slate-200">{exp.category}</span></td>
                          <td className="p-3 text-slate-700">{exp.paidTo}</td>
                          <td className="p-3">
                            {exp.isMultiProject ? (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-[10px] font-extrabold border border-purple-200">
                                Multi-Project Split
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-extrabold border border-blue-200">
                                100% Single Project
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono text-slate-500">{exp.date}</td>
                          <td className="p-3 text-right font-mono font-black text-rose-700">-{formatCurrency(projAllocAmount)}</td>
                          <td className="p-3 text-right flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleStartEditExpense(exp)}
                              className="text-slate-400 hover:text-blue-600 p-1 transition"
                              title="Edit Expense"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete expense "${exp.title}" (${formatCurrency(exp.amount)})?`)) {
                                  deleteExpense(exp.id);
                                }
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1 transition"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredExp.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-slate-400 italic">
                          No direct expenses found matching your query. Click "+ Log New Project Expense" to log expenses.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {filteredExp.length > 0 && (
                    <tfoot className="bg-slate-900 text-white font-mono font-black text-xs sticky bottom-0 z-10">
                      <tr>
                        <td colSpan={6} className="p-3 font-sans uppercase">TOTAL DIRECT PROJECT EXPENSES ({filteredExp.length} ITEMS)</td>
                        <td className="p-3 text-right text-rose-300">-{formatCurrency(totalExpSum)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 3: COMPANY-WIDE CONSOLIDATED P&L */}
      {activeTab === 'COMPANY_PL' && (() => {
        const filteredProjects = companyPL.projectBreakdown.filter(p => {
          if (!companySearchQuery) return true;
          const q = companySearchQuery.toLowerCase();
          return (
            p.projectCode.toLowerCase().includes(q) ||
            p.projectName.toLowerCase().includes(q) ||
            p.clientCompany.toLowerCase().includes(q)
          );
        });

        const totalInvoiced = filteredProjects.reduce((sum, p) => sum + p.invoicedRevenue, 0);
        const totalCash = filteredProjects.reduce((sum, p) => sum + p.cashReceived, 0);
        const totalDue = filteredProjects.reduce((sum, p) => sum + p.receivableBalance, 0);
        const totalExpenses = filteredProjects.reduce((sum, p) => sum + p.totalDirectExpenses, 0);
        const totalNetProfit = filteredProjects.reduce((sum, p) => sum + p.netProfit, 0);
        const avgMargin = totalInvoiced > 0 ? (totalNetProfit / totalInvoiced) * 100 : 0;

        return (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-purple-600" /> Company-Wide Aggregated Profit & Loss ({filteredProjects.length})
                </h3>
                <p className="text-xs text-slate-500 font-medium">Consolidated view of all active projects + general company overheads.</p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search company projects by client or project..."
                  value={companySearchQuery}
                  onChange={(e) => setCompanySearchQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 font-bold outline-none focus:bg-white w-64"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <span className="text-[10px] font-black text-blue-700 uppercase block">TOTAL COMPANY REVENUE</span>
                <p className="text-xl font-mono font-black text-blue-900 mt-1">{formatCurrency(companyPL.totalInvoicedRevenue)}</p>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <span className="text-[10px] font-black text-amber-700 uppercase block">DIRECT PROJECT EXPENSES</span>
                <p className="text-xl font-mono font-black text-amber-900 mt-1">{formatCurrency(companyPL.totalProjectDirectExpenses)}</p>
              </div>

              <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
                <span className="text-[10px] font-black text-rose-700 uppercase block">COMPANY OVERHEADS</span>
                <p className="text-xl font-mono font-black text-rose-900 mt-1">{formatCurrency(companyPL.totalCompanyOverheads)}</p>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-black text-emerald-700 uppercase block">NET COMPANY PROFIT</span>
                <p className="text-xl font-mono font-black text-emerald-900 mt-1">{formatCurrency(companyPL.netCompanyProfit)}</p>
              </div>
            </div>

            {/* Comparative Projects Matrix Table */}
            <div className="overflow-x-auto overflow-y-auto max-h-[450px] custom-scrollbar rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white uppercase font-extrabold text-[10px] sticky top-0 z-10">
                  <tr>
                    <th className="p-3">Project Code & Name</th>
                    <th className="p-3">Client Company</th>
                    <th className="p-3 text-right">Invoiced Revenue</th>
                    <th className="p-3 text-right">Cash Received</th>
                    <th className="p-3 text-right">Receivable Due</th>
                    <th className="p-3 text-right">Direct Expenses</th>
                    <th className="p-3 text-right">Net Profit</th>
                    <th className="p-3 text-center">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredProjects.map(proj => (
                    <tr key={proj.projectId} className="hover:bg-slate-50">
                      <td className="p-3 font-sans font-extrabold text-blue-700">{proj.projectCode} • {proj.projectName}</td>
                      <td className="p-3 font-sans text-slate-800">{proj.clientCompany}</td>
                      <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(proj.invoicedRevenue)}</td>
                      <td className="p-3 text-right text-emerald-700">{formatCurrency(proj.cashReceived)}</td>
                      <td className="p-3 text-right text-rose-700">{formatCurrency(proj.receivableBalance)}</td>
                      <td className="p-3 text-right text-rose-700">{formatCurrency(proj.totalDirectExpenses)}</td>
                      <td className={`p-3 text-right font-black ${proj.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {formatCurrency(proj.netProfit)}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${proj.netProfit >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {proj.netMarginPercent.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredProjects.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-400 italic font-sans">
                        No company projects found matching your query.
                      </td>
                    </tr>
                  )}
                </tbody>
                {filteredProjects.length > 0 && (
                  <tfoot className="bg-slate-900 text-white font-mono font-black text-xs sticky bottom-0 z-10">
                    <tr>
                      <td colSpan={2} className="p-3 font-sans uppercase">GRAND TOTALS ({filteredProjects.length} PROJECTS)</td>
                      <td className="p-3 text-right text-blue-300">{formatCurrency(totalInvoiced)}</td>
                      <td className="p-3 text-right text-emerald-300">+{formatCurrency(totalCash)}</td>
                      <td className="p-3 text-right text-amber-300">{formatCurrency(totalDue)}</td>
                      <td className="p-3 text-right text-rose-300">-{formatCurrency(totalExpenses)}</td>
                      <td className="p-3 text-right text-indigo-300">{formatCurrency(totalNetProfit)}</td>
                      <td className="p-3 text-center">
                        <span className="bg-emerald-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black">
                          {avgMargin.toFixed(1)}% AVG
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        );
      })()}

      {/* TAB 4: PROJECT COST & BUDGET VARIANCE MATRIX */}
      {activeTab === 'COST_MATRIX' && (() => {
        const allRowData = companyPL.projectBreakdown.map(proj => {
          const projExpList = expenses.filter(e => {
            if (e.isMultiProject && e.allocations) {
              return e.allocations.some(a => a.projectId === proj.projectId || a.projectCode === proj.projectCode);
            }
            return e.projectId === proj.projectId || e.projectCode === proj.projectCode || (e.paidTo && proj.clientCompany && e.paidTo.toLowerCase().trim() === proj.clientCompany.toLowerCase().trim());
          });

          const getCatSum = (keywords: string[]) => {
            return projExpList.reduce((sum, e) => {
              const cLower = (e.category || '').toLowerCase();
              if (keywords.some(kw => cLower.includes(kw))) {
                if (e.isMultiProject && e.allocations) {
                  const alloc = e.allocations.find(a => a.projectId === proj.projectId || a.projectCode === proj.projectCode);
                  return sum + (alloc ? alloc.amount : 0);
                }
                return sum + e.amount;
              }
              return sum;
            }, 0);
          };

          const travel = getCatSum(['travel', 'field', 'cab', 'flight', 'lodging', 'hotel', 'accommodation']);
          const marketing = getCatSum(['marketing', 'lead', 'adwords', 'advertising', 'event']);
          const depreciation = getCatSum(['depreciation', 'asset', 'equipment', 'amortization']);
          const wellbeing = getCatSum(['wellbeing', 'perk', 'health', 'benefit', 'food', 'snack', 'team']);
          const personnel = proj.employeeCost || getCatSum(['personnel', 'employee', 'salaries', 'payroll', 'resource']);

          const actualSpends = proj.totalDirectExpenses;
          const projectValue = proj.invoicedRevenue;
          const balance = projectValue - actualSpends;

          return { proj, travel, marketing, depreciation, wellbeing, personnel, actualSpends, projectValue, balance };
        });

        const filteredRowData = allRowData.filter(({ proj }) => {
          if (!matrixSearchQuery) return true;
          const q = matrixSearchQuery.toLowerCase();
          return (
            proj.projectCode.toLowerCase().includes(q) ||
            proj.projectName.toLowerCase().includes(q) ||
            proj.clientCompany.toLowerCase().includes(q)
          );
        });

        let grandTravel = 0;
        let grandMarketing = 0;
        let grandDepreciation = 0;
        let grandWellbeing = 0;
        let grandPersonnel = 0;
        let grandActualSpends = 0;
        let grandProjectValue = 0;

        filteredRowData.forEach(r => {
          grandTravel += r.travel;
          grandMarketing += r.marketing;
          grandDepreciation += r.depreciation;
          grandWellbeing += r.wellbeing;
          grandPersonnel += r.personnel;
          grandActualSpends += r.actualSpends;
          grandProjectValue += r.projectValue;
        });

        const grandBalance = grandProjectValue - grandActualSpends;

        return (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3 shrink-0">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-indigo-600" /> Project Cost Breakdown & Category Spend Matrix ({filteredRowData.length})
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Project-wise spend breakdown for Travel, Marketing, Depreciation, Wellbeing, and Personnel.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search matrix by client or project..."
                    value={matrixSearchQuery}
                    onChange={(e) => setMatrixSearchQuery(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 font-bold outline-none focus:bg-white w-64"
                  />
                </div>

                <button
                  onClick={() => exportToPDFPrint('Project_Cost_Budget_Matrix', 'cost-matrix-table')}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-extrabold rounded-xl border border-blue-200 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Export PDF
                </button>
              </div>
            </div>

            {/* Category Spend Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 shrink-0">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <span className="text-[10px] font-black text-amber-800 uppercase block">TOTAL TRAVEL SPEND</span>
                <p className="text-lg font-mono font-black text-amber-900 mt-0.5">{formatCurrency(grandTravel)}</p>
              </div>

              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200">
                <span className="text-[10px] font-black text-indigo-800 uppercase block">TOTAL MARKETING SPEND</span>
                <p className="text-lg font-mono font-black text-indigo-900 mt-0.5">{formatCurrency(grandMarketing)}</p>
              </div>

              <div className="bg-slate-100 p-3 rounded-xl border border-slate-300">
                <span className="text-[10px] font-black text-slate-700 uppercase block">TOTAL DEPRECIATION</span>
                <p className="text-lg font-mono font-black text-slate-900 mt-0.5">{formatCurrency(grandDepreciation)}</p>
              </div>

              <div className="bg-pink-50 p-3 rounded-xl border border-pink-200">
                <span className="text-[10px] font-black text-pink-800 uppercase block">TOTAL WELLBEING SPEND</span>
                <p className="text-lg font-mono font-black text-pink-900 mt-0.5">{formatCurrency(grandWellbeing)}</p>
              </div>

              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                <span className="text-[10px] font-black text-blue-800 uppercase block">TOTAL SALARIES & PERSONNEL</span>
                <p className="text-lg font-mono font-black text-blue-900 mt-0.5">{formatCurrency(grandPersonnel)}</p>
              </div>
            </div>

            {/* Expenses Console / Scrollable Table Container */}
            <div className="overflow-x-auto overflow-y-auto max-h-[450px] custom-scrollbar rounded-xl border border-slate-200">
              <table id="cost-matrix-table" className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white uppercase font-extrabold text-[10px] sticky top-0 z-10">
                  <tr>
                    <th className="p-3">Project Code & Name</th>
                    <th className="p-3">Client Company</th>
                    <th className="p-3 text-right text-amber-300">Travel Expenses</th>
                    <th className="p-3 text-right text-indigo-300">Marketing</th>
                    <th className="p-3 text-right text-slate-300">Depreciation</th>
                    <th className="p-3 text-right text-pink-300">Employee Wellbeing</th>
                    <th className="p-3 text-right text-blue-300">Personnel / Salaries</th>
                    <th className="p-3 text-right bg-rose-950 text-rose-300">Actual Spends</th>
                    <th className="p-3 text-right bg-blue-950 text-blue-300">Project Value</th>
                    <th className="p-3 text-center bg-slate-800">Surplus / Deficit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredRowData.map(({ proj, travel, marketing, depreciation, wellbeing, personnel, actualSpends, projectValue, balance }) => {
                    const isSurplus = balance >= 0;
                    return (
                      <tr key={proj.projectId} className="hover:bg-slate-50">
                        <td className="p-3 font-sans font-extrabold text-blue-700">{proj.projectCode} • {proj.projectName}</td>
                        <td className="p-3 font-sans text-slate-800">{proj.clientCompany}</td>
                        <td className="p-3 text-right text-amber-700 font-bold">{formatCurrency(travel)}</td>
                        <td className="p-3 text-right text-indigo-700 font-bold">{formatCurrency(marketing)}</td>
                        <td className="p-3 text-right text-slate-600">{formatCurrency(depreciation)}</td>
                        <td className="p-3 text-right text-pink-700 font-bold">{formatCurrency(wellbeing)}</td>
                        <td className="p-3 text-right text-blue-700 font-bold">{formatCurrency(personnel)}</td>
                        <td className="p-3 text-right font-black text-rose-700 bg-rose-50/50">{formatCurrency(actualSpends)}</td>
                        <td className="p-3 text-right font-black text-blue-800 bg-blue-50/50">{formatCurrency(projectValue)}</td>
                        <td className="p-3 text-center bg-slate-50">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black inline-flex items-center gap-1 ${
                            isSurplus ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {isSurplus ? `+${formatCurrency(balance)} Surplus` : `${formatCurrency(balance)} Deficit`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRowData.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-400 font-medium italic">
                        No matrix entries found matching your query.
                      </td>
                    </tr>
                  )}
                </tbody>
                {filteredRowData.length > 0 && (
                  <tfoot className="bg-slate-900 text-white font-mono font-black text-xs sticky bottom-0 z-10">
                    <tr>
                      <td colSpan={2} className="p-3 font-sans uppercase tracking-wider text-[11px] text-slate-200">GRAND TOTALS ({filteredRowData.length} PROJECTS)</td>
                      <td className="p-3 text-right text-amber-300">{formatCurrency(grandTravel)}</td>
                      <td className="p-3 text-right text-indigo-300">{formatCurrency(grandMarketing)}</td>
                      <td className="p-3 text-right text-slate-300">{formatCurrency(grandDepreciation)}</td>
                      <td className="p-3 text-right text-pink-300">{formatCurrency(grandWellbeing)}</td>
                      <td className="p-3 text-right text-blue-300">{formatCurrency(grandPersonnel)}</td>
                      <td className="p-3 text-right text-rose-300 bg-rose-950">{formatCurrency(grandActualSpends)}</td>
                      <td className="p-3 text-right text-blue-300 bg-blue-950">{formatCurrency(grandProjectValue)}</td>
                      <td className="p-3 text-center bg-slate-950">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                          grandBalance >= 0 ? 'bg-emerald-400 text-slate-950' : 'bg-rose-400 text-slate-950'
                        }`}>
                          {grandBalance >= 0 ? `+${formatCurrency(grandBalance)} Net Surplus` : `${formatCurrency(grandBalance)} Net Deficit`}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* All Companies & Projects Audit Verification Section */}
            <div className="pt-4 border-t border-slate-200 space-y-3 shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600" /> Client Companies & Project Contract Verification Audit ({filteredRowData.length})
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Verified breakdown of every company we have worked with, including invoice contracts, category spends, and net yield.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto custom-scrollbar pr-1">
                {filteredRowData.map(({ proj, travel, marketing, depreciation, wellbeing, personnel, actualSpends, projectValue, balance }) => {
                  const isSurplus = balance >= 0;
                  return (
                    <div key={proj.projectId} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-black text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded border border-blue-200 uppercase font-mono">
                            {proj.projectCode}
                          </span>
                          <h5 className="text-xs font-black text-slate-900 mt-1">{proj.clientCompany}</h5>
                          <p className="text-[11px] font-bold text-slate-600">{proj.projectName}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          isSurplus ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {isSurplus ? `+${formatCurrency(balance)} Surplus` : `${formatCurrency(balance)} Deficit`}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono pt-1.5 border-t border-slate-200/80">
                        <div className="bg-white p-1.5 rounded border border-slate-200">
                          <span className="text-[8.5px] font-bold text-slate-400 block font-sans uppercase">Contract Value</span>
                          <p className="font-extrabold text-blue-900">{formatCurrency(projectValue)}</p>
                        </div>
                        <div className="bg-white p-1.5 rounded border border-slate-200">
                          <span className="text-[8.5px] font-bold text-slate-400 block font-sans uppercase">Actual Spends</span>
                          <p className="font-extrabold text-rose-900">{formatCurrency(actualSpends)}</p>
                        </div>
                        <div className="bg-white p-1.5 rounded border border-slate-200">
                          <span className="text-[8.5px] font-bold text-slate-400 block font-sans uppercase">Cash Received</span>
                          <p className="font-extrabold text-emerald-900">{formatCurrency(proj.cashReceived)}</p>
                        </div>
                      </div>

                      {/* Cost Category Breakdown List */}
                      <div className="flex flex-wrap gap-1 text-[9px] font-bold">
                        <span className="bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200">✈️ Travel: {formatCurrency(travel)}</span>
                        <span className="bg-indigo-50 text-indigo-900 px-1.5 py-0.5 rounded border border-indigo-200">📢 Marketing: {formatCurrency(marketing)}</span>
                        <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded border border-slate-300">📉 Depr: {formatCurrency(depreciation)}</span>
                        <span className="bg-pink-50 text-pink-900 px-1.5 py-0.5 rounded border border-pink-200">❤️ Wellbeing: {formatCurrency(wellbeing)}</span>
                        <span className="bg-blue-50 text-blue-900 px-1.5 py-0.5 rounded border border-blue-200">👥 Personnel: {formatCurrency(personnel)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* LOG DIRECT PROJECT EXPENSE MODAL */}
      {showLogExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-rose-600" /> Log Direct Project Expense
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Allocated to {currentPL.projectName} ({currentPL.projectCode})
                </p>
              </div>
              <button onClick={() => setShowLogExpenseModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleLogProjectExpenseSubmit} className="space-y-3.5 text-xs">
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                <span className="text-rose-900 font-extrabold block">Single-Entry Automatic Flow</span>
                <span className="text-rose-700 text-[11px]">
                  Logging an expense here instantly updates Finance Expenses, reduces Project & Corporate Net Profit, updates the Executive Dashboard, and posts to double-entry ledger.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-700 font-bold">Expense Category</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryModal(true)}
                      className="text-[11px] font-extrabold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5"
                    >
                      + Add Category
                    </button>
                  </div>
                  <select
                    value={expCategory}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        setShowAddCategoryModal(true);
                      } else {
                        setExpCategory(e.target.value);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    {expenseCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__ADD_NEW__" className="font-extrabold text-blue-700 bg-blue-50">
                      + Create Custom Category...
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Amount (INR ₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-black text-rose-800 text-sm focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Vendor / Paid To</label>
                  <input
                    type="text"
                    placeholder="e.g. Amazon Web Services, Freelance Engineer..."
                    value={expPaidTo}
                    onChange={(e) => setExpPaidTo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Expense Date</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Payment Status</label>
                  <select
                    value={expPaymentStatus}
                    onChange={(e) => setExpPaymentStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="PAID">PAID (Instant Outflow)</option>
                    <option value="PAYABLE">PAYABLE (Accounts Payable Bill)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Payment Method / Account</label>
                  <select
                    value={expBankAccountId}
                    onChange={(e) => setExpBankAccountId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 text-xs truncate"
                  >
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>{b.accountName} (#{b.accountNumber.slice(-4)})</option>
                    ))}
                    {bankAccounts.length === 0 && <option value="">Corporate Bank Account</option>}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Audit Notes / Description</label>
                <textarea
                  rows={2}
                  placeholder="Additional expense details..."
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowLogExpenseModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-md shadow-rose-600/20 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Log Expense & Sync Finance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CUSTOM EXPENSE CATEGORY MODAL */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" /> Create New Custom Expense Category
              </h3>
              <button onClick={() => setShowAddCategoryModal(false)} className="text-slate-400 hover:text-slate-700 text-lg font-bold">✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = newCategoryName.trim();
                if (!trimmed) return;
                addExpenseCategory(trimmed);
                setExpCategory(trimmed);
                setNewCategoryName('');
                setShowAddCategoryModal(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-bold mb-1">New Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI API Infrastructure, Server Hosting, SaaS Subscriptions..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-900 focus:bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  This new category will be permanently saved to your application and synced across MongoDB Atlas for future expense logging.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md shadow-blue-600/20"
                >
                  Save & Use Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
