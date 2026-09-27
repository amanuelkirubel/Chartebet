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
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* 3D Chrome Metallic Emblem */}
      <div
        className={`relative ${sizeMap[size]} rounded-xl overflow-hidden bg-gradient-to-tr from-blue-950 via-blue-900 to-blue-700 border border-blue-600/80 shadow-lg flex items-center justify-center group shrink-0`}
      >
        <span className="font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-blue-400 text-xl font-mono tracking-tighter drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]">
          C
        </span>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-white/10 pointer-events-none" />
      </div>

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
export default ChartebetLogo;
