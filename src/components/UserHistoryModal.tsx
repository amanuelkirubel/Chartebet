import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Receipt, 
  CreditCard, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { UserAccount, Language, UserBetHistoryItem } from '../types';
import { 
  getUserBetsFiltered, 
  getUserTransactionsFiltered, 
  UnifiedTransaction 
} from '../utils/betAndTransactionStore';
import { TicketGamesListModal } from './TicketGamesListModal';
import { settleAllPendingBets } from '../utils/settlement';

interface UserHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  currentLang: Language;
}

export const UserHistoryModal: React.FC<UserHistoryModalProps> = ({
  isOpen,
  onClose,
  user,
  currentLang,
}) => {
  const [activeTab, setActiveTab] = useState<'bets' | 'transactions'>('bets');

  // Bet History filter (Today, Weeks, Months, All)
  const [betTimeFilter, setBetTimeFilter] = useState<'today' | 'weeks' | 'months' | 'all'>('today');
  const [betsList, setBetsList] = useState<UserBetHistoryItem[]>([]);

  // Selected bet to view all games list (Requirement 2)
  const [selectedBetForGamesList, setSelectedBetForGamesList] = useState<UserBetHistoryItem | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  // Transaction History filter (Pending Deposits/Withdrawals, Paid/Confirmed, All)
  const [txFilter, setTxFilter] = useState<'pending' | 'confirmed_paid' | 'all'>('all');
  const [transactionsList, setTransactionsList] = useState<UnifiedTransaction[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const uId = user.id || 'GUEST';
    const load = () => {
      if (cancelled) return;
      setBetsList(getUserBetsFiltered(uId, betTimeFilter));
      setTransactionsList(getUserTransactionsFiltered(uId, txFilter));
    };
    load();
    // Check real results, then reload so won/lost colors and winnings are up to date
    settleAllPendingBets().then(load).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isOpen, user.id, betTimeFilter, txFilter, refreshTick]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
        <div className="bg-[#151c28] text-white rounded-2xl max-w-2xl w-full border border-slate-700/80 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="font-bold text-base text-white">
                  {currentLang === 'am' ? 'የአካውንት ታሪክ (History)' : 'Account History & Records'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  User: <span className="text-slate-200 font-semibold">{user.username}</span> • ID: <span className="font-mono text-slate-200">{user.id}</span>
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

          {/* Tab switchers: Bet History vs Transaction History */}
          <div className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
            <div className="grid grid-cols-2 bg-[#0e131d] p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('bets')}
                className={`py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'bets' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>{currentLang === 'am' ? 'የውርርድ ታሪክ (Bet History)' : 'Bet History'}</span>
                <span className="bg-slate-900/60 text-slate-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono ml-1">
                  {betsList.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'transactions' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>{currentLang === 'am' ? 'የግብይት ታሪክ (Transaction History)' : 'Transaction History'}</span>
                <span className="bg-slate-900/60 text-slate-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono ml-1">
                  {transactionsList.length}
                </span>
              </button>
            </div>

            {/* TAB 1: BET HISTORY (Requirement 2: Make bets clickable to open all game list) */}
            {activeTab === 'bets' && (
              <div className="space-y-3">
                {/* Bet History Filter Bar */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
                  <span className="text-[11px] font-bold text-slate-400">
                    {currentLang === 'am' ? 'በጊዜ ይለዩ:' : 'Filter By Time:'}
                  </span>
                  <div className="flex gap-1 bg-[#0e131d] p-1 rounded-xl border border-slate-800">
                    {(['today', 'weeks', 'months', 'all'] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => setBetTimeFilter(range)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${
                          betTimeFilter === range ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {range === 'today' ? 'Today' : range === 'weeks' ? 'Weeks' : range === 'months' ? 'Months' : 'All'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-2 bg-blue-950/30 border border-blue-500/30 rounded-xl text-[11px] text-blue-300 flex items-center justify-between">
                  <span>💡 <strong>Tip:</strong> Click on any bet card to view full game breakdown &amp; selections.</span>
                </div>

                {betsList.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-2 bg-[#0e131d] rounded-2xl border border-slate-800">
                    <Receipt className="w-10 h-10 mx-auto text-slate-600" />
                    <p className="font-semibold text-sm text-white">No bets placed in this period</p>
                    <p className="text-[11px] text-slate-500">Your placed soccer bets and games will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {betsList.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBetForGamesList(b)}
                        className={`p-3.5 rounded-xl border border-l-4 space-y-2 transition cursor-pointer group shadow-sm ${
                          b.status === 'won'
                            ? 'bg-emerald-950/40 border-emerald-500/50 border-l-emerald-400 hover:border-emerald-400 hover:bg-emerald-950/60'
                            : b.status === 'lost'
                            ? 'bg-red-950/40 border-red-500/50 border-l-red-500 hover:border-red-400 hover:bg-red-950/60'
                            : 'bg-[#0e131d] border-slate-800 border-l-amber-500 hover:border-blue-500/80 hover:bg-[#121824]'
                        }`}
                        title="Click to view all games in this bet ticket"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800/80">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-yellow-400 text-xs group-hover:text-yellow-300">
                              #{b.ticketId}
                            </span>
                            <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-semibold">
                              {b.gameType}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(b.createdAt).toLocaleString()}
                            </span>
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                b.status === 'won'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : b.status === 'lost'
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              }`}
                            >
                              {b.cashedOut ? 'cashed out' : b.status}
                            </span>
                          </div>
                        </div>

                        {/* Match details line with clickable hint */}
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-slate-300 font-semibold group-hover:text-white transition truncate">
                            {b.details}
                          </p>
                          <span className="text-blue-400 group-hover:translate-x-0.5 transition flex items-center gap-0.5 text-[11px] font-bold shrink-0">
                            <span>Open Games</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400 border-t border-slate-800/60">
                          <div>
                            <span>Stake: </span>
                            <strong className="text-white font-mono">{b.stake} ETB</strong>
                          </div>
                          {b.status === 'won' ? (
                            <div className="flex items-center gap-1.5 text-emerald-400 font-black">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Win</span>
                              <span className="font-mono text-sm">{(b.payoutAmount ?? b.potentialReturn).toFixed(2)} ETB</span>
                            </div>
                          ) : b.status === 'lost' ? (
                            <div className="flex items-center gap-1.5 text-red-400 font-black">
                              <XCircle className="w-4 h-4" />
                              <span>Lost</span>
                              <span className="font-mono text-sm">-{b.stake.toFixed(2)} ETB</span>
                            </div>
                          ) : (
                            <div>
                              <span>Potential Return: </span>
                              <strong className="text-amber-400 font-mono">
                                {b.potentialReturn.toFixed(2)} ETB
                              </strong>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: TRANSACTION HISTORY */}
            {activeTab === 'transactions' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
                  <span className="text-[11px] font-bold text-slate-400">Filter By Status:</span>
                  <div className="flex gap-1 bg-[#0e131d] p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setTxFilter('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        txFilter === 'all' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setTxFilter('pending')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        txFilter === 'pending' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => setTxFilter('confirmed_paid')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        txFilter === 'confirmed_paid' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Paid / Confirmed
                    </button>
                  </div>
                </div>

                {transactionsList.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-2 bg-[#0e131d] rounded-2xl border border-slate-800">
                    <CreditCard className="w-10 h-10 mx-auto text-slate-600" />
                    <p className="font-semibold text-sm text-white">No transactions found</p>
                    <p className="text-[11px] text-slate-500">Your deposit confirmations and withdrawals will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {transactionsList.map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl bg-[#0e131d] border border-slate-800 flex items-center justify-between hover:border-slate-700 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              p.type === 'deposit'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            {p.type === 'deposit' ? (
                              <ArrowDownCircle className="w-5 h-5" />
                            ) : (
                              <ArrowUpCircle className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs flex items-center gap-2">
                              <span className="uppercase tracking-wider">
                                {p.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                              </span>
                              <span
                                className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                                  p.status === 'approved'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : p.status === 'rejected'
                                      ? 'bg-red-500/20 text-red-400'
                                      : 'bg-amber-500/20 text-amber-400'
                                }`}
                              >
                                {p.status === 'approved' ? 'CONFIRMED & PAID' : p.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400">{p.bankName} • Ref: {p.referenceNumber}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {new Date(p.date).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`font-mono font-black text-sm ${
                              p.type === 'deposit' ? 'text-emerald-400' : 'text-blue-400'
                            }`}
                          >
                            {p.type === 'deposit' ? '+' : '-'}
                            {p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for all game list breakdown when user clicks a bet */}
      <TicketGamesListModal
        bet={selectedBetForGamesList}
        isOpen={Boolean(selectedBetForGamesList)}
        onClose={() => setSelectedBetForGamesList(null)}
        currentLang={currentLang}
        userRole={user.role}
        onCashedOut={() => {
          setRefreshTick((n) => n + 1);
          setSelectedBetForGamesList(null);
        }}
      />
    </>
  );
};
