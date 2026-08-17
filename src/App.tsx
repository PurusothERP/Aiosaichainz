import React, { useState, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Currency, Lead, AMCContract } from './types';
import { AichainzLogo } from './components/AichainzLogo';
import { OverviewCards } from './components/Dashboard/OverviewCards';
import { DashboardCharts } from './components/Dashboard/DashboardCharts';
import { FinancialSummary } from './components/Dashboard/FinancialSummary';
import { SalesPipeline } from './components/Sales/SalesPipeline';
import { DocumentStudio } from './components/Invoicing/DocumentStudio';
import { AMCManager } from './components/AMC/AMCManager';
import { AccountsManager } from './components/Accounts/AccountsManager';
import { TreasuryAssetManager } from './components/Treasury/TreasuryAssetManager';
import { EventTravelManager } from './components/Events/EventTravelManager';
import { HRManager } from './components/HR/HRManager';
import { BrandedLetterhead } from './components/Letterhead/BrandedLetterhead';
import { ClientProjectsVault } from './components/Projects/ClientProjectsVault';
import { ProjectPLManager } from './components/Projects/ProjectPLManager';
import { AIIntelligenceEngine } from './components/AI/AIIntelligenceEngine';
import { DocumentsVault } from './components/Documents/DocumentsVault';
import { SubscriptionsEMIManager } from './components/Subscriptions/SubscriptionsEMIManager';
import { CEOExpensesManager } from './components/CEO/CEOExpensesManager';
import { LoginPage, AuthSession, getSession, clearSession } from './components/Auth/LoginPage';

import {
  LayoutDashboard,
  Target,
  FileText,
  DollarSign,
  Users,
  Building2,
  FolderCheck,
  FolderKanban,
  Globe,
  ShieldCheck,
  Landmark,
  Plane,
  Menu,
  X,
  Pin,
  ChevronRight,
  Brain,
  LogOut,
  UserCircle,
  Trash2,
  FolderOpen,
  CreditCard,
  Crown,
  Lock,
  Download,
  Upload
} from 'lucide-react';
import { exportSystemJSONBackup, importSystemJSONBackup } from './utils/exportUtils';

interface MainLayoutProps { session: AuthSession; onLogout: () => void; }

const MainLayout: React.FC<MainLayoutProps> = ({ session, onLogout }) => {
  const { company, activeCurrency, setActiveCurrency, clearAllData } = useApp();

  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'SALES' | 'INVOICES' | 'PROJECT_PL' | 'AMC' | 'VAULT' | 'ACCOUNTS' | 'TREASURY' | 'EVENTS' | 'HR' | 'LETTERHEAD' | 'AI_ENGINE' | 'DOCUMENTS' | 'SUBSCRIPTIONS' | 'CEO_EXPENSES'>('DASHBOARD');

  // Purge DB Security Modal State
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeInputPassword, setPurgeInputPassword] = useState('');
  const [purgeError, setPurgeError] = useState('');

  // Collapsible Hover Sidebar state
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [leadToQuote, setLeadToQuote] = useState<Lead | null>(null);

  const handleConvertToQuotation = (lead: Lead) => {
    setLeadToQuote(lead);
    setActiveTab('INVOICES');
  };

  const isExpanded = isSidebarPinned || isSidebarHovered || mobileMenuOpen;

  const navItems = [
    { id: 'DASHBOARD', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'AI_ENGINE', label: 'AI Intelligence Engine', icon: Brain, highlight: true },
    { id: 'SALES', label: 'Sales Pipeline CRM', icon: Target },
    { id: 'INVOICES', label: 'Quotation & Invoices', icon: FileText },
    { id: 'PROJECT_PL', label: 'Project-Wise P&L', icon: FolderKanban },
    { id: 'DOCUMENTS', label: 'Client Documents Vault', icon: FolderOpen },
    { id: 'SUBSCRIPTIONS', label: 'Subscriptions & EMI', icon: CreditCard },
    { id: 'CEO_EXPENSES', label: 'CEO Expenses', icon: Crown, highlight: true },
    { id: 'AMC', label: 'AMC Contracts Suite', icon: ShieldCheck },
    { id: 'VAULT', label: 'Completed Client Vault', icon: FolderCheck },
    { id: 'ACCOUNTS', label: 'Accounts & Expenses', icon: DollarSign },
    { id: 'TREASURY', label: 'Treasury & Assets Vault', icon: Landmark },
    { id: 'EVENTS', label: 'Events & Travel ROI', icon: Plane },
    { id: 'HR', label: 'HR, Attendance & Payroll', icon: Users },
    { id: 'LETTERHEAD', label: 'Branded Letterhead', icon: Building2 }
  ] as const;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Hover Collapsible Sidebar */}
      <aside
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`sticky top-0 h-screen overflow-y-auto bg-white border-r border-slate-200 flex flex-col justify-between no-print z-40 transition-all duration-300 shadow-sm flex-shrink-0 ${
          isExpanded ? 'w-full md:w-64' : 'w-full md:w-20'
        }`}
      >
        <div>
          {/* Top Brand Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center h-16">
            {isExpanded ? (
              <div className="flex items-center justify-between w-full">
                <AichainzLogo size={34} />
                <button
                  onClick={() => setIsSidebarPinned(!isSidebarPinned)}
                  className={`hidden md:block p-1.5 rounded-lg text-xs transition ${
                    isSidebarPinned ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title={isSidebarPinned ? 'Unpin Sidebar' : 'Pin Sidebar Open'}
                >
                  <Pin className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-sm">
                  AI
                </div>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-500 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : (item as any).highlight && !isActive
                        ? 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 border border-indigo-200 hover:from-indigo-100 hover:to-violet-100'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : (item as any).highlight ? 'text-indigo-600' : 'text-slate-500'}`} />
                  {isExpanded && <span className="truncate">{item.label}</span>}
                  {isExpanded && (item as any).highlight && !isActive && (
                    <span className="ml-auto text-[9px] font-extrabold bg-indigo-600 text-white px-1.5 py-0.5 rounded">AI</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          {isExpanded ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Display Currency</span>
                <span className="font-mono text-blue-700">{activeCurrency}</span>
              </div>
              <div className="grid grid-cols-4 gap-1 bg-white p-1 rounded-lg border border-slate-200 text-[10px] font-black">
                {(['INR', 'USD', 'AED', 'RWF'] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => setActiveCurrency(c)}
                    className={`py-1 rounded transition ${activeCurrency === c ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="pt-2 text-[10px] text-slate-400 font-medium text-center border-t border-slate-200">
                Aichainz AI-AIOS ERP v2.5 • Founder CEO Edition
              </div>
            </div>
          ) : (
            <div className="flex justify-center text-slate-400 text-xs font-mono font-bold">
              {activeCurrency}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {/* Dynamic Header Badge */}
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 no-print">
          <div>
            <span className="text-[10px] font-black tracking-widest text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              AICHAINZ EXECUTIVE OPERATING SYSTEM
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
              {navItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 shadow-2xs flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span className="hidden lg:inline">Multi-Office: India / UAE / Rwanda</span>
              <span className="lg:hidden">IND/UAE/RWA</span>
            </div>

            {/* Save & Download Backup Button */}
            <button
              onClick={() => exportSystemJSONBackup()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-extrabold transition shadow-2xs"
              title="Download 100% full JSON backup of all application data"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Save Backup</span>
            </button>

            {/* Restore Backup Button */}
            <label
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 rounded-xl text-xs font-extrabold transition shadow-2xs cursor-pointer"
              title="Upload & Restore full JSON backup file"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Restore Backup</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    importSystemJSONBackup(
                      file,
                      () => {
                        alert('✅ Application Backup Restored Successfully! Refreshing application state...');
                        window.location.reload();
                      },
                      (err) => alert('❌ Error restoring backup: ' + err)
                    );
                  }
                }}
              />
            </label>

            {/* User Info Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-800">
              <UserCircle className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">{session.username}</span>
            </div>
            {/* Clear Database Reset Button */}
            <button
              onClick={() => {
                setPurgeInputPassword('');
                setPurgeError('');
                setShowPurgeModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold transition"
              title="Purge all data to start fresh (Password Required)"
            >
              <Trash2 className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Purge DB</span>
            </button>
            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-extrabold transition-all group"
              title="Sign out of AIOS"
            >
              <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Tab Content Router */}
        <div className="space-y-8">
          {activeTab === 'DASHBOARD' && (
            <>
              <OverviewCards />
              <DashboardCharts />
              <FinancialSummary />
            </>
          )}

          {activeTab === 'SALES' && (
            <SalesPipeline onConvertToQuotation={handleConvertToQuotation} />
          )}

          {activeTab === 'INVOICES' && (
            <DocumentStudio
              initialLeadToQuote={leadToQuote}
              onClearLeadToQuote={() => setLeadToQuote(null)}
            />
          )}

          {activeTab === 'AI_ENGINE' && (
            <AIIntelligenceEngine />
          )}

          {activeTab === 'PROJECT_PL' && (
            <ProjectPLManager />
          )}

          {activeTab === 'DOCUMENTS' && (
            <DocumentsVault />
          )}

          {activeTab === 'SUBSCRIPTIONS' && (
            <SubscriptionsEMIManager />
          )}

          {activeTab === 'CEO_EXPENSES' && (
            <CEOExpensesManager />
          )}

          {activeTab === 'AMC' && (
            <AMCManager onGenerateAMCInvoice={() => setActiveTab('INVOICES')} />
          )}

          {activeTab === 'VAULT' && (
            <ClientProjectsVault />
          )}

          {activeTab === 'ACCOUNTS' && (
            <AccountsManager />
          )}

          {activeTab === 'TREASURY' && (
            <TreasuryAssetManager />
          )}

          {activeTab === 'EVENTS' && (
            <EventTravelManager />
          )}

          {activeTab === 'HR' && (
            <HRManager />
          )}

          {activeTab === 'LETTERHEAD' && (
            <BrandedLetterhead />
          )}
        </div>
      </main>

      {/* Password Protection Modal for Purge DB */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-600" /> Purge DB Password Authorization
              </h3>
              <button onClick={() => setShowPurgeModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const cleanInput = purgeInputPassword.trim();
                if (cleanInput === 'Nifty@101088' || cleanInput === 'Nifty@101088-') {
                  clearAllData();
                  setShowPurgeModal(false);
                  alert('✅ Password Verified! Database has been completely purged.');
                } else {
                  setPurgeError('❌ Invalid Security Password. Access Denied.');
                }
              }}
              className="space-y-3 text-xs"
            >
              <p className="text-slate-600 font-medium">
                Enter super-admin security password to authorize database purge:
              </p>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Security Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter password..."
                  value={purgeInputPassword}
                  onChange={(e) => {
                    setPurgeInputPassword(e.target.value);
                    setPurgeError('');
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                />
              </div>

              {purgeError && (
                <p className="text-rose-600 font-bold bg-rose-50 p-2 rounded-lg border border-rose-200">{purgeError}</p>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPurgeModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-md"
                >
                  Authorize & Purge DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export function App() {
  const [session, setSession] = useState<AuthSession | null>(() => getSession());

  const handleLogin = useCallback((s: AuthSession) => setSession(s), []);
  const handleLogout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  if (!session) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <AppProvider>
      <MainLayout session={session} onLogout={handleLogout} />
    </AppProvider>
  );
}

export default App;
