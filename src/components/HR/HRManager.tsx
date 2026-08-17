import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee, EmployeeType, AttendanceRecord, PayrollRecord } from '../../types';
import { CompanyHeader } from '../CompanyHeader';
import { DigitalSignature } from '../DigitalSignature';
import { AichainzLogoWatermark } from '../AichainzLogoWatermark';
import { EmployeeDetailModal } from './EmployeeDetailModal';
import { MonthlyAttendanceModal } from './MonthlyAttendanceModal';
import { MonthPayrollModal } from './MonthPayrollModal';
import { exportToCSV, exportToPDFPrint } from '../../utils/exportUtils';
import {
  Users,
  UserCheck,
  CalendarCheck,
  CreditCard,
  Plus,
  Printer,
  CheckCircle,
  Clock,
  Building,
  Mail,
  MessageSquare,
  Globe,
  Phone,
  FileText,
  ShieldCheck,
  Calendar,
  Maximize2,
  Download,
  CheckCircle2,
  DollarSign,
  LayoutGrid,
  List,
  Sparkles,
  TrendingUp,
  Laptop,
  User,
  Briefcase,
  CreditCard as BankIcon,
  X,
  Search
} from 'lucide-react';

export const HRManager: React.FC = () => {
  const {
    employees,
    attendance,
    payroll,
    addEmployee,
    toggleEmployeeStatus,
    markAttendance,
    autoMarkMonthAttendance,
    generateMonthPayroll,
    updatePayrollStatus,
    formatCurrency
  } = useApp();

  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'ATTENDANCE' | 'PAYROLL' | 'CONSOLIDATED' | 'LETTERS'>('DIRECTORY');
  const [viewMode, setViewMode] = useState<'CARD' | 'LIST'>('CARD');
  const [filterType, setFilterType] = useState<'ALL' | 'FULL_TIME' | 'FREELANCER'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected Employee for Detail Profile Modal
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] = useState<Employee | null>(null);

  // Selected Employee for Monthly Attendance Grid Modal
  const [attendanceModalEmployee, setAttendanceModalEmployee] = useState<Employee | null>(null);

  // Selected Month for Processed Payroll Modal
  const [selectedMonthForPayrollModal, setSelectedMonthForPayrollModal] = useState<string | null>(null);

  // Selected Pay Slip for Printing
  const [selectedPaySlip, setSelectedPaySlip] = useState<PayrollRecord | null>(payroll[0] || null);

  // Employee Letters Studio state
  const [selectedEmpForLetter, setSelectedEmpForLetter] = useState<Employee | null>(employees[0] || null);
  const [letterType, setLetterType] = useState<'OFFER' | 'APPOINTMENT' | 'APPRAISAL' | 'EXPERIENCE' | 'RELIEVING'>('OFFER');
  
  const currentLetterEmp: Employee = selectedEmpForLetter || employees[0] || {
    id: 'EMP-DEFAULT',
    name: 'Purusothaman K',
    email: 'Purusoth@aichainz.com',
    phone: '+91 7502774016',
    designation: 'Founder & CEO',
    type: 'FULL_TIME',
    officeLocation: 'India',
    joinedDate: '2026-01-01',
    status: 'ACTIVE',
    monthlySalary: 250000,
    hourlyRate: 2000,
    currency: 'INR',
    bankDetails: 'HDFC Bank'
  };
  
  // Appraisal Letter Specific State
  const [hikePercentage, setHikePercentage] = useState(15);
  const [effectiveDate, setEffectiveDate] = useState('2026-09-01');

  // Multi-Section Detailed Employee Onboarding Form State
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [formSection, setFormSection] = useState<'PERSONAL' | 'JOB' | 'BANKING' | 'STATUTORY'>('PERSONAL');

  // Section 1: Personal & Emergency
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dateOfBirth, setDateOfBirth] = useState('1995-01-01');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // Section 2: Job & Office
  const [type, setType] = useState<EmployeeType>('FULL_TIME');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('');
  const [officeLocation, setOfficeLocation] = useState<'India' | 'UAE' | 'Rwanda'>('India');
  const [reportingManager, setReportingManager] = useState('Purusothaman K');
  const [joinedDate, setJoinedDate] = useState(new Date().toISOString().split('T')[0]);

  // Section 3: Compensation & Banking
  const [monthlySalary, setMonthlySalary] = useState(120000);
  const [hourlyRate, setHourlyRate] = useState(1500);
  const [bankName, setBankName] = useState('HDFC Bank');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('HDFC0001234');
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'UPI' | 'Wise / Crypto Transfer' | 'Cash'>('Bank Transfer');

  // Section 4: Statutory & Tax Identifiers
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [uanNumber, setUanNumber] = useState('');
  const [esiNumber, setEsiNumber] = useState('');
  
  const [esiEnabled, setEsiEnabled] = useState(true);
  const [pfEnabled, setPfEnabled] = useState(true);
  const [incomeTaxEnabled, setIncomeTaxEnabled] = useState(true);
  const [professionalTaxEnabled, setProfessionalTaxEnabled] = useState(true);
  const [freelancerTaxEnabled, setFreelancerTaxEnabled] = useState(true);

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !designation) return;

    addEmployee({
      name,
      gender,
      dateOfBirth,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@aichainz.com`,
      phone: phone || '+91 98765 43210',
      address,
      bloodGroup,
      emergencyContactName,
      emergencyContactPhone,
      type,
      department,
      designation,
      officeLocation,
      reportingManager,
      joinedDate,
      status: 'ACTIVE',
      monthlySalary: Number(monthlySalary) || 0,
      hourlyRate: Number(hourlyRate) || 0,
      currency: 'INR',
      bankName,
      accountHolderName: accountHolderName || name,
      accountNumber,
      ifscCode,
      paymentMethod,
      bankDetails: `${bankName} (A/C: ${accountNumber || 'Pending'} | ${ifscCode})`,
      panNumber,
      aadhaarNumber,
      uanNumber,
      esiNumber,
      esiEnabled,
      pfEnabled,
      incomeTaxEnabled,
      professionalTaxEnabled,
      freelancerTaxEnabled
    });

    setName('');
    setDesignation('');
    setEmail('');
    setPhone('');
    setAddress('');
    setAccountNumber('');
    setPanNumber('');
    setShowEmpModal(false);
  };

  const filteredEmployees = employees.filter(e => {
    const matchesType = filterType === 'ALL' || e.type === filterType;
    const matchesSearch = !searchTerm ||
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.phone.includes(searchTerm);
    return matchesType && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  // HR Consolidated Calculations
  const currentMonthPayrolls = payroll.filter(p => p.month === 'August 2026');
  const fullTimePayrolls = currentMonthPayrolls.filter(p => p.employeeType === 'FULL_TIME');
  const freelancerPayrolls = currentMonthPayrolls.filter(p => p.employeeType === 'FREELANCER');

  const totalFullTimeNetPaid = fullTimePayrolls.reduce((sum, p) => sum + (p.netPayable || 0), 0);
  const totalFreelancerNetPaid = freelancerPayrolls.reduce((sum, p) => sum + (p.netPayable || 0), 0);
  const totalESI = currentMonthPayrolls.reduce((sum, p) => sum + (p.esiDeduction || 0), 0);
  const totalPF = currentMonthPayrolls.reduce((sum, p) => sum + (p.pfDeduction || 0), 0);
  const totalIT = currentMonthPayrolls.reduce((sum, p) => sum + (p.incomeTaxDeduction || 0), 0);
  const totalPT = currentMonthPayrolls.reduce((sum, p) => sum + (p.ptDeduction || 0), 0);
  const totalFreelancerTax = currentMonthPayrolls.reduce((sum, p) => sum + (p.freelancerTaxDeduction || 0), 0);

  const grandTotalDeductions = totalESI + totalPF + totalIT + totalPT + totalFreelancerTax;
  const grandTotalOutflow = totalFullTimeNetPaid + totalFreelancerNetPaid + grandTotalDeductions;

  // Fiscal Months List (April to March)
  const fiscalMonths = [
    'April 2026', 'May 2026', 'June 2026', 'July 2026',
    'August 2026', 'September 2026', 'October 2026', 'November 2026',
    'December 2026', 'January 2027', 'February 2027', 'March 2027'
  ];

  return (
    <div className="space-y-6">
      {/* Module Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> HR, Attendance & Statutory Compliance Suite
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Detailed Employee Onboarding Form, Statutory Controls, 31-Day Attendance Grid, & Fiscal Reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-extrabold">
            {(['DIRECTORY', 'ATTENDANCE', 'PAYROLL', 'CONSOLIDATED', 'LETTERS'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'CONSOLIDATED' ? 'HR Reports' : tab}
              </button>
            ))}
          </div>

          {activeTab === 'DIRECTORY' && (
            <button
              onClick={() => {
                setFormSection('PERSONAL');
                setShowEmpModal(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Team Member
            </button>
          )}
        </div>
      </div>

      {/* 1. EMPLOYEE DIRECTORY */}
      {activeTab === 'DIRECTORY' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 no-print">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setFilterType('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterType === 'ALL' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'}`}
                >
                  All Members ({employees.length})
                </button>
                <button
                  onClick={() => setFilterType('FULL_TIME')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterType === 'FULL_TIME' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'}`}
                >
                  Full-Time ({employees.filter(e => e.type === 'FULL_TIME').length})
                </button>
                <button
                  onClick={() => setFilterType('FREELANCER')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterType === 'FREELANCER' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'}`}
                >
                  Freelancers ({employees.filter(e => e.type === 'FREELANCER').length})
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff, designation, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none w-56 shadow-2xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const headers = ['ID', 'Name', 'Designation', 'Type', 'Email', 'Phone', 'Joined Date', 'Monthly Salary / Rate', 'Bank Details'];
                  const rows = filteredEmployees.map(e => [e.id, e.name, e.designation, e.type, e.email, e.phone, e.joinedDate, e.monthlySalary || e.hourlyRate || 0, e.bankDetails || '']);
                  exportToCSV('Employee_Directory_Report', headers, rows);
                }}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-extrabold flex items-center gap-1 border border-emerald-200 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" /> Export Excel
              </button>

              <button
                onClick={() => exportToPDFPrint('Employee Directory Report', 'hr-directory-table-print')}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-extrabold flex items-center gap-1 border border-blue-200 shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-blue-600" /> Print PDF
              </button>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setViewMode('CARD')}
                  className={`px-3 py-1 rounded-lg font-extrabold flex items-center gap-1 transition ${
                    viewMode === 'CARD' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Grid Cards
                </button>
                <button
                  onClick={() => setViewMode('LIST')}
                  className={`px-3 py-1 rounded-lg font-extrabold flex items-center gap-1 transition ${
                    viewMode === 'LIST' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <List className="w-3.5 h-3.5" /> Table List
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'CARD' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEmployees.map(emp => (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployeeForModal(emp)}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition cursor-pointer space-y-3 relative group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                        emp.type === 'FULL_TIME' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-purple-50 text-purple-800 border border-purple-200'
                      }`}>
                        {emp.type.replace('_', ' ')}
                      </span>
                      <h3 className="font-black text-slate-900 text-base mt-2 group-hover:text-blue-600 transition-colors">{emp.name}</h3>
                      <p className="text-xs text-slate-500 font-bold">{emp.designation}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      emp.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {emp.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100 font-medium">
                    <p className="flex items-center gap-1.5 text-slate-700">
                      <Mail className="w-3.5 h-3.5 text-blue-600" /> {emp.email}
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" /> {emp.phone}
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-700">
                      <Building className="w-3.5 h-3.5 text-purple-600" /> Office: {emp.officeLocation}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {emp.type === 'FULL_TIME' ? (
                      <>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${emp.esiEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>ESI: {emp.esiEnabled ? 'ON' : 'OFF'}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${emp.pfEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>PF: {emp.pfEnabled ? 'ON' : 'OFF'}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${emp.incomeTaxEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>TDS: {emp.incomeTaxEnabled ? 'ON' : 'OFF'}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${emp.professionalTaxEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>PT: {emp.professionalTaxEnabled ? 'ON' : 'OFF'}</span>
                      </>
                    ) : (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${emp.freelancerTaxEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                        TDS 10%: {emp.freelancerTaxEnabled ? 'ON' : 'OFF'}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold">Compensation:</span>
                    <span className="font-mono font-black text-emerald-700">
                      {emp.type === 'FULL_TIME' ? `${formatCurrency(emp.monthlySalary || 0)} / mo` : `${formatCurrency(emp.hourlyRate || 0)} / hr`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-5 border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Emp ID & Name</th>
                      <th className="p-3.5">Designation</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Office</th>
                      <th className="p-3.5">Statutory Status</th>
                      <th className="p-3.5">Compensation</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {filteredEmployees.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => setSelectedEmployeeForModal(emp)}>
                        <td className="p-3.5">
                          <p className="font-black text-slate-900">{emp.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono font-bold">{emp.id}</p>
                        </td>
                        <td className="p-3.5 font-bold text-slate-800">{emp.designation}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${emp.type === 'FULL_TIME' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                            {emp.type}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-700 font-bold">{emp.officeLocation}</td>
                        <td className="p-3.5 text-[10px]">
                          {emp.type === 'FULL_TIME' ? (
                            <span className="font-bold text-emerald-700">ESI/PF/TDS Active</span>
                          ) : (
                            <span className="font-bold text-purple-700">TDS 10% Active</span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono font-black text-emerald-700">
                          {emp.type === 'FULL_TIME' ? `${formatCurrency(emp.monthlySalary || 0)} / mo` : `${formatCurrency(emp.hourlyRate || 0)} / hr`}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEmployeeForModal(emp);
                            }}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg"
                          >
                            View Details
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
      )}

      {/* 2. ATTENDANCE SYSTEM */}
      {activeTab === 'ATTENDANCE' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-600" /> Attendance Logger & Monthly Grid
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Click any employee row to open their 31-day Monthly Attendance Calendar (Toggle P, A, L, HD, WH).
              </p>
            </div>

            <button
              onClick={() => {
                const now = new Date();
                autoMarkMonthAttendance(now.getFullYear(), now.getMonth());
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> 1-Click Auto Mark Entire Month Attendance
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Team Member</th>
                  <th className="p-3.5">Employment Type</th>
                  <th className="p-3.5">Attendance Status</th>
                  <th className="p-3.5">Check-In</th>
                  <th className="p-3.5 text-right font-bold text-blue-600">Monthly Attendance Grid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {employees.map(emp => {
                  const rec = attendance.find(a => a.employeeId === emp.id && a.date === new Date().toISOString().split('T')[0]);
                  const currentStatus = rec ? rec.status : 'PRESENT';

                  return (
                    <tr
                      key={emp.id}
                      onClick={() => setAttendanceModalEmployee(emp)}
                      className="hover:bg-slate-50 transition cursor-pointer"
                    >
                      <td className="p-3.5">
                        <p className="font-black text-slate-900">{emp.name}</p>
                        <p className="text-slate-500 text-[11px] font-bold">{emp.designation}</p>
                      </td>
                      <td className="p-3.5 font-bold text-slate-600">{emp.type}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          currentStatus === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                          currentStatus === 'HOLIDAY_WEEKEND' ? 'bg-blue-100 text-blue-800' :
                          currentStatus === 'ON_LEAVE' ? 'bg-purple-100 text-purple-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {currentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-500">{rec?.checkInTime || '09:00 AM'}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAttendanceModalEmployee(emp);
                          }}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold inline-flex items-center gap-1 shadow-sm"
                        >
                          <Calendar className="w-3.5 h-3.5" /> View 31-Day Calendar
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

      {/* 3. PAYROLL & FISCAL MONTH-WISE DIRECTORY */}
      {activeTab === 'PAYROLL' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm no-print">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" /> Fiscal Payroll Directory (April 2026 – March 2027)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Generate monthly payroll or click any processed month to inspect separate Full-Time & Freelancer payout ledgers.
              </p>
            </div>

            <button
              onClick={() => generateMonthPayroll('August 2026')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Generate August 2026 Payroll
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 no-print">
            {fiscalMonths.map(m => {
              const count = payroll.filter(p => p.month === m).length;
              const isProcessed = count > 0;

              return (
                <div
                  key={m}
                  onClick={() => isProcessed && setSelectedMonthForPayrollModal(m)}
                  className={`p-4 rounded-2xl border cursor-pointer transition text-left space-y-2 shadow-sm ${
                    isProcessed
                      ? 'bg-white border-emerald-400 hover:border-emerald-600 hover:shadow-md'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900 text-sm">{m}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      isProcessed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isProcessed ? 'PROCESSED' : 'PENDING'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-bold">
                    {isProcessed ? `${count} Disbursement Records` : 'Not generated yet'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* WORLD-CLASS CORPORATE PAYSLIP PREVIEW (NO HORIZONTAL CLIPPING OR VERTICAL GAP) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            <div className="lg:col-span-4 space-y-3 no-print">
              <h4 className="font-extrabold text-slate-900 text-sm">Disbursed Pay Slips (August 2026)</h4>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {payroll.map(pay => (
                  <div
                    key={pay.id}
                    onClick={() => setSelectedPaySlip(pay)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition shadow-sm ${
                      selectedPaySlip?.id === pay.id ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h5 className="font-extrabold text-slate-900 text-xs">{pay.employeeName}</h5>
                      <span className="font-mono text-emerald-700 font-black text-xs">{formatCurrency(pay.netPayable)}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">{pay.month} • {pay.employeeType}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8">
              {selectedPaySlip ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap justify-end gap-2 no-print">
                    <button
                      onClick={() => {
                        const text = encodeURIComponent(
                          `*AICHAINZ SALARY PAYSLIP*\n` +
                          `Employee: *${selectedPaySlip.employeeName}*\n` +
                          `Month: ${selectedPaySlip.month}\n` +
                          `Net Payable: *${formatCurrency(selectedPaySlip.netPayable)}*\n` +
                          `Website: www.aichainz.com`
                        );
                        window.open(`https://wa.me/?text=${text}`, '_blank');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl flex items-center gap-1 shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                    </button>
                    <button
                      onClick={() => {
                        const subject = encodeURIComponent(`Salary Payslip - ${selectedPaySlip.month} - ${selectedPaySlip.employeeName}`);
                        const body = encodeURIComponent(
                          `Dear ${selectedPaySlip.employeeName},\n\n` +
                          `Your salary payslip for ${selectedPaySlip.month} has been generated.\n` +
                          `Net Amount: ${formatCurrency(selectedPaySlip.netPayable)}\n\n` +
                          `Website: www.aichainz.com\n` +
                          `Aichainz Founder & CEO Office`
                        );
                        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold rounded-xl flex items-center gap-1 shadow-sm"
                    >
                      <Mail className="w-3.5 h-3.5" /> Email
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl flex items-center gap-1 shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" /> Download PDF / Print
                    </button>
                  </div>

                  {/* PRISTINE A4 PAYSLIP SHEET (WITH WATERMARK LOGO) */}
                  <div className="document-paper rounded-2xl printable-area">
                    <div className="watermark-bg">
                      <AichainzLogoWatermark size={260} />
                    </div>
                    <div className="relative z-10 flex flex-col justify-between h-full space-y-2">
                      <div>
                        <CompanyHeader
                          documentTitle="SALARY PAY SLIP"
                          subtitle={`Disbursement Month: ${selectedPaySlip.month}`}
                        />

                    {/* Employee & Bank Info Grid */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-slate-500 uppercase text-[9.5px] font-bold">EMPLOYEE INFORMATION</p>
                        <p className="font-black text-slate-900 text-sm">{selectedPaySlip.employeeName}</p>
                        <p className="text-slate-700 font-bold text-[11px] mt-0.5">Emp ID: {selectedPaySlip.employeeId}</p>
                        <p className="text-slate-600 text-[11px]">Type: {selectedPaySlip.employeeType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-500 uppercase text-[9.5px] font-bold">DISBURSAL & BANK DETAILS</p>
                        <p className="font-mono font-bold text-slate-800 text-xs">{selectedPaySlip.bankDetails}</p>
                        <p className="text-emerald-700 font-extrabold text-xs mt-1">Payment Status: {selectedPaySlip.status}</p>
                        {selectedPaySlip.paymentDate && (
                          <p className="text-slate-500 font-mono text-[10px]">Date: {selectedPaySlip.paymentDate}</p>
                        )}
                      </div>
                    </div>

                    {/* TWO-COLUMN EARNINGS VS DEDUCTIONS TABLE */}
                    <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                      <div className="grid grid-cols-2 bg-slate-900 text-white font-extrabold text-[10.5px] uppercase p-2 border-b border-slate-900">
                        <div>EARNINGS & BASIC COMPONENT</div>
                        <div className="text-right border-l border-slate-700 pl-3">STATUTORY DEDUCTIONS & TAXES</div>
                      </div>

                      <div className="grid grid-cols-2 divide-x divide-slate-300 text-slate-900 font-mono">
                        {/* Left: Earnings */}
                        <div className="p-2.5 space-y-1.5 font-sans">
                          <div className="flex justify-between">
                            <span className="font-bold text-slate-800">Basic Salary / Hourly Earnings</span>
                            <span className="font-mono font-extrabold">{formatCurrency(selectedPaySlip.baseAmount)}</span>
                          </div>
                          {selectedPaySlip.bonus > 0 && (
                            <div className="flex justify-between text-emerald-700">
                              <span className="font-bold">Performance Incentive / Bonus</span>
                              <span className="font-mono font-extrabold">+{formatCurrency(selectedPaySlip.bonus)}</span>
                            </div>
                          )}
                          <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-xs text-slate-900">
                            <span>GROSS EARNINGS TOTAL:</span>
                            <span className="font-mono">{formatCurrency(selectedPaySlip.baseAmount + selectedPaySlip.bonus)}</span>
                          </div>
                        </div>

                        {/* Right: Deductions */}
                        <div className="p-2.5 space-y-1.5 font-sans">
                          {selectedPaySlip.esiDeduction > 0 && (
                            <div className="flex justify-between text-rose-700">
                              <span>ESI Statutory Deduction (0.75%)</span>
                              <span className="font-mono font-bold">-{formatCurrency(selectedPaySlip.esiDeduction)}</span>
                            </div>
                          )}
                          {selectedPaySlip.pfDeduction > 0 && (
                            <div className="flex justify-between text-rose-700">
                              <span>PF Deduction (12%)</span>
                              <span className="font-mono font-bold">-{formatCurrency(selectedPaySlip.pfDeduction)}</span>
                            </div>
                          )}
                          {selectedPaySlip.incomeTaxDeduction > 0 && (
                            <div className="flex justify-between text-rose-700">
                              <span>Income Tax (TDS Withholding)</span>
                              <span className="font-mono font-bold">-{formatCurrency(selectedPaySlip.incomeTaxDeduction)}</span>
                            </div>
                          )}
                          {selectedPaySlip.ptDeduction > 0 && (
                            <div className="flex justify-between text-rose-700">
                              <span>Professional Tax (PT)</span>
                              <span className="font-mono font-bold">-{formatCurrency(selectedPaySlip.ptDeduction)}</span>
                            </div>
                          )}
                          {selectedPaySlip.freelancerTaxDeduction > 0 && (
                            <div className="flex justify-between text-rose-700">
                              <span>Freelancer 10% TDS Tax</span>
                              <span className="font-mono font-bold">-{formatCurrency(selectedPaySlip.freelancerTaxDeduction)}</span>
                            </div>
                          )}
                          {selectedPaySlip.totalDeductions === 0 && (
                            <div className="text-slate-400 italic text-[11px]">No Statutory Deductions Applied</div>
                          )}
                          <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-xs text-rose-800">
                            <span>TOTAL DEDUCTIONS:</span>
                            <span className="font-mono">-{formatCurrency(selectedPaySlip.totalDeductions)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* NET SALARY HIGHLIGHT BOX */}
                    <div className="bg-emerald-50/90 border-2 border-emerald-300 p-2.5 rounded-xl flex justify-between items-center text-xs shadow-2xs">
                      <div>
                        <span className="text-[9.5px] text-emerald-800 font-extrabold uppercase block">NET SALARY DISBURSED</span>
                        <span className="text-[11px] text-slate-700 font-bold">Transferred directly to Bank Account</span>
                      </div>
                      <span className="text-lg font-black text-emerald-800 font-mono">
                        {formatCurrency(selectedPaySlip.netPayable)}
                      </span>
                    </div>
                  </div>

                  {/* Digital Signature */}
                  <div className="space-y-3">
                    <DigitalSignature date={selectedPaySlip.paymentDate || new Date().toISOString().split('T')[0]} />
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[9.5px] text-slate-600 font-bold">
                      <span className="text-blue-700 font-black flex items-center gap-1">
                        <Globe className="w-3 h-3 text-blue-600" /> www.aichainz.com
                      </span>
                      <span>Where Future Thinking Meets AI</span>
                      <span>Purusoth@aichainz.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        </div>
        </div>
      )}

      {/* 4. HR CONSOLIDATED REPORT */}
      {activeTab === 'CONSOLIDATED' && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" /> HR & Statutory Compliance Consolidated Report (August 2026)
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Comprehensive breakdown of Full-time Salaries, Freelancer Payouts, ESI, PF, Income Tax (TDS), PT, and Freelancer 10% Tax.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase block">Full-Time Salaries Paid</span>
              <p className="text-xl font-black text-blue-700 mt-1 font-mono">{formatCurrency(totalFullTimeNetPaid)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase block">Freelancer Payouts Paid</span>
              <p className="text-xl font-black text-purple-700 mt-1 font-mono">{formatCurrency(totalFreelancerNetPaid)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase block">Total PF Reserve</span>
              <p className="text-xl font-black text-slate-800 mt-1 font-mono">{formatCurrency(totalPF)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase block">Total ESI Reserve</span>
              <p className="text-xl font-black text-slate-800 mt-1 font-mono">{formatCurrency(totalESI)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase block">Full-Time TDS Tax</span>
              <p className="text-xl font-black text-rose-700 mt-1 font-mono">{formatCurrency(totalIT)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase block">Freelancer 10% TDS Tax</span>
              <p className="text-xl font-black text-rose-700 mt-1 font-mono">{formatCurrency(totalFreelancerTax)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase block">Professional Tax (PT)</span>
              <p className="text-xl font-black text-amber-700 mt-1 font-mono">{formatCurrency(totalPT)}</p>
            </div>
            <div className="bg-blue-600 text-white p-4 rounded-xl shadow-md">
              <span className="text-[10px] text-blue-100 font-extrabold uppercase block">Grand Outflow</span>
              <p className="text-xl font-black mt-1 font-mono">{formatCurrency(grandTotalOutflow)}</p>
            </div>
          </div>
        </div>
      )}

      {/* 5. DOWNLOADABLE EMPLOYEE LETTERS STUDIO */}
      {activeTab === 'LETTERS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4 no-print">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Select Employee & Letter Type</h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Employee</label>
                <select
                  value={currentLetterEmp.id}
                  onChange={(e) => {
                    const emp = employees.find(em => em.id === e.target.value);
                    if (emp) setSelectedEmpForLetter(emp);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.designation})</option>
                  ))}
                  {employees.length === 0 && (
                    <option value="EMP-DEFAULT">Purusothaman K (Founder & CEO)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Letter Type</label>
                <select
                  value={letterType}
                  onChange={(e) => setLetterType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold"
                >
                  <option value="OFFER">EMPLOYMENT OFFER LETTER</option>
                  <option value="APPOINTMENT">APPOINTMENT LETTER</option>
                  <option value="APPRAISAL">APPRAISAL & SALARY HIKE LETTER (%)</option>
                  <option value="EXPERIENCE">EXPERIENCE & SERVICE CERTIFICATE</option>
                  <option value="RELIEVING">RELIEVING LETTER</option>
                </select>
              </div>

              {letterType === 'APPRAISAL' && (
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Increment Hike (%)</label>
                    <input
                      type="number"
                      value={hikePercentage}
                      onChange={(e) => setHikePercentage(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Effective Date</label>
                    <input
                      type="date"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handlePrint}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print / Download Letter PDF
              </button>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="document-paper rounded-2xl printable-area">
              <div className="watermark-bg">
                <AichainzLogoWatermark size={260} />
              </div>
              <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                <div>
                  <CompanyHeader
                    documentTitle={
                      letterType === 'OFFER' ? 'OFFER LETTER' :
                      letterType === 'APPOINTMENT' ? 'APPOINTMENT LETTER' :
                    letterType === 'APPRAISAL' ? 'APPRAISAL & SALARY HIKE LETTER' :
                    letterType === 'EXPERIENCE' ? 'EXPERIENCE CERTIFICATE' : 'RELIEVING LETTER'
                  }
                  subtitle={`Date: ${new Date().toISOString().split('T')[0]}`}
                />

                <div className="my-4">
                  <p className="font-black text-slate-900 text-base">{currentLetterEmp.name}</p>
                  <p className="text-xs text-slate-600 font-bold">{currentLetterEmp.designation} • {currentLetterEmp.officeLocation} Office</p>
                </div>

                <div className="text-xs text-slate-800 leading-relaxed font-sans space-y-3">
                  <p>Dear <strong>{currentLetterEmp.name}</strong>,</p>

                  {letterType === 'OFFER' && (
                    <p>On behalf of Aichainz, we are delighted to issue this official Offer Letter for the position of <strong>{currentLetterEmp.designation}</strong>. Your compensation is fixed at <strong>{formatCurrency(currentLetterEmp.monthlySalary || (currentLetterEmp.hourlyRate || 0) * 160)}</strong> subject to statutory deductions (ESI, PF, Income Tax, Professional Tax).</p>
                  )}

                  {letterType === 'APPRAISAL' && (
                    <>
                      <p>In recognition of your exceptional performance, leadership, and technical contributions to Aichainz, management is pleased to approve a salary appraisal effective <strong>{effectiveDate}</strong>.</p>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 space-y-1 font-mono text-xs my-2">
                        <div className="flex justify-between">
                          <span>Previous Monthly Base:</span>
                          <span className="font-bold">{formatCurrency(currentLetterEmp.monthlySalary || 0)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span>Appraisal Hike Approved:</span>
                          <span>+{hikePercentage}%</span>
                        </div>
                        <div className="flex justify-between font-black text-slate-900 border-t border-slate-300 pt-1 text-sm">
                          <span>Revised Monthly Salary:</span>
                          <span className="text-emerald-700">{formatCurrency((currentLetterEmp.monthlySalary || 0) * (1 + hikePercentage / 100))}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {letterType === 'EXPERIENCE' && (
                    <p>This is to certify that <strong>{currentLetterEmp.name}</strong> served at Aichainz as <strong>{currentLetterEmp.designation}</strong> with outstanding character, technical diligence, and dedication.</p>
                  )}

                  {letterType === 'RELIEVING' && (
                    <p>This letter confirms that <strong>{currentLetterEmp.name}</strong> has been relieved of duties at Aichainz after fulfilling all project handovers and clearance obligations.</p>
                  )}

                  <p>Should you require any further validation, please contact Purusoth@aichainz.com.</p>
                </div>
              </div>

              <DigitalSignature date={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
        </div>
      </div>
      )}

      {/* On-Click Employee Detail Modal */}
      {selectedEmployeeForModal && (
        <EmployeeDetailModal
          employee={selectedEmployeeForModal}
          onClose={() => setSelectedEmployeeForModal(null)}
          onSelectPaySlipForPrint={(pay) => {
            setSelectedPaySlip(pay);
            setActiveTab('PAYROLL');
          }}
        />
      )}

      {/* On-Click Monthly Attendance Modal Grid */}
      {attendanceModalEmployee && (
        <MonthlyAttendanceModal
          employee={attendanceModalEmployee}
          monthName="August 2026"
          year={2026}
          monthZeroBased={7}
          onClose={() => setAttendanceModalEmployee(null)}
        />
      )}

      {/* On-Click Fiscal Month Processed Payroll Modal */}
      {selectedMonthForPayrollModal && (
        <MonthPayrollModal
          targetMonth={selectedMonthForPayrollModal}
          onClose={() => setSelectedMonthForPayrollModal(null)}
          onSelectPaySlipForPrint={(pay) => {
            setSelectedPaySlip(pay);
            setActiveTab('PAYROLL');
          }}
        />
      )}

      {/* MULTI-SECTION DETAILED EMPLOYEE ONBOARDING FORM MODAL */}
      {showEmpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Comprehensive Employee Onboarding Form</h3>
                <p className="text-xs text-slate-500 font-medium">Capture complete Personal, Employment, Banking & Statutory details.</p>
              </div>
              <button onClick={() => setShowEmpModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-extrabold">
              <button
                type="button"
                onClick={() => setFormSection('PERSONAL')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${formSection === 'PERSONAL' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'}`}
              >
                <User className="w-3.5 h-3.5" /> 1. Personal & Contact
              </button>
              <button
                type="button"
                onClick={() => setFormSection('JOB')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${formSection === 'JOB' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'}`}
              >
                <Briefcase className="w-3.5 h-3.5" /> 2. Job & Office
              </button>
              <button
                type="button"
                onClick={() => setFormSection('BANKING')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${formSection === 'BANKING' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'}`}
              >
                <BankIcon className="w-3.5 h-3.5" /> 3. Banking & Pay
              </button>
              <button
                type="button"
                onClick={() => setFormSection('STATUTORY')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${formSection === 'STATUTORY' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> 4. Statutory & Taxes
              </button>
            </div>

            <form onSubmit={handleEmployeeSubmit} className="space-y-4 text-xs">
              
              {/* SECTION 1: PERSONAL & CONTACT DETAILS */}
              {formSection === 'PERSONAL' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Siddharth V"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Date of Birth</label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Blood Group</label>
                      <input
                        type="text"
                        placeholder="e.g. O+"
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Email Address</label>
                      <input
                        type="email"
                        placeholder="siddharth@aichainz.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Phone / WhatsApp</label>
                      <input
                        type="text"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Emergency Contact Person</label>
                      <input
                        type="text"
                        placeholder="Name"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Emergency Phone</label>
                      <input
                        type="text"
                        placeholder="+91..."
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-bold">Residential Address</label>
                    <input
                      type="text"
                      placeholder="Permanent or Current Residential Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* SECTION 2: JOB & OFFICE DETAILS */}
              {formSection === 'JOB' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Employment Type *</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                      >
                        <option value="FULL_TIME">FULL TIME</option>
                        <option value="FREELANCER">FREELANCER</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Department</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                      >
                        <option value="Executive AI Leadership">Executive AI Leadership</option>
                        <option value="Core Software Engineering">Core Software Engineering</option>
                        <option value="AI & Autonomous Agents">AI & Autonomous Agents</option>
                        <option value="UI/UX & Product Design">UI/UX & Product Design</option>
                        <option value="Cloud Infrastructure & DevOps">Cloud Infrastructure & DevOps</option>
                        <option value="Sales & Business Development">Sales & Business Development</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Designation / Role *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Senior AI Systems Engineer"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Branch Office</label>
                      <select
                        value={officeLocation}
                        onChange={(e) => setOfficeLocation(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                      >
                        <option value="India">India Regional Office (UDYAM)</option>
                        <option value="UAE">UAE (Dubai Internet City)</option>
                        <option value="Rwanda">Rwanda Hub (REG)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Reporting Manager</label>
                      <input
                        type="text"
                        placeholder="Purusothaman K"
                        value={reportingManager}
                        onChange={(e) => setReportingManager(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Date of Joining</label>
                      <input
                        type="date"
                        value={joinedDate}
                        onChange={(e) => setJoinedDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: COMPENSATION & BANKING */}
              {formSection === 'BANKING' && (
                <div className="space-y-3">
                  {type === 'FULL_TIME' ? (
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Monthly Salary CTC (INR)</label>
                      <input
                        type="number"
                        value={monthlySalary}
                        onChange={(e) => setMonthlySalary(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-sm"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Hourly Rate (INR / hr)</label>
                      <input
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-sm"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Bank Name</label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC Bank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Account Holder Name</label>
                      <input
                        type="text"
                        placeholder="Name on Bank Account"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Account No / Wise ID</label>
                      <input
                        type="text"
                        placeholder="502000..."
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">IFSC / SWIFT Code</label>
                      <input
                        type="text"
                        placeholder="HDFC0001234"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                      >
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI">UPI</option>
                        <option value="Wise / Crypto Transfer">Wise / Crypto Transfer</option>
                        <option value="Cash">Cash</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: STATUTORY & TAX IDENTIFIERS */}
              {formSection === 'STATUTORY' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">PAN Number</label>
                      <input
                        type="text"
                        placeholder="ABCDE1234F"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-mono font-bold uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">Aadhaar / Passport</label>
                      <input
                        type="text"
                        placeholder="1234-5678-9012"
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">PF UAN Number</label>
                      <input
                        type="text"
                        placeholder="100900800700"
                        value={uanNumber}
                        onChange={(e) => setUanNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1 font-bold">ESI Insurance No</label>
                      <input
                        type="text"
                        placeholder="3100000000"
                        value={esiNumber}
                        onChange={(e) => setEsiNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-mono font-bold"
                      />
                    </div>
                  </div>

                  {type === 'FULL_TIME' ? (
                    <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="font-extrabold text-slate-800 text-xs block uppercase mb-1">Full-Time Statutory Deductions Toggles:</span>
                      <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={esiEnabled} onChange={(e) => setEsiEnabled(e.target.checked)} className="accent-blue-600 w-4 h-4" /> ESI (0.75% Contribution)
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={pfEnabled} onChange={(e) => setPfEnabled(e.target.checked)} className="accent-blue-600 w-4 h-4" /> PF (12% Contribution)
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={incomeTaxEnabled} onChange={(e) => setIncomeTaxEnabled(e.target.checked)} className="accent-blue-600 w-4 h-4" /> Income Tax (TDS Withholding)
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked={professionalTaxEnabled} onChange={(e) => setProfessionalTaxEnabled(e.target.checked)} className="accent-blue-600 w-4 h-4" /> Professional Tax (PT Slabs)
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <label className="flex items-center gap-2 cursor-pointer font-extrabold text-xs text-slate-900">
                        <input type="checkbox" checked={freelancerTaxEnabled} onChange={(e) => setFreelancerTaxEnabled(e.target.checked)} className="accent-blue-600 w-4 h-4" /> Enable 10% Freelancer Professional TDS Tax Withholding
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Form Navigation Buttons */}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setShowEmpModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>

                <div className="flex gap-2">
                  {formSection !== 'PERSONAL' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (formSection === 'JOB') setFormSection('PERSONAL');
                        if (formSection === 'BANKING') setFormSection('JOB');
                        if (formSection === 'STATUTORY') setFormSection('BANKING');
                      }}
                      className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl font-bold"
                    >
                      Back
                    </button>
                  )}

                  {formSection !== 'STATUTORY' ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (formSection === 'PERSONAL') setFormSection('JOB');
                        else if (formSection === 'JOB') setFormSection('BANKING');
                        else if (formSection === 'BANKING') setFormSection('STATUTORY');
                      }}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md"
                    >
                      Next Section →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md shadow-emerald-600/20"
                    >
                      Complete Onboarding
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
