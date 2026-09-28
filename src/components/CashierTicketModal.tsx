import React, { useState, useEffect } from 'react';
import { 
  X, 
  Receipt, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Filter
} from 'lucide-react';
import { UserAccount, Language, OfflineSlip } from '../types';
import { 
  getAllCashiers, 
  getCashierById, 
  recordCashierTicketPaid, 
  CashierAccount 
} from '../utils/cashierStore';
import { 
  getOfflineSlipByCode, 
  markSlipPayoutPaid, 
  getPaidSlipsFiltered 
} from '../utils/betAndTransactionStore';
import { settleAllPendingBets } from '../utils/settlement';

interface CashierTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  currentLang: Language;
}

export const CashierTicketModal: React.FC<CashierTicketModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [activeTab, setActiveTab] = useState<'pay_search' | 'paid_slips' | 'performance'>('pay_search');
  const [cashierStation, setCashierStation] = useState<CashierAccount | null>(null);

  // Search single unpaid slip
  const [ticketSearchCode, setTicketSearchCode] = useState('');
  const [foundSlip, setFoundSlip] = useState<OfflineSlip | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [paySuccessMsg, setPaySuccessMsg] = useState<string | null>(null);

  // Paid slips browser with Day, Week, Month, All filters
  const [paidFilter, setPaidFilter] = useState<'day' | 'week' | 'month' | 'all'>('day');
  const [paidSlipsList, setPaidSlipsList] = useState<OfflineSlip[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSearchError(null);
      setPaySuccessMsg(null);
      setFoundSlip(null);
      const allStations = getAllCashiers();
      const current = getCashierById(user.id) || allStations[0];
      setCashierStation(current || null);
      setPaidSlipsList(getPaidSlipsFiltered(paidFilter));
    }
  }, [isOpen, user.id, paidFilter]);

  if (!isOpen) return null;

  const canPrint = user.isLoggedIn && (user.role === 'cashier' || user.role === 'admin');

  const handleSearchTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setPaySuccessMsg(null);
    setFoundSlip(null);

    const query = ticketSearchCode.trim().toUpperCase();
    if (!query) {
      setSearchError('Please enter a booking code or ticket ID.');
      return;
    }

    try {
      await settleAllPendingBets();
    } catch (err) {}
    const slip = getOfflineSlipByCode(query);
    if (!slip) {
      setSearchError(`No ticket or booking code found matching "${query}".`);
      return;
    }

    setFoundSlip(slip);
  };

  const handlePayTicket = () => {
    if (!foundSlip || !cashierStation) return;

    if (foundSlip.payoutPaid) {
      setSearchError('This ticket has already been marked as PAID and cashed out.');
      return;
    }
    if (foundSlip.status !== 'won') {
      setSearchError(
        foundSlip.status === 'lost'
          ? 'This ticket LOST. No payout is due.'
          : 'This ticket is still pending: not every game has finished yet. No payout yet.'
      );
      return;
    }

    const winAmount = foundSlip.payoutAmount ?? foundSlip.potentialReturn;
    markSlipPayoutPaid(foundSlip.id, cashierStation.name, cashierStation.branch);
    recordCashierTicketPaid(cashierStation.id, winAmount);

    const updated = getCashierById(cashierStation.id);
    if (updated) setCashierStation(updated);

    setFoundSlip({ ...foundSlip, payoutPaid: true });
    setPaidSlipsList(getPaidSlipsFiltered(paidFilter));
    setPaySuccessMsg(`Successfully paid out ${winAmount.toLocaleString()} ETB to customer! Record logged under ${cashierStation.stationName}.`);
  };

  const handlePrintSlip = () => {
    if (!canPrint) return;
    try {
      window.print();
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#151c28] text-white rounded-2xl max-w-2xl w-full border border-slate-700/80 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Cashier Terminal Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-white">
                  CASHIER TERMINAL &amp; BRANCH DESK
                </h3>
                <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase">
                  STAFF TERMINAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Station: <strong>{cashierStation?.stationName || 'Bole Station 1'}</strong></span>
                <span>• Branch: <strong>{cashierStation?.branch || 'Bole Medhanealem'}</strong></span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switchers */}
        <div className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          <div className="grid grid-cols-3 bg-[#0e131d] p-1 rounded-xl border border-slate-800 text-[11px]">
            <button
              onClick={() => setActiveTab('pay_search')}
              className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'pay_search' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Search &amp; Redeem</span>
            </button>

            <button
              onClick={() => setActiveTab('paid_slips')}
              className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'paid_slips' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Paid Slips ({paidSlipsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('performance')}
              className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'performance' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Metrics</span>
            </button>
          </div>

          {/* TAB 1: SEARCH & PAY TICKET */}
          {activeTab === 'pay_search' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-[11px] text-blue-200">
                🔒 <strong>Privacy Policy:</strong> To protect customer confidentiality, unpaid slips are not listed until the specific booking code is searched or pasted.
              </div>

              <form onSubmit={handleSearchTicket} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={ticketSearchCode}
                    onChange={(e) => setTicketSearchCode(e.target.value)}
                    placeholder="Enter Booking Code (e.g. CC9768268, CC8855610, CC4499112)"
                    className="w-full bg-[#0e131d] border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white font-mono font-bold text-xs uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow cursor-pointer"
                >
                  Lookup Slip
                </button>
              </form>

              {searchError && (
                <div className="p-3 bg-red-950/80 border border-red-500 rounded-xl text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              {paySuccessMsg && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{paySuccessMsg}</span>
                </div>
              )}

              {foundSlip && (
                <div className="p-4 bg-[#0e131d] rounded-2xl border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">TICKET ID / CODE</span>
                      <span className="text-base font-mono font-black text-yellow-400">{foundSlip.bookingCode}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">STATUS</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        foundSlip.payoutPaid || foundSlip.status === 'won'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : foundSlip.status === 'lost'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}>
                        {foundSlip.payoutPaid
                          ? 'PAID & REDEEMED'
                          : foundSlip.status === 'won'
                          ? 'WON / READY FOR PAYOUT'
                          : foundSlip.status === 'lost'
                          ? 'LOST'
                          : 'PENDING GAMES'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-[#151c28] p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Customer Phone:</span>
                      <strong className="text-white font-mono">{foundSlip.userPhone || 'Walk-in'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Odds:</span>
                      <strong className="text-yellow-400 font-mono">{foundSlip.totalOdds.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Betted Stake:</span>
                      <strong className="text-white font-mono">{foundSlip.stake} ETB</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Payout Birr:</span>
                      <strong className="text-emerald-400 font-mono font-black text-sm">
                        {(foundSlip.status === 'lost' ? 0 : foundSlip.payoutAmount ?? foundSlip.potentialReturn).toLocaleString()} ETB
                      </strong>
                    </div>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {foundSlip.selections.map((sel: any, idx: number) => (
                      <div key={idx} className="p-2 bg-[#121620] rounded-lg border border-slate-800 flex justify-between items-center text-[11px]">
                        <div>
                          <span className="text-white font-bold">{sel.matchTitle}</span>
                          <span className="text-slate-400 block text-[10px]">{sel.marketType}: <strong className="text-slate-200">{sel.selectionName}</strong></span>
                        </div>
                        <span className="font-mono font-bold text-yellow-400">{sel.odds.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    {/* Requirement 1: Print option is only for admin and cashier */}
                    {canPrint && (
                      <button
                        onClick={handlePrintSlip}
                        className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-slate-600 cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Betslip</span>
                      </button>
                    )}
                    <button
                      onClick={handlePayTicket}
                      disabled={Boolean(foundSlip.payoutPaid) || foundSlip.status !== 'won'}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow disabled:opacity-40 cursor-pointer"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>
                        {foundSlip.payoutPaid
                          ? 'Already Paid'
                          : foundSlip.status === 'won'
                          ? `Cash Out ${(foundSlip.payoutAmount ?? foundSlip.potentialReturn).toLocaleString()} ETB`
                          : foundSlip.status === 'lost'
                          ? 'Ticket Lost'
                          : 'Waiting for games'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PAID SLIPS */}
          {activeTab === 'paid_slips' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-xs text-slate-300">Filter Paid Slips By:</span>
                <div className="flex gap-1 bg-[#0e131d] p-1 rounded-xl border border-slate-800">
                  {(['day', 'week', 'month', 'all'] as const).map((filterOpt) => (
                    <button
                      key={filterOpt}
                      onClick={() => setPaidFilter(filterOpt)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${
                        paidFilter === filterOpt ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {filterOpt === 'day' ? 'Today' : filterOpt}
                    </button>
                  ))}
                </div>
              </div>

              {paidSlipsList.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-[#0e131d] rounded-2xl border border-slate-800 space-y-1">
                  <Receipt className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="font-semibold text-white">No paid slips found for this period</p>
                  <p className="text-[11px] text-slate-400">Paid slips will appear here once cashed out.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {paidSlipsList.map((slip) => (
                    <div
                      key={slip.id}
                      className="p-3 bg-[#0e131d] rounded-xl border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-yellow-400">{slip.bookingCode}</span>
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                            PAID OUT
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1">
                          Paid by: <strong>{slip.paidByCashier || 'Branch Cashier'}</strong> • {slip.paidAt || 'Earlier'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Customer: {slip.customerName} ({slip.userPhone || 'Walk-in'})
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-black text-sm text-emerald-400 block">
                          +{slip.potentialReturn.toLocaleString()} ETB
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Stake: {slip.stake} ETB • Odds: {slip.totalOdds.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SHIFT PERFORMANCE */}
          {activeTab === 'performance' && cashierStation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-[#0e131d] border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Tickets Issued</span>
                  <span className="text-xl font-black font-mono text-white">{cashierStation.performance.totalTicketsCreated}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0e131d] border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Cashed Out</span>
                  <span className="text-xl font-black font-mono text-amber-400">{cashierStation.performance.totalTicketsPaid}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0e131d] border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Paid to Winners</span>
                  <span className="text-lg font-black font-mono text-red-400">
                    {cashierStation.performance.totalAmountPaidToWinners.toLocaleString()} ETB
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#0e131d] border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Net Profit/Loss</span>
                  <span className={`text-lg font-black font-mono ${
                    cashierStation.performance.netProfitOrLoss >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {cashierStation.performance.netProfitOrLoss.toLocaleString()} ETB
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
