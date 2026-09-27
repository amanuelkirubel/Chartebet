import React from 'react';
import { 
  X, 
  Receipt, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  ShieldCheck, 
  MapPin, 
  Share2 
} from 'lucide-react';
import { UserBetHistoryItem, Language, UserRole } from '../types';

interface TicketGamesListModalProps {
  bet: UserBetHistoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  userRole?: UserRole;
}

export const TicketGamesListModal: React.FC<TicketGamesListModalProps> = ({
  bet,
  isOpen,
  onClose,
  currentLang,
  userRole = 'customer',
}) => {
  if (!isOpen || !bet) return null;

  const canPrint = userRole === 'admin' || userRole === 'cashier';

  const handlePrint = () => {
    if (!canPrint) return;
    try {
      window.print();
    } catch (e) {}
  };

  // If selections array isn't explicitly populated (e.g. from an old format or casino game), parse from details string
  const selections = bet.selections && bet.selections.length > 0
    ? bet.selections
    : bet.details.split(',').map((item, idx) => ({
        matchId: `m-${idx}`,
        matchTitle: item.trim(),
        marketType: 'Selection',
        selectionName: 'Pick',
        odds: bet.totalOdds ? Number((bet.totalOdds ** (1 / Math.max(1, bet.details.split(',').length))).toFixed(2)) : 1.5,
        status: bet.status,
      }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#151c28] text-white rounded-2xl max-w-lg w-full border border-slate-700/80 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  {currentLang === 'am' ? 'የቲኬት ዝርዝር እና የጨዋታዎች ዝርዝር' : 'Ticket Game List & Details'}
                </h3>
                <span className="font-mono text-xs font-bold text-yellow-400">
                  #{bet.ticketId}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {bet.gameType} • {new Date(bet.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Summary Box */}
          <div className="bg-[#0e131d] p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-bold text-slate-400">TICKET STATUS</span>
              <span
                className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${
                  bet.status === 'won'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : bet.status === 'lost'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}
              >
                {bet.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#121620] p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Stake</span>
                <span className="font-mono font-bold text-white text-xs sm:text-sm">
                  {bet.stake.toLocaleString()} ETB
                </span>
              </div>
              <div className="bg-[#121620] p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Total Odds</span>
                <span className="font-mono font-bold text-yellow-400 text-xs sm:text-sm">
                  {bet.totalOdds ? bet.totalOdds.toFixed(2) : (bet.potentialReturn / Math.max(1, bet.stake)).toFixed(2)}
                </span>
              </div>
              <div className="bg-[#121620] p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Potential Win</span>
                <span className="font-mono font-black text-emerald-400 text-xs sm:text-sm">
                  {bet.potentialReturn.toLocaleString()} ETB
                </span>
              </div>
            </div>
          </div>

          {/* All Games List Header */}
          <div className="flex items-center justify-between pt-1">
            <h4 className="font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>GAMES IN THIS BET TICKET</span>
              <span className="bg-blue-600/30 text-blue-300 font-mono text-[10px] px-1.5 py-0.2 rounded-full">
                {selections.length} Games
              </span>
            </h4>
            <span className="text-[10px] text-slate-400">Match &amp; Selection Breakdown</span>
          </div>

          {/* All Games List Cards */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {selections.map((sel, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#0e131d] rounded-xl border border-slate-800 hover:border-slate-700 transition space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <strong className="text-xs text-white font-bold">{sel.matchTitle}</strong>
                  </div>

                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      sel.status === 'won'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : sel.status === 'lost'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {sel.status || bet.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] bg-[#121620] px-3 py-1.5 rounded-lg border border-slate-800/80">
                  <div>
                    <span className="text-slate-400 mr-1.5">{sel.marketType}:</span>
                    <span className="font-bold text-yellow-400">{sel.selectionName}</span>
                  </div>
                  <div className="font-mono font-bold text-emerald-400">
                    Odds: {sel.odds.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
            {/* Requirement 1: Print option is only for admin and cashier */}
            {canPrint ? (
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
                title="Print ticket receipt (Admin/Cashier only)"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Print Ticket</span>
              </button>
            ) : (
              <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Print option available at cashier/admin terminals</span>
              </span>
            )}

            <button
              onClick={onClose}
              className="ml-auto px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
