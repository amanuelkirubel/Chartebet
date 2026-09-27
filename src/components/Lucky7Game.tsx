import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, Language } from '../types';
import { addUserBet } from '../utils/betAndTransactionStore';

interface Lucky7GameProps {
  user: UserAccount;
  onUpdateBalance: (newBalance: number) => void;
  currentLang: Language;
  onOpenAuth: () => void;
}

export const Lucky7Game: React.FC<Lucky7GameProps> = ({
  user,
  onUpdateBalance,
  onOpenAuth,
}) => {
  const [stake, setStake] = useState<number>(20);
  const [predicted, setPredicted] = useState<'under7' | 'lucky7' | 'over7'>('over7');
  const [rolledNumber, setRolledNumber] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [roundNotice, setRoundNotice] = useState<string | null>(null);

  const handleRoll = () => {
    if (!user.isLoggedIn) {
      alert('Please sign in or register to play Lucky 7!');
      onOpenAuth();
      return;
    }

    if (user.balance < stake) {
      alert(`Insufficient balance! Your balance is ${user.balance.toFixed(2)} ${user.currency}`);
      return;
    }

    setIsRolling(true);
    setRoundNotice(null);
    onUpdateBalance(user.balance - stake);

    setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const total = d1 + d2;
      setRolledNumber(total);
      setIsRolling(false);

      let won = false;
      let multiplier = 0;

      if (predicted === 'under7' && total < 7) {
        won = true;
        multiplier = 2.0;
      } else if (predicted === 'lucky7' && total === 7) {
        won = true;
        multiplier = 5.8;
      } else if (predicted === 'over7' && total > 7) {
        won = true;
        multiplier = 2.0;
      }

      const winAmt = won ? Number((stake * multiplier).toFixed(2)) : 0;

      if (won) {
        onUpdateBalance(user.balance - stake + winAmt);
        try {
          confetti({ particleCount: 70, spread: 80 });
        } catch (e) {}
        setRoundNotice(`WON! Rolled ${total} (+${winAmt} ETB)`);
      } else {
        setRoundNotice(`Loss. Rolled ${total}.`);
      }

      addUserBet({
        userId: user.id,
        ticketId: `LUCKY7-${Date.now().toString().slice(-6)}`,
        gameType: 'Lucky 7 Dice',
        stake,
        potentialReturn: winAmt,
        status: won ? 'won' : 'lost',
        details: `Predicted ${predicted}, rolled ${total} (Dice: ${d1}+${d2})`,
        totalOdds: multiplier || 1.0,
      });
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 rounded-2xl p-4 sm:p-5 text-white border border-red-500/30 flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <span>🎲 LUCKY 7 LIVE DICE ROLLER</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Predict whether the two dice roll Under 7, Exactly 7, or Over 7.
          </p>
        </div>
      </div>

      <div className="bg-[#121620] border border-slate-800 rounded-3xl p-5 sm:p-6 text-center space-y-4 shadow-xl">
        <div className="aspect-[21/9] bg-gradient-to-b from-slate-950 to-[#101726] rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-4">
          <div className="text-5xl sm:text-6xl font-mono font-black text-yellow-400 mb-2">
            {isRolling ? '...' : rolledNumber !== null ? rolledNumber : '7'}
          </div>
          <p className="text-xs font-bold text-white">
            {roundNotice || 'Select your target zone and roll dice'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto">
          <button
            onClick={() => setPredicted('under7')}
            className={`p-3 rounded-xl border font-bold text-xs transition cursor-pointer ${
              predicted === 'under7'
                ? 'bg-blue-600 text-white border-blue-500 shadow-lg'
                : 'bg-[#0e131d] text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <div>Under 7 (2 to 6)</div>
            <span className="font-mono text-yellow-400 font-black">2.00x</span>
          </button>

          <button
            onClick={() => setPredicted('lucky7')}
            className={`p-3 rounded-xl border font-bold text-xs transition cursor-pointer ${
              predicted === 'lucky7'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg ring-2 ring-amber-400'
                : 'bg-[#0e131d] text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <div>EXACTLY 7</div>
            <span className="font-mono text-emerald-400 font-black">5.80x</span>
          </button>

          <button
            onClick={() => setPredicted('over7')}
            className={`p-3 rounded-xl border font-bold text-xs transition cursor-pointer ${
              predicted === 'over7'
                ? 'bg-blue-600 text-white border-blue-500 shadow-lg'
                : 'bg-[#0e131d] text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <div>Over 7 (8 to 12)</div>
            <span className="font-mono text-yellow-400 font-black">2.00x</span>
          </button>
        </div>

        <div className="max-w-md mx-auto flex items-center justify-between gap-3 pt-2 flex-wrap sm:flex-nowrap">
          <div className="flex gap-1 overflow-x-auto">
            {[10, 20, 50, 100].map((amt) => (
              <button
                key={amt}
                onClick={() => setStake(amt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                  stake === amt
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-[#0e131d] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {amt}
              </button>
            ))}
          </div>

          <button
            onClick={handleRoll}
            disabled={isRolling}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
            <span>ROLL DICE ({stake} ETB)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
