import React from 'react';
import { useApp } from '../../context/AppContext';
import { Lead, BusinessDocument, Expense, Payable, GSTEntry, Employee } from '../../types';
import {
  Target,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Receipt,
  Building,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  Mail,
  Printer,
  ShieldCheck,
  Calendar,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Briefcase,
  FileText,
  AlertOctagon,
  Users,
  PieChart,
  BarChart3,
  Server,
  Code2,
  Award,
  Plane
} from 'lucide-react';

export type MetricType =
  | 'PIPELINE_LEADS'
  | 'TOTAL_REVENUE'
  | 'TOTAL_EXPENSES'
  | 'NET_PROFIT'
  | 'ACCOUNTS_RECEIVABLE'
  | 'ACCOUNTS_PAYABLE'
  | 'GST_RECEIVED'
  | 'UNRECOVERABLE_BAD_DEBT'
  | 'TOTAL_WORKFORCE'
  | 'FULLTIME_STAFF'
  | 'FREELANCERS'
  | 'MONTHLY_REVENUE_CHART'
  | 'CATEGORY_REVENUE_CHART'
  | 'STAFF_PAYROLL_EXPENSE'
  | 'AWS_CLOUD_EXPENSE'
  | 'FREELANCER_EXPENSE'
  | 'SOFTWARE_TOOLS_EXPENSE'
  | 'EVENTS_TRAVEL'
  | 'PROJECT_PROFIT';

interface Props {
  type: MetricType;
  onClose: () => void;
  onSelectLeadForQuote?: (lead: Lead) => void;
}

export const MetricDetailModal: React.FC<Props> = ({ type, onClose, onSelectLeadForQuote }) => {
  const {
    leads,
    documents,
    expenses,
    payables,
    gstRecords,
    employees,
    payroll,
    eventRecords,
    projectPLRecords,
    getCompanyPLStatement,
    formatCurrency,
    getInvoiceTotalPaid,
    getInvoiceBalance
  } = useApp();

  const completedLeads = leads.filter(l => l.stage === 'COMPLETED');
  const inProgressLeads = leads.filter(l => l.stage === 'IN_PROGRESS');

  const totalPipelineValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
  
  // Realized Client Revenue Invoices
  const paidInvoices = documents.filter(d => d.docType === 'INVOICE' && (d.status === 'PAID' || getInvoiceTotalPaid(d.id) > 0 || (d.advanceCollectedAmount || 0) > 0));

  const totalRevenue = documents
    .filter(d => d.docType === 'INVOICE')
    .reduce((sum, d) => sum + getInvoiceTotalPaid(d.id), 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const marginPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  // Accounts Receivable Invoices (Outstanding balance > 0)
  const pendingInvoices = documents.filter(d => d.docType === 'INVOICE' && d.status !== 'CANCELLED' && d.status !== 'UNCOLLECTIBLE' && d.status !== 'UNRECOVERABLE' && getInvoiceBalance(d.id) > 0);
  const totalReceivable = pendingInvoices.reduce((sum, d) => sum + getInvoiceBalance(d.id), 0);

  // Project P&L Breakdown
  const companyPL = getCompanyPLStatement();
  const trackedProjects = companyPL.projectBreakdown;

  const unrecoverableInvoices = documents.filter(d => (d.status === 'UNCOLLECTIBLE' || d.status === 'UNRECOVERABLE'));
  const totalUnrecoverable = unrecoverableInvoices.reduce((sum, d) => sum + d.total, 0);

  const pendingPayables = payables.filter(p => p.status === 'PENDING');
  const totalPayable = pendingPayables.reduce((sum, p) => sum + p.amount, 0);

  const totalGST = gstRecords.reduce((sum, g) => sum + g.totalGST, 0);

  const fullTimeEmployees = employees.filter(e => e.type === 'FULL_TIME');
  const freelancers = employees.filter(e => e.type === 'FREELANCER');

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center bg-slate-900 text-white p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              {type === 'PIPELINE_LEADS' && <Target className="w-5 h-5" />}
              {type === 'TOTAL_REVENUE' && <TrendingUp className="w-5 h-5 text-emerald-400" />}
              {type === 'TOTAL_EXPENSES' && <TrendingDown className="w-5 h-5 text-rose-400" />}
              {type === 'NET_PROFIT' && <DollarSign className="w-5 h-5 text-indigo-400" />}
              {type === 'ACCOUNTS_RECEIVABLE' && <AlertCircle className="w-5 h-5 text-amber-400" />}
              {type === 'ACCOUNTS_PAYABLE' && <Receipt className="w-5 h-5 text-rose-400" />}
              {type === 'GST_RECEIVED' && <Building className="w-5 h-5 text-purple-400" />}
              {type === 'UNRECOVERABLE_BAD_DEBT' && <AlertOctagon className="w-5 h-5 text-rose-500" />}
              {(type === 'TOTAL_WORKFORCE' || type === 'FULLTIME_STAFF' || type === 'FREELANCERS') && <Users className="w-5 h-5 text-blue-400" />}
              {(type === 'MONTHLY_REVENUE_CHART' || type === 'CATEGORY_REVENUE_CHART') && <BarChart3 className="w-5 h-5 text-purple-400" />}
              {(type === 'STAFF_PAYROLL_EXPENSE' || type === 'AWS_CLOUD_EXPENSE' || type === 'FREELANCER_EXPENSE' || type === 'SOFTWARE_TOOLS_EXPENSE') && <TrendingDown className="w-5 h-5 text-rose-400" />}
              {type === 'EVENTS_TRAVEL' && <Award className="w-5 h-5 text-purple-400" />}
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                {type === 'PIPELINE_LEADS' && 'Sales Pipeline & Deal Flow Audit'}
                {type === 'TOTAL_REVENUE' && 'Realized Client Revenue & Collections Ledger'}
                {type === 'TOTAL_EXPENSES' && 'Operational Outflow & Expense Audit'}
                {type === 'NET_PROFIT' && 'Executive Net Profit & Margin Breakdown'}
                {type === 'ACCOUNTS_RECEIVABLE' && 'Accounts Receivable & Pending Invoices'}
                {type === 'ACCOUNTS_PAYABLE' && 'Accounts Payable & Vendor Bills Audit'}
                {type === 'GST_RECEIVED' && 'GST Compliance & Tax Reserves Audit'}
                {type === 'UNRECOVERABLE_BAD_DEBT' && 'Unrecoverable Bad Debt & Write-Off Audit'}
                {type === 'TOTAL_WORKFORCE' && 'Total Workforce Roster & Payroll Audit'}
                {type === 'FULLTIME_STAFF' && 'Full-Time Software Engineering Team'}
                {type === 'FREELANCERS' && 'Freelancer Staffing & Time-Log Audit'}
                {type === 'MONTHLY_REVENUE_CHART' && 'Month-wise Fiscal Revenue & Expense Bar Chart Audit'}
                {type === 'CATEGORY_REVENUE_CHART' && 'Category-wise Revenue Distribution Audit'}
                {type === 'STAFF_PAYROLL_EXPENSE' && 'Staff Monthly Payroll Outflow Audit'}
                {type === 'AWS_CLOUD_EXPENSE' && 'AWS Cloud & GPU Infrastructure Expense Audit'}
                {type === 'FREELANCER_EXPENSE' && 'Freelancer Hourly Outflow Audit'}
                {type === 'SOFTWARE_TOOLS_EXPENSE' && 'Software Tools & SaaS Subscriptions Audit'}
                {type === 'EVENTS_TRAVEL' && 'Events & Travel ROI Audit'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">Detailed breakdown of enterprise accounts and live transactional metrics.</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 text-lg font-bold">✕</button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {/* PIPELINE LEADS */}
          {type === 'PIPELINE_LEADS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-bold block uppercase text-[10px]">Total Pipeline Deals</span>
                  <span className="text-xl font-black text-slate-900">{leads.length} Deals</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block uppercase text-[10px]">Pipeline Gross Value</span>
                  <span className="text-xl font-black text-blue-700 font-mono">{formatCurrency(totalPipelineValue)}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block uppercase text-[10px]">Completed Revenue</span>
                  <span className="text-xl font-black text-emerald-700 font-mono">{completedLeads.length} Completed</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block uppercase text-[10px]">Active Negotiations</span>
                  <span className="text-xl font-black text-amber-700 font-mono">{inProgressLeads.length} In Progress</span>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Client & Company</th>
                      <th className="p-3">Services Scope</th>
                      <th className="p-3">Office</th>
                      <th className="p-3">Stage</th>
                      <th className="p-3 font-mono text-right">Deal Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {leads.map(lead => (
                      <tr key={lead.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <p className="font-extrabold text-slate-900">{lead.companyName}</p>
                          <p className="text-slate-500 text-[10.5px]">{lead.clientName} • {lead.email}</p>
                        </td>
                        <td className="p-3 text-slate-700 font-bold">{lead.projectDescription}</td>
                        <td className="p-3 font-bold text-slate-800">{lead.office}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            lead.stage === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                            lead.stage === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {lead.stage}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-black text-emerald-700">{formatCurrency(lead.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TOTAL REVENUE */}
          {type === 'TOTAL_REVENUE' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-300 flex justify-between items-center">
                <div>
                  <span className="text-xs text-emerald-800 font-extrabold uppercase block">Realized Client Revenue & Collections</span>
                  <span className="text-2xl font-black text-emerald-800 font-mono">{formatCurrency(totalRevenue)}</span>
                </div>
                <span className="px-3 py-1 bg-emerald-700 text-white font-extrabold text-xs rounded-lg shadow-sm">
                  {paidInvoices.length} Client Collections Realized
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Invoice No</th>
                      <th className="p-3">Client Company</th>
                      <th className="p-3">Issue Date</th>
                      <th className="p-3">Office Hub</th>
                      <th className="p-3 text-right">Invoiced Total</th>
                      <th className="p-3 text-right">Paid Realized</th>
                      <th className="p-3 text-right">Pending Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {paidInvoices.map(doc => {
                      const paidVal = getInvoiceTotalPaid(doc.id);
                      const balVal = getInvoiceBalance(doc.id);
                      return (
                        <tr key={doc.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-blue-700">{doc.docNumber}</td>
                          <td className="p-3 font-sans font-extrabold text-slate-900">{doc.clientCompany}</td>
                          <td className="p-3 text-slate-500 font-bold">{doc.issueDate}</td>
                          <td className="p-3 font-sans font-bold text-slate-800">{doc.officeLocation} Hub</td>
                          <td className="p-3 text-right font-semibold text-slate-600">{formatCurrency(doc.total)}</td>
                          <td className="p-3 text-right font-black text-emerald-700">+{formatCurrency(paidVal)}</td>
                          <td className="p-3 text-right font-bold text-amber-700">{formatCurrency(balVal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* WORKFORCE ROSTER (TOTAL_WORKFORCE, FULLTIME_STAFF, FREELANCERS) */}
          {(type === 'TOTAL_WORKFORCE' || type === 'FULLTIME_STAFF' || type === 'FREELANCERS') && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-300 flex justify-between items-center">
                <div>
                  <span className="text-xs text-blue-900 font-extrabold uppercase block">
                    {type === 'TOTAL_WORKFORCE' ? 'Total Active Workforce' : type === 'FULLTIME_STAFF' ? 'Full-Time Software Engineers' : 'Hourly Freelancers'}
                  </span>
                  <span className="text-2xl font-black text-blue-900 font-mono">
                    {type === 'TOTAL_WORKFORCE' ? employees.length : type === 'FULLTIME_STAFF' ? fullTimeEmployees.length : freelancers.length} Staff Members
                  </span>
                </div>
                <span className="px-3 py-1 bg-blue-700 text-white font-extrabold text-xs rounded-lg shadow-sm">
                  Global Offices: India / UAE / Rwanda
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Employee Name</th>
                      <th className="p-3">Designation</th>
                      <th className="p-3">Office Hub</th>
                      <th className="p-3">Employment Type</th>
                      <th className="p-3 font-mono text-right">Compensation Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {(type === 'FULLTIME_STAFF' ? fullTimeEmployees : type === 'FREELANCERS' ? freelancers : employees).map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <p className="font-extrabold text-slate-900">{emp.name}</p>
                          <p className="text-slate-500 text-[10.5px]">{emp.email} • {emp.phone}</p>
                        </td>
                        <td className="p-3 font-bold text-blue-700">{emp.designation}</td>
                        <td className="p-3 text-slate-800 font-bold">{emp.officeLocation} Hub</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            emp.type === 'FULL_TIME' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {emp.type}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-black text-slate-900">
                          {emp.type === 'FULL_TIME' ? formatCurrency(emp.monthlySalary || 0) + '/mo' : formatCurrency(emp.hourlyRate || 0) + '/hr'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MONTHLY EXPENSES / STAFF PAYROLL / AWS / FREELANCERS / SOFTWARE */}
          {(type === 'TOTAL_EXPENSES' || type === 'STAFF_PAYROLL_EXPENSE' || type === 'AWS_CLOUD_EXPENSE' || type === 'FREELANCER_EXPENSE' || type === 'SOFTWARE_TOOLS_EXPENSE') && (
            <div className="space-y-4">
              <div className="bg-rose-50 p-4 rounded-xl border border-rose-300 flex justify-between items-center">
                <div>
                  <span className="text-xs text-rose-800 font-extrabold uppercase block">Operational Outflow Breakdown</span>
                  <span className="text-2xl font-black text-rose-800 font-mono">{formatCurrency(totalExpenses)}</span>
                </div>
                <span className="px-3 py-1 bg-rose-700 text-white font-extrabold text-xs rounded-lg shadow-sm">
                  {expenses.length} Logged Expenses
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Expense Item / Title</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Vendor / Payee</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Outflow Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {expenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-slate-50">
                        <td className="p-3 font-sans font-extrabold text-slate-900">{exp.title}</td>
                        <td className="p-3 font-sans font-bold text-blue-700">{exp.category}</td>
                        <td className="p-3 font-sans text-slate-700">{exp.paidTo}</td>
                        <td className="p-3 text-slate-500 font-bold">{exp.date}</td>
                        <td className="p-3 text-right font-black text-rose-700">-{formatCurrency(exp.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* NET PROFIT */}
          {type === 'NET_PROFIT' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-300 flex justify-between items-center">
                <div>
                  <span className="text-xs text-indigo-900 font-extrabold uppercase block">Net Operating Surplus</span>
                  <span className="text-2xl font-black text-indigo-900 font-mono">{formatCurrency(netProfit)}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-bold block">Profit Margin Rate</span>
                  <span className="text-xl font-black text-emerald-700 font-mono">{marginPercent}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs text-slate-500 uppercase font-bold block">Realized Inflow</span>
                  <p className="text-xl font-black text-emerald-700 font-mono">+{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs text-slate-500 uppercase font-bold block">Operating Outflow</span>
                  <p className="text-xl font-black text-rose-700 font-mono">-{formatCurrency(totalExpenses)}</p>
                </div>
              </div>
            </div>
          )}

          {/* ACCOUNTS RECEIVABLE */}
          {type === 'ACCOUNTS_RECEIVABLE' && (
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-300 flex justify-between items-center">
                <div>
                  <span className="text-xs text-amber-900 font-extrabold uppercase block">Total Accounts Receivable</span>
                  <span className="text-2xl font-black text-amber-900 font-mono">{formatCurrency(totalReceivable)}</span>
                </div>
                <span className="px-3 py-1 bg-amber-600 text-white font-extrabold text-xs rounded-lg shadow-sm">
                  {pendingInvoices.length} Pending Invoices
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Invoice No</th>
                      <th className="p-3">Client Company</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3">Pending Amount</th>
                      <th className="p-3 text-right">Reminder Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {pendingInvoices.map(doc => {
                      const pendingBal = getInvoiceBalance(doc.id);
                      return (
                        <tr key={doc.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-blue-700">{doc.docNumber}</td>
                          <td className="p-3 font-sans font-extrabold text-slate-900">{doc.clientCompany}</td>
                          <td className="p-3 text-rose-700 font-bold">{doc.dueDate}</td>
                          <td className="p-3 font-black text-amber-700">{formatCurrency(pendingBal)}</td>
                          <td className="p-3 text-right font-sans">
                            <button
                              onClick={() => handleWhatsAppReminder(doc.clientName, doc.clientPhone, pendingBal, doc.docNumber)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 shadow-sm"
                            >
                              <MessageSquare className="w-3 h-3" /> WhatsApp Reminder
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* UNRECOVERABLE BAD DEBT */}
          {type === 'UNRECOVERABLE_BAD_DEBT' && (
            <div className="space-y-4">
              <div className="bg-rose-50 p-4 rounded-xl border border-rose-300 flex justify-between items-center">
                <div>
                  <span className="text-xs text-rose-900 font-extrabold uppercase block">Unrecoverable Bad Debt Write-Offs</span>
                  <span className="text-2xl font-black text-rose-900 font-mono">{formatCurrency(totalUnrecoverable)}</span>
                </div>
                <span className="px-3 py-1 bg-rose-700 text-white font-extrabold text-xs rounded-lg shadow-sm">
                  {unrecoverableInvoices.length} Account(s) Closed
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Invoice Ref</th>
                      <th className="p-3">Client Company & Representative</th>
                      <th className="p-3">Issue Date</th>
                      <th className="p-3">Reason / Status</th>
                      <th className="p-3 text-right">Written-Off Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {unrecoverableInvoices.map(doc => (
                      <tr key={doc.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-rose-700">{doc.docNumber}</td>
                        <td className="p-3 font-sans">
                          <p className="font-extrabold text-slate-900">{doc.clientCompany}</p>
                          <p className="text-slate-500 text-[10.5px]">{doc.clientName} • {doc.clientPhone}</p>
                        </td>
                        <td className="p-3 text-slate-500">{doc.issueDate}</td>
                        <td className="p-3 font-sans">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-900 uppercase border border-rose-300 block w-fit mb-0.5">
                            ACCOUNT CLOSED (BAD DEBT)
                          </span>
                          <span className="text-[10px] text-slate-500">{doc.unrecoverableReason || 'Client Insolvency / Non-Payment'}</span>
                        </td>
                        <td className="p-3 text-right font-black text-rose-800">-{formatCurrency(doc.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ACCOUNTS PAYABLE */}
          {type === 'ACCOUNTS_PAYABLE' && (
            <div className="space-y-4">
              <div className="bg-rose-50 p-4 rounded-xl border border-rose-300 flex justify-between items-center">
                <div>
                  <span className="text-xs text-rose-900 font-extrabold uppercase block">Total Pending Accounts Payable</span>
                  <span className="text-2xl font-black text-rose-900 font-mono">{formatCurrency(totalPayable)}</span>
                </div>
                <span className="px-3 py-1 bg-rose-700 text-white font-extrabold text-xs rounded-lg shadow-sm">
                  {pendingPayables.length} Pending Bills
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Vendor / Payee</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3 text-right">Bill Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {pendingPayables.map(pay => (
                      <tr key={pay.id} className="hover:bg-slate-50">
                        <td className="p-3 font-sans font-extrabold text-slate-900">{pay.vendorName}</td>
                        <td className="p-3 font-sans font-bold text-blue-700">{pay.category}</td>
                        <td className="p-3 text-rose-700 font-bold">{pay.dueDate}</td>
                        <td className="p-3 text-right font-black text-rose-700">{formatCurrency(pay.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GST RECEIVED */}
          {type === 'GST_RECEIVED' && (
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-300 flex justify-between items-center">
                <div>
                  <span className="text-xs text-purple-900 font-extrabold uppercase block">Total Collected GST Reserves</span>
                  <span className="text-2xl font-black text-purple-900 font-mono">{formatCurrency(totalGST)}</span>
                </div>
                <span className="px-3 py-1 bg-purple-700 text-white font-extrabold text-xs rounded-lg shadow-sm">
                  18% Statutory GST Compliance
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Invoice No</th>
                      <th className="p-3">Client Name</th>
                      <th className="p-3">Taxable Value</th>
                      <th className="p-3 text-right">Total GST Collected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {gstRecords.map(gst => (
                      <tr key={gst.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-blue-700">{gst.invoiceNo}</td>
                        <td className="p-3 font-sans font-extrabold text-slate-900">{gst.clientName}</td>
                        <td className="p-3 text-slate-700">{formatCurrency(gst.taxableValue)}</td>
                        <td className="p-3 text-right font-black text-purple-800">{formatCurrency(gst.totalGST)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EVENTS & TRAVEL ROI */}
          {type === 'EVENTS_TRAVEL' && (
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 flex justify-between items-center text-xs">
                <div>
                  <span className="font-extrabold text-purple-900 block text-sm">Total Events Attended: {eventRecords.length} Events</span>
                  <span className="text-purple-700 font-bold">Acquired {eventRecords.reduce((sum, e) => sum + e.outcomeLeadsCount, 0)} Enterprise Leads</span>
                </div>
                <div className="text-right font-mono font-black">
                  <p className="text-rose-700">Total Spend: -{formatCurrency(eventRecords.reduce((sum, e) => sum + e.totalSpendINR, 0))}</p>
                  <p className="text-emerald-700">Realized Revenue: +{formatCurrency(eventRecords.reduce((sum, e) => sum + e.businessRevenueINR, 0))}</p>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Event Name & Venue</th>
                      <th className="p-3">Dates</th>
                      <th className="p-3 font-mono text-right">Ticket & Travel Spend</th>
                      <th className="p-3 font-mono text-right">Business Revenue</th>
                      <th className="p-3 text-right">Net Profit ROI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {eventRecords.map(evt => (
                      <tr key={evt.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <p className="font-extrabold text-slate-900">{evt.eventName}</p>
                          <p className="text-slate-500 text-[10.5px]">{evt.location} ({evt.personsTraveledCount} Staff)</p>
                        </td>
                        <td className="p-3 font-mono text-slate-600 text-[11px]">{evt.startDate}</td>
                        <td className="p-3 text-right font-mono font-black text-rose-700">-{formatCurrency(evt.totalSpendINR)}</td>
                        <td className="p-3 text-right font-mono font-black text-emerald-700">+{formatCurrency(evt.businessRevenueINR)}</td>
                        <td className="p-3 text-right">
                          <span className={`px-2.5 py-1 rounded-lg font-mono font-black text-xs border ${
                            evt.isProfitable ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}>
                            {evt.isProfitable ? `+${formatCurrency(evt.netProfitINR)}` : `-${formatCurrency(Math.abs(evt.netProfitINR))}`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PROJECT PROFIT & LOSS AUDIT VIEW */}
          {type === 'PROJECT_PROFIT' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                <div>
                  <h3 className="text-base font-black text-indigo-900">Project-Wise Profit & Loss (P&L) Ledger Audit</h3>
                  <p className="text-xs text-indigo-700 font-bold">
                    Individual Project Revenue, Advance Collected, Expenses, Allocated Salary Costs, Net Profit, and Margin %
                  </p>
                </div>
                <span className="px-3 py-1.5 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-sm">
                  {trackedProjects.length} Projects Tracked
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Project Code & Name</th>
                      <th className="p-3">Client Company</th>
                      <th className="p-3 font-mono text-right">What We Quoted / Invoiced</th>
                      <th className="p-3 font-mono text-right">Advance / Cash Collected</th>
                      <th className="p-3 font-mono text-right">Actual Spend</th>
                      <th className="p-3 text-right">Net Profit</th>
                      <th className="p-3 text-center">Margin %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {trackedProjects.map(p => {
                      const isProf = p.netProfit >= 0;
                      return (
                        <tr key={p.projectId} className="hover:bg-slate-50">
                          <td className="p-3">
                            <span className="font-mono font-bold text-indigo-700 text-[10.5px] uppercase">{p.projectCode}</span>
                            <p className="font-black text-slate-900">{p.projectName}</p>
                          </td>
                          <td className="p-3">
                            <p className="font-extrabold text-slate-800">{p.clientCompany}</p>
                            <p className="text-slate-500 text-[10.5px]">{p.clientName}</p>
                          </td>
                          <td className="p-3 text-right font-mono font-black text-slate-900">{formatCurrency(p.contractValue || p.invoicedRevenue)}</td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-700">{formatCurrency(p.cashReceived)}</td>
                          <td className="p-3 text-right font-mono font-bold text-rose-700">{formatCurrency(p.totalDirectExpenses)}</td>
                          <td className="p-3 text-right">
                            <span className={`font-mono font-black text-xs ${isProf ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {formatCurrency(p.netProfit)}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${isProf ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {p.netMarginPercent}% Net Margin
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {trackedProjects.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 italic font-sans">
                          No project entries found. Projects are automatically tracked when invoices or quotations are created.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
