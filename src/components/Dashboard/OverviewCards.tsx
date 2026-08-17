import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Target, TrendingUp, TrendingDown, DollarSign, CheckCircle2, Clock, ArrowUpRight, Plane, FolderKanban, Sparkles } from 'lucide-react';
import { MetricDetailModal, MetricType } from './MetricDetailModal';

export const OverviewCards: React.FC = () => {
  const { leads, documents, expenses, eventRecords, projectPLRecords, formatCurrency, getInvoiceTotalPaid, getInvoiceBalance } = useApp();
  const [selectedMetric, setSelectedMetric] = useState<MetricType | null>(null);

  const totalLeads = leads.length;
  const completedLeads = leads.filter(l => l.stage === 'COMPLETED').length;
  const inProgressLeads = leads.filter(l => l.stage === 'IN_PROGRESS' || l.stage === 'PROPOSAL_SENT').length;

  const realizedRevenue = documents
    .filter(d => d.docType === 'INVOICE')
    .reduce((sum, d) => sum + getInvoiceTotalPaid(d.id), 0);

  const outstandingReceivables = documents
    .filter(d => d.docType === 'INVOICE' && d.status !== 'CANCELLED' && d.status !== 'UNCOLLECTIBLE' && d.status !== 'UNRECOVERABLE')
    .reduce((sum, d) => sum + getInvoiceBalance(d.id), 0);

  const grossRevenue = realizedRevenue + outstandingReceivables;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = realizedRevenue - totalExpenses;
  const isProfitPositive = netProfit >= 0;

  // Percentage calculations
  const expenseRatioPercent = realizedRevenue > 0 ? ((totalExpenses / realizedRevenue) * 100).toFixed(1) : '0';
  const netMarginPercent = realizedRevenue > 0 ? ((netProfit / realizedRevenue) * 100).toFixed(1) : '0';

  // Events ROI calculations
  const totalEventsAttended = eventRecords.length;
  const totalEventSpend = eventRecords.reduce((sum, e) => sum + e.totalSpendINR, 0);
  const totalEventRevenue = eventRecords.reduce((sum, e) => sum + e.businessRevenueINR, 0);

  // Project P&L calculations
  const activeProjectsCount = projectPLRecords.length > 0 ? projectPLRecords.length : documents.filter(d => d.docType === 'INVOICE').length;
  const totalProjectNetProfit = projectPLRecords.length > 0 ? projectPLRecords.reduce((sum, p) => sum + p.netProfit, 0) : netProfit;
  const avgProfitPerProject = activeProjectsCount > 0 ? Math.round(totalProjectNetProfit / activeProjectsCount) : 0;
  const avgMargin = netMarginPercent;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 mb-8">
        {/* Widget 1: Pipeline Leads */}
        <div
          onClick={() => setSelectedMetric('PIPELINE_LEADS')}
          className="bg-white rounded-2xl p-4 border border-slate-200 border-l-4 border-l-blue-600 shadow-sm hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
              PIPELINE LEADS
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-2xs">
              <Target className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{totalLeads}</h3>
            <span className="text-[10px] text-slate-500 font-bold">{totalLeads} Deals</span>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1 text-emerald-700 font-extrabold text-[10px]">
              <CheckCircle2 className="w-3 h-3" />
              <span>{completedLeads} Done</span>
            </div>
            <div className="flex items-center gap-1 text-amber-700 font-extrabold text-[10px]">
              <Clock className="w-3 h-3" />
              <span>{inProgressLeads} Active</span>
            </div>
          </div>

          <div className="mt-2 text-[10px] text-blue-600 font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Inspect Audit</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Widget 2: Realized Revenue */}
        <div
          onClick={() => setSelectedMetric('TOTAL_REVENUE')}
          className="bg-white rounded-2xl p-4 border border-slate-200 border-l-4 border-l-emerald-600 shadow-sm hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
              REALIZED REVENUE
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-2xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-black text-emerald-800 tracking-tight font-mono truncate">
              {formatCurrency(realizedRevenue)}
            </h3>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-bold text-[10px] text-slate-600">Client Payments</span>
            <span className="text-emerald-700 font-black text-[10px]">+100% Paid</span>
          </div>

          <div className="mt-2 text-[10px] text-emerald-600 font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Inspect Audit</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Widget 2B: Gross Revenue (Invoiced + Receivables) */}
        <div
          onClick={() => setSelectedMetric('TOTAL_REVENUE')}
          className="bg-white rounded-2xl p-4 border border-slate-200 border-l-4 border-l-indigo-600 shadow-sm hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
              GROSS REVENUE
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-black text-indigo-950 tracking-tight font-mono truncate">
              {formatCurrency(grossRevenue)}
            </h3>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-bold text-[10px] text-slate-600">Incl. Receivables</span>
            <span className="text-amber-700 font-black text-[10px]">+{formatCurrency(outstandingReceivables)}</span>
          </div>

          <div className="mt-2 text-[10px] text-indigo-600 font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Inspect Invoices</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Widget 3: Total Expenses */}
        <div
          onClick={() => setSelectedMetric('TOTAL_EXPENSES')}
          className="bg-white rounded-2xl p-4 border border-slate-200 border-l-4 border-l-rose-600 shadow-sm hover:shadow-xl hover:border-rose-400 hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-700">
              TOTAL EXPENSES
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors shadow-2xs">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-black text-rose-800 tracking-tight font-mono truncate">
              {formatCurrency(totalExpenses)}
            </h3>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-bold text-[10px] text-slate-600">Expense %</span>
            <span className="text-rose-700 font-black text-[10px]">{expenseRatioPercent}% Ratio</span>
          </div>

          <div className="mt-2 text-[10px] text-rose-600 font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Inspect Audit</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Widget 4: Net Profit */}
        <div
          onClick={() => setSelectedMetric('NET_PROFIT')}
          className="bg-white rounded-2xl p-4 border border-slate-200 border-l-4 border-l-indigo-600 shadow-sm hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
              NET PROFIT
            </span>
            <div className={`w-8 h-8 rounded-xl ${isProfitPositive ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'} flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-2xs`}>
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <h3 className={`text-xl font-black ${isProfitPositive ? 'text-indigo-900' : 'text-rose-700'} tracking-tight font-mono truncate`}>
              {formatCurrency(netProfit)}
            </h3>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-bold text-[10px]">Net Margin %</span>
            <span className={`font-black text-[9.5px] px-1.5 py-0.5 rounded ${isProfitPositive ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'}`}>
              +{netMarginPercent}%
            </span>
          </div>

          <div className="mt-2 text-[10px] text-indigo-600 font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Inspect Audit</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Widget 5: Avg Profit Per Project Card */}
        <div
          onClick={() => setSelectedMetric('PROJECT_PROFIT')}
          className="bg-white rounded-2xl p-4 border border-slate-200 border-l-4 border-l-violet-600 shadow-sm hover:shadow-xl hover:border-violet-400 hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-violet-700 truncate">
              AVG PROFIT / PROJECT
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors shadow-2xs">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight font-mono truncate">
              {formatCurrency(avgProfitPerProject)}
            </h3>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="text-slate-500 font-bold font-sans">Avg Net Margin:</span>
            <span className="text-violet-700 font-mono font-black">+{avgMargin}%</span>
          </div>

          <div className="mt-2 text-[10px] text-violet-600 font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Inspect Project P&L</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Widget 6: Events & Travel ROI Card */}
        <div
          onClick={() => setSelectedMetric('EVENTS_TRAVEL')}
          className="bg-white rounded-2xl p-4 border border-slate-200 border-l-4 border-l-purple-600 shadow-sm hover:shadow-xl hover:border-purple-400 hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">
              EVENTS ROI
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-2xs">
              <Plane className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{totalEventsAttended} <span className="text-xs text-slate-500 font-bold">Attended</span></h3>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="text-slate-500 font-bold font-sans">Revenue:</span>
            <span className="text-emerald-700 font-mono font-black">{formatCurrency(totalEventRevenue)}</span>
          </div>

          <div className="mt-2 text-[10px] text-purple-600 font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Inspect Events</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      {selectedMetric && (
        <MetricDetailModal
          type={selectedMetric}
          onClose={() => setSelectedMetric(null)}
        />
      )}
    </>
  );
};
