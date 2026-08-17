import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BusinessDocument, DocumentItem, DocumentType, Lead, Currency, PaymentMethod, PaymentType } from '../../types';
import { CompanyHeader } from '../CompanyHeader';
import { DigitalSignature } from '../DigitalSignature';
import { AichainzLogoWatermark } from '../AichainzLogoWatermark';
import {
  FileText,
  Plus,
  Printer,
  Trash2,
  Edit,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Send,
  Share2,
  MessageSquare,
  Mail,
  Download,
  Eye,
  Globe,
  Building,
  DollarSign,
  PlusCircle,
  AlertTriangle,
  Receipt,
  Ban,
  CreditCard,
  CheckCircle,
  Clock,
  Sparkles,
  Search,
  ChevronRight,
  ArrowDownRight
} from 'lucide-react';

interface Props {
  initialLeadToQuote?: Lead | null;
  onClearLeadToQuote?: () => void;
}

export const DocumentStudio: React.FC<Props> = ({ initialLeadToQuote, onClearLeadToQuote }) => {
  const {
    documents,
    addDocument,
    updateDocument,
    updateDocumentStatus,
    deleteDocument,
    addPayment,
    convertQuotationToInvoice,
    writeOffReceivable,
    getInvoicePayments,
    getInvoiceTotalPaid,
    getInvoiceBalance,
    bankAccounts,
    addBankAccount,
    leads,
    formatCurrency,
    serviceCategories,
    addServiceCategory
  } = useApp();

  const [activeTab, setActiveTab] = useState<'INVOICES' | 'QUOTATIONS' | 'DUE' | 'ALL'>('INVOICES');
  const [selectedDoc, setSelectedDoc] = useState<BusinessDocument | null>(documents[0] || null);
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);

  // Payment Receipt Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPresetType, setPaymentPresetType] = useState<'ADVANCE' | 'PARTIAL' | 'FINAL'>('FINAL');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payDate, setPayDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Bank Transfer');
  const [payAccountId, setPayAccountId] = useState<string>('');
  const [payRef, setPayRef] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');

  // Write-Off Modal State
  const [showWriteOffModal, setShowWriteOffModal] = useState(false);
  const [woReason, setWoReason] = useState<'Client Default' | 'Dispute' | 'Insolvency' | 'Uncollectible' | 'Other'>('Client Default');
  const [woNotes, setWoNotes] = useState<string>('');
  const [woConfirmed, setWoConfirmed] = useState<boolean>(false);

  // Convert Quotation to Invoice Modal State
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertPaymentOption, setConvertPaymentOption] = useState<'FULL' | 'ADVANCE_50' | 'ADVANCE_30' | 'CUSTOM' | 'PAY_LATER'>('ADVANCE_50');
  const [convertCustomAmount, setConvertCustomAmount] = useState<number>(0);
  const [convertPaymentMethod, setConvertPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [convertAccountId, setConvertAccountId] = useState<string>('');
  const [convertRefNo, setConvertRefNo] = useState<string>('');
  const [convertNotes, setConvertNotes] = useState<string>('');

  // Search Filter
  const [searchTerm, setSearchTerm] = useState('');

  // Builder State
  const [docType, setDocType] = useState<DocumentType>('QUOTATION');
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientGST, setClientGST] = useState('');
  const [officeLocation, setOfficeLocation] = useState<'India' | 'UAE' | 'Rwanda'>('India');
  const [issueDate, setIssueDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  
  const [hasGST, setHasGST] = useState<boolean>(true);
  const [discount, setDiscount] = useState(0);
  const [currency, setCurrency] = useState<Currency>('INR');
  const [advancePercentage, setAdvancePercentage] = useState(50);
  const [agreementRequired, setAgreementRequired] = useState(true);
  
  const [notes, setNotes] = useState('Thank you for partnering with Aichainz.');
  const [terms, setTerms] = useState('Payment terms: Net 15 days from invoice date.');

  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [targetItemIndexForNewCat, setTargetItemIndexForNewCat] = useState<number | null>(null);

  const handleAddServiceCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatName.trim()) return;
    const catName = newCatName.trim();
    addServiceCategory(catName);
    if (targetItemIndexForNewCat !== null && targetItemIndexForNewCat >= 0) {
      const updated = [...items];
      if (updated[targetItemIndexForNewCat]) {
        updated[targetItemIndexForNewCat].serviceCategory = catName;
        setItems(updated);
      }
    }
    setNewCatName('');
    setTargetItemIndexForNewCat(null);
    setShowAddCatModal(false);
  };

  // Bank Account Creation Modal State
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newAccNo, setNewAccNo] = useState('');
  const [newIFSC, setNewIFSC] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [newBal, setNewBal] = useState<number>(0);

  const handleCreateBankAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName || !newAccNo) return;
    addBankAccount({
      accountName: `${newBankName} (${newBranch || 'Main Branch'})`,
      accountNumber: newAccNo,
      bankName: newBankName,
      ifscCode: newIFSC || 'UTIB0001234',
      branchLocation: newBranch || 'Main Branch',
      balanceINR: Number(newBal) || 0,
      currency: 'INR',
      isPrimary: bankAccounts.length === 0
    });
    setNewBankName('');
    setNewAccNo('');
    setNewIFSC('');
    setNewBranch('');
    setNewBal(0);
    setShowAddBankModal(false);
  };

  const [items, setItems] = useState<DocumentItem[]>([
    { id: '1', serviceCategory: 'Web Application', description: 'Enterprise Web Application Platform', quantity: 1, unitPrice: 250000, amount: 250000 }
  ]);

  useEffect(() => {
    if (initialLeadToQuote) {
      setEditingDocId(null);
      setDocType('QUOTATION');
      setClientName(initialLeadToQuote.clientName);
      setClientCompany(initialLeadToQuote.companyName);
      setClientEmail(initialLeadToQuote.email);
      setClientPhone(initialLeadToQuote.phone);
      setOfficeLocation(initialLeadToQuote.office);
      setIssueDate(new Date().toISOString().split('T')[0]);
      setItems([
        {
          id: '1',
          serviceCategory: 'Web Application',
          description: initialLeadToQuote.projectDescription || 'Custom Software Engineering Services',
          quantity: 1,
          unitPrice: initialLeadToQuote.value,
          amount: initialLeadToQuote.value
        }
      ]);
      setShowBuilderModal(true);
      if (onClearLeadToQuote) onClearLeadToQuote();
    }
  }, [initialLeadToQuote]);

  useEffect(() => {
    if (selectedDoc) {
      const updated = documents.find(d => d.id === selectedDoc.id);
      if (updated) setSelectedDoc(updated);
    } else if (documents.length > 0) {
      setSelectedDoc(documents[0]);
    }
  }, [documents]);

  const handleOpenEdit = (doc: BusinessDocument) => {
    setEditingDocId(doc.id);
    setDocType(doc.docType);
    setClientName(doc.clientName);
    setClientCompany(doc.clientCompany);
    setClientEmail(doc.clientEmail);
    setClientPhone(doc.clientPhone);
    setClientAddress(doc.clientAddress);
    setClientGST(doc.clientGST || '');
    setOfficeLocation(doc.officeLocation);
    setIssueDate(doc.issueDate || new Date().toISOString().split('T')[0]);
    setDueDate(doc.dueDate || new Date().toISOString().split('T')[0]);
    setHasGST(doc.hasGST);
    setDiscount(doc.discount);
    setCurrency(doc.currency);
    setAdvancePercentage(doc.advancePercentage || 50);
    setAgreementRequired(doc.agreementRequired ?? true);
    setNotes(doc.notes);
    setTerms(doc.terms);
    setItems(doc.items);
    setShowBuilderModal(true);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), serviceCategory: serviceCategories[0] || 'Web Application', description: '', quantity: 1, unitPrice: 50000, amount: 50000 }
    ]);
  };

  const handleItemChange = (index: number, field: keyof DocumentItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      item.amount = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    }
    newItems[index] = item;
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreateNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (trimmed) {
      addServiceCategory(trimmed);
      if (targetItemIndexForNewCat !== null && targetItemIndexForNewCat < items.length) {
        handleItemChange(targetItemIndexForNewCat, 'serviceCategory', trimmed);
      }
      setNewCatName('');
      setTargetItemIndexForNewCat(null);
      setShowAddCatModal(false);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const taxRate = hasGST ? 18 : 0;
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount - discount;

  const handleOpenConvertModal = (doc: BusinessDocument) => {
    setConvertPaymentOption('ADVANCE_50');
    setConvertCustomAmount(Math.round(doc.total * 0.50));
    setConvertPaymentMethod('Bank Transfer');
    setConvertAccountId(bankAccounts[0]?.id || '');
    setConvertRefNo(`TXN-${Math.floor(Math.random() * 89999 + 10000)}`);
    setConvertNotes('Initial payment upon converting quotation to invoice.');
    setShowConvertModal(true);
  };

  const handleConvertQuotationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || selectedDoc.docType !== 'QUOTATION') return;

    let payAmt = 0;
    if (convertPaymentOption === 'FULL') {
      payAmt = selectedDoc.total;
    } else if (convertPaymentOption === 'ADVANCE_50') {
      payAmt = Math.round(selectedDoc.total * 0.50);
    } else if (convertPaymentOption === 'ADVANCE_30') {
      payAmt = Math.round(selectedDoc.total * 0.30);
    } else if (convertPaymentOption === 'CUSTOM') {
      payAmt = Math.max(0, Number(convertCustomAmount) || 0);
    } else {
      payAmt = 0;
    }

    const newInvoice = convertQuotationToInvoice(selectedDoc.id);
    if (!newInvoice) return;

    if (payAmt > 0) {
      addPayment({
        invoiceId: newInvoice.id,
        invoiceNo: newInvoice.docNumber,
        clientName: newInvoice.clientName,
        clientCompany: newInvoice.clientCompany,
        date: new Date().toISOString().split('T')[0],
        amount: payAmt,
        currency: newInvoice.currency,
        paymentMethod: convertPaymentMethod,
        bankAccountId: convertAccountId,
        referenceNo: convertRefNo,
        notes: convertNotes,
        type: payAmt >= newInvoice.total ? 'FINAL' : 'ADVANCE'
      });
    }

    setShowConvertModal(false);
    setSelectedDoc(newInvoice);
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    
    const docNumber = editingDocId && selectedDoc?.id === editingDocId 
      ? selectedDoc.docNumber 
      : (docType === 'QUOTATION' ? `QTN-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}` : `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`);

    const initialStatus = editingDocId && selectedDoc?.id === editingDocId
      ? selectedDoc.status
      : (docType === 'QUOTATION' ? 'SENT' : 'UNPAID');

    const newDocData: Omit<BusinessDocument, 'id'> = {
      docType,
      docNumber,
      clientName,
      clientCompany,
      clientEmail,
      clientPhone,
      clientAddress,
      clientGST,
      officeLocation,
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items,
      subtotal,
      hasGST,
      taxRate,
      taxAmount,
      discount,
      total,
      currency,
      status: initialStatus,
      notes,
      terms,
      advancePercentage,
      agreementRequired
    };

    if (editingDocId) {
      updateDocument(editingDocId, newDocData);
    } else {
      addDocument(newDocData);
    }

    setEditingDocId(null);
    setShowBuilderModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = (doc: BusinessDocument) => {
    const text = encodeURIComponent(
      `Hello ${doc.clientName} (${doc.clientCompany}),

` +
      `Here is your ${doc.docType} *${doc.docNumber}* from *Aichainz*.
` +
      `Total Amount: *${formatCurrency(doc.total)}*
` +
      `Office: ${doc.officeLocation}

` +
      `Please contact us at +91 7502774016 or Purusoth@aichainz.com for approval.`
    );
    const cleanPhone = doc.clientPhone.replace(/[^0-9]/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handleEmailShare = (doc: BusinessDocument) => {
    const subject = encodeURIComponent(`${doc.docType} ${doc.docNumber} from Aichainz - ${doc.clientCompany}`);
    const body = encodeURIComponent(
      `Dear ${doc.clientName},

` +
      `Please find attached details for your ${doc.docType} (${doc.docNumber}).

` +
      `Total Amount: ${formatCurrency(doc.total)}
` +
      `Issue Date: ${doc.issueDate}

` +
      `Best regards,
` +
      `Purusothaman K
Founder & CEO | Aichainz
+91 7502774016`
    );
    window.location.href = `mailto:${doc.clientEmail}?subject=${subject}&body=${body}`;
  };

  // Dedicated Payment Handler with Preset Amounts
  const handleOpenPaymentModalWithPreset = (doc: BusinessDocument, typePreset: 'ADVANCE' | 'PARTIAL' | 'FINAL') => {
    const bal = getInvoiceBalance(doc.id);
    const paid = getInvoiceTotalPaid(doc.id);
    setPaymentPresetType(typePreset);

    if (typePreset === 'FINAL') {
      setPayAmount(bal > 0 ? bal : doc.total);
    } else if (typePreset === 'ADVANCE') {
      setPayAmount(Math.round(doc.total * 0.50));
    } else {
      setPayAmount(Math.round(bal > 0 ? bal * 0.50 : doc.total * 0.50));
    }

    setPayDate(new Date().toISOString().split('T')[0]);
    setPayMethod('Bank Transfer');
    setPayAccountId(bankAccounts[0]?.id || '');
    setPayRef(`TXN-${Math.floor(Math.random() * 89999 + 10000)}`);
    setPayNotes('');
    setShowPaymentModal(true);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || payAmount <= 0) return;

    const existingPaid = getInvoiceTotalPaid(selectedDoc.id);
    const newPaidTotal = existingPaid + payAmount;
    
    let pType: PaymentType = paymentPresetType;
    if (newPaidTotal >= selectedDoc.total) pType = 'FINAL';
    else if (existingPaid === 0 && payAmount < selectedDoc.total) pType = 'ADVANCE';
    else pType = 'PARTIAL';

    addPayment({
      invoiceId: selectedDoc.id,
      invoiceNo: selectedDoc.docNumber,
      clientName: selectedDoc.clientName,
      clientCompany: selectedDoc.clientCompany,
      date: payDate,
      amount: payAmount,
      currency: selectedDoc.currency,
      paymentMethod: payMethod,
      bankAccountId: payAccountId,
      referenceNo: payRef,
      notes: payNotes,
      type: pType
    });

    setShowPaymentModal(false);
  };

  const handleWriteOffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !woConfirmed) return;

    const bal = getInvoiceBalance(selectedDoc.id);
    writeOffReceivable({
      invoiceId: selectedDoc.id,
      invoiceNo: selectedDoc.docNumber,
      clientName: selectedDoc.clientName,
      clientCompany: selectedDoc.clientCompany,
      date: new Date().toISOString().split('T')[0],
      amount: bal > 0 ? bal : selectedDoc.total,
      currency: selectedDoc.currency,
      reason: woReason,
      notes: woNotes,
      performedBy: 'Purusothaman K (Admin)'
    });

    setShowWriteOffModal(false);
    setWoConfirmed(false);
  };

  const filteredDocs = documents.slice().reverse().filter(d => {
    if (activeTab === 'INVOICES' && d.docType !== 'INVOICE') return false;
    if (activeTab === 'QUOTATIONS' && d.docType !== 'QUOTATION') return false;
    if (activeTab === 'DUE' && getInvoiceBalance(d.id) <= 0) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        d.docNumber.toLowerCase().includes(term) ||
        d.clientCompany.toLowerCase().includes(term) ||
        d.clientName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Module Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" /> Quotation & Invoice Billing Studio
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Quotations ➔ Invoices ➔ Payment Receipts (Advance / Partial / Full) ➔ Bad Debt Write-Offs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingDocId(null);
              setDocType('QUOTATION');
              setShowBuilderModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-extrabold rounded-xl border border-purple-200 transition"
          >
            <Plus className="w-4 h-4 text-purple-600" /> New Quotation
          </button>
          <button
            onClick={() => {
              setEditingDocId(null);
              setDocType('INVOICE');
              setShowBuilderModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" /> Create Invoice
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Document Catalog */}
        <div className="lg:col-span-4 space-y-4 no-print sticky top-4 self-start">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
            <button
              onClick={() => setActiveTab('INVOICES')}
              className={`flex-1 py-1.5 rounded-lg transition ${activeTab === 'INVOICES' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Invoices ({documents.filter(d => d.docType === 'INVOICE').length})
            </button>
            <button
              onClick={() => setActiveTab('QUOTATIONS')}
              className={`flex-1 py-1.5 rounded-lg transition ${activeTab === 'QUOTATIONS' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Quotes ({documents.filter(d => d.docType === 'QUOTATION').length})
            </button>
            <button
              onClick={() => setActiveTab('DUE')}
              className={`flex-1 py-1.5 rounded-lg transition ${activeTab === 'DUE' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Pending / Due ({documents.filter(d => getInvoiceBalance(d.id) > 0).length})
            </button>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex-1 py-1.5 rounded-lg transition ${activeTab === 'ALL' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All ({documents.length})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by invoice, company, client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-400"
            />
          </div>

          <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {filteredDocs.map(doc => {
              const isSelected = selectedDoc?.id === doc.id;
              const docPaid = getInvoiceTotalPaid(doc.id);
              const docBal = getInvoiceBalance(doc.id);

              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${
                    isSelected
                      ? doc.docType === 'QUOTATION' ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20' : 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className={`font-mono text-xs font-extrabold ${doc.docType === 'QUOTATION' ? 'text-purple-700' : 'text-blue-700'}`}>
                      {doc.docNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      doc.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                      doc.status === 'PARTIALLY_PAID' ? 'bg-blue-100 text-blue-800' :
                      doc.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' :
                      doc.status === 'UNCOLLECTIBLE' || doc.status === 'UNRECOVERABLE' ? 'bg-purple-100 text-purple-800' :
                      doc.status === 'ACCEPTED' ? 'bg-teal-100 text-teal-800' :
                      doc.status === 'CONVERTED' ? 'bg-indigo-100 text-indigo-800' :
                      doc.status === 'SENT' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {doc.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 truncate">{doc.clientCompany || doc.clientName}</h4>
                  <p className="text-xs text-slate-500 font-medium truncate">{doc.clientName}</p>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-medium">{doc.issueDate}</span>
                    <div className="text-right font-mono">
                      <span className="font-extrabold text-slate-900 block">{formatCurrency(doc.total)}</span>
                      {doc.docType === 'INVOICE' && doc.status !== 'PAID' && docBal > 0 && (
                        <span className="text-[10px] text-rose-600 font-bold">Due: {formatCurrency(docBal)}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Main Column: Pristine Workspace */}
        <div className="lg:col-span-8 space-y-4">
          {selectedDoc ? (
            <>
              {/* DOCUMENT ACTION TOOLBAR */}
              <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-md no-print">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold">Status:</span>
                  <select
                    value={selectedDoc.status}
                    onChange={(e) => updateDocumentStatus(selectedDoc.id, e.target.value as any)}
                    className="bg-slate-50 text-slate-900 text-xs border border-slate-300 rounded-lg px-2.5 py-1 font-bold focus:outline-none"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="SENT">SENT</option>
                    <option value="ACCEPTED">ACCEPTED (Quotation)</option>
                    <option value="REJECTED">REJECTED (Quotation)</option>
                    <option value="UNPAID">UNPAID</option>
                    <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
                    <option value="PAID">PAID (Fully Settled)</option>
                    <option value="OVERDUE">OVERDUE</option>
                    <option value="UNCOLLECTIBLE">UNCOLLECTIBLE (Bad Debt Write-Off)</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(selectedDoc)}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-200 flex items-center gap-1 shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>

                  <button
                    onClick={() => handleWhatsAppShare(selectedDoc)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-1 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                  </button>

                  <button
                    onClick={() => handleEmailShare(selectedDoc)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold rounded-lg border border-indigo-200 flex items-center gap-1 shadow-sm"
                  >
                    <Mail className="w-3.5 h-3.5 text-indigo-600" /> Email
                  </button>

                  {selectedDoc.docType === 'QUOTATION' && selectedDoc.status !== 'CONVERTED' && (
                    <button
                      onClick={() => handleOpenConvertModal(selectedDoc)}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold rounded-lg flex items-center gap-1.5 shadow-md shadow-purple-600/20"
                    >
                      <ArrowRight className="w-4 h-4" /> Convert to Invoice (INV)
                    </button>
                  )}

                  <button
                    onClick={handlePrint}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-lg flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                  >
                    <Printer className="w-4 h-4" /> Print / PDF
                  </button>

                  <button
                    onClick={() => deleteDocument(selectedDoc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* DEDICATED INVOICE PAYMENT & RECEIVABLE CONTROL STATION */}
              {selectedDoc.docType === 'INVOICE' && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 no-print">
                  {/* Financial Status Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-emerald-600" /> Payment & Collection Control Center
                      </h4>
                      <p className="text-xs text-slate-500">Invoice #{selectedDoc.docNumber} • Billed to {selectedDoc.clientCompany}</p>
                    </div>

                    <span className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
                      selectedDoc.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                      selectedDoc.status === 'PARTIALLY_PAID' ? 'bg-blue-100 text-blue-800' :
                      selectedDoc.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' :
                      selectedDoc.status === 'UNCOLLECTIBLE' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedDoc.status === 'PAID' ? '✓ 100% FULLY SETTLED' : selectedDoc.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* 3 Metric Cards */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-extrabold uppercase">Invoice Total</p>
                      <p className="text-lg font-black text-slate-900 font-mono">{formatCurrency(selectedDoc.total)}</p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                      <p className="text-[10px] text-emerald-700 font-extrabold uppercase">Total Paid To Date</p>
                      <p className="text-lg font-black text-emerald-800 font-mono">{formatCurrency(getInvoiceTotalPaid(selectedDoc.id))}</p>
                    </div>
                    <div className={`p-3 rounded-xl border ${getInvoiceBalance(selectedDoc.id) > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                      <p className={`text-[10px] font-extrabold uppercase ${getInvoiceBalance(selectedDoc.id) > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>Remaining Balance Due</p>
                      <p className={`text-lg font-black font-mono ${getInvoiceBalance(selectedDoc.id) > 0 ? 'text-rose-800' : 'text-emerald-800'}`}>
                        {formatCurrency(getInvoiceBalance(selectedDoc.id))}
                      </p>
                    </div>
                  </div>

                  {/* PROMINENT PAYMENT ACTION BUTTONS */}
                  {selectedDoc.status !== 'PAID' && selectedDoc.status !== 'UNCOLLECTIBLE' && (
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <p className="text-xs font-black text-slate-800 uppercase tracking-wide">Record Payment / Settlement Action:</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        {/* Option 1: Full Remaining Balance Pay */}
                        <button
                          onClick={() => handleOpenPaymentModalWithPreset(selectedDoc, 'FINAL')}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Settle Balance ({formatCurrency(getInvoiceBalance(selectedDoc.id))})
                        </button>

                        {/* Option 2: 50% Advance Pay */}
                        <button
                          onClick={() => handleOpenPaymentModalWithPreset(selectedDoc, 'ADVANCE')}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition"
                        >
                          <CreditCard className="w-4 h-4" /> Record Advance (50%)
                        </button>

                        {/* Option 3: Custom Partial Payment */}
                        <button
                          onClick={() => handleOpenPaymentModalWithPreset(selectedDoc, 'PARTIAL')}
                          className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition"
                        >
                          <Plus className="w-4 h-4" /> Custom Partial Pay
                        </button>

                        {/* Option 4: Write-Off */}
                        <button
                          onClick={() => {
                            setWoNotes('');
                            setWoConfirmed(false);
                            setShowWriteOffModal(true);
                          }}
                          className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <Ban className="w-4 h-4 text-purple-700" /> Write-Off Bad Debt
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Payment Receipts History */}
                  {getInvoicePayments(selectedDoc.id).length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <p className="text-xs font-extrabold text-slate-700">Payment Receipts History ({getInvoicePayments(selectedDoc.id).length}):</p>
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 font-extrabold text-[10px] uppercase border-b border-slate-200">
                            <tr>
                              <th className="p-2">Receipt No</th>
                              <th className="p-2">Date</th>
                              <th className="p-2">Type</th>
                              <th className="p-2">Method</th>
                              <th className="p-2">Ref No</th>
                              <th className="p-2 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono">
                            {getInvoicePayments(selectedDoc.id).map(p => (
                              <tr key={p.id} className="hover:bg-slate-50">
                                <td className="p-2 font-bold text-blue-700">{p.id}</td>
                                <td className="p-2 text-slate-600">{p.date}</td>
                                <td className="p-2">
                                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                                    {p.type}
                                  </span>
                                </td>
                                <td className="p-2 font-sans font-medium text-slate-800">{p.paymentMethod}</td>
                                <td className="p-2 text-slate-500">{p.referenceNo || '-'}</td>
                                <td className="p-2 text-right font-black text-emerald-700">{formatCurrency(p.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* QUOTATION WORKFLOW STATION */}
              {selectedDoc.docType === 'QUOTATION' && (
                <div className="bg-purple-50/80 p-4 rounded-2xl border border-purple-200 shadow-sm space-y-3 no-print">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-purple-950 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" /> Quotation Lifecycle & Client Confirmation Station
                      </h4>
                      <p className="text-xs text-purple-700">Quotation #{selectedDoc.docNumber} • Prepared for {selectedDoc.clientCompany}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedDoc.status !== 'ACCEPTED' && selectedDoc.status !== 'CONVERTED' && (
                        <button
                          onClick={() => updateDocumentStatus(selectedDoc.id, 'ACCEPTED')}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" /> ✓ Client Confirmed / Accepted
                        </button>
                      )}

                      {selectedDoc.status === 'ACCEPTED' && (
                        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-900 font-extrabold text-xs rounded-xl border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ✓ CLIENT CONFIRMED - READY FOR INVOICE
                        </span>
                      )}

                      {selectedDoc.status !== 'CONVERTED' ? (
                        <button
                          onClick={() => handleOpenConvertModal(selectedDoc)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-md shadow-purple-600/20"
                        >
                          <ArrowRight className="w-4 h-4" /> Convert to Invoice & Collect Payment
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 bg-indigo-100 text-indigo-800 font-extrabold text-xs rounded-xl border border-indigo-300">
                          ✓ CONVERTED TO INVOICE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* World-Class Corporate A4 Paper Sheet */}
              <div className="document-paper rounded-2xl printable-area">
                <div className="watermark-bg">
                  <AichainzLogoWatermark size={260} />
                </div>

                <div className="relative z-10 flex flex-col justify-between h-full space-y-2">
                  {/* Company Header Branding */}
                  <CompanyHeader documentTitle={selectedDoc.docType === 'QUOTATION' ? 'OFFICIAL QUOTATION' : 'TAX INVOICE'} subtitle={'Document No: ' + selectedDoc.docNumber} />

                  {/* Document Title & Client Details Header */}
                  <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                    <div>
                      <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">BILLED / ISSUED TO:</h3>
                      <h4 className="text-base font-black text-slate-900 mt-0.5">{selectedDoc.clientCompany}</h4>
                      <p className="text-xs font-extrabold text-slate-700">{selectedDoc.clientName}</p>
                      <p className="text-xs text-slate-500">{selectedDoc.clientPhone} • {selectedDoc.clientEmail}</p>
                      {selectedDoc.clientGST && (
                        <p className="text-[11px] font-mono font-bold text-slate-700 mt-0.5">GSTIN: {selectedDoc.clientGST}</p>
                      )}
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-xl font-black text-slate-900 font-mono tracking-tight block">
                        {selectedDoc.docNumber}
                      </span>
                      <p className="text-xs font-bold text-slate-600">Date: {selectedDoc.issueDate}</p>
                      <p className="text-xs font-bold text-rose-700">Due: {selectedDoc.dueDate}</p>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="overflow-x-auto py-2">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-black text-[10.5px] uppercase border-y border-slate-200">
                        <tr>
                          <th className="p-2.5">Category & Description</th>
                          <th className="p-2.5 text-center">Qty</th>
                          <th className="p-2.5 text-right">Unit Price</th>
                          <th className="p-2.5 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {selectedDoc.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-2.5">
                              <p className="font-bold text-slate-900">{item.description}</p>
                              <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                                {item.serviceCategory}
                              </span>
                            </td>
                            <td className="p-2.5 text-center font-mono">{item.quantity}</td>
                            <td className="p-2.5 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                            <td className="p-2.5 text-right font-mono font-bold text-slate-900">{formatCurrency(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Calculations & Payment Status Breakdown */}
                  <div className="flex justify-between items-end pt-3 border-t border-slate-200 gap-4">
                    {/* Payment Status Official Stamp & Mini Receipt Summary */}
                    <div className="space-y-2 flex-1">
                      {selectedDoc.docType === 'INVOICE' && (
                        <div className="space-y-1.5">
                          {/* Corporate Payment Status Stamp */}
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${
                              getInvoiceBalance(selectedDoc.id) === 0 ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                              getInvoiceTotalPaid(selectedDoc.id) > 0 ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}>
                              {getInvoiceBalance(selectedDoc.id) === 0 ? '✓ FULLY SETTLED & PAID IN FULL' :
                               getInvoiceTotalPaid(selectedDoc.id) > 0 ? `PARTIALLY PAID • BALANCE DUE: ${formatCurrency(getInvoiceBalance(selectedDoc.id))}` :
                               `PAYMENT DUE: ${formatCurrency(selectedDoc.total)}`}
                            </span>
                          </div>

                          {/* Payment Receipt Audit Log on Paper Sheet */}
                          {getInvoicePayments(selectedDoc.id).length > 0 && (
                            <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200 space-y-1 text-[10.5px]">
                              <span className="font-extrabold text-slate-700 uppercase tracking-tight block">Payment Receipts Logged:</span>
                              {getInvoicePayments(selectedDoc.id).map(p => (
                                <div key={p.id} className="flex justify-between font-mono text-slate-600">
                                  <span>{p.date} • {p.type} ({p.paymentMethod} {p.referenceNo ? `#${p.referenceNo}` : ''})</span>
                                  <span className="font-bold text-emerald-700">+{formatCurrency(p.amount)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Financial Summary Numbers */}
                    <div className="w-72 space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal:</span>
                        <span className="font-bold text-slate-900">{formatCurrency(selectedDoc.subtotal)}</span>
                      </div>

                      {selectedDoc.hasGST && (
                        <div className="flex justify-between text-slate-600">
                          <span>GST ({selectedDoc.taxRate}%):</span>
                          <span className="font-bold text-purple-700">+{formatCurrency(selectedDoc.taxAmount)}</span>
                        </div>
                      )}

                      {selectedDoc.discount > 0 && (
                        <div className="flex justify-between text-rose-700 font-bold">
                          <span>Discount:</span>
                          <span>-{formatCurrency(selectedDoc.discount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-xs font-bold text-slate-900 pt-1.5 border-t border-slate-200 font-sans">
                        <span>GRAND TOTAL BILLED:</span>
                        <span className="font-mono text-blue-700">{formatCurrency(selectedDoc.total)}</span>
                      </div>

                      {/* Advance / Payments Received Row on Invoice */}
                      {selectedDoc.docType === 'INVOICE' && getInvoiceTotalPaid(selectedDoc.id) > 0 && (
                        <div className="flex justify-between text-xs font-extrabold text-emerald-700 pt-1 border-t border-dashed border-slate-200">
                          <span>LESS: ADVANCE / PAID:</span>
                          <span className="font-mono">-{formatCurrency(getInvoiceTotalPaid(selectedDoc.id))}</span>
                        </div>
                      )}

                      {/* NET BALANCE DUE ROW ON INVOICE SHEET */}
                      {selectedDoc.docType === 'INVOICE' && (
                        <div className={`flex justify-between text-sm font-black p-2 rounded-xl mt-1.5 font-sans border ${
                          getInvoiceBalance(selectedDoc.id) > 0 ? 'bg-rose-50 text-rose-900 border-rose-300' : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        }`}>
                          <span>NET BALANCE DUE:</span>
                          <span className="font-mono font-black">{formatCurrency(getInvoiceBalance(selectedDoc.id))}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Signature Footer */}
                  <div className="pt-4">
                    <DigitalSignature />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 font-medium">
              Select a quotation or invoice from the catalog to view details.
            </div>
          )}
        </div>
      </div>

      {/* RECORD PAYMENT MODAL WITH CLEAR PRESET BUTTONS */}
      {showPaymentModal && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" /> Record Client Payment Receipt
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
              {/* Payment Purpose Presets */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Payment Type / Purpose:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentPresetType('FINAL');
                      setPayAmount(getInvoiceBalance(selectedDoc.id));
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                      paymentPresetType === 'FINAL' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Full Settlement ({formatCurrency(getInvoiceBalance(selectedDoc.id))})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentPresetType('ADVANCE');
                      setPayAmount(Math.round(selectedDoc.total * 0.50));
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                      paymentPresetType === 'ADVANCE' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    50% Advance ({formatCurrency(Math.round(selectedDoc.total * 0.50))})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentPresetType('PARTIAL');
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                      paymentPresetType === 'PARTIAL' ? 'bg-amber-500 text-white border-amber-500 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Custom Partial Pay
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Received Amount (INR)</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono font-black text-emerald-800 text-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI Payment</option>
                    <option value="Corporate Card">Corporate Credit Card</option>
                    <option value="Crypto (USDT)">Crypto USDT</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-700 font-bold">Receiving Bank Account</label>
                    <button
                      type="button"
                      onClick={() => setShowAddBankModal(true)}
                      className="text-[11px] font-extrabold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5"
                    >
                      + Add Bank
                    </button>
                  </div>
                  <select
                    value={payAccountId}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        setShowAddBankModal(true);
                      } else {
                        setPayAccountId(e.target.value);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} (A/C ...{b.accountNumber.slice(-4)})
                      </option>
                    ))}
                    <option value="__ADD_NEW__" className="font-extrabold text-blue-700 bg-blue-50">
                      + Add New Corporate Bank Account...
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Transaction Ref / UTR No</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UTR1234567890"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Receipt Date</label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md">
                  Generate Receipt & Post to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BAD DEBT WRITE-OFF MODAL */}
      {showWriteOffModal && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Ban className="w-5 h-5 text-purple-600" /> Write Off Uncollectible Bad Debt
              </h3>
              <button onClick={() => setShowWriteOffModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleWriteOffSubmit} className="space-y-3 text-xs">
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200">
                <p className="text-purple-900 font-extrabold">Invoice #{selectedDoc.docNumber}</p>
                <p className="text-purple-700 text-[11px]">Uncollected Balance: {formatCurrency(getInvoiceBalance(selectedDoc.id))}</p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Reason for Write-Off</label>
                <select
                  value={woReason}
                  onChange={(e) => setWoReason(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                >
                  <option value="Client Default">Client Default / Non-Payment</option>
                  <option value="Dispute">Project Dispute Settlement</option>
                  <option value="Insolvency">Client Insolvency / Bankruptcy</option>
                  <option value="Uncollectible">Uncollectible Legal Limit</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Audit Justification Notes</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain collection attempts and decision rationale..."
                  value={woNotes}
                  onChange={(e) => setWoNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="woConfirm"
                  checked={woConfirmed}
                  onChange={(e) => setWoConfirmed(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600"
                />
                <label htmlFor="woConfirm" className="text-slate-700 font-bold text-[11px]">
                  I confirm writing off {formatCurrency(getInvoiceBalance(selectedDoc.id))} to Bad Debt Expense.
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowWriteOffModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button
                  type="submit"
                  disabled={!woConfirmed}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-md"
                >
                  Execute Write-Off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONVERT QUOTATION TO INVOICE & PAYMENT SETTLEMENT MODAL */}
      {showConvertModal && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-purple-600" /> Convert Quotation to Invoice & Payment Settlement
                </h3>
                <p className="text-xs text-slate-500 font-medium">Quotation #{selectedDoc.docNumber} • Billed to {selectedDoc.clientCompany}</p>
              </div>
              <button onClick={() => setShowConvertModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleConvertQuotationSubmit} className="space-y-4 text-xs">
              {/* Total Summary Header Box */}
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 flex justify-between items-center">
                <div>
                  <span className="text-[10.5px] text-purple-700 font-black uppercase block">Quotation Total Amount</span>
                  <span className="text-2xl font-mono font-black text-purple-900">{formatCurrency(selectedDoc.total)}</span>
                </div>
                <span className="px-3 py-1 bg-purple-600 text-white font-extrabold text-xs rounded-lg shadow-sm">
                  {selectedDoc.items.length} Service Line Items
                </span>
              </div>

              {/* Initial Payment Option Radio Cards */}
              <div className="space-y-2">
                <label className="block text-slate-800 font-extrabold uppercase text-[11px]">
                  How much is the client paying right now upon invoice generation?
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* 50% Advance */}
                  <div
                    onClick={() => setConvertPaymentOption('ADVANCE_50')}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      convertPaymentOption === 'ADVANCE_50' ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="font-extrabold text-slate-900 block">50% Advance Payment</span>
                      <span className="text-[10.5px] text-slate-500 font-medium">Standard 50/50 Terms</span>
                    </div>
                    <span className="font-mono font-black text-blue-700 text-sm">{formatCurrency(Math.round(selectedDoc.total * 0.50))}</span>
                  </div>

                  {/* 100% Full Payment */}
                  <div
                    onClick={() => setConvertPaymentOption('FULL')}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      convertPaymentOption === 'FULL' ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="font-extrabold text-slate-900 block">100% Full Payment</span>
                      <span className="text-[10.5px] text-slate-500 font-medium">Fully Settles Invoice</span>
                    </div>
                    <span className="font-mono font-black text-emerald-700 text-sm">{formatCurrency(selectedDoc.total)}</span>
                  </div>

                  {/* 30% Advance */}
                  <div
                    onClick={() => setConvertPaymentOption('ADVANCE_30')}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      convertPaymentOption === 'ADVANCE_30' ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="font-extrabold text-slate-900 block">30% Token Advance</span>
                      <span className="text-[10.5px] text-slate-500 font-medium">Initial Retainer Fee</span>
                    </div>
                    <span className="font-mono font-black text-purple-700 text-sm">{formatCurrency(Math.round(selectedDoc.total * 0.30))}</span>
                  </div>

                  {/* Pay Later (Unpaid) */}
                  <div
                    onClick={() => setConvertPaymentOption('PAY_LATER')}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      convertPaymentOption === 'PAY_LATER' ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="font-extrabold text-slate-900 block">Pay Later (Unpaid Invoice)</span>
                      <span className="text-[10.5px] text-slate-500 font-medium">Full Balance Due Later</span>
                    </div>
                    <span className="font-mono font-bold text-amber-700 text-sm">{formatCurrency(0)}</span>
                  </div>

                  {/* Custom Payment Amount Option */}
                  <div
                    onClick={() => setConvertPaymentOption('CUSTOM')}
                    className={`col-span-1 sm:col-span-2 p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      convertPaymentOption === 'CUSTOM' ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="font-extrabold text-slate-900 block">Custom Initial Amount</span>
                      <span className="text-[10.5px] text-slate-500 font-medium">Specify exact payment received</span>
                    </div>
                    {convertPaymentOption === 'CUSTOM' ? (
                      <input
                        type="number"
                        required
                        value={convertCustomAmount}
                        onChange={(e) => setConvertCustomAmount(Number(e.target.value))}
                        className="w-36 bg-white border border-indigo-300 rounded-lg p-1.5 font-mono font-black text-indigo-900 text-right text-xs"
                      />
                    ) : (
                      <span className="font-mono font-bold text-indigo-700 text-sm">Custom ₹</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Receipt Details (if payment > 0) */}
              {convertPaymentOption !== 'PAY_LATER' && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wide block">Payment Receipt Details:</span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Payment Method</label>
                      <select
                        value={convertPaymentMethod}
                        onChange={(e) => setConvertPaymentMethod(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold"
                      >
                        <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                        <option value="UPI">UPI Payment</option>
                        <option value="Crypto USDT">Crypto USDT Vault Deposit</option>
                        <option value="Credit Card">Corporate Card</option>
                        <option value="Cash">Cash</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Deposit Treasury Account</label>
                      <select
                        value={convertAccountId}
                        onChange={(e) => setConvertAccountId(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold"
                      >
                        {bankAccounts.map(b => (
                          <option key={b.id} value={b.id}>{b.accountName} ({b.bankName} - #{b.accountNumber.slice(-4)})</option>
                        ))}
                        {bankAccounts.length === 0 && <option value="">Corporate Main Bank Account</option>}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Reference / Transaction ID</label>
                      <input
                        type="text"
                        required
                        value={convertRefNo}
                        onChange={(e) => setConvertRefNo(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Payment Notes</label>
                      <input
                        type="text"
                        value={convertNotes}
                        onChange={(e) => setConvertNotes(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Balance Due Live Breakdown */}
              {(() => {
                let payAmt = 0;
                if (convertPaymentOption === 'FULL') payAmt = selectedDoc.total;
                else if (convertPaymentOption === 'ADVANCE_50') payAmt = Math.round(selectedDoc.total * 0.50);
                else if (convertPaymentOption === 'ADVANCE_30') payAmt = Math.round(selectedDoc.total * 0.30);
                else if (convertPaymentOption === 'CUSTOM') payAmt = Number(convertCustomAmount) || 0;

                const remBal = Math.max(0, selectedDoc.total - payAmt);

                return (
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                      <span className="text-[10px] font-black uppercase text-emerald-700 block">Immediate Receipt Amount</span>
                      <span className="text-lg font-mono font-black text-emerald-800">{formatCurrency(payAmt)}</span>
                    </div>
                    <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                      <span className="text-[10px] font-black uppercase text-rose-700 block">Remaining Balance Due</span>
                      <span className="text-lg font-mono font-black text-rose-800">{formatCurrency(remBal)}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowConvertModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl shadow-md shadow-purple-600/20 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Generate Invoice & Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT QUOTATION & INVOICE BUILDER MODAL */}
      {showBuilderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl p-6 space-y-5 shadow-2xl my-6 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  {editingDocId ? `Edit ${docType}` : `Create New ${docType === 'QUOTATION' ? 'Official Quotation' : 'Tax Invoice'}`}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Fill in client billing details, service scope, line items, and taxes.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBuilderModal(false);
                  setEditingDocId(null);
                }}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="space-y-5 text-xs">
              
              {/* Document Type Switcher */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-extrabold text-slate-800 uppercase text-[11px]">Document Type:</span>
                <div className="flex bg-white p-1 rounded-lg border border-slate-300 font-extrabold gap-1">
                  <button
                    type="button"
                    onClick={() => setDocType('QUOTATION')}
                    className={`px-4 py-1.5 rounded-md transition ${docType === 'QUOTATION' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    Quotation (QTN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocType('INVOICE')}
                    className={`px-4 py-1.5 rounded-md transition ${docType === 'INVOICE' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    Tax Invoice (INV)
                  </button>
                </div>
              </div>

              {/* Client & Billing Information */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wider border-b border-slate-100 pb-1">
                  Client & Enterprise Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Company / Organization Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Corporation, Tech Corp..."
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Contact Representative Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe (VP Tech)..."
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="client@company.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">GSTIN / Tax ID</label>
                    <input
                      type="text"
                      placeholder="33AAAAA0000A1Z5"
                      value={clientGST}
                      onChange={(e) => setClientGST(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Branch Office Hub</label>
                    <select
                      value={officeLocation}
                      onChange={(e) => setOfficeLocation(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                    >
                      <option value="India">India Office Hub</option>
                      <option value="UAE">UAE Office Hub</option>
                      <option value="Rwanda">Rwanda Office Hub</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Issue Date</label>
                    <input
                      type="date"
                      required
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Due Date</label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-rose-700"
                    />
                  </div>
                </div>
              </div>

              {/* Service Line Items Register */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                  <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wider">
                    Service Line Items & Deliverables Scope ({items.length})
                  </h4>

                  <button
                    type="button"
                    onClick={() => {
                      setItems([
                        ...items,
                        { id: Date.now().toString(), serviceCategory: 'Web Application', description: '', quantity: 1, unitPrice: 50000, amount: 50000 }
                      ]);
                    }}
                    className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-extrabold flex items-center gap-1 border border-blue-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Add Line Item
                  </button>
                </div>

                <div className="space-y-2.5">
                  {items.map((item, index) => (
                    <div key={item.id || index} className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-12 sm:col-span-3">
                        <div className="flex justify-between items-center mb-0.5">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Service Category</label>
                          <button
                            type="button"
                            onClick={() => {
                              setTargetItemIndexForNewCat(index);
                              setShowAddCatModal(true);
                            }}
                            className="text-[10px] font-extrabold text-blue-600 hover:underline"
                          >
                            + Add
                          </button>
                        </div>
                        <select
                          value={item.serviceCategory}
                          onChange={(e) => {
                            if (e.target.value === '__ADD_NEW__') {
                              setTargetItemIndexForNewCat(index);
                              setShowAddCatModal(true);
                            } else {
                              const updated = [...items];
                              updated[index].serviceCategory = e.target.value;
                              setItems(updated);
                            }
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                        >
                          {serviceCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="__ADD_NEW__" className="font-extrabold text-blue-700 bg-blue-50">
                            + Add New Service Category...
                          </option>
                        </select>
                      </div>

                      <div className="col-span-12 sm:col-span-4">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Description / Deliverable Scope</label>
                        <input
                          type="text"
                          required
                          placeholder="Scope description..."
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...items];
                            updated[index].description = e.target.value;
                            setItems(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
                        />
                      </div>

                      <div className="col-span-4 sm:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase text-center">Qty</label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...items];
                            const qty = Number(e.target.value) || 1;
                            updated[index].quantity = qty;
                            updated[index].amount = qty * updated[index].unitPrice;
                            setItems(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-center font-bold"
                        />
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase text-right">Unit Price (₹)</label>
                        <input
                          type="number"
                          min={0}
                          required
                          value={item.unitPrice}
                          onChange={(e) => {
                            const updated = [...items];
                            const price = Number(e.target.value) || 0;
                            updated[index].unitPrice = price;
                            updated[index].amount = updated[index].quantity * price;
                            setItems(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-right font-bold"
                        />
                      </div>

                      <div className="col-span-3 sm:col-span-1 text-right">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Amount</label>
                        <span className="font-mono font-black text-slate-900 block pt-2 text-xs">
                          {formatCurrency(item.amount || 0)}
                        </span>
                      </div>

                      <div className="col-span-1 text-center pt-3">
                        <button
                          type="button"
                          onClick={() => setItems(items.filter((_, i) => i !== index))}
                          disabled={items.length <= 1}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-1"
                          title="Remove Line Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax & Discount Options Bar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hasGST"
                      checked={hasGST}
                      onChange={(e) => setHasGST(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600"
                    />
                    <label htmlFor="hasGST" className="font-extrabold text-slate-800">Include GST (18%)</label>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="font-bold text-slate-700">Discount Amount (₹):</label>
                  <input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                    className="w-32 bg-white border border-slate-300 rounded-lg p-1.5 font-mono font-bold text-right text-xs"
                  />
                </div>
              </div>

              {/* Live Calculation Summary Banner */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 rounded-xl text-white flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Subtotal: {formatCurrency(subtotal)}</span>
                  {hasGST && <span className="text-[10px] text-purple-300 font-extrabold block">GST (18%): +{formatCurrency(taxAmount)}</span>}
                  {discount > 0 && <span className="text-[10px] text-rose-300 font-extrabold block">Discount: -{formatCurrency(discount)}</span>}
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-300 font-black uppercase block">GRAND TOTAL</span>
                  <span className="text-2xl font-mono font-black text-emerald-400">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBuilderModal(false);
                    setEditingDocId(null);
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 text-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingDocId ? 'Update Document' : `Generate & Save ${docType}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CORPORATE BANK ACCOUNT MODAL */}
      {showAddBankModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" /> Add Corporate Bank Account
              </h3>
              <button onClick={() => setShowAddBankModal(false)} className="text-slate-400 hover:text-slate-700 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateBankAccountSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Bank Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Axis Bank, HDFC Bank, ICICI Bank, SBI..."
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Account Number / Last 4 Digits *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210 or 4321"
                  value={newAccNo}
                  onChange={(e) => setNewAccNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">IFSC Code</label>
                  <input
                    type="text"
                    placeholder="UTIB0001234"
                    value={newIFSC}
                    onChange={(e) => setNewIFSC(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Branch Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Branch, MG Road..."
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Initial Opening Balance (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={newBal}
                  onChange={(e) => setNewBal(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-black text-emerald-800 text-sm"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBankModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md shadow-blue-600/20"
                >
                  Add & Select Bank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SERVICE CATEGORY MODAL */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" /> Add Custom Service Category
              </h3>
              <button onClick={() => setShowAddCatModal(false)} className="text-slate-400 hover:text-slate-700 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleAddServiceCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Service Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Contract Audit, Testnet Tokens, AI Integration..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md shadow-blue-600/20"
                >
                  Save & Select Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
