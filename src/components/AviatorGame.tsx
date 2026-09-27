import React, { useState, useEffect, useRef } from 'react';
import { Plane, Volume2, VolumeX, ShieldCheck, Flame, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, Language } from '../types';

interface AviatorGameProps {
  user: UserAccount;
  onUpdateBalance: (newBalance: number) => void;
  currentLang: Language;
  onOpenCommunity: () => void;
  onOpenAuth?: () => void;
}

interface AviatorLiveBet {
  player: string;
  bet: number;
  cashoutMult?: number;
  win?: number;
  cashedOut: boolean;
}

export const AviatorGame: React.FC<AviatorGameProps> = ({
  user,
  onUpdateBalance,
  currentLang,
  onOpenCommunity,
  onOpenAuth,
}) => {
  const [gameState, setGameState] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const [countdown, setCountdown] = useState<number>(5);
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [history, setHistory] = useState<number[]>([1.42, 18.48, 3.55, 1.48, 3.53, 7.75, 7.54, 3.84, 1.15, 4.41]);

  // Dual Bet Panels
  const [stake1, setStake1] = useState<number>(5.00);
  const [hasBet1, setHasBet1] = useState<boolean>(false);
  const [hasCashedOut1, setHasCashedOut1] = useState<boolean>(false);
  const [cashedWin1, setCashedWin1] = useState<number>(0);

  const [stake2, setStake2] = useState<number>(5.00);
  const [hasBet2, setHasBet2] = useState<boolean>(false);
  const [hasCashedOut2, setHasCashedOut2] = useState<boolean>(false);
  const [cashedWin2, setCashedWin2] = useState<number>(0);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'all' | 'previous' | 'top'>('all');

  const [liveBets] = useState<AviatorLiveBet[]>([
    { player: 'b****', bet: 3741.12, cashoutMult: 1.92, win: 7182.96, cashedOut: true },
    { player: 'n****', bet: 3741.12, cashoutMult: 1.91, win: 7145.55, cashedOut: true },
    { player: 'm****', bet: 3741.12, cashoutMult: 2.68, win: 10026.22, cashedOut: true },
    { player: '8***7', bet: 2861.96, cashoutMult: 3.33, win: 9528.65, cashedOut: true },
    { player: '2***3', bet: 2805.84, cashoutMult: 5.66, win: 15881.09, cashedOut: true },
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const crashPointRef = useRef<number>(2.40);
  const multiplierRef = useRef<number>(1.00);

  const playTone = (freq: number, type: OscillatorType = 'sine', duration = 0.15) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  };

  const drawFlightCanvas = (currentMult: number, state: 'waiting' | 'flying' | 'crashed') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (state === 'flying' || state === 'crashed') {
      const progress = Math.min(1, Math.max(0, (currentMult - 1.0) / 4.5));
      const startX = 40;
      const startY = height - 40;
      const endX = startX + (width - 120) * progress;
      const endY = startY - (height - 90) * Math.pow(progress, 0.85);

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(startX + (endX - startX) * 0.35, startY, endX, endY);
      ctx.strokeStyle = state === 'crashed' ? '#ef4444' : '#e11d48';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.lineTo(endX, startY);
      ctx.lineTo(startX, startY);
      ctx.fillStyle = state === 'crashed' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(225, 29, 72, 0.2)';
      ctx.fill();

      if (state === 'flying') {
        ctx.save();
        ctx.translate(endX, endY);
        ctx.rotate(-0.35);

        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-4, -14);
        ctx.lineTo(4, 0);
        ctx.lineTo(-4, 14);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(18, -10);
        ctx.lineTo(18, 10);
        ctx.stroke();

        ctx.restore();
      }
    }
  };

  useEffect(() => {
    let timer: any = null;

    if (gameState === 'waiting') {
      const target = Number((1.15 + Math.random() * (Math.random() < 0.25 ? 12 : 3.5)).toFixed(2));
      crashPointRef.current = target;
      multiplierRef.current = 1.00;
      setMultiplier(1.00);
      setHasCashedOut1(false);
      setHasCashedOut2(false);
      setCashedWin1(0);
      setCashedWin2(0);
      drawFlightCanvas(1.00, 'waiting');

      timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            setGameState('flying');
            playTone(440, 'triangle', 0.2);
            return 5;
          }
          return c - 1;
        });
      }, 1000);
    } else if (gameState === 'flying') {
      const startTime = Date.now();
      const target = crashPointRef.current;
      let lastThrottle = 0;

      const runFlight = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const cur = Number((Math.pow(Math.E, 0.09 * elapsed)).toFixed(2));
        multiplierRef.current = cur;

        drawFlightCanvas(cur, 'flying');

        const now = Date.now();
        if (now - lastThrottle > 45) {
          lastThrottle = now;
          setMultiplier(cur);
        }

        if (cur >= target) {
          setGameState('crashed');
          setMultiplier(target);
          drawFlightCanvas(target, 'crashed');
          playTone(160, 'sawtooth', 0.4);
          setHistory((h) => [target, ...h.slice(0, 11)]);
          setHasBet1(false);
          setHasBet2(false);

          setTimeout(() => {
            setGameState('waiting');
          }, 3500);
        } else {
          animFrameRef.current = requestAnimationFrame(runFlight);
        }
      };

      animFrameRef.current = requestAnimationFrame(runFlight);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState]);

  const handlePlaceBet1 = () => {
    if (!user.isLoggedIn) {
      alert('Please sign in or register to bet on Aviator!');
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (user.balance < stake1) {
      alert(`Insufficient balance! Your balance is ${user.balance.toFixed(2)} ${user.currency}`);
      return;
    }
    onUpdateBalance(user.balance - stake1);
    setHasBet1(true);
    setHasCashedOut1(false);
    playTone(520, 'sine', 0.15);
  };

  const handleCashout1 = () => {
    if (!hasBet1 || hasCashedOut1) return;
    const cur = multiplierRef.current;
    const win = Number((stake1 * cur).toFixed(2));
    onUpdateBalance(user.balance + win);
    setHasCashedOut1(true);
    setCashedWin1(win);
    playTone(880, 'sine', 0.25);
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch (e) {}
  };

  const handlePlaceBet2 = () => {
    if (!user.isLoggedIn) {
      alert('Please sign in or register to bet on Aviator!');
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (user.balance < stake2) {
      alert(`Insufficient balance! Your balance is ${user.balance.toFixed(2)} ${user.currency}`);
      return;
    }
    onUpdateBalance(user.balance - stake2);
    setHasBet2(true);
    setHasCashedOut2(false);
    playTone(520, 'sine', 0.15);
  };

  const handleCashout2 = () => {
    if (!hasBet2 || hasCashedOut2) return;
    const cur = multiplierRef.current;
    const win = Number((stake2 * cur).toFixed(2));
    onUpdateBalance(user.balance + win);
    setHasCashedOut2(true);
    setCashedWin2(win);
    playTone(880, 'sine', 0.25);
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch (e) {}
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Multiplier History */}
      <div className="bg-[#121620] border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shadow-inner">
        <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold text-slate-400">
          <Flame className="w-4 h-4 text-red-500 animate-pulse" />
          <span>ROUNDS:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {history.map((val, idx) => (
            <span
              key={idx}
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold whitespace-nowrap shadow-sm ${
                val >= 10.0
                  ? 'bg-purple-900/60 text-purple-300 border border-purple-500/60'
                  : val >= 2.0
                  ? 'bg-blue-900/60 text-blue-300 border border-blue-500/50'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {val.toFixed(2)}x
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenCommunity}
            className="flex items-center gap-1 bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 text-xs px-2.5 py-1 rounded-lg border border-sky-500/40 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">@Chartebetting7</span>
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Aviator Radar Canvas */}
      <div className="relative bg-[#0d1017] border-2 border-slate-800 rounded-2xl overflow-hidden shadow-2xl min-h-[350px] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={350}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        <div className="relative z-10 text-center select-none">
          {gameState === 'waiting' && (
            <div className="space-y-2 animate-pulse">
              <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                WAITING FOR NEXT ROUND
              </div>
              <div className="text-5xl sm:text-6xl font-black font-mono text-white">
                {countdown}s
              </div>
              <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
                <div
                  className="h-full bg-rose-600 transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          {gameState === 'flying' && (
            <div className="space-y-1">
              <div className="text-6xl sm:text-8xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_25px_rgba(225,29,72,0.6)]">
                {multiplier.toFixed(2)}x
              </div>
              <div className="flex items-center justify-center gap-1.5 text-rose-400 font-bold text-xs uppercase tracking-wider animate-pulse">
                <Plane className="w-4 h-4" />
                <span>PLANE ASCENDING</span>
              </div>
            </div>
          )}

          {gameState === 'crashed' && (
            <div className="space-y-1">
              <div className="text-4xl sm:text-6xl font-black font-mono text-rose-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.8)]">
                FLEW AWAY!
              </div>
              <div className="text-2xl font-black font-mono text-slate-300">
                CRASHED AT {multiplier.toFixed(2)}x
              </div>
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/80 backdrop-blur border border-slate-700 text-[10px] text-slate-400 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Provably Fair RNG</span>
        </div>
      </div>

      {/* Dual Betting Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* PANEL 1 */}
        <div className="bg-[#1b2029] border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold text-slate-300">BET PANEL 1</span>
            <span className="font-mono text-emerald-400">Balance: {user.balance.toFixed(2)} ETB</span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 flex items-center bg-[#13171e] border border-slate-700 rounded-xl px-2 py-1.5">
              <button
                onClick={() => setStake1(Math.max(1, stake1 - 5))}
                disabled={hasBet1 && gameState === 'flying'}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-base cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                step="1"
                value={stake1}
                onChange={(e) => setStake1(Math.max(1, Number(e.target.value)))}
                disabled={hasBet1 && gameState === 'flying'}
                className="flex-1 bg-transparent text-center text-white font-mono font-bold text-sm focus:outline-none"
              />
              <button
                onClick={() => setStake1(stake1 + 5)}
                disabled={hasBet1 && gameState === 'flying'}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-base cursor-pointer"
              >
                +
              </button>
            </div>

            <div className="flex-1">
              {!hasBet1 ? (
                <button
                  onClick={handlePlaceBet1}
                  disabled={gameState === 'flying'}
                  className="w-full h-12 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-slate-950 font-black rounded-xl text-sm transition shadow-lg shadow-emerald-600/25 flex flex-col items-center justify-center cursor-pointer"
                >
                  <span className="text-[10px] uppercase font-bold text-slate-800">Bet</span>
                  <span className="font-mono">{stake1.toFixed(2)} ETB</span>
                </button>
              ) : hasCashedOut1 ? (
                <div className="w-full h-12 bg-blue-900/80 border border-blue-400 rounded-xl flex flex-col items-center justify-center text-white">
                  <span className="text-[9px] uppercase font-bold text-blue-200">Won</span>
                  <span className="font-mono font-black text-emerald-400">+{cashedWin1.toFixed(2)} ETB</span>
                </div>
              ) : gameState === 'flying' ? (
                <button
                  onClick={handleCashout1}
                  className="w-full h-12 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-sm transition shadow-lg shadow-amber-400/30 flex flex-col items-center justify-center animate-pulse cursor-pointer"
                >
                  <span className="text-[9px] uppercase font-extrabold text-amber-900">CASH OUT</span>
                  <span className="font-mono">{(stake1 * multiplier).toFixed(2)} ETB</span>
                </button>
              ) : (
                <div className="w-full h-12 bg-slate-800 text-slate-400 font-bold rounded-xl flex items-center justify-center text-xs">
                  WAITING TAKEOFF
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[16, 40, 80, 400].map((amt) => (
              <button
                key={amt}
                onClick={() => setStake1(amt)}
                disabled={hasBet1 && gameState === 'flying'}
                className="py-1 bg-[#13171e] hover:bg-slate-800 text-slate-300 text-xs font-mono font-bold rounded-lg border border-slate-700/80 transition cursor-pointer"
              >
                {amt}
              </button>
            ))}
          </div>
        </div>

        {/* PANEL 2 */}
        <div className="bg-[#1b2029] border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold text-slate-300">BET PANEL 2</span>
            <span className="font-mono text-emerald-400">Balance: {user.balance.toFixed(2)} ETB</span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 flex items-center bg-[#13171e] border border-slate-700 rounded-xl px-2 py-1.5">
              <button
                onClick={() => setStake2(Math.max(1, stake2 - 5))}
                disabled={hasBet2 && gameState === 'flying'}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-base cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                step="1"
                value={stake2}
                onChange={(e) => setStake2(Math.max(1, Number(e.target.value)))}
                disabled={hasBet2 && gameState === 'flying'}
                className="flex-1 bg-transparent text-center text-white font-mono font-bold text-sm focus:outline-none"
              />
              <button
                onClick={() => setStake2(stake2 + 5)}
                disabled={hasBet2 && gameState === 'flying'}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-base cursor-pointer"
              >
                +
              </button>
            </div>

            <div className="flex-1">
              {!hasBet2 ? (
                <button
                  onClick={handlePlaceBet2}
                  disabled={gameState === 'flying'}
                  className="w-full h-12 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-slate-950 font-black rounded-xl text-sm transition shadow-lg shadow-emerald-600/25 flex flex-col items-center justify-center cursor-pointer"
                >
                  <span className="text-[10px] uppercase font-bold text-slate-800">Bet</span>
                  <span className="font-mono">{stake2.toFixed(2)} ETB</span>
                </button>
              ) : hasCashedOut2 ? (
                <div className="w-full h-12 bg-blue-900/80 border border-blue-400 rounded-xl flex flex-col items-center justify-center text-white">
                  <span className="text-[9px] uppercase font-bold text-blue-200">Won</span>
                  <span className="font-mono font-black text-emerald-400">+{cashedWin2.toFixed(2)} ETB</span>
                </div>
              ) : gameState === 'flying' ? (
                <button
                  onClick={handleCashout2}
                  className="w-full h-12 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-sm transition shadow-lg shadow-amber-400/30 flex flex-col items-center justify-center animate-pulse cursor-pointer"
                >
                  <span className="text-[9px] uppercase font-extrabold text-amber-900">CASH OUT</span>
                  <span className="font-mono">{(stake2 * multiplier).toFixed(2)} ETB</span>
                </button>
              ) : (
                <div className="w-full h-12 bg-slate-800 text-slate-400 font-bold rounded-xl flex items-center justify-center text-xs">
                  WAITING TAKEOFF
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[16, 40, 80, 400].map((amt) => (
              <button
                key={amt}
                onClick={() => setStake2(amt)}
                disabled={hasBet2 && gameState === 'flying'}
                className="py-1 bg-[#13171e] hover:bg-slate-800 text-slate-300 text-xs font-mono font-bold rounded-lg border border-slate-700/80 transition cursor-pointer"
              >
                {amt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Players / Winners Table */}
      <div className="bg-[#1b2029] border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex gap-2">
            {(['all', 'previous', 'top'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveLeaderboardTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize cursor-pointer ${
                  activeLeaderboardTab === tab ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'all' ? 'All Bets' : tab === 'previous' ? 'Previous' : 'Top Winners'}
              </button>
            ))}
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-400">Total Win: </span>
            <strong className="text-emerald-400 font-mono">129,419.91 ETB</strong>
          </div>
        </div>

        <div className="divide-y divide-slate-800/70 text-xs max-h-56 overflow-y-auto font-mono">
          <div className="grid grid-cols-4 py-1 text-[11px] text-slate-400 font-sans font-semibold">
            <span>Player</span>
            <span>Bet ETB</span>
            <span>X</span>
            <span className="text-right">Win ETB</span>
          </div>

          {liveBets.map((b, i) => (
            <div key={i} className="grid grid-cols-4 py-2 text-slate-300 items-center">
              <div className="flex items-center gap-1.5 font-sans">
                <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px]">
                  👤
                </span>
                <span>{b.player}</span>
              </div>
              <div>{b.bet.toFixed(2)}</div>
              <div className="text-emerald-400 font-bold">{b.cashoutMult?.toFixed(2)}x</div>
              <div className="text-right font-black text-emerald-400">
                {b.win ? `+${b.win.toFixed(2)}` : '--'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
