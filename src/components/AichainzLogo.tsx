import React, { useId } from 'react';

interface Props {
  className?: string;
  size?: number;
}

export const AichainzLogo: React.FC<Props> = ({ className = '', size = 38 }) => {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, '');

  const bgGradId = `aichainz_bg_${uid}`;
  const blueTileId = `aichainz_blue_${uid}`;
  const purpleTileId = `aichainz_purple_${uid}`;
  const redTileId = `aichainz_red_${uid}`;
  const yellowTileId = `aichainz_yellow_${uid}`;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 drop-shadow-md"
      >
        {/* Soft background container */}
        <rect width="100" height="100" rx="24" fill={`url(#${bgGradId})`} />

        {/* Top-Left Blue Tile */}
        <rect x="14" y="14" width="32" height="32" rx="10" fill={`url(#${blueTileId})`} />
        <circle cx="24" cy="24" r="3.5" fill="#93C5FD" />

        {/* Top-Right Purple Tile */}
        <rect x="54" y="14" width="32" height="32" rx="10" fill={`url(#${purpleTileId})`} />
        <circle cx="76" cy="24" r="3.5" fill="#F472B6" />

        {/* Bottom-Left Red Tile */}
        <rect x="14" y="54" width="32" height="32" rx="10" fill={`url(#${redTileId})`} />
        <circle cx="24" cy="76" r="3.5" fill="#FDE047" />

        {/* Bottom-Right Yellow/Gold Tile */}
        <rect x="54" y="54" width="32" height="32" rx="10" fill={`url(#${yellowTileId})`} />
        <circle cx="76" cy="76" r="3.5" fill="#E087FF" />

        {/* Connecting Cross Node */}
        <path d="M 50 14 V 86 M 14 50 H 86" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.9" />

        <defs>
          <linearGradient id={bgGradId} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F8FAFC" />
            <stop offset="1" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id={blueTileId} x1="14" y1="14" x2="46" y2="46" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id={purpleTileId} x1="54" y1="14" x2="86" y2="46" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A855F7" />
            <stop offset="1" stopColor="#6D28D9" />
          </linearGradient>
          <linearGradient id={redTileId} x1="14" y1="54" x2="46" y2="86" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F43F5E" />
            <stop offset="1" stopColor="#BE123C" />
          </linearGradient>
          <linearGradient id={yellowTileId} x1="54" y1="54" x2="86" y2="86" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EAB308" />
            <stop offset="1" stopColor="#B45309" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex flex-col text-left">
        <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
          Aichainz
        </span>
        <span className="text-[9.5px] font-black tracking-wider text-blue-700 uppercase mt-0.5">
          WHERE FUTURE THINKING MEETS AI
        </span>
      </div>
    </div>
  );
};
