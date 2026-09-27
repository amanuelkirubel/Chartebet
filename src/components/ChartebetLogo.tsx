import React from 'react';

interface ChartebetLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ChartebetLogo: React.FC<ChartebetLogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Actual logo image asset — replace /chartebet-logo.png with your file path */}
      <img
        src="/chartebet-logo.png"
        alt="Chartebet"
        className={`${sizeMap[size]} w-auto object-contain shrink-0`}
      />

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center tracking-tight">
            <span className="font-black text-xl sm:text-2xl text-white tracking-wider font-sans">
              CHARTE<span className="text-blue-500">BET</span>
            </span>
            <span className="ml-1 px-1.5 py-0.2 rounded bg-blue-600/30 border border-blue-500/40 text-[9px] font-bold text-blue-400 uppercase tracking-widest hidden xs:inline">
              Official
            </span>
          </div>
          <span className="text-[9px] font-bold tracking-[0.2em] text-slate-400 uppercase mt-0.5">
            Premier Sports &amp; Gaming
          </span>
        </div>
      )}
    </div>
  );
};
