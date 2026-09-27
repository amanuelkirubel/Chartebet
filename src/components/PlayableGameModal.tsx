import React, { useState } from 'react';
import { X, Play, RotateCcw, Trophy, ShieldAlert } from 'lucide-react';
import { GameItem, UserAccount } from '../types';
import confetti from 'canvas-confetti';
import { addUserBet } from '../utils/betAndTransactionStore';

interface PlayableGameModalProps {
  game: GameItem | null;
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onUpdateBalance: (newBalance: number) => void;
  onOpenAuth?: () => void;
}

export const PlayableGameModal: React.FC<PlayableGameModalProps> = ({
  game,
  isOpen,
  onClose,
  user,
  onUpdateBalance,
  onOpenAuth,
}) => {
  const [stake, setStake] = useState<number>(20);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState<{
    won: boolean;
    multiplier: number;
    winAmount: number;
    message: string;
  } | null>(null);

  if (!isOpen || !game) return null;

  if (!user.isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
        <div className="bg-[#151c28] border border-amber-500/50 rounded-2xl max-w-md w-full p-6 text-center space-y-4 text-white shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black">Registration Required to Play</h3>
          <p className="text-xs text-slate-300">
            Playing {game.title} and casino games requires an active Chartebet account.
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                if (onOpenAuth) onOpenAuth();
              }}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs shadow-lg shadow-blue-500/30 cursor-pointer"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePlayRound = () => {
    if (user.balance < stake) {
      alert(`Insufficient balance! Your balance is ${user.balance.toFixed(2)} ${user.currency}`);
      return;
    }

    setIsPlaying(true);
    setGameResult(null);
    onUpdateBalance(user.balance - stake);

    setTimeout(() => {
      setIsPlaying(false);
      const won = Math.random() < 0.48;
      const multiplier = won ? Number((1.2 + Math.random() * 4.5).toFixed(2)) : 0;
      const winAmount = won ? Number((stake * multiplier).toFixed(2)) : 0;

      if (won) {
        onUpdateBalance(user.balance - stake + winAmount);
        try {
          confetti({ particleCount: 70, spread: 70 });
        } catch (e) {}
      }

      addUserBet({
        userId: user.id,
        ticketId: `CASINO-${Date.now().toString().slice(-6)}`,
        gameType: game.title,
        stake,
        potentialReturn: winAmount,
        status: won ? 'won' : 'lost',
        details: `${game.title} Round (${won ? `${multiplier}x WIN` : 'Loss'})`,
        totalOdds: multiplier || 1.0,
      });

      setGameResult({
        won,
        multiplier,
        winAmount,
        message: won ? `BIG WIN! ${multiplier}x Multiplier!` : 'Better luck on your next round!',
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#151c28] text-white rounded-2xl max-w-lg w-full border border-slate-700 shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{game.iconEmoji}</span>
            <div>
              <h3 className="font-bold text-base text-white">{game.title}</h3>
              <p className="text-[11px] text-slate-400">{game.provider} • RTP: {game.rtp}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Canvas */}
        <div className="p-6 space-y-4 text-xs">
          <div className="relative rounded-2xl overflow-hidden aspect-video bg-gradient-to-br from-slate-900 via-[#101928] to-slate-950 border border-slate-700/80 flex flex-col items-center justify-center p-4 text-center shadow-inner">
            <div className="absolute w-40 h-40 bg-blue-600/10 rounded-full blur-3xl" />

            {isPlaying ? (
              <div className="space-y-3 z-10 animate-pulse">
                <RotateCcw className="w-12 h-12 mx-auto text-yellow-400 animate-spin" />
                <p className="text-sm font-black text-white">Generating Round Outcome...</p>
              </div>
            ) : gameResult ? (
              <div className="space-y-2 z-10 animate-in zoom-in">
                {gameResult.won ? (
                  <>
                    <Trophy className="w-12 h-12 mx-auto text-yellow-400" />
                    <div className="text-2xl font-black font-mono text-emerald-400">
                      +{gameResult.winAmount.toFixed(2)} ETB
                    </div>
                    <p className="text-xs font-bold text-white">{gameResult.message}</p>
                  </>
                ) : (
                  <>
                    <div className="text-3xl">💔</div>
                    <p className="text-xs font-bold text-slate-300">{gameResult.message}</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2 z-10">
                <div className="text-5xl mb-2">{game.iconEmoji}</div>
                <h4 className="text-base font-black text-white">{game.title} Arena</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  {game.description}
                </p>
              </div>
            )}
          </div>

          <div className="bg-[#0e131d] p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] block font-semibold">YOUR BALANCE:</span>
              <span className="text-sm font-mono font-black text-emerald-400">
                {user.balance.toFixed(2)} {user.currency}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {[10, 20, 50, 100, 250].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setStake(amt)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] transition border cursor-pointer ${
                    stake === amt
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-[#151c28] text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handlePlayRound}
            disabled={isPlaying}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-sm transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>PLAY ROUND ({stake} ETB)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
