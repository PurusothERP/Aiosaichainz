import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MetricDetailModal, MetricType } from './MetricDetailModal';
import {
  FileText,
  AlertCircle,
  Receipt,
  BookOpen,
  Calendar,
  Building,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertOctagon
} from 'lucide-react';

export const FinancialSummary: React.FC = () => {
  const { documents, payables, expenses, ledger, gstRecords, formatCurrency, getInvoiceTotalPaid, getInvoiceBalance } = useApp();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'RECEIVABLE' | 'PAYABLE' | 'GST' | 'LEDGER' | 'CONSOLIDATED'>('OVERVIEW');
  const [selectedMetric, setSelectedMetric] = useState<MetricType | null>(null);

  const pendingInvoices = documents.filter(d => d.docType === 'INVOICE' && d.status !== 'PAID' && d.status !== 'CANCELLED' && d.status !== 'UNCOLLECTIBLE' && d.status !== 'UNRECOVERABLE');
  const accountsReceivableTotal = pendingInvoices.reduce((sum, d) => sum + getInvoiceBalance(d.id), 0);

  const unrecoverableInvoices = documents.filter(d => (d.status === 'UNCOLLECTIBLE' || d.status === 'UNRECOVERABLE'));
  const totalUnrecoverable = unrecoverableInvoices.reduce((sum, d) => sum + d.total, 0);

  const pendingPayables = payables.filter(p => p.status === 'PENDING');
  const accountsPayableTotal = pendingPayables.reduce((sum, p) => sum + p.amount, 0);

  const totalGSTCollected = gstRecords.reduce((sum, g) => sum + g.totalGST, 0);

  const handleWhatsAppReminder = (clientName: string, phone: string, amount: number, invoiceNo: string) => {
    const text = encodeURIComponent(
      `Hello ${clientName},\n\n` +
      `This is a payment reminder for Invoice *${invoiceNo}* from *Aichainz*.\n` +
      `Amount Pending: *${formatCurrency(amount)}*\n\n` +
      `Please contact us at +91 7502774016 for settlement.`
    );
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    window.open(cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`, '_blank');
  };

  const consolidatedData = ['2026-07', '2026-08', '2026-09'].map(m => {
    const revenue = documents
      .filter(d => d.docType === 'INVOICE' && d.status === 'PAID' && (d.issueDate || '').startsWith(m))
      .reduce((sum, d) => sum + d.subtotal, 0);

    const expTotal = expenses
      .filter(e => e.date.startsWith(m))
      .reduce((sum, e) => sum + e.amount, 0);

    const gstCollected = gstRecords
      .filter(g => g.date.startsWith(m))
      .reduce((sum, g) => sum + g.totalGST, 0);

    return {
      month: m === '2026-07' ? 'July 2026' : m === '2026-08' ? 'August 2026' : 'September 2026',
      revenue,
      expenses: expTotal,
      netProfit: revenue - expTotal,
      gstCollected
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" /> Executive Financial & Accounts Summary
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Accounts Receivable, Unrecoverable Bad Debt Write-Offs, Accounts Payable, GST & General Ledger.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {(['OVERVIEW', 'RECEIVABLE', 'PAYABLE', 'GST', 'LEDGER', 'CONSOLIDATED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Accounts Receivable Widget */}
          <div
            onClick={() => setSelectedMetric('ACCOUNTS_RECEIVABLE')}
            className="bg-white p-5 rounded-2xl border border-slate-200 border-l-4 border-l-amber-500 shadow-sm hover:shadow-xl hover:border-amber-400 hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider block">
                  ACCOUNTS RECEIVABLE
                </span>
                <p className="text-3xl font-black text-slate-900 mt-1 font-mono">
                  {formatCurrency(accountsReceivableTotal)}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-3 font-medium">
              {pendingInvoices.length} Outstanding client invoice(s).
            </p>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-amber-600 font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Inspect Receivable Audit</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 2: Unrecoverable Bad Debt Widget */}
          <div
            onClick={() => setSelectedMetric('UNRECOVERABLE_BAD_DEBT')}
            className="bg-white p-5 rounded-2xl border border-slate-200 border-l-4 border-l-rose-600 shadow-sm hover:shadow-xl hover:border-rose-400 hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[11px] font-black text-rose-700 uppercase tracking-wider block">
                  UNRECOVERABLE BAD DEBT
                </span>
                <p className="text-3xl font-black text-rose-800 mt-1 font-mono">
                  {formatCurrency(totalUnrecoverable)}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <AlertOctagon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-3 font-medium">
              {unrecoverableInvoices.length} Defaulted / Account Closed.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-rose-600 font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Inspect Written-off Accounts</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 3: Accounts Payable Widget */}
          <div
            onClick={() => setSelectedMetric('ACCOUNTS_PAYABLE')}
            className="bg-white p-5 rounded-2xl border border-slate-200 border-l-4 border-l-rose-500 shadow-sm hover:shadow-xl hover:border-rose-400 hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[11px] font-black text-rose-700 uppercase tracking-wider block">
                  ACCOUNTS PAYABLE
                </span>
                <p className="text-3xl font-black text-slate-900 mt-1 font-mono">
                  {formatCurrency(accountsPayableTotal)}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-3 font-medium">
              {pendingPayables.length} Pending vendor bill(s).
            </p>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-rose-600 font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Inspect Vendor Bills</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 4: GST Received Total Widget */}
          <div
            onClick={() => setSelectedMetric('GST_RECEIVED')}
            className="bg-white p-5 rounded-2xl border border-slate-200 border-l-4 border-l-purple-600 shadow-sm hover:shadow-xl hover:border-purple-400 hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[11px] font-black text-purple-700 uppercase tracking-wider block">
                  GST RECEIVED TOTAL
                </span>
                <p className="text-3xl font-black text-slate-900 mt-1 font-mono">
                  {formatCurrency(totalGSTCollected)}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Building className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-3 font-medium">
              Collected tax reserves for filing.
            </p>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-purple-600 font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Inspect GST Filings</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      )}

      {/* Detail Tab Views */}
      {activeTab === 'RECEIVABLE' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Accounts Receivable Detailed Register</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3">Invoice No</th>
                  <th className="p-3">Client Company</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 font-mono text-right">Amount</th>
                  <th className="p-3 text-right">Reminder Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {pendingInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-blue-600">{inv.docNumber}</td>
                    <td className="p-3 font-black text-slate-900">{inv.clientCompany}</td>
                    <td className="p-3 font-mono text-rose-600 font-bold">{inv.dueDate}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-extrabold text-amber-700">{formatCurrency(inv.total)}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleWhatsAppReminder(inv.clientName, inv.clientPhone, inv.total, inv.docNumber)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 shadow-sm"
                      >
                        <MessageSquare className="w-3 h-3" /> Remind Client
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'PAYABLE' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Accounts Payable Vendor Register</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3">Vendor / Payee</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Bill No</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3 font-mono text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {pendingPayables.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-50">
                    <td className="p-3 font-black text-slate-900">{pay.vendorName}</td>
                    <td className="p-3 font-bold text-blue-600">{pay.category}</td>
                    <td className="p-3 font-mono text-slate-500">{pay.invoiceNumber}</td>
                    <td className="p-3 font-mono text-rose-600 font-bold">{pay.dueDate}</td>
                    <td className="p-3 text-right font-mono font-extrabold text-rose-700">{formatCurrency(pay.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'GST' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">GST Statutory Tax Collected Register</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3">Invoice No</th>
                  <th className="p-3">Client Company</th>
                  <th className="p-3">GSTIN</th>
                  <th className="p-3 font-mono text-right">Taxable</th>
                  <th className="p-3 font-mono text-right">CGST</th>
                  <th className="p-3 font-mono text-right">SGST</th>
                  <th className="p-3 font-mono text-right">Total GST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {gstRecords.map(gst => (
                  <tr key={gst.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-blue-600">{gst.invoiceNo}</td>
                    <td className="p-3 font-sans font-black text-slate-900">{gst.clientName}</td>
                    <td className="p-3 text-slate-500">{gst.gstin}</td>
                    <td className="p-3 text-right font-bold text-slate-800">{formatCurrency(gst.taxableValue)}</td>
                    <td className="p-3 text-right text-slate-600">{formatCurrency(gst.cgst)}</td>
                    <td className="p-3 text-right text-slate-600">{formatCurrency(gst.sgst)}</td>
                    <td className="p-3 text-right font-extrabold text-purple-700">{formatCurrency(gst.totalGST)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'LEDGER' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Executive General Ledger Audit Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Ref No</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Category & Description</th>
                  <th className="p-3 font-mono text-right">Debit</th>
                  <th className="p-3 font-mono text-right">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {ledger.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500 font-bold">{entry.date}</td>
                    <td className="p-3 font-bold text-blue-600">{entry.referenceDocNo || entry.id}</td>
                    <td className="p-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        entry.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="p-3 font-sans font-medium text-slate-900">{entry.description}</td>
                    <td className="p-3 text-right font-bold text-rose-700">
                      {entry.type === 'DEBIT' ? `-${formatCurrency(entry.amount)}` : '-'}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-700">
                      {entry.type === 'CREDIT' ? `+${formatCurrency(entry.amount)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CONSOLIDATED' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Month-wise Consolidated Financial Report</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3">Fiscal Month</th>
                  <th className="p-3 font-mono text-right">Gross Revenue</th>
                  <th className="p-3 font-mono text-right">Operating Outflow</th>
                  <th className="p-3 font-mono text-right">Net Profit</th>
                  <th className="p-3 font-mono text-right">GST Reserves</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {consolidatedData.map((data, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-sans font-black text-slate-900">{data.month}</td>
                    <td className="p-3 text-right font-bold text-emerald-700">{formatCurrency(data.revenue)}</td>
                    <td className="p-3 text-right font-bold text-rose-700">{formatCurrency(data.expenses)}</td>
                    <td className="p-3 text-right font-extrabold text-indigo-800">{formatCurrency(data.netProfit)}</td>
                    <td className="p-3 text-right font-bold text-purple-700">{formatCurrency(data.gstCollected)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* On-Click Popup Detail Modal */}
      {selectedMetric && (
        <MetricDetailModal
          type={selectedMetric}
          onClose={() => setSelectedMetric(null)}
        />
      )}
    </div>
  );
};
