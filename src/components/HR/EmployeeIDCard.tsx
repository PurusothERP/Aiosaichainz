import React from 'react';
import { Employee } from '../../types';
import { AichainzLogo } from '../AichainzLogo';
import { ShieldCheck, Printer, Phone, Mail, MapPin } from 'lucide-react';

interface Props {
  employee: Employee;
  onClose?: () => void;
}

export const EmployeeIDCard: React.FC<Props> = ({ employee, onClose }) => {
  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 no-print">
        <span className="text-xs font-bold text-slate-700">Official Aichainz Corporate ID Badge</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintCard}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save ID Card
          </button>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">✕</button>
          )}
        </div>
      </div>

      {/* Printable ID Card Container (Standard ID Badge Aspect Ratio) */}
      <div className="flex justify-center printable-area py-4">
        <div className="w-[320px] bg-white border-2 border-slate-300 rounded-2xl shadow-xl overflow-hidden text-slate-900 font-sans flex flex-col justify-between relative">
          
          {/* Card Top Banner Header */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 text-white p-4 text-center relative">
            <div className="flex justify-center mb-1">
              <AichainzLogo size={28} className="text-white" />
            </div>
            <p className="text-[9px] uppercase font-bold tracking-widest text-blue-200">
              IDENTITY & SECURITY PASS
            </p>
          </div>

          {/* Photo & Main Details */}
          <div className="p-5 text-center space-y-3">
            {/* Employee Avatar Badge */}
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-4 border-white shadow-md mx-auto flex items-center justify-center font-black text-2xl text-white">
                {employee.name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className={`w-4 h-4 rounded-full border-2 border-white absolute bottom-1 right-1 ${
                employee.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}></span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">{employee.name}</h3>
              <p className="text-xs text-blue-700 font-extrabold mt-0.5">{employee.designation}</p>
              <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-700 border border-slate-300">
                ID: {employee.id} • {employee.type.replace('_', ' ')}
              </span>
            </div>

            {/* Detailed Key Info */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left text-[11px] space-y-1 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">Office Branch:</span>
                <span className="font-bold text-slate-800">{employee.officeLocation} Hub</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Blood Group:</span>
                <span className="font-bold text-rose-700 font-mono">{employee.bloodGroup || 'O+'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Emergency:</span>
                <span className="font-bold text-slate-800 font-mono">{employee.emergencyContactPhone || employee.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Joined:</span>
                <span className="font-mono text-slate-700">{employee.joinedDate}</span>
              </div>
            </div>
          </div>

          {/* Barcode & Signature Footer */}
          <div className="bg-slate-100 p-3 border-t border-slate-200 text-center space-y-1">
            {/* Simulated Barcode */}
            <div className="font-mono text-[10px] tracking-widest text-slate-700 font-extrabold">
              ||| | |||| | |||||| || | ||| ||||
            </div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
              Aichainz Global Security Clearance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
