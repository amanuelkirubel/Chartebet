import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, Language } from '../types';
import { getOfflineSlipByCode, markSlipPaid } from '../utils/betAndTransactionStore';
import { recordCashierTicketCreated } from '../utils/cashierStore';

interface PayAndPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  currentLang: Language;
}

export const PayAndPrintModal: React.FC<PayAndPrintModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [bookingCode, setBookingCode] = useState('');
  const [slip, setSlip] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cashReceived, setCashReceived] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  if (!isOpen) return null;

  // Requirement 1: Only admin and cashier can access and print
  const canPrint = user.isLoggedIn && (user.role === 'cashier' || user.role === 'admin');

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSlip(null);
    setCashReceived(false);

    const query = bookingCode.trim().toUpperCase();
    if (!query) {
      setErrorMsg('Please enter the customer booking code or ticket ID.');
      return;
    }

    const found = getOfflineSlipByCode(query);
    if (!found) {
      setErrorMsg(`No booking code found matching "${query}". Ask customer to check their device code.`);
      return;
    }

    setSlip(found);
    if (found.isPaid) {
      setCashReceived(true);
    }
  };

  const safePrint = () => {
    if (!canPrint) return;
    try {
      window.print();
    } catch (err) {
      console.warn('Print suppressed', err);
    }
  };

  const handleConfirmCashAndPrint = () => {
    if (!slip) return;
    setIsProcessing(true);

    try {
      markSlipPaid(slip.id, user.username || user.email || 'Cashier Counter', 'Branch Counter');
      recordCashierTicketCreated(user.id || 'CSH-01', slip.stake);

      setSlip((prev: any) => ({
        ...prev,
        isPaid: true,
        paidAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        paidByCashier: `${user.username || 'Cashier Desk'} (Branch Counter)`,
      }));

      try {
        confetti({ particleCount: 90, spread: 75 });
      } catch (e) {}

      setTimeout(() => {
        safePrint();
      }, 300);

      setCashReceived(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyReceiptText = () => {
    if (!slip) return;
    const lines = [
      '==================================',
      '     CHARTEBET SPORTS ARENA       ',
      '     OFFICIAL BETSLIP RECEIPT     ',
      '==================================',
      `TICKET ID:   ${slip.bookingCode}`,
      `DATE:        ${new Date(slip.createdAt).toLocaleString()}`,
      `CASHIER:     ${user.username || 'Cashier Desk'}`,
      `CUSTOMER:    ${slip.userPhone || 'Walk-in Guest'}`,
      '----------------------------------',
      'SELECTIONS:',
      ...slip.selections.map((s: any, idx: number) => 
        ` ${idx + 1}. ${s.matchTitle}\n    ${s.selectionName} (${s.marketType}) @ ${s.odds}`
      ),
      '----------------------------------',
      `TOTAL ODDS:       ${slip.totalOdds.toFixed(2)}`,
      `STAKE PAID CASH:  ${slip.stake} ETB [CONFIRMED]`,
      `POTENTIAL RETURN: ${slip.potentialReturn.toLocaleString()} ETB`,
      '==================================',
      'Verify: www.chartebet.com',
      '=================================='
    ].join('\n');

    navigator.clipboard.writeText(lines);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2500);
  };

  const handleResetForNext = () => {
    setBookingCode('');
    setSlip(null);
    setErrorMsg(null);
    setCashReceived(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#151c28] text-white rounded-2xl max-w-lg w-full border border-emerald-500/50 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                ACCEPT CODE, CASH &amp; PRINT BETSLIP
              </h3>
              <p className="text-[11px] text-slate-400">
                Cashier &amp; Admin Fast Terminal Shortcut
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Lookup Input Form */}
          <form onSubmit={handleLookup} className="space-y-2">
            <label className="text-[11px] font-bold text-slate-300 block">
              Enter Customer Booking Code:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value)}
                  placeholder="e.g. CC9768268 or CC8855610"
                  className="w-full bg-[#0e131d] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-mono font-bold text-xs uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition shadow cursor-pointer"
              >
                Lookup
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-500 rounded-xl text-red-200 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {cashReceived && slip && (
            <div className="p-3.5 bg-emerald-950/90 border-2 border-emerald-500 rounded-2xl text-emerald-200 space-y-1 animate-in zoom-in-95">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>CASH RECEIVED ({slip.stake} ETB) &amp; BETSLIP ISSUED!</span>
              </div>
              <p className="text-[11px] text-emerald-300">
                Ticket <strong className="font-mono text-white">{slip.bookingCode}</strong> is now officially active in the system.
              </p>
            </div>
          )}

          {slip && (
            <div className="space-y-3">
              <div className="p-4 bg-[#0e131d] rounded-2xl border border-slate-700 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">TICKET ID</span>
                    <span className="text-base font-mono font-black text-yellow-400">{slip.bookingCode}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      {cashReceived ? 'CASH PAID' : 'CASH TO RECEIVE'}
                    </span>
                    <span className={`text-base font-mono font-black ${cashReceived ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {slip.stake} ETB
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-[#151c28] p-2.5 rounded-xl border border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Customer Phone:</span>
                    <strong className="text-white font-mono">{slip.userPhone || 'Walk-in Guest'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Odds:</span>
                    <strong className="text-yellow-400 font-mono">{slip.totalOdds.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Potential Return:</span>
                    <strong className="text-emerald-400 font-mono font-black">
                      {slip.potentialReturn.toLocaleString()} ETB
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Date Placed:</span>
                    <strong className="text-slate-200 font-mono">{new Date(slip.createdAt).toLocaleDateString()}</strong>
                  </div>
                </div>

                {/* Selections List */}
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {slip.selections.map((s: any, i: number) => (
                    <div key={i} className="p-2 bg-[#121620] rounded-lg flex justify-between items-center text-[10px] border border-slate-800/60">
                      <div>
                        <span className="text-white font-bold block">{s.matchTitle}</span>
                        <span className="text-slate-400">{s.selectionName} ({s.marketType})</span>
                      </div>
                      <span className="font-mono font-bold text-yellow-400">{s.odds.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {!cashReceived ? (
                  <button
                    type="button"
                    onClick={handleConfirmCashAndPrint}
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Printer className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {isProcessing ? 'CONFIRMING CASH...' : `ACCEPT CASH (${slip.stake} ETB) & PRINT BETSLIP`}
                    </span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {/* Requirement 1: Print option is only for admin and cashier */}
                    {canPrint && (
                      <button
                        type="button"
                        onClick={safePrint}
                        className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Slip Again</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={copyReceiptText}
                      className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700"
                    >
                      {copiedReceipt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedReceipt ? 'Copied Slip!' : 'Copy Receipt'}</span>
                    </button>
                  </div>
                )}
              </div>

              {cashReceived && (
                <button
                  type="button"
                  onClick={handleResetForNext}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Accept Another Customer Code</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
