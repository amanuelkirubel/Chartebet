import React, { useState } from 'react';
import { 
  Trash2, 
  CheckCircle2, 
  Ticket, 
  QrCode, 
  Copy, 
  Check, 
  Lock, 
  LogIn
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BetSelection, UserAccount, Language, Match, OfflineSlip } from '../types';
import { translations } from '../data/translations';
import { generateTicketId } from '../utils/ticket';
import { addSlipRecord, addUserBet } from '../utils/betAndTransactionStore';

interface BetSlipProps {
  selections: BetSelection[];
  matches?: Match[];
  onRemoveSelection: (id: string) => void;
  onClearAll: () => void;
  onRemoveStartedGames?: () => void;
  user: UserAccount;
  onUpdateBalance: (newBalance: number) => void;
  currentLang: Language;
  onOpenCommunity: () => void;
  onViewOfflineSlip?: (ticket: OfflineSlip) => void;
  onOpenAuth?: () => void;
}

export const BetSlip: React.FC<BetSlipProps> = ({
  selections,
  onRemoveSelection,
  onClearAll,
  user,
  onUpdateBalance,
  currentLang,
  onViewOfflineSlip,
  onOpenAuth,
}) => {
  const t = translations[currentLang];
  const [activeTicket, setActiveTicket] = useState<1 | 2 | 3>(1);
  const [stake, setStake] = useState<number>(50);
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [placedTicket, setPlacedTicket] = useState<{ id: string; potentialWin: number } | null>(null);
  const [copied, setCopied] = useState(false);

  // Compute total odds
  const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1);
  const formattedOdds = Number(totalOdds.toFixed(2));

  // Multi-bet bonus calculation
  const bonusMultiplier = selections.length >= 3 ? Math.min(1.0, (selections.length - 2) * 0.05) : 0;
  const rawWin = stake * formattedOdds;
  const bonusAmount = rawWin * bonusMultiplier;
  const potentialWin = Number((rawWin + bonusAmount).toFixed(2));

  const handlePlaceBet = () => {
    if (selections.length === 0) return;

    if (!user.isLoggedIn) {
      if (onOpenAuth) onOpenAuth();
      alert(
        currentLang === 'am'
          ? 'እባክዎ በመጀመሪያ ይግቡ ወይም ይመዝገቡ! ያለ ምዝገባ/መለያ በመስመር ላይ መወራረድ አይቻልም::'
          : 'Please sign in or register first! Online bets cannot be placed without an account.'
      );
      return;
    }

    if (user.balance < stake) {
      alert(
        currentLang === 'am'
          ? `በቂ ያልሆነ ቀሪ ሒሳብ! ያለዎት ቀሪ ሒሳብ ${user.balance.toFixed(2)} ${user.currency} ነው`
          : `Insufficient balance! Your balance is ${user.balance.toFixed(2)} ${user.currency}`
      );
      return;
    }

    setIsPlacing(true);
    setTimeout(() => {
      onUpdateBalance(user.balance - stake);
      const ticketId = generateTicketId();

      const ticketSelections = selections.map((s) => ({
        matchId: s.matchId,
        matchTitle: s.matchTitle,
        marketType: s.marketType,
        selectionName: s.selectionName,
        odds: s.odds,
        status: 'pending' as const,
      }));

      // Add to user bet history with complete selections for clickable modal (Requirement 2)
      addUserBet({
        userId: user.id || user.phone || 'USER',
        ticketId,
        gameType: 'Sportsbook Bet',
        stake,
        potentialReturn: potentialWin,
        status: 'pending',
        totalOdds: formattedOdds,
        details: selections.map((s) => `${s.matchTitle} (${s.selectionName})`).join(', '),
        selections: ticketSelections,
      });

      addSlipRecord({
        bookingCode: ticketId,
        selections: ticketSelections,
        stake,
        totalOdds: formattedOdds,
        potentialReturn: potentialWin,
        status: 'pending',
        customerName: user.username || user.phone || 'Player',
        userPhone: user.phone,
        isPaid: false,
        createdAt: new Date().toISOString(),
      });

      setPlacedTicket({ id: ticketId, potentialWin });
      setIsPlacing(false);
      onClearAll();
      try {
        confetti({ particleCount: 80, spread: 70 });
      } catch (e) {}
    }, 600);
  };

  const handleBookBet = () => {
    if (selections.length === 0) return;

    const ticketId = generateTicketId();
    const ticketSelections = selections.map((s) => ({
      matchId: s.matchId,
      matchTitle: s.matchTitle,
      marketType: s.marketType,
      selectionName: s.selectionName,
      odds: s.odds,
      status: 'pending' as const,
    }));

    const createdSlip = addSlipRecord({
      bookingCode: ticketId,
      stake,
      totalOdds: formattedOdds,
      potentialReturn: potentialWin,
      status: 'pending',
      isPaid: false,
      createdAt: new Date().toISOString(),
      customerName: user.username || (user.phone ? `Phone: ${user.phone}` : 'Walk-in Cash Customer'),
      userPhone: user.phone || '',
      selections: ticketSelections,
    });

    addUserBet({
      userId: user.id || user.phone || 'BOOKED',
      ticketId,
      gameType: 'Offline Booked Bet',
      stake,
      potentialReturn: potentialWin,
      status: 'pending',
      totalOdds: formattedOdds,
      details: selections.map((s) => `${s.matchTitle} (${s.selectionName})`).join(', '),
      selections: ticketSelections,
    });

    setBookingCode(ticketId);
    if (onViewOfflineSlip) {
      onViewOfflineSlip(createdSlip);
    }
  };

  const copyBookingCode = () => {
    if (!bookingCode) return;
    navigator.clipboard.writeText(bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#181f2b] border border-slate-800 rounded-2xl shadow-xl overflow-hidden text-white flex flex-col select-none">
      {/* Top Ticket Tabs */}
      <div className="bg-[#121620] px-3 pt-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex gap-1">
          {([1, 2, 3] as const).map((num) => (
            <button
              key={num}
              onClick={() => setActiveTicket(num)}
              className={`px-3 py-1.5 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTicket === num
                  ? 'bg-[#181f2b] text-yellow-400 border-t border-x border-slate-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Ticket {num}</span>
            </button>
          ))}
        </div>

        {selections.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold pb-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>{t.clearAll}</span>
          </button>
        )}
      </div>

      {/* Slip Body */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[420px]">
        {placedTicket && (
          <div className="p-3.5 bg-emerald-950/70 border border-emerald-500 rounded-xl space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-emerald-400 font-bold text-xs">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ticket Placed Successfully!</span>
              </span>
              <span className="font-mono">{placedTicket.id}</span>
            </div>
            <div className="text-[11px] text-slate-300 flex justify-between">
              <span>Potential Payout:</span>
              <strong className="text-white font-mono">{placedTicket.potentialWin.toLocaleString()} ETB</strong>
            </div>
          </div>
        )}

        {selections.length === 0 ? (
          <div className="py-8 text-center text-slate-500 space-y-2">
            <Ticket className="w-10 h-10 mx-auto stroke-1" />
            <p className="text-xs">{t.emptyBetSlip}</p>
            <p className="text-[10px] text-slate-400">
              Click on any 1X2, Over/Under, or BTTS odd to add to this ticket
            </p>
            {!user.isLoggedIn && (
              <div className="pt-2">
                <button
                  onClick={onOpenAuth}
                  className="inline-flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] px-3 py-1.5 rounded-xl font-bold transition cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  <span>Sign In / Register required for online betting</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {selections.map((sel) => (
              <div
                key={sel.id}
                className="p-3 bg-[#121620] border border-slate-800 rounded-xl relative hover:border-slate-700 transition"
              >
                <div className="flex justify-between items-start gap-2 pr-6">
                  <div>
                    <div className="text-[11px] text-slate-400 font-semibold">{sel.leagueName}</div>
                    <div className="text-xs font-bold text-white mt-0.5">{sel.matchTitle}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
                  <div className="text-xs">
                    <span className="text-slate-400 text-[11px] mr-1">{sel.marketType}:</span>
                    <span className="text-yellow-400 font-bold">{sel.selectionName}</span>
                  </div>
                  <div className="font-mono font-bold text-emerald-400 text-sm">{sel.odds.toFixed(2)}</div>
                </div>

                <button
                  onClick={() => onRemoveSelection(sel.id)}
                  className="absolute top-2.5 right-2.5 text-slate-500 hover:text-rose-400 p-1 rounded-md cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slip Footer */}
      {selections.length > 0 && (
        <div className="p-4 bg-[#121620] border-t border-slate-800 space-y-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>{t.totalOdds}:</span>
              <strong className="font-mono text-yellow-400 text-sm">{formattedOdds}</strong>
            </div>
            {bonusMultiplier > 0 && (
              <div className="flex justify-between text-emerald-400 text-[11px]">
                <span>Multi-Bet Bonus (+{(bonusMultiplier * 100).toFixed(0)}%):</span>
                <strong className="font-mono">+{bonusAmount.toFixed(2)} ETB</strong>
              </div>
            )}
            <div className="flex justify-between text-white font-bold">
              <span>{t.potentialWin}:</span>
              <strong className="font-mono text-emerald-400 text-base">
                {potentialWin.toLocaleString()} ETB
              </strong>
            </div>
          </div>

          {/* Quick stake pills */}
          <div className="flex items-center gap-1.5">
            {[20, 50, 100, 250, 500].map((amt) => (
              <button
                key={amt}
                onClick={() => setStake(amt)}
                className={`flex-1 py-1 rounded-lg font-mono text-xs font-bold transition cursor-pointer ${
                  stake === amt ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {amt}
              </button>
            ))}
          </div>

          {/* Stake Input */}
          <div className="flex items-center gap-2 bg-[#181f2b] border border-slate-700 rounded-xl px-3 py-2">
            <span className="text-xs font-bold text-slate-400">STAKE ETB:</span>
            <input
              type="number"
              min="1"
              value={stake}
              onChange={(e) => setStake(Math.max(1, Number(e.target.value)))}
              className="flex-1 bg-transparent text-right font-mono font-bold text-white text-sm focus:outline-none"
            />
          </div>

          {/* Booking Code Notification */}
          {bookingCode && (
            <div className="p-3 bg-blue-950/80 border border-blue-500/60 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-blue-300 block font-semibold">BOOKING CODE (FOR CASHIER):</span>
                <span className="text-base font-mono font-black text-yellow-300">{bookingCode}</span>
                <span className="text-[10px] text-slate-400 block">Bring code or QR to cashier desk</span>
              </div>
              <button
                onClick={copyBookingCode}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleBookBet}
              className="py-3 font-bold rounded-xl text-xs transition border flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 active:scale-95 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-sky-400" />
              <span>{t.bookBet}</span>
            </button>

            {user.isLoggedIn ? (
              <button
                onClick={handlePlaceBet}
                disabled={isPlacing}
                className="py-3 font-black rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-lg bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 shadow-emerald-600/30 active:scale-95 cursor-pointer"
              >
                <span>{isPlacing ? 'Placing...' : t.placeBet}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (onOpenAuth) onOpenAuth();
                  else handlePlaceBet();
                }}
                className="py-3 font-black rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 shadow-amber-500/30 active:scale-95 cursor-pointer"
              >
                <LogIn className="w-4 h-4 stroke-[2.5]" />
                <span>Sign In to Bet</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
