import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Camera
} from 'lucide-react';
import { UserAccount, OfflineSlip } from '../types';
import { parseAndVerifyQRPayload } from '../utils/qrUtils';
import { getOfflineSlipByCode, markSlipPaid } from '../utils/betAndTransactionStore';
import { recordCashierTicketPaid } from '../utils/cashierStore';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onOpenAuth?: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenAuth,
}) => {
  const [scannedInput, setScannedInput] = useState('');
  const [scannedSlip, setScannedSlip] = useState<OfflineSlip | null>(null);
  const [scanResult, setScanResult] = useState<{
    status: 'idle' | 'success' | 'denied' | 'invalid';
    message: string;
  }>({ status: 'idle', message: '' });
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const isStaffAuthorized = user.isLoggedIn && (user.role === 'cashier' || user.role === 'admin');

  const handleSimulateScan = (inputVal?: string) => {
    setPayoutSuccess(null);
    const text = (inputVal || scannedInput).trim();
    if (!text) return;

    if (!isStaffAuthorized) {
      setScanResult({
        status: 'denied',
        message:
          'SECURITY ACCESS DENIED: Cashier or Admin Authorization Required to Validate and Redeem Betslips. Visitors cannot cash out slips without staff credentials.',
      });
      setScannedSlip(null);
      return;
    }

    const verification = parseAndVerifyQRPayload(text);
    if (!verification.valid) {
      setScanResult({
        status: 'invalid',
        message: verification.error || 'Counterfeit or unreadable barcode.',
      });
      setScannedSlip(null);
      return;
    }

    const slip = getOfflineSlipByCode(verification.bookingCode);
    if (!slip) {
      setScanResult({
        status: 'invalid',
        message: `Slip code "${verification.bookingCode}" not found in registered ticket archive.`,
      });
      setScannedSlip(null);
      return;
    }

    setScannedSlip(slip);
    setScanResult({
      status: 'success',
      message: `QR Verified Authentic! Signature: ${slip.securityHash}. Ready for cashier payout review.`,
    });
  };

  const handleExecutePayout = () => {
    if (!scannedSlip || !isStaffAuthorized) return;
    setIsProcessingPayout(true);

    setTimeout(() => {
      markSlipPaid(
        scannedSlip.id,
        user.username || 'Cashier Station',
        'Branch Counter'
      );
      recordCashierTicketPaid(user.id, scannedSlip.potentialReturn);

      setScannedSlip({
        ...scannedSlip,
        isPaid: true,
        paidAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        paidByCashier: `${user.username} (${user.role.toUpperCase()})`,
      });
      setIsProcessingPayout(false);
      setPayoutSuccess(`Successfully issued ${scannedSlip.potentialReturn.toLocaleString()} ETB cash payout to customer!`);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#151c28] text-white rounded-2xl max-w-lg w-full border border-slate-700/80 shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                ANTI-COUNTERFEIT QR SCANNER
              </h3>
              <p className="text-[11px] text-slate-400">
                Encrypted Slip Authenticator &amp; Cash Payout Terminal
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
        <div className="p-6 space-y-4 text-xs">
          {/* Simulated Scanner Viewport */}
          <div className="relative rounded-2xl aspect-[4/3] bg-gradient-to-b from-black via-slate-950 to-black border-2 border-slate-700/80 overflow-hidden flex flex-col items-center justify-center p-4 text-center">
            <div className="w-44 h-44 border-2 border-dashed border-emerald-400/70 rounded-2xl relative flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.2)]">
              <div className="absolute inset-x-0 h-0.5 bg-emerald-400 animate-pulse top-1/2" />
              <Camera className="w-8 h-8 text-emerald-400/60" />
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              Point camera or laser barcode reader at the official Chartebet ticket QR code
            </p>
          </div>

          {/* Manual Input / Scan Barcode string */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 block">
              Scan Barcode Input or Paste QR Payload / Code:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={scannedInput}
                onChange={(e) => setScannedInput(e.target.value)}
                placeholder="e.g. CC9768268 or encrypted payload"
                className="flex-1 bg-[#0e131d] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs uppercase focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => handleSimulateScan()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Scan Code
              </button>
            </div>
            <div className="flex gap-1.5 pt-1">
              <span className="text-[10px] text-slate-500">Quick Test Slips:</span>
              <button
                onClick={() => {
                  setScannedInput('CC9768268');
                  handleSimulateScan('CC9768268');
                }}
                className="text-[10px] text-blue-400 hover:underline font-mono cursor-pointer"
              >
                CC9768268
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setScannedInput('CC8855610');
                  handleSimulateScan('CC8855610');
                }}
                className="text-[10px] text-blue-400 hover:underline font-mono cursor-pointer"
              >
                CC8855610
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setScannedInput('CC4499112');
                  handleSimulateScan('CC4499112');
                }}
                className="text-[10px] text-blue-400 hover:underline font-mono cursor-pointer"
              >
                CC4499112
              </button>
            </div>
          </div>

          {/* DENIED STATUS FOR UNAUTHENTICATED USERS */}
          {scanResult.status === 'denied' && (
            <div className="p-4 bg-red-950/90 border-2 border-red-500 rounded-2xl text-red-200 space-y-2 animate-in zoom-in-95">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>SECURITY ACCESS DENIED</span>
              </div>
              <p className="text-xs leading-relaxed">{scanResult.message}</p>
              <div className="pt-1 flex gap-2">
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenAuth) onOpenAuth();
                  }}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs cursor-pointer"
                >
                  Log In with Staff / Admin Credentials
                </button>
              </div>
            </div>
          )}

          {/* INVALID BARCODE */}
          {scanResult.status === 'invalid' && (
            <div className="p-3 bg-amber-950/80 border border-amber-500 rounded-xl text-amber-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{scanResult.message}</span>
            </div>
          )}

          {/* PAYOUT SUCCESS MESSAGE */}
          {payoutSuccess && (
            <div className="p-3 bg-emerald-950/90 border border-emerald-500 rounded-xl text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{payoutSuccess}</span>
            </div>
          )}

          {/* VERIFIED SLIP DETAILS & CASHOUT ACTION (Only for Cashier/Admin) */}
          {scannedSlip && isStaffAuthorized && (
            <div className="p-4 bg-[#0e131d] rounded-2xl border border-emerald-500/50 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono font-black text-sm text-yellow-400">{scannedSlip.bookingCode}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  scannedSlip.isPaid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {scannedSlip.isPaid ? 'ALREADY CASHED OUT' : 'READY FOR PAYOUT'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#151c28] p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">Customer Phone:</span>
                  <strong className="text-white font-mono">{scannedSlip.userPhone || 'Walk-in'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Odds:</span>
                  <strong className="text-yellow-400 font-mono">{scannedSlip.totalOdds.toFixed(2)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Original Stake:</span>
                  <strong className="text-white font-mono">{scannedSlip.stake} ETB</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Payout Win Amount:</span>
                  <strong className="text-emerald-400 font-mono font-black text-sm">
                    {scannedSlip.potentialReturn.toLocaleString()} ETB
                  </strong>
                </div>
              </div>

              <div className="space-y-1 max-h-32 overflow-y-auto">
                {scannedSlip.selections.map((s, idx) => (
                  <div key={idx} className="p-2 bg-[#121620] rounded-lg border border-slate-800 flex justify-between items-center text-[10px]">
                    <span className="text-slate-200 truncate">{s.matchTitle} ({s.selectionName})</span>
                    <span className="font-mono text-yellow-400 font-bold">{s.odds.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {!scannedSlip.isPaid ? (
                <button
                  onClick={handleExecutePayout}
                  disabled={isProcessingPayout}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <DollarSign className="w-4 h-4 stroke-[3]" />
                  <span>
                    {isProcessingPayout
                      ? 'PROCESSING PAYOUT...'
                      : `ISSUE CASH PAYOUT (${scannedSlip.potentialReturn.toLocaleString()} ETB)`}
                  </span>
                </button>
              ) : (
                <div className="text-center py-2 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-xs">
                  ✓ Ticket was cashed out by {scannedSlip.paidByCashier || 'Cashier'} at {scannedSlip.paidAt || 'Earlier'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
