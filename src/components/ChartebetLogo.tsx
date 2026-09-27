import React from 'react';

interface ChartebetLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const ChartebetLogo: React.FC<ChartebetLogoProps> = ({
  size = 'md',
  showText = true,
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-base',
    lg: 'w-11 h-11 text-xl',
  };

  return (
    <div className="flex items-center gap-2 select-none">
      <div
        className={`${sizeClasses[size]} rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/30 shrink-0`}
      >
        <span>C</span>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-black text-base sm:text-lg tracking-tight text-white flex items-center gap-0.5">
            <span className="text-white">CHARTE</span>
            <span className="text-yellow-400">BET</span>
          </span>
          <span className="text-[9px] uppercase tracking-widest font-extrabold text-blue-400">
            SPORTS &amp; GAMES
          </span>
        </div>
      )}
    </div>
  );
};
