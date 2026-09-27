import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  Receipt, 
  MapPin, 
  ShieldCheck,
  Lock
} from 'lucide-react';
import { OfflineSlip, UserRole } from '../types';
import { generateSVGQRCode } from '../utils/qrUtils';

interface OfflineSlipViewModalProps {
  slip: OfflineSlip | null;
  isOpen: boolean;
  onClose: () => void;
  userRole?: UserRole;
}

export const OfflineSlipViewModal: React.FC<OfflineSlipViewModalProps> = ({
  slip,
  isOpen,
  onClose,
  userRole = 'customer',
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !slip) return null;

  const canPrint = userRole === 'admin' || userRole === 'cashier';

  const handleCopy = () => {
    navigator.clipboard.writeText(slip.bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (!canPrint) return;
    try {
      window.print();
    } catch (e) {}
  };

  const qrSvg = generateSVGQRCode(slip.qrPayload || slip.bookingCode, 150);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#151c28] text-white rounded-2xl max-w-md w-full border-2 border-yellow-500/70 shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="bg-yellow-500 text-slate-950 px-6 py-4 flex items-center justify-between font-black">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 fill-slate-950" />
            <div>
              <h3 className="font-black text-base uppercase tracking-tight">
                OFFLINE BETSLIP TICKET
              </h3>
              <p className="text-[11px] font-bold text-slate-900">
                Official Chartebet Counter Receipt
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-950 hover:bg-yellow-600 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Booking Code Display */}
          <div className="bg-gradient-to-r from-yellow-500/10 via-amber-500/20 to-yellow-500/10 border-2 border-yellow-500/50 p-4 rounded-2xl text-center space-y-1">
            <span className="text-[10px] text-amber-300 uppercase tracking-widest font-black block">
              BOOKING CODE / TICKET ID
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-yellow-400 tracking-wider">
              {slip.bookingCode}
            </div>
            <button
              onClick={handleCopy}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 rounded-lg font-bold text-xs transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Code Copied!' : 'Copy Booking Code'}</span>
            </button>
          </div>

          {/* Anti-Counterfeit Encrypted QR Code Card */}
          <div className="bg-white text-slate-950 p-4 rounded-2xl border border-slate-300 flex flex-col items-center justify-center text-center space-y-2">
            <div
              className="w-36 h-36 flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Anti-Counterfeit QR Protected</span>
            </div>
            <span className="text-[9px] font-mono text-slate-500">
              Signature: {slip.securityHash || 'SEC-CB-VERIFIED'}
            </span>
          </div>

          {/* Ticket Key Info */}
          <div className="grid grid-cols-2 gap-2 bg-[#0e131d] p-3 rounded-xl border border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px]">Total Odds:</span>
              <strong className="text-yellow-400 font-mono text-sm">{slip.totalOdds.toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Cash Stake:</span>
              <strong className="text-white font-mono text-sm">{slip.stake} ETB</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Potential Return:</span>
              <strong className="text-emerald-400 font-mono text-sm">
                {slip.potentialReturn.toLocaleString()} ETB
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Status:</span>
              <span className={`font-mono text-xs font-bold uppercase ${slip.isPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                {slip.isPaid ? 'PAID / CASHED OUT' : 'WAITING CASHIER'}
              </span>
            </div>
          </div>

          {/* Selections List */}
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {slip.selections.map((s, i) => (
              <div
                key={i}
                className="p-2.5 bg-[#0e131d] rounded-xl border border-slate-800 flex justify-between items-center text-[11px]"
              >
                <div>
                  <div className="font-bold text-white">{s.matchTitle}</div>
                  <div className="text-[10px] text-slate-400">
                    {s.marketType}: <strong className="text-slate-200">{s.selectionName}</strong>
                  </div>
                </div>
                <div className="font-mono font-bold text-yellow-400">{s.odds.toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-200 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Show this QR code or booking code to any Chartebet cashier. Pay your {slip.stake} ETB stake to validate your bet!
            </span>
          </div>

          {/* Action: Requirement 1 - print option is ONLY for admin and cashier */}
          {canPrint ? (
            <button
              onClick={handlePrint}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition shadow-lg shadow-yellow-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT BETSLIP TICKET</span>
            </button>
          ) : (
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400 text-[11px] flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Print option is exclusively available to Cashier &amp; Admin stations.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
