import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee, PayrollRecord, FreelancerTimeLog } from '../../types';
import { EmployeeIDCard } from './EmployeeIDCard';
import { DigitalSignature } from '../DigitalSignature';
import { CompanyHeader } from '../CompanyHeader';
import {
  User,
  ShieldCheck,
  CreditCard,
  Clock,
  Printer,
  X,
  FileText,
  Plus,
  CheckCircle2,
  AlertCircle,
  Building,
  Calendar,
  CreditCard as BankIcon,
  Phone,
  Mail,
  MapPin,
  Briefcase
} from 'lucide-react';

interface Props {
  employee: Employee;
  onClose: () => void;
  onSelectPaySlipForPrint: (pay: PayrollRecord) => void;
}

export const EmployeeDetailModal: React.FC<Props> = ({ employee, onClose, onSelectPaySlipForPrint }) => {
  const { payroll, updateEmployeeStatutory, addFreelancerTimeLog, formatCurrency } = useApp();

  const [activeTab, setActiveTab] = useState<'PROFILE' | 'SALARY_HISTORY' | 'ID_CARD' | 'FREELANCER_LOGS'>('PROFILE');

  // Statutory Toggles local state
  const [esiEnabled, setEsiEnabled] = useState(employee.esiEnabled);
  const [pfEnabled, setPfEnabled] = useState(employee.pfEnabled);
  const [incomeTaxEnabled, setIncomeTaxEnabled] = useState(employee.incomeTaxEnabled);
  const [professionalTaxEnabled, setProfessionalTaxEnabled] = useState(employee.professionalTaxEnabled);
  const [freelancerTaxEnabled, setFreelancerTaxEnabled] = useState(employee.freelancerTaxEnabled ?? true);

  // Freelancer Log state
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logHours, setLogHours] = useState(8);
  const [logTask, setLogTask] = useState('');

  // Past Pay Slips for this employee
  const employeePayrolls = payroll.filter(p => p.employeeId === employee.id);

  const handleToggleStatutory = (field: 'esiEnabled' | 'pfEnabled' | 'incomeTaxEnabled' | 'professionalTaxEnabled' | 'freelancerTaxEnabled', val: boolean) => {
    if (field === 'esiEnabled') setEsiEnabled(val);
    if (field === 'pfEnabled') setPfEnabled(val);
    if (field === 'incomeTaxEnabled') setIncomeTaxEnabled(val);
    if (field === 'professionalTaxEnabled') setProfessionalTaxEnabled(val);
    if (field === 'freelancerTaxEnabled') setFreelancerTaxEnabled(val);

    updateEmployeeStatutory(employee.id, { [field]: val });
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTask) return;
    addFreelancerTimeLog(employee.id, logDate, Number(logHours), logTask);
    setLogTask('');
  };

  const totalHoursWorked = (employee.timeLogs || []).reduce((sum, l) => sum + (l.hours || 0), 0);
  const calculatedFreelancerEarnings = totalHoursWorked * (employee.hourlyRate || 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Fixed Header */}
        <div className="flex justify-between items-center bg-white p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 leading-tight">{employee.name}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  employee.type === 'FULL_TIME' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {employee.type.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-bold">
                {employee.designation} • {employee.department || 'Engineering'} • {employee.officeLocation} Office
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold no-print">
              <button
                onClick={() => setActiveTab('PROFILE')}
                className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'PROFILE' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'}`}
              >
                Comprehensive Profile
              </button>
              <button
                onClick={() => setActiveTab('SALARY_HISTORY')}
                className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'SALARY_HISTORY' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'}`}
              >
                Salary & Pay Slips ({employeePayrolls.length})
              </button>
              {employee.type === 'FREELANCER' && (
                <button
                  onClick={() => setActiveTab('FREELANCER_LOGS')}
                  className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'FREELANCER_LOGS' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'}`}
                >
                  Hours Log ({totalHoursWorked} hrs)
                </button>
              )}
              <button
                onClick={() => setActiveTab('ID_CARD')}
                className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'ID_CARD' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'}`}
              >
                ID Card
              </button>
            </div>

            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 text-lg">✕</button>
          </div>
        </div>

        {/* Scrollable Modal Body (Side-by-Side 2-Column Dashboard) */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'PROFILE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* LEFT COLUMN */}
              <div className="space-y-4">
                {/* 1. Personal & Emergency Info */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-blue-700">
                    <User className="w-4 h-4" /> Personal & Emergency Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 pt-1 font-medium">
                    <div>
                      <span className="text-slate-500 block">Gender:</span>
                      <span className="font-bold text-slate-900">{employee.gender || 'Male'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Date of Birth:</span>
                      <span className="font-mono font-bold text-slate-900">{employee.dateOfBirth || '1992-05-15'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Blood Group:</span>
                      <span className="font-mono font-bold text-rose-700">{employee.bloodGroup || 'O+'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Phone / WhatsApp:</span>
                      <span className="font-mono font-bold text-slate-900">{employee.phone}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block">Corporate Email:</span>
                      <span className="font-bold text-slate-900">{employee.email}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block">Emergency Contact:</span>
                      <span className="font-bold text-slate-900">{employee.emergencyContactName || 'Family Member'} ({employee.emergencyContactPhone || employee.phone})</span>
                    </div>
                    <div className="col-span-2 border-t border-slate-200 pt-2">
                      <span className="text-slate-500 block">Residential Address:</span>
                      <span className="font-medium text-slate-800">{employee.address || 'Tech Park, Chennai, India'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Employment & Role */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-purple-700">
                    <Briefcase className="w-4 h-4" /> Employment & Designation
                  </h4>
                  <div className="grid grid-cols-2 gap-3 pt-1 font-medium">
                    <div>
                      <span className="text-slate-500 block">Employee ID:</span>
                      <span className="font-mono font-black text-blue-700">{employee.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Department:</span>
                      <span className="font-bold text-slate-900">{employee.department || 'Engineering'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Office Branch:</span>
                      <span className="font-bold text-slate-900">{employee.officeLocation} Office</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Reporting Manager:</span>
                      <span className="font-bold text-slate-900">{employee.reportingManager || 'Purusothaman K'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Date of Joining:</span>
                      <span className="font-mono font-bold text-slate-900">{employee.joinedDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Current Status:</span>
                      <span className="font-extrabold text-emerald-700">{employee.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-4">
                {/* 3. Banking & Compensation */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-emerald-700">
                    <BankIcon className="w-4 h-4" /> Banking & Disbursal Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 pt-1 font-medium">
                    <div>
                      <span className="text-slate-500 block">Bank Name:</span>
                      <span className="font-bold text-slate-900">{employee.bankName || 'HDFC Bank'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Account Holder:</span>
                      <span className="font-bold text-slate-900">{employee.accountHolderName || employee.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Account Number / Wise:</span>
                      <span className="font-mono font-bold text-slate-900">{employee.accountNumber || '50200012345678'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">IFSC / SWIFT Code:</span>
                      <span className="font-mono font-bold text-slate-900">{employee.ifscCode || 'HDFC0001234'}</span>
                    </div>
                    <div className="col-span-2 border-t border-slate-200 pt-2">
                      <span className="text-slate-500 block">Fixed Compensation:</span>
                      <span className="font-mono font-black text-emerald-700 text-sm">
                        {employee.type === 'FULL_TIME' ? `${formatCurrency(employee.monthlySalary || 0)} / mo` : `${formatCurrency(employee.hourlyRate || 0)} / hr`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Statutory Numbers & ON/OFF Controls */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-amber-700">
                    <ShieldCheck className="w-4 h-4" /> Statutory Identification & Tax Toggles
                  </h4>

                  {/* Tax Identifiers Grid */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 block font-sans">PAN:</span>
                      <span className="font-bold text-slate-900">{employee.panNumber || 'ABCDE1234F'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-sans">Aadhaar:</span>
                      <span className="font-bold text-slate-900">{employee.aadhaarNumber || '1234-5678-9012'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-sans">UAN:</span>
                      <span className="font-bold text-slate-900">{employee.uanNumber || '100900800700'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-sans">ESI No:</span>
                      <span className="font-bold text-slate-900">{employee.esiNumber || '3100000000'}</span>
                    </div>
                  </div>

                  {/* Statutory ON/OFF Toggles */}
                  {employee.type === 'FULL_TIME' ? (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50">
                        <span className="font-bold text-[11px] text-slate-900">ESI (0.75%)</span>
                        <button
                          onClick={() => handleToggleStatutory('esiEnabled', !esiEnabled)}
                          className={`px-2.5 py-0.5 rounded text-[10px] font-black transition ${esiEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'}`}
                        >
                          {esiEnabled ? 'ON' : 'OFF'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50">
                        <span className="font-bold text-[11px] text-slate-900">PF (12%)</span>
                        <button
                          onClick={() => handleToggleStatutory('pfEnabled', !pfEnabled)}
                          className={`px-2.5 py-0.5 rounded text-[10px] font-black transition ${pfEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'}`}
                        >
                          {pfEnabled ? 'ON' : 'OFF'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50">
                        <span className="font-bold text-[11px] text-slate-900">TDS Tax</span>
                        <button
                          onClick={() => handleToggleStatutory('incomeTaxEnabled', !incomeTaxEnabled)}
                          className={`px-2.5 py-0.5 rounded text-[10px] font-black transition ${incomeTaxEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'}`}
                        >
                          {incomeTaxEnabled ? 'ON' : 'OFF'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50">
                        <span className="font-bold text-[11px] text-slate-900">PT Tax</span>
                        <button
                          onClick={() => handleToggleStatutory('professionalTaxEnabled', !professionalTaxEnabled)}
                          className={`px-2.5 py-0.5 rounded text-[10px] font-black transition ${professionalTaxEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'}`}
                        >
                          {professionalTaxEnabled ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <span className="font-bold text-[11px] text-slate-900">Freelancer 10% TDS Tax</span>
                      <button
                        onClick={() => handleToggleStatutory('freelancerTaxEnabled', !freelancerTaxEnabled)}
                        className={`px-2.5 py-0.5 rounded text-[10px] font-black transition ${freelancerTaxEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'}`}
                      >
                        {freelancerTaxEnabled ? 'ON (10%)' : 'OFF (0%)'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. SALARY HISTORY TAB */}
          {activeTab === 'SALARY_HISTORY' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900">Month-Wise Salary & Disbursement Ledger</h4>
              
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Month</th>
                      <th className="p-3">Gross Salary</th>
                      <th className="p-3">ESI</th>
                      <th className="p-3">PF</th>
                      <th className="p-3">TDS / Tax</th>
                      <th className="p-3">Net Paid</th>
                      <th className="p-3 text-right">Pay Slip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {employeePayrolls.map(pay => (
                      <tr key={pay.id} className="hover:bg-slate-50">
                        <td className="p-3 font-sans font-bold text-slate-900">{pay.month}</td>
                        <td className="p-3 font-bold">{formatCurrency(pay.baseAmount)}</td>
                        <td className="p-3 text-slate-500">{formatCurrency(pay.esiDeduction)}</td>
                        <td className="p-3 text-slate-500">{formatCurrency(pay.pfDeduction)}</td>
                        <td className="p-3 text-slate-500">{formatCurrency(pay.incomeTaxDeduction || pay.freelancerTaxDeduction)}</td>
                        <td className="p-3 font-black text-emerald-700">{formatCurrency(pay.netPayable)}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              onSelectPaySlipForPrint(pay);
                              onClose();
                            }}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 shadow-sm font-sans"
                          >
                            <Printer className="w-3 h-3" /> View Pay Slip
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. FREELANCER WORKING HOURS LOG TAB */}
          {activeTab === 'FREELANCER_LOGS' && employee.type === 'FREELANCER' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 font-bold block">Hourly Rate: {formatCurrency(employee.hourlyRate || 0)} / hr</span>
                  <span className="text-sm font-black text-emerald-700">Total Logged Earnings: {formatCurrency(calculatedFreelancerEarnings)}</span>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 font-extrabold text-xs rounded-lg">
                  Total Worked: {totalHoursWorked} Hours
                </span>
              </div>

              {/* Add Daily Hours Log Form */}
              <form onSubmit={handleAddLog} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-white p-3 rounded-xl border border-slate-200">
                <input
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                />
                <input
                  type="number"
                  step="0.5"
                  required
                  placeholder="Hours (e.g. 8)"
                  value={logHours}
                  onChange={(e) => setLogHours(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                />
                <input
                  type="text"
                  required
                  placeholder="Task performed details"
                  value={logTask}
                  onChange={(e) => setLogTask(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg text-xs py-2 flex items-center justify-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Log Hours
                </button>
              </form>

              {/* Logs Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Task Description</th>
                      <th className="p-3">Worked Hours</th>
                      <th className="p-3 text-right">Day Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {(employee.timeLogs || []).map(log => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="p-3 text-slate-500 font-bold">{log.date}</td>
                        <td className="p-3 font-sans font-medium text-slate-900">{log.taskDescription}</td>
                        <td className="p-3 font-bold text-slate-800">{log.hours} hrs</td>
                        <td className="p-3 text-right font-black text-emerald-700">{formatCurrency((log.hours || 0) * (employee.hourlyRate || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. PRINT ID CARD TAB */}
          {activeTab === 'ID_CARD' && (
            <EmployeeIDCard employee={employee} />
          )}
        </div>
      </div>
    </div>
  );
};
