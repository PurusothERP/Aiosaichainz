import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CEOExpenseRecord, CEOIncomeRecord, CEOFixedDepositRecord } from '../../types';
import {
  Crown,
  ShieldCheck,
  Plus,
  Search,
  Trash2,
  Edit,
  Building,
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Tag,
  Lock,
  Landmark,
  Layers,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Calculator,
  Calendar,
  PiggyBank
} from 'lucide-react';

const DEFAULT_CEO_EXPENSE_CATEGORIES = [
  'Personnel (Salaries & Bonus)',
  'Wellbeing (Health & Executive Perks)',
  'Depreciation (Asset & Tech Charge)',
  'Executive Discretionary',
  'Founder Reserve',
  'Travel & Hospitality',
  'Marketing & Summits',
  'Software & AI Licenses',
  'Consulting & Retainers',
  'Legal & Compliance'
];

const DEFAULT_CEO_INCOME_CATEGORIES = [
  'Personal Investment',
  'Founder Capital Injection',
  'External Consulting',
  'Private Crypto Yield',
  'Dividend / Advisory Fee',
  'Other Personal Income'
];

export const CEOExpensesManager: React.FC = () => {
  const {
    ceoExpenseRecords,
    addCEOExpense,
    updateCEOExpense,
    deleteCEOExpense,
    ceoIncomeRecords,
    addCEOIncome,
    updateCEOIncome,
    deleteCEOIncome,
    ceoFDRecords,
    addCEOFDRecord,
    updateCEOFDRecord,
    deleteCEOFDRecord,
    payments,
    expenses,
    bankAccounts,
    cryptoAccounts,
    formatCurrency
  } = useApp();

  const [activeLogTab, setActiveLogTab] = useState<'EXPENSES' | 'INCOMES' | 'FDS' | 'COMBINED'>('EXPENSES');

  const [expenseCategories, setExpenseCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('aichainz_ceo_expense_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CEO_EXPENSE_CATEGORIES;
  });

  const [incomeCategories, setIncomeCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('aichainz_ceo_income_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CEO_INCOME_CATEGORIES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  
  // Expense Modal State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [showAddExpCatInput, setShowAddExpCatInput] = useState(false);
  const [customExpCatInput, setCustomExpCatInput] = useState('');

  const [expCategory, setExpCategory] = useState<string>(DEFAULT_CEO_EXPENSE_CATEGORIES[0]);
  const [expItem, setExpItem] = useState('');
  const [expQuantity, setExpQuantity] = useState<number>(1);
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState<number | ''>(50000);
  const [expBankAccountId, setExpBankAccountId] = useState<string>('');
  const [expPaidTo, setExpPaidTo] = useState('');
  const [expPaymentMode, setExpPaymentMode] = useState('Bank Transfer');
  const [expDate, setExpDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expNotes, setExpNotes] = useState('');

  // Income Modal State
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  const [showAddIncCatInput, setShowAddIncCatInput] = useState(false);
  const [customIncCatInput, setCustomIncCatInput] = useState('');

  const [incCategory, setIncCategory] = useState<string>(DEFAULT_CEO_INCOME_CATEGORIES[0]);
  const [incSourceTitle, setIncSourceTitle] = useState('');
  const [incAmount, setIncAmount] = useState<number | ''>(100000);
  const [incBankAccountId, setIncBankAccountId] = useState<string>('');
  const [incReceivedFrom, setIncReceivedFrom] = useState('');
  const [incPaymentMode, setIncPaymentMode] = useState('Bank Transfer');
  const [incDate, setIncDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [incNotes, setIncNotes] = useState('');

  // Fixed Deposit Modal State
  const [showFDModal, setShowFDModal] = useState(false);
  const [editingFDId, setEditingFDId] = useState<string | null>(null);

  const [fdDepositTitle, setFdDepositTitle] = useState('1-Year Senior High-Yield FD');
  const [fdBankName, setFdBankName] = useState('HDFC Bank Corporate');
  const [fdPrincipalAmount, setFdPrincipalAmount] = useState<number | ''>(500000);
  const [fdInterestRatePercent, setFdInterestRatePercent] = useState<number | ''>(7.5);
  const [fdTenureMonths, setFdTenureMonths] = useState<number>(12);
  const [fdCompoundingFrequency, setFdCompoundingFrequency] = useState<'QUARTERLY' | 'ANNUAL' | 'SIMPLE'>('QUARTERLY');
  const [fdDepositDate, setFdDepositDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [fdBankAccountId, setFdBankAccountId] = useState<string>('');
  const [fdStatus, setFdStatus] = useState<'ACTIVE' | 'MATURED' | 'RENEWED'>('ACTIVE');
  const [fdNotes, setFdNotes] = useState('Fixed Deposit investment for founder yield generation.');
  const [autoAddFDInterestToIncome, setAutoAddFDInterestToIncome] = useState(true);

  // Realized Cash Collected to Date (Strictly cash received in bank/crypto, excluding receivables)
  const totalCashReceivedToDate = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalCompanyExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Realized Net Profit Pool (Cash received minus expenses)
  const realizedNetProfit = Math.max(0, totalCashReceivedToDate - totalCompanyExpenses);

  const totalPersonnel = expenses
    .filter(e => {
      const c = (e.category || '').toLowerCase();
      return c.includes('personnel') || c.includes('employee') || c.includes('salar') || c.includes('payroll');
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const totalWellbeing = expenses
    .filter(e => {
      const c = (e.category || '').toLowerCase();
      return c.includes('wellbeing') || c.includes('perk') || c.includes('health') || c.includes('benefit');
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const totalDepreciation = expenses
    .filter(e => {
      const c = (e.category || '').toLowerCase();
      return c.includes('depreciation') || c.includes('asset') || c.includes('equipment');
    })
    .reduce((sum, e) => sum + e.amount, 0);

  // Private CEO Income Total
  const totalPrivateCEOIncome = ceoIncomeRecords.reduce((sum, i) => sum + (i.amount || 0), 0);

  // Fixed Deposit Totals
  const totalFDPrincipal = ceoFDRecords.reduce((sum, f) => sum + (f.principalAmount || 0), 0);
  const totalFDExpectedInterest1Year = ceoFDRecords.reduce((sum, f) => sum + (f.expectedInterestEarned1Year || 0), 0);
  const totalFDMaturityValue = ceoFDRecords.reduce((sum, f) => sum + (f.expectedMaturityValue || 0), 0);

  const weightedAverageAPY = totalFDPrincipal > 0
    ? (ceoFDRecords.reduce((sum, f) => sum + (f.principalAmount * f.interestRatePercent), 0) / totalFDPrincipal).toFixed(2)
    : '0.00';

  // Combined Reference Pool including Other Private CEO Income
  const combinedReferencePool = realizedNetProfit + totalPersonnel + totalWellbeing + totalDepreciation + totalPrivateCEOIncome;

  const totalCEOSpent = ceoExpenseRecords.reduce((sum, c) => sum + (c.amount || 0), 0);
  const remainingCEOBalance = combinedReferencePool - totalCEOSpent - totalFDPrincipal;

  // Account Options
  const accountOptions = [
    ...bankAccounts.map(b => ({
      id: b.id,
      name: `${b.bankName} (${b.accountName}) • ${(b.accountNumber || '').slice(-4)}`
    })),
    ...cryptoAccounts.map(c => ({
      id: c.id,
      name: `Crypto Vault: ${c.vaultName} (${c.assetType} ${c.network})`
    }))
  ];

  // Live Interest Return Calculation Helper
  const computeFDInterestDetails = (principal: number, ratePercent: number, tenureM: number, freq: 'QUARTERLY' | 'ANNUAL' | 'SIMPLE') => {
    if (!principal || !ratePercent) return { interest1Year: 0, maturityValue: 0, maturityDate: fdDepositDate };
    
    const r = ratePercent / 100;
    let interest1Year = 0;
    let maturityValue = 0;

    if (freq === 'SIMPLE') {
      interest1Year = principal * r * 1; // 1 year simple
      maturityValue = principal + (principal * r * (tenureM / 12));
    } else if (freq === 'QUARTERLY') {
      const n = 4; // quarterly
      interest1Year = Math.round(principal * (Math.pow(1 + r / n, n * 1) - 1));
      maturityValue = Math.round(principal * Math.pow(1 + r / n, n * (tenureM / 12)));
    } else {
      // Annual compounding
      interest1Year = Math.round(principal * r);
      maturityValue = Math.round(principal * Math.pow(1 + r, tenureM / 12));
    }

    const depDateObj = new Date(fdDepositDate || new Date());
    depDateObj.setMonth(depDateObj.getMonth() + tenureM);
    const maturityDate = depDateObj.toISOString().split('T')[0];

    return { interest1Year, maturityValue, maturityDate };
  };

  const currentModalFDCalc = computeFDInterestDetails(
    Number(fdPrincipalAmount) || 0,
    Number(fdInterestRatePercent) || 0,
    fdTenureMonths,
    fdCompoundingFrequency
  );

  const handleAddCustomExpCategory = () => {
    if (!customExpCatInput.trim()) return;
    const catName = customExpCatInput.trim();
    if (!expenseCategories.includes(catName)) {
      const updated = [...expenseCategories, catName];
      setExpenseCategories(updated);
      localStorage.setItem('aichainz_ceo_expense_categories', JSON.stringify(updated));
    }
    setExpCategory(catName);
    setCustomExpCatInput('');
    setShowAddExpCatInput(false);
  };

  const handleAddCustomIncCategory = () => {
    if (!customIncCatInput.trim()) return;
    const catName = customIncCatInput.trim();
    if (!incomeCategories.includes(catName)) {
      const updated = [...incomeCategories, catName];
      setIncomeCategories(updated);
      localStorage.setItem('aichainz_ceo_income_categories', JSON.stringify(updated));
    }
    setIncCategory(catName);
    setCustomIncCatInput('');
    setShowAddIncCatInput(false);
  };

  // Filtered Expense Records
  const filteredExpenses = ceoExpenseRecords.filter(rec => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (rec.id || '').toLowerCase().includes(q) ||
      (rec.item || '').toLowerCase().includes(q) ||
      (rec.description || '').toLowerCase().includes(q) ||
      (rec.category || '').toLowerCase().includes(q) ||
      (rec.paidTo || '').toLowerCase().includes(q) ||
      (rec.notes || '').toLowerCase().includes(q)
    );
  });

  // Filtered Income Records
  const filteredIncomes = ceoIncomeRecords.filter(rec => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (rec.id || '').toLowerCase().includes(q) ||
      (rec.sourceTitle || '').toLowerCase().includes(q) ||
      (rec.category || '').toLowerCase().includes(q) ||
      (rec.receivedFrom || '').toLowerCase().includes(q) ||
      (rec.notes || '').toLowerCase().includes(q)
    );
  });

  // Filtered FD Records
  const filteredFDs = ceoFDRecords.filter(rec => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (rec.id || '').toLowerCase().includes(q) ||
      (rec.depositTitle || '').toLowerCase().includes(q) ||
      (rec.bankName || '').toLowerCase().includes(q) ||
      (rec.notes || '').toLowerCase().includes(q)
    );
  });

  // Combined Timeline Logs
  const combinedLogs = [
    ...ceoExpenseRecords.map(e => ({ type: 'EXPENSE' as const, date: e.date, id: e.id, title: e.item || 'Expense', category: e.category, entity: e.paidTo, account: e.bankAccountName || e.paymentMode, amount: -e.amount, notes: e.notes })),
    ...ceoIncomeRecords.map(i => ({ type: 'INCOME' as const, date: i.date, id: i.id, title: i.sourceTitle || 'Income', category: i.category, entity: i.receivedFrom, account: i.bankAccountName || i.paymentMode, amount: i.amount, notes: i.notes })),
    ...ceoFDRecords.map(f => ({ type: 'FD' as const, date: f.depositDate, id: f.id, title: f.depositTitle, category: `Fixed Deposit (${f.interestRatePercent}% p.a.)`, entity: f.bankName, account: `Matures: ${f.maturityDate}`, amount: f.principalAmount, notes: f.notes }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
   .filter(item => {
     if (!searchQuery) return true;
     const q = searchQuery.toLowerCase();
     return item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.entity.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
   });

  const totalCombinedIncomes = combinedLogs.filter(l => l.type === 'INCOME').reduce((s, l) => s + l.amount, 0);
  const totalCombinedExpenses = combinedLogs.filter(l => l.type === 'EXPENSE').reduce((s, l) => s + Math.abs(l.amount), 0);
  const totalCombinedFDs = combinedLogs.filter(l => l.type === 'FD').reduce((s, l) => s + Math.abs(l.amount), 0);
  const netCombinedFlow = totalCombinedIncomes - totalCombinedExpenses - totalCombinedFDs;

  const handleOpenNewExpenseModal = () => {
    setEditingExpenseId(null);
    setExpCategory(expenseCategories[0] || 'Executive Discretionary');
    setExpItem('Executive Studio Workstation Setup');
    setExpQuantity(1);
    setExpDescription('High-performance AI development rig and executive audio/visual equipment.');
    setExpAmount(85000);
    setExpBankAccountId(accountOptions[0]?.id || '');
    setExpPaidTo('Apple Authorised Distributor / Tech Vendor');
    setExpPaymentMode('Bank Transfer');
    setExpDate(new Date().toISOString().split('T')[0]);
    setExpNotes('Private reference entry for CEO discretionary studio tech setup.');
    setShowExpenseModal(true);
  };

  const handleOpenEditExpenseModal = (rec: CEOExpenseRecord) => {
    setEditingExpenseId(rec.id);
    setExpCategory(rec.category || expenseCategories[0]);
    setExpItem(rec.item || '');
    setExpQuantity(rec.quantity || 1);
    setExpDescription(rec.description || '');
    setExpAmount(rec.amount || 0);
    setExpBankAccountId(rec.bankAccountId || accountOptions[0]?.id || '');
    setExpPaidTo(rec.paidTo || '');
    setExpPaymentMode(rec.paymentMode || 'Bank Transfer');
    setExpDate(rec.date || new Date().toISOString().split('T')[0]);
    setExpNotes(rec.notes || '');
    setShowExpenseModal(true);
  };

  const handleOpenNewIncomeModal = () => {
    setEditingIncomeId(null);
    setIncCategory(incomeCategories[0] || 'Personal Investment');
    setIncSourceTitle('Private Web3 & AI Advisory Fee');
    setIncAmount(250000);
    setIncBankAccountId(accountOptions[0]?.id || '');
    setIncReceivedFrom('External Client / Investment Partner');
    setIncPaymentMode('Bank Transfer');
    setIncDate(new Date().toISOString().split('T')[0]);
    setIncNotes('Private income reference entry. Adds to Available CEO Balance ONLY.');
    setShowIncomeModal(true);
  };

  const handleOpenEditIncomeModal = (rec: CEOIncomeRecord) => {
    setEditingIncomeId(rec.id);
    setIncCategory(rec.category || incomeCategories[0]);
    setIncSourceTitle(rec.sourceTitle || '');
    setIncAmount(rec.amount || 0);
    setIncBankAccountId(rec.bankAccountId || accountOptions[0]?.id || '');
    setIncReceivedFrom(rec.receivedFrom || '');
    setIncPaymentMode(rec.paymentMode || 'Bank Transfer');
    setIncDate(rec.date || new Date().toISOString().split('T')[0]);
    setIncNotes(rec.notes || '');
    setShowIncomeModal(true);
  };

  const handleOpenNewFDModal = () => {
    setEditingFDId(null);
    const initialAcc = accountOptions[0];
    const defaultAccId = initialAcc?.id || '';
    const defaultAccName = initialAcc?.name || 'Primary Corporate Bank Account';
    setFdBankAccountId(defaultAccId);
    setFdBankName(defaultAccName);
    setFdDepositTitle('1-Year Senior High-Yield FD');
    setFdPrincipalAmount(500000);
    setFdInterestRatePercent(7.5);
    setFdTenureMonths(12);
    setFdCompoundingFrequency('QUARTERLY');
    setFdDepositDate(new Date().toISOString().split('T')[0]);
    setFdStatus('ACTIVE');
    setFdNotes('Private 1-year Fixed Deposit yield investment.');
    setAutoAddFDInterestToIncome(true);
    setShowFDModal(true);
  };

  const handleOpenEditFDModal = (rec: CEOFixedDepositRecord) => {
    setEditingFDId(rec.id);
    setFdDepositTitle(rec.depositTitle);
    setFdBankName(rec.bankName);
    setFdPrincipalAmount(rec.principalAmount);
    setFdInterestRatePercent(rec.interestRatePercent);
    setFdTenureMonths(rec.tenureMonths || 12);
    setFdCompoundingFrequency(rec.compoundingFrequency || 'QUARTERLY');
    setFdDepositDate(rec.depositDate);
    setFdBankAccountId(rec.bankAccountId || accountOptions[0]?.id || '');
    setFdStatus(rec.status);
    setFdNotes(rec.notes || '');
    setAutoAddFDInterestToIncome(false);
    setShowFDModal(true);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expItem || !expAmount) return;

    const selectedAccount = accountOptions.find(a => a.id === expBankAccountId);
    const bankAccountName = selectedAccount ? selectedAccount.name : 'Primary Corporate Account';

    if (editingExpenseId) {
      updateCEOExpense(editingExpenseId, {
        category: expCategory,
        item: expItem,
        quantity: Number(expQuantity) || 1,
        description: expDescription || expItem,
        amount: Number(expAmount),
        bankAccountId: expBankAccountId || accountOptions[0]?.id || '',
        bankAccountName,
        paidTo: expPaidTo || 'Vendor / Beneficiary',
        paymentMode: expPaymentMode,
        date: expDate,
        notes: expNotes
      });
    } else {
      addCEOExpense({
        category: expCategory,
        item: expItem,
        quantity: Number(expQuantity) || 1,
        description: expDescription || expItem,
        amount: Number(expAmount),
        bankAccountId: expBankAccountId || accountOptions[0]?.id || '',
        bankAccountName,
        paidTo: expPaidTo || 'Vendor / Beneficiary',
        paymentMode: expPaymentMode,
        date: expDate,
        notes: expNotes
      });
    }
    setShowExpenseModal(false);
  };

  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incSourceTitle || !incAmount) return;

    const selectedAccount = accountOptions.find(a => a.id === incBankAccountId);
    const bankAccountName = selectedAccount ? selectedAccount.name : 'Primary Corporate Account';

    if (editingIncomeId) {
      updateCEOIncome(editingIncomeId, {
        category: incCategory,
        sourceTitle: incSourceTitle,
        amount: Number(incAmount),
        bankAccountId: incBankAccountId || accountOptions[0]?.id || '',
        bankAccountName,
        receivedFrom: incReceivedFrom || 'Personal Source',
        paymentMode: incPaymentMode,
        date: incDate,
        notes: incNotes
      });
    } else {
      addCEOIncome({
        category: incCategory,
        sourceTitle: incSourceTitle,
        amount: Number(incAmount),
        bankAccountId: incBankAccountId || accountOptions[0]?.id || '',
        bankAccountName,
        receivedFrom: incReceivedFrom || 'Personal Source',
        paymentMode: incPaymentMode,
        date: incDate,
        notes: incNotes
      });
    }
    setShowIncomeModal(false);
  };

  const handleFDSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fdDepositTitle || !fdPrincipalAmount || !fdInterestRatePercent) return;

    const calc = computeFDInterestDetails(
      Number(fdPrincipalAmount),
      Number(fdInterestRatePercent),
      fdTenureMonths,
      fdCompoundingFrequency
    );

    if (editingFDId) {
      updateCEOFDRecord(editingFDId, {
        depositTitle: fdDepositTitle,
        bankName: fdBankName,
        principalAmount: Number(fdPrincipalAmount),
        interestRatePercent: Number(fdInterestRatePercent),
        tenureMonths: fdTenureMonths,
        compoundingFrequency: fdCompoundingFrequency,
        depositDate: fdDepositDate,
        maturityDate: calc.maturityDate,
        expectedInterestEarned1Year: calc.interest1Year,
        expectedMaturityValue: calc.maturityValue,
        bankAccountId: fdBankAccountId,
        status: fdStatus,
        notes: fdNotes
      });
    } else {
      addCEOFDRecord({
        depositTitle: fdDepositTitle,
        bankName: fdBankName,
        principalAmount: Number(fdPrincipalAmount),
        interestRatePercent: Number(fdInterestRatePercent),
        tenureMonths: fdTenureMonths,
        compoundingFrequency: fdCompoundingFrequency,
        depositDate: fdDepositDate,
        maturityDate: calc.maturityDate,
        expectedInterestEarned1Year: calc.interest1Year,
        expectedMaturityValue: calc.maturityValue,
        bankAccountId: fdBankAccountId,
        status: fdStatus,
        notes: fdNotes
      });

      // Optionally auto-add 1-Year Expected Interest to Private CEO Income
      if (autoAddFDInterestToIncome && calc.interest1Year > 0) {
        addCEOIncome({
          category: 'Private Crypto Yield',
          sourceTitle: `FD Yield: ${fdDepositTitle} (${fdInterestRatePercent}% p.a.)`,
          amount: calc.interest1Year,
          bankAccountId: fdBankAccountId,
          receivedFrom: fdBankName,
          paymentMode: 'Bank Transfer',
          date: fdDepositDate,
          notes: `Expected 1-Year FD interest return at ${fdInterestRatePercent}% p.a. Maturing on ${calc.maturityDate}.`
        });
      }
    }
    setShowFDModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-600" /> CEO Private Expenses, Income & Fixed Deposit Console
            </h2>
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-md text-[10px] font-black uppercase flex items-center gap-1">
              <Lock className="w-3 h-3" /> PRIVATE FOUNDER REFERENCE ONLY
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium max-w-3xl">
            Isolated executive discretionary ledger. Manage Fixed Deposits (FDs), track interest yield returns after 1 year, and log private income/spends.
            <strong className="text-slate-800 font-bold ml-1">Entries logged here DO NOT sync with General Ledger, Invoices, or Main Company Expenses.</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
          <button
            onClick={handleOpenNewFDModal}
            className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-extrabold rounded-xl shadow-md shadow-indigo-700/20 flex items-center gap-1.5"
          >
            <Landmark className="w-4 h-4" /> + Log Fixed Deposit (FD)
          </button>

          <button
            onClick={handleOpenNewIncomeModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> + Add Other Private Income
          </button>

          <button
            onClick={handleOpenNewExpenseModal}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-amber-600/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> + Log CEO Private Expense
          </button>
        </div>
      </div>

      {/* Fixed Deposit Treasury Yield Banner */}
      {totalFDPrincipal > 0 && (
        <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 p-5 rounded-2xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-indigo-700">
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-md border border-indigo-500/30 flex items-center gap-1.5 w-fit">
              <PiggyBank className="w-3.5 h-3.5" /> 1-YEAR FIXED DEPOSIT (FD) TREASURY YIELD VAULT
            </span>
            <h3 className="text-lg font-extrabold mt-1.5 text-white">Fixed Deposit Capital & Annual Interest Returns</h3>
            <p className="text-xs text-indigo-200 font-medium mt-0.5 max-w-2xl">
              Track active corporate & personal FDs, annual interest APY rates, 1-year expected returns, and maturity values.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-right">
              <span className="text-[9.5px] font-bold uppercase text-indigo-200 block">TOTAL PRINCIPAL IN FDs</span>
              <p className="text-base font-mono font-black text-white">{formatCurrency(totalFDPrincipal)}</p>
            </div>

            <div className="bg-indigo-500/20 backdrop-blur-md px-3.5 py-2 rounded-xl border border-indigo-400/30 text-right">
              <span className="text-[9.5px] font-bold uppercase text-indigo-300 block">WEIGHTED APY RATE</span>
              <p className="text-base font-mono font-black text-indigo-300">{weightedAverageAPY}% p.a.</p>
            </div>

            <div className="bg-emerald-500/20 backdrop-blur-md px-3.5 py-2 rounded-xl border border-emerald-500/30 text-right">
              <span className="text-[9.5px] font-bold uppercase text-emerald-300 block">1-YR EXPECTED INTEREST</span>
              <p className="text-base font-mono font-black text-emerald-300">+{formatCurrency(totalFDExpectedInterest1Year)}</p>
            </div>

            <div className="bg-amber-500 px-4 py-2 rounded-xl text-slate-950 shadow-md text-right">
              <span className="text-[9.5px] font-black uppercase text-slate-950 block">EXPECTED MATURITY VALUE</span>
              <p className="text-base font-mono font-black text-slate-950">{formatCurrency(totalFDMaturityValue)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Reference Capital Pools Display Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Pool 1: Realized Cash Net Profit */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 border-l-4 border-l-emerald-600 shadow-sm">
          <span className="text-[9.5px] font-black text-emerald-700 uppercase block">REALIZED CASH NET PROFIT</span>
          <p className="text-lg font-mono font-black text-emerald-700 mt-0.5">{formatCurrency(realizedNetProfit)}</p>
          <p className="text-[9.5px] text-slate-500 font-bold mt-1">Cash received minus expenses</p>
        </div>

        {/* Pool 2: Personnel Expenses */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 border-l-4 border-l-blue-600 shadow-sm">
          <span className="text-[9.5px] font-black text-blue-700 uppercase block">PERSONNEL EXPENSES POOL</span>
          <p className="text-lg font-mono font-black text-slate-900 mt-0.5">{formatCurrency(totalPersonnel)}</p>
          <p className="text-[9.5px] text-slate-500 font-bold mt-1">Salaries & Allocations</p>
        </div>

        {/* Pool 3: Wellbeing Expenses */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 border-l-4 border-l-pink-600 shadow-sm">
          <span className="text-[9.5px] font-black text-pink-700 uppercase block">EMPLOYEE WELLBEING POOL</span>
          <p className="text-lg font-mono font-black text-slate-900 mt-0.5">{formatCurrency(totalWellbeing)}</p>
          <p className="text-[9.5px] text-slate-500 font-bold mt-1">Team Perks & Health Amenities</p>
        </div>

        {/* Pool 4: System Depreciation */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 border-l-4 border-l-slate-700 shadow-sm">
          <span className="text-[9.5px] font-black text-slate-700 uppercase block">SYSTEM DEPRECIATION POOL</span>
          <p className="text-lg font-mono font-black text-slate-900 mt-0.5">{formatCurrency(totalDepreciation)}</p>
          <p className="text-[9.5px] text-slate-500 font-bold mt-1">Asset Charges & Equipment</p>
        </div>

        {/* Pool 5: Other Private CEO Income */}
        <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-300 border-l-4 border-l-emerald-500 shadow-sm">
          <span className="text-[9.5px] font-black text-emerald-800 uppercase block">OTHER PRIVATE CEO INCOME</span>
          <p className="text-lg font-mono font-black text-emerald-800 mt-0.5">+{formatCurrency(totalPrivateCEOIncome)}</p>
          <p className="text-[9.5px] text-emerald-700 font-bold mt-1">Logged private income & FD yields</p>
        </div>
      </div>

      {/* Combined CEO Capital Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-2xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-800">
        <div>
          <span className="text-[10px] font-black tracking-widest uppercase bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-md border border-amber-500/30">
            👑 COMBINED CEO REFERENCE CAPITAL POOL
          </span>
          <h3 className="text-xl font-extrabold mt-1 text-white">Private Executive Fund Balance</h3>
          <p className="text-xs text-slate-300 font-medium mt-0.5 max-w-2xl">
            Realized Net Profit + Personnel + Wellbeing + Depreciation + Other Private Income ({formatCurrency(combinedReferencePool)}). 
            Private CEO spends (-{formatCurrency(totalCEOSpent)}) and FD capital investments (-{formatCurrency(totalFDPrincipal)}) deduct from this balance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="bg-emerald-500/20 backdrop-blur-md px-3.5 py-2 rounded-xl border border-emerald-500/30 text-right">
            <span className="text-[9.5px] font-bold uppercase text-emerald-300 block">PRIVATE INCOME</span>
            <p className="text-base font-mono font-black text-emerald-300">+{formatCurrency(totalPrivateCEOIncome)}</p>
          </div>

          {totalFDPrincipal > 0 && (
            <div className="bg-indigo-500/20 backdrop-blur-md px-3.5 py-2 rounded-xl border border-indigo-400/30 text-right">
              <span className="text-[9.5px] font-bold uppercase text-indigo-300 block">INVESTED IN FDs</span>
              <p className="text-base font-mono font-black text-indigo-300">-{formatCurrency(totalFDPrincipal)}</p>
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-right">
            <span className="text-[9.5px] font-bold uppercase text-rose-300 block">PRIVATE SPENT</span>
            <p className="text-base font-mono font-black text-rose-200">-{formatCurrency(totalCEOSpent)}</p>
          </div>

          <div className="bg-amber-500 px-4 py-2.5 rounded-xl text-slate-950 shadow-lg text-right">
            <span className="text-[10px] font-black uppercase text-slate-950 block">AVAILABLE CEO BALANCE</span>
            <p className="text-lg font-mono font-black text-slate-950">{formatCurrency(remainingCEOBalance)}</p>
          </div>
        </div>
      </div>

      {/* Main Console & Table Card with Sub-Tabs */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" /> Private CEO Audit Console
            </h3>
            <p className="text-xs text-slate-500 font-medium">Private ledger of CEO discretionary expenses, personal income sources, and Fixed Deposits.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sub-Tabs Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl font-bold text-xs">
              <button
                onClick={() => setActiveLogTab('EXPENSES')}
                className={`px-3 py-1.5 rounded-lg transition ${activeLogTab === 'EXPENSES' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Private Expenses ({ceoExpenseRecords.length})
              </button>
              <button
                onClick={() => setActiveLogTab('INCOMES')}
                className={`px-3 py-1.5 rounded-lg transition ${activeLogTab === 'INCOMES' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Private Incomes ({ceoIncomeRecords.length})
              </button>
              <button
                onClick={() => setActiveLogTab('FDS')}
                className={`px-3 py-1.5 rounded-lg transition ${activeLogTab === 'FDS' ? 'bg-white text-indigo-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Fixed Deposits FD ({ceoFDRecords.length})
              </button>
              <button
                onClick={() => setActiveLogTab('COMBINED')}
                className={`px-3 py-1.5 rounded-lg transition ${activeLogTab === 'COMBINED' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Combined Audit ({combinedLogs.length})
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 font-bold outline-none focus:bg-white w-52"
              />
            </div>
          </div>
        </div>

        {/* SUB-TAB 1: PRIVATE EXPENSES TABLE */}
        {activeLogTab === 'EXPENSES' && (
          <div className="overflow-x-auto overflow-y-auto max-h-[450px] custom-scrollbar rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase font-extrabold text-[10px] sticky top-0 z-10">
                <tr>
                  <th className="p-3">Expense ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Item & Qty</th>
                  <th className="p-3">Full Description</th>
                  <th className="p-3">Vendor / Paid To</th>
                  <th className="p-3">Deducted Bank Account</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredExpenses.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-amber-700">{rec.id}</td>
                    <td className="p-3 font-mono text-slate-600">{rec.date}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-900 rounded text-[10px] font-extrabold border border-amber-200">
                        {rec.category}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {rec.item || 'Executive Spend'}
                      <span className="text-[10px] font-mono text-slate-500 font-normal block">
                        Qty: {rec.quantity || 1}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 max-w-xs truncate" title={rec.description}>
                      {rec.description || '—'}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{rec.paidTo}</td>
                    <td className="p-3 font-mono text-slate-600 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Landmark className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{rec.bankAccountName || rec.paymentMode}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono font-black text-rose-700">-{formatCurrency(rec.amount)}</td>
                    <td className="p-3 text-right flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEditExpenseModal(rec)}
                        className="text-slate-400 hover:text-blue-600 p-1 transition"
                        title="Edit Entry"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete CEO expense "${rec.item || rec.id}"?`)) {
                            deleteCEOExpense(rec.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 transition"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 italic font-sans">
                      No CEO private expense entries logged yet. Click "+ Log CEO Private Expense" to add your first private reference entry.
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredExpenses.length > 0 && (
                <tfoot className="bg-slate-900 text-white font-mono font-black text-xs sticky bottom-0 z-10">
                  <tr>
                    <td colSpan={7} className="p-3 font-sans uppercase">TOTAL CEO PRIVATE SPEND ({filteredExpenses.length} ITEMS)</td>
                    <td className="p-3 text-right text-rose-300">-{formatCurrency(totalCEOSpent)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {/* SUB-TAB 2: OTHER PRIVATE INCOMES TABLE */}
        {activeLogTab === 'INCOMES' && (
          <div className="overflow-x-auto overflow-y-auto max-h-[450px] custom-scrollbar rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-950 text-white uppercase font-extrabold text-[10px] sticky top-0 z-10">
                <tr>
                  <th className="p-3">Income ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Source Category</th>
                  <th className="p-3">Income Source Title</th>
                  <th className="p-3">Received From</th>
                  <th className="p-3">Deposited Account</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredIncomes.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-emerald-700">{rec.id}</td>
                    <td className="p-3 font-mono text-slate-600">{rec.date}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-900 rounded text-[10px] font-extrabold border border-emerald-200">
                        {rec.category}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{rec.sourceTitle}</td>
                    <td className="p-3 text-slate-700">{rec.receivedFrom}</td>
                    <td className="p-3 font-mono text-slate-600 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Landmark className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{rec.bankAccountName || rec.paymentMode}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono font-black text-emerald-700">+{formatCurrency(rec.amount)}</td>
                    <td className="p-3 text-right flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEditIncomeModal(rec)}
                        className="text-slate-400 hover:text-blue-600 p-1 transition"
                        title="Edit Income"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete CEO income "${rec.sourceTitle}"?`)) {
                            deleteCEOIncome(rec.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 transition"
                        title="Delete Income"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredIncomes.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 italic font-sans">
                      No private CEO income sources logged yet. Click "+ Add Other Private Income" above to log personal investments or advisory fees.
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredIncomes.length > 0 && (
                <tfoot className="bg-emerald-950 text-white font-mono font-black text-xs sticky bottom-0 z-10">
                  <tr>
                    <td colSpan={6} className="p-3 font-sans uppercase">TOTAL OTHER PRIVATE CEO INCOME ({filteredIncomes.length} SOURCES)</td>
                    <td className="p-3 text-right text-emerald-300">+{formatCurrency(totalPrivateCEOIncome)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {/* SUB-TAB 3: FIXED DEPOSITS (FD) & YIELD TABLE */}
        {activeLogTab === 'FDS' && (
          <div className="overflow-x-auto overflow-y-auto max-h-[450px] custom-scrollbar rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-indigo-950 text-white uppercase font-extrabold text-[10px] sticky top-0 z-10">
                <tr>
                  <th className="p-3">FD Ref ID</th>
                  <th className="p-3">Bank / Institution</th>
                  <th className="p-3">Deposit & Maturity Date</th>
                  <th className="p-3 text-right">Principal FD Amount</th>
                  <th className="p-3 text-center">Interest APY</th>
                  <th className="p-3 text-right">1-Year Expected Return</th>
                  <th className="p-3 text-right">Maturity Value</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredFDs.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-indigo-700">{rec.id}</td>
                    <td className="p-3 font-bold text-slate-900">
                      {rec.bankName}
                      <span className="text-[10px] text-slate-500 font-normal block">{rec.depositTitle}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-600 text-[11px]">
                      <div>Starts: {rec.depositDate}</div>
                      <div className="text-amber-800 font-bold">Matures: {rec.maturityDate}</div>
                    </td>
                    <td className="p-3 text-right font-mono font-black text-slate-900">{formatCurrency(rec.principalAmount)}</td>
                    <td className="p-3 text-center font-mono font-extrabold text-indigo-700">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-900 rounded border border-indigo-200">
                        {rec.interestRatePercent}% p.a.
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-black text-emerald-700">
                      +{formatCurrency(rec.expectedInterestEarned1Year)}
                    </td>
                    <td className="p-3 text-right font-mono font-black text-amber-800">
                      {formatCurrency(rec.expectedMaturityValue)}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        rec.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                        rec.status === 'MATURED' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                        'bg-purple-100 text-purple-900 border border-purple-300'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="p-3 text-right flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEditFDModal(rec)}
                        className="text-slate-400 hover:text-blue-600 p-1 transition"
                        title="Edit FD"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete FD "${rec.depositTitle}"?`)) {
                            deleteCEOFDRecord(rec.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 transition"
                        title="Delete FD"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredFDs.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 italic font-sans">
                      No Fixed Deposits (FDs) logged yet. Click "+ Log Fixed Deposit (FD)" above to record your FDs and calculate 1-year expected returns.
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredFDs.length > 0 && (
                <tfoot className="bg-indigo-950 text-white font-mono font-black text-xs sticky bottom-0 z-10">
                  <tr>
                    <td colSpan={3} className="p-3 font-sans uppercase">TOTAL FIXED DEPOSITS ({filteredFDs.length} FDs)</td>
                    <td className="p-3 text-right">{formatCurrency(totalFDPrincipal)}</td>
                    <td className="p-3 text-center text-indigo-300">{weightedAverageAPY}% APY</td>
                    <td className="p-3 text-right text-emerald-300">+{formatCurrency(totalFDExpectedInterest1Year)}</td>
                    <td className="p-3 text-right text-amber-300">{formatCurrency(totalFDMaturityValue)}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {/* SUB-TAB 4: COMBINED PRIVATE CASH FLOW AUDIT LOG */}
        {activeLogTab === 'COMBINED' && (
          <div className="overflow-x-auto overflow-y-auto max-h-[450px] custom-scrollbar rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase font-extrabold text-[10px] sticky top-0 z-10">
                <tr>
                  <th className="p-3">Type</th>
                  <th className="p-3">Ref ID & Date</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Title / Item</th>
                  <th className="p-3">Entity / Institution</th>
                  <th className="p-3">Account / Status</th>
                  <th className="p-3 text-right">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {combinedLogs.map(item => {
                  const isInc = item.type === 'INCOME';
                  const isFD = item.type === 'FD';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black inline-flex items-center gap-1 ${
                          isInc ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          isFD ? 'bg-indigo-100 text-indigo-900 border border-indigo-300' :
                          'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {isInc ? <ArrowUpRight className="w-3 h-3 text-emerald-700" /> :
                           isFD ? <Landmark className="w-3 h-3 text-indigo-700" /> :
                           <ArrowDownRight className="w-3 h-3 text-rose-700" />}
                          {item.type}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-800">
                        {item.id}
                        <span className="text-[10px] text-slate-500 font-normal block">{item.date}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{item.category}</td>
                      <td className="p-3 font-bold text-slate-900">{item.title}</td>
                      <td className="p-3 text-slate-700">{item.entity}</td>
                      <td className="p-3 font-mono text-slate-600 text-[11px]">{item.account}</td>
                      <td className={`p-3 text-right font-mono font-black ${isInc ? 'text-emerald-700' : isFD ? 'text-indigo-800' : 'text-rose-700'}`}>
                        {isInc ? `+${formatCurrency(item.amount)}` : formatCurrency(item.amount)}
                      </td>
                    </tr>
                  );
                })}
                {combinedLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 italic font-sans">
                      No private cash flow entries logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
              {combinedLogs.length > 0 && (
                <tfoot className="bg-slate-950 text-white font-mono font-black text-xs sticky bottom-0 z-10">
                  <tr>
                    <td colSpan={2} className="p-3 font-sans uppercase text-slate-300">
                      COMBINED AUDIT TOTAL ({combinedLogs.length} ENTRIES)
                    </td>
                    <td colSpan={4} className="p-3 font-sans text-right text-[11px]">
                      <span className="text-emerald-400 font-mono font-black mr-3">Incomes: +{formatCurrency(totalCombinedIncomes)}</span>
                      {totalCombinedFDs > 0 && (
                        <span className="text-indigo-300 font-mono font-black mr-3">FDs: -{formatCurrency(totalCombinedFDs)}</span>
                      )}
                      <span className="text-rose-400 font-mono font-black">Spent: -{formatCurrency(totalCombinedExpenses)}</span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-black border ${
                        netCombinedFlow >= 0 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {netCombinedFlow >= 0 ? `+${formatCurrency(netCombinedFlow)}` : formatCurrency(netCombinedFlow)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      {/* LOG / EDIT CEO PRIVATE EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-600" /> {editingExpenseId ? 'Edit Private CEO Expense' : 'Log Private CEO Expense'}
                </h3>
                <p className="text-xs text-slate-500">Comprehensive executive form: Category, Description, Bank, Item, Qty & Vendor.</p>
              </div>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-4 text-xs">
              {/* Category & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-700 font-bold flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-amber-600" /> Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddExpCatInput(!showAddExpCatInput)}
                      className="text-[10px] text-amber-700 font-extrabold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Custom Category
                    </button>
                  </div>

                  {showAddExpCatInput ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type new category name..."
                        value={customExpCatInput}
                        onChange={(e) => setCustomExpCatInput(e.target.value)}
                        className="flex-1 bg-amber-50 border border-amber-300 rounded-xl p-2 text-slate-900 font-bold outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomExpCategory}
                        className="px-3 py-2 bg-amber-600 text-white font-extrabold rounded-xl"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <select
                      value={expCategory}
                      onChange={(e) => setExpCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                    >
                      {expenseCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Expense Date</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* Item Name & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-slate-700 mb-1 font-bold flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-blue-600" /> Item Name / Purchased Good / Service
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MacBook Pro M3 Max / Cloud Server / Executive Flight"
                    value={expItem}
                    onChange={(e) => setExpItem(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Quantity (Qty)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={expQuantity}
                    onChange={(e) => setExpQuantity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Description & Vendor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Full Expense Description</label>
                  <input
                    type="text"
                    required
                    placeholder="Detailed explanation of purchase purpose..."
                    value={expDescription}
                    onChange={(e) => setExpDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Vendor / Paid To / Beneficiary</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apple Store / Emirates / Consultant Name"
                    value={expPaidTo}
                    onChange={(e) => setExpPaidTo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* Amount & Bank Account */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Total Amount (INR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-black text-rose-700 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold flex items-center gap-1">
                    <Landmark className="w-3.5 h-3.5 text-indigo-600" /> Bank Account to be Deducted
                  </label>
                  <select
                    value={expBankAccountId}
                    onChange={(e) => setExpBankAccountId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    {accountOptions.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                    {accountOptions.length === 0 && (
                      <option value="">Primary Corporate Bank Account</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Payment Mode & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Payment Mode</label>
                  <select
                    value={expPaymentMode}
                    onChange={(e) => setExpPaymentMode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Corporate Credit Card">Corporate Credit Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Crypto USDT">Crypto USDT</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 mb-1 font-bold">Private Executive Notes</label>
                  <input
                    type="text"
                    value={expNotes}
                    onChange={(e) => setExpNotes(e.target.value)}
                    placeholder="Private reference notes for CEO audit..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 font-bold text-[10.5px]">
                ⚡ Note: This transaction is saved ONLY inside this CEO Expenses private console for your personal offline reference. It is NOT linked, synced, or shared with General Ledger or Company Operating Expenses.
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-extrabold rounded-xl shadow-md"
                >
                  Save CEO Private Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT OTHER PRIVATE CEO INCOME MODAL */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" /> {editingIncomeId ? 'Edit Other Private Income' : 'Add Other Private Income'}
                </h3>
                <p className="text-xs text-slate-500">Log private personal income, investments, or advisory fees (Adds to Available CEO Balance ONLY).</p>
              </div>
              <button
                onClick={() => setShowIncomeModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIncomeSubmit} className="space-y-4 text-xs">
              {/* Income Category & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-700 font-bold flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" /> Income Source Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddIncCatInput(!showAddIncCatInput)}
                      className="text-[10px] text-emerald-700 font-extrabold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Custom Category
                    </button>
                  </div>

                  {showAddIncCatInput ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type custom income category..."
                        value={customIncCatInput}
                        onChange={(e) => setCustomIncCatInput(e.target.value)}
                        className="flex-1 bg-emerald-50 border border-emerald-300 rounded-xl p-2 text-slate-900 font-bold outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomIncCategory}
                        className="px-3 py-2 bg-emerald-600 text-white font-extrabold rounded-xl"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <select
                      value={incCategory}
                      onChange={(e) => setIncCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                    >
                      {incomeCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Received Date</label>
                  <input
                    type="date"
                    required
                    value={incDate}
                    onChange={(e) => setIncDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* Income Title & Received From */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Income Source Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Private Web3 Advisory Fee / External Dividend"
                    value={incSourceTitle}
                    onChange={(e) => setIncSourceTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Received From (Payer / Entity)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. External Client / Investment Partner Name"
                    value={incReceivedFrom}
                    onChange={(e) => setIncReceivedFrom(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* Income Amount & Deposited Bank Account */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Income Amount (INR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={incAmount}
                    onChange={(e) => setIncAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-black text-emerald-700 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold flex items-center gap-1">
                    <Landmark className="w-3.5 h-3.5 text-indigo-600" /> Deposited Bank Account
                  </label>
                  <select
                    value={incBankAccountId}
                    onChange={(e) => setIncBankAccountId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    {accountOptions.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                    {accountOptions.length === 0 && (
                      <option value="">Primary Corporate Bank Account</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Payment Mode & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Payment Mode</label>
                  <select
                    value={incPaymentMode}
                    onChange={(e) => setIncPaymentMode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Crypto USDT">Crypto USDT</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 mb-1 font-bold">Private Notes</label>
                  <input
                    type="text"
                    value={incNotes}
                    onChange={(e) => setIncNotes(e.target.value)}
                    placeholder="Private income reference notes..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 font-bold text-[10.5px]">
                ⚡ Note: This income entry is saved strictly inside your private CEO console for personal reference. It adds to your Available CEO Balance and is NOT synced with company tax invoices or main P&L revenue.
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowIncomeModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-extrabold rounded-xl shadow-md"
                >
                  Save Other Private Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG / EDIT FIXED DEPOSIT (FD) MODAL WITH LIVE 1-YEAR INTEREST CALCULATOR */}
      {showFDModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-indigo-600" /> {editingFDId ? 'Edit Fixed Deposit (FD)' : 'Log Fixed Deposit (FD) & Yield Calculator'}
                </h3>
                <p className="text-xs text-slate-500">Calculate 1-year interest returns, rate of interest (% p.a.), and maturity payouts.</p>
              </div>
              <button
                onClick={() => setShowFDModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFDSubmit} className="space-y-4 text-xs">
              {/* FD Title & Select Registered Bank */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">FD Title / Deposit Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1-Year Senior High-Yield FD"
                    value={fdDepositTitle}
                    onChange={(e) => setFdDepositTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold flex items-center gap-1">
                    <Landmark className="w-3.5 h-3.5 text-indigo-600" /> Select Registered Bank Account / Institution
                  </label>
                  <select
                    value={fdBankAccountId || 'CUSTOM'}
                    onChange={(e) => {
                      const selId = e.target.value;
                      if (selId === 'CUSTOM') {
                        setFdBankAccountId('');
                      } else {
                        setFdBankAccountId(selId);
                        const found = accountOptions.find(a => a.id === selId);
                        if (found) {
                          setFdBankName(found.name);
                        }
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    {accountOptions.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                    <option value="CUSTOM">+ Other Custom Bank / Institution (Specify Below)</option>
                  </select>
                </div>
              </div>

              {/* Custom Bank Name Field if CUSTOM selected */}
              {(!fdBankAccountId || fdBankAccountId === 'CUSTOM') && (
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Custom Bank / Institution Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC Bank Corporate / SBI / Bajaj Finance"
                    value={fdBankName}
                    onChange={(e) => setFdBankName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>
              )}

              {/* Principal Amount & Rate of Interest */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Principal Deposit Amount (INR)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="e.g. 500000"
                    value={fdPrincipalAmount}
                    onChange={(e) => setFdPrincipalAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-black text-indigo-700 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-indigo-600" /> Rate of Interest (% p.a.)
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0.1"
                    max="50"
                    placeholder="e.g. 7.5"
                    value={fdInterestRatePercent}
                    onChange={(e) => setFdInterestRatePercent(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Tenure Duration</label>
                  <select
                    value={fdTenureMonths}
                    onChange={(e) => setFdTenureMonths(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value={6}>6 Months (0.5 Year)</option>
                    <option value={12}>12 Months (1 Year)</option>
                    <option value={24}>24 Months (2 Years)</option>
                    <option value={36}>36 Months (3 Years)</option>
                    <option value={60}>60 Months (5 Years)</option>
                  </select>
                </div>
              </div>

              {/* Compounding & Start Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Compounding Frequency</label>
                  <select
                    value={fdCompoundingFrequency}
                    onChange={(e) => setFdCompoundingFrequency(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="QUARTERLY">Quarterly Compounding (Standard Indian Banks)</option>
                    <option value="ANNUAL">Annual Compounding</option>
                    <option value="SIMPLE">Simple Interest Payout</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">FD Deposit Date</label>
                  <input
                    type="date"
                    required
                    value={fdDepositDate}
                    onChange={(e) => setFdDepositDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">FD Status</label>
                  <select
                    value={fdStatus}
                    onChange={(e) => setFdStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="MATURED">MATURED</option>
                    <option value="RENEWED">RENEWED</option>
                  </select>
                </div>
              </div>

              {/* LIVE INTEREST RETURN & MATURITY CALCULATOR BOX */}
              <div className="bg-gradient-to-r from-indigo-900 to-blue-900 p-4 rounded-xl text-white space-y-2.5 border border-indigo-700 shadow-inner">
                <div className="flex justify-between items-center border-b border-indigo-700/60 pb-2">
                  <span className="text-[10px] font-black uppercase text-indigo-300 tracking-wider flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5" /> LIVE 1-YEAR RETURN CALCULATOR SUMMARY
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-300">
                    Maturity Date: {currentModalFDCalc.maturityDate}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[9.5px] text-indigo-200 block font-semibold">Principal Deposited</span>
                    <p className="text-sm font-mono font-black text-white">{formatCurrency(Number(fdPrincipalAmount) || 0)}</p>
                  </div>

                  <div>
                    <span className="text-[9.5px] text-emerald-300 block font-extrabold uppercase">Expected Return After 1 Year</span>
                    <p className="text-sm font-mono font-black text-emerald-300">+{formatCurrency(currentModalFDCalc.interest1Year)}</p>
                  </div>

                  <div>
                    <span className="text-[9.5px] text-amber-300 block font-extrabold uppercase">Total Maturity Value ({fdTenureMonths}M)</span>
                    <p className="text-sm font-mono font-black text-amber-300">{formatCurrency(currentModalFDCalc.maturityValue)}</p>
                  </div>
                </div>
              </div>

              {/* Auto-Add Interest to CEO Income Checkbox */}
              <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="autoAddFDInterest"
                  checked={autoAddFDInterestToIncome}
                  onChange={(e) => setAutoAddFDInterestToIncome(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded accent-indigo-600 cursor-pointer"
                />
                <label htmlFor="autoAddFDInterest" className="text-xs text-slate-800 font-bold cursor-pointer">
                  Auto-record expected 1-year interest return (+{formatCurrency(currentModalFDCalc.interest1Year)}) into Private CEO Income Balance
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFDModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-700 text-white font-extrabold rounded-xl shadow-md"
                >
                  Save Fixed Deposit (FD)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
