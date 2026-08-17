import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CompanyHeader } from '../CompanyHeader';
import { DigitalSignature } from '../DigitalSignature';
import { AichainzLogoWatermark } from '../AichainzLogoWatermark';
import { FileText, Printer, Sparkles, CheckCircle2, Send, MessageSquare, Mail, Globe, Download, Building2, ShieldCheck, Lock } from 'lucide-react';

export const BrandedLetterhead: React.FC = () => {
  const { company, employees, leads, formatCurrency } = useApp();

  const [letterType, setLetterType] = useState<'OFFER' | 'APPOINTMENT' | 'APPRAISAL' | 'RELIEVING' | 'EXPERIENCE' | 'NDA'>('OFFER');
  const [documentSubject, setDocumentSubject] = useState('OFFICIAL EMPLOYMENT OFFER LETTER');
  const [recipientName, setRecipientName] = useState('Sovereign Crypto Bank Ltd');
  const [clientAddress, setClientAddress] = useState('Kigali Innovation Hub, Rwanda / Dubai Internet City, UAE');
  const [designation, setDesignation] = useState('Senior AI Software Engineer');
  const [officeLocation, setOfficeLocation] = useState<'India' | 'UAE' | 'Rwanda'>('India');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // NDA Specific Editable Parameters
  const [advancePercentage, setAdvancePercentage] = useState(50);
  const [deliveryDays, setDeliveryDays] = useState(30);

  // Email Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState('Purusoth@aichainz.com');
  const [emailSubject, setEmailSubject] = useState('Official Corporate Letter from Aichainz');
  const [emailSuccessMessage, setEmailSuccessMessage] = useState('');

  // Appraisal specific state
  const [previousSalary, setPreviousSalary] = useState(100000);
  const [hikePercentage, setHikePercentage] = useState(20);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

  // Relieving specific state
  const [relievingDate, setRelievingDate] = useState(new Date().toISOString().split('T')[0]);
  const [clearanceStatus, setClearanceStatus] = useState('All Assets & Project Deliverables Handed Over');

  const revisedSalary = Math.round(previousSalary * (1 + hikePercentage / 100));

  // Generate Master 84-Section NDA & Software Terms Agreement Text
  const buildMasterNDAText = (
    cName: string,
    cAddr: string,
    advPct: number,
    days: number,
    effDate: string,
    loc: string
  ) => {
    const balPct = 100 - advPct;
    const jurisdiction = loc === 'India' ? 'India' : loc === 'UAE' ? 'Dubai, UAE' : 'Kigali, Rwanda';

    return `# NON-DISCLOSURE AGREEMENT, SOFTWARE DEVELOPMENT TERMS & CONDITIONS, INTELLECTUAL PROPERTY, PAYMENT, LIABILITY AND TOKEN SERVICES AGREEMENT

**Effective Date:** ${effDate}

This Non-Disclosure Agreement, Software Development Terms & Conditions, Intellectual Property, Payment, Liability and Token Services Agreement ("Agreement") is entered into as of the Effective Date by and between:

## 1. PARTIES

**SERVICE PROVIDER / COMPANY**
Aichainz (Enterprise AI & Software Engineering Solutions), incorporated under the laws of ${jurisdiction}, having registered offices at India (UDYAM-TN-03-0332279), UAE (Dubai Internet City Hub), and Rwanda (REG-2026-298019), hereinafter referred to as the "Company", "Service Provider", "Developer", or "Party A".

**AND**

**CLIENT**
${cName}, a company/entity/individual incorporated or established under the laws of ${jurisdiction}, having its registered office/address at ${cAddr}, hereinafter referred to as the "Client" or "Party B".

The Company and Client may individually be referred to as a "Party" and collectively as the "Parties".

---

## 2. PURPOSE OF ENGAGEMENT
The Client has engaged the Company to provide technology, software development, consulting, design, implementation, cloud, AI, blockchain, token, API, maintenance, support or other technology-related services as mutually agreed in writing.

The purpose of this Agreement is to:
1. protect the Company's confidential and proprietary information;
2. establish commercial and payment terms;
3. define the rights and responsibilities of the Parties;
4. protect the Company's intellectual property;
5. establish terms for websites, mobile applications, cloud applications, APIs, AI applications, blockchain, smart contracts and Tokens;
6. establish payment, advance, late-payment, suspension and termination rights;
7. establish limitations of liability;
8. establish Client indemnification obligations; and
9. establish the Client's responsibility for the use, operation and legality of the technology and services provided.

---

## 3. DEFINITIONS
3.1 Confidential Information: Any information disclosed by or on behalf of either Party that is confidential, proprietary, commercially sensitive or reasonably understood to be confidential.
3.2 Company Materials: All software, frameworks, libraries, templates, methodologies, tools, processes, documentation, know-how, architecture, designs, components, utilities, scripts, systems, algorithms, technology and intellectual property owned, developed or licensed by the Company before or independently of the Client project.
3.3 Deliverables: The specific software, applications, documentation, designs, configurations or other outputs expressly agreed to be delivered by the Company.
3.4 Client Content: All information, data, text, images, videos, documents, trademarks, logos, token information, financial information, user information and other materials supplied by the Client.
3.5 Third-Party Services: Services provided by third parties, including cloud providers, hosting providers, payment gateways, API providers, blockchain networks, wallet providers, exchanges, app stores, domain registrars, SMS providers, email providers, AI providers and other external platforms.
3.6 Change Request: Any request that changes the agreed scope, functionality, design, architecture, technology, integrations, requirements, timeline or Deliverables.
3.7 Token: Any cryptocurrency, digital token, virtual asset, digital asset, stablecoin, utility token, security token or other blockchain-based asset created, deployed, configured or supported as part of the engagement.

---

## 4. CONFIDENTIAL INFORMATION
Confidential Information includes, without limitation: Source code, Object code, Software architecture, UI/UX designs, Wireframes, Prototypes, Databases, Database schemas, APIs, API keys, Passwords, Cloud credentials, Administrator credentials, DevOps configurations, Deployment scripts, CI/CD pipelines, Infrastructure configurations, Business logic, Algorithms, Technical specifications, AI prompts, AI models, AI configurations, Blockchain architecture, Smart-contract source code, Wallet information, Token information, Technical documentation, Customer information, Vendor information, Pricing, Proposals, Commercial terms, Financial information, Business plans, Marketing plans, Product roadmaps, Security procedures, Trade secrets, Product strategies, Development methodologies, and Internal processes.

---

## 5. STRICT CONFIDENTIALITY OBLIGATIONS
The receiving Party shall:
1. use Confidential Information solely for the purposes of the engagement;
2. protect Confidential Information using reasonable and appropriate security measures;
3. restrict access to personnel who require access for legitimate business purposes;
4. prevent unauthorized copying, disclosure, distribution or publication;
5. immediately notify the disclosing Party of any suspected unauthorized access or disclosure; and
6. not use Confidential Information for its own competitive or commercial benefit outside the scope of this Agreement.

---

## 6. NO UNAUTHORIZED USE
The Client shall not use any Company Confidential Information, Company Materials, source code, architecture, methodology, software component, API, design, documentation or technical information for any purpose outside the agreed engagement without the Company's prior written consent. Any unauthorized use shall constitute a material breach of this Agreement.

---

## 7. NO COPYING, REVERSE ENGINEERING OR REPLICATION
Unless expressly permitted in writing, the Client shall not: reverse engineer; decompile; disassemble; reproduce; copy; modify; replicate; create derivative works from; resell; sublicense; distribute; or commercially exploit any Company-owned software, framework, methodology, technology, source code or proprietary material.

---

## 8. NO SHARING WITH THIRD PARTIES
The Client shall not disclose, transfer, distribute or provide Company Confidential Information to any third party without prior written authorization from the Company. Where access is required by personnel or advisors, the Client shall ensure that such person is bound by confidentiality obligations no less protective than those contained in this Agreement.

---

## 9. EMPLOYEE AND CONTRACTOR RESPONSIBILITY
Each Party shall ensure that its employees, contractors, consultants and representatives comply with this Agreement.

---

## 10. CYBERSECURITY AND CREDENTIAL PROTECTION
The Client shall be solely responsible for safeguarding credentials under its control, including Hosting credentials, Cloud credentials, Database credentials, Wallet credentials, Private keys, API keys, Administrator accounts, Domain accounts, Email accounts, Payment gateway credentials, and Third-party service credentials. The Company shall not be liable for losses arising from credentials compromised through Client negligence.

---

## 11. RETURN OR DELETION OF CONFIDENTIAL INFORMATION
Upon written request or termination of the engagement, each Party shall return or delete Confidential Information belonging to the other Party, except where retention is required by law, regulatory, accounting, or automated backup purposes.

---

## 12. DATA BREACH NOTIFICATION
Each Party shall notify the other Party without undue delay after becoming aware of a material security incident affecting the other Party's Confidential Information.

---

## 13. INTELLECTUAL PROPERTY OWNERSHIP
Unless expressly agreed otherwise in writing:
1. the Client retains ownership of Client Content;
2. the Company retains ownership of Company Materials;
3. pre-existing Company intellectual property remains the Company's property;
4. third-party intellectual property remains owned by its respective owner; and
5. ownership of custom Deliverables shall transfer only after receipt of all amounts due to the Company.

---

## 14. PRE-EXISTING COMPANY INTELLECTUAL PROPERTY
The Company retains all rights in Frameworks, Reusable modules, Libraries, Development tools, Templates, Methodologies, Know-how, Algorithms, Development processes, Technical architecture, DevOps systems, Generic AI components, Reusable APIs, Generic database structures, Internal tools, Pre-existing code, and Improvements to Company Materials.

---

## 15. THIRD-PARTY AND OPEN-SOURCE SOFTWARE
The Company may use third-party or open-source software where reasonably necessary. The Client agrees to comply with applicable third-party licenses.

---

## 16. CLIENT CONTENT AND INSTRUCTIONS
The Client represents and warrants that it has all necessary rights, licenses and permissions to provide Client Content and instructions to the Company.

---

## 17. WEB APPLICATION TERMS
The Company shall develop the web application according to the agreed written scope. Exclusions: unlimited revisions, third-party subscription costs, hosting fees, domain fees, SSL fees, payment gateway fees, third-party API charges, content creation, and regulatory approval.

---

## 18. MOBILE APPLICATION TERMS
Mobile applications shall be developed according to the agreed scope. The Company is not responsible for rejection, suspension or removal by Apple App Store, Google Play, or Huawei AppGallery.

---

## 19. CLOUD APPLICATION / SAAS TERMS
Cloud services depend upon third-party providers. The Company does not guarantee uninterrupted availability of third-party cloud services.

---

## 20. API AND INTEGRATION TERMS
Integrations depend upon third-party API availability. API changes by third parties may require additional billed development.

---

## 21. BLOCKCHAIN AND SMART-CONTRACT TERMS
Blockchain systems involve technological risks (network congestion, smart-contract vulnerabilities, front-running, MEV, gas-fee changes). The Company does not guarantee uninterrupted blockchain availability.

---

## 22. TOKEN DEVELOPMENT DISCLAIMER
The Company acts solely as a technology provider. The Company does not provide investment, financial, securities, legal, tax, or regulatory advice. The Client is solely responsible for regulatory compliance.

---

## 23. TOKEN MISUSE AND ILLEGAL ACTIVITIES
The Client shall not use any Token, smart contract, or software for fraud, money laundering, terrorist financing, sanctions violations, market manipulation, or illegal gambling.

---

## 24. NO GUARANTEE OF TOKEN VALUE, PRICE OR LIQUIDITY
The Company makes no representation or guarantee concerning Token price, market capitalization, liquidity, trading volume, exchange listing, or investor demand.

---

## 25. NO RESPONSIBILITY FOR CLIENT TOKEN OPERATIONS
After deployment, the Client is solely responsible for Token administration, wallet security, treasury management, liquidity, distribution, marketing, and exchange relationships.

---

## 26. CLIENT REGULATORY RESPONSIBILITY
The Client shall independently obtain all legal, regulatory, securities, financial, AML/KYC, privacy, and tax approvals required for its business.

---

## 27. NO RESPONSIBILITY FOR MISUSE OF DEVELOPED SOFTWARE
The Company shall not be responsible for any unauthorized, unlawful, fraudulent, or speculative misuse of delivered technology.

---

## 28. THIRD-PARTY PLATFORM DISCLAIMER
The Company is not liable for failures caused by AWS, Azure, Google Cloud, Apple, Google, MongoDB, payment gateways, blockchain networks, or wallet providers.

---

## 29. WALLET, EXCHANGE AND BLOCKCHAIN DISCLAIMER
The Company is not responsible for losses arising from lost private keys, compromised wallets, exchange delistings, or smart-contract exploits.

---

## 30. ADVANCE PAYMENT — ${advPct}%
The Client shall pay an advance equal to ${advPct}% of the total agreed project or service fees before commencement of development or services. Work commences only upon receipt of cleared funds.

---

## 31. NON-REFUNDABLE ADVANCE
The ${advPct}% advance payment is consideration for resource allocation, planning, architecture, design, and commencement of services. Once work has commenced, the ${advPct}% advance shall be non-refundable.

---

## 32. PRODUCT DELIVERY — ${days} DAYS
Subject to timely receipt of all Client dependencies, the Company shall deliver the agreed Product/Deliverables within ${days} DAYS from the date on which:
1. the Company receives the ${advPct}% advance payment in cleared funds; and
2. the Client provides all required information, content, approvals, credentials, access and materials.

---

## 33. BALANCE PAYMENT — ${balPct}%
The remaining ${balPct}% balance payment shall become due upon completion of agreed Deliverables and BEFORE final production deployment, source-code handover, or credentials release.

---

## 34. INVOICE DUE DATE
All invoices shall be payable within 15 calendar days from the invoice date.

---

## 35. LATE PAYMENT INTEREST
Undisputed overdue amounts accrue interest at 1.5% per month (or maximum lawful rate).

---

## 36. PAYMENT DELAY CHARGES
The Company may recover reasonable administrative and legal costs arising from prolonged non-payment.

---

## 37. SUSPENSION OF SERVICES FOR NON-PAYMENT
The Company may suspend development, deployment, hosting, maintenance, or support if invoices remain overdue.

---

## 38. PROJECT TIMELINE SUSPENSION
Client-caused payment, credential, or approval delays automatically extend the project delivery timeline.

---

## 39. REACTIVATION CHARGES
Suspensions exceeding 15 days may require a reasonable reactivation fee before recommencing work.

---

## 40. CHANGE REQUESTS / SCOPE CREEP
Features, integrations, or requirements outside the agreed written scope constitute additional work and will be separately quoted.

---

## 41. CLIENT DELAYS
The Client shall provide timely requirements, approvals, content, credentials, and feedback to avoid timeline extensions.

---

## 42. ACCEPTANCE AND DEEMED ACCEPTANCE
The Client shall review Deliverables within 7 business days of delivery. In the absence of written specific defect notices, Deliverables are deemed accepted.

---

## 43. WARRANTY AND BUG-FIX PERIOD
The Company provides a 30-day limited warranty period for correcting reproducible defects deviating from specifications.

---

## 44. MAINTENANCE AND SUPPORT
Maintenance and support shall be provided only if included under a separate written agreement.

---

## 45. THIRD-PARTY SERVICE CHARGES
The Client pays all third-party fees (hosting, domain, SSL, API, SMS, payment gateway, blockchain infrastructure, software licenses).

---

## 46. HOSTING AND CLOUD CHARGES
Cloud and hosting costs shall be paid by the Client.

---

## 47. DOMAIN, SSL, API AND SOFTWARE SUBSCRIPTION CHARGES
All recurring third-party costs are the Client's responsibility.

---

## 48. LIMITATION OF LIABILITY
The Company's aggregate liability shall not exceed the total professional/service fees actually received by the Company from the Client for the specific project during the 12-month period preceding the claim.

---

## 49. INDEMNIFICATION BY CLIENT
The Client shall indemnify, defend and hold harmless the Company against claims arising from Client Content, instructions, unlawful activities, regulatory violations, Token operations, or Agreement breach.

---

## 50. CLIENT INDEMNIFICATION FOR MISUSE
The Client indemnifies the Company against claims arising from software misuse or unauthorized modifications.

---

## 51. TOKEN-RELATED INDEMNIFICATION
The Client indemnifies the Company against claims arising from Token sales, distribution, marketing, liquidity, investor claims, or regulatory action.

---

## 52. EXCLUSION OF INDIRECT AND CONSEQUENTIAL DAMAGES
The Company shall not be liable for lost profits, lost revenue, indirect, consequential, or punitive damages.

---

## 53. CONFIDENTIALITY BREACH REMEDIES
A breach of confidentiality entitles the affected Party to seek injunctive or equitable relief.

---

## 54. INJUNCTIVE AND EQUITABLE RELIEF
Where breach threatens irreparable harm, the affected Party may seek interim court relief.

---

## 55. LIQUIDATED DAMAGES
Liquidated damages, where agreed, represent a reasonable pre-estimate of loss.

---

## 56. TERMINATION
Either Party may terminate by providing 30 days' written notice, subject to payment of all accrued fees.

---

## 57. TERMINATION FOR NON-PAYMENT
The Company may terminate if undisputed invoices remain unpaid for 7 days following written notice.

---

## 58. TERMINATION FOR CONFIDENTIALITY BREACH
The Company may immediately terminate services if the Client misuses Confidential Information or compromises IP.

---

## 59. EFFECT OF TERMINATION
Upon termination, all outstanding invoices become immediately payable, and Confidential Information must be returned or deleted.

---

## 60. SURVIVAL OF CONFIDENTIALITY OBLIGATIONS
Confidentiality obligations survive for 5 years following termination; trade secrets survive indefinitely.

---

## 61. FORCE MAJEURE
Neither Party is liable for failures caused by natural disasters, war, cyberattacks, power failures, or cloud outages.

---

## 62. THIRD-PARTY DEPENDENCIES
The Client acknowledges reliance on third-party infrastructure.

---

## 63. NO GUARANTEE OF UNINTERRUPTED AVAILABILITY
The Company does not guarantee uninterrupted availability or error-free operation.

---

## 64. COMPLIANCE WITH APPLICABLE LAWS
Each Party shall comply with laws applicable to its activities.

---

## 65. DISPUTE RESOLUTION
Parties shall first attempt 30-day good-faith negotiation before initiating legal proceedings.

---

## 66. GOVERNING LAW
Governed by the laws of ${jurisdiction}.

---

## 67. JURISDICTION
Courts located in ${jurisdiction} shall have jurisdiction over disputes.

---

## 68. NOTICES
Notices delivered via email or registered post.

---

## 69. ASSIGNMENT
Neither Party may assign without written consent, except Company assignments to affiliates or acquirers.

---

## 70. ENTIRE AGREEMENT
Constitutes the entire agreement between the Parties regarding the subject matter.

---

## 71. AMENDMENT
Amendments must be in writing and signed by authorized representatives.

---

## 72. SEVERABILITY
Invalid provisions shall be severed while remaining terms stay in force.

---

## 73. WAIVER
Failure to enforce any provision does not constitute a waiver.

---

## 74. COUNTERPARTS AND ELECTRONIC SIGNATURES
Executed electronically and in counterparts.

---

## 75. NO PARTNERSHIP OR AGENCY
Does not create a partnership, joint venture, or agency relationship.

---

## 76. AUTHORITY TO SIGN
Each signatory warrants full authority to bind their respective Party.

---

## 77. PROJECT SCOPE
Scope defined in accepted commercial quotations or purchase orders.

---

## 78. PRODUCT DELIVERY PERIOD (${days} DAYS)
Delivery period of ${days} DAYS commences upon receipt of ${advPct}% advance and all Client dependencies.

---

## 79. FINAL HANDOVER
Handover of production, code, or access occurs only after full payment.

---

## 80. CLIENT RESPONSIBILITIES
Client must provide timely requirements, credentials, testing feedback, legal compliance, and timely payments.

---

## 81. SPECIAL SOFTWARE AND TECHNOLOGY DISCLAIMER
Technology involves technical risks; software is not guaranteed error-free or immune from all cyberattacks.

---

## 82. CLIENT RESPONSIBILITY AFTER HANDOVER
Upon handover, Client assumes full operational responsibility for backups, users, credentials, and regulatory compliance.

---

## 83. SOURCE CODE AND HANDOVER
Source code released only after all invoices are paid in full.

---

## 84. FINAL ACKNOWLEDGEMENT
The Client acknowledges it has reviewed this Agreement, understands the non-refundable ${advPct}% advance payment requirement, delivery timeframe of ${days} DAYS, balance ${balPct}% requirement, IP terms, and Token disclaimers.

---

## SIGNATURES

**FOR THE COMPANY (PARTY A)**
Legal Name: Aichainz (Enterprise AI & Software Engineering Solutions)
Authorized Representative: Purusothaman K
Designation: Founder & CEO
Signature: Digital Signature Verified
Date: ${effDate}
Company Seal: Aichainz Corporate Seal (India / UAE / Rwanda)

**FOR THE CLIENT (PARTY B)**
Legal Name: ${cName}
Authorized Representative: ______________________________
Designation: ______________________________
Signature: ______________________________
Date: ______________________________
Company Seal: ______________________________`;
  };

  const [bodyText, setBodyText] = useState('');

  useEffect(() => {
    if (letterType === 'NDA') {
      setDocumentSubject('MASTER NDA, SOFTWARE TERMS, IP & TOKEN SERVICES AGREEMENT');
      setBodyText(buildMasterNDAText(recipientName, clientAddress, advancePercentage, deliveryDays, date, officeLocation));
    }
  }, [letterType, recipientName, clientAddress, advancePercentage, deliveryDays, date, officeLocation]);

  const handleTemplateSelect = (type: 'OFFER' | 'APPOINTMENT' | 'APPRAISAL' | 'RELIEVING' | 'EXPERIENCE' | 'NDA') => {
    setLetterType(type);
    if (type === 'OFFER') {
      setDocumentSubject('OFFICIAL EMPLOYMENT OFFER LETTER');
      setBodyText(`Dear Candidate,

On behalf of Aichainz (Enterprise AI & Software Engineering Solutions), we are thrilled to issue this official Offer Letter for the position of Senior AI Software Engineer.

Your compensation is fixed at ${formatCurrency(previousSalary)} per month subject to statutory deductions (ESI, PF, Income Tax, Professional Tax). You will report directly to the Founder & CEO office and participate in developing AI algorithms across India, UAE, and Rwanda hubs.

Please sign and return a copy of this offer letter to Purusoth@aichainz.com within 5 business days.`);
    } else if (type === 'APPOINTMENT') {
      setDocumentSubject('OFFICIAL APPOINTMENT LETTER');
      setBodyText(`Dear Candidate,

We are pleased to formally appoint you as Senior AI Software Engineer at Aichainz with effect from ${date}.

1. Probation: You will undergo a 3-month probation period evaluating technical proficiency and team collaboration.
2. Confidentiality: You will be bound by Aichainz strict Non-Disclosure Protocols and IP ownership rules.
3. Code Quality: All code authored under Aichainz is proprietary intellectual property.`);
    } else if (type === 'APPRAISAL') {
      setDocumentSubject('SALARY APPRAISAL & PROMOTION LETTER');
      setBodyText(`Dear Staff Representative,

We are delighted to communicate your annual performance appraisal and compensation review effective from ${effectiveDate}.

- Previous Base Monthly Salary: ${formatCurrency(previousSalary)}
- Performance Hike Percentage: ${hikePercentage}%
- Revised Monthly Base Salary: ${formatCurrency(revisedSalary)}

Your exceptional contribution to Aichainz software solutions has been exemplary. We look forward to your continued leadership.`);
    } else if (type === 'RELIEVING') {
      setDocumentSubject('RELIEVING LETTER & NO OBJECTION CERTIFICATE');
      setBodyText(`Dear Staff Representative,

This is to certify that you served as Senior AI Software Engineer at Aichainz until ${relievingDate}.

1. Clearance Status: ${clearanceStatus}
2. Settlement: All financial dues and final settlements have been fully cleared.
3. Conduct: During your tenure, your performance and professional conduct were exemplary.

We extend our best wishes for your future endeavors.`);
    } else if (type === 'EXPERIENCE') {
      setDocumentSubject('WORK EXPERIENCE CERTIFICATE');
      setBodyText(`TO WHOM IT MAY CONCERN

This is to certify that Candidate Representative was employed with Aichainz as Senior AI Software Engineer from ${date}.

During their tenure, they demonstrated deep technical expertise in Web3, Smart Contracts, and Enterprise Artificial Intelligence solutions. We wish them all success.`);
    } else if (type === 'NDA') {
      setDocumentSubject('MASTER NDA, SOFTWARE TERMS, IP & TOKEN SERVICES AGREEMENT');
      setBodyText(buildMasterNDAText(recipientName, clientAddress, advancePercentage, deliveryDays, date, officeLocation));
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `*AICHAINZ CORPORATE LETTER*\n` +
      `Document: *${documentSubject}*\n` +
      `Recipient / Client: *${recipientName}*\n` +
      `Date: ${date}\n` +
      `Website: www.aichainz.com\n\n` +
      `Verified Official Corporate Document issued by Founder & CEO Office, Aichainz.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSuccessMessage(`Letter sent successfully to ${emailTo}!`);
    setTimeout(() => {
      setEmailSuccessMessage('');
      setShowEmailModal(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" /> Aichainz Master NDA & Corporate Letterhead Suite
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Standardized 84-Section Master NDA, IP, Token & Software Terms + Offer, Relieving NOC, & Appraisal Letters with www.aichainz.com.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleWhatsAppShare}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <MessageSquare className="w-4 h-4" /> WhatsApp
          </button>
          <button
            onClick={() => {
              setEmailSubject(`${documentSubject} - ${recipientName}`);
              setShowEmailModal(true);
            }}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-purple-600/20"
          >
            <Mail className="w-4 h-4" /> Email
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md"
          >
            <Download className="w-4 h-4" /> PDF / Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Controls (4 Cols) */}
        <div className="lg:col-span-4 space-y-4 no-print">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Sparkles className="w-4 h-4 text-blue-600" /> Select Document Template
            </h3>

            {/* Template Buttons */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              {[
                { id: 'NDA', label: '84-Section Master NDA' },
                { id: 'OFFER', label: 'Offer Letter' },
                { id: 'APPOINTMENT', label: 'Appointment' },
                { id: 'APPRAISAL', label: 'Salary Hike %' },
                { id: 'RELIEVING', label: 'Relieving & NOC' },
                { id: 'EXPERIENCE', label: 'Experience Cert' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateSelect(t.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    letterType === t.id
                      ? 'bg-blue-50 border-blue-600 text-blue-700 font-extrabold ring-2 ring-blue-500/10'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Client Directory Quick Selector */}
            {letterType === 'NDA' && (
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 space-y-2 text-xs">
                <label className="block text-blue-900 font-black">Quick Pre-fill from Client Directory</label>
                <select
                  onChange={(e) => {
                    const matchedLead = leads.find(l => l.companyName === e.target.value);
                    if (matchedLead) {
                      setRecipientName(matchedLead.companyName);
                      setClientAddress(`${matchedLead.office} Regional Office Jurisdiction`);
                    }
                  }}
                  className="w-full bg-white border border-blue-300 rounded-lg p-2 font-bold"
                >
                  <option value="">Select Existing Client...</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.companyName}>{l.companyName} ({l.clientName})</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-slate-700 text-xs mb-1 font-bold">Document Subject Title</label>
              <input
                type="text"
                value={documentSubject}
                onChange={(e) => setDocumentSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-extrabold focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 text-xs mb-1 font-bold">
                {letterType === 'NDA' ? 'Client Legal Name (Party B)' : 'Recipient / Candidate Name'}
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none"
              />
            </div>

            {/* NDA Specific Form Controls */}
            {letterType === 'NDA' && (
              <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-200 space-y-3">
                <p className="text-[11px] font-black text-purple-900 uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" /> Dynamic Master Terms Parameters
                </p>

                <div>
                  <label className="block text-slate-700 text-[11px] mb-1 font-bold">Client Full Address & Jurisdiction</label>
                  <input
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full bg-white border border-purple-300 rounded-lg p-2 text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Advance Payment %</label>
                    <input
                      type="number"
                      value={advancePercentage}
                      onChange={(e) => setAdvancePercentage(Number(e.target.value))}
                      className="w-full bg-white border border-purple-300 rounded-lg p-2 font-mono font-bold text-purple-900 text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Delivery Period (Days)</label>
                    <input
                      type="number"
                      value={deliveryDays}
                      onChange={(e) => setDeliveryDays(Number(e.target.value))}
                      className="w-full bg-white border border-purple-300 rounded-lg p-2 font-mono font-bold text-blue-900 text-center"
                    />
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-purple-200 text-[10.5px] font-bold text-purple-900 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Non-Refundable Advance:</span>
                    <span className="font-mono">{advancePercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Balance Final Payment:</span>
                    <span className="font-mono">{100 - advancePercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Product Delivery Window:</span>
                    <span className="font-mono">{deliveryDays} DAYS</span>
                  </div>
                </div>
              </div>
            )}

            {letterType !== 'NDA' && (
              <div>
                <label className="block text-slate-700 text-xs mb-1 font-bold">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 text-xs mb-1 font-bold">Effective / Issue Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-mono font-bold focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 text-xs mb-1 font-bold">Branch Jurisdiction</label>
                <select
                  value={officeLocation}
                  onChange={(e) => setOfficeLocation(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:outline-none"
                >
                  <option value="India">India</option>
                  <option value="UAE">UAE</option>
                  <option value="Rwanda">Rwanda</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-xs mb-1 font-bold">Letter Body Content Preview & Edit</label>
              <textarea
                rows={12}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-sans leading-relaxed resize-none focus:bg-white focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right Printable Letterhead Paper View (8 Cols) */}
        <div className="lg:col-span-8">
          <div className="bg-slate-200/60 p-4 rounded-2xl border border-slate-300 max-h-[85vh] overflow-y-auto shadow-inner no-print-scroll">
            <div className="document-paper rounded-2xl printable-area shadow-2xl space-y-6">
              {/* WATERMARK LOGO */}
              <div className="watermark-bg">
                <AichainzLogoWatermark size={280} />
              </div>

              <div className="relative z-10 flex flex-col justify-between space-y-6">
                <div>
                  {/* Official Aichainz Header with www.aichainz.com */}
                  <CompanyHeader
                    documentTitle="OFFICIAL MEMORANDUM & AGREEMENT"
                    subtitle={`Date: ${date}`}
                  />

                  {/* Subject Bar */}
                  <div className="my-4 pb-2 border-b border-slate-300">
                    <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">SUBJECT:</p>
                    <h3 className="text-base font-black text-blue-800 uppercase">{documentSubject}</h3>
                  </div>

                  {/* High-Contrast Crisp Black Letter Content */}
                  <div className="text-xs text-slate-900 leading-relaxed whitespace-pre-wrap font-sans font-medium space-y-4">
                    {bodyText}
                  </div>
                </div>

                {/* Digital Signature & Footer Website */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <DigitalSignature date={date} />
                  <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-[9.5px] text-slate-600 font-bold">
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
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">Email Official Document</h3>
              <button onClick={() => setShowEmailModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            {emailSuccessMessage ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 font-bold rounded-xl text-xs flex items-center gap-2 border border-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> {emailSuccessMessage}
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Recipient Email Address</label>
                  <input
                    type="email"
                    required
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Email Subject</label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowEmailModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-purple-600 text-white font-extrabold rounded-xl shadow-md flex items-center gap-1.5">
                    <Send className="w-4 h-4" /> Send Email
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
