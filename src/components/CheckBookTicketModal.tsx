import React, { useState } from 'react';
import { 
  X, 
  Receipt, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  QrCode, 
  Copy, 
  Check,
  Lock
} from 'lucide-react';
import { Language, OfflineSlip, UserRole } from '../types';
import { getOfflineSlipByCode } from '../utils/betAndTransactionStore';
import { generateSVGQRCode } from '../utils/qrUtils';

interface CheckBookTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  userRole?: UserRole;
}

export const CheckBookTicketModal: React.FC<CheckBookTicketModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  userRole = 'customer',
}) => {
  const [searchCode, setSearchCode] = useState('');
  const [ticket, setTicket] = useState<OfflineSlip | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const canPrint = userRole === 'admin' || userRole === 'cashier';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const clean = searchCode.trim().toUpperCase();
    if (!clean) return;

    const found = getOfflineSlipByCode(clean);
    setTicket(found || null);
  };

  const handleCopy = () => {
    if (!ticket) return;
    navigator.clipboard.writeText(ticket.bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (!canPrint) return;
    try {
      window.print();
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#151c28] text-white rounded-2xl max-w-lg w-full border border-slate-700/80 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {currentLang === 'am' ? 'ቲኬት መፈተሻ (Check Ticket)' : 'Check Booked Ticket'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Ground terminal ticket verification &amp; outcome status
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

        {/* Content */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="text-[11px] font-bold text-slate-300 block">
              Enter Booking Code or Ticket ID:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="e.g. CC9768268 or CC8855610"
                  className="w-full bg-[#0e131d] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-mono font-bold text-xs uppercase focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Inspect
              </button>
            </div>
          </form>

          {/* Ticket Display if found */}
          {ticket ? (
            <div className="p-4 bg-[#0e131d] rounded-2xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">TICKET ID</span>
                  <span className="text-base font-mono font-black text-yellow-400">{ticket.bookingCode}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">PAYOUT STATUS</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      ticket.isPaid
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : ticket.status === 'won'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    }`}
                  >
                    {ticket.isPaid ? 'PAID & CASHED OUT' : ticket.status === 'won' ? 'WON (READY FOR CASH OUT)' : 'PENDING MATCHES'}
                  </span>
                </div>
              </div>

              {/* QR Code thumbnail */}
              <div className="flex items-center gap-3 bg-[#151c28] p-3 rounded-xl border border-slate-800">
                <div
                  className="w-16 h-16 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center text-slate-950"
                  dangerouslySetInnerHTML={{ __html: generateSVGQRCode(ticket.qrPayload || ticket.bookingCode, 60) }}
                />
                <div className="space-y-0.5 text-[11px]">
                  <span className="font-bold text-white block">Anti-Counterfeit Protection</span>
                  <span className="text-slate-400 block font-mono text-[10px]">Sig: {ticket.securityHash}</span>
                  <button
                    onClick={handleCopy}
                    className="text-blue-400 hover:underline flex items-center gap-1 font-bold text-[10px] pt-0.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Code Copied' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              {/* Financial calculations */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#151c28] p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Odds:</span>
                  <strong className="text-yellow-400 font-mono text-sm">{ticket.totalOdds.toFixed(2)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Stake Amount:</span>
                  <strong className="text-white font-mono text-sm">{ticket.stake} ETB</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Potential Return:</span>
                  <strong className="text-emerald-400 font-mono text-sm font-black">
                    {ticket.potentialReturn.toLocaleString()} ETB
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Booked Date:</span>
                  <strong className="text-slate-200 font-mono text-[10px]">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </strong>
                </div>
              </div>

              {/* Selections List */}
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {ticket.selections.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-[#121620] rounded-lg border border-slate-800 flex justify-between items-center text-[10px]"
                  >
                    <div>
                      <span className="text-white font-bold block">{s.matchTitle}</span>
                      <span className="text-slate-400">{s.marketType}: {s.selectionName}</span>
                    </div>
                    <span className="font-mono font-bold text-yellow-400">{s.odds.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Requirement 1: Print option is only for admin and cashier */}
              {canPrint ? (
                <button
                  onClick={handlePrint}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-slate-700 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Print Ticket Slip</span>
                </button>
              ) : (
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-500 text-[10px] flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Printing is reserved for Cashier and Admin stations</span>
                </div>
              )}
            </div>
          ) : hasSearched ? (
            <div className="p-8 text-center text-slate-400 space-y-2 border border-dashed border-slate-800 rounded-2xl">
              <AlertCircle className="w-8 h-8 mx-auto text-amber-500" />
              <p className="font-bold text-white text-sm">No ticket found for: {searchCode}</p>
              <p className="text-[11px] text-slate-500">
                Please double check your booking code characters or generate a new slip.
              </p>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 space-y-2 bg-[#0e131d] rounded-2xl border border-slate-800">
              <QrCode className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs text-slate-300">
                Enter any 9-digit booking code to verify bet choices, odds, and payout status.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
