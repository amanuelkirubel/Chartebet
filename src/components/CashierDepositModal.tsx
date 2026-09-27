import React, { useState } from 'react';
import {
  X,
  Wallet,
  Search,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  UserCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, UserAccount } from '../types';
import { getUserByIdentifier, adminAdjustBalance, RegisteredUser } from '../utils/userStore';
import { addDepositRequest, approveDepositRequest } from '../utils/betAndTransactionStore';

interface CashierDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  cashier: UserAccount;
}

export const CashierDepositModal: React.FC<CashierDepositModalProps> = ({
  isOpen,
  onClose,
  cashier,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [foundUser, setFoundUser] = useState<RegisteredUser | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositComplete, setDepositComplete] = useState(false);
  const [newBalance, setNewBalance] = useState<number | null>(null);

  if (!isOpen) return null;

  const cashierLabel =
    (cashier as any).username || cashier.email || cashier.phone || 'Cashier Desk';

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setFoundUser(null);
    setDepositComplete(false);
    setNewBalance(null);

    const clean = identifier.trim();
    if (!clean) {
      setSearchError('Please enter the customer email or phone number.');
      return;
    }

    const user = getUserByIdentifier(clean);
    if (!user) {
      setSearchError(`No account found for "${clean}". Ask the customer to double check, or they may need to register first.`);
      return;
    }

    setFoundUser(user);
  };

  const handleConfirmDeposit = () => {
    if (!foundUser) return;
    const cashAmount = Number(amount);
    if (!cashAmount || cashAmount <= 0) {
      setSearchError('Enter a valid cash amount received from the customer.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = adminAdjustBalance(foundUser.id, cashAmount, 'add');

      // Record it as an approved deposit so it shows correctly in the customer's transaction history
      const record = addDepositRequest({
        userId: foundUser.id,
        userPhoneOrEmail: foundUser.email || foundUser.phone || identifier,
        userName: foundUser.username,
        amount: cashAmount,
        bankName: 'Cash Desk (In-Person)',
        accountNumber: '-',
        accountHolder: cashierLabel,
        transactionReference: `CASHDESK-${Date.now()}`,
      });
      approveDepositRequest(record.id, cashierLabel);

      if (result.success) {
        setNewBalance(result.newBalance ?? null);
      }

      try {
        confetti({ particleCount: 80, spread: 70 });
      } catch (e) {}

      setDepositComplete(true);
    } catch (err) {
      console.error(err);
      setSearchError('Something went wrong recording the deposit. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetForNext = () => {
    setIdentifier('');
    setFoundUser(null);
    setSearchError(null);
    setAmount('');
    setDepositComplete(false);
    setNewBalance(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#151c28] text-white rounded-2xl max-w-lg w-full border border-blue-500/50 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                ACCEPT CASH & DEPOSIT TO ACCOUNT
              </h3>
              <p className="text-[11px] text-slate-400">
                Cashier &amp; Admin In-Person Wallet Top-Up
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
          {/* Step 1: Look up customer */}
          <form onSubmit={handleLookup} className="space-y-2">
            <label className="text-[11px] font-bold text-slate-300 block">
              Customer Email or Phone Number:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 0911223344 or customer@email.com"
                  className="w-full bg-[#0e131d] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-mono font-bold text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow cursor-pointer"
              >
                Find
              </button>
            </div>
          </form>

          {searchError && (
            <div className="p-3 bg-red-950/80 border border-red-500 rounded-xl text-red-200 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Step 2: Customer found, enter amount */}
          {foundUser && !depositComplete && (
            <div className="p-4 bg-[#0e131d] rounded-2xl border border-slate-700 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
                <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <UserCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{foundUser.username}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {foundUser.email || foundUser.phone}
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Balance</span>
                  <span className="font-mono font-black text-yellow-400">
                    {foundUser.balance.toLocaleString()} {foundUser.currency}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Cash Amount Received:
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-[#151c28] border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono font-black text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={handleConfirmDeposit}
                disabled={isProcessing || !amount}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 text-white font-black rounded-xl text-xs sm:text-sm transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Wallet className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? 'PROCESSING DEPOSIT...'
                    : `CONFIRM CASH (${amount || 0} ${foundUser.currency}) & DEPOSIT`}
                </span>
              </button>
            </div>
          )}

          {/* Step 3: Success */}
          {depositComplete && foundUser && (
            <div className="space-y-3 animate-in zoom-in-95">
              <div className="p-3.5 bg-emerald-950/90 border-2 border-emerald-500 rounded-2xl text-emerald-200 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>DEPOSIT CONFIRMED!</span>
                </div>
                <p className="text-[11px] text-emerald-300">
                  {amount} {foundUser.currency} added to <strong className="text-white">{foundUser.username}</strong>'s account.
                </p>
                {newBalance !== null && (
                  <p className="text-[11px] text-emerald-300">
                    New balance: <strong className="font-mono text-white">{newBalance.toLocaleString()} {foundUser.currency}</strong>
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleResetForNext}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Deposit for Another Customer</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
