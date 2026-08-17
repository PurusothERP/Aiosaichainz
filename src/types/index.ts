export type Currency = 'INR' | 'USD' | 'AED' | 'RWF';

export type LeadStage = 'NEW' | 'CONTACTED' | 'PROPOSAL_SENT' | 'IN_PROGRESS' | 'COMPLETED' | 'LOST';

export interface Lead {
  id: string;
  clientName: string;
  companyName: string;
  email: string;
  phone: string;
  office: 'India' | 'UAE' | 'Rwanda';
  stage: LeadStage;
  value: number;
  currency: Currency;
  projectDescription: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  serviceCategory?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export type DocumentType = 'QUOTATION' | 'INVOICE';

export type DocumentStatus =
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CONVERTED'
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'UNCOLLECTIBLE'
  | 'UNRECOVERABLE'
  | 'CANCELLED';

export interface BusinessDocument {
  id: string;
  docType: DocumentType;
  docNumber: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientGST?: string;
  officeLocation: 'India' | 'UAE' | 'Rwanda';
  issueDate: string;
  dueDate: string;
  validUntil?: string;
  quotationRef?: string;
  items: DocumentItem[];
  subtotal: number;
  hasGST: boolean;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  currency: Currency;
  status: DocumentStatus;
  notes: string;
  terms: string;
  advancePercentage?: number;
  agreementRequired?: boolean;
  leadId?: string;
  unrecoverableReason?: string;
  advanceCollectedAmount?: number;
  advancePaymentDate?: string;
  advancePaymentMethod?: string;
  advanceRefNo?: string;
  balanceDueDate?: string;
}

export type PaymentMethod = 'Bank Transfer' | 'UPI' | 'Cash' | 'Crypto' | 'Cheque' | 'Card' | 'Wire';
export type PaymentType = 'ADVANCE' | 'PARTIAL' | 'FINAL' | 'EXCESS';

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNo: string;
  clientName: string;
  clientCompany: string;
  date: string;
  amount: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  bankAccountId?: string;
  referenceNo?: string;
  notes?: string;
  type: PaymentType;
}

export interface WriteOff {
  id: string;
  invoiceId: string;
  invoiceNo: string;
  clientName: string;
  clientCompany: string;
  date: string;
  amount: number;
  currency: Currency;
  reason: 'Client Default' | 'Dispute' | 'Insolvency' | 'Uncollectible' | 'Other';
  notes?: string;
  performedBy: string;
  supportingDocUrl?: string;
}

export interface ReceivableProvision {
  id: string;
  invoiceId: string;
  invoiceNo: string;
  clientName: string;
  clientCompany: string;
  date: string;
  provisionAmount: number;
  currency: Currency;
  reason: string;
  notes?: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: 'DEBIT' | 'CREDIT';
  category: string;
  description: string;
  amount: number;
  currency: Currency;
  runningBalance: number;
  referenceDocNo?: string;
  debitAccount?: string;
  creditAccount?: string;
  paymentId?: string;
  writeOffId?: string;
}

export interface ProjectResource {
  employeeId?: string;
  name: string;
  role: string;
  hoursAllocated: number;
  costRatePerHour: number;
  totalLaborCost: number;
}

export interface ProjectPLRecord {
  id: string;
  projectCode: string;
  projectName: string;
  clientCompany: string;
  clientName: string;
  leadId?: string;
  docId?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  startDate: string;
  targetCompletionDate?: string;
  actualCompletionDate?: string;
  quotedPrice: number;
  advanceCollected: number;
  balanceReceivable: number;
  directExpenses: number;
  salaryCost: number;
  actualSpend: number;
  netProfit: number;
  profitMarginPercent: number;
  markupPercent: number;
  quotationItems?: DocumentItem[];
  totalDaysTaken: number;
  estimatedHours: number;
  actualHoursTaken: number;
  resourcesInvolved: ProjectResource[];
  currency: Currency;
  notes?: string;
}

export type AMCStatus = 'ACTIVE' | 'UPCOMING_RENEWAL' | 'EXPIRED' | 'CANCELLED';

export interface AMCContract {
  id: string;
  contractNumber: string;
  clientCompany: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectName: string;
  officeLocation: 'India' | 'UAE' | 'Rwanda';
  startDate: string;
  endDate: string;
  annualAmount: number;
  currency: Currency;
  billingCycle: 'Annual' | 'Quarterly' | 'Monthly';
  status: AMCStatus;
  scopeNotes: string;
  autoRenew: boolean;
}

export interface CompletedProject {
  id: string;
  invoiceId: string;
  invoiceNo: string;
  clientCompany: string;
  clientName: string;
  officeLocation: 'India' | 'UAE' | 'Rwanda';
  quotationItems: string[];
  websiteUrl: string;
  tokenContractAddress: string;
  githubLink: string;
  sourceCodeFileName: string;
  completionDate: string;
  totalAmount: number;
  currency: Currency;
}

export interface Payable {
  id: string;
  vendorName: string;
  invoiceNumber: string;
  category: 'Freelancer' | 'Software License' | 'Cloud Infrastructure' | 'Office Rent' | 'Hardware' | 'Utility' | 'Other';
  amount: number;
  currency: Currency;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'PARTIAL';
  description: string;
  officeLocation: 'India' | 'UAE' | 'Rwanda';
}



export interface GSTEntry {
  id: string;
  invoiceNo: string;
  clientName: string;
  date: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGST: number;
  currency: Currency;
  gstin: string;
}

export type EmployeeType = 'FULL_TIME' | 'FREELANCER';

export interface FreelancerTimeLog {
  id: string;
  date: string;
  hours: number;
  taskDescription: string;
}

export interface Employee {
  id: string;
  name: string;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  email: string;
  phone: string;
  address?: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  type: EmployeeType;
  department?: string;
  designation: string;
  officeLocation: 'India' | 'UAE' | 'Rwanda';
  reportingManager?: string;
  joinedDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PROBATION' | 'NOTICE_PERIOD';
  monthlySalary: number;
  hourlyRate: number;
  currency: Currency;
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  paymentMethod?: 'Bank Transfer' | 'UPI' | 'Wise / Crypto Transfer' | 'Cash';
  bankDetails: string;
  panNumber?: string;
  aadhaarNumber?: string;
  uanNumber?: string;
  esiNumber?: string;
  esiEnabled: boolean;
  pfEnabled: boolean;
  incomeTaxEnabled: boolean;
  professionalTaxEnabled: boolean;
  freelancerTaxEnabled?: boolean;
  timeLogs?: FreelancerTimeLog[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE' | 'HOLIDAY_WEEKEND';
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeType: EmployeeType;
  month: string;
  baseAmount: number;
  totalHoursWorked?: number;
  bonus: number;
  esiDeduction: number;
  pfDeduction: number;
  incomeTaxDeduction: number;
  ptDeduction: number;
  freelancerTaxDeduction: number;
  totalDeductions: number;
  netPayable: number;
  currency: Currency;
  status: 'PROCESSED' | 'PAID' | 'PENDING';
  paymentDate?: string;
  bankDetails: string;
}

export interface CompanyDetails {
  name: string;
  tagline: string;
  offices: string[];
  indiaRegNo: string;
  indiaGST: string;
  rwandaRegNo: string;
  phoneWhatsApp: string;
  primaryEmail: string;
  secondaryEmail: string;
  websiteUrl: string;
  signatoryName: string;
  signatoryTitle: string;
}

export interface BankAccount {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchLocation: string;
  balanceINR: number;
  currency: Currency;
  isPrimary: boolean;
}

export interface CryptoVaultAccount {
  id: string;
  vaultName: string;
  assetType: 'USDT' | 'USDC' | 'BTC' | 'ETH' | 'SOL';
  walletAddress: string;
  balanceCrypto: number;
  usdRateINR: number;
  totalINRValue: number;
  network: string;
}

export type AssetCategory = 'LAPTOP' | 'TABLET' | 'MOBILE' | 'GPU_SERVER' | 'HARDWARE_WALLET' | 'OFFICE_TECH';
export type AssetStatus = 'ACTIVE_IN_USE' | 'IN_STOCK' | 'UNDER_REPAIR' | 'RETIRED';

export interface CompanyAsset {
  id: string;
  assetTag: string;
  assetName: string;
  category: AssetCategory;
  serialNumber: string;
  assignedToEmployeeName?: string;
  officeLocation: 'India' | 'UAE' | 'Rwanda';
  purchaseDate: string;
  purchaseCostINR: number;
  status: AssetStatus;
  notes?: string;
}

export interface ReserveProvision {
  reservePercentage: number;
  reserveReason: string;
}

export interface EventTravelRecord {
  id: string;
  eventName: string;
  startDate: string;
  endDate: string;
  location: string;
  personsTraveledCount: number;
  travelerNames?: string[];
  entryFeeINR: number;
  travelAccommodationCostINR: number;
  totalSpendINR: number;
  description: string;
  outcomeLeadsCount: number;
  businessRevenueINR: number;
  netProfitINR: number;
  isProfitable: boolean;
  officeLocation: 'India' | 'UAE' | 'Rwanda';
}

export interface ClientDocument {
  id: string;
  clientCompany: string;
  clientName: string;
  documentTitle: string;
  category: 'Contract' | 'MoU' | 'SLA' | 'Technical Architecture' | 'GST Certificate' | 'NDA' | 'Google Drive Assets' | 'Other';
  description: string;
  documentUrl: string;
  uploadedDate: string;
}

export interface CompanyEMI {
  id: string;
  productName: string;
  monthlyEMIAmount: number;
  currency: Currency;
  totalTenureMonths: number;
  paidMonthsCount: number;
  paymentDayOfMonth: number;
  startDate: string;
  vendorName: string;
  bankAccountId?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  lastProcessedMonth?: string;
}

export interface SubscriptionItem {
  id: string;
  productName: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  amount: number;
  currency: Currency;
  renewalDueDate: string;
  vendorName: string;
  paymentMethod: string;
  bankAccountId?: string;
  status: 'ACTIVE' | 'CANCELLED';
  lastProcessedDate?: string;
}

export interface AgingBracket {
  invoiceId: string;
  invoiceNo: string;
  clientName: string;
  clientCompany: string;
  invoiceTotal: number;
  totalPaid: number;
  balance: number;
  daysOverdue: number;
  bracket: '0-30' | '31-60' | '61-90' | '90+';
}

export interface ReceivableSummary {
  totalReceivable: number;
  overdueReceivable: number;
  currentReceivable: number;
  bracket0_30: number;
  bracket31_60: number;
  bracket61_90: number;
  bracket90plus: number;
}


export type ExpenseCategory =
  | 'Personnel / Employee Cost'
  | 'Freelancer / Contractor'
  | 'Software & Licenses'
  | 'Cloud & Hosting'
  | 'Hardware'
  | 'Travel'
  | 'Accommodation'
  | 'Marketing'
  | 'Subcontractor'
  | 'Materials'
  | 'Professional Fees'
  | 'Bank Charges'
  | 'Taxes'
  | 'Office Expenses'
  | 'Other Direct Expenses'
  | 'Company Overheads / Admin'
  | 'Salaries'
  | 'Freelancer Payouts'
  | 'Infrastructure'
  | 'Software'
  | 'Office Expenses'
  | 'Misc';

export interface ProjectExpenseAllocation {
  projectId: string;
  projectCode: string;
  projectName: string;
  amount: number;
  percentage: number;
}

export interface EmployeeProjectAllocation {
  projectId: string;
  projectCode: string;
  projectName: string;
  percentage: number;
  allocatedCost: number;
}

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  taxAmount?: number;
  totalAmount?: number;
  currency: Currency;
  date: string;
  paidTo: string;
  paymentMode: 'Bank Transfer' | 'UPI' | 'Credit Card' | 'Cash' | 'Corporate Card';
  paymentStatus?: 'PAID' | 'PAYABLE';
  bankAccountId?: string;
  officeLocation: 'India' | 'UAE' | 'Rwanda';
  referenceNo?: string;
  projectCode?: string;
  projectId?: string;
  isMultiProject?: boolean;
  allocations?: ProjectExpenseAllocation[];
  notes?: string;
}

export interface DetailedProjectPL {
  projectId: string;
  projectCode: string;
  projectName: string;
  clientCompany: string;
  clientName: string;
  contractValue: number;
  invoicedRevenue: number;
  cashReceived: number;
  receivableBalance: number;
  
  // Direct Expense Breakdown
  employeeCost: number;
  freelancerCost: number;
  softwareCost: number;
  cloudCost: number;
  travelCost: number;
  accommodationCost: number;
  marketingCost: number;
  otherDirectExpenses: number;
  categoryBreakdown?: { category: string; amount: number }[];
  totalDirectExpenses: number;
  
  grossProfit: number;
  grossMarginPercent: number;
  
  // Overheads
  allocatedOverheads: number;
  netProfit: number;
  netMarginPercent: number;
}

export interface CompanyPLStatement {
  totalInvoicedRevenue: number;
  totalCashReceived: number;
  totalReceivable: number;
  totalProjectDirectExpenses: number;
  totalGrossProfit: number;
  totalCompanyOverheads: number;
  netCompanyProfit: number;
  companyProfitMargin: number;
  projectBreakdown: DetailedProjectPL[];
}

export interface CEOExpenseRecord {
  id: string;
  date: string;
  category: string;
  item: string;
  quantity: number;
  description: string;
  amount: number;
  bankAccountId?: string;
  bankAccountName?: string;
  paidTo: string;
  paymentMode: string;
  notes?: string;
  createdAt: string;
}

export interface CEOIncomeRecord {
  id: string;
  date: string;
  category: string;
  sourceTitle: string;
  amount: number;
  bankAccountId?: string;
  bankAccountName?: string;
  receivedFrom: string;
  paymentMode: string;
  notes?: string;
  createdAt: string;
}

export interface CEOFixedDepositRecord {
  id: string;
  depositTitle: string;
  bankName: string;
  principalAmount: number;
  interestRatePercent: number;
  tenureMonths: number;
  compoundingFrequency: 'QUARTERLY' | 'ANNUAL' | 'SIMPLE';
  depositDate: string;
  maturityDate: string;
  expectedInterestEarned1Year: number;
  expectedMaturityValue: number;
  bankAccountId?: string;
  status: 'ACTIVE' | 'MATURED' | 'RENEWED';
  notes?: string;
  createdAt: string;
}
