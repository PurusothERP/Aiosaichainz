import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchERPDataFromMongo, syncERPDataToMongo } from "../services/mongoService";
import {
  CompanyDetails,
  Lead,
  BusinessDocument,
  CompletedProject,
  Payable,
  Expense,
  LedgerEntry,
  GSTEntry,
  Employee,
  AttendanceRecord,
  PayrollRecord,
  FreelancerTimeLog,
  AMCContract,
  AMCStatus,
  BankAccount,
  CryptoVaultAccount,
  CompanyAsset,
  ReserveProvision,
  EventTravelRecord,
  ProjectPLRecord,
  Currency,
  ClientDocument,
  CompanyEMI,
  SubscriptionItem,
  CEOExpenseRecord,
  CEOIncomeRecord,
  CEOFixedDepositRecord,
  Payment,
  WriteOff,
  ReceivableProvision,
  AgingBracket, DetailedProjectPL, CompanyPLStatement,
  ReceivableSummary
} from "../types";

export const AICHAINZ_COMPANY: CompanyDetails = {
  name: "Aichainz",
  tagline: "Where Future Thinking Meets AI",
  offices: ["India", "UAE", "Rwanda"],
  indiaRegNo: "UDYAM-TN-03-0332279",
  indiaGST: "33AABCA1234F1Z5",
  rwandaRegNo: "REG-2026-298019",
  phoneWhatsApp: "+91 7502774016",
  primaryEmail: "Purusoth@aichainz.com",
  secondaryEmail: "support@aichainz.com",
  websiteUrl: "www.aichainz.com",
  signatoryName: "Purusothaman K",
  signatoryTitle: "Founder & CEO"
};

export const DEFAULT_SERVICE_CATEGORIES = [
  "Web Application",
  "Mobile Application",
  "Tokenization - Crypto",
  "Exchange Development",
  "Wallet Development",
  "Token to Listing Process",
  "Customized Crypto Application",
  "Testnet Tokens"
];

const INITIAL_EMPLOYEES: Employee[] = [];
const INITIAL_BANK_ACCOUNTS: BankAccount[] = [];
const INITIAL_CRYPTO_ACCOUNTS: CryptoVaultAccount[] = [];
const INITIAL_LEADS: Lead[] = [];
const INITIAL_DOCUMENTS: BusinessDocument[] = [];
const INITIAL_PAYMENTS: Payment[] = [];
const INITIAL_PROJECT_PL_RECORDS: ProjectPLRecord[] = [];
const INITIAL_EXPENSES: Expense[] = [];
const INITIAL_LEDGER: LedgerEntry[] = [];
const INITIAL_COMPANY_ASSETS: CompanyAsset[] = [];
const INITIAL_EVENT_RECORDS: EventTravelRecord[] = [];
const INITIAL_COMPLETED_PROJECTS: CompletedProject[] = [];
const INITIAL_AMC_CONTRACTS: AMCContract[] = [];
const INITIAL_PAYABLES: Payable[] = [];
const INITIAL_GST_RECORDS: GSTEntry[] = [];
const INITIAL_PAYROLL: PayrollRecord[] = [];
const INITIAL_CLIENT_DOCUMENTS: ClientDocument[] = [];
const INITIAL_EMIS: CompanyEMI[] = [];
const INITIAL_SUBSCRIPTIONS: SubscriptionItem[] = [];
const INITIAL_WRITEOFFS: WriteOff[] = [];
const INITIAL_RESERVE: ReserveProvision = { reservePercentage: 15, reserveReason: "Future Expansion & Emergency Fund" };

const DEFAULT_EXPENSE_CATEGORIES: string[] = [
  'API & Cloud Infrastructure',
  'Software & Tool Licenses',
  'Sub-contractor / Freelancer',
  'Travel & Field Trips',
  'Accommodation Cost',
  'Marketing & Lead Gen',
  'Office Supplies & Tools',
  'Utilities & Rent',
  'Personnel / Employee Cost',
  'Legal & Statutory Compliance',
  'Other Direct Expense'
];

interface AppContextType {
  company: CompanyDetails;
  serviceCategories: string[];
  addServiceCategory: (categoryName: string) => void;
  expenseCategories: string[];
  addExpenseCategory: (categoryName: string) => void;
  leads: Lead[];
  documents: BusinessDocument[];
  payments: Payment[];
  writeOffs: WriteOff[];
  receivableProvisions: ReceivableProvision[];
  completedProjects: CompletedProject[];
  addCompletedProject: (proj: Omit<CompletedProject, "id">) => void;
  updateCompletedProject: (id: string, updates: Partial<CompletedProject>) => void;
  projectPLRecords: ProjectPLRecord[];
  addProjectPLRecord: (rec: ProjectPLRecord) => void;
  updateProjectPLRecord: (rec: ProjectPLRecord) => void;
  deleteProjectPLRecord: (id: string) => void;
  
  // Payment System & Workflow
  addPayment: (payment: Omit<Payment, "id">) => void;
  convertQuotationToInvoice: (quotationId: string) => BusinessDocument | undefined;
  writeOffReceivable: (writeOff: Omit<WriteOff, "id">) => void;
  provisionReceivable: (provision: Omit<ReceivableProvision, "id">) => void;
  getInvoicePayments: (invoiceId: string) => Payment[];
  getInvoiceTotalPaid: (invoiceId: string) => number;
  getInvoiceBalance: (invoiceId: string) => number;
  getReceivableSummary: () => ReceivableSummary;
  getAgingReport: () => AgingBracket[];
  getProjectPLStatement: (projectId: string) => DetailedProjectPL;
  getCompanyPLStatement: () => CompanyPLStatement;

  // Legacy compatibility
  recordAdvancePayment: (docId: string, amount: number, paymentDate: string, paymentMethod: string, refNo: string, balanceDueDate?: string) => void;
  
  payables: Payable[];
  expenses: Expense[];
  ledger: LedgerEntry[];
  gstRecords: GSTEntry[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  payroll: PayrollRecord[];
  amcContracts: AMCContract[];
  bankAccounts: BankAccount[];
  addBankAccount: (b: Omit<BankAccount, "id">) => void;
  updateBankAccount: (id: string, updates: Partial<BankAccount>) => void;
  deleteBankAccount: (id: string) => void;

  cryptoAccounts: CryptoVaultAccount[];
  addCryptoAccount: (c: Omit<CryptoVaultAccount, "id">) => void;
  updateCryptoAccount: (id: string, updates: Partial<CryptoVaultAccount>) => void;
  deleteCryptoAccount: (id: string) => void;

  companyAssets: CompanyAsset[];
  addCompanyAsset: (a: Omit<CompanyAsset, "id">) => void;
  updateCompanyAsset: (id: string, updates: Partial<CompanyAsset>) => void;
  deleteCompanyAsset: (id: string) => void;

  reserveProvision: ReserveProvision;
  updateReserveProvision: (reserve: ReserveProvision) => void;

  eventRecords: EventTravelRecord[];
  addEventRecord: (evt: Omit<EventTravelRecord, "id">) => void;
  updateEventRecord: (id: string, updates: Partial<EventTravelRecord>) => void;
  deleteEventRecord: (id: string) => void;

  ceoExpenseRecords: CEOExpenseRecord[];
  addCEOExpense: (rec: Omit<CEOExpenseRecord, "id" | "createdAt">) => void;
  updateCEOExpense: (id: string, updates: Partial<CEOExpenseRecord>) => void;
  deleteCEOExpense: (id: string) => void;

  ceoIncomeRecords: CEOIncomeRecord[];
  addCEOIncome: (rec: Omit<CEOIncomeRecord, "id" | "createdAt">) => void;
  updateCEOIncome: (id: string, updates: Partial<CEOIncomeRecord>) => void;
  deleteCEOIncome: (id: string) => void;

  ceoFDRecords: CEOFixedDepositRecord[];
  addCEOFDRecord: (rec: Omit<CEOFixedDepositRecord, "id" | "createdAt">) => void;
  updateCEOFDRecord: (id: string, updates: Partial<CEOFixedDepositRecord>) => void;
  deleteCEOFDRecord: (id: string) => void;

  clientDocuments: ClientDocument[];
  addClientDocument: (doc: Omit<ClientDocument, "id" | "uploadedDate">) => void;
  deleteClientDocument: (id: string) => void;

  companyEMIs: CompanyEMI[];
  addCompanyEMI: (emi: Omit<CompanyEMI, "id" | "paidMonthsCount" | "status">) => void;
  deleteCompanyEMI: (id: string) => void;
  processEMIDeduction: (emiId: string) => void;

  subscriptions: SubscriptionItem[];
  addSubscription: (sub: Omit<SubscriptionItem, "id" | "status">) => void;
  deleteSubscription: (id: string) => void;

  activeCurrency: Currency;
  setActiveCurrency: (c: Currency) => void;
  addLead: (lead: Omit<Lead, "id" | "createdAt"> & { createdAt?: string }) => void;
  updateLeadStage: (id: string, stage: Lead["stage"]) => void;
  deleteLead: (id: string) => void;
  addDocument: (doc: Omit<BusinessDocument, "id">) => void;
  updateDocument: (id: string, updates: Partial<BusinessDocument>) => void;
  updateDocumentStatus: (id: string, status: BusinessDocument["status"]) => void;
  deleteDocument: (id: string) => void;
  addAMCContract: (amc: Omit<AMCContract, "id">) => void;
  updateAMCStatus: (id: string, status: AMCStatus) => void;
  deleteAMCContract: (id: string) => void;
  addPayable: (p: Omit<Payable, "id">) => void;
  updatePayableStatus: (id: string, status: Payable["status"]) => void;
  addExpense: (e: Omit<Expense, "id">) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  updateLedgerEntry: (id: string, updates: Partial<LedgerEntry>) => void;
  deleteLedgerEntry: (id: string) => void;
  addEmployee: (emp: Omit<Employee, "id">) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  toggleEmployeeStatus: (id: string) => void;
  updateEmployeeStatutory: (id: string, toggles: { esiEnabled?: boolean; pfEnabled?: boolean; incomeTaxEnabled?: boolean; professionalTaxEnabled?: boolean; freelancerTaxEnabled?: boolean }) => void;
  addFreelancerTimeLog: (employeeId: string, date: string, hours: number, taskDescription: string) => void;
  markAttendance: (record: Omit<AttendanceRecord, "id">) => void;
  bulkUpdateEmployeeAttendance: (employeeId: string, dateArray: string[], status: AttendanceRecord["status"]) => void;
  autoMarkMonthAttendance: (year: number, monthZeroBased: number) => void;
  generateMonthPayroll: (targetMonth: string) => void;
  addPayroll: (record: Omit<PayrollRecord, "id">) => void;
  updatePayrollStatus: (id: string, status: PayrollRecord["status"]) => void;
  formatCurrency: (amount: number, overrideCurrency?: Currency) => string;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);



export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {


  const [activeCurrency, setActiveCurrency] = useState<Currency>("INR");

  const [serviceCategories, setServiceCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem("aichainz_service_categories");
    return saved ? JSON.parse(saved) : DEFAULT_SERVICE_CATEGORIES;
  });

  const [expenseCategories, setExpenseCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem("aichainz_expense_categories");
    return saved ? JSON.parse(saved) : DEFAULT_EXPENSE_CATEGORIES;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem("aichainz_leads");
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  const [documents, setDocuments] = useState<BusinessDocument[]>(() => {
    const saved = localStorage.getItem("aichainz_documents");
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem("aichainz_payments");
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [writeOffs, setWriteOffs] = useState<WriteOff[]>(() => {
    const saved = localStorage.getItem("aichainz_writeoffs");
    return saved ? JSON.parse(saved) : [];
  });

  const [receivableProvisions, setReceivableProvisions] = useState<ReceivableProvision[]>(() => {
    const saved = localStorage.getItem("aichainz_provisions");
    return saved ? JSON.parse(saved) : [];
  });

  const [completedProjects, setCompletedProjects] = useState<CompletedProject[]>(() => {
    const saved = localStorage.getItem("aichainz_completed_projects");
    return saved ? JSON.parse(saved) : INITIAL_COMPLETED_PROJECTS;
  });

  const [payables, setPayables] = useState<Payable[]>(() => {
    const saved = localStorage.getItem("aichainz_payables");
    return saved ? JSON.parse(saved) : INITIAL_PAYABLES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem("aichainz_expenses");
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [ledger, setLedger] = useState<LedgerEntry[]>(() => {
    const saved = localStorage.getItem("aichainz_ledger");
    return saved ? JSON.parse(saved) : INITIAL_LEDGER;
  });

  const [gstRecords, setGstRecords] = useState<GSTEntry[]>(() => {
    const saved = localStorage.getItem("aichainz_gst");
    return saved ? JSON.parse(saved) : INITIAL_GST_RECORDS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem("aichainz_employees");
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem("aichainz_attendance");
    return saved ? JSON.parse(saved) : [];
  });

  const [payroll, setPayroll] = useState<PayrollRecord[]>(() => {
    const saved = localStorage.getItem("aichainz_payroll");
    return saved ? JSON.parse(saved) : INITIAL_PAYROLL;
  });

  const [amcContracts, setAmcContracts] = useState<AMCContract[]>(() => {
    const saved = localStorage.getItem("aichainz_amc");
    return saved ? JSON.parse(saved) : INITIAL_AMC_CONTRACTS;
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem("aichainz_bank");
    return saved ? JSON.parse(saved) : INITIAL_BANK_ACCOUNTS;
  });

  const [cryptoAccounts, setCryptoAccounts] = useState<CryptoVaultAccount[]>(() => {
    const saved = localStorage.getItem("aichainz_crypto");
    return saved ? JSON.parse(saved) : INITIAL_CRYPTO_ACCOUNTS;
  });

  const [companyAssets, setCompanyAssets] = useState<CompanyAsset[]>(() => {
    const saved = localStorage.getItem("aichainz_assets");
    return saved ? JSON.parse(saved) : INITIAL_COMPANY_ASSETS;
  });

  const [reserveProvision, setReserveProvision] = useState<ReserveProvision>(() => {
    const saved = localStorage.getItem("aichainz_reserve");
    return saved ? JSON.parse(saved) : { reservePercentage: 15, reserveReason: "Future Expansion & Emergency Fund" };
  });

  const [eventRecords, setEventRecords] = useState<EventTravelRecord[]>(() => {
    const saved = localStorage.getItem("aichainz_events");
    return saved ? JSON.parse(saved) : INITIAL_EVENT_RECORDS;
  });

  const [ceoExpenseRecords, setCeoExpenseRecords] = useState<CEOExpenseRecord[]>(() => {
    const saved = localStorage.getItem("aichainz_ceo_expenses");
    return saved ? JSON.parse(saved) : [];
  });

  const [ceoIncomeRecords, setCeoIncomeRecords] = useState<CEOIncomeRecord[]>(() => {
    const saved = localStorage.getItem("aichainz_ceo_incomes");
    return saved ? JSON.parse(saved) : [];
  });

  const [ceoFDRecords, setCeoFDRecords] = useState<CEOFixedDepositRecord[]>(() => {
    const saved = localStorage.getItem("aichainz_ceo_fds");
    return saved ? JSON.parse(saved) : [];
  });

  const [projectPLRecords, setProjectPLRecords] = useState<ProjectPLRecord[]>(() => {
    const saved = localStorage.getItem("aichainz_project_pl");
    return saved ? JSON.parse(saved) : INITIAL_PROJECT_PL_RECORDS;
  });

  const [clientDocuments, setClientDocuments] = useState<ClientDocument[]>(() => {
    const saved = localStorage.getItem("aichainz_client_documents");
    return saved ? JSON.parse(saved) : INITIAL_CLIENT_DOCUMENTS;
  });

  const [companyEMIs, setCompanyEMIs] = useState<CompanyEMI[]>(() => {
    const saved = localStorage.getItem("aichainz_company_emis");
    return saved ? JSON.parse(saved) : INITIAL_EMIS;
  });

  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(() => {
    const saved = localStorage.getItem("aichainz_subscriptions");
    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
  });

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem("aichainz_service_categories", JSON.stringify(serviceCategories)); }, [serviceCategories]);
  useEffect(() => { localStorage.setItem("aichainz_expense_categories", JSON.stringify(expenseCategories)); }, [expenseCategories]);
  useEffect(() => { localStorage.setItem("aichainz_leads", JSON.stringify(leads)); }, [leads]);
  useEffect(() => { localStorage.setItem("aichainz_documents", JSON.stringify(documents)); }, [documents]);
  useEffect(() => { localStorage.setItem("aichainz_payments", JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem("aichainz_writeoffs", JSON.stringify(writeOffs)); }, [writeOffs]);
  useEffect(() => { localStorage.setItem("aichainz_provisions", JSON.stringify(receivableProvisions)); }, [receivableProvisions]);
  useEffect(() => { localStorage.setItem("aichainz_completed_projects", JSON.stringify(completedProjects)); }, [completedProjects]);
  useEffect(() => { localStorage.setItem("aichainz_project_pl", JSON.stringify(projectPLRecords)); }, [projectPLRecords]);
  useEffect(() => { localStorage.setItem("aichainz_payables", JSON.stringify(payables)); }, [payables]);
  useEffect(() => { localStorage.setItem("aichainz_expenses", JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem("aichainz_ledger", JSON.stringify(ledger)); }, [ledger]);
  useEffect(() => { localStorage.setItem("aichainz_gst", JSON.stringify(gstRecords)); }, [gstRecords]);
  useEffect(() => { localStorage.setItem("aichainz_employees", JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem("aichainz_attendance", JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem("aichainz_payroll", JSON.stringify(payroll)); }, [payroll]);
  useEffect(() => { localStorage.setItem("aichainz_amc", JSON.stringify(amcContracts)); }, [amcContracts]);
  useEffect(() => { localStorage.setItem("aichainz_bank", JSON.stringify(bankAccounts)); }, [bankAccounts]);
  useEffect(() => { localStorage.setItem("aichainz_crypto", JSON.stringify(cryptoAccounts)); }, [cryptoAccounts]);
  useEffect(() => { localStorage.setItem("aichainz_assets", JSON.stringify(companyAssets)); }, [companyAssets]);
  useEffect(() => { localStorage.setItem("aichainz_reserve", JSON.stringify(reserveProvision)); }, [reserveProvision]);
  useEffect(() => { localStorage.setItem("aichainz_events", JSON.stringify(eventRecords)); }, [eventRecords]);
  useEffect(() => { localStorage.setItem("aichainz_client_documents", JSON.stringify(clientDocuments)); }, [clientDocuments]);
  useEffect(() => { localStorage.setItem("aichainz_company_emis", JSON.stringify(companyEMIs)); }, [companyEMIs]);
  useEffect(() => { localStorage.setItem("aichainz_subscriptions", JSON.stringify(subscriptions)); }, [subscriptions]);
  useEffect(() => { localStorage.setItem("aichainz_ceo_expenses", JSON.stringify(ceoExpenseRecords)); }, [ceoExpenseRecords]);
  useEffect(() => { localStorage.setItem("aichainz_ceo_incomes", JSON.stringify(ceoIncomeRecords)); }, [ceoIncomeRecords]);
  useEffect(() => { localStorage.setItem("aichainz_ceo_fds", JSON.stringify(ceoFDRecords)); }, [ceoFDRecords]);

  // Initial State Hydration from MongoDB Atlas
  useEffect(() => {
    fetchERPDataFromMongo().then(data => {
      if (data) {
        if (Array.isArray(data.leads) && data.leads.length > 0) setLeads(data.leads);
        if (Array.isArray(data.documents) && data.documents.length > 0) setDocuments(data.documents);
        if (Array.isArray(data.payments) && data.payments.length > 0) setPayments(data.payments);
        if (Array.isArray(data.writeOffs)) setWriteOffs(data.writeOffs);
        if (Array.isArray(data.receivableProvisions)) setReceivableProvisions(data.receivableProvisions);
        if (Array.isArray(data.completedProjects) && data.completedProjects.length > 0) setCompletedProjects(data.completedProjects);
        if (Array.isArray(data.projectPLRecords) && data.projectPLRecords.length > 0) setProjectPLRecords(data.projectPLRecords);
        if (Array.isArray(data.payables) && data.payables.length > 0) setPayables(data.payables);
        if (Array.isArray(data.expenses) && data.expenses.length > 0) setExpenses(data.expenses);
        if (Array.isArray(data.ledger) && data.ledger.length > 0) setLedger(data.ledger);
        if (Array.isArray(data.gstRecords) && data.gstRecords.length > 0) setGstRecords(data.gstRecords);
        if (Array.isArray(data.employees) && data.employees.length > 0) setEmployees(data.employees);
        if (Array.isArray(data.attendance)) setAttendance(data.attendance);
        if (Array.isArray(data.payroll) && data.payroll.length > 0) setPayroll(data.payroll);
        if (Array.isArray(data.amcContracts) && data.amcContracts.length > 0) setAmcContracts(data.amcContracts);
        if (Array.isArray(data.bankAccounts) && data.bankAccounts.length > 0) setBankAccounts(data.bankAccounts);
        if (Array.isArray(data.cryptoAccounts) && data.cryptoAccounts.length > 0) setCryptoAccounts(data.cryptoAccounts);
        if (Array.isArray(data.companyAssets) && data.companyAssets.length > 0) setCompanyAssets(data.companyAssets);
        if (Array.isArray(data.eventRecords) && data.eventRecords.length > 0) setEventRecords(data.eventRecords);
        if (Array.isArray(data.clientDocuments)) setClientDocuments(data.clientDocuments);
        if (Array.isArray(data.companyEMIs)) setCompanyEMIs(data.companyEMIs);
        if (Array.isArray(data.subscriptions)) setSubscriptions(data.subscriptions);
        if (Array.isArray(data.serviceCategories) && data.serviceCategories.length > 0) setServiceCategories(data.serviceCategories);
        if (Array.isArray(data.expenseCategories) && data.expenseCategories.length > 0) setExpenseCategories(data.expenseCategories);
        if (data.reserveProvision) setReserveProvision(data.reserveProvision);
        console.log("✅ Universal ERP state hydrated successfully from MongoDB Atlas!");
      }
    });
  }, []);

  // Real-time debounced auto-sync to MongoDB Atlas whenever state changes
  useEffect(() => {
    const fullState = {
      leads,
      documents,
      payments,
      writeOffs,
      receivableProvisions,
      completedProjects,
      projectPLRecords,
      payables,
      expenses,
      ledger,
      gstRecords,
      employees,
      attendance,
      payroll,
      amcContracts,
      bankAccounts,
      cryptoAccounts,
      companyAssets,
      eventRecords,
      clientDocuments,
      companyEMIs,
      subscriptions,
      serviceCategories,
      expenseCategories,
      reserveProvision
    };
    syncERPDataToMongo(fullState);
  }, [
    leads, documents, payments, writeOffs, receivableProvisions, completedProjects,
    projectPLRecords, payables, expenses, ledger, gstRecords, employees, attendance,
    payroll, amcContracts, bankAccounts, cryptoAccounts, companyAssets, eventRecords,
    clientDocuments, companyEMIs, subscriptions, serviceCategories, expenseCategories, reserveProvision
  ]);

  // Auto check for OVERDUE invoices daily
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    setDocuments(prevDocs => prevDocs.map(doc => {
      if (doc.docType === "INVOICE" && (doc.status === "UNPAID" || doc.status === "PARTIALLY_PAID") && doc.dueDate && doc.dueDate < todayStr) {
        return { ...doc, status: "OVERDUE" };
      }
      return doc;
    }));
  }, []);

  // Helper getters
  const getInvoicePayments = (invoiceId: string): Payment[] => {
    return payments.filter(p => p.invoiceId === invoiceId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getInvoiceTotalPaid = (invoiceId: string): number => {
    return payments.filter(p => p.invoiceId === invoiceId).reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  const getInvoiceBalance = (invoiceId: string): number => {
    const doc = documents.find(d => d.id === invoiceId);
    if (!doc) return 0;
    if (doc.status === "UNCOLLECTIBLE" || doc.status === "UNRECOVERABLE") return 0;
    const paid = getInvoiceTotalPaid(invoiceId);
    return Math.max(0, doc.total - paid);
  };

  const addPayment = (paymentData: Omit<Payment, "id">) => {
    const doc = documents.find(d => d.id === paymentData.invoiceId);
    if (!doc) return;

    const newPayment: Payment = {
      ...paymentData,
      id: "REC-" + Date.now().toString().slice(-6)
    };

    setPayments(prev => [newPayment, ...prev]);

    // Recalculate total paid & balance
    const existingPaid = getInvoiceTotalPaid(doc.id);
    const newTotalPaid = existingPaid + paymentData.amount;
    const balance = Math.max(0, doc.total - newTotalPaid);

    // Determine new status
    let newStatus: BusinessDocument["status"] = doc.status;
    if (balance === 0) {
      newStatus = "PAID";
    } else if (newTotalPaid > 0) {
      newStatus = "PARTIALLY_PAID";
    }

    setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: newStatus } : d));

    // Double-entry accounting ledger: Debit Bank/Cash, Credit Accounts Receivable
    const ledgerEntry: LedgerEntry = {
      id: "LED-REC-" + Date.now().toString().slice(-4),
      date: paymentData.date,
      type: "CREDIT",
      category: "Client Payment Receipt",
      description: "Payment (" + paymentData.paymentMethod + " - Ref: " + (paymentData.referenceNo || "N/A") + ") for " + doc.docNumber + " (" + (doc.clientCompany || doc.clientName) + ")",
      amount: paymentData.amount,
      currency: paymentData.currency,
      runningBalance: 0,
      referenceDocNo: doc.docNumber,
      debitAccount: paymentData.paymentMethod.includes("Crypto") ? "Crypto Treasury Vault" : "Bank / Cash Account",
      creditAccount: "Accounts Receivable",
      paymentId: newPayment.id
    };
    setLedger(lPrev => [ledgerEntry, ...lPrev]);

    // Credit Treasury Bank / Crypto Account
    if (paymentData.bankAccountId) {
      setBankAccounts(bPrev => bPrev.map(b => b.id === paymentData.bankAccountId ? { ...b, balanceINR: b.balanceINR + paymentData.amount } : b));
    } else if (paymentData.paymentMethod.includes("Crypto") || paymentData.paymentMethod.includes("USDT")) {
      setCryptoAccounts(cPrev => cPrev.map((c, idx) => idx === 0 ? { ...c, balanceCrypto: c.balanceCrypto + Math.round(paymentData.amount / (c.usdRateINR || 90)) } : c));
    } else {
      setBankAccounts(bPrev => bPrev.map((b, idx) => idx === 0 ? { ...b, balanceINR: b.balanceINR + paymentData.amount } : b));
    }
  };

  const convertQuotationToInvoice = (quotationId: string): BusinessDocument | undefined => {
    const qtn = documents.find(d => d.id === quotationId);
    if (!qtn || qtn.docType !== "QUOTATION") return undefined;

    const todayStr = new Date().toISOString().split("T")[0];
    const dueDateStr = new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0];
    
    const newInvoice: BusinessDocument = {
      ...qtn,
      id: "DOC-" + Date.now().toString().slice(-5),
      docType: "INVOICE",
      docNumber: "INV-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000),
      issueDate: todayStr,
      dueDate: dueDateStr,
      status: "UNPAID",
      quotationRef: qtn.docNumber
    };

    setDocuments(prev => [newInvoice, ...prev.map(d => d.id === quotationId ? { ...d, status: "CONVERTED" as const } : d)]);
    return newInvoice;
  };

  const writeOffReceivable = (writeOffData: Omit<WriteOff, "id">) => {
    const newWriteOff: WriteOff = {
      ...writeOffData,
      id: "WO-" + Date.now().toString().slice(-5)
    };

    setWriteOffs(prev => [newWriteOff, ...prev]);

    // Update document status to UNCOLLECTIBLE
    setDocuments(prev => prev.map(d => d.id === writeOffData.invoiceId ? {
      ...d,
      status: "UNCOLLECTIBLE",
      unrecoverableReason: writeOffData.reason
    } : d));

    // Ledger double entry: Debit Bad Debt Expense, Credit Accounts Receivable
    const badDebtLedger: LedgerEntry = {
      id: "LED-WO-" + Date.now().toString().slice(-4),
      date: writeOffData.date,
      type: "DEBIT",
      category: "Bad Debt Write-Off",
      description: "Write-Off for Invoice " + writeOffData.invoiceNo + " (" + writeOffData.clientCompany + ") - Reason: " + writeOffData.reason,
      amount: writeOffData.amount,
      currency: writeOffData.currency,
      runningBalance: 0,
      referenceDocNo: writeOffData.invoiceNo,
      debitAccount: "Bad Debt / Uncollectible Expense",
      creditAccount: "Accounts Receivable",
      writeOffId: newWriteOff.id
    };
    setLedger(lPrev => [badDebtLedger, ...lPrev]);
  };

  const provisionReceivable = (provisionData: Omit<ReceivableProvision, "id">) => {
    const newProvision: ReceivableProvision = {
      ...provisionData,
      id: "PROV-" + Date.now().toString().slice(-5)
    };
    setReceivableProvisions(prev => [newProvision, ...prev]);

    // Ledger entry for provision: Debit Provision for Credit Losses, Credit Allowance for Doubtful Accounts
    const provLedger: LedgerEntry = {
      id: "LED-PROV-" + Date.now().toString().slice(-4),
      date: provisionData.date,
      type: "DEBIT",
      category: "Expected Credit Loss Provision",
      description: "Receivable Provision for " + provisionData.invoiceNo + " (" + (provisionData.clientCompany || provisionData.clientName) + ")",
      amount: provisionData.provisionAmount,
      currency: provisionData.currency,
      runningBalance: 0,
      referenceDocNo: provisionData.invoiceNo,
      debitAccount: "Provision for Credit Losses",
      creditAccount: "Allowance for Doubtful Accounts"
    };
    setLedger(lPrev => [provLedger, ...lPrev]);
  };

  const getReceivableSummary = (): ReceivableSummary => {
    const today = new Date();
    let totalReceivable = 0;
    let overdueReceivable = 0;
    let currentReceivable = 0;
    let bracket0_30 = 0;
    let bracket31_60 = 0;
    let bracket61_90 = 0;
    let bracket90plus = 0;

    documents.forEach(doc => {
      if (doc.docType === "INVOICE" && (doc.status === "UNPAID" || doc.status === "PARTIALLY_PAID" || doc.status === "OVERDUE")) {
        const paid = getInvoiceTotalPaid(doc.id);
        const bal = Math.max(0, doc.total - paid);
        if (bal <= 0) return;

        totalReceivable += bal;

        const dueDate = new Date(doc.dueDate);
        const diffTime = today.getTime() - dueDate.getTime();
        const daysOverdue = Math.floor(diffTime / (1000 * 3600 * 24));

        if (daysOverdue > 0) {
          overdueReceivable += bal;
          if (daysOverdue <= 30) bracket0_30 += bal;
          else if (daysOverdue <= 60) bracket31_60 += bal;
          else if (daysOverdue <= 90) bracket61_90 += bal;
          else bracket90plus += bal;
        } else {
          currentReceivable += bal;
        }
      }
    });

    return {
      totalReceivable,
      overdueReceivable,
      currentReceivable,
      bracket0_30,
      bracket31_60,
      bracket61_90,
      bracket90plus
    };
  };

  const getAgingReport = (): AgingBracket[] => {
    const today = new Date();
    const brackets: AgingBracket[] = [];

    documents.forEach(doc => {
      if (doc.docType === "INVOICE" && (doc.status === "UNPAID" || doc.status === "PARTIALLY_PAID" || doc.status === "OVERDUE")) {
        const paid = getInvoiceTotalPaid(doc.id);
        const bal = Math.max(0, doc.total - paid);
        if (bal <= 0) return;

        const dueDate = new Date(doc.dueDate);
        const diffTime = today.getTime() - dueDate.getTime();
        const daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 3600 * 24)));

        let bracket: AgingBracket["bracket"] = "0-30";
        if (daysOverdue > 90) bracket = "90+";
        else if (daysOverdue > 60) bracket = "61-90";
        else if (daysOverdue > 30) bracket = "31-60";

        brackets.push({
          invoiceId: doc.id,
          invoiceNo: doc.docNumber,
          clientName: doc.clientName,
          clientCompany: doc.clientCompany,
          invoiceTotal: doc.total,
          totalPaid: paid,
          balance: bal,
          daysOverdue,
          bracket
        });
      }
    });

    return brackets.sort((a, b) => b.daysOverdue - a.daysOverdue);
  };

  // Legacy fallback
  const recordAdvancePayment = (
    docId: string,
    amount: number,
    paymentDate: string,
    paymentMethod: string,
    refNo: string
  ) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;
    addPayment({
      invoiceId: docId,
      invoiceNo: doc.docNumber,
      clientName: doc.clientName,
      clientCompany: doc.clientCompany,
      date: paymentDate,
      amount,
      currency: doc.currency,
      paymentMethod: paymentMethod as any || "Bank Transfer",
      referenceNo: refNo,
      type: "ADVANCE"
    });
  };

  const addServiceCategory = (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (trimmed && !serviceCategories.includes(trimmed)) {
      setServiceCategories(prev => [...prev, trimmed]);
    }
  };

  const addExpenseCategory = (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (trimmed && !expenseCategories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setExpenseCategories(prev => [...prev, trimmed]);
    }
  };

  const addLead = (newLeadData: Omit<Lead, "id" | "createdAt"> & { createdAt?: string }) => {
    const newLead: Lead = {
      ...newLeadData,
      id: "LEAD-" + Date.now().toString().slice(-4),
      createdAt: newLeadData.createdAt || new Date().toISOString().split("T")[0]
    };
    setLeads(prev => [newLead, ...prev]);
  };

  const updateLeadStage = (id: string, stage: Lead["stage"]) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage } : l));
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const addDocument = (docData: Omit<BusinessDocument, "id">) => {
    const newDoc: BusinessDocument = {
      ...docData,
      id: "DOC-" + Date.now().toString().slice(-5)
    };
    setDocuments(prev => [newDoc, ...prev]);
  };

  const updateDocument = (id: string, updates: Partial<BusinessDocument>) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const updateDocumentStatus = (id: string, status: BusinessDocument["status"]) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const addProjectPLRecord = (rec: ProjectPLRecord) => {
    setProjectPLRecords(prev => [rec, ...prev]);
  };

  const updateProjectPLRecord = (rec: ProjectPLRecord) => {
    setProjectPLRecords(prev => prev.map(p => p.id === rec.id ? rec : p));
  };

  const deleteProjectPLRecord = (id: string) => {
    setProjectPLRecords(prev => prev.filter(p => p.id !== id));
  };

  const addAMCContract = (amcData: Omit<AMCContract, "id">) => {
    const newAMC: AMCContract = {
      ...amcData,
      id: "AMC-" + Date.now().toString().slice(-4)
    };
    setAmcContracts(prev => [newAMC, ...prev]);
  };

  const updateAMCStatus = (id: string, status: AMCStatus) => {
    setAmcContracts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const deleteAMCContract = (id: string) => {
    setAmcContracts(prev => prev.filter(a => a.id !== id));
  };

  const addBankAccount = (bankData: Omit<BankAccount, "id">) => {
    const newBank: BankAccount = {
      ...bankData,
      id: "BANK-" + Date.now().toString().slice(-4)
    };
    setBankAccounts(prev => [...prev, newBank]);
  };

  const updateBankAccount = (id: string, updates: Partial<BankAccount>) => {
    setBankAccounts(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBankAccount = (id: string) => {
    setBankAccounts(prev => prev.filter(b => b.id !== id));
  };

  const addCryptoAccount = (cryptoData: Omit<CryptoVaultAccount, "id">) => {
    const newCrypto: CryptoVaultAccount = {
      ...cryptoData,
      id: "CRYPTO-" + Date.now().toString().slice(-4)
    };
    setCryptoAccounts(prev => [...prev, newCrypto]);
  };

  const updateCryptoAccount = (id: string, updates: Partial<CryptoVaultAccount>) => {
    setCryptoAccounts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCryptoAccount = (id: string) => {
    setCryptoAccounts(prev => prev.filter(c => c.id !== id));
  };

  const addCompanyAsset = (assetData: Omit<CompanyAsset, "id">) => {
    const newAsset: CompanyAsset = {
      ...assetData,
      id: "AST-" + Date.now().toString().slice(-4)
    };
    setCompanyAssets(prev => [...prev, newAsset]);

    // Interconnection: Auto-post Asset Purchase Expense & Ledger
    if (assetData.purchaseCostINR > 0) {
      const assetExpense: Expense = {
        id: "EXP-AST-" + Date.now().toString().slice(-4),
        title: "Hardware Asset Purchase: " + assetData.assetName + " (" + assetData.category + ")",
        category: "Hardware",
        amount: assetData.purchaseCostINR,
        currency: "INR",
        date: assetData.purchaseDate,
        paidTo: assetData.assignedToEmployeeName || "Asset Vendor",
        paymentMode: "Bank Transfer",
        paymentStatus: "PAID",
        officeLocation: assetData.officeLocation || "India",
        notes: "Asset Serial No: " + assetData.serialNumber + " | Tag: " + assetData.assetTag
      };
      setExpenses(ePrev => [assetExpense, ...ePrev]);

      const assetLedger: LedgerEntry = {
        id: "LED-AST-" + Date.now().toString().slice(-4),
        date: assetData.purchaseDate,
        type: "DEBIT",
        category: "Hardware Asset",
        description: "Purchased Hardware Asset: " + assetData.assetName + " [Tag: " + assetData.assetTag + "]",
        amount: assetData.purchaseCostINR,
        currency: "INR",
        runningBalance: 0,
        referenceDocNo: newAsset.id,
        debitAccount: "Equipment & Hardware Assets",
        creditAccount: "Corporate Bank Account"
      };
      setLedger(lPrev => [assetLedger, ...lPrev]);
    }
  };

  const updateCompanyAsset = (id: string, updates: Partial<CompanyAsset>) => {
    setCompanyAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteCompanyAsset = (id: string) => {
    setCompanyAssets(prev => prev.filter(a => a.id !== id));
  };

  const updateReserveProvision = (reserve: ReserveProvision) => {
    setReserveProvision(reserve);
  };

  const addEventRecord = (evtData: Omit<EventTravelRecord, "id">) => {
    const newEvt: EventTravelRecord = {
      ...evtData,
      id: "EVT-" + Date.now().toString().slice(-4)
    };
    setEventRecords(prev => [newEvt, ...prev]);
  };

  const updateEventRecord = (id: string, updates: Partial<EventTravelRecord>) => {
    setEventRecords(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEventRecord = (id: string) => {
    setEventRecords(prev => prev.filter(e => e.id !== id));
  };

  const addCEOExpense = (recData: Omit<CEOExpenseRecord, "id" | "createdAt">) => {
    const newRec: CEOExpenseRecord = {
      ...recData,
      id: "CEO-EXP-" + Date.now().toString().slice(-4),
      createdAt: new Date().toISOString()
    };
    setCeoExpenseRecords(prev => [newRec, ...prev]);
  };

  const updateCEOExpense = (id: string, updates: Partial<CEOExpenseRecord>) => {
    setCeoExpenseRecords(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCEOExpense = (id: string) => {
    setCeoExpenseRecords(prev => prev.filter(c => c.id !== id));
  };

  const addCEOIncome = (recData: Omit<CEOIncomeRecord, "id" | "createdAt">) => {
    const newRec: CEOIncomeRecord = {
      ...recData,
      id: "CEO-INC-" + Date.now().toString().slice(-4),
      createdAt: new Date().toISOString()
    };
    setCeoIncomeRecords(prev => [newRec, ...prev]);
  };

  const updateCEOIncome = (id: string, updates: Partial<CEOIncomeRecord>) => {
    setCeoIncomeRecords(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCEOIncome = (id: string) => {
    setCeoIncomeRecords(prev => prev.filter(c => c.id !== id));
  };

  const addCEOFDRecord = (recData: Omit<CEOFixedDepositRecord, "id" | "createdAt">) => {
    const newRec: CEOFixedDepositRecord = {
      ...recData,
      id: "CEO-FD-" + Date.now().toString().slice(-4),
      createdAt: new Date().toISOString()
    };
    setCeoFDRecords(prev => [newRec, ...prev]);
  };

  const updateCEOFDRecord = (id: string, updates: Partial<CEOFixedDepositRecord>) => {
    setCeoFDRecords(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCEOFDRecord = (id: string) => {
    setCeoFDRecords(prev => prev.filter(c => c.id !== id));
  };

  const addCompletedProject = (projData: Omit<CompletedProject, "id">) => {
    const newProj: CompletedProject = {
      ...projData,
      id: "CP-" + Date.now().toString().slice(-4)
    };
    setCompletedProjects(prev => [newProj, ...prev]);
  };

  const updateCompletedProject = (id: string, updates: Partial<CompletedProject>) => {
    setCompletedProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addPayable = (payableData: Omit<Payable, "id">) => {
    const newP: Payable = {
      ...payableData,
      id: "PAYABLE-" + Date.now().toString().slice(-4)
    };
    setPayables(prev => [newP, ...prev]);
  };

  const updatePayableStatus = (id: string, status: Payable["status"]) => {
    setPayables(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, status };
        if (status === "PAID" && p.status !== "PAID") {
          let mappedCategory: Expense["category"] = "Infrastructure";
          if (p.category === "Freelancer") mappedCategory = "Freelancer Payouts";
          else if (p.category === "Software License") mappedCategory = "Software";
          else if (p.category === "Office Rent") mappedCategory = "Office Expenses";

          const newExpense: Expense = {
            id: "EXP-" + Date.now().toString().slice(-4),
            title: "Paid Bill #" + p.invoiceNumber + " to " + p.vendorName,
            category: mappedCategory,
            amount: p.amount,
            currency: p.currency,
            date: new Date().toISOString().split("T")[0],
            paidTo: p.vendorName,
            paymentMode: "Bank Transfer",
            officeLocation: p.officeLocation
          };
          setExpenses(ePrev => [newExpense, ...ePrev]);

          const newLedger: LedgerEntry = {
            id: "LED-" + Date.now().toString().slice(-4),
            date: new Date().toISOString().split("T")[0],
            type: "DEBIT",
            category: p.category,
            description: "Vendor Disbursal to " + p.vendorName + " (" + p.invoiceNumber + ")",
            amount: p.amount,
            currency: p.currency,
            runningBalance: 0,
            referenceDocNo: p.invoiceNumber
          };
          setLedger(lPrev => [newLedger, ...lPrev]);
        }
        return updated;
      }
      return p;
    }));
  };

  const addExpense = (expenseData: Omit<Expense, "id">) => {
    const newE: Expense = {
      ...expenseData,
      id: "EXP-" + Date.now().toString().slice(-4),
      totalAmount: expenseData.totalAmount || (expenseData.amount + (expenseData.taxAmount || 0))
    };
    setExpenses(prev => [newE, ...prev]);

    // Single Source of Truth: Auto-post Double-Entry Ledger
    const descSuffix = expenseData.isMultiProject ? " (Multi-Project Allocation)" : (expenseData.projectCode ? " [" + expenseData.projectCode + "]" : "");
    const newLedger: LedgerEntry = {
      id: "LED-" + Date.now().toString().slice(-4),
      date: expenseData.date,
      type: "DEBIT",
      category: expenseData.category,
      description: expenseData.title + descSuffix,
      amount: newE.totalAmount || expenseData.amount,
      currency: expenseData.currency,
      runningBalance: 0,
      referenceDocNo: newE.id,
      debitAccount: expenseData.category,
      creditAccount: expenseData.paymentStatus === "PAYABLE" ? "Accounts Payable" : "Bank / Cash Account"
    };
    setLedger(prev => [newLedger, ...prev]);

    // Auto-create Accounts Payable if status is PAYABLE
    if (expenseData.paymentStatus === "PAYABLE") {
      addPayable({
        vendorName: expenseData.paidTo || "Vendor",
        invoiceNumber: "EXP-BILL-" + Date.now().toString().slice(-4),
        category: "Software License",
        amount: newE.totalAmount || expenseData.amount,
        currency: expenseData.currency,
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
        status: "PENDING",
        description: expenseData.title,
        officeLocation: expenseData.officeLocation
      });
    } else if (expenseData.bankAccountId) {
      setBankAccounts(bPrev => bPrev.map(b => b.id === expenseData.bankAccountId ? { ...b, balanceINR: Math.max(0, b.balanceINR - (newE.totalAmount || expenseData.amount)) } : b));
    }
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    const oldExp = expenses.find(e => e.id === id);
    if (!oldExp) return;

    const oldAmount = oldExp.totalAmount || oldExp.amount;
    const newAmount = updates.totalAmount !== undefined ? updates.totalAmount : (updates.amount !== undefined ? updates.amount : oldAmount);
    const amountDiff = newAmount - oldAmount;

    if (updates.bankAccountId || oldExp.bankAccountId) {
      const bankId = updates.bankAccountId || oldExp.bankAccountId;
      if (bankId && (oldExp.paymentStatus === 'PAID' || updates.paymentStatus === 'PAID')) {
        setBankAccounts(bPrev => bPrev.map(b => b.id === bankId ? { ...b, balanceINR: Math.max(0, b.balanceINR - amountDiff) } : b));
      }
    }

    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates, title: updates.category || e.category } : e));

    setLedger(prev => prev.map(entry => {
      if (entry.referenceDocNo === id || (entry.description && entry.description.includes(id))) {
        return {
          ...entry,
          amount: newAmount,
          date: updates.date || entry.date,
          category: (updates.category as string) || entry.category,
          description: updates.paidTo ? `Expense: ${updates.category || entry.category} to ${updates.paidTo} (Ref: ${id})` : entry.description
        };
      }
      return entry;
    }));
  };

  const deleteExpense = (id: string) => {
    const targetExp = expenses.find(e => e.id === id);
    if (targetExp) {
      if (targetExp.bankAccountId && targetExp.paymentStatus === 'PAID') {
        setBankAccounts(bPrev => bPrev.map(b => b.id === targetExp.bankAccountId ? { ...b, balanceINR: b.balanceINR + targetExp.amount } : b));
      }
      setLedger(prev => prev.filter(l => l.referenceDocNo !== id && !l.description.includes(id)));
    }
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const updateLedgerEntry = (id: string, updates: Partial<LedgerEntry>) => {
    const oldEntry = ledger.find(l => l.id === id);
    if (!oldEntry) return;

    setLedger(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));

    if (oldEntry.referenceDocNo && oldEntry.referenceDocNo.startsWith('EXP-')) {
      const expId = oldEntry.referenceDocNo;
      setExpenses(prev => prev.map(e => e.id === expId ? {
        ...e,
        amount: updates.amount !== undefined ? updates.amount : e.amount,
        totalAmount: updates.amount !== undefined ? updates.amount : e.totalAmount,
        date: updates.date || e.date,
        category: (updates.category as any) || e.category,
        title: updates.category || e.title
      } : e));
    }
  };

  const deleteLedgerEntry = (id: string) => {
    const targetLedger = ledger.find(l => l.id === id);
    if (targetLedger) {
      if (targetLedger.referenceDocNo && targetLedger.referenceDocNo.startsWith('EXP-')) {
        const expId = targetLedger.referenceDocNo;
        setExpenses(prev => prev.filter(e => e.id !== expId));
      }
    }
    setLedger(prev => prev.filter(l => l.id !== id));
  };

  const addEmployee = (empData: Omit<Employee, "id">) => {
    const newEmp: Employee = {
      ...empData,
      id: "EMP-" + (employees.length + 1).toString().padStart(3, "0")
    };
    setEmployees(prev => [...prev, newEmp]);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...updates } : emp));
  };

  const toggleEmployeeStatus = (id: string) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, status: emp.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : emp));
  };

  const updateEmployeeStatutory = (id: string, toggles: { esiEnabled?: boolean; pfEnabled?: boolean; incomeTaxEnabled?: boolean; professionalTaxEnabled?: boolean; freelancerTaxEnabled?: boolean }) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...toggles } : emp));
  };

  const addFreelancerTimeLog = (employeeId: string, date: string, hours: number, taskDescription: string) => {
    const newLog: FreelancerTimeLog = {
      id: "LOG-" + Date.now().toString().slice(-4),
      date,
      hours,
      taskDescription
    };
    setEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        return { ...emp, timeLogs: [...(emp.timeLogs || []), newLog] };
      }
      return emp;
    }));
  };

  const markAttendance = (recordData: Omit<AttendanceRecord, "id">) => {
    const newRecord: AttendanceRecord = {
      ...recordData,
      id: "ATT-" + Date.now().toString().slice(-4)
    };
    setAttendance(prev => {
      const filtered = prev.filter(a => !(a.employeeId === recordData.employeeId && a.date === recordData.date));
      return [...filtered, newRecord];
    });
  };

  const bulkUpdateEmployeeAttendance = (employeeId: string, dateArray: string[], status: AttendanceRecord["status"]) => {
    const emp = employees.find(e => e.id === employeeId);
    const empName = emp ? emp.name : "Employee";

    setAttendance(prev => {
      const filtered = prev.filter(a => !(a.employeeId === employeeId && dateArray.includes(a.date)));
      const newRecords: AttendanceRecord[] = dateArray.map(d => ({
        id: "ATT-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
        employeeId,
        employeeName: empName,
        date: d,
        status,
        checkInTime: "09:00 AM",
        checkOutTime: "06:00 PM"
      }));
      return [...filtered, ...newRecords];
    });
  };

  const autoMarkMonthAttendance = (year: number, monthZeroBased: number) => {
    const daysInMonth = new Date(year, monthZeroBased + 1, 0).getDate();
    const newRecords: AttendanceRecord[] = [];

    employees.forEach(emp => {
      for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, monthZeroBased, day);
        const dayOfWeek = dateObj.getDay();
        const dateStr = year + "-" + (monthZeroBased + 1).toString().padStart(2, "0") + "-" + day.toString().padStart(2, "0");

        let status: AttendanceRecord["status"] = "PRESENT";
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          status = "HOLIDAY_WEEKEND";
        }

        newRecords.push({
          id: "ATT-" + emp.id + "-" + dateStr,
          employeeId: emp.id,
          employeeName: emp.name,
          date: dateStr,
          status,
          checkInTime: status === "PRESENT" ? "09:00 AM" : undefined,
          checkOutTime: status === "PRESENT" ? "06:00 PM" : undefined
        });
      }
    });

    setAttendance(newRecords);
  };

  const generateMonthPayroll = (targetMonth: string) => {
    const newPayrolls: PayrollRecord[] = employees.map(emp => {
      let baseAmount = 0;
      let esiDeduction = 0;
      let pfDeduction = 0;
      let incomeTaxDeduction = 0;
      let ptDeduction = 0;
      let freelancerTaxDeduction = 0;
      let totalHoursWorked = 0;

      if (emp.type === "FULL_TIME") {
        baseAmount = emp.monthlySalary || 0;
        if (emp.esiEnabled && baseAmount <= 21000) {
          esiDeduction = Math.round(baseAmount * 0.0075);
        }
        if (emp.pfEnabled) {
          const pfBasic = Math.min(baseAmount, 15000);
          pfDeduction = Math.round(pfBasic * 0.12);
        }
        if (emp.incomeTaxEnabled && baseAmount > 50000) {
          incomeTaxDeduction = Math.round(baseAmount * 0.08);
        }
        if (emp.professionalTaxEnabled && baseAmount > 15000) {
          ptDeduction = 200;
        }
      } else {
        totalHoursWorked = (emp.timeLogs || []).reduce((sum, l) => sum + (l.hours || 0), 0);
        baseAmount = totalHoursWorked * (emp.hourlyRate || 0);
        if (emp.freelancerTaxEnabled ?? true) {
          freelancerTaxDeduction = Math.round(baseAmount * 0.10);
        }
      }

      const totalDeductions = esiDeduction + pfDeduction + incomeTaxDeduction + ptDeduction + freelancerTaxDeduction;
      const netPayable = Math.max(0, baseAmount - totalDeductions);

      return {
        id: "PAY-" + targetMonth.replace(/\s+/g, "") + "-" + emp.id,
        employeeId: emp.id,
        employeeName: emp.name,
        employeeType: emp.type,
        month: targetMonth,
        baseAmount,
        totalHoursWorked: emp.type === "FREELANCER" ? totalHoursWorked : undefined,
        bonus: 0,
        esiDeduction,
        pfDeduction,
        incomeTaxDeduction,
        ptDeduction,
        freelancerTaxDeduction,
        totalDeductions,
        netPayable,
        currency: "INR",
        status: "PAID",
        paymentDate: new Date().toISOString().split("T")[0],
        bankDetails: emp.bankDetails || "Bank Transfer"
      };
    });

    setPayroll(newPayrolls);

    // HR Interconnection: Auto-post Payroll Expense & Double-Entry Ledger
    const totalNetPayroll = newPayrolls.reduce((sum, p) => sum + p.netPayable, 0);
    const totalGrossPayroll = newPayrolls.reduce((sum, p) => sum + p.baseAmount, 0);
    const totalStatutoryWithheld = newPayrolls.reduce((sum, p) => sum + p.totalDeductions, 0);

    if (totalNetPayroll > 0) {
      const payrollExpense: Expense = {
        id: "EXP-PAY-" + Date.now().toString().slice(-4),
        title: "Monthly Staff & Contractor Payroll Disbursal (" + targetMonth + ")",
        category: "Personnel / Employee Cost",
        amount: totalNetPayroll,
        currency: "INR",
        date: new Date().toISOString().split("T")[0],
        paidTo: "All Employees & Freelancers",
        paymentMode: "Bank Transfer",
        paymentStatus: "PAID",
        officeLocation: "India",
        notes: "Gross: ₹" + totalGrossPayroll.toLocaleString() + " | Tax Withheld: ₹" + totalStatutoryWithheld.toLocaleString() + " | Net Outflow: ₹" + totalNetPayroll.toLocaleString()
      };
      setExpenses(ePrev => [payrollExpense, ...ePrev.filter(e => !e.title.includes(targetMonth))]);

      const payrollLedger: LedgerEntry = {
        id: "LED-PAY-" + Date.now().toString().slice(-4),
        date: new Date().toISOString().split("T")[0],
        type: "DEBIT",
        category: "Personnel / Employee Cost",
        description: "Disbursed Monthly Payroll (" + targetMonth + ") - " + newPayrolls.length + " Staff Members",
        amount: totalNetPayroll,
        currency: "INR",
        runningBalance: 0,
        referenceDocNo: "PAYROLL-" + targetMonth.replace(/\s+/g, ""),
        debitAccount: "Salaries & Wages Expense",
        creditAccount: "Corporate Bank Account"
      };
      setLedger(lPrev => [payrollLedger, ...lPrev.filter(l => !l.referenceDocNo?.includes(targetMonth.replace(/\s+/g, "")))]);
    }
  };

    const addPayroll = (recordData: Omit<PayrollRecord, "id">) => {
    const newRec: PayrollRecord = {
      ...recordData,
      id: "PAY-" + Date.now().toString().slice(-4)
    };
    setPayroll(prev => [newRec, ...prev]);
  };

  const updatePayrollStatus = (id: string, status: PayrollRecord["status"]) => {
    setPayroll(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const formatCurrency = (amount: number, overrideCurrency?: Currency) => {
    const safeAmount = Number(amount) || 0;
    const cur = overrideCurrency || activeCurrency;
    if (cur === "USD") return "$" + safeAmount.toLocaleString("en-US");
    if (cur === "AED") return "AED " + safeAmount.toLocaleString("en-US");
    if (cur === "RWF") return "RWF " + safeAmount.toLocaleString("en-US");
    return "₹" + safeAmount.toLocaleString("en-IN");
  };

  const addClientDocument = (doc: Omit<ClientDocument, "id" | "uploadedDate">) => {
    const newDoc: ClientDocument = {
      ...doc,
      id: "DOC-VAULT-" + Date.now().toString().slice(-4),
      uploadedDate: new Date().toISOString().split("T")[0]
    };
    setClientDocuments(prev => [newDoc, ...prev]);
  };

  const deleteClientDocument = (id: string) => {
    setClientDocuments(prev => prev.filter(d => d.id !== id));
  };

  const addCompanyEMI = (emi: Omit<CompanyEMI, "id" | "paidMonthsCount" | "status">) => {
    const newEMI: CompanyEMI = {
      ...emi,
      id: "EMI-" + Date.now().toString().slice(-4),
      paidMonthsCount: 0,
      status: "ACTIVE"
    };
    setCompanyEMIs(prev => [newEMI, ...prev]);
  };

  const deleteCompanyEMI = (id: string) => {
    setCompanyEMIs(prev => prev.filter(e => e.id !== id));
  };

  const processEMIDeduction = (emiId: string) => {
    const emi = companyEMIs.find(e => e.id === emiId);
    if (!emi) return;
    const todayDateStr = new Date().toISOString().split("T")[0];
    const currentMonthStr = new Date().toLocaleString("default", { month: "long", year: "numeric" });

    const emiExpense: Expense = {
      id: "EXP-EMI-" + Date.now().toString().slice(-4),
      title: "Monthly EMI Payment - " + emi.productName,
      category: "Infrastructure",
      amount: emi.monthlyEMIAmount,
      currency: emi.currency,
      date: todayDateStr,
      paidTo: emi.vendorName,
      paymentMode: "Bank Transfer",
      officeLocation: "India",
      referenceNo: "EMI-" + emi.id
    };
    setExpenses(prev => [emiExpense, ...prev]);

    const emiLedger: LedgerEntry = {
      id: "LED-EMI-" + Date.now().toString().slice(-4),
      date: todayDateStr,
      type: "DEBIT",
      category: "Company Asset EMI",
      description: "Manual EMI Payment (" + (emi.paidMonthsCount + 1) + "/" + emi.totalTenureMonths + ") for " + emi.productName,
      amount: emi.monthlyEMIAmount,
      currency: emi.currency,
      runningBalance: 0,
      referenceDocNo: "EMI-" + emi.id
    };
    setLedger(prev => [emiLedger, ...prev]);

    setCompanyEMIs(prev => prev.map(item => {
      if (item.id === emi.id) {
        const newPaidCount = item.paidMonthsCount + 1;
        const isCompleted = newPaidCount >= item.totalTenureMonths;
        return {
          ...item,
          paidMonthsCount: newPaidCount,
          lastProcessedMonth: currentMonthStr,
          status: isCompleted ? "COMPLETED" : "ACTIVE"
        };
      }
      return item;
    }));
  };

  const addSubscription = (sub: Omit<SubscriptionItem, "id" | "status">) => {
    const newSub: SubscriptionItem = {
      ...sub,
      id: "SUB-" + Date.now().toString().slice(-4),
      status: "ACTIVE"
    };
    setSubscriptions(prev => [newSub, ...prev]);
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  };

  const clearAllData = () => {
    setLeads([]);
    setDocuments([]);
    setPayments([]);
    setWriteOffs([]);
    setReceivableProvisions([]);
    setCompletedProjects([]);
    setProjectPLRecords([]);
    setPayables([]);
    setExpenses([]);
    setLedger([]);
    setGstRecords([]);
    setEmployees([]);
    setAttendance([]);
    setPayroll([]);
    setAmcContracts([]);
    setBankAccounts([]);
    setCryptoAccounts([]);
    setCompanyAssets([]);
    setEventRecords([]);
    setClientDocuments([]);
    setCompanyEMIs([]);
    setSubscriptions([]);
    setReserveProvision({ reservePercentage: 15, reserveReason: "Future Expansion & Emergency Fund" });
    [
      "aichainz_leads", "aichainz_documents", "aichainz_completed_projects",
      "aichainz_project_pl", "aichainz_payables", "aichainz_expenses",
      "aichainz_ledger", "aichainz_employees", "aichainz_payroll",
      "aichainz_amc", "aichainz_bank", "aichainz_crypto",
      "aichainz_assets", "aichainz_events", "aichainz_gst",
      "aichainz_reserve", "aichainz_attendance", "aichainz_client_documents",
      "aichainz_company_emis", "aichainz_subscriptions", "aichainz_payments",
      "aichainz_writeoffs", "aichainz_provisions"
    ].forEach(k => localStorage.removeItem(k));
  };


  const getProjectPLStatement = (targetProjId: string): DetailedProjectPL => {
    const projRecord = projectPLRecords.find(p => p.id === targetProjId || p.projectCode === targetProjId);
    const matchingDoc = documents.find(d => d.id === targetProjId || d.docNumber === targetProjId || d.clientCompany.toLowerCase().trim() === targetProjId.toLowerCase().trim());
    const matchingLead = leads.find(l => l.id === targetProjId || l.companyName.toLowerCase().trim() === targetProjId.toLowerCase().trim());

    const projCode = projRecord?.projectCode || matchingDoc?.docNumber || (matchingLead ? `PRJ-${matchingLead.companyName.slice(0, 4).toUpperCase()}` : targetProjId);
    const projName = projRecord?.projectName || matchingDoc?.items[0]?.description || matchingLead?.projectDescription || 'Project ' + targetProjId;
    const clientCompany = projRecord?.clientCompany || matchingDoc?.clientCompany || matchingLead?.companyName || 'Client';
    const clientName = projRecord?.clientName || matchingDoc?.clientName || matchingLead?.clientName || 'Client Rep';
    const baseQuotedPrice = projRecord?.quotedPrice || matchingDoc?.total || matchingLead?.value || 0;
    const baseAdvanceCollected = projRecord?.advanceCollected || (matchingDoc ? getInvoiceTotalPaid(matchingDoc.id) : 0);

    // 1. Revenue: Invoices linked to this project by leadId, quotationRef, docId, clientCompany, or projectCode
    const projInvoices = documents.filter(d => 
      d.docType === 'INVOICE' && (
        d.id === targetProjId ||
        d.docNumber === targetProjId ||
        d.leadId === targetProjId || 
        d.quotationRef === projCode || 
        d.id === projRecord?.docId || 
        d.docNumber === projRecord?.docId ||
        (d.clientCompany && clientCompany && d.clientCompany.toLowerCase().trim() === clientCompany.toLowerCase().trim())
      )
    );

    const invoicedRevenue = projInvoices.length > 0 
      ? projInvoices.reduce((sum, d) => sum + d.total, 0) 
      : baseQuotedPrice;

    const invoiceCashReceived = projInvoices.reduce((sum, d) => sum + getInvoiceTotalPaid(d.id), 0);
    const cashReceived = invoiceCashReceived > 0 ? invoiceCashReceived : baseAdvanceCollected;
    const receivableBalance = Math.max(0, invoicedRevenue - cashReceived);
    const contractValue = invoicedRevenue || baseQuotedPrice;

    // 2. Direct Expenses from Expenses table
    let employeeCost = 0;
    let freelancerCost = 0;
    let softwareCost = 0;
    let cloudCost = 0;
    let travelCost = 0;
    let accommodationCost = 0;
    let marketingCost = 0;
    let otherDirectExpenses = 0;

    const categoryTotals: Record<string, number> = {};

    expenses.forEach(exp => {
      let allocatedAmount = 0;
      if (exp.isMultiProject && exp.allocations) {
        const alloc = exp.allocations.find(a => a.projectId === targetProjId || a.projectCode === projCode);
        if (alloc) allocatedAmount = alloc.amount;
      } else if (
        exp.projectId === targetProjId || 
        exp.projectCode === projCode ||
        (exp.paidTo && clientCompany && exp.paidTo.toLowerCase().trim() === clientCompany.toLowerCase().trim()) ||
        (exp.notes && clientCompany && exp.notes.toLowerCase().includes(clientCompany.toLowerCase().trim()))
      ) {
        allocatedAmount = exp.amount;
      }

      if (allocatedAmount > 0) {
        const catName = exp.category || 'Other Direct Project Expenses';
        categoryTotals[catName] = (categoryTotals[catName] || 0) + allocatedAmount;

        const cLower = catName.toLowerCase().trim();
        if (cLower.includes('personnel') || cLower.includes('employee') || cLower.includes('salaries') || cLower.includes('payroll')) {
          employeeCost += allocatedAmount;
        } else if (cLower.includes('freelancer') || cLower.includes('contractor') || cLower.includes('subcontractor') || cLower.includes('sub-contractor')) {
          freelancerCost += allocatedAmount;
        } else if (cLower.includes('software') || cLower.includes('license') || cLower.includes('saas') || cLower.includes('tool')) {
          softwareCost += allocatedAmount;
        } else if (cLower.includes('cloud') || cLower.includes('api') || cLower.includes('infrastructure') || cLower.includes('hosting') || cLower.includes('server') || cLower.includes('aws')) {
          cloudCost += allocatedAmount;
        } else if (cLower.includes('travel') || cLower.includes('field')) {
          travelCost += allocatedAmount;
        } else if (cLower.includes('accommodation') || cLower.includes('hotel') || cLower.includes('lodging')) {
          accommodationCost += allocatedAmount;
        } else if (cLower.includes('marketing') || cLower.includes('lead') || cLower.includes('advertising') || cLower.includes('adwords')) {
          marketingCost += allocatedAmount;
        } else if (cLower.includes('other') || cLower.includes('misc') || cLower.includes('general')) {
          otherDirectExpenses += allocatedAmount;
        }
      }
    });

    // Plus labor cost from manual resources or recorded expenses
    if (projRecord) {
      if (projRecord.directExpenses > 0 && (cloudCost + softwareCost + freelancerCost + otherDirectExpenses) === 0) {
        otherDirectExpenses += projRecord.directExpenses;
        categoryTotals['Other Direct Project Expenses'] = (categoryTotals['Other Direct Project Expenses'] || 0) + projRecord.directExpenses;
      }
      if (projRecord.salaryCost > 0 && employeeCost === 0) {
        employeeCost += projRecord.salaryCost;
        categoryTotals['Personnel / Employee Cost'] = (categoryTotals['Personnel / Employee Cost'] || 0) + projRecord.salaryCost;
      }
      if (projRecord.resourcesInvolved) {
        const resourceLabor = projRecord.resourcesInvolved.reduce((sum, r) => sum + (r.totalLaborCost || 0), 0);
        if (employeeCost === 0 && resourceLabor > 0) {
          employeeCost += resourceLabor;
          categoryTotals['Personnel / Employee Resource Cost'] = (categoryTotals['Personnel / Employee Resource Cost'] || 0) + resourceLabor;
        }
      }
    }

    const customExpensesTotal = Object.entries(categoryTotals).reduce((sum, [cat, val]) => {
      const cLower = cat.toLowerCase().trim();
      const isStandard = ['personnel', 'employee', 'salaries', 'payroll', 'freelancer', 'contractor', 'subcontractor', 'software', 'license', 'saas', 'tool', 'cloud', 'api', 'infrastructure', 'hosting', 'server', 'aws', 'travel', 'field', 'accommodation', 'hotel', 'lodging', 'marketing', 'lead', 'advertising', 'other', 'misc', 'general'].some(kw => cLower.includes(kw));
      return isStandard ? sum : sum + val;
    }, 0);

    const categoryBreakdown = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount
    }));

    const totalDirectExpenses = employeeCost + freelancerCost + softwareCost + cloudCost + travelCost + accommodationCost + marketingCost + otherDirectExpenses + customExpensesTotal;
    const grossProfit = invoicedRevenue - totalDirectExpenses;
    const grossMarginPercent = invoicedRevenue > 0 ? (grossProfit / invoicedRevenue) * 100 : 0;

    const allocatedOverheads = Math.round(totalDirectExpenses * 0.10);
    const netProfit = grossProfit - allocatedOverheads;
    const netMarginPercent = invoicedRevenue > 0 ? (netProfit / invoicedRevenue) * 100 : 0;

    return {
      projectId: targetProjId,
      projectCode: projCode,
      projectName: projName,
      clientCompany,
      clientName,
      contractValue,
      invoicedRevenue,
      cashReceived,
      receivableBalance,
      employeeCost,
      freelancerCost,
      softwareCost,
      cloudCost,
      travelCost,
      accommodationCost,
      marketingCost,
      otherDirectExpenses,
      categoryBreakdown,
      totalDirectExpenses,
      grossProfit,
      grossMarginPercent,
      allocatedOverheads,
      netProfit,
      netMarginPercent
    };
  };

  const getCompanyPLStatement = (): CompanyPLStatement => {
    const projectKeyToIdMap = new Map<string, string>();

    // 1. Registered project records
    projectPLRecords.forEach(p => {
      const key = (p.clientCompany || p.projectName || p.id).toLowerCase().trim();
      projectKeyToIdMap.set(key, p.id);
    });

    // 2. Invoices (Priority over quotations to avoid duplicate rows for the same project)
    documents.filter(d => d.docType === 'INVOICE').forEach(d => {
      const key = (d.clientCompany || d.items[0]?.description || d.id).toLowerCase().trim();
      projectKeyToIdMap.set(key, d.id);
    });

    // 3. Quotations (Only if no invoice exists for that project yet)
    documents.filter(d => d.docType === 'QUOTATION').forEach(d => {
      const key = (d.clientCompany || d.items[0]?.description || d.id).toLowerCase().trim();
      if (!projectKeyToIdMap.has(key)) {
        projectKeyToIdMap.set(key, d.id);
      }
    });

    // 4. Leads (Only if no invoice/quotation exists yet)
    leads.forEach(l => {
      const key = (l.companyName || l.projectDescription || l.id).toLowerCase().trim();
      if (!projectKeyToIdMap.has(key)) {
        projectKeyToIdMap.set(key, l.id);
      }
    });

    const projectBreakdown = Array.from(projectKeyToIdMap.values())
      .map(id => getProjectPLStatement(id))
      .filter(p => p.invoicedRevenue > 0 || p.totalDirectExpenses > 0);
    
    const totalInvoicedRevenue = projectBreakdown.reduce((sum, p) => sum + p.invoicedRevenue, 0);
    const totalCashReceived = projectBreakdown.reduce((sum, p) => sum + p.cashReceived, 0);
    const totalReceivable = projectBreakdown.reduce((sum, p) => sum + p.receivableBalance, 0);
    const totalProjectDirectExpenses = projectBreakdown.reduce((sum, p) => sum + p.totalDirectExpenses, 0);
    const totalGrossProfit = totalInvoicedRevenue - totalProjectDirectExpenses;

    // Unallocated general company overheads
    const totalCompanyOverheads = expenses
      .filter(e => e.category === 'Company Overheads / Admin' || e.category === 'Office Expenses' || e.category === 'Misc')
      .reduce((sum, e) => sum + e.amount, 0);

    const netCompanyProfit = totalGrossProfit - totalCompanyOverheads;
    const companyProfitMargin = totalInvoicedRevenue > 0 ? (netCompanyProfit / totalInvoicedRevenue) * 100 : 0;

    return {
      totalInvoicedRevenue,
      totalCashReceived,
      totalReceivable,
      totalProjectDirectExpenses,
      totalGrossProfit,
      totalCompanyOverheads,
      netCompanyProfit,
      companyProfitMargin,
      projectBreakdown
    };
  };


  return (
    <AppContext.Provider
      value={{
        company: AICHAINZ_COMPANY,
        serviceCategories,
        addServiceCategory,
        expenseCategories,
        addExpenseCategory,
        leads,
        documents,
        payments,
        writeOffs,
        receivableProvisions,
        completedProjects,
        addCompletedProject,
        updateCompletedProject,
        projectPLRecords,
        addProjectPLRecord,
        updateProjectPLRecord,
        deleteProjectPLRecord,
        addPayment,
        convertQuotationToInvoice,
        writeOffReceivable,
        provisionReceivable,
        getInvoicePayments,
        getInvoiceTotalPaid,
        getInvoiceBalance,
        getReceivableSummary,
        getAgingReport,
        getProjectPLStatement,
        getCompanyPLStatement,
        recordAdvancePayment,
        payables,
        expenses,
        ledger,
        gstRecords,
        employees,
        attendance,
        payroll,
        amcContracts,
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
        eventRecords,
        addEventRecord,
        updateEventRecord,
        deleteEventRecord,
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
        clientDocuments,
        addClientDocument,
        deleteClientDocument,
        companyEMIs,
        addCompanyEMI,
        deleteCompanyEMI,
        processEMIDeduction,
        subscriptions,
        addSubscription,
        deleteSubscription,
        activeCurrency,
        setActiveCurrency,
        addLead,
        updateLeadStage,
        deleteLead,
        addDocument,
        updateDocument,
        updateDocumentStatus,
        deleteDocument,
        addAMCContract,
        updateAMCStatus,
        deleteAMCContract,
        addPayable,
        updatePayableStatus,
        addExpense,
        updateExpense,
        deleteExpense,
        updateLedgerEntry,
        deleteLedgerEntry,
        addEmployee,
        updateEmployee,
        toggleEmployeeStatus,
        updateEmployeeStatutory,
        addFreelancerTimeLog,
        markAttendance,
        bulkUpdateEmployeeAttendance,
        autoMarkMonthAttendance,
        generateMonthPayroll,
        addPayroll,
        updatePayrollStatus,
        formatCurrency,
        clearAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
