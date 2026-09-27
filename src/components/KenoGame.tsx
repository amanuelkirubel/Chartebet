import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  Trash2, 
  Trophy, 
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, Language } from '../types';
import { addUserBet } from '../utils/betAndTransactionStore';

interface KenoGameProps {
  user: UserAccount;
  onUpdateBalance: (newBalance: number) => void;
  currentLang: Language;
  onOpenAuth: () => void;
  onBack?: () => void;
}

const PAYTABLES: Record<number, Record<number, number>> = {
  10: { 10: 5000, 9: 2500, 8: 400, 7: 40, 6: 12, 5: 4, 4: 2, 0: 1 },
  9:  { 9: 4200, 8: 1800, 7: 120, 6: 18, 5: 5, 4: 3, 0: 1 },
  8:  { 8: 3000, 7: 800, 6: 68, 5: 9, 4: 4, 0: 1 },
  7:  { 7: 2150, 6: 120, 5: 12, 4: 4, 3: 1 },
  6:  { 6: 1800, 5: 70, 4: 10, 3: 1 },
  5:  { 5: 300, 4: 15, 3: 3, 2: 1 },
  4:  { 4: 100, 3: 8, 2: 1 },
  3:  { 3: 35, 2: 2 },
  2:  { 2: 15 },
  1:  { 1: 3.8 },
};

export const KenoGame: React.FC<KenoGameProps> = ({
  user,
  onUpdateBalance,
  onOpenAuth,
  onBack,
}) => {
  const [currentDraw, setCurrentDraw] = useState<number>(80327);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [stake, setStake] = useState<number>(3);
  const [selectedSideBet, setSelectedSideBet] = useState<'HEADS' | 'TAILS' | 'EVENS' | null>(null);

  const [phase, setPhase] = useState<'betting' | 'mixing' | 'drawing' | 'result'>('betting');
  const [timer, setTimer] = useState<number>(36);

  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [currentBall, setCurrentBall] = useState<number | null>(null);
  const [ballIndex, setBallIndex] = useState<number>(0);

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeBetForCurrentDraw, setActiveBetForCurrentDraw] = useState<{
    picks: number[];
    sideBet: 'HEADS' | 'TAILS' | 'EVENS' | null;
    stake: number;
  } | null>(null);

  const [lastWinInfo, setLastWinInfo] = useState<{ hits: number; win: number } | null>(null);

  const countdownIntervalRef = useRef<any>(null);
  const mixingTimeoutRef = useRef<any>(null);
  const drawIntervalRef = useRef<any>(null);
  const resultTimeoutRef = useRef<any>(null);
  const isDrawingRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (mixingTimeoutRef.current) clearTimeout(mixingTimeoutRef.current);
      if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
      if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'betting') {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      return;
    }

    countdownIntervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === 'betting' && timer === 0 && !isDrawingRef.current) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      startDrawPhase();
    }
  }, [phase, timer]);

  const startDrawPhase = () => {
    if (isDrawingRef.current) return;
    isDrawingRef.current = true;
    setPhase('mixing');

    const pool = Array.from({ length: 80 }, (_, i) => i + 1);
    const target20: number[] = [];
    while (target20.length < 20) {
      const idx = Math.floor(Math.random() * pool.length);
      target20.push(pool.splice(idx, 1)[0]);
    }

    mixingTimeoutRef.current = setTimeout(() => {
      setPhase('drawing');
      setDrawnNumbers([]);
      setBallIndex(0);

      let currentIdx = 0;
      drawIntervalRef.current = setInterval(() => {
        if (currentIdx >= 20) {
          if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
          finishDraw(target20);
          return;
        }

        const ball = target20[currentIdx];
        currentIdx += 1;
        setCurrentBall(ball);
        setBallIndex(currentIdx);
        setDrawnNumbers((prev) => [...prev, ball]);
      }, 1000);
    }, 2000);
  };

  const finishDraw = (drawn20: number[]) => {
    const heads = drawn20.filter((n) => n <= 40).length;
    const tails = drawn20.filter((n) => n > 40).length;
    const resultSide: 'HEADS' | 'TAILS' | 'EVENS' =
      heads > tails ? 'HEADS' : tails > heads ? 'TAILS' : 'EVENS';

    if (activeBetForCurrentDraw) {
      const { picks, sideBet, stake: betStake } = activeBetForCurrentDraw;
      const hitNumbers = picks.filter((n) => drawn20.includes(n));
      const hitsCount = hitNumbers.length;

      let winMultiplier = 0;
      if (picks.length > 0 && PAYTABLES[picks.length]) {
        winMultiplier = PAYTABLES[picks.length][hitsCount] || 0;
      }

      let sideWin = 0;
      if (sideBet && sideBet === resultSide) {
        const sideMult = resultSide === 'EVENS' ? 4.0 : 2.0;
        sideWin = betStake * sideMult;
      }

      const totalWin = Number((betStake * winMultiplier + sideWin).toFixed(2));

      if (totalWin > 0) {
        onUpdateBalance(user.balance + totalWin);
        try {
          confetti({ particleCount: 90, spread: 80 });
        } catch (e) {}
        setLastWinInfo({ hits: hitsCount, win: totalWin });
      }

      addUserBet({
        userId: user.id,
        ticketId: `KENO-${currentDraw}`,
        gameType: 'Keno 80',
        stake: betStake,
        potentialReturn: totalWin,
        status: totalWin > 0 ? 'won' : 'lost',
        details: `Draw #${currentDraw}: Matched ${hitsCount}/${picks.length} numbers.`,
        totalOdds: winMultiplier || 1.0,
      });
    }

    setPhase('result');

    resultTimeoutRef.current = setTimeout(() => {
      isDrawingRef.current = false;
      setCurrentDraw((prev) => prev + 1);
      setDrawnNumbers([]);
      setCurrentBall(null);
      setBallIndex(0);
      setActiveBetForCurrentDraw(null);
      setPhase('betting');
      setTimer(36);
    }, 4000);
  };

  const toggleNumber = (num: number) => {
    if (phase !== 'betting') return;
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      if (selectedNumbers.length >= 10) return;
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  const handleQuickPick = (count = 5) => {
    if (phase !== 'betting') return;
    const picks: number[] = [];
    while (picks.length < count) {
      const r = Math.floor(Math.random() * 80) + 1;
      if (!picks.includes(r)) picks.push(r);
    }
    setSelectedNumbers(picks.sort((a, b) => a - b));
  };

  const handleClear = () => {
    if (phase !== 'betting') return;
    setSelectedNumbers([]);
    setSelectedSideBet(null);
  };

  const handlePlaceBet = () => {
    if (!user.isLoggedIn) {
      alert('Please sign in or register to place bets on Keno!');
      onOpenAuth();
      return;
    }

    if (selectedNumbers.length === 0 && !selectedSideBet) {
      alert('Please select at least 1 number or choose a side bet (HEADS / EVENS / TAILS).');
      return;
    }

    if (stake < 3) {
      alert('Minimum bet amount is 3 ETB.');
      setStake(3);
      return;
    }

    if (user.balance < stake) {
      alert(`Insufficient balance! Your balance is ${user.balance.toFixed(2)} ${user.currency}`);
      return;
    }

    onUpdateBalance(user.balance - stake);
    setActiveBetForCurrentDraw({
      picks: [...selectedNumbers],
      sideBet: selectedSideBet,
      stake,
    });

    alert(`Ticket placed for DRAW #${currentDraw}! Good luck!`);
  };

  const activePickCount = selectedNumbers.length > 0 ? selectedNumbers.length : 10;
  const currentPaytable = PAYTABLES[activePickCount] || PAYTABLES[10];
  const liveHeadsCount = drawnNumbers.filter((n) => n <= 40).length;
  const liveTailsCount = drawnNumbers.filter((n) => n > 40).length;

  return (
    <div className="w-full max-w-4xl mx-auto font-sans select-none text-white pb-6">
      {/* Top Header */}
      <div className="bg-[#111111] px-3 py-2.5 flex items-center justify-between border-b border-neutral-800">
        <button
          onClick={onBack || (() => window.history.back())}
          className="px-3 py-1.5 bg-[#4a4a4a] hover:bg-[#5a5a5a] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-amber-400 font-mono">KENO 80 ARENA</span>
        </div>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-1.5 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>
      </div>

      {/* Main Keno Arena */}
      <div className="bg-gradient-to-b from-[#800000] via-[#8B0000] to-[#600000] p-2.5 sm:p-3.5 border-x border-b border-red-950 shadow-2xl relative overflow-hidden">
        {/* Top Status Bar */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-red-900/80">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black font-mono text-[#ffd700] tracking-wider">
              DRAW {currentDraw}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setSelectedSideBet(selectedSideBet === 'HEADS' ? null : 'HEADS')}
              className={`px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider transition border cursor-pointer ${
                selectedSideBet === 'HEADS' || (phase === 'drawing' && liveHeadsCount > liveTailsCount)
                  ? 'bg-amber-400 text-black border-yellow-300 font-extrabold shadow'
                  : 'bg-[#550505] text-amber-200/90 border-red-800/80 hover:bg-[#770808]'
              }`}
            >
              HEADS {phase === 'drawing' ? `(${liveHeadsCount})` : '2.0'}
            </button>

            <button
              onClick={() => setSelectedSideBet(selectedSideBet === 'EVENS' ? null : 'EVENS')}
              className={`px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider transition border cursor-pointer ${
                selectedSideBet === 'EVENS' || (phase === 'drawing' && liveHeadsCount === liveTailsCount && liveHeadsCount > 0)
                  ? 'bg-amber-400 text-black border-yellow-300 font-extrabold shadow'
                  : 'bg-[#550505] text-amber-200/90 border-red-800/80 hover:bg-[#770808]'
              }`}
            >
              EVENS {phase === 'drawing' ? '(=)' : '4.0'}
            </button>

            <button
              onClick={() => setSelectedSideBet(selectedSideBet === 'TAILS' ? null : 'TAILS')}
              className={`px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider transition border cursor-pointer ${
                selectedSideBet === 'TAILS' || (phase === 'drawing' && liveTailsCount > liveHeadsCount)
                  ? 'bg-amber-400 text-black border-yellow-300 font-extrabold shadow'
                  : 'bg-[#550505] text-amber-200/90 border-red-800/80 hover:bg-[#770808]'
              }`}
            >
              TAILS {phase === 'drawing' ? `(${liveTailsCount})` : '2.0'}
            </button>
          </div>
        </div>

        {/* Phase: Betting Mode */}
        {phase === 'betting' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
            <div className="md:col-span-8 bg-[#4a0000] p-2 sm:p-2.5 rounded-xl border border-red-800/90 shadow-inner">
              <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
                {Array.from({ length: 80 }, (_, i) => i + 1).map((num) => {
                  const isSelected = selectedNumbers.includes(num);
                  return (
                    <button
                      key={num}
                      onClick={() => toggleNumber(num)}
                      className={`aspect-square rounded-md sm:rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center relative shadow cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#ffe066] to-[#e6b800] text-black font-black scale-95 ring-2 ring-white shadow-lg'
                          : 'bg-[#6b0808] hover:bg-[#850b0b] text-[#ffd700] border border-[#941313]'
                      }`}
                    >
                      <span>{num}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-red-900/60 text-[10px] sm:text-xs">
                <span className="font-black text-amber-300 tracking-wider">KENO 80</span>
                <span className="text-amber-200/80 font-bold">{selectedNumbers.length}/10 Numbers Selected</span>
              </div>
            </div>

            <div className="md:col-span-4 bg-[#4a0000] p-3 rounded-xl border border-red-800/90 shadow-inner flex flex-col justify-between space-y-3">
              <div>
                <div className="text-center pb-2 border-b border-red-900/80">
                  <div className="text-[11px] font-black text-amber-300 uppercase tracking-wider">DRAW {currentDraw}</div>
                  <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-widest my-0.5">
                    00:{timer.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs font-black text-[#ffd700] uppercase tracking-wider">
                    PICK {selectedNumbers.length > 0 ? selectedNumbers.length : 10}
                  </div>
                </div>

                <div className="mt-2 text-xs">
                  <div className="grid grid-cols-2 text-[11px] font-black text-neutral-300 border-b border-red-800 pb-1 mb-1 px-1">
                    <span>HITS</span>
                    <span className="text-right">WIN</span>
                  </div>
                  <div className="space-y-0.5 font-mono text-xs max-h-44 overflow-y-auto">
                    {Object.entries(currentPaytable)
                      .sort(([a], [b]) => Number(b) - Number(a))
                      .map(([hits, winMult]) => (
                        <div key={hits} className="grid grid-cols-2 py-0.5 px-1 rounded text-white font-bold">
                          <span className="text-amber-300">{hits}</span>
                          <span className="text-right text-emerald-400 font-black">
                            {(stake * winMult).toLocaleString()}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-red-900/80">
                <div className="grid grid-cols-3 gap-1 text-[11px] font-bold">
                  <button
                    onClick={() => handleQuickPick(5)}
                    className="py-1 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-lg transition cursor-pointer"
                  >
                    AUTO 5
                  </button>
                  <button
                    onClick={() => handleQuickPick(10)}
                    className="py-1 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-lg transition cursor-pointer"
                  >
                    AUTO 10
                  </button>
                  <button
                    onClick={handleClear}
                    className="py-1 bg-[#600000] hover:bg-[#770000] text-red-200 font-black rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> CLEAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phase: Drawing Balls */}
        {phase === 'drawing' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-7 bg-[#4a0000] p-2.5 rounded-xl border border-red-800">
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: 80 }, (_, i) => i + 1).map((num) => {
                  const isDrawn = drawnNumbers.includes(num);
                  const isUserPick = selectedNumbers.includes(num);
                  const isMatch = isDrawn && isUserPick;

                  return (
                    <div
                      key={num}
                      className={`aspect-square rounded flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all ${
                        isMatch
                          ? 'bg-emerald-400 text-black font-black ring-2 ring-white scale-105 animate-bounce z-10'
                          : isDrawn
                            ? 'bg-[#ffd700] text-black font-black scale-95 shadow-md'
                            : isUserPick
                              ? 'bg-[#ffe066]/70 text-black font-bold'
                              : 'bg-[#6b0808]/70 text-amber-200/60 border border-[#850b0b]'
                      }`}
                    >
                      {num}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-5 bg-gradient-to-b from-[#111111] via-[#1f0505] to-[#111111] p-4 rounded-2xl border-2 border-red-800 shadow-2xl flex flex-col items-center justify-center min-h-[260px]">
              <div className="text-right w-full mb-2">
                <span className="text-xl font-mono font-black text-amber-400">
                  {ballIndex} <span className="text-xs text-neutral-400">/ 20</span>
                </span>
              </div>

              {currentBall !== null && (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ffe57f] via-[#ffd700] to-[#b39700] text-black border-4 border-yellow-200 flex items-center justify-center shadow-lg ring-2 ring-yellow-400/80 animate-in zoom-in-50">
                  <span className="text-4xl font-black font-mono">{currentBall}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phase: Result */}
        {phase === 'result' && (
          <div className="py-8 text-center space-y-3 bg-[#4a0000] rounded-xl border border-red-800 p-4">
            <h3 className="text-xl sm:text-2xl font-black text-amber-400 uppercase tracking-tight">
              DRAW #{currentDraw} COMPLETE
            </h3>
            {lastWinInfo ? (
              <div className="p-4 bg-emerald-950/80 border-2 border-emerald-500 rounded-2xl max-w-sm mx-auto space-y-1">
                <Trophy className="w-10 h-10 text-yellow-400 mx-auto" />
                <div className="text-2xl font-black font-mono text-emerald-400">
                  +{lastWinInfo.win.toLocaleString()} ETB WON!
                </div>
                <p className="text-xs text-emerald-200 font-bold">Matched {lastWinInfo.hits} numbers!</p>
              </div>
            ) : (
              <p className="text-sm text-neutral-300 font-bold">Next round starting shortly...</p>
            )}
          </div>
        )}

        {/* Bottom Stake Controls */}
        <div className="mt-3 pt-3 border-t border-red-900/80 bg-[#350202] p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <span className="text-[10px] text-amber-200/70 block uppercase font-bold">BALANCE</span>
              <span className="font-mono font-black text-sm text-emerald-400">
                {user.balance.toFixed(2)} {user.currency}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-[#1a0101] p-1 rounded-xl border border-red-800">
              <span className="text-[10px] text-neutral-400 px-2 font-bold uppercase">STAKE:</span>
              <button
                onClick={() => setStake(Math.max(3, stake - 5))}
                disabled={phase !== 'betting'}
                className="w-7 h-7 rounded-lg bg-[#500000] hover:bg-[#600000] text-white font-black text-xs cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                min="3"
                value={stake}
                onChange={(e) => setStake(Math.max(3, Number(e.target.value)))}
                disabled={phase !== 'betting'}
                className="w-14 bg-black border border-red-900 rounded-lg py-1 text-center font-mono font-black text-amber-300 text-xs focus:outline-none"
              />
              <button
                onClick={() => setStake(stake + 5)}
                disabled={phase !== 'betting'}
                className="w-7 h-7 rounded-lg bg-[#500000] hover:bg-[#600000] text-white font-black text-xs cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[3, 5, 10, 20, 50, 100].map((amt) => (
              <button
                key={amt}
                onClick={() => setStake(amt)}
                disabled={phase !== 'betting'}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border cursor-pointer ${
                  stake === amt
                    ? 'bg-[#ffd700] text-black border-yellow-300 font-black'
                    : 'bg-[#220000] text-amber-200 border-red-900 hover:bg-[#400000]'
                }`}
              >
                {amt}
              </button>
            ))}
          </div>

          <button
            onClick={handlePlaceBet}
            disabled={phase !== 'betting'}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition shadow-xl flex items-center justify-center gap-1.5 cursor-pointer ${
              phase === 'betting'
                ? 'bg-[#00a651] hover:bg-[#009247] text-white'
                : 'bg-[#2a2a2a] text-neutral-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{phase === 'betting' ? `BET ${stake} ETB` : 'DRAW IN PROGRESS...'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
