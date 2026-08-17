import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee, AttendanceRecord } from '../../types';
import { Calendar, CheckSquare, Square, X, CheckCircle2 } from 'lucide-react';

interface Props {
  employee: Employee;
  monthName: string; // e.g. "August 2026"
  year: number; // 2026
  monthZeroBased: number; // 7 for August
  onClose: () => void;
}

export const MonthlyAttendanceModal: React.FC<Props> = ({
  employee,
  monthName,
  year,
  monthZeroBased,
  onClose
}) => {
  const { attendance, bulkUpdateEmployeeAttendance } = useApp();

  const daysInMonth = new Date(year, monthZeroBased + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const [selectedDates, setSelectedDates] = useState<number[]>([]);

  const getAttendanceForDay = (day: number): AttendanceRecord['status'] => {
    const dateStr = `${year}-${String(monthZeroBased + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const rec = attendance.find(a => a.employeeId === employee.id && a.date === dateStr);
    
    if (rec) return rec.status;
    
    // Default: Saturdays and Sundays are WH
    const dateObj = new Date(year, monthZeroBased, day);
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return 'HOLIDAY_WEEKEND';
    return 'PRESENT';
  };

  const handleToggleSelectDay = (day: number) => {
    if (selectedDates.includes(day)) {
      setSelectedDates(selectedDates.filter(d => d !== day));
    } else {
      setSelectedDates([...selectedDates, day]);
    }
  };

  const handleSelectAll = () => {
    if (selectedDates.length === daysInMonth) {
      setSelectedDates([]);
    } else {
      setSelectedDates(daysArray);
    }
  };

  const applyStatusToSelected = (status: AttendanceRecord['status']) => {
    const datesToApply = selectedDates.length > 0 ? selectedDates : daysArray;
    const dateStrings = datesToApply.map(d => `${year}-${String(monthZeroBased + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    
    bulkUpdateEmployeeAttendance(employee.id, dateStrings, status);
    setSelectedDates([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl p-6 shadow-2xl space-y-5 my-8">
        
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-black text-slate-900">Monthly Attendance Grid ({monthName})</h3>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              {employee.name} • {employee.designation} ({employee.type.replace('_', ' ')})
            </p>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">✕</button>
        </div>

        {/* Toolbar: Select All & Quick Status Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 font-extrabold text-blue-700 hover:text-blue-800 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"
          >
            {selectedDates.length === daysInMonth ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4 text-slate-400" />}
            {selectedDates.length === daysInMonth ? 'Deselect All Days' : `Select All Days (${selectedDates.length}/${daysInMonth})`}
          </button>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Apply Status:</span>
            <button
              onClick={() => applyStatusToSelected('PRESENT')}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg shadow-sm"
            >
              P - Present
            </button>
            <button
              onClick={() => applyStatusToSelected('ABSENT')}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-lg shadow-sm"
            >
              A - Absent
            </button>
            <button
              onClick={() => applyStatusToSelected('ON_LEAVE')}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-lg shadow-sm"
            >
              L - Leave
            </button>
            <button
              onClick={() => applyStatusToSelected('HALF_DAY')}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg shadow-sm"
            >
              HD - Half Day
            </button>
            <button
              onClick={() => applyStatusToSelected('HOLIDAY_WEEKEND')}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg shadow-sm"
            >
              WH - Weekend
            </button>
          </div>
        </div>

        {/* 31-Day Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center font-extrabold text-[11px] text-slate-400 uppercase py-1">
              {d}
            </div>
          ))}

          {daysArray.map(day => {
            const dateObj = new Date(year, monthZeroBased, day);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const status = getAttendanceForDay(day);
            const isSelected = selectedDates.includes(day);

            let statusBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            let label = 'P';
            if (status === 'ABSENT') { statusBg = 'bg-rose-100 text-rose-800 border-rose-300'; label = 'A'; }
            if (status === 'ON_LEAVE') { statusBg = 'bg-purple-100 text-purple-800 border-purple-300'; label = 'L'; }
            if (status === 'HALF_DAY') { statusBg = 'bg-amber-100 text-amber-800 border-amber-300'; label = 'HD'; }
            if (status === 'HOLIDAY_WEEKEND') { statusBg = 'bg-slate-100 text-slate-600 border-slate-300'; label = 'WH'; }

            return (
              <div
                key={day}
                onClick={() => handleToggleSelectDay(day)}
                className={`p-2.5 rounded-xl border text-center cursor-pointer transition relative ${statusBg} ${
                  isSelected ? 'ring-2 ring-blue-600 scale-105 shadow-md' : 'hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] font-bold opacity-75">
                  <span>Day {day}</span>
                  <span>{dayName}</span>
                </div>
                <div className="text-base font-black mt-1">{label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
