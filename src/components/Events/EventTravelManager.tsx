import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EventTravelRecord } from '../../types';
import {
  Plane,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Award,
  Search,
  Sparkles,
  Ticket,
  BedDouble
} from 'lucide-react';

export const EventTravelManager: React.FC = () => {
  const { eventRecords, addEventRecord, updateEventRecord, deleteEventRecord, expenses, employees, formatCurrency } = useApp();

  const [filterType, setFilterType] = useState<'ALL' | 'PROFITABLE' | 'LOSS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Form State
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [personsTraveledCount, setPersonsTraveledCount] = useState(3);
  const [travelerNamesStr, setTravelerNamesStr] = useState('Purusothaman K, Dr. Tariq Al-Mansoor');
  const [entryFeeINR, setEntryFeeINR] = useState(120000);
  const [travelAccommodationCostINR, setTravelAccommodationCostINR] = useState(250000);
  const [description, setDescription] = useState('');
  const [outcomeLeadsCount, setOutcomeLeadsCount] = useState(8);
  const [businessRevenueINR, setBusinessRevenueINR] = useState(1500000);
  const [officeLocation, setOfficeLocation] = useState<'India' | 'UAE' | 'Rwanda'>('UAE');

  // Project Travel & Marketing Pool Calculation (Deducted from project accounting)
  const totalAllocatedProjectTravel = expenses
    .filter(e => {
      const cLower = (e.category || '').toLowerCase();
      return cLower.includes('travel') || cLower.includes('field') || cLower.includes('flight') || cLower.includes('hotel') || cLower.includes('accommodation');
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const totalAllocatedProjectMarketing = expenses
    .filter(e => {
      const cLower = (e.category || '').toLowerCase();
      return cLower.includes('marketing') || cLower.includes('lead') || cLower.includes('adwords') || cLower.includes('advertising') || cLower.includes('summit') || cLower.includes('expo');
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const totalProjectTravelMarketingPool = totalAllocatedProjectTravel + totalAllocatedProjectMarketing;

  // Overall Totals
  const totalEventsCount = eventRecords.length;
  const totalEventSpend = eventRecords.reduce((sum, e) => sum + e.totalSpendINR, 0);
  const availableTravelMarketingFunds = Math.max(0, totalProjectTravelMarketingPool - totalEventSpend);
  const totalEventRevenue = eventRecords.reduce((sum, e) => sum + e.businessRevenueINR, 0);
  const netEventProfit = totalEventRevenue - totalEventSpend;
  const overallRoiPercent = totalEventSpend > 0 ? Math.round((netEventProfit / totalEventSpend) * 100) : 0;
  const totalLeadsGenerated = eventRecords.reduce((sum, e) => sum + e.outcomeLeadsCount, 0);

  const filteredEvents = eventRecords.filter(e => {
    const matchesFilter =
      filterType === 'ALL' ? true :
      filterType === 'PROFITABLE' ? e.isProfitable : !e.isProfitable;

    const matchesSearch =
      e.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleOpenNewModal = () => {
    setEditingEventId(null);
    setEventName('Dubai AI & Web3 Summit 2026');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setLocation('Dubai World Trade Centre, UAE');
    setPersonsTraveledCount(3);
    setTravelerNamesStr('Purusothaman K, Dr. Tariq Al-Mansoor, Sara Al-Maktoum');
    setEntryFeeINR(120000);
    setTravelAccommodationCostINR(280000);
    setDescription('Keynote speaker session on AI-AIOS & Smart Contract Vaults. Exhibitor booth set up for enterprise lead acquisition.');
    setOutcomeLeadsCount(12);
    setBusinessRevenueINR(1850000);
    setOfficeLocation('UAE');
    setShowModal(true);
  };

  const handleOpenEditModal = (evt: EventTravelRecord) => {
    setEditingEventId(evt.id);
    setEventName(evt.eventName);
    setStartDate(evt.startDate);
    setEndDate(evt.endDate);
    setLocation(evt.location);
    setPersonsTraveledCount(evt.personsTraveledCount);
    setTravelerNamesStr(evt.travelerNames ? evt.travelerNames.join(', ') : '');
    setEntryFeeINR(evt.entryFeeINR);
    setTravelAccommodationCostINR(evt.travelAccommodationCostINR);
    setDescription(evt.description);
    setOutcomeLeadsCount(evt.outcomeLeadsCount);
    setBusinessRevenueINR(evt.businessRevenueINR);
    setOfficeLocation(evt.officeLocation);
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || !location) return;

    const entry = Number(entryFeeINR);
    const travelCost = Number(travelAccommodationCostINR);
    const totalSpendINR = entry + travelCost;
    const rev = Number(businessRevenueINR);
    const netProfitINR = rev - totalSpendINR;
    const isProfitable = netProfitINR >= 0;
    const travelerNames = travelerNamesStr.split(',').map(s => s.trim()).filter(Boolean);

    if (editingEventId) {
      updateEventRecord(editingEventId, {
        eventName,
        startDate,
        endDate,
        location,
        personsTraveledCount: Number(personsTraveledCount),
        travelerNames,
        entryFeeINR: entry,
        travelAccommodationCostINR: travelCost,
        totalSpendINR,
        description,
        outcomeLeadsCount: Number(outcomeLeadsCount),
        businessRevenueINR: rev,
        netProfitINR,
        isProfitable,
        officeLocation
      });
    } else {
      addEventRecord({
        eventName,
        startDate,
        endDate,
        location,
        personsTraveledCount: Number(personsTraveledCount),
        travelerNames,
        entryFeeINR: entry,
        travelAccommodationCostINR: travelCost,
        totalSpendINR,
        description,
        outcomeLeadsCount: Number(outcomeLeadsCount),
        businessRevenueINR: rev,
        netProfitINR,
        isProfitable,
        officeLocation
      });
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Plane className="w-5 h-5 text-blue-600" /> Events & Travel ROI Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Track business expos, entry tickets, travel & accommodation expenses, outcome leads, and net profit/loss ROI.
          </p>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Log Event & Travel
        </button>
      </div>

      {/* Allocated Project Travel & Marketing Pool & Available Budget Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 p-5 rounded-2xl text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black tracking-widest uppercase bg-black/20 px-2.5 py-1 rounded-md text-amber-100">
            ✈️ 📢 DEDUCTED PROJECT TRAVEL & MARKETING BUDGET POOL
          </span>
          <h3 className="text-xl font-extrabold mt-1 text-white">Available Travel, Expo & Marketing Spend Pool</h3>
          <p className="text-xs text-amber-100 font-medium mt-0.5 max-w-2xl">
            Allocated directly from project Travel ({formatCurrency(totalAllocatedProjectTravel)}) + Marketing ({formatCurrency(totalAllocatedProjectMarketing)}) deductions. 
            Events & Expos logged here debit from this pool and avoid double-counting in General Ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 text-right">
            <span className="text-[9px] font-bold uppercase text-amber-100 block">TRAVEL POOL</span>
            <p className="text-sm font-mono font-black text-white">{formatCurrency(totalAllocatedProjectTravel)}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 text-right">
            <span className="text-[9px] font-bold uppercase text-amber-100 block">MARKETING POOL</span>
            <p className="text-sm font-mono font-black text-white">{formatCurrency(totalAllocatedProjectMarketing)}</p>
          </div>

          <div className="bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/30 text-right">
            <span className="text-[9px] font-black uppercase text-amber-100 block">COMBINED POOL</span>
            <p className="text-sm font-mono font-black text-white">{formatCurrency(totalProjectTravelMarketingPool)}</p>
          </div>

          <div className="bg-white px-4 py-2.5 rounded-xl text-slate-900 shadow-md text-right">
            <span className="text-[10px] font-black uppercase text-amber-800 block">AVAILABLE FUNDS TO SPEND</span>
            <p className="text-lg font-mono font-black text-amber-700">{formatCurrency(availableTravelMarketingFunds)}</p>
          </div>
        </div>
      </div>

      {/* Top Banner: Events Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Events */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 border-l-4 border-l-blue-600 shadow-sm">
          <div className="flex justify-between items-center text-xs font-black text-blue-700 uppercase">
            <span>EVENTS ATTENDED</span>
            <Plane className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalEventsCount} Events</p>
          <p className="text-[10.5px] text-slate-500 font-bold mt-1">{totalLeadsGenerated} Enterprise Leads Acquired</p>
        </div>

        {/* Metric 2: Total Event Spend */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 border-l-4 border-l-rose-500 shadow-sm">
          <div className="flex justify-between items-center text-xs font-black text-rose-700 uppercase">
            <span>TOTAL EVENT SPEND</span>
            <Ticket className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-mono font-black text-slate-900 mt-1">{formatCurrency(totalEventSpend)}</p>
          <p className="text-[10.5px] text-slate-500 font-bold mt-1">Tickets + Flights + Hotels</p>
        </div>

        {/* Metric 3: Realized Business Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 border-l-4 border-l-emerald-600 shadow-sm">
          <div className="flex justify-between items-center text-xs font-black text-emerald-700 uppercase">
            <span>BUSINESS REVENUE</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-mono font-black text-emerald-700 mt-1">{formatCurrency(totalEventRevenue)}</p>
          <p className="text-[10.5px] text-slate-500 font-bold mt-1">Deals Closed from Events</p>
        </div>

        {/* Metric 4: Net Event ROI Profit */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 border-l-4 border-l-purple-600 shadow-sm">
          <div className="flex justify-between items-center text-xs font-black text-purple-700 uppercase">
            <span>NET EVENT ROI</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-mono font-black text-purple-700 mt-1">{formatCurrency(netEventProfit)}</p>
          <p className="text-[10.5px] text-emerald-600 font-extrabold mt-1">+{overallRoiPercent}% Net ROI Profit</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search event name, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold w-full sm:w-auto justify-center">
          {(['ALL', 'PROFITABLE', 'LOSS'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg transition ${
                filterType === type ? 'bg-blue-600 text-white shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type === 'ALL' && 'ALL EVENTS'}
              {type === 'PROFITABLE' && 'PROFITABLE (ROI +)'}
              {type === 'LOSS' && 'INVESTMENT / LOSS'}
            </button>
          ))}
        </div>
      </div>

      {/* Events List Cards */}
      <div className="space-y-4">
        {filteredEvents.map(evt => (
          <div
            key={evt.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition"
          >
            {/* Header row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-black text-slate-900">{evt.eventName}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                    evt.isProfitable ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}>
                    {evt.isProfitable ? 'PROFITABLE EVENT' : 'INVESTMENT / LOSS'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                    {evt.officeLocation} Hub
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-bold mt-1 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-blue-600" /> {evt.startDate} to {evt.endDate}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-rose-600" /> {evt.location}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-purple-600" /> {evt.personsTraveledCount} Staff Traveled</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(evt)}
                  className="p-2 text-slate-400 hover:text-amber-600 rounded-xl hover:bg-slate-100 transition"
                  title="Edit Event"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteEventRecord(evt.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition"
                  title="Delete Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Description & Staff list */}
            <div className="text-xs text-slate-700 space-y-1.5">
              <p className="font-medium bg-slate-50 p-3 rounded-xl border border-slate-200/80">{evt.description}</p>
              {evt.travelerNames && evt.travelerNames.length > 0 && (
                <p className="text-[11px] font-bold text-slate-600">
                  Traveled Team: <span className="text-slate-900">{evt.travelerNames.join(', ')}</span>
                </p>
              )}
            </div>

            {/* Financial & Outcomes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Ticket Entry Fee</span>
                <span className="font-mono font-extrabold text-slate-900">{formatCurrency(evt.entryFeeINR)}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Flights & Hotels</span>
                <span className="font-mono font-extrabold text-slate-900">{formatCurrency(evt.travelAccommodationCostINR)}</span>
              </div>

              <div>
                <span className="text-[10px] text-rose-700 font-bold uppercase block">Total Event Spend</span>
                <span className="font-mono font-black text-rose-700 text-sm">{formatCurrency(evt.totalSpendINR)}</span>
              </div>

              <div>
                <span className="text-[10px] text-emerald-700 font-bold uppercase block">Realized Revenue</span>
                <span className="font-mono font-black text-emerald-700 text-sm">{formatCurrency(evt.businessRevenueINR)}</span>
              </div>
            </div>

            {/* Bottom ROI Summary Bar */}
            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100 font-bold">
              <span className="text-slate-600">Leads Acquired: <span className="text-blue-700 font-black">{evt.outcomeLeadsCount} Leads</span></span>
              <span className={`font-mono text-sm font-black ${evt.isProfitable ? 'text-emerald-700' : 'text-rose-700'}`}>
                {evt.isProfitable ? `Net Profit: +${formatCurrency(evt.netProfitINR)}` : `Net Loss: -${formatCurrency(Math.abs(evt.netProfitINR))}`}
              </span>
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2 text-slate-400">
            <Plane className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-600">No event & travel records found.</p>
            <p className="text-xs">Click "Log Event & Travel" above to add business summits and expos.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">{editingEventId ? 'Edit Event & Travel' : 'Log New Event & Travel'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Event Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dubai AI & Web3 Summit 2026"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Venue Location & City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dubai World Trade Centre, UAE"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Persons Traveled Count</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={personsTraveledCount}
                    onChange={(e) => setPersonsTraveledCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Branch Office Hub</label>
                  <select
                    value={officeLocation}
                    onChange={(e) => setOfficeLocation(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="India">India</option>
                    <option value="UAE">UAE</option>
                    <option value="Rwanda">Rwanda</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Traveled Staff Names (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Purusothaman K, Dr. Tariq Al-Mansoor"
                  value={travelerNamesStr}
                  onChange={(e) => setTravelerNamesStr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Entry Ticket Fee (INR)</label>
                  <input
                    type="number"
                    required
                    value={entryFeeINR}
                    onChange={(e) => setEntryFeeINR(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Flight & Hotel Cost (INR)</label>
                  <input
                    type="number"
                    required
                    value={travelAccommodationCostINR}
                    onChange={(e) => setTravelAccommodationCostINR(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Event Description & Speaker/Exhibitor Notes</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keynote speech details, exhibitor booth results, networking highlights..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Outcome Leads Acquired</label>
                  <input
                    type="number"
                    required
                    value={outcomeLeadsCount}
                    onChange={(e) => setOutcomeLeadsCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Realized Business Revenue (INR)</label>
                  <input
                    type="number"
                    required
                    value={businessRevenueINR}
                    onChange={(e) => setBusinessRevenueINR(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              <p className="text-[10.5px] text-amber-800 font-extrabold bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                ⚡ Note: Total Event Spend (Tickets + Flights + Hotels) is deducted directly from your Allocated Project Travel & Marketing Pool ({formatCurrency(availableTravelMarketingFunds)} available). It will NOT create a duplicate entry in General Ledger or Company Operating Expenses.
              </p>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-extrabold rounded-xl shadow-md">Save Event Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
