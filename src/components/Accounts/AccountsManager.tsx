import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Payable, Expense, Currency } from '../../types';
import { exportToCSV, exportToPDFPrint } from '../../utils/exportUtils';
import {
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Building,
  Calendar,
  Clock,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Building2,
  Coins,
  Download,
  Printer,
  Search,
  MessageSquare,
  AlertTriangle,
  Ban,
  Trash2,
  Edit
} from 'lucide-react';

export const AccountsManager: React.FC = () => {
  const {
    documents,
    payments,
    writeOffs,
    receivableProvisions,
    payables,
    expenses,
    ledger,
    gstRecords,
    employees,
    payroll,
    addPayable,
    updatePayableStatus,
    addExpense,
    updateExpense,
    deleteExpense,
    updateLedgerEntry,
    deleteLedgerEntry,
    expenseCategories,
    addExpenseCategory,
    formatCurrency,
    getInvoiceTotalPaid,
    getInvoiceBalance,
    getReceivableSummary,
    getAgingReport,
    provisionReceivable,
    projectPLRecords
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'DASHBOARD' | 'RECEIVABLES' | 'AGING' | 'WRITEOFFS' | 'EXPENSES' | 'PAYABLES' | 'LEDGER' | 'GST' | 'COMPLIANCE' | 'CONSOLIDATED'>('EXPENSES');
  const [complianceType, setComplianceType] = useState<'ESI' | 'PF' | 'INCOME_TAX' | 'PROFESSIONAL_TAX' | 'FREELANCER_TAX'>('ESI');
  const [receivableFilter, setReceivableFilter] = useState<'ALL' | 'PENDING' | 'SETTLED' | 'OVERDUE'>('ALL');

  // Search & Date Range Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Expense Modal State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Expense['category']>('Infrastructure');
  const [amount, setAmount] = useState(45000);
  const [paidTo, setPaidTo] = useState('');
  const [paymentMode, setPaymentMode] = useState<Expense['paymentMode']>('Bank Transfer');
  const [officeLocation, setOfficeLocation] = useState<'India' | 'UAE' | 'Rwanda'>('India');
    // Expense Modal Advanced Allocation State
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PAYABLE'>('PAID');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('PROJ-001');
  const [isMultiProject, setIsMultiProject] = useState<boolean>(false);
  const [allocations, setAllocations] = useState<{ projectId: string; projectCode: string; projectName: string; amount: number; percentage: number }[]>([
    { projectId: 'PROJ-001', projectCode: 'PROJ-001', projectName: 'Website Platform', amount: 40000, percentage: 40 },
    { projectId: 'PROJ-002', projectCode: 'PROJ-002', projectName: 'Tokenization App', amount: 35000, percentage: 35 },
    { projectId: 'PROJ-003', projectCode: 'PROJ-003', projectName: 'AI Agent Engine', amount: 25000, percentage: 25 }
  ]);

  const [expenseDate, setExpenseDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Edit Expense State
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // Edit Ledger State
  const [editingLedgerId, setEditingLedgerId] = useState<string | null>(null);
  const [editLedgerDesc, setEditLedgerDesc] = useState('');
  const [editLedgerCategory, setEditLedgerCategory] = useState('');
  const [editLedgerAmount, setEditLedgerAmount] = useState(0);
  const [editLedgerDate, setEditLedgerDate] = useState('');
  const [showEditLedgerModal, setShowEditLedgerModal] = useState(false);

  const handleStartEditExpense = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setCategory(exp.category as any);
    setAmount(exp.amount);
    setTaxAmount(exp.taxAmount || 0);
    setPaidTo(exp.paidTo || '');
    setPaymentMode(exp.paymentMode || 'Bank Transfer');
    setPaymentStatus(exp.paymentStatus || 'PAID');
    setOfficeLocation(exp.officeLocation || 'India');
    setExpenseDate(exp.date || new Date().toISOString().split('T')[0]);
    if (exp.projectId) setSelectedProjectId(exp.projectId);
    setShowExpenseModal(true);
  };

  const handleStartEditLedger = (entry: any) => {
    setEditingLedgerId(entry.id);
    setEditLedgerDesc(entry.description);
    setEditLedgerCategory(entry.category);
    setEditLedgerAmount(entry.amount);
    setEditLedgerDate(entry.date);
    setShowEditLedgerModal(true);
  };

  const handleEditLedgerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLedgerId || editLedgerAmount <= 0) return;
    updateLedgerEntry(editingLedgerId, {
      description: editLedgerDesc,
      category: editLedgerCategory,
      amount: Number(editLedgerAmount),
      date: editLedgerDate
    });
    setEditingLedgerId(null);
    setShowEditLedgerModal(false);
  };

  // Payable Modal State
  const [showPayableModal, setShowPayableModal] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [payableCat, setPayableCat] = useState<Payable['category']>('Freelancer');
  const [payableAmount, setPayableAmount] = useState(50000);
  const [payableDesc, setPayableDesc] = useState('');

  // Provision Modal State
  const [showProvModal, setShowProvModal] = useState(false);
  const [selectedDocIdForProv, setSelectedDocIdForProv] = useState('');
  const [provAmount, setProvAmount] = useState(0);
  const [provReason, setProvReason] = useState('Delayed client payment expectation');
  const [provNotes, setProvNotes] = useState('');

  // Calculate Statutory Totals from Payroll Data
  const totalESI = payroll.reduce((sum, p) => sum + (p.esiDeduction || 0), 0);
  const totalPF = payroll.reduce((sum, p) => sum + (p.pfDeduction || 0), 0);
  const totalIncomeTax = payroll.reduce((sum, p) => sum + (p.incomeTaxDeduction || 0), 0);
  const totalPT = payroll.reduce((sum, p) => sum + (p.ptDeduction || 0), 0);
  const totalFreelancerTax = payroll.reduce((sum, p) => sum + (p.freelancerTaxDeduction || 0), 0);
  const grandTotalDeductions = totalESI + totalPF + totalIncomeTax + totalPT + totalFreelancerTax;

  const totalNetSalaryPaid = payroll.reduce((sum, p) => sum + (p.netPayable || 0), 0);

  const recSummary = getReceivableSummary();
  const agingReport = getAgingReport();

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = !searchTerm || 
      exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.paidTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDateFrom = !dateFrom || exp.date >= dateFrom;
    const matchesDateTo = !dateTo || exp.date <= dateTo;
    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const filteredLedger = ledger.filter(entry => {
    const matchesSearch = !searchTerm ||
      entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.debitAccount && entry.debitAccount.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.creditAccount && entry.creditAccount.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDateFrom = !dateFrom || entry.date >= dateFrom;
    const matchesDateTo = !dateTo || entry.date <= dateTo;
    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paidTo || amount <= 0) return;

    const projRecord = projectPLRecords.find(p => p.id === selectedProjectId || p.projectCode === selectedProjectId);
    const projCode = projRecord?.projectCode || selectedProjectId;

    if (editingExpenseId) {
      updateExpense(editingExpenseId, {
        title: category as string,
        category: category as any,
        amount: Number(amount),
        taxAmount: Number(taxAmount),
        totalAmount: Number(amount) + Number(taxAmount),
        currency: 'INR',
        date: expenseDate || new Date().toISOString().split('T')[0],
        paidTo,
        paymentMode,
        paymentStatus,
        officeLocation,
        projectId: isMultiProject ? undefined : selectedProjectId,
        projectCode: isMultiProject ? undefined : projCode,
        isMultiProject,
        allocations: isMultiProject ? allocations : [
          {
            projectId: selectedProjectId,
            projectCode: projCode,
            projectName: projRecord?.projectName || selectedProjectId,
            amount: Number(amount),
            percentage: 100
          }
        ]
      });
      setEditingExpenseId(null);
    } else {
      addExpense({
        title: category as string,
        category: category as any,
        amount: Number(amount),
        taxAmount: Number(taxAmount),
        totalAmount: Number(amount) + Number(taxAmount),
        currency: 'INR',
        date: expenseDate || new Date().toISOString().split('T')[0],
        paidTo,
        paymentMode,
        paymentStatus,
        officeLocation,
        projectId: isMultiProject ? undefined : selectedProjectId,
        projectCode: isMultiProject ? undefined : projCode,
        isMultiProject,
        allocations: isMultiProject ? allocations : [
          {
            projectId: selectedProjectId,
            projectCode: projCode,
            projectName: projRecord?.projectName || selectedProjectId,
            amount: Number(amount),
            percentage: 100
          }
        ]
      });
    }

    setTitle('');
    setPaidTo('');
    setTaxAmount(0);
    setShowExpenseModal(false);
  };

  const handlePayableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName) return;
    addPayable({
      vendorName,
      invoiceNumber: `BILL-${Date.now().toString().slice(-4)}`,
      category: payableCat,
      amount: Number(payableAmount),
      currency: 'INR',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'PENDING',
      description: payableDesc,
      officeLocation
    });
    setVendorName('');
    setPayableDesc('');
    setShowPayableModal(false);
  };

  const handleProvisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = documents.find(d => d.id === selectedDocIdForProv);
    if (!doc || provAmount <= 0) return;

    provisionReceivable({
      invoiceId: doc.id,
      invoiceNo: doc.docNumber,
      clientName: doc.clientName,
      clientCompany: doc.clientCompany,
      date: new Date().toISOString().split('T')[0],
      provisionAmount: provAmount,
      currency: doc.currency,
      reason: provReason,
      notes: provNotes
    });

    setShowProvModal(false);
    setSelectedDocIdForProv('');
  };

  return (
    <div className="space-y-6">
      {/* Module Header & Main Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" /> Accounts & Financial Accounting Suite
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Accounts Receivable Aging, Double-Entry Ledger, Bad Debt Write-Offs, Payables & Statutory Compliance.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {(['DASHBOARD', 'RECEIVABLES', 'AGING', 'WRITEOFFS', 'EXPENSES', 'PAYABLES', 'LEDGER', 'GST', 'COMPLIANCE', 'CONSOLIDATED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'COMPLIANCE' ? 'STATUTORY COMPLIANCE' : tab === 'WRITEOFFS' ? 'WRITE-OFFS' : tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Filter, Search & Export Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm no-print shrink-0">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, company, invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none w-64"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-slate-600">
            <span className="font-bold text-[10px] text-slate-400 uppercase">From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-slate-600">
            <span className="font-bold text-[10px] text-slate-400 uppercase">To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none"
            />
          </div>

          {(searchTerm || dateFrom || dateTo) && (
            <button
              onClick={() => { setSearchTerm(''); setDateFrom(''); setDateTo(''); }}
              className="text-rose-600 font-bold text-[11px] hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (activeSubTab === 'EXPENSES') {
                const headers = ['Title', 'Category', 'Amount (INR)', 'Paid To', 'Payment Mode', 'Date', 'Branch Office'];
                const rows = expenses.map(e => [e.title, e.category, e.amount, e.paidTo, e.paymentMode, e.date, e.officeLocation]);
                exportToCSV('Expenses_Report', headers, rows);
              } else if (activeSubTab === 'PAYABLES') {
                const headers = ['Vendor Name', 'Invoice Number', 'Category', 'Amount (INR)', 'Due Date', 'Status', 'Description', 'Branch'];
                const rows = payables.map(p => [p.vendorName, p.invoiceNumber, p.category, p.amount, p.dueDate, p.status, p.description || '', p.officeLocation]);
                exportToCSV('Accounts_Payable_Report', headers, rows);
              } else if (activeSubTab === 'RECEIVABLES') {
                const pendingDocs = documents.filter(d => d.docType === 'INVOICE');
                const headers = ['Invoice No', 'Client Company', 'Client Name', 'Phone', 'Issue Date', 'Total (INR)', 'Paid (INR)', 'Balance Pending', 'Status'];
                const rows = pendingDocs.map(d => [d.docNumber, d.clientCompany, d.clientName, d.clientPhone, d.issueDate, d.total, getInvoiceTotalPaid(d.id), getInvoiceBalance(d.id), d.status]);
                exportToCSV('Accounts_Receivable_Report', headers, rows);
              } else {
                const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Debit Account', 'Credit Account', 'Amount (INR)'];
                const rows = ledger.map(l => [l.id, l.date, l.type, l.category, l.description, l.debitAccount || '', l.creditAccount || '', l.amount]);
                exportToCSV('General_Ledger_Report', headers, rows);
              }
            }}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-extrabold flex items-center gap-1 border border-emerald-200 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
          </button>

          <button
            onClick={() => exportToPDFPrint(`Accounts_${activeSubTab}_Report`, 'accounts-table-print')}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-extrabold flex items-center gap-1 border border-blue-200 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" /> Print PDF
          </button>
        </div>
      </div>

      {/* 0. FINANCIAL DASHBOARD MODULE */}
      {activeSubTab === 'DASHBOARD' && (
        <div className="space-y-6 flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar" id="accounts-table-print">
          {/* Executive KPI Banner Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 shadow-xs">
              <span className="text-[10.5px] font-black text-emerald-800 uppercase tracking-wider block">REALIZED CASH INFLOW</span>
              <p className="text-2xl font-mono font-black text-emerald-950 mt-1">
                {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
              </p>
              <p className="text-xs text-emerald-700 font-medium mt-1">Total client payments received</p>
            </div>

            <div className="bg-rose-50 p-5 rounded-2xl border border-rose-200 shadow-xs">
              <span className="text-[10.5px] font-black text-rose-800 uppercase tracking-wider block">TOTAL OPERATING OUTFLOW</span>
              <p className="text-2xl font-mono font-black text-rose-950 mt-1">
                {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
              </p>
              <p className="text-xs text-rose-700 font-medium mt-1">Total business operating expenses</p>
            </div>

            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200 shadow-xs">
              <span className="text-[10.5px] font-black text-blue-800 uppercase tracking-wider block">ACCOUNTS RECEIVABLE</span>
              <p className="text-2xl font-mono font-black text-blue-950 mt-1">
                {formatCurrency(recSummary.totalReceivable)}
              </p>
              <p className="text-xs text-blue-700 font-medium mt-1">{recSummary.overdueReceivable > 0 ? `${formatCurrency(recSummary.overdueReceivable)} Overdue` : 'All invoices within credit period'}</p>
            </div>

            <div className="bg-purple-50 p-5 rounded-2xl border border-purple-200 shadow-xs">
              <span className="text-[10.5px] font-black text-purple-800 uppercase tracking-wider block">ACCOUNTS PAYABLE BILLEDS</span>
              <p className="text-2xl font-mono font-black text-purple-950 mt-1">
                {formatCurrency(payables.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0))}
              </p>
              <p className="text-xs text-purple-700 font-medium mt-1">Vendor bills pending payout</p>
            </div>
          </div>

          {/* Double-Entry Financial Summary Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" /> General Ledger Audit Summary & Cash Reserves
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-black text-slate-500 uppercase block">Total Debit Audit Volume</span>
                <p className="text-xl font-mono font-black text-slate-900 mt-1">
                  {formatCurrency(ledger.reduce((sum, l) => sum + l.amount, 0))}
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[10px] font-black text-amber-800 uppercase block">Pending Vendor Bills ({payables.filter(p => p.status === 'PENDING').length})</span>
                <p className="text-xl font-mono font-black text-amber-900 mt-1">
                  {formatCurrency(payables.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0))}
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-black text-emerald-800 uppercase block">Net Operating Reserve</span>
                <p className="text-xl font-mono font-black text-emerald-900 mt-1">
                  {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0) - expenses.reduce((sum, e) => sum + e.amount, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. RECEIVABLES MODULE */}
      {activeSubTab === 'RECEIVABLES' && (
        <div className="space-y-6 flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar" id="accounts-table-print">
          {/* Receivables Executive Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10.5px] font-black text-slate-500 uppercase block">Total Accounts Receivable</span>
              <p className="text-2xl font-mono font-black text-slate-900 mt-1">{formatCurrency(recSummary.totalReceivable)}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Outstanding active client balance</p>
            </div>

            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 shadow-sm">
              <span className="text-[10.5px] font-black text-rose-700 uppercase block">Overdue Receivables</span>
              <p className="text-2xl font-mono font-black text-rose-800 mt-1">{formatCurrency(recSummary.overdueReceivable)}</p>
              <p className="text-xs text-rose-600 font-medium mt-1">Past due payment date</p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-sm">
              <span className="text-[10.5px] font-black text-emerald-700 uppercase block">Current Receivables</span>
              <p className="text-2xl font-mono font-black text-emerald-800 mt-1">{formatCurrency(recSummary.currentReceivable)}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">Within agreed credit period</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 shadow-sm">
              <span className="text-[10.5px] font-black text-purple-700 uppercase block">Bad Debt Written Off</span>
              <p className="text-2xl font-mono font-black text-purple-800 mt-1">
                {formatCurrency(writeOffs.reduce((sum, w) => sum + w.amount, 0))}
              </p>
              <p className="text-xs text-purple-600 font-medium mt-1">{writeOffs.length} Invoices written off</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" /> Client Accounts Receivable Register
              </h3>
              <p className="text-xs text-slate-500 font-medium">Individual client invoice total, payments received to date, and remaining balance.</p>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setReceivableFilter('ALL')}
                className={`px-3 py-1 rounded-lg transition ${receivableFilter === 'ALL' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All Invoices
              </button>
              <button
                onClick={() => setReceivableFilter('PENDING')}
                className={`px-3 py-1 rounded-lg transition ${receivableFilter === 'PENDING' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Active Pending
              </button>
              <button
                onClick={() => setReceivableFilter('OVERDUE')}
                className={`px-3 py-1 rounded-lg transition ${receivableFilter === 'OVERDUE' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Overdue Only
              </button>
              <button
                onClick={() => setReceivableFilter('SETTLED')}
                className={`px-3 py-1 rounded-lg transition ${receivableFilter === 'SETTLED' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Fully Settled
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Invoice No</th>
                    <th className="p-3.5">Client Company & Contact</th>
                    <th className="p-3.5">Issue Date</th>
                    <th className="p-3.5 text-right">Invoice Total</th>
                    <th className="p-3.5 text-right">Total Paid</th>
                    <th className="p-3.5 text-right">Balance Due</th>
                    <th className="p-3.5 text-center">Due Date / Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {documents
                    .slice()
                    .reverse()
                    .filter(d => {
                      if (d.docType !== 'INVOICE') return false;
                      const paid = getInvoiceTotalPaid(d.id);
                      const bal = getInvoiceBalance(d.id);
                      
                      if (receivableFilter === 'PENDING' && (d.status === 'PAID' || bal <= 0 || d.status === 'UNCOLLECTIBLE')) return false;
                      if (receivableFilter === 'OVERDUE' && d.status !== 'OVERDUE') return false;
                      if (receivableFilter === 'SETTLED' && d.status !== 'PAID') return false;

                      const matchesSearch = !searchTerm ||
                        d.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        d.clientCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        d.clientName.toLowerCase().includes(searchTerm.toLowerCase());
                      return matchesSearch;
                    })
                    .map(doc => {
                      const paid = getInvoiceTotalPaid(doc.id);
                      const bal = getInvoiceBalance(doc.id);
                      const isPaid = doc.status === 'PAID' || bal === 0;

                      return (
                        <tr key={doc.id} className="hover:bg-slate-50 transition">
                          <td className="p-3.5 font-mono font-extrabold text-blue-700">{doc.docNumber}</td>
                          <td className="p-3.5">
                            <p className="font-extrabold text-slate-900">{doc.clientCompany}</p>
                            <p className="text-slate-500 text-[10.5px]">{doc.clientName} • {doc.clientPhone}</p>
                          </td>
                          <td className="p-3.5 font-mono text-slate-600">{doc.issueDate}</td>
                          <td className="p-3.5 text-right font-mono font-bold text-slate-900">{formatCurrency(doc.total)}</td>
                          <td className="p-3.5 text-right font-mono font-bold text-emerald-700">{formatCurrency(paid)}</td>
                          <td className="p-3.5 text-right font-mono font-black text-rose-700">{formatCurrency(bal)}</td>
                          <td className="p-3.5 text-center">
                            {isPaid ? (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-lg border border-emerald-300">
                                ✓ PAID / CLOSED
                              </span>
                            ) : doc.status === 'UNCOLLECTIBLE' || doc.status === 'UNRECOVERABLE' ? (
                              <span className="px-2.5 py-1 bg-purple-100 text-purple-800 font-extrabold text-[10px] rounded-lg border border-purple-300">
                                WRITTEN OFF
                              </span>
                            ) : doc.status === 'OVERDUE' ? (
                              <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-extrabold text-[10px] rounded-lg border border-rose-300">
                                OVERDUE ({doc.dueDate})
                              </span>
                            ) : (
                              <span className="font-mono font-bold text-slate-700 text-[11px]">
                                {doc.dueDate}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            {!isPaid && doc.status !== 'UNCOLLECTIBLE' && (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedDocIdForProv(doc.id);
                                    setProvAmount(bal);
                                    setShowProvModal(true);
                                  }}
                                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[10px] rounded border border-amber-200"
                                >
                                  Provision
                                </button>
                                <button
                                  onClick={() => {
                                    const text = encodeURIComponent(`Hello ${doc.clientName},\n\nPayment Reminder for Invoice *${doc.docNumber}* from *Aichainz*.\nOutstanding Balance: *${formatCurrency(bal)}*\nDue Date: *${doc.dueDate}*.\n\nPlease arrange payment.`);
                                    const cleanPhone = doc.clientPhone.replace(/[^0-9]/g, '');
                                    window.open(cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`, '_blank');
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 shadow-2xs"
                                >
                                  <MessageSquare className="w-3 h-3" /> Remind
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACCOUNTS RECEIVABLE AGING REPORT */}
      {activeSubTab === 'AGING' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" /> Accounts Receivable Aging Schedule
              </h3>
              <p className="text-xs text-slate-500 font-medium">Standard financial aging breakdown by overdue brackets: 0–30 Days, 31–60 Days, 61–90 Days, 90+ Days.</p>
            </div>

            {/* Aging Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <span className="text-[10px] font-black text-blue-700 uppercase block">0–30 Days Overdue</span>
                <p className="text-xl font-mono font-black text-blue-900 mt-1">{formatCurrency(recSummary.bracket0_30)}</p>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <span className="text-[10px] font-black text-amber-700 uppercase block">31–60 Days Overdue</span>
                <p className="text-xl font-mono font-black text-amber-900 mt-1">{formatCurrency(recSummary.bracket31_60)}</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                <span className="text-[10px] font-black text-orange-700 uppercase block">61–90 Days Overdue</span>
                <p className="text-xl font-mono font-black text-orange-900 mt-1">{formatCurrency(recSummary.bracket61_90)}</p>
              </div>

              <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
                <span className="text-[10px] font-black text-rose-700 uppercase block">90+ Days Overdue (High Risk)</span>
                <p className="text-xl font-mono font-black text-rose-900 mt-1">{formatCurrency(recSummary.bracket90plus)}</p>
              </div>
            </div>

            {/* Aging Report Detail Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Client Company</th>
                    <th className="p-3">Invoice No</th>
                    <th className="p-3 text-right">Invoice Total</th>
                    <th className="p-3 text-right">Paid</th>
                    <th className="p-3 text-right">Outstanding Balance</th>
                    <th className="p-3 text-center">Days Overdue</th>
                    <th className="p-3 text-center">Aging Bracket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {agingReport.map(item => (
                    <tr key={item.invoiceId} className="hover:bg-slate-50">
                      <td className="p-3 font-sans font-extrabold text-slate-900">{item.clientCompany}</td>
                      <td className="p-3 font-bold text-blue-700">{item.invoiceNo}</td>
                      <td className="p-3 text-right text-slate-700">{formatCurrency(item.invoiceTotal)}</td>
                      <td className="p-3 text-right text-emerald-700">{formatCurrency(item.totalPaid)}</td>
                      <td className="p-3 text-right font-black text-rose-700">{formatCurrency(item.balance)}</td>
                      <td className="p-3 text-center text-slate-800 font-bold">{item.daysOverdue} days</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          item.bracket === '90+' ? 'bg-rose-100 text-rose-800' :
                          item.bracket === '61-90' ? 'bg-orange-100 text-orange-800' :
                          item.bracket === '31-60' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.bracket} Days
                        </span>
                      </td>
                    </tr>
                  ))}
                  {agingReport.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400 italic font-sans">
                        ✓ No overdue invoices. All accounts receivable are within current due dates.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. BAD DEBT WRITE-OFFS & PROVISIONS */}
      {activeSubTab === 'WRITEOFFS' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Ban className="w-5 h-5 text-purple-600" /> Written-Off Bad Debts Register
                </h3>
                <p className="text-xs text-slate-500">Audit history of invoices determined to be uncollectible and written off to Bad Debt Expense.</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Write-Off ID</th>
                    <th className="p-3">Invoice No</th>
                    <th className="p-3">Client Company</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Performed By</th>
                    <th className="p-3 text-right">Written-Off Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {writeOffs.map(wo => (
                    <tr key={wo.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-purple-700">{wo.id}</td>
                      <td className="p-3 text-blue-700 font-bold">{wo.invoiceNo}</td>
                      <td className="p-3 font-sans font-bold text-slate-900">{wo.clientCompany}</td>
                      <td className="p-3 text-slate-600">{wo.date}</td>
                      <td className="p-3 font-sans"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">{wo.reason}</span></td>
                      <td className="p-3 font-sans text-slate-600">{wo.performedBy}</td>
                      <td className="p-3 text-right font-black text-purple-800">{formatCurrency(wo.amount)}</td>
                    </tr>
                  ))}
                  {writeOffs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400 italic font-sans">
                        No bad debt write-off records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. EXPENSES MANAGER */}
      {activeSubTab === 'EXPENSES' && (
        <div className="space-y-4 flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-rose-600" /> Business Operating Expenses
            </h3>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-rose-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Log Expense
            </button>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Title & Category</th>
                    <th className="p-3.5">Paid To</th>
                    <th className="p-3.5">Payment Mode</th>
                    <th className="p-3.5">Branch Office</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5 text-right">Amount</th>
                    <th className="p-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {filteredExpenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5">
                        <p className="font-extrabold text-slate-900">{exp.title}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-800 font-bold">{exp.paidTo}</td>
                      <td className="p-3.5 text-slate-600">{exp.paymentMode}</td>
                      <td className="p-3.5 text-slate-700 font-bold">{exp.officeLocation}</td>
                      <td className="p-3.5 text-slate-500 font-mono">{exp.date}</td>
                      <td className="p-3.5 text-right font-mono font-extrabold text-rose-700">
                        -{formatCurrency(exp.amount)}
                      </td>
                      <td className="p-3.5 text-center flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleStartEditExpense(exp)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Expense Entry"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete expense entry "${exp.title}" (${formatCurrency(exp.amount)})?`)) {
                              deleteExpense(exp.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Expense Entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredExpenses.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                        No expense records found matching current date / search filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. GENERAL LEDGER (DOUBLE-ENTRY) */}
      {activeSubTab === 'LEDGER' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" /> Double-Entry General Ledger
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Entry Type</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5">Debit Account</th>
                  <th className="p-3.5">Credit Account</th>
                  <th className="p-3.5 font-mono text-right">Amount</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {filteredLedger.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono text-slate-500">{entry.date}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        entry.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{entry.category}</td>
                    <td className="p-3.5 text-slate-800">{entry.description}</td>
                    <td className="p-3.5 font-bold text-slate-700">{entry.debitAccount || (entry.type === 'DEBIT' ? 'Expense / Asset' : 'Bank Account')}</td>
                    <td className="p-3.5 font-bold text-slate-700">{entry.creditAccount || (entry.type === 'CREDIT' ? 'Revenue Account' : 'Accounts Payable')}</td>
                    <td className={`p-3.5 text-right font-mono font-black ${
                      entry.type === 'CREDIT' ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {entry.type === 'CREDIT' ? '+' : '-'}{formatCurrency(entry.amount)}
                    </td>
                    <td className="p-3.5 text-center flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleStartEditLedger(entry)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit General Ledger Entry"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete ledger entry "${entry.description}"?`)) {
                            deleteLedgerEntry(entry.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete General Ledger Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredLedger.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                      No general ledger entries found matching current date / search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. ACCOUNTS PAYABLE MANAGER */}
      {activeSubTab === 'PAYABLES' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-600" /> Accounts Payable Vendor Register
              </h3>
              <p className="text-xs text-slate-500 font-medium">Manage pending vendor bills, contractor payments, and operational payables.</p>
            </div>
            <button
              onClick={() => setShowPayableModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-rose-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Log Vendor Bill
            </button>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Vendor / Payee</th>
                    <th className="p-3.5">Bill Number</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Due Date</th>
                    <th className="p-3.5">Branch Office</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 font-mono text-right">Amount</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {payables.map(pay => (
                    <tr key={pay.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-extrabold text-slate-900">{pay.vendorName}</td>
                      <td className="p-3.5 font-mono text-blue-700 font-bold">{pay.invoiceNumber}</td>
                      <td className="p-3.5 font-bold text-slate-700">{pay.category}</td>
                      <td className="p-3.5 font-mono text-rose-600 font-bold">{pay.dueDate}</td>
                      <td className="p-3.5 text-slate-700 font-bold">{pay.officeLocation}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black ${
                          pay.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {pay.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-black text-rose-700">{formatCurrency(pay.amount)}</td>
                      <td className="p-3.5 text-right">
                        {pay.status !== 'PAID' ? (
                          <button
                            onClick={() => updatePayableStatus(pay.id, 'PAID')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-xs"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-bold text-[11px]">✓ Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {payables.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-400 italic">
                        No accounts payable bills recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. GST TAX REGISTER */}
      {activeSubTab === 'GST' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-600" /> GST Tax Collected & Input Tax Credit Register
              </h3>
              <p className="text-xs text-slate-500 font-medium">CGST (9%) + SGST (9%) tax reserves collected from client invoices for filing.</p>
            </div>
            <div className="bg-purple-50 px-4 py-2 rounded-xl border border-purple-200 text-right">
              <span className="text-[10px] text-purple-700 font-black uppercase block">Total Tax Collected</span>
              <span className="text-lg font-mono font-black text-purple-900">{formatCurrency(gstRecords.reduce((sum, g) => sum + g.totalGST, 0))}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Invoice No</th>
                  <th className="p-3.5">Client Company</th>
                  <th className="p-3.5">GSTIN</th>
                  <th className="p-3.5 font-mono text-right">Taxable Value</th>
                  <th className="p-3.5 font-mono text-right">CGST (9%)</th>
                  <th className="p-3.5 font-mono text-right">SGST (9%)</th>
                  <th className="p-3.5 font-mono text-right">Total GST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {gstRecords.map(gst => (
                  <tr key={gst.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold text-blue-700">{gst.invoiceNo}</td>
                    <td className="p-3.5 font-sans font-extrabold text-slate-900">{gst.clientName}</td>
                    <td className="p-3.5 text-slate-500 font-bold">{gst.gstin}</td>
                    <td className="p-3.5 text-right text-slate-800 font-bold">{formatCurrency(gst.taxableValue)}</td>
                    <td className="p-3.5 text-right text-slate-600">{formatCurrency(gst.cgst)}</td>
                    <td className="p-3.5 text-right text-slate-600">{formatCurrency(gst.sgst)}</td>
                    <td className="p-3.5 text-right font-extrabold text-purple-700">{formatCurrency(gst.totalGST)}</td>
                  </tr>
                ))}
                {gstRecords.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400 italic font-sans">
                      No GST tax entries logged.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. STATUTORY COMPLIANCE MODULE */}
      {activeSubTab === 'COMPLIANCE' && (
        <div className="space-y-6">
          {/* Statutory Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div
              onClick={() => setComplianceType('ESI')}
              className={`p-4 rounded-2xl border cursor-pointer transition ${complianceType === 'ESI' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-800'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider block">ESI Contribution</span>
              <p className="text-xl font-mono font-black mt-1">{formatCurrency(totalESI)}</p>
              <p className="text-[10px] opacity-80 mt-1">0.75% Employee ESI</p>
            </div>

            <div
              onClick={() => setComplianceType('PF')}
              className={`p-4 rounded-2xl border cursor-pointer transition ${complianceType === 'PF' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-800'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider block">Provident Fund (PF)</span>
              <p className="text-xl font-mono font-black mt-1">{formatCurrency(totalPF)}</p>
              <p className="text-[10px] opacity-80 mt-1">12% Basic PF</p>
            </div>

            <div
              onClick={() => setComplianceType('INCOME_TAX')}
              className={`p-4 rounded-2xl border cursor-pointer transition ${complianceType === 'INCOME_TAX' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-800'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider block">Income Tax / TDS</span>
              <p className="text-xl font-mono font-black mt-1">{formatCurrency(totalIncomeTax)}</p>
              <p className="text-[10px] opacity-80 mt-1">TDS Withheld</p>
            </div>

            <div
              onClick={() => setComplianceType('PROFESSIONAL_TAX')}
              className={`p-4 rounded-2xl border cursor-pointer transition ${complianceType === 'PROFESSIONAL_TAX' ? 'bg-amber-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-800'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider block">Professional Tax</span>
              <p className="text-xl font-mono font-black mt-1">{formatCurrency(totalPT)}</p>
              <p className="text-[10px] opacity-80 mt-1">State Statutory PT</p>
            </div>

            <div
              onClick={() => setComplianceType('FREELANCER_TAX')}
              className={`p-4 rounded-2xl border cursor-pointer transition ${complianceType === 'FREELANCER_TAX' ? 'bg-rose-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-800'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider block">Contractor TDS</span>
              <p className="text-xl font-mono font-black mt-1">{formatCurrency(totalFreelancerTax)}</p>
              <p className="text-[10px] opacity-80 mt-1">10% 194J TDS</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-200 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Employee & Contractor Statutory Compliance Roster
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Employee Name</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5 font-mono text-right">Base Salary</th>
                    <th className="p-3.5 font-mono text-right">ESI</th>
                    <th className="p-3.5 font-mono text-right">PF</th>
                    <th className="p-3.5 font-mono text-right">Income Tax</th>
                    <th className="p-3.5 font-mono text-right">Prof Tax</th>
                    <th className="p-3.5 font-mono text-right">Contractor TDS</th>
                    <th className="p-3.5 font-mono text-right">Net Payable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {payroll.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-sans font-extrabold text-slate-900">{p.employeeName}</td>
                      <td className="p-3.5 font-sans font-bold text-slate-600">{p.employeeType}</td>
                      <td className="p-3.5 text-right text-slate-800 font-bold">{formatCurrency(p.baseAmount)}</td>
                      <td className="p-3.5 text-right text-blue-700">{formatCurrency(p.esiDeduction || 0)}</td>
                      <td className="p-3.5 text-right text-indigo-700">{formatCurrency(p.pfDeduction || 0)}</td>
                      <td className="p-3.5 text-right text-purple-700">{formatCurrency(p.incomeTaxDeduction || 0)}</td>
                      <td className="p-3.5 text-right text-amber-700">{formatCurrency(p.ptDeduction || 0)}</td>
                      <td className="p-3.5 text-right text-rose-700">{formatCurrency(p.freelancerTaxDeduction || 0)}</td>
                      <td className="p-3.5 text-right font-black text-emerald-700">{formatCurrency(p.netPayable)}</td>
                    </tr>
                  ))}
                  {payroll.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-400 italic font-sans">
                        No statutory payroll entries generated for current month.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 9. CONSOLIDATED FINANCIAL REPORT */}
      {activeSubTab === 'CONSOLIDATED' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-600" /> Month-wise Consolidated Financial Performance
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Fiscal Period</th>
                  <th className="p-3.5 font-mono text-right">Invoiced Revenue</th>
                  <th className="p-3.5 font-mono text-right">Cash Received (Realized)</th>
                  <th className="p-3.5 font-mono text-right">Receivable Due (Pending)</th>
                  <th className="p-3.5 font-mono text-right">Operating Outflow</th>
                  <th className="p-3.5 font-mono text-right">Net Profit</th>
                  <th className="p-3.5 font-mono text-right">GST Reserves</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {['2026-07', '2026-08', '2026-09'].map((mKey, idx) => {
                  const mLabel = mKey === '2026-07' ? 'July 2026' : mKey === '2026-08' ? 'August 2026' : 'September 2026';
                  const rev = documents.filter(d => d.docType === 'INVOICE' && (d.issueDate || '').startsWith(mKey)).reduce((sum, d) => sum + d.total, 0);
                  const monthInvoices = documents.filter(d => d.docType === 'INVOICE' && (d.issueDate || '').startsWith(mKey));
                  const cashReceived = payments.filter(p => (p.date || '').startsWith(mKey)).reduce((sum, p) => sum + p.amount, 0);
                  const recDue = monthInvoices.reduce((sum, d) => sum + getInvoiceBalance(d.id), 0);
                  const exp = expenses.filter(e => e.date.startsWith(mKey)).reduce((sum, e) => sum + e.amount, 0);
                  const gst = gstRecords.filter(g => (g.invoiceNo || '').includes(mKey)).reduce((sum, g) => sum + g.totalGST, 0);
                  const net = cashReceived - exp;

                  return (
                    <tr key={mKey} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-sans font-extrabold text-slate-900">{mLabel}</td>
                      <td className="p-3.5 text-right font-bold text-blue-700">{formatCurrency(rev)}</td>
                      <td className="p-3.5 text-right font-bold text-emerald-700">+{formatCurrency(cashReceived)}</td>
                      <td className="p-3.5 text-right font-bold text-amber-700">{formatCurrency(recDue)}</td>
                      <td className="p-3.5 text-right font-bold text-rose-700">-{formatCurrency(exp)}</td>
                      <td className={`p-3.5 text-right font-black ${net >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>{net >= 0 ? `+${formatCurrency(net)}` : formatCurrency(net)}</td>
                      <td className="p-3.5 text-right font-bold text-purple-700">{formatCurrency(gst)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      
      {/* EXPENSE ENTRY MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rose-600" /> Log Business Operating Expense
              </h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Chart of Accounts Category</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        const newCat = prompt('Enter New Custom Expense Category:');
                        if (newCat && newCat.trim()) {
                          addExpenseCategory(newCat.trim());
                          setCategory(newCat.trim() as any);
                        }
                      } else {
                        setCategory(e.target.value as any);
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
                  <label className="block text-slate-700 font-bold mb-1">Paid To / Vendor</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amazon Web Services EMEA"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-rose-50/60 p-3 rounded-xl border border-rose-200">
                <div>
                  <label className="block text-rose-900 font-bold mb-1">Net Expense Amount (INR)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-white border border-rose-300 rounded-xl p-2.5 font-mono font-black text-rose-900"
                  />
                </div>
                <div>
                  <label className="block text-rose-900 font-bold mb-1">GST / Tax (INR)</label>
                  <input
                    type="number"
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(Number(e.target.value))}
                    className="w-full bg-white border border-rose-300 rounded-xl p-2.5 font-mono font-bold text-rose-900"
                  />
                </div>
                <div>
                  <label className="block text-rose-950 font-extrabold mb-1">Total Outflow</label>
                  <div className="w-full bg-rose-100/80 border border-rose-300 rounded-xl p-2.5 font-mono font-black text-rose-950 text-sm">
                    {formatCurrency(Number(amount) + Number(taxAmount))}
                  </div>
                </div>
              </div>

              {/* PROJECT ALLOCATION SELECTOR */}
              <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-blue-950 font-extrabold">Project Allocation Rule</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsMultiProject(false)}
                      className={`px-2.5 py-1 rounded text-[10.5px] font-extrabold ${!isMultiProject ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border'}`}
                    >
                      Single Project (100%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMultiProject(true)}
                      className={`px-2.5 py-1 rounded text-[10.5px] font-extrabold ${isMultiProject ? 'bg-purple-600 text-white' : 'bg-white text-slate-700 border'}`}
                    >
                      Multi-Project Split
                    </button>
                  </div>
                </div>

                {!isMultiProject ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Project</label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full bg-white border border-blue-300 rounded-xl p-2 text-slate-900 font-bold"
                    >
                      {projectPLRecords.map(p => (
                        <option key={p.id} value={p.id}>{p.projectCode} • {p.projectName} ({p.clientCompany})</option>
                      ))}
                      {projectPLRecords.length === 0 && (
                        <option value="PROJ-001">PROJ-001 • Enterprise Platform Development</option>
                      )}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <p className="text-[10.5px] text-blue-900 font-bold">Split expense amount across active client projects:</p>
                    {allocations.map((alloc, idx) => (
                      <div key={alloc.projectId} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-blue-200 text-xs">
                        <span className="font-bold text-slate-900 w-36 truncate">{alloc.projectName}</span>
                        <input
                          type="number"
                          placeholder="Amount"
                          value={alloc.amount}
                          onChange={(e) => {
                            const newAlloc = [...allocations];
                            newAlloc[idx].amount = Number(e.target.value);
                            setAllocations(newAlloc);
                          }}
                          className="w-24 bg-slate-50 border border-slate-300 rounded p-1 font-mono font-bold text-right"
                        />
                        <span className="text-slate-500 font-mono text-[10px]">
                          ({amount > 0 ? ((alloc.amount / amount) * 100).toFixed(0) : 0}%)
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center text-[11px] font-mono pt-1">
                      <span className="text-slate-600">Total Allocated:</span>
                      <span className={allocations.reduce((s, a) => s + a.amount, 0) === amount ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'}>
                        {formatCurrency(allocations.reduce((s, a) => s + a.amount, 0))} / {formatCurrency(amount)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  >
                    <option value="PAID">PAID (Outflow Recorded)</option>
                    <option value="PAYABLE">PAYABLE (Vendor Bill)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Credit Card">Corporate Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-rose-600 text-white font-extrabold rounded-xl shadow-md">
                  Save & Post to Ledger & Project P&L
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* PROVISION MODAL */}
      {showProvModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Add Receivable Provision</h3>
              <button onClick={() => setShowProvModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleProvisionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Provision Amount (INR)</label>
                <input
                  type="number"
                  required
                  value={provAmount}
                  onChange={(e) => setProvAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Reason / Notes</label>
                <input
                  type="text"
                  required
                  value={provReason}
                  onChange={(e) => setProvReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowProvModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-600 text-white font-extrabold rounded-xl shadow-md">
                  Record Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VENDOR PAYABLE BILL MODAL */}
      {showPayableModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rose-600" /> Log Vendor Bill / Accounts Payable
              </h3>
              <button onClick={() => setShowPayableModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handlePayableSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Vendor / Payee Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Tech Consultants"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={payableCat}
                    onChange={(e) => setPayableCat(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  >
                    <option value="Freelancer">Freelancer</option>
                    <option value="Software License">Software License</option>
                    <option value="Office Rent">Office Rent</option>
                    <option value="Utility">Utility</option>
                    <option value="Subcontractor">Subcontractor</option>
                    <option value="Legal & Statutory">Legal & Statutory</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Bill Amount (INR)</label>
                  <input
                    type="number"
                    required
                    value={payableAmount}
                    onChange={(e) => setPayableAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description / Notes</label>
                <input
                  type="text"
                  placeholder="Brief details about vendor bill scope"
                  value={payableDesc}
                  onChange={(e) => setPayableDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowPayableModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-rose-600 text-white font-extrabold rounded-xl shadow-md">
                  Log Vendor Payable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LEDGER ENTRY MODAL */}
      {showEditLedgerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" /> Edit General Ledger Entry
              </h3>
              <button onClick={() => setShowEditLedgerModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleEditLedgerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={editLedgerDesc}
                  onChange={(e) => setEditLedgerDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={editLedgerCategory}
                  onChange={(e) => setEditLedgerCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Amount (INR)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editLedgerAmount}
                    onChange={(e) => setEditLedgerAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={editLedgerDate}
                    onChange={(e) => setEditLedgerDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditLedgerModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md shadow-blue-600/20"
                >
                  Update Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
