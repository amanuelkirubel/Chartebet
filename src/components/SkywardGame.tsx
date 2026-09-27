import React, { useState } from 'react';
import { Rocket, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, Language } from '../types';
import { addUserBet } from '../utils/betAndTransactionStore';

interface SkywardGameProps {
  user: UserAccount;
  onUpdateBalance: (newBalance: number) => void;
  currentLang: Language;
  onOpenAuth?: () => void;
}

export const SkywardGame: React.FC<SkywardGameProps> = ({
  user,
  onUpdateBalance,
  onOpenAuth,
}) => {
  const [stake, setStake] = useState<number>(25);
  const [altitude, setAltitude] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<{ won: boolean; mult: number; amt: number } | null>(null);

  const handleLaunch = () => {
    if (!user.isLoggedIn) {
      alert('Please sign in or register to launch Skyward!');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (user.balance < stake) {
      alert(`Insufficient balance! Your balance is ${user.balance.toFixed(2)} ${user.currency}`);
      return;
    }

    setIsPlaying(true);
    setResult(null);
    onUpdateBalance(user.balance - stake);

    let current = 1.0;
    const interval = setInterval(() => {
      current += 0.2;
      setAltitude(Number(current.toFixed(1)));
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setIsPlaying(false);

      const won = Math.random() < 0.48;
      const mult = won ? Number((1.5 + Math.random() * 5).toFixed(2)) : 0;
      const amt = won ? Number((stake * mult).toFixed(2)) : 0;

      if (won) {
        onUpdateBalance(user.balance - stake + amt);
        try {
          confetti({ particleCount: 70, spread: 70 });
        } catch (e) {}
      }

      addUserBet({
        userId: user.id,
        ticketId: `SKYWARD-${Date.now().toString().slice(-6)}`,
        gameType: 'Skyward Ascent',
        stake,
        potentialReturn: amt,
        status: won ? 'won' : 'lost',
        details: `Ascent to ${mult}x (${won ? 'Successful ejection' : 'Combustion'})`,
        totalOdds: mult || 1.0,
      });

      setResult({ won, mult, amt });
    }, 1200);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-blue-950 rounded-2xl p-4 sm:p-5 text-white border border-sky-500/30 flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-sky-400" />
            <span>SKYWARD HIGH-ALTITUDE ROCKET</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Ascend into orbit. Eject before rocket combustion for maximum cash multiplier.
          </p>
        </div>
      </div>

      <div className="bg-[#121620] border border-slate-800 rounded-3xl p-5 sm:p-6 text-center space-y-4 shadow-xl">
        <div className="aspect-[21/9] bg-gradient-to-t from-slate-950 via-sky-950/40 to-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
          <Rocket className={`w-14 sm:w-16 h-14 sm:h-16 text-sky-400 mb-2 ${isPlaying ? 'animate-bounce text-amber-400' : ''}`} />
          <span className="text-3xl sm:text-4xl font-mono font-black text-white">
            {isPlaying ? `${altitude}x` : result ? (result.won ? `+${result.amt} ETB (${result.mult}x)` : 'BURNOUT') : 'READY'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            {isPlaying ? 'Rocket climbing fast...' : 'Set stake and hit launch'}
          </span>
        </div>

        <div className="max-w-md mx-auto flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex gap-1.5 overflow-x-auto">
            {[10, 25, 50, 100, 250].map((amt) => (
              <button
                key={amt}
                onClick={() => setStake(amt)}
                className={`px-3 py-1.5 rounded-xl font-mono font-bold text-xs border transition cursor-pointer ${
                  stake === amt
                    ? 'bg-sky-600 text-white border-sky-500'
                    : 'bg-[#0e131d] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {amt}
              </button>
            ))}
          </div>

          <button
            onClick={handleLaunch}
            disabled={isPlaying}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 text-white font-black rounded-xl text-xs sm:text-sm transition shadow-lg shadow-sky-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>LAUNCH ({stake} ETB)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
