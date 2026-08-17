import { ProjectPLStudio } from './ProjectPLStudio';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProjectPLRecord, ProjectResource, DocumentItem } from '../../types';
import { exportToCSV, exportToPDFPrint } from '../../utils/exportUtils';
import {
  FolderKanban,
  BarChart3,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  Edit,
  Trash2,
  Calendar,
  Sparkles,
  PieChart,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Printer,
  Package,
  Download,
  Search
} from 'lucide-react';

interface ProjectExpenseItem {
  id: string;
  title: string;
  category: string;
  amount: number;
  paidTo: string;
  paymentMode: string;
  date: string;
}

export const ProjectPLManager: React.FC = () => {
  const {
    projectPLRecords,
    addProjectPLRecord,
    updateProjectPLRecord,
    deleteProjectPLRecord,
    addExpense,
    getInvoiceTotalPaid,
    leads,
    documents,
    employees,
    formatCurrency
  } = useApp();

    const [viewMode, setViewMode] = useState<'STUDIO' | 'REGISTER'>('STUDIO');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [projectCode, setProjectCode] = useState<string>(`PRJ-2026-0${projectPLRecords.length + 1}`);
  const [projectName, setProjectName] = useState<string>('');
  const [clientCompany, setClientCompany] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [status, setStatus] = useState<'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED'>('IN_PROGRESS');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [targetCompletionDate, setTargetCompletionDate] = useState<string>('');
  const [actualCompletionDate, setActualCompletionDate] = useState<string>('');

  const [quotedPrice, setQuotedPrice] = useState<number>(0);
  const [advanceCollected, setAdvanceCollected] = useState<number>(0);
  const [directExpenses, setDirectExpenses] = useState<number>(0);
  const [salaryCost, setSalaryCost] = useState<number>(0);

  // Direct Expenses Breakdown State
  const [expenseCategoriesList, setExpenseCategoriesList] = useState<string[]>([
    'API & Cloud',
    'Infrastructure',
    'Software License',
    'Sub-contractor',
    'Domain & Hosting',
    'Other'
  ]);
  const [projectExpensesList, setProjectExpensesList] = useState<ProjectExpenseItem[]>([]);
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<string>('API & Cloud');
  const [expAmount, setExpAmount] = useState<number>(15000);
  const [expPaidTo, setExpPaidTo] = useState('');
  const [expPaymentMode, setExpPaymentMode] = useState('Bank Transfer');
  const [expDate, setExpDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [totalDaysTaken, setTotalDaysTaken] = useState<number>(30);
  const [estimatedHours, setEstimatedHours] = useState<number>(200);
  const [actualHoursTaken, setActualHoursTaken] = useState<number>(180);
  const [notes, setNotes] = useState<string>('');

  // Scope & Line Items
  const [quotationItems, setQuotationItems] = useState<DocumentItem[]>([]);

  // Resources state
  const [resources, setResources] = useState<ProjectResource[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [resHours, setResHours] = useState<number>(40);

  // Filtered Records
  const filteredRecords = projectPLRecords.filter(r => {
    const matchesFilter = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch =
      r.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.clientCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.projectCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Consolidated Metrics
  const totalProjects = projectPLRecords.length;
  const totalQuotedRevenue = projectPLRecords.reduce((sum, r) => sum + r.quotedPrice, 0);
  const totalAdvance = projectPLRecords.reduce((sum, r) => sum + r.advanceCollected, 0);
  const totalExpenses = projectPLRecords.reduce((sum, r) => sum + r.directExpenses, 0);
  const totalSalaryCosts = projectPLRecords.reduce((sum, r) => sum + r.salaryCost, 0);
  const totalActualSpend = totalExpenses + totalSalaryCosts;
  const totalNetProfit = totalQuotedRevenue - totalActualSpend;
  const avgProfitPerProject = totalProjects > 0 ? Math.round(totalNetProfit / totalProjects) : 0;
  const avgMarginPercent = totalQuotedRevenue > 0 ? ((totalNetProfit / totalQuotedRevenue) * 100).toFixed(1) : '0';
  const avgMarkupPercent = totalActualSpend > 0 ? ((totalNetProfit / totalActualSpend) * 100).toFixed(1) : '0';

  const handleOpenAddModal = () => {
    setEditingId(null);
    setProjectCode(`PRJ-2026-0${projectPLRecords.length + 1}`);
    setProjectName('');
    setClientCompany('');
    setClientName('');
    setStatus('IN_PROGRESS');
    setStartDate(new Date().toISOString().split('T')[0]);
    setTargetCompletionDate('');
    setActualCompletionDate('');
    setQuotedPrice(0);
    setAdvanceCollected(0);
    setDirectExpenses(0);
    setSalaryCost(0);
    setProjectExpensesList([]);
    setExpTitle('');
    setExpPaidTo('');
    setTotalDaysTaken(30);
    setEstimatedHours(200);
    setActualHoursTaken(180);
    setQuotationItems([]);
    setResources([]);
    setNotes('');
    setShowModal(true);
  };

  const handleOpenEditModal = (rec: ProjectPLRecord) => {
    setEditingId(rec.id);
    setProjectCode(rec.projectCode);
    setProjectName(rec.projectName);
    setClientCompany(rec.clientCompany);
    setClientName(rec.clientName);
    setStatus(rec.status);
    setStartDate(rec.startDate);
    setTargetCompletionDate(rec.targetCompletionDate || '');
    setActualCompletionDate(rec.actualCompletionDate || '');
    setQuotedPrice(rec.quotedPrice);
    setAdvanceCollected(rec.advanceCollected);
    setDirectExpenses(rec.directExpenses);
    setSalaryCost(rec.salaryCost);
    setProjectExpensesList([]);
    setExpTitle('');
    setExpPaidTo('');
    setTotalDaysTaken(rec.totalDaysTaken);
    setEstimatedHours(rec.estimatedHours);
    setActualHoursTaken(rec.actualHoursTaken);
    setQuotationItems(rec.quotationItems || []);
    setResources(rec.resourcesInvolved || []);
    setNotes(rec.notes || '');
    setShowModal(true);
  };

  const handleAddResource = () => {
    const emp = employees.find(e => e.id === selectedEmpId);
    if (!emp) return;

    const rate = emp.type === 'FREELANCER' ? (emp.hourlyRate || 1000) : 500;
    const laborCost = resHours * rate;

    const newRes: ProjectResource = {
      employeeId: emp.id,
      name: emp.name,
      role: emp.designation,
      hoursAllocated: resHours,
      costRatePerHour: rate,
      totalLaborCost: laborCost
    };

    setResources([...resources, newRes]);
    setSalaryCost(prev => prev + laborCost);
  };

  const handleRemoveResource = (index: number) => {
    const res = resources[index];
    setSalaryCost(prev => Math.max(0, prev - res.totalLaborCost));
    setResources(resources.filter((_, i) => i !== index));
  };

  const handleAddProjectExpense = () => {
    if (!expTitle || !expAmount) return;

    const newExp: ProjectExpenseItem = {
      id: `PEXP-${Date.now().toString().slice(-4)}`,
      title: expTitle,
      category: expCategory,
      amount: Number(expAmount),
      paidTo: expPaidTo || clientCompany || 'Vendor',
      paymentMode: expPaymentMode,
      date: expDate || new Date().toISOString().split('T')[0]
    };

    const updatedList = [...projectExpensesList, newExp];
    setProjectExpensesList(updatedList);

    const newTotalDirect = updatedList.reduce((sum, item) => sum + item.amount, 0);
    setDirectExpenses(newTotalDirect);

    setExpTitle('');
    setExpAmount(15000);
    setExpPaidTo('');
  };

  const handleRemoveProjectExpense = (index: number) => {
    const updatedList = projectExpensesList.filter((_, i) => i !== index);
    setProjectExpensesList(updatedList);
    const newTotalDirect = updatedList.reduce((sum, item) => sum + item.amount, 0);
    setDirectExpenses(newTotalDirect);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const spend = directExpenses + salaryCost;
    const netProf = quotedPrice - spend;
    const margin = quotedPrice > 0 ? (netProf / quotedPrice) * 100 : 0;
    const markup = spend > 0 ? (netProf / spend) * 100 : 0;
    const balance = Math.max(0, quotedPrice - advanceCollected);

    const recordPayload: ProjectPLRecord = {
      id: editingId || `PPL-${Date.now()}`,
      projectCode,
      projectName,
      clientCompany,
      clientName,
      status,
      startDate,
      targetCompletionDate,
      actualCompletionDate: status === 'COMPLETED' ? (actualCompletionDate || new Date().toISOString().split('T')[0]) : undefined,
      quotedPrice,
      advanceCollected,
      balanceReceivable: balance,
      directExpenses,
      salaryCost,
      actualSpend: spend,
      netProfit: netProf,
      profitMarginPercent: Number(margin.toFixed(2)),
      markupPercent: Number(markup.toFixed(2)),
      quotationItems,
      totalDaysTaken,
      estimatedHours,
      actualHoursTaken,
      resourcesInvolved: resources,
      currency: 'INR',
      notes
    };

    if (editingId) {
      updateProjectPLRecord(recordPayload);
    } else {
      addProjectPLRecord(recordPayload);
    }

    if (projectExpensesList.length > 0) {
      projectExpensesList.forEach(exp => {
        addExpense({
          title: `[${projectCode}] ${exp.title}`,
          category: exp.category === 'API & Cloud' ? 'Infrastructure' : (exp.category as any),
          amount: exp.amount,
          currency: 'INR',
          date: exp.date,
          paidTo: exp.paidTo,
          paymentMode: (['Bank Transfer', 'UPI', 'Credit Card', 'Cash'].includes(exp.paymentMode) ? exp.paymentMode : 'Bank Transfer') as any,
          officeLocation: 'India',
          referenceNo: projectCode
        });
      });
    } else if (directExpenses > 0) {
      addExpense({
        title: `Project Direct Expenses - ${projectName} (${projectCode})`,
        category: 'Infrastructure',
        amount: directExpenses,
        currency: 'INR',
        date: startDate || new Date().toISOString().split('T')[0],
        paidTo: clientCompany || 'Project Vendor',
        paymentMode: 'Bank Transfer',
        officeLocation: 'India',
        referenceNo: projectCode
      });
    }

    setShowModal(false);
  };

  return (
        <div className="space-y-6">
      {/* View Mode Toggle Bar */}
      <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('STUDIO')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition ${
              viewMode === 'STUDIO' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Project P&L Studio & Company P&L
          </button>

          <button
            onClick={() => setViewMode('REGISTER')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition ${
              viewMode === 'REGISTER' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FolderKanban className="w-4 h-4" /> Projects Register & Resource Allocations
          </button>
        </div>
      </div>

      {viewMode === 'STUDIO' ? (
        <ProjectPLStudio />
      ) : (
        <>
          {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-600" /> Project-Wise Profit & Loss (Quoted vs Actual Spend)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Track What We Actually Quoted, Actual Project Spend, Net Profit, and Markup Profit Percentage %
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const headers = ['Project Code', 'Project Name', 'Client Company', 'Client Name', 'Status', 'Start Date', 'Quoted Price (INR)', 'Advance Collected', 'Direct Expenses', 'Labor/Salary Cost', 'Actual Spend', 'Net Profit', 'Profit Margin %', 'Markup %'];
              const rows = filteredRecords.map(r => [
                r.projectCode, r.projectName, r.clientCompany, r.clientName, r.status, r.startDate, r.quotedPrice, r.advanceCollected, r.directExpenses, r.salaryCost, r.actualSpend, r.netProfit, `${r.profitMarginPercent}%`, `${r.markupPercent}%`
              ]);
              exportToCSV('Project_Wise_PL_Report', headers, rows);
            }}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border border-emerald-200 shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Export Excel (.CSV)
          </button>

          <button
            onClick={() => exportToPDFPrint('Project-Wise Profit & Loss Report', 'project-pl-table-print')}
            className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border border-blue-200 shadow-2xs"
          >
            <Printer className="w-4 h-4 text-blue-600" /> Print / PDF
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" /> Create New Project P&L Record
          </button>
        </div>
      </div>

      {/* Top Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        {/* Card 1: Total Quoted Price */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-emerald-600">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10.5px] font-black uppercase text-emerald-700 tracking-wider">
              WHAT WE ACTUALLY QUOTED
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {formatCurrency(totalQuotedRevenue)}
          </h3>
          <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between text-[11px]">
            <span className="text-slate-500 font-bold">Advance Collected:</span>
            <span className="text-emerald-700 font-black font-mono">{formatCurrency(totalAdvance)}</span>
          </div>
        </div>

        {/* Card 2: Total Actual Spend */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-rose-600">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10.5px] font-black uppercase text-rose-700 tracking-wider">
              WHAT WE ACTUALLY SPENT
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-rose-900 font-mono tracking-tight">
            {formatCurrency(totalActualSpend)}
          </h3>
          <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between text-[11px]">
            <span className="text-slate-500 font-bold">Expenses / Labor:</span>
            <span className="text-slate-900 font-mono font-bold">
              {formatCurrency(totalExpenses)} / {formatCurrency(totalSalaryCosts)}
            </span>
          </div>
        </div>

        {/* Card 3: Net Project Profit */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-indigo-600">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10.5px] font-black uppercase text-indigo-700 tracking-wider">
              NET PROFIT GENERATED
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-indigo-900 font-mono tracking-tight">
            {formatCurrency(totalNetProfit)}
          </h3>
          <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between text-[11px]">
            <span className="text-slate-500 font-bold">Avg Margin / Markup:</span>
            <span className="text-indigo-700 font-black">{avgMarginPercent}% / +{avgMarkupPercent}%</span>
          </div>
        </div>

        {/* Card 4: Avg Profit Per Project */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-purple-600">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10.5px] font-black uppercase text-purple-700 tracking-wider">
              AVG PROFIT PER PROJECT
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-purple-900 font-mono tracking-tight">
            {formatCurrency(avgProfitPerProject)}
          </h3>
          <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between text-[11px]">
            <span className="text-slate-500 font-bold">Projects Tracked:</span>
            <span className="text-purple-800 font-black">{totalProjects} Active Projects</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div className="flex items-center gap-2">
          {['ALL', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search projects or clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Project Cards List */}
      <div className="space-y-4 no-print">
        {filteredRecords.map(rec => {
          const isProfitable = rec.netProfit >= 0;

          return (
            <div
              key={rec.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4"
            >
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-black text-xs rounded-lg font-mono border border-indigo-200">
                    {rec.projectCode}
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{rec.projectName}</h3>
                    <p className="text-xs text-slate-500 font-bold">{rec.clientCompany} • {rec.clientName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase ${
                    rec.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : rec.status === 'IN_PROGRESS'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {rec.status.replace('_', ' ')}
                  </span>

                  <button
                    onClick={() => handleOpenEditModal(rec)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 transition rounded-lg hover:bg-slate-50"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteProjectPLRecord(rec.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-slate-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Financial Metrics Comparison Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">What We Quoted</span>
                  <span className="font-mono font-black text-slate-900 text-sm">{formatCurrency(rec.quotedPrice)}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Advance Collected</span>
                  <span className="font-mono font-extrabold text-emerald-700 text-sm">{formatCurrency(rec.advanceCollected)}</span>
                  <span className="text-[9.5px] text-slate-500 block font-mono">Rem: {formatCurrency(rec.balanceReceivable)}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Direct Expenses</span>
                  <span className="font-mono font-bold text-rose-700 text-sm">{formatCurrency(rec.directExpenses)}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Allocated Labor Cost</span>
                  <span className="font-mono font-bold text-purple-700 text-sm">{formatCurrency(rec.salaryCost)}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">What We Actually Spent</span>
                  <span className="font-mono font-black text-rose-900 text-sm">{formatCurrency(rec.actualSpend)}</span>
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Net Profit / Loss</span>
                  <span className={`font-mono font-black text-sm block ${isProfitable ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {formatCurrency(rec.netProfit)}
                  </span>
                  <span className="text-[9.5px] font-black text-indigo-700 block">
                    {rec.profitMarginPercent}% Margin • +{rec.markupPercent}% Markup
                  </span>
                </div>
              </div>

              {/* Quotation Scope & Line Items Breakdown */}
              {rec.quotationItems && rec.quotationItems.length > 0 && (
                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-xs space-y-1.5">
                  <p className="text-[10px] font-extrabold text-indigo-900 uppercase flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-indigo-600" /> Quoted Line Items & Scope Deliverables
                  </p>
                  <div className="space-y-1">
                    {rec.quotationItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px] bg-white p-1.5 rounded border border-indigo-100">
                        <span className="font-medium text-slate-800">{item.description} ({item.serviceCategory || 'Service'})</span>
                        <span className="font-mono font-bold text-slate-900">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Time & Resources Row */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs pt-1">
                <div className="flex items-center gap-4 text-slate-600 font-bold">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Start: {rec.startDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> {rec.totalDaysTaken} Days ({rec.actualHoursTaken} / {rec.estimatedHours} Hrs)
                  </span>
                </div>

                {rec.resourcesInvolved && rec.resourcesInvolved.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10.5px] text-slate-500 font-bold">Team:</span>
                    {rec.resourcesInvolved.map((res: ProjectResource, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10.5px] font-extrabold text-slate-800">
                        {res.name} ({res.hoursAllocated}h)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal to Add / Edit Project P&L Record */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl shadow-2xl my-6">

            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-indigo-600" />
                {editingId ? 'Edit' : 'Create'} Project P&L Record — Quoted vs Actual Spend
              </h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">✕</button>
            </div>

            <form onSubmit={handleSave}>
              {/* Two-Column Body */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

                {/* LEFT COLUMN — Form Inputs (spans 2) */}
                <div className="lg:col-span-2 p-5 space-y-4 text-xs">

                  {/* Auto-Fill Banner */}
                  <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200 space-y-2">
                    <label className="block text-indigo-800 font-extrabold text-[11px] uppercase tracking-wide">
                      ⚡ Auto-Fill from Client Invoice
                    </label>
                    <select
                      onChange={(e) => {
                        const doc = documents.find(d => d.id === e.target.value);
                        if (doc) {
                          setClientCompany(doc.clientCompany);
                          setClientName(doc.clientName);
                          setProjectName(doc.items[0]?.description || `${doc.clientCompany} Software Project`);
                          setQuotedPrice(doc.total);
                          const actualPaid = getInvoiceTotalPaid(doc.id);
                          setAdvanceCollected(actualPaid > 0 ? actualPaid : (doc.advanceCollectedAmount || Math.round(doc.total * 0.5)));
                          setQuotationItems(doc.items || []);
                        }
                      }}
                      className="w-full bg-white border border-indigo-300 rounded-lg p-2 font-semibold text-slate-900 text-xs"
                    >
                      <option value="">Select a Client Invoice to auto-fill scope & pricing…</option>
                      {documents
                        .filter(d => d.docType === 'INVOICE')
                        .map(d => (
                          <option key={d.id} value={d.id}>
                            {d.docNumber} — {d.clientCompany} ({formatCurrency(d.total)})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Project Identity */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1 font-bold uppercase text-[10px] tracking-wide">Project Code</label>
                      <input type="text" required value={projectCode}
                        onChange={(e) => setProjectCode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-bold text-xs" />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-bold uppercase text-[10px] tracking-wide">Status</label>
                      <select value={status} onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold text-xs">
                        <option value="IN_PROGRESS">🔵 In Progress</option>
                        <option value="COMPLETED">✅ Completed</option>
                        <option value="ON_HOLD">⏸ On Hold</option>
                        <option value="CANCELLED">❌ Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-bold uppercase text-[10px] tracking-wide">Project Title / Description</label>
                    <input type="text" required value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold text-xs" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1 font-bold uppercase text-[10px] tracking-wide">Client Company</label>
                      <input type="text" required value={clientCompany}
                        onChange={(e) => setClientCompany(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold text-xs" />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-bold uppercase text-[10px] tracking-wide">Client Representative</label>
                      <input type="text" required value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold text-xs" />
                    </div>
                  </div>

                  {/* FINANCIALS */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-3 py-2 bg-slate-100 border-b border-slate-200">
                      <p className="font-extrabold text-slate-800 text-[10.5px] uppercase tracking-wide">💰 Quoted Price vs Actual Spend</p>
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-3">
                      <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                        <label className="block text-emerald-700 font-extrabold text-[10px] uppercase mb-1">What We Quoted (INR)</label>
                        <input type="number" required value={quotedPrice || ''}
                          onChange={(e) => setQuotedPrice(Number(e.target.value))}
                          placeholder="0"
                          className="w-full border-0 bg-transparent font-mono font-black text-slate-900 text-sm focus:outline-none" />
                      </div>
                      <div className="bg-white border border-emerald-200 rounded-lg p-2.5">
                        <label className="block text-emerald-700 font-extrabold text-[10px] uppercase mb-1">Advance Collected</label>
                        <input type="number" value={advanceCollected || ''}
                          onChange={(e) => setAdvanceCollected(Number(e.target.value))}
                          placeholder="0"
                          className="w-full border-0 bg-transparent font-mono font-bold text-emerald-800 text-sm focus:outline-none" />
                      </div>
                      <div className="bg-white border border-rose-200 rounded-lg p-2.5">
                        <label className="block text-rose-700 font-extrabold text-[10px] uppercase mb-1">Direct Expenses (Cloud/APIs)</label>
                        <input type="number" value={directExpenses || ''}
                          onChange={(e) => setDirectExpenses(Number(e.target.value))}
                          placeholder="0"
                          className="w-full border-0 bg-transparent font-mono font-bold text-rose-800 text-sm focus:outline-none" />
                      </div>
                      <div className="bg-white border border-purple-200 rounded-lg p-2.5">
                        <label className="block text-purple-700 font-extrabold text-[10px] uppercase mb-1">Allocated Labor / Salary Cost</label>
                        <input type="number" value={salaryCost || ''}
                          onChange={(e) => setSalaryCost(Number(e.target.value))}
                          placeholder="0"
                          className="w-full border-0 bg-transparent font-mono font-bold text-purple-800 text-sm focus:outline-none" />
                      </div>
                    </div>
                  </div>

                  {/* DIRECT PROJECT EXPENSES LOG (AUTO-SYNCS TO OPERATING EXPENSES & LEDGER) */}
                  <div className="bg-rose-50/60 rounded-xl border border-rose-200 overflow-hidden">
                    <div className="px-3 py-2 bg-rose-100/60 border-b border-rose-200 flex justify-between items-center">
                      <p className="font-extrabold text-rose-900 text-[10.5px] uppercase tracking-wide flex items-center gap-1.5">
                        💳 Direct Project Expenses Breakdown & Log (Auto-Syncs to Accounts & Ledger)
                      </p>
                      <span className="text-[10px] font-extrabold font-mono text-rose-800 bg-rose-200/60 px-2 py-0.5 rounded">
                        Total: {formatCurrency(directExpenses)}
                      </span>
                    </div>

                    <div className="p-3 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Expense title (e.g. AWS GPU Server)"
                          value={expTitle}
                          onChange={(e) => setExpTitle(e.target.value)}
                          className="bg-white border border-rose-200 rounded-lg p-2 font-bold text-slate-900 text-xs"
                        />
                        <select
                          value={expCategory}
                          onChange={(e) => {
                            if (e.target.value === '__ADD_NEW__') {
                              const custom = window.prompt('Enter new custom expense category title:');
                              if (custom && custom.trim()) {
                                const trimmed = custom.trim();
                                if (!expenseCategoriesList.includes(trimmed)) {
                                  setExpenseCategoriesList(prev => [...prev, trimmed]);
                                }
                                setExpCategory(trimmed);
                              }
                            } else {
                              setExpCategory(e.target.value);
                            }
                          }}
                          className="bg-white border border-rose-200 rounded-lg p-2 font-bold text-slate-900 text-xs"
                        >
                          {expenseCategoriesList.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="__ADD_NEW__">➕ Add Custom Category...</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Amount (INR)"
                          value={expAmount || ''}
                          onChange={(e) => setExpAmount(Number(e.target.value))}
                          className="bg-white border border-rose-200 rounded-lg p-2 font-mono font-extrabold text-rose-900 text-xs"
                        />
                      </div>

                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Paid To / Vendor Name (e.g. AWS, Stripe)"
                          value={expPaidTo}
                          onChange={(e) => setExpPaidTo(e.target.value)}
                          className="flex-1 min-w-0 bg-white border border-rose-200 rounded-lg p-2 font-medium text-slate-900 text-xs"
                        />
                        <select
                          value={expPaymentMode}
                          onChange={(e) => setExpPaymentMode(e.target.value)}
                          className="w-32 bg-white border border-rose-200 rounded-lg p-2 font-bold text-slate-900 text-xs"
                        >
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Crypto USDT">Crypto USDT</option>
                          <option value="UPI">UPI</option>
                          <option value="Cash">Cash</option>
                        </select>
                        <button
                          type="button"
                          onClick={handleAddProjectExpense}
                          className="whitespace-nowrap px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-extrabold text-xs shadow-sm"
                        >
                          + Log Expense
                        </button>
                      </div>

                      {projectExpensesList.length > 0 && (
                        <div className="space-y-1.5 pt-1 border-t border-rose-200">
                          {projectExpensesList.map((exp, i) => (
                            <div key={i} className="flex justify-between items-center bg-white px-2.5 py-1.5 rounded-lg border border-rose-100 text-[11px]">
                              <div>
                                <span className="font-extrabold text-slate-900">{exp.title}</span>
                                <span className="text-slate-500 text-[10px] ml-2">({exp.category} • Paid to: {exp.paidTo})</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                <span className="font-mono text-rose-800 font-extrabold text-[11px]">-{formatCurrency(exp.amount)}</span>
                                <button type="button" onClick={() => handleRemoveProjectExpense(i)} className="text-rose-400 hover:text-rose-600 font-bold w-4 text-center">✕</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* TEAM RESOURCES */}
                  <div className="bg-purple-50/60 rounded-xl border border-purple-200 overflow-hidden">
                    <div className="px-3 py-2 bg-purple-100/60 border-b border-purple-200">
                      <p className="font-extrabold text-purple-900 text-[10.5px] uppercase tracking-wide">👥 Team Resources & Labor Allocation</p>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="flex gap-2 items-center">
                        <select value={selectedEmpId} onChange={(e) => setSelectedEmpId(e.target.value)}
                          className="flex-1 min-w-0 bg-white border border-purple-200 rounded-lg p-2 font-semibold text-slate-900 text-xs">
                          <option value="">Select Employee / Freelancer…</option>
                          {employees.map(e => (
                            <option key={e.id} value={e.id}>{e.name} — {e.designation}</option>
                          ))}
                        </select>
                        <input type="number" placeholder="Hrs" value={resHours}
                          onChange={(e) => setResHours(Number(e.target.value))}
                          className="w-16 bg-white border border-purple-200 rounded-lg p-2 font-mono font-bold text-xs text-center" />
                        <button type="button" onClick={handleAddResource}
                          className="whitespace-nowrap px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs shadow-sm">
                          + Add
                        </button>
                      </div>
                      {resources.length > 0 && (
                        <div className="space-y-1">
                          {resources.map((r, i) => (
                            <div key={i} className="flex justify-between items-center bg-white px-2.5 py-1.5 rounded-lg border border-purple-100 text-[11px]">
                              <span className="font-bold text-slate-800 truncate">{r.name} <span className="text-slate-400">({r.role})</span></span>
                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                <span className="font-mono text-purple-700 font-bold text-[10.5px]">{r.hoursAllocated}h × ₹{r.costRatePerHour} = {formatCurrency(r.totalLaborCost)}</span>
                                <button type="button" onClick={() => handleRemoveResource(i)} className="text-rose-400 hover:text-rose-600 font-bold w-5 text-center">✕</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* TIME TRACKING */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Duration (Days)', val: totalDaysTaken, set: setTotalDaysTaken },
                      { label: 'Estimated Hours', val: estimatedHours, set: setEstimatedHours },
                      { label: 'Actual Hours Taken', val: actualHoursTaken, set: setActualHoursTaken },
                    ].map(f => (
                      <div key={f.label}>
                        <label className="block text-slate-600 mb-1 font-bold uppercase text-[10px] tracking-wide">{f.label}</label>
                        <input type="number" value={f.val}
                          onChange={(e) => f.set(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-xs text-center" />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-bold uppercase text-[10px] tracking-wide">Notes / Audit Remarks</label>
                    <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs font-medium resize-none" />
                  </div>
                </div>

                {/* RIGHT COLUMN — Live P&L Summary */}
                <div className="p-5 bg-gradient-to-b from-slate-50 to-indigo-50/30 space-y-4 text-xs">
                  <p className="font-extrabold text-slate-700 uppercase text-[10.5px] tracking-wider border-b border-slate-200 pb-2">
                    📊 Live P&L Summary
                  </p>

                  {/* Project Identity Preview */}
                  <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-1">
                    <p className="font-mono font-black text-indigo-600 text-[10px]">{projectCode || 'PRJ-2026-XX'}</p>
                    <p className="font-extrabold text-slate-900 text-xs leading-tight">{projectName || 'Project Name'}</p>
                    <p className="text-slate-500 text-[10.5px]">{clientCompany || 'Client Company'} • {clientName || 'Contact Name'}</p>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                    <div className="flex justify-between items-center px-3 py-2.5">
                      <span className="text-slate-600 font-bold">💵 What We Quoted</span>
                      <span className="font-mono font-black text-slate-900">{formatCurrency(quotedPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center px-3 py-2.5">
                      <span className="text-emerald-700 font-bold">✅ Advance Collected</span>
                      <span className="font-mono font-bold text-emerald-700">{formatCurrency(advanceCollected)}</span>
                    </div>
                    <div className="flex justify-between items-center px-3 py-2.5">
                      <span className="text-slate-500 font-bold">⏳ Balance Due</span>
                      <span className="font-mono font-bold text-slate-700">{formatCurrency(Math.max(0, quotedPrice - advanceCollected))}</span>
                    </div>
                    <div className="h-px bg-slate-200" />
                    <div className="flex justify-between items-center px-3 py-2.5">
                      <span className="text-rose-600 font-bold">🖥️ Direct Expenses</span>
                      <span className="font-mono font-bold text-rose-700">{formatCurrency(directExpenses)}</span>
                    </div>
                    <div className="flex justify-between items-center px-3 py-2.5">
                      <span className="text-purple-600 font-bold">👥 Labor / Salary</span>
                      <span className="font-mono font-bold text-purple-700">{formatCurrency(salaryCost)}</span>
                    </div>
                    <div className="flex justify-between items-center px-3 py-2.5 bg-rose-50">
                      <span className="text-rose-800 font-extrabold">Total Actual Spend</span>
                      <span className="font-mono font-black text-rose-800">{formatCurrency(directExpenses + salaryCost)}</span>
                    </div>
                  </div>

                  {/* Net Profit Hero */}
                  {(() => {
                    const netP = quotedPrice - (directExpenses + salaryCost);
                    const margin = quotedPrice > 0 ? ((netP / quotedPrice) * 100).toFixed(1) : '0';
                    const markup = (directExpenses + salaryCost) > 0 ? ((netP / (directExpenses + salaryCost)) * 100).toFixed(1) : '0';
                    const isProf = netP >= 0;
                    return (
                      <div className={`rounded-xl border-2 p-4 text-center space-y-1 ${isProf ? 'border-emerald-400 bg-emerald-50' : 'border-rose-400 bg-rose-50'}`}>
                        <p className={`text-[10px] font-extrabold uppercase tracking-wider ${isProf ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isProf ? '🎉 Net Profit' : '⚠️ Net Loss'}
                        </p>
                        <p className={`font-mono font-black text-2xl ${isProf ? 'text-emerald-800' : 'text-rose-800'}`}>
                          {formatCurrency(netP)}
                        </p>
                        <div className="flex justify-center gap-3 pt-1">
                          <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${isProf ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {margin}% Margin
                          </span>
                          <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${isProf ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'}`}>
                            +{markup}% Markup
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Quoted Line Items Preview */}
                  {quotationItems.length > 0 && (
                    <div className="bg-white rounded-xl border border-indigo-100 overflow-hidden">
                      <p className="px-3 py-2 bg-indigo-50 text-indigo-800 font-extrabold text-[10px] uppercase tracking-wide border-b border-indigo-100">
                        📋 Scope Line Items
                      </p>
                      <div className="divide-y divide-slate-50">
                        {quotationItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center px-3 py-2 text-[10.5px]">
                            <span className="text-slate-700 font-medium truncate pr-2">{item.description}</span>
                            <span className="font-mono font-bold text-slate-900 shrink-0">{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md shadow-indigo-600/20 transition">
                  Save Project P&L Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};