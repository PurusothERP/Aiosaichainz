import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PayrollRecord } from '../../types';
import { CreditCard, Printer, Users, Laptop, X } from 'lucide-react';

interface Props {
  targetMonth: string; // e.g. "August 2026"
  onClose: () => void;
  onSelectPaySlipForPrint: (pay: PayrollRecord) => void;
}

export const MonthPayrollModal: React.FC<Props> = ({ targetMonth, onClose, onSelectPaySlipForPrint }) => {
  const { payroll, formatCurrency } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'FULL_TIME' | 'FREELANCER'>('FULL_TIME');

  const monthPayrolls = payroll.filter(p => p.month === targetMonth);
  const fullTimePayrolls = monthPayrolls.filter(p => p.employeeType === 'FULL_TIME');
  const freelancerPayrolls = monthPayrolls.filter(p => p.employeeType === 'FREELANCER');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl p-6 shadow-2xl space-y-5 my-8">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" /> Processed Payroll Breakdown ({targetMonth})
            </h3>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              Detailed breakdown for Full-time Employees and Freelancers with Statutory & Tax items.
            </p>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">✕</button>
        </div>

        {/* Separate Tabs for Full-Time vs. Freelancer */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('FULL_TIME')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition ${
              activeSubTab === 'FULL_TIME' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'
            }`}
          >
            <Users className="w-4 h-4" /> Full-Time Staff Paid ({fullTimePayrolls.length})
          </button>

          <button
            onClick={() => setActiveSubTab('FREELANCER')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition ${
              activeSubTab === 'FREELANCER' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'
            }`}
          >
            <Laptop className="w-4 h-4" /> Freelancers Paid ({freelancerPayrolls.length})
          </button>
        </div>

        {/* 1. FULL-TIME STAFF TAB */}
        {activeSubTab === 'FULL_TIME' && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Emp No & Name</th>
                    <th className="p-3">Gross Salary</th>
                    <th className="p-3">ESI</th>
                    <th className="p-3">PF</th>
                    <th className="p-3">TDS Tax</th>
                    <th className="p-3">PT</th>
                    <th className="p-3">Total Deductions</th>
                    <th className="p-3">Net Paid</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {fullTimePayrolls.map(pay => (
                    <tr key={pay.id} className="hover:bg-slate-50">
                      <td className="p-3 font-sans">
                        <p className="font-extrabold text-slate-900">{pay.employeeName}</p>
                        <p className="text-[10px] text-slate-500 font-bold">{pay.employeeId}</p>
                      </td>
                      <td className="p-3 font-bold">{formatCurrency(pay.baseAmount)}</td>
                      <td className="p-3 text-slate-500">{formatCurrency(pay.esiDeduction)}</td>
                      <td className="p-3 text-slate-500">{formatCurrency(pay.pfDeduction)}</td>
                      <td className="p-3 text-slate-500">{formatCurrency(pay.incomeTaxDeduction)}</td>
                      <td className="p-3 text-slate-500">{formatCurrency(pay.ptDeduction)}</td>
                      <td className="p-3 text-rose-700 font-bold">-{formatCurrency(pay.totalDeductions)}</td>
                      <td className="p-3 font-black text-emerald-700">{formatCurrency(pay.netPayable)}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            onSelectPaySlipForPrint(pay);
                            onClose();
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-sans font-bold flex items-center gap-1 shadow-sm"
                        >
                          <Printer className="w-3 h-3" /> Payslip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. FREELANCERS TAB */}
        {activeSubTab === 'FREELANCER' && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Emp No & Name</th>
                    <th className="p-3">Worked Hours</th>
                    <th className="p-3">Gross Earnings</th>
                    <th className="p-3">10% TDS Deducted</th>
                    <th className="p-3">Net Payout</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {freelancerPayrolls.map(pay => (
                    <tr key={pay.id} className="hover:bg-slate-50">
                      <td className="p-3 font-sans">
                        <p className="font-extrabold text-slate-900">{pay.employeeName}</p>
                        <p className="text-[10px] text-slate-500 font-bold">{pay.employeeId}</p>
                      </td>
                      <td className="p-3 font-bold text-slate-800">{pay.totalHoursWorked || 0} hrs</td>
                      <td className="p-3 font-bold">{formatCurrency(pay.baseAmount)}</td>
                      <td className="p-3 text-rose-700 font-bold">-{formatCurrency(pay.freelancerTaxDeduction)}</td>
                      <td className="p-3 font-black text-emerald-700">{formatCurrency(pay.netPayable)}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            onSelectPaySlipForPrint(pay);
                            onClose();
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-sans font-bold flex items-center gap-1 shadow-sm"
                        >
                          <Printer className="w-3 h-3" /> Payslip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
