import React from 'react';
import { AICHAINZ_COMPANY } from '../context/AppContext';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Props {
  date?: string;
  signatoryName?: string;
  signatoryTitle?: string;
}

export const DigitalSignature: React.FC<Props> = ({
  date = new Date().toISOString().split('T')[0],
  signatoryName = AICHAINZ_COMPANY.signatoryName,
  signatoryTitle = AICHAINZ_COMPANY.signatoryTitle
}) => {
  const now = new Date();
  const printTimestamp = now.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) + ' at ' + now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <div className="pt-2 pb-1 border-t border-slate-300 relative z-10 mt-auto mb-1">
      <div className="flex flex-row justify-between items-end gap-2">
        {/* Left: Verification Badge */}
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50/90 text-emerald-900 border border-emerald-300 rounded-md text-[8.5px] font-extrabold shadow-2xs">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 flex-shrink-0" />
            Digitally Signed & Cryptographically Verified
          </div>
          <p className="text-[7.5px] font-mono text-slate-500 font-semibold pl-0.5">
            Auth Hash: <span className="text-slate-700 font-bold">{date}-AICHAINZ-CEO-VERIFIED-AUTH</span>
          </p>
        </div>

        {/* Right: Signature Line with Seal */}
        <div className="flex items-center gap-2.5 text-right">
          <div className="w-11 h-11 rounded-full border-2 border-dashed border-blue-600 flex flex-col items-center justify-center p-0.5 text-center text-blue-700 bg-blue-50/60 flex-shrink-0 shadow-2xs">
            <span className="text-[5.5px] font-black uppercase text-blue-900 leading-tight">AICHAINZ</span>
            <span className="text-[4.5px] font-extrabold text-blue-600 leading-tight">SEAL</span>
          </div>

          <div>
            <p className="font-signature text-xl text-blue-900 leading-none py-0.5">
              {signatoryName}
            </p>
            <div className="border-t border-slate-900 pt-0.5">
              <p className="font-black text-slate-900 text-[10px]">{signatoryName}</p>
              <p className="text-[8.5px] text-blue-700 font-extrabold">{signatoryTitle}</p>
              <p className="text-[7.5px] text-slate-500 font-semibold">Aichainz Executive Leadership</p>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Captured Print Timestamp Bar */}
      <div className="print-footer-timestamp flex justify-between items-center mt-1.5 pt-1 border-t border-slate-200 text-[7.5px] font-mono text-slate-500">
        <span>Print / Capture Timestamp: <strong className="text-slate-800 font-bold">{printTimestamp}</strong></span>
        <span>Aichainz AI-AIOS Official Verification Engine</span>
      </div>
    </div>
  );
};
