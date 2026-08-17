import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CompanyEMI, SubscriptionItem } from '../../types';
import { exportToCSV, exportToPDFPrint } from '../../utils/exportUtils';
import {
  CreditCard,
  Plus,
  Calendar,
  Clock,
  DollarSign,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Download,
  Printer,
  Sparkles,
  Zap,
  Building2,
  RefreshCw
} from 'lucide-react';

export const SubscriptionsEMIManager: React.FC = () => {
  const {
    companyEMIs,
    addCompanyEMI,
    deleteCompanyEMI,
    processEMIDeduction,
    subscriptions,
    addSubscription,
    deleteSubscription,
    bankAccounts,
    formatCurrency
  } = useApp();

  const [activeTab, setActiveTab] = useState<'EMI' | 'SUBSCRIPTIONS'>('EMI');
  const [showEMIModal, setShowEMIModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);

  // Form State for Company EMI
  const [emiProductName, setEmiProductName] = useState('');
  const [emiVendorName, setEmiVendorName] = useState('');
  const [monthlyEMIAmount, setMonthlyEMIAmount] = useState(25000);
  const [totalTenureMonths, setTotalTenureMonths] = useState(12);
  const [emiStartDate, setEmiStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [emiBankAccountId, setEmiBankAccountId] = useState<string>('');

  // Form State for Subscription
  const [subProductName, setSubProductName] = useState('');
  const [subVendorName, setSubVendorName] = useState('');
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [subAmount, setSubAmount] = useState(15000);
  const [renewalDueDate, setRenewalDueDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
  const [paymentMethod, setPaymentMethod] = useState('Axis Bank Corporate Account');
  const [subBankAccountId, setSubBankAccountId] = useState<string>('');

  // Summary Metrics & Financial Dashboard
  const activeEMIs = companyEMIs.filter(e => e.status === 'ACTIVE');
  const totalMonthlyEMIOutflow = activeEMIs.reduce((sum, e) => sum + e.monthlyEMIAmount, 0);

  const totalEMIAmountPaid = companyEMIs.reduce((sum, e) => sum + (e.paidMonthsCount * e.monthlyEMIAmount), 0);
  const totalEMIYetToBePaid = companyEMIs.reduce((sum, e) => sum + (Math.max(0, e.totalTenureMonths - e.paidMonthsCount) * e.monthlyEMIAmount), 0);
  const totalEMIContractValuation = companyEMIs.reduce((sum, e) => sum + (e.totalTenureMonths * e.monthlyEMIAmount), 0);

  const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE');
  const totalMonthlySubOutflow = activeSubs.reduce((sum, s) => {
    return sum + (s.billingCycle === 'MONTHLY' ? s.amount : Math.round(s.amount / 12));
  }, 0);

  const handleEMISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emiProductName || !emiVendorName) return;

    addCompanyEMI({
      productName: emiProductName,
      vendorName: emiVendorName,
      monthlyEMIAmount: Number(monthlyEMIAmount),
      currency: 'INR',
      totalTenureMonths: Number(totalTenureMonths),
      paymentDayOfMonth: 3,
      startDate: emiStartDate,
      bankAccountId: emiBankAccountId || undefined
    });

    setEmiProductName('');
    setEmiVendorName('');
    setShowEMIModal(false);
  };

  const handleSubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subProductName) return;

    const chosenBank = bankAccounts.find(b => b.id === subBankAccountId);
    const methodString = chosenBank
      ? `${chosenBank.bankName} (${chosenBank.accountName} #${chosenBank.accountNumber.slice(-4)})`
      : paymentMethod || 'Corporate Bank Account';

    addSubscription({
      productName: subProductName,
      vendorName: subVendorName || 'Cloud Vendor',
      billingCycle,
      amount: Number(subAmount),
      currency: 'INR',
      renewalDueDate,
      paymentMethod: methodString,
      bankAccountId: subBankAccountId || undefined
    });

    setSubProductName('');
    setSubVendorName('');
    setShowSubModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-purple-600" /> Company EMI & Software Subscriptions Suite
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Manage company asset loan EMIs, automated 3rd-of-the-month expense deductions, and software subscription renewals.
          </p>
        </div>

        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-extrabold">
            <button
              onClick={() => setActiveTab('EMI')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'EMI' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Company EMIs ({companyEMIs.length})
            </button>
            <button
              onClick={() => setActiveTab('SUBSCRIPTIONS')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'SUBSCRIPTIONS' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Subscriptions ({subscriptions.length})
            </button>
          </div>

          <button
            onClick={() => {
              if (activeTab === 'EMI') {
                const headers = ['Product Asset Name', 'Vendor / Bank', 'Monthly EMI (INR)', 'Tenure (Months)', 'Paid Months', 'Status', 'Start Date'];
                const rows = companyEMIs.length > 0
                  ? companyEMIs.map(e => [e.productName, e.vendorName, e.monthlyEMIAmount, e.totalTenureMonths, e.paidMonthsCount, e.status, e.startDate])
                  : [['No Company EMI records logged yet', '-', '-', '-', '-', '-', '-']];
                exportToCSV('Company_EMI_Report', headers, rows);
              } else {
                const headers = ['Product / Service', 'Vendor', 'Billing Cycle', 'Amount (INR)', 'Renewal Due Date', 'Payment Method', 'Status'];
                const rows = subscriptions.length > 0
                  ? subscriptions.map(s => [s.productName, s.vendorName, s.billingCycle, s.amount, s.renewalDueDate, s.paymentMethod, s.status])
                  : [['No Software Subscriptions logged yet', '-', '-', '-', '-', '-', '-']];
                exportToCSV('Software_Subscriptions_Report', headers, rows);
              }
            }}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border border-emerald-200 shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Export Excel
          </button>

          <button
            onClick={() => exportToPDFPrint(`Company_${activeTab}_Report`, 'emi-sub-table-print')}
            className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border border-blue-200 shadow-2xs"
          >
            <Printer className="w-4 h-4 text-blue-600" /> Print PDF
          </button>

          {activeTab === 'EMI' ? (
            <button
              onClick={() => setShowEMIModal(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md shadow-purple-600/20"
            >
              <Plus className="w-4 h-4" /> Add Company EMI Loan
            </button>
          ) : (
            <button
              onClick={() => setShowSubModal(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md shadow-purple-600/20"
            >
              <Plus className="w-4 h-4" /> Add Subscription
            </button>
          )}
        </div>
      </div>

      {/* EMI Executive Dashboard Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-emerald-600">
          <span className="text-[10.5px] font-black uppercase text-emerald-700 block">TOTAL EMI AMOUNT PAID</span>
          <p className="text-2xl font-black text-emerald-800 font-mono tracking-tight mt-1">{formatCurrency(totalEMIAmountPaid)}</p>
          <p className="text-[11px] text-slate-500 font-bold mt-1">Successfully Cleared EMI Installments</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-amber-600">
          <span className="text-[10.5px] font-black uppercase text-amber-700 block">REMAINING EMI YET TO BE PAID</span>
          <p className="text-2xl font-black text-amber-800 font-mono tracking-tight mt-1">{formatCurrency(totalEMIYetToBePaid)}</p>
          <p className="text-[11px] text-slate-500 font-bold mt-1">Total Outstanding Loan Balance</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-purple-600">
          <span className="text-[10.5px] font-black uppercase text-purple-700 block">MONTHLY EMI OUTFLOW</span>
          <p className="text-2xl font-black text-slate-900 font-mono tracking-tight mt-1">{formatCurrency(totalMonthlyEMIOutflow)}</p>
          <p className="text-[11px] text-slate-500 font-bold mt-1">Active Loan Contracts: {activeEMIs.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm border-l-4 border-l-blue-600">
          <span className="text-[10.5px] font-black uppercase text-blue-700 block">SOFTWARE SUBSCRIPTIONS / MO</span>
          <p className="text-2xl font-black text-slate-900 font-mono tracking-tight mt-1">{formatCurrency(totalMonthlySubOutflow)}</p>
          <p className="text-[11px] text-slate-500 font-bold mt-1">Active Software Subscriptions: {activeSubs.length}</p>
        </div>
      </div>

      {/* TAB 1: COMPANY EMIS */}
      {activeTab === 'EMI' && (
        <div className="space-y-4" id="emi-sub-table-print">
          {/* Rule Notification Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 rounded-2xl border border-indigo-900 shadow-md flex items-center justify-between no-print">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">Automated 3rd-of-the-Month EMI Deduction Engine</h4>
                <p className="text-[11px] text-slate-300 font-medium">
                  On the 3rd of every month, active EMI installments automatically post to <strong>Operating Expenses</strong> and debit from general ledger income.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-400/20 text-amber-300 text-[10px] font-black rounded-lg border border-amber-400/30 font-mono">
              Auto Rule Active ⚡
            </span>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Asset / Product Name</th>
                    <th className="p-3.5">Vendor / Lender Bank</th>
                    <th className="p-3.5 font-mono text-right">Monthly EMI</th>
                    <th className="p-3.5 text-center">Tenure Progress</th>
                    <th className="p-3.5 text-center">Payment Schedule</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right no-print">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {companyEMIs.map(emi => {
                    const isCompleted = emi.paidMonthsCount >= emi.totalTenureMonths;
                    return (
                      <tr key={emi.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5">
                          <p className="font-extrabold text-slate-900 text-sm">{emi.productName}</p>
                          <p className="text-slate-500 text-[10.5px]">Started: {emi.startDate}</p>
                        </td>
                        <td className="p-3.5 font-bold text-slate-700">{emi.vendorName}</td>
                        <td className="p-3.5 text-right font-mono font-extrabold text-rose-700 text-sm">
                          -{formatCurrency(emi.monthlyEMIAmount)}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="font-mono font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            {emi.paidMonthsCount} / {emi.totalTenureMonths} Months
                          </span>
                        </td>
                        <td className="p-3.5 text-center text-indigo-900 font-extrabold">
                          Every month on the <span className="underline font-mono">3rd</span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2.5 py-1 text-[10.5px] font-black rounded-lg ${
                            isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {isCompleted ? 'COMPLETED' : 'ACTIVE'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right no-print space-x-1">
                          {!isCompleted && (
                            <button
                              onClick={() => processEMIDeduction(emi.id)}
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs"
                              title="Process current month EMI payment manually"
                            >
                              <RefreshCw className="w-3 h-3" /> Pay Now
                            </button>
                          )}
                          <button
                            onClick={() => deleteCompanyEMI(emi.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Delete EMI"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {companyEMIs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                        No company asset EMIs recorded yet. Click "Add Company EMI Loan" above to add MacBook workstations or office loans.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUBSCRIPTIONS */}
      {activeTab === 'SUBSCRIPTIONS' && (
        <div className="space-y-4" id="emi-sub-table-print">
          <div className="glass-panel rounded-2xl p-5 border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Software / Service Product</th>
                    <th className="p-3.5">Vendor</th>
                    <th className="p-3.5">Billing Cycle</th>
                    <th className="p-3.5 font-mono text-right">Renewal Amount</th>
                    <th className="p-3.5 text-center">⏳ Renewal Due Date</th>
                    <th className="p-3.5">Payment Method</th>
                    <th className="p-3.5 text-right no-print">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {subscriptions.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-extrabold text-slate-900 text-sm">{sub.productName}</td>
                      <td className="p-3.5 font-bold text-slate-700">{sub.vendorName}</td>
                      <td className="p-3.5 font-mono font-bold text-purple-700">
                        <span className="px-2 py-0.5 bg-purple-50 rounded border border-purple-200">{sub.billingCycle}</span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-black text-rose-700 text-sm">
                        {formatCurrency(sub.amount)}
                      </td>
                      <td className="p-3.5 text-center font-mono font-extrabold text-amber-800 bg-amber-50/50 rounded-lg">
                        {sub.renewalDueDate}
                      </td>
                      <td className="p-3.5 text-slate-600">{sub.paymentMethod}</td>
                      <td className="p-3.5 text-right no-print">
                        <button
                          onClick={() => deleteSubscription(sub.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Delete subscription"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {subscriptions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                        No software subscriptions recorded yet. Click "Add Subscription" above to log AWS Cloud, Gemini, Figma, or GitHub accounts.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Company EMI Modal */}
      {showEMIModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" /> Add Company Asset EMI Loan
              </h3>
              <button onClick={() => setShowEMIModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleEMISubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Asset / Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple MacBook Pro M3 Max Workstations"
                  value={emiProductName}
                  onChange={(e) => setEmiProductName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-extrabold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Lender Bank / Vendor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Commercial Finance"
                  value={emiVendorName}
                  onChange={(e) => setEmiVendorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Monthly EMI Amount (INR)</label>
                  <input
                    type="number"
                    required
                    value={monthlyEMIAmount}
                    onChange={(e) => setMonthlyEMIAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-extrabold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Total Tenure (Months)</label>
                  <input
                    type="number"
                    required
                    value={totalTenureMonths}
                    onChange={(e) => setTotalTenureMonths(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-extrabold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Loan Start Date</label>
                  <input
                    type="date"
                    required
                    value={emiStartDate}
                    onChange={(e) => setEmiStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Bank Account to Deduct</label>
                  <select
                    value={emiBankAccountId}
                    onChange={(e) => setEmiBankAccountId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold text-xs truncate"
                  >
                    <option value="">Corporate Bank Account...</option>
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} (#{b.accountNumber.slice(-4)}) — {formatCurrency(b.balanceINR)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-[10.5px] text-purple-700 font-extrabold bg-purple-50 p-2.5 rounded-xl border border-purple-200">
                ⚡ Note: On the 3rd of every month, this EMI will automatically debit from company revenue as an operating expense.
              </p>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEMIModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl shadow-md shadow-purple-600/20"
                >
                  Add Company EMI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subscription Modal */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" /> Add Software / Cloud Subscription
              </h3>
              <button onClick={() => setShowSubModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSubSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Product / Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS GPU Cluster / OpenAI Enterprise"
                  value={subProductName}
                  onChange={(e) => setSubProductName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-extrabold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Billing Cycle</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="MONTHLY">MONTHLY</option>
                    <option value="YEARLY">YEARLY</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Amount (INR)</label>
                  <input
                    type="number"
                    required
                    value={subAmount}
                    onChange={(e) => setSubAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-extrabold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">⏳ Renewal Due Date</label>
                  <input
                    type="date"
                    required
                    value={renewalDueDate}
                    onChange={(e) => setRenewalDueDate(e.target.value)}
                    className="w-full bg-amber-50 border border-amber-300 rounded-xl p-2.5 text-amber-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Bank Account to Deduct *</label>
                  <select
                    value={subBankAccountId}
                    onChange={(e) => {
                      setSubBankAccountId(e.target.value);
                      const chosenBank = bankAccounts.find(b => b.id === e.target.value);
                      if (chosenBank) {
                        setPaymentMethod(`${chosenBank.bankName} (${chosenBank.accountName} #${chosenBank.accountNumber.slice(-4)})`);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold text-xs truncate"
                  >
                    <option value="">Select Corporate Bank Account...</option>
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} - {b.accountName} (#{b.accountNumber.slice(-4)})
                      </option>
                    ))}
                    {bankAccounts.length === 0 && (
                      <option value="DEFAULT">Axis Bank Corporate Account (#4321)</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl shadow-md shadow-purple-600/20"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
