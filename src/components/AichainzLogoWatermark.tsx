import React from 'react';

interface Props {
  size?: number;
  className?: string;
}

export const AichainzLogoWatermark: React.FC<Props> = ({ size = 260, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Circular Ring */}
        <circle cx="50" cy="50" r="48" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3" />
        <circle cx="50" cy="50" r="44" stroke="#4338CA" strokeWidth="0.75" opacity="0.2" />

        {/* Soft background container */}
        <rect x="15" y="15" width="70" height="70" rx="18" fill="url(#wm-bg)" />

        {/* Top-Left Blue Tile */}
        <rect x="25" y="25" width="22" height="22" rx="7" fill="url(#wm-blue)" />

        {/* Top-Right Purple Tile */}
        <rect x="53" y="25" width="22" height="22" rx="7" fill="url(#wm-purple)" />

        {/* Bottom-Left Red Tile */}
        <rect x="25" y="53" width="22" height="22" rx="7" fill="url(#wm-red)" />

        {/* Bottom-Right Gold Tile */}
        <rect x="53" y="53" width="22" height="22" rx="7" fill="url(#wm-gold)" />

        {/* Connecting Cross Line */}
        <path d="M 50 20 V 80 M 20 50 H 80" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.8" />

        <defs>
          <linearGradient id="wm-bg" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F1F5F9" />
            <stop offset="1" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id="wm-blue" x1="25" y1="25" x2="47" y2="47" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="wm-purple" x1="53" y1="25" x2="75" y2="47" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A855F7" />
            <stop offset="1" stopColor="#6D28D9" />
          </linearGradient>
          <linearGradient id="wm-red" x1="25" y1="53" x2="47" y2="75" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F87171" />
            <stop offset="1" stopColor="#DC2626" />
          </linearGradient>
          <linearGradient id="wm-gold" x1="53" y1="53" x2="75" y2="75" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FACC15" />
            <stop offset="1" stopColor="#B45309" />
          </linearGradient>
        </defs>
      </svg>
      <div className="mt-2 text-slate-800 tracking-widest font-black uppercase text-[12px] opacity-70">
        AICHAINZ ENTERPRISE
      </div>
    </div>
  );
};
