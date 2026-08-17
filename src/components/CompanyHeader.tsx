import React from 'react';
import { AICHAINZ_COMPANY } from '../context/AppContext';
import { AichainzLogo } from './AichainzLogo';
import { ShieldCheck, Building2, Mail, Phone, Globe } from 'lucide-react';

interface Props {
  documentTitle?: string;
  subtitle?: string;
}

export const CompanyHeader: React.FC<Props> = ({ documentTitle, subtitle }) => {
  return (
    <div className="border-b border-slate-300 pb-2 mb-2 relative z-10">
      {/* Top Blue Corporate Header Stripe */}
      <div className="h-1.5 bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 rounded-full mb-2"></div>

      {/* Main Branding Bar */}
      <div className="flex justify-between items-center gap-2">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <AichainzLogo size={38} />
        </div>

        {/* Corporate Title Badge */}
        {documentTitle && (
          <div className="text-right max-w-[60%]">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50/90 text-blue-800 font-extrabold text-[8.5px] rounded-md uppercase tracking-wider border border-blue-200 shadow-2xs mb-0.5">
              <ShieldCheck className="w-2.5 h-2.5 text-blue-600" /> VERIFIED CORPORATE DOCUMENT
            </span>
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-900 leading-tight truncate">
              {documentTitle}
            </h2>
            {subtitle && <p className="text-[9.5px] text-slate-600 font-bold font-mono truncate">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Multi-Office Registration Grid */}
      <div className="grid grid-cols-3 gap-2 mt-2 pt-1.5 text-[9px]">
        <div className="bg-slate-50/90 p-1.5 rounded-lg border border-slate-200/90 shadow-2xs">
          <p className="font-extrabold text-slate-900 flex items-center gap-1">
            <Building2 className="w-2.5 h-2.5 text-blue-600" /> India Regional Office
          </p>
          <p className="text-slate-600">UDYAM: <span className="font-mono font-bold text-slate-900">{AICHAINZ_COMPANY.indiaRegNo}</span></p>
          <p className="text-slate-600">GSTIN: <span className="font-mono font-bold text-slate-900">{AICHAINZ_COMPANY.indiaGST}</span></p>
        </div>

        <div className="bg-slate-50/90 p-1.5 rounded-lg border border-slate-200/90 shadow-2xs">
          <p className="font-extrabold text-slate-900 flex items-center gap-1">
            <Globe className="w-2.5 h-2.5 text-emerald-600" /> Web & Global Hubs
          </p>
          <p className="text-blue-700 font-black flex items-center gap-1">
            <Globe className="w-2.5 h-2.5 text-blue-600" /> {AICHAINZ_COMPANY.websiteUrl}
          </p>
          <p className="text-slate-600">Rwanda Reg: <span className="font-mono font-bold text-slate-900">{AICHAINZ_COMPANY.rwandaRegNo}</span></p>
        </div>

        <div className="bg-slate-50/90 p-1.5 rounded-lg border border-slate-200/90 shadow-2xs">
          <p className="font-extrabold text-slate-900 flex items-center gap-1">
            <Mail className="w-2.5 h-2.5 text-purple-600" /> Contact & Support
          </p>
          <p className="text-slate-600 font-bold flex items-center gap-1">
            <Phone className="w-2.5 h-2.5 text-emerald-600" /> Ph: {AICHAINZ_COMPANY.phoneWhatsApp}
          </p>
          <p className="text-slate-600 font-bold truncate">Email: {AICHAINZ_COMPANY.primaryEmail}</p>
        </div>
      </div>
    </div>
  );
};
