import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BankAccount, CryptoVaultAccount, CompanyAsset, AssetCategory, AssetStatus } from '../../types';
import {
  Building2,
  Coins,
  Laptop,
  Smartphone,
  Tablet,
  Server,
  Key,
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Lock,
  Percent,
  Layers,
  Sparkles
} from 'lucide-react';

export const TreasuryAssetManager: React.FC = () => {
  const {
    bankAccounts,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    cryptoAccounts,
    addCryptoAccount,
    updateCryptoAccount,
    deleteCryptoAccount,
    companyAssets,
    addCompanyAsset,
    updateCompanyAsset,
    deleteCompanyAsset,
    reserveProvision,
    updateReserveProvision,
    employees,
    formatCurrency
  } = useApp();

  const [activeTab, setActiveTab] = useState<'BANK' | 'CRYPTO' | 'RESERVE' | 'ASSETS'>('BANK');

  // Modals state
  const [showBankModal, setShowBankModal] = useState(false);
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);

  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [editingCryptoId, setEditingCryptoId] = useState<string | null>(null);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);

  // Bank Form State
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branchLocation, setBranchLocation] = useState('Chennai');
  const [balanceINR, setBalanceINR] = useState(1500000);

  // Crypto Form State
  const [vaultName, setVaultName] = useState('');
  const [assetType, setAssetType] = useState<'USDT' | 'USDC' | 'BTC' | 'ETH' | 'SOL'>('USDT');
  const [walletAddress, setWalletAddress] = useState('');
  const [balanceCrypto, setBalanceCrypto] = useState(25000);
  const [usdRateINR, setUsdRateINR] = useState(88.50);
  const [network, setNetwork] = useState('TRC20');

  // Reserve Form State
  const [reservePct, setReservePct] = useState(reserveProvision.reservePercentage);
  const [reserveReason, setReserveReason] = useState(reserveProvision.reserveReason);

  // Asset Form State
  const [assetTag, setAssetTag] = useState('');
  const [assetName, setAssetName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('LAPTOP');
  const [serialNumber, setSerialNumber] = useState('');
  const [assignedToEmployeeName, setAssignedToEmployeeName] = useState('');
  const [officeLocation, setOfficeLocation] = useState<'India' | 'UAE' | 'Rwanda'>('India');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseCostINR, setPurchaseCostINR] = useState(125000);
  const [status, setStatus] = useState<AssetStatus>('ACTIVE_IN_USE');

  // Totals
  const totalBankCash = bankAccounts.reduce((sum, b) => sum + b.balanceINR, 0);
  const totalCryptoValue = cryptoAccounts.reduce((sum, c) => sum + (c.balanceCrypto * c.usdRateINR), 0);
  const totalCombinedTreasury = totalBankCash + totalCryptoValue;

  const reservedFundAmount = Math.round(totalCombinedTreasury * (reserveProvision.reservePercentage / 100));
  const liquidOperatingAmount = totalCombinedTreasury - reservedFundAmount;

  const totalAssetValue = companyAssets.reduce((sum, a) => sum + a.purchaseCostINR, 0);

  // Bank Handlers
  const handleOpenNewBank = () => {
    setEditingBankId(null);
    setAccountName('HDFC Corporate Operating Account');
    setBankName('HDFC Bank');
    setAccountNumber('502000' + Math.floor(100000 + Math.random() * 900000));
    setIfscCode('HDFC0001234');
    setBranchLocation('Chennai');
    setBalanceINR(1500000);
    setShowBankModal(true);
  };

  const handleOpenEditBank = (b: BankAccount) => {
    setEditingBankId(b.id);
    setAccountName(b.accountName);
    setBankName(b.bankName);
    setAccountNumber(b.accountNumber);
    setIfscCode(b.ifscCode);
    setBranchLocation(b.branchLocation);
    setBalanceINR(b.balanceINR);
    setShowBankModal(true);
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBankId) {
      updateBankAccount(editingBankId, {
        accountName,
        bankName,
        accountNumber,
        ifscCode,
        branchLocation,
        balanceINR: Number(balanceINR)
      });
    } else {
      addBankAccount({
        accountName,
        bankName,
        accountNumber,
        ifscCode,
        branchLocation,
        balanceINR: Number(balanceINR),
        currency: 'INR',
        isPrimary: bankAccounts.length === 0
      });
    }
    setShowBankModal(false);
  };

  // Crypto Handlers
  const handleOpenNewCrypto = () => {
    setEditingCryptoId(null);
    setVaultName('Tether Treasury Cold Wallet');
    setAssetType('USDT');
    setWalletAddress('TYx87...99211');
    setBalanceCrypto(25000);
    setUsdRateINR(88.50);
    setNetwork('TRC20');
    setShowCryptoModal(true);
  };

  const handleOpenEditCrypto = (c: CryptoVaultAccount) => {
    setEditingCryptoId(c.id);
    setVaultName(c.vaultName);
    setAssetType(c.assetType);
    setWalletAddress(c.walletAddress);
    setBalanceCrypto(c.balanceCrypto);
    setUsdRateINR(c.usdRateINR);
    setNetwork(c.network);
    setShowCryptoModal(true);
  };

  const handleSaveCrypto = (e: React.FormEvent) => {
    e.preventDefault();
    const totalINRValue = Math.round(Number(balanceCrypto) * Number(usdRateINR));
    if (editingCryptoId) {
      updateCryptoAccount(editingCryptoId, {
        vaultName,
        assetType,
        walletAddress,
        balanceCrypto: Number(balanceCrypto),
        usdRateINR: Number(usdRateINR),
        totalINRValue,
        network
      });
    } else {
      addCryptoAccount({
        vaultName,
        assetType,
        walletAddress,
        balanceCrypto: Number(balanceCrypto),
        usdRateINR: Number(usdRateINR),
        totalINRValue,
        network
      });
    }
    setShowCryptoModal(false);
  };

  // Asset Handlers
  const handleOpenNewAsset = () => {
    setEditingAssetId(null);
    setAssetTag(`AST-${Date.now().toString().slice(-4)}`);
    setAssetName('MacBook Pro M3 Max 16-inch');
    setCategory('LAPTOP');
    setSerialNumber(`SN-M3-${Math.floor(100000 + Math.random() * 900000)}`);
    setAssignedToEmployeeName(employees[0]?.name || 'Purusothaman K');
    setOfficeLocation('India');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setPurchaseCostINR(249900);
    setStatus('ACTIVE_IN_USE');
    setShowAssetModal(true);
  };

  const handleOpenEditAsset = (a: CompanyAsset) => {
    setEditingAssetId(a.id);
    setAssetTag(a.assetTag);
    setAssetName(a.assetName);
    setCategory(a.category);
    setSerialNumber(a.serialNumber);
    setAssignedToEmployeeName(a.assignedToEmployeeName || '');
    setOfficeLocation(a.officeLocation);
    setPurchaseDate(a.purchaseDate);
    setPurchaseCostINR(a.purchaseCostINR);
    setStatus(a.status);
    setShowAssetModal(true);
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAssetId) {
      updateCompanyAsset(editingAssetId, {
        assetTag,
        assetName,
        category,
        serialNumber,
        assignedToEmployeeName,
        officeLocation,
        purchaseDate,
        purchaseCostINR: Number(purchaseCostINR),
        status
      });
    } else {
      addCompanyAsset({
        assetTag,
        assetName,
        category,
        serialNumber,
        assignedToEmployeeName,
        officeLocation,
        purchaseDate,
        purchaseCostINR: Number(purchaseCostINR),
        status
      });
    }
    setShowAssetModal(false);
  };

  const handleSaveReserve = (e: React.FormEvent) => {
    e.preventDefault();
    updateReserveProvision({
      reservePercentage: Number(reservePct),
      reserveReason
    });
    setShowReserveModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" /> Bank Balances, Crypto Treasury & Hardware Assets
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Manage corporate bank balances (INR), crypto holdings (USDT), future reserve provisions %, and laptop/mobile hardware assets.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {(['BANK', 'CRYPTO', 'RESERVE', 'ASSETS'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'BANK' && 'BANK ACCOUNTS (INR)'}
              {tab === 'CRYPTO' && 'CRYPTO TREASURY (USDT)'}
              {tab === 'RESERVE' && `RESERVE PROVISION (${reserveProvision.reservePercentage}%)`}
              {tab === 'ASSETS' && 'HARDWARE ASSETS'}
            </button>
          ))}
        </div>
      </div>

      {/* Top Banner: Treasury Overview & Future Reserve Breakdown */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black">Aichainz Corporate Treasury Vault</h3>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                MULTI-CURRENCY TREASURY
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Liquid Operating Cash + USDT Crypto Vault + {reserveProvision.reservePercentage}% Future Contingency Reserve.
            </p>
          </div>
        </div>

        <div className="flex flex-nowrap items-center gap-3 overflow-x-auto">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] text-slate-300 font-bold uppercase block">TOTAL TREASURY VALUATION</span>
            <span className="text-xl font-black text-emerald-400 font-mono">{formatCurrency(totalCombinedTreasury)}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] text-slate-300 font-bold uppercase block">LIQUID OPERATING CASH</span>
            <span className="text-xl font-black text-blue-300 font-mono">{formatCurrency(liquidOperatingAmount)}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] text-purple-300 font-bold uppercase block">FUTURE RESERVE ({reserveProvision.reservePercentage}%)</span>
            <span className="text-xl font-black text-purple-300 font-mono">{formatCurrency(reservedFundAmount)}</span>
          </div>
        </div>
      </div>

      {/* 1. BANK ACCOUNTS MANAGER (INR) */}
      {activeTab === 'BANK' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" /> Corporate Bank Accounts & Cash Balances (INR)
            </h3>
            <button
              onClick={handleOpenNewBank}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Bank Account
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankAccounts.map(b => (
              <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative group">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold text-slate-900">{b.accountName}</h4>
                      {b.isPrimary && (
                        <span className="px-2 py-0.5 rounded text-[9.5px] font-black bg-blue-100 text-blue-800 uppercase">
                          PRIMARY OPERATING
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-bold">{b.bankName} • {b.branchLocation} Branch</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditBank(b)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100"
                      title="Edit Account & Balance"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteBankAccount(b.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                      title="Delete Bank Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold font-sans">Account No:</span>
                    <span className="font-extrabold text-slate-900">{b.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold font-sans">IFSC Code:</span>
                    <span className="font-bold text-slate-700">{b.ifscCode}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-bold">Liquid Cash Balance:</span>
                  <span className="text-2xl font-black text-emerald-700 font-mono">{formatCurrency(b.balanceINR)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. CRYPTO TREASURY VAULTS (USDT) */}
      {activeTab === 'CRYPTO' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Coins className="w-5 h-5 text-purple-600" /> Crypto Treasury Vaults (USDT / Multi-Chain)
            </h3>
            <button
              onClick={handleOpenNewCrypto}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-purple-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Crypto Vault
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cryptoAccounts.map(c => (
              <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative group">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold text-slate-900">{c.vaultName}</h4>
                      <span className="px-2 py-0.5 rounded text-[9.5px] font-black bg-purple-100 text-purple-800 uppercase">
                        {c.assetType} ({c.network})
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono font-bold truncate max-w-[280px]">{c.walletAddress}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditCrypto(c)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100"
                      title="Edit Crypto Vault"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCryptoAccount(c.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                      title="Delete Crypto Vault"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-purple-700 font-extrabold uppercase block">{c.assetType} Token Holdings</span>
                    <span className="text-xl font-black text-purple-900 font-mono">{c.balanceCrypto.toLocaleString()} {c.assetType}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-bold block">USD/INR Rate</span>
                    <span className="text-xs font-bold text-slate-700 font-mono">₹{c.usdRateINR}/USDT</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-bold">Total Valuation (INR):</span>
                  <span className="text-2xl font-black text-emerald-700 font-mono">{formatCurrency(c.totalINRValue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. FUTURE RESERVE PROVISIONING (%) */}
      {activeTab === 'RESERVE' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-600" /> Future Contingency Reserve Provisioning
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Lock a configurable percentage of corporate cash & crypto balances for future business expansion, R&D, and emergency runway.
              </p>
            </div>

            <button
              onClick={() => setShowReserveModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Edit className="w-4 h-4" /> Configure Reserve %
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs text-slate-500 font-bold uppercase block">Configured Reserve Ratio</span>
              <p className="text-3xl font-black text-purple-700 font-mono">{reserveProvision.reservePercentage}%</p>
              <p className="text-xs text-slate-600 font-medium">{reserveProvision.reserveReason}</p>
            </div>

            <div className="bg-purple-50 p-5 rounded-2xl border border-purple-200 space-y-2">
              <span className="text-xs text-purple-900 font-bold uppercase block">Reserved Contingency Capital</span>
              <p className="text-3xl font-black text-purple-900 font-mono">{formatCurrency(reservedFundAmount)}</p>
              <p className="text-xs text-purple-700 font-medium">Protected in Cold Vault & High-Yield Reserve Account</p>
            </div>

            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 space-y-2">
              <span className="text-xs text-emerald-900 font-bold uppercase block">Available Liquid Runway</span>
              <p className="text-3xl font-black text-emerald-800 font-mono">{formatCurrency(liquidOperatingAmount)}</p>
              <p className="text-xs text-emerald-700 font-medium">100% Unrestricted Operational Working Capital</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. HARDWARE ASSETS INVENTORY */}
      {activeTab === 'ASSETS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Laptop className="w-5 h-5 text-emerald-600" /> Hardware Assets Inventory ({companyAssets.length} Assets)
              </h3>
              <p className="text-xs text-slate-500 font-medium">Laptops, Tablets, Test Mobiles, GPU Server Nodes & Hardware Wallets.</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-extrabold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                Total Asset Value: {formatCurrency(totalAssetValue)}
              </span>
              <button
                onClick={handleOpenNewAsset}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Asset
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-100 text-slate-600 uppercase font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Asset Tag & Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Serial Number</th>
                  <th className="p-3.5">Assigned Staff</th>
                  <th className="p-3.5">Office Hub</th>
                  <th className="p-3.5 font-mono text-right">Purchase Cost</th>
                  <th className="p-3.5">Condition Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {companyAssets.map(ast => (
                  <tr key={ast.id} className="hover:bg-slate-50">
                    <td className="p-3.5">
                      <span className="font-mono text-[10.5px] font-black text-blue-700 px-2 py-0.5 bg-blue-50 rounded border border-blue-200 block w-fit mb-0.5">
                        {ast.assetTag}
                      </span>
                      <p className="font-extrabold text-slate-900 text-sm">{ast.assetName}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-50 text-purple-800 border border-purple-200 uppercase">
                        {ast.category}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-600">{ast.serialNumber}</td>
                    <td className="p-3.5 font-extrabold text-slate-900">{ast.assignedToEmployeeName || 'Unassigned (In Stock)'}</td>
                    <td className="p-3.5 font-bold text-slate-700">{ast.officeLocation} Hub</td>
                    <td className="p-3.5 text-right font-mono font-black text-emerald-700">{formatCurrency(ast.purchaseCostINR)}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        ast.status === 'ACTIVE_IN_USE' ? 'bg-emerald-100 text-emerald-800' :
                        ast.status === 'IN_STOCK' ? 'bg-blue-100 text-blue-800' :
                        ast.status === 'UNDER_REPAIR' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {ast.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditAsset(ast)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100"
                          title="Edit Hardware Asset"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCompanyAsset(ast.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                          title="Delete Hardware Asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bank Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">{editingBankId ? 'Edit Bank Account' : 'Add Corporate Bank Account'}</h3>
              <button onClick={() => setShowBankModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveBank} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Account Title / Name</label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Cash Balance (INR)</label>
                  <input
                    type="number"
                    required
                    value={balanceINR}
                    onChange={(e) => setBalanceINR(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Account Number</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">IFSC Code</label>
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowBankModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-extrabold rounded-xl shadow-md">Save Bank Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Crypto Modal */}
      {showCryptoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">{editingCryptoId ? 'Edit Crypto Vault' : 'Add Crypto Vault'}</h3>
              <button onClick={() => setShowCryptoModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveCrypto} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Vault Name</label>
                <input
                  type="text"
                  required
                  value={vaultName}
                  onChange={(e) => setVaultName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Asset Type</label>
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="USDT">USDT Tether</option>
                    <option value="USDC">USDC Circle</option>
                    <option value="BTC">BTC Bitcoin</option>
                    <option value="ETH">ETH Ethereum</option>
                    <option value="SOL">SOL Solana</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Network</label>
                  <input
                    type="text"
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Crypto Balance</label>
                  <input
                    type="number"
                    required
                    value={balanceCrypto}
                    onChange={(e) => setBalanceCrypto(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">USD to INR Rate (₹)</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    value={usdRateINR}
                    onChange={(e) => setUsdRateINR(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Wallet Address</label>
                <input
                  type="text"
                  required
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowCryptoModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-purple-600 text-white font-extrabold rounded-xl shadow-md">Save Crypto Vault</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reserve Provision Modal */}
      {showReserveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">Configure Reserve Provision %</h3>
              <button onClick={() => setShowReserveModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveReserve} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Reserve Provision Ratio (%)</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="50"
                  value={reservePct}
                  onChange={(e) => setReservePct(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold text-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Reserve Mandate & Reason</label>
                <textarea
                  rows={3}
                  value={reserveReason}
                  onChange={(e) => setReserveReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowReserveModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-purple-600 text-white font-extrabold rounded-xl shadow-md">Update Reserve Ratio</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">{editingAssetId ? 'Edit Hardware Asset' : 'Log New Hardware Asset'}</h3>
              <button onClick={() => setShowAssetModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Asset Name & Spec</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook Pro M3 Max 16-inch"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="LAPTOP">Laptop Computer</option>
                    <option value="TABLET">Tablet / iPad</option>
                    <option value="MOBILE">Testing Smartphone</option>
                    <option value="GPU_SERVER">GPU Server Node</option>
                    <option value="HARDWARE_WALLET">Hardware Cold Wallet</option>
                    <option value="OFFICE_TECH">Office Monitor / Tech</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Serial Number</label>
                  <input
                    type="text"
                    required
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Assigned Employee</label>
                  <select
                    value={assignedToEmployeeName}
                    onChange={(e) => setAssignedToEmployeeName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="">Unassigned (In Stock)</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.name}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Purchase Cost (INR)</label>
                  <input
                    type="number"
                    required
                    value={purchaseCostINR}
                    onChange={(e) => setPurchaseCostINR(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Branch Office</label>
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
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Asset Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="ACTIVE_IN_USE">ACTIVE IN USE</option>
                    <option value="IN_STOCK">IN STOCK</option>
                    <option value="UNDER_REPAIR">UNDER REPAIR</option>
                    <option value="RETIRED">RETIRED</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAssetModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-extrabold rounded-xl shadow-md">Save Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
