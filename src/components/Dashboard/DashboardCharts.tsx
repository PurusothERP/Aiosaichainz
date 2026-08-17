import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MetricDetailModal, MetricType } from './MetricDetailModal';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  DollarSign,
  Users,
  CheckCircle2,
  AlertCircle,
  AlertOctagon,
  Calendar,
  Briefcase,
  ArrowUpRight,
  Lock,
  Building2,
  Coins,
  Laptop
} from 'lucide-react';

export const DashboardCharts: React.FC = () => {
  const { documents, expenses, employees, payroll, bankAccounts, cryptoAccounts, companyAssets, reserveProvision, formatCurrency } = useApp();
  const [selectedMetric, setSelectedMetric] = useState<MetricType | null>(null);

  // Treasury calculations
  const totalRealizedInflow = documents
    .filter(d => d.docType === 'INVOICE')
    .reduce((sum, d) => {
      if (d.status === 'PAID') return sum + d.total;
      return sum + (d.advanceCollectedAmount || 0);
    }, 0);

  const totalExpensesOutflow = expenses.reduce((sum, e) => sum + e.amount, 0);
  const baseBankCash = bankAccounts.reduce((sum, b) => sum + b.balanceINR, 0);
  const totalBankCash = baseBankCash > 0 ? baseBankCash : Math.max(0, totalRealizedInflow - totalExpensesOutflow);

  const totalCryptoValue = cryptoAccounts.reduce((sum, c) => sum + (c.balanceCrypto * c.usdRateINR), 0);
  const totalUsdtBalance = cryptoAccounts.filter(c => c.assetType === 'USDT').reduce((sum, c) => sum + c.balanceCrypto, 0);
  const totalCombinedTreasury = totalBankCash + totalCryptoValue;

  const reservedFundAmount = Math.round(totalCombinedTreasury * (reserveProvision.reservePercentage / 100));
  const liquidOperatingAmount = totalCombinedTreasury - reservedFundAmount;

  const totalAssetValue = companyAssets.reduce((sum, a) => sum + a.purchaseCostINR, 0);

  // 1. Month-wise Revenue & Outflow Data (April 2026 - March 2027)
  const fiscalMonths = [
    { short: 'Apr', full: 'April 2026', monthKey: '2026-04' },
    { short: 'May', full: 'May 2026', monthKey: '2026-05' },
    { short: 'Jun', full: 'June 2026', monthKey: '2026-06' },
    { short: 'Jul', full: 'July 2026', monthKey: '2026-07' },
    { short: 'Aug', full: 'August 2026', monthKey: '2026-08' },
    { short: 'Sep', full: 'September 2026', monthKey: '2026-09' },
    { short: 'Oct', full: 'October 2026', monthKey: '2026-10' },
    { short: 'Nov', full: 'November 2026', monthKey: '2026-11' },
    { short: 'Dec', full: 'December 2026', monthKey: '2026-12' },
    { short: 'Jan', full: 'January 2027', monthKey: '2027-01' },
    { short: 'Feb', full: 'February 2027', monthKey: '2027-02' },
    { short: 'Mar', full: 'March 2027', monthKey: '2027-03' }
  ].map(m => {
    const revenue = documents
      .filter(d => d.docType === 'INVOICE' && (d.issueDate || '').startsWith(m.monthKey))
      .reduce((sum, d) => {
        if (d.status === 'PAID') return sum + d.total;
        return sum + (d.advanceCollectedAmount || 0);
      }, 0);
    const expense = expenses
      .filter(e => e.date.startsWith(m.monthKey))
      .reduce((sum, e) => sum + e.amount, 0);
    return { ...m, revenue, expense };
  });

  const maxRevenue = Math.max(...fiscalMonths.map(m => Math.max(m.revenue, m.expense)), 1);

  // 2. Category-wise Revenue Breakdown
  const categoryRevenueMap = new Map<string, number>();
  documents
    .filter(d => d.docType === 'INVOICE')
    .forEach(doc => {
      doc.items.forEach(item => {
        const cat = item.serviceCategory || 'General Software';
        const collected = doc.status === 'PAID' ? item.amount : (doc.advanceCollectedAmount || 0);
        if (collected > 0) {
          categoryRevenueMap.set(cat, (categoryRevenueMap.get(cat) || 0) + collected);
        }
      });
    });

  const categoryList = Array.from(categoryRevenueMap.entries()).map(([name, amount]) => ({
    name,
    amount
  }));

  const totalCatRevenue = categoryList.reduce((sum, c) => sum + c.amount, 0);

  // 3. Received vs Pending vs Unrecoverable Breakdown
  const { getInvoicePayments, getInvoiceTotalPaid, getInvoiceBalance } = useApp();
  const receivedAmount = documents
    .filter(d => d.docType === 'INVOICE')
    .reduce((sum, d) => sum + getInvoiceTotalPaid(d.id), 0);

  const pendingAmount = documents
    .filter(d => d.docType === 'INVOICE' && (d.status === 'UNPAID' || d.status === 'PARTIALLY_PAID' || d.status === 'OVERDUE'))
    .reduce((sum, d) => sum + getInvoiceBalance(d.id), 0);

  const unrecoverableAmount = documents
    .filter(d => d.status === 'UNCOLLECTIBLE' || d.status === 'UNRECOVERABLE')
    .reduce((sum, d) => sum + d.total, 0);

  const grandTotalAccounts = receivedAmount + pendingAmount + unrecoverableAmount;

  const recPercent = grandTotalAccounts > 0 ? ((receivedAmount / grandTotalAccounts) * 100).toFixed(1) : '0';
  const pendPercent = grandTotalAccounts > 0 ? ((pendingAmount / grandTotalAccounts) * 100).toFixed(1) : '0';
  const unrecPercent = grandTotalAccounts > 0 ? ((unrecoverableAmount / grandTotalAccounts) * 100).toFixed(1) : '0';

  // 4. Expense Outflow Categories (Dynamic from real Expenses + Payroll)
  const payrollTotalOutflow = payroll.reduce((sum, p) => sum + p.netPayable, 0);
  const cloudExpenses = expenses.filter(e => e.category === 'Infrastructure').reduce((sum, e) => sum + e.amount, 0);
  const freelancerExpenses = expenses.filter(e => e.category === 'Freelancer Payouts').reduce((sum, e) => sum + e.amount, 0);
  const softwareExpenses = expenses.filter(e => e.category === 'Software').reduce((sum, e) => sum + e.amount, 0);
  const totalOutflowAll = payrollTotalOutflow + expenses.reduce((sum, e) => sum + e.amount, 0);

  // 4. Workforce Total & Breakdown
  const activeEmployees = employees.filter(e => e.status === 'ACTIVE');
  const fullTimeCount = employees.filter(e => e.type === 'FULL_TIME').length;
  const freelancerCount = employees.filter(e => e.type === 'FREELANCER').length;

  return (
    <div className="space-y-6 mb-8">
      {/* Banner 1: Corporate Bank Cash, USDT Crypto Vault & Future Reserve Provisioning */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black">Aichainz Bank Cash, Crypto & Reserve Vault</h3>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-400/30">
                TREASURY & ASSETS
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Liquid Bank Cash (INR) + {totalUsdtBalance.toLocaleString()} USDT Vault + {reserveProvision.reservePercentage}% Future Emergency Reserve.
            </p>
          </div>
        </div>

        <div className="flex flex-nowrap items-center gap-2.5 overflow-x-auto">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] text-slate-300 font-bold uppercase block">BANK CASH (INR)</span>
            <span className="text-xl font-black text-emerald-400 font-mono">{formatCurrency(totalBankCash)}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] text-purple-300 font-bold uppercase block">CRYPTO VAULT (USDT)</span>
            <span className="text-xl font-black text-purple-300 font-mono">{totalUsdtBalance.toLocaleString()} USDT</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] text-amber-300 font-bold uppercase block">FUTURE RESERVE ({reserveProvision.reservePercentage}%)</span>
            <span className="text-xl font-black text-amber-300 font-mono">{formatCurrency(reservedFundAmount)}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] text-blue-300 font-bold uppercase block">HARDWARE ASSETS ({companyAssets.length})</span>
            <span className="text-xl font-black text-blue-300 font-mono">{formatCurrency(totalAssetValue)}</span>
          </div>
        </div>
      </div>

      {/* Banner 2: Total Workforce Widget & Quick Metrics */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div
          onClick={() => setSelectedMetric('TOTAL_WORKFORCE')}
          className="flex items-center gap-4 cursor-pointer group"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-inner group-hover:scale-105 transition-transform">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black group-hover:text-blue-300 transition-colors">Aichainz Enterprise Workforce</h3>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                ACTIVE TEAM
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">Click for complete employee roster & salary ledger.</p>
          </div>
        </div>

        <div className="flex flex-nowrap items-center gap-2.5 overflow-x-auto">
          <div
            onClick={() => setSelectedMetric('TOTAL_WORKFORCE')}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-center cursor-pointer transition"
          >
            <span className="text-[10px] text-slate-300 font-bold uppercase block">TOTAL WORKFORCE</span>
            <span className="text-xl font-black text-white">{employees.length} Staff</span>
          </div>

          <div
            onClick={() => setSelectedMetric('FULLTIME_STAFF')}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-center cursor-pointer transition"
          >
            <span className="text-[10px] text-slate-300 font-bold uppercase block">FULL-TIME ENGINE</span>
            <span className="text-xl font-black text-blue-300">{fullTimeCount} Full-Time</span>
          </div>

          <div
            onClick={() => setSelectedMetric('FREELANCERS')}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-center cursor-pointer transition"
          >
            <span className="text-[10px] text-slate-300 font-bold uppercase block">FREELANCERS</span>
            <span className="text-xl font-black text-emerald-300">{freelancerCount} Hourly</span>
          </div>
        </div>
      </div>

      {/* Grid Row 1: Month-wise Business Revenue Chart & Category Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Month-wise Business Revenue & Expense Bar Chart (Interactive) */}
        <div
          onClick={() => setSelectedMetric('TOTAL_REVENUE')}
          className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                <BarChart3 className="w-5 h-5 text-blue-600" /> Month-wise Business Revenue & Expense Progress
              </h3>
              <p className="text-xs text-slate-500 font-medium">Click chart to inspect monthly client revenue collection ledger.</p>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-blue-600"></div>
                <span className="text-slate-700">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-rose-500"></div>
                <span className="text-slate-700">Expenses</span>
              </div>
            </div>
          </div>

          {/* SVG Visual Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-200">
            {fiscalMonths.map((m, idx) => {
              const revHeight = Math.max((m.revenue / maxRevenue) * 100, 8);
              const expHeight = Math.max((m.expense / maxRevenue) * 100, 6);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group/bar relative">
                  {/* Hover Tooltip */}
                  <div className="opacity-0 group-hover/bar:opacity-100 transition-opacity absolute -top-12 z-20 bg-slate-900 text-white text-[9.5px] p-2 rounded-lg pointer-events-none shadow-xl w-32 text-center">
                    <p className="font-bold">{m.full}</p>
                    <p className="text-blue-300">Rev: {formatCurrency(m.revenue)}</p>
                    <p className="text-rose-300">Exp: {formatCurrency(m.expense)}</p>
                  </div>

                  <div className="w-full flex items-end justify-center gap-1 h-48">
                    {/* Revenue Bar */}
                    <div
                      style={{ height: `${revHeight}%` }}
                      className="w-1/2 bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-md transition-all group-hover/bar:from-blue-600 group-hover/bar:to-blue-400"
                    ></div>
                    {/* Expense Bar */}
                    <div
                      style={{ height: `${expHeight}%` }}
                      className="w-1/2 bg-gradient-to-t from-rose-700 to-rose-400 rounded-t-md transition-all group-hover/bar:from-rose-600 group-hover/bar:to-rose-300"
                    ></div>
                  </div>

                  <span className="text-[10px] font-bold text-slate-600 mt-1">{m.short}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Category-wise Revenue Breakdown Chart (Interactive) */}
        <div
          onClick={() => setSelectedMetric('TOTAL_REVENUE')}
          className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mb-1 group-hover:text-purple-600 transition-colors">
              <PieChart className="w-5 h-5 text-purple-600" /> Revenue by Service Category
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-4">Click to inspect category revenue invoices.</p>
          </div>

          <div className="space-y-3">
            {categoryList.map((cat, idx) => {
              const percent = totalCatRevenue > 0 ? Math.round((cat.amount / totalCatRevenue) * 100) : 25;
              const colors = ['bg-blue-600', 'bg-purple-600', 'bg-indigo-600', 'bg-emerald-600', 'bg-amber-600'];
              const barColor = colors[idx % colors.length];

              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-800 truncate max-w-[170px]">{cat.name}</span>
                    <span className="font-mono text-purple-700">{formatCurrency(cat.amount)} ({percent}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${percent}%` }} className={`h-full ${barColor} rounded-full`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid Row 2: Received vs Pending vs Written-off Donut Breakdown & Monthly Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 3: Received vs Pending vs Unrecoverable Amount (Interactive) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mb-1">
              <DollarSign className="w-5 h-5 text-emerald-600" /> Inflow Realization & Receivables
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-4">Click any item for instant popup audit.</p>
          </div>

          <div className="space-y-3">
            {/* Realized Received Card */}
            <div
              onClick={() => setSelectedMetric('TOTAL_REVENUE')}
              className="bg-emerald-50 hover:bg-emerald-100/80 p-3.5 rounded-xl border border-emerald-200 transition cursor-pointer group"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-emerald-900 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Realized Received Cash
                </span>
                <span className="font-mono font-black text-emerald-800 text-sm">{formatCurrency(receivedAmount)}</span>
              </div>
              <div className="mt-2 h-2 w-full bg-emerald-200 rounded-full overflow-hidden">
                <div style={{ width: `${recPercent}%` }} className="h-full bg-emerald-600"></div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 mt-1 block text-right">{recPercent}% Realized</span>
            </div>

            {/* Pending Receivable Card */}
            <div
              onClick={() => setSelectedMetric('ACCOUNTS_RECEIVABLE')}
              className="bg-amber-50 hover:bg-amber-100/80 p-3.5 rounded-xl border border-amber-200 transition cursor-pointer group"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-amber-900 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> Active Pending Receivable
                </span>
                <span className="font-mono font-black text-amber-800 text-sm">{formatCurrency(pendingAmount)}</span>
              </div>
              <div className="mt-2 h-2 w-full bg-amber-200 rounded-full overflow-hidden">
                <div style={{ width: `${pendPercent}%` }} className="h-full bg-amber-600"></div>
              </div>
              <span className="text-[10px] font-bold text-amber-700 mt-1 block text-right">{pendPercent}% Pending</span>
            </div>

            {/* Unrecoverable Bad Debt Card */}
            <div
              onClick={() => setSelectedMetric('UNRECOVERABLE_BAD_DEBT')}
              className="bg-rose-50 hover:bg-rose-100/80 p-3.5 rounded-xl border border-rose-200 transition cursor-pointer group"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-rose-900 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                  <AlertOctagon className="w-4 h-4 text-rose-600" /> Unrecoverable Bad Debt
                </span>
                <span className="font-mono font-black text-rose-800 text-sm">{formatCurrency(unrecoverableAmount)}</span>
              </div>
              <div className="mt-2 h-2 w-full bg-rose-200 rounded-full overflow-hidden">
                <div style={{ width: `${unrecPercent}%` }} className="h-full bg-rose-600"></div>
              </div>
              <span className="text-[10px] font-bold text-rose-700 mt-1 block text-right">{unrecPercent}% Written-Off</span>
            </div>
          </div>
        </div>

        {/* Chart 4: Monthly Outflow & Expense Category Distribution (Interactive) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mb-1">
              <TrendingDown className="w-5 h-5 text-rose-600" /> Monthly Expense Outflow Distribution
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-4">Click any expense card to inspect specific receipts & vendor payments.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => setSelectedMetric('STAFF_PAYROLL_EXPENSE')}
              className="bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-200 cursor-pointer transition group"
            >
              <span className="text-[10px] text-slate-500 font-bold uppercase block group-hover:text-rose-600 transition-colors">Staff Payroll Outflow</span>
              <span className="text-lg font-black text-slate-900 font-mono">{formatCurrency(payrollTotalOutflow)}</span>
              <span className="text-[10px] text-slate-500 block mt-1 font-bold">
                {totalOutflowAll > 0 ? ((payrollTotalOutflow / totalOutflowAll) * 100).toFixed(0) : '0'}% of Total Outflow
              </span>
            </div>

            <div
              onClick={() => setSelectedMetric('AWS_CLOUD_EXPENSE')}
              className="bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-200 cursor-pointer transition group"
            >
              <span className="text-[10px] text-slate-500 font-bold uppercase block group-hover:text-blue-600 transition-colors">Infrastructure Expenses</span>
              <span className="text-lg font-black text-slate-900 font-mono">{formatCurrency(cloudExpenses)}</span>
              <span className="text-[10px] text-slate-500 block mt-1 font-bold">
                {totalOutflowAll > 0 ? ((cloudExpenses / totalOutflowAll) * 100).toFixed(0) : '0'}% of Total Outflow
              </span>
            </div>

            <div
              onClick={() => setSelectedMetric('FREELANCER_EXPENSE')}
              className="bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-200 cursor-pointer transition group"
            >
              <span className="text-[10px] text-slate-500 font-bold uppercase block group-hover:text-emerald-600 transition-colors">Freelancer Payouts</span>
              <span className="text-lg font-black text-slate-900 font-mono">{formatCurrency(freelancerExpenses)}</span>
              <span className="text-[10px] text-slate-500 block mt-1 font-bold">
                {totalOutflowAll > 0 ? ((freelancerExpenses / totalOutflowAll) * 100).toFixed(0) : '0'}% of Total Outflow
              </span>
            </div>

            <div
              onClick={() => setSelectedMetric('SOFTWARE_TOOLS_EXPENSE')}
              className="bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-200 cursor-pointer transition group"
            >
              <span className="text-[10px] text-slate-500 font-bold uppercase block group-hover:text-purple-600 transition-colors">Software Licenses & Tools</span>
              <span className="text-lg font-black text-slate-900 font-mono">{formatCurrency(softwareExpenses)}</span>
              <span className="text-[10px] text-slate-500 block mt-1 font-bold">
                {totalOutflowAll > 0 ? ((softwareExpenses / totalOutflowAll) * 100).toFixed(0) : '0'}% of Total Outflow
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* On-Click Popup Detail Inspection Modal */}
      {selectedMetric && (
        <MetricDetailModal
          type={selectedMetric}
          onClose={() => setSelectedMetric(null)}
        />
      )}
    </div>
  );
};
