import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Clock, 
  Send,
  ExternalLink,
  ShieldCheck,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { UserAccount, Language } from '../types';
import { 
  addDepositRequest, 
  addWithdrawalRequest 
} from '../utils/betAndTransactionStore';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onUpdateBalance: (newBalance: number) => void;
  currentLang: Language;
}

const TELEGRAM_HANDLE = '@Chartebetpayment';
const TELEGRAM_URL = 'https://t.me/Chartebetpayment';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  user,
  currentLang,
}) => {
  const [activeMode, setActiveMode] = useState<'deposit' | 'withdraw'>('deposit');

  // Deposit Notification Form States
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [telegramUsername, setTelegramUsername] = useState('');
  const [copiedTelegram, setCopiedTelegram] = useState(false);

  // Withdraw States
  const [withdrawName, setWithdrawName] = useState(user.username || '');
  const [withdrawBank, setWithdrawBank] = useState('Commercial Bank of Ethiopia (CBE)');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(500);

  // Feedback States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ title: string; message: string } | null>(null);

  if (!isOpen) return null;

  const handleCopyTelegram = () => {
    navigator.clipboard.writeText(TELEGRAM_HANDLE);
    setCopiedTelegram(true);
    setTimeout(() => setCopiedTelegram(false), 2000);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (depositAmount < 20) {
      setErrorMsg(
        currentLang === 'am'
          ? 'ዝቅተኛው የማስገቢያ መጠን 20 ብር ነው።'
          : 'Minimum deposit amount is 20 ETB.'
      );
      return;
    }

    if (depositAmount > 50000) {
      setErrorMsg(
        currentLang === 'am'
          ? 'ከፍተኛው የማስገቢያ መጠን 50,000 ብር ነው።'
          : 'Maximum deposit amount is 50,000 ETB.'
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      addDepositRequest({
        userId: user.id,
        userPhoneOrEmail: user.phone || user.email || 'Customer',
        userName: user.username,
        amount: depositAmount,
        bankName: `Telegram Agent (${TELEGRAM_HANDLE})`,
        accountNumber: TELEGRAM_HANDLE,
        accountHolder: 'Chartebet Official Payment Agent',
        transactionReference: telegramUsername.trim() || `TG-REQ-${Date.now().toString().slice(-6)}`,
      });

      setIsSubmitting(false);
      setSuccessInfo({
        title: currentLang === 'am' ? 'የማስገቢያ ጥያቄ ተመዝግቧል!' : 'Deposit Notification Submitted!',
        message:
          currentLang === 'am'
            ? `የ${depositAmount} ብር ማስገቢያ ጥያቄዎ ተመዝግቧል። እባክዎ በቀጥታ በቴሌግራም ${TELEGRAM_HANDLE} መልእክት በመላክ ሂደቱን ያጠናቁ። የአስተዳዳሪው ማረጋገጫ እንዳገኘ ወዲያውኑ ገቢ ይደረጋል።`
            : `Your deposit notification of ${depositAmount} ETB is recorded. Please message our agent on Telegram ${TELEGRAM_HANDLE} to complete the transfer. Once confirmed, your balance will be topped up immediately.`,
      });
    }, 600);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (withdrawAmount < 200) {
      setErrorMsg(
        currentLang === 'am'
          ? 'ዝቅተኛው የማውጣት መጠን 200 ብር ነው።'
          : 'Minimum withdrawal amount is 200 ETB.'
      );
      return;
    }

    if (withdrawAmount > 25000) {
      setErrorMsg(
        currentLang === 'am'
          ? 'በአንድ ጊዜ ወይም በ24 ሰዓት ውስጥ የሚፈቀደው ከፍተኛው መጠን 25,000 ብር ብቻ ነው።'
          : 'Maximum withdrawal is 25,000 ETB. Only 25,000 ETB allowed per 24 hours.'
      );
      return;
    }

    if (user.balance < withdrawAmount) {
      setErrorMsg(
        currentLang === 'am'
          ? `በቂ ያልሆነ ቀሪ ሒሳብ! ያለዎት ቀሪ ሒሳብ ${user.balance.toFixed(2)} ${user.currency} ነው`
          : `Insufficient balance! Your available balance is ${user.balance.toFixed(2)} ${user.currency}`
      );
      return;
    }

    if (!withdrawName.trim() || !withdrawAccount.trim()) {
      setErrorMsg(
        currentLang === 'am'
          ? 'እባክዎ ሙሉ ስምዎን እና የሂሳብ ቁጥርዎን ያስገቡ።'
          : 'Please enter your full account holder name and account number.'
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = addWithdrawalRequest({
        userId: user.id,
        userPhoneOrEmail: user.phone || user.email || 'Customer',
        accountHolderName: withdrawName.trim(),
        bankName: withdrawBank,
        accountNumber: withdrawAccount.trim(),
        amount: withdrawAmount,
      });

      setIsSubmitting(false);

      if (!res.success) {
        setErrorMsg(
          currentLang === 'am'
            ? 'በ24 ሰዓት ውስጥ የሚፈቀደው 25,000 ብር ብቻ ነው። የቀረውን መጠን በሚቀጥለው ቀን ይሞክሩ።'
            : res.error || 'Withdrawal limit reached. Maximum 25,000 ETB in 24 hours.'
        );
        return;
      }

      setSuccessInfo({
        title: currentLang === 'am' ? 'የገንዘብ ማውጣት ጥያቄ ተልኳል!' : 'Withdrawal Request Submitted!',
        message:
          currentLang === 'am'
            ? 'የማውጣት ጥያቄዎ በተሳካ ሁኔታ ቀርቧል። እባክዎ የአስተዳዳሪውን ማረጋገጫ ይጠብቁ። አስተዳዳሪው እንዳረጋገጠ ገንዘቡ ወደ ሂሳብዎ ይተላለፋል እንዲሁም ከአካውንትዎ ይቀነሳል። እንዲሁም በቴሌግራም @Chartebetpayment ማረጋገጥ ይችላሉ።'
            : 'Your withdrawal request has been submitted. Please wait for admin approval. Once admin approves, the amount will be processed and deducted from your account. You can also notify @Chartebetpayment for fast tracking.',
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#151c28] text-white rounded-2xl max-w-xl w-full border border-slate-700/80 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base text-white">
                {activeMode === 'deposit'
                  ? currentLang === 'am' ? 'ገንዘብ አስገባ (Deposit via Telegram)' : 'Deposit Funds via Telegram'
                  : currentLang === 'am' ? 'ገንዘብ አውጣ (Withdraw)' : 'Withdraw Earnings'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentLang === 'am'
                  ? 'ቻርቴቤት ይፋዊ የክፍያ እና ማውጫ አገልግሎት'
                  : 'Official Chartebet Payment & Banking Portal'}
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

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Deposit vs Withdraw Tabs */}
          <div className="grid grid-cols-2 bg-[#0e131d] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setActiveMode('deposit');
                setErrorMsg(null);
                setSuccessInfo(null);
              }}
              className={`py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'deposit' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>{currentLang === 'am' ? 'ገንዘብ አስገባ (Deposit)' : 'Deposit'}</span>
            </button>
            <button
              onClick={() => {
                setActiveMode('withdraw');
                setErrorMsg(null);
                setSuccessInfo(null);
              }}
              className={`py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'withdraw' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>{currentLang === 'am' ? 'ገንዘብ አውጣ (Withdraw)' : 'Withdraw'}</span>
            </button>
          </div>

          {/* Current balance card */}
          <div className="bg-[#1f2838] p-3.5 rounded-xl border border-slate-700 flex justify-between items-center shadow-sm">
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">
                {currentLang === 'am' ? 'ያለዎት ቀሪ ሒሳብ' : 'Available Balance'}:
              </span>
              <span className="text-lg font-black font-mono text-emerald-400">
                {user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}{' '}
                <span className="text-xs text-slate-300">{user.currency}</span>
              </span>
            </div>
            <div className="text-right text-[10px]">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                🎁 {currentLang === 'am' ? '20 ብር ጅማሮ ቦነስ' : '20 ETB Starter Bonus Active'}
              </span>
            </div>
          </div>

          {/* Success Message / Info Modal */}
          {successInfo && (
            <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-xl space-y-3 text-emerald-200 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{successInfo.title}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-200">
                {successInfo.message}
              </p>
              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-lg text-xs transition text-center flex items-center justify-center gap-2 cursor-pointer shadow"
                >
                  <Send className="w-4 h-4" />
                  <span>Open Telegram {TELEGRAM_HANDLE}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => {
                    setSuccessInfo(null);
                    onClose();
                  }}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs transition cursor-pointer"
                >
                  {currentLang === 'am' ? 'ዝጋ' : 'Close'}
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-500 rounded-xl text-red-200 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* DEPOSIT SECTION: TELEGRAM AGENT ONLY (NO LOCAL ACCOUNTS) */}
          {/* ========================================================= */}
          {activeMode === 'deposit' && !successInfo && (
            <div className="space-y-4">
              {/* Regional Payment Notice */}
              <div className="p-3.5 bg-blue-950/60 border border-blue-500/50 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-blue-600/30 rounded-xl border border-blue-500/40 text-blue-400 shrink-0 mt-0.5">
                  <Send className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                    <span>{currentLang === 'am' ? 'በቴሌግራም ገንዘብ ያስገቡ' : 'Deposit via Official Telegram Agent'}</span>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono px-1.5 py-0.2 rounded-full uppercase">
                      Direct Support
                    </span>
                  </h4>
                  <p className="text-[11px] text-blue-200 leading-relaxed">
                    {currentLang === 'am'
                      ? 'በአገራችን የኦንላይን የውርርድ ክፍያ ስለማይሰራ፣ ወደ አካውንትዎ ገንዘብ ለማስገባት (Deposit) እባክዎ በቀጥታ በቴሌግራም ያግኙን።'
                      : 'Online betting payment is currently unavailable in this country. To safely deposit funds to your balance, please contact us directly on Telegram.'}
                  </p>
                </div>
              </div>

              {/* Main Telegram Contact Box */}
              <div className="bg-gradient-to-br from-[#121c2e] via-[#101827] to-[#0c1320] border-2 border-blue-500/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">
                        {currentLang === 'am' ? 'ይፋዊ የቴሌግራም ክፍያ' : 'Official Telegram Deposit'}
                      </div>
                      <div className="text-base sm:text-lg font-black font-mono text-white">
                        {TELEGRAM_HANDLE}
                      </div>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>ONLINE</span>
                  </span>
                </div>

                {/* Primary Telegram Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <a
                    href={TELEGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black rounded-xl text-xs sm:text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{currentLang === 'am' ? 'በቴሌግራም ያግኙን' : 'Contact us on Telegram'}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyTelegram}
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copiedTelegram ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Copied {TELEGRAM_HANDLE}!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-blue-400" />
                        <span>Copy {TELEGRAM_HANDLE}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 3 Step Instructions */}
              <div className="bg-[#0e1420] border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <div className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>{currentLang === 'am' ? 'እንዴት ገንዘብ ማስገባት እንደሚቻል (How to Deposit):' : 'How to Deposit via Telegram:'}</span>
                </div>

                <div className="space-y-2 text-[11px] text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-white">
                        {currentLang === 'am' ? 'ቴሌግራም ይክፈቱ፡' : 'Open Telegram:'}
                      </strong>{' '}
                      {currentLang === 'am'
                        ? 'ከላይ ያለውን ቁልፍ ይጫኑ ወይም በቴሌግራም @Chartebetpayment ብለው ይፈልጉ።'
                        : 'Click the button above or search for @Chartebetpayment on Telegram.'}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong className="text-white">
                        {currentLang === 'am' ? 'መረጃዎን ይላኩ፡' : 'Send Your Details:'}
                      </strong>{' '}
                      {currentLang === 'am'
                        ? `የቻርቴቤት መለያ ቁጥርዎን (${user.id}) ወይም ስምዎን እና ማስገባት የሚፈልጉትን የብር መጠን ይንገሯቸው።`
                        : `Send your Account ID (${user.id}) or username (${user.username}) and the amount you want to deposit.`}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-white">
                        {currentLang === 'am' ? 'ክፍያውን ያጠናቁ፡' : 'Instant Top-Up:'}
                      </strong>{' '}
                      {currentLang === 'am'
                        ? 'ወኪሉ የሚሰጥዎትን የክፍያ አማራጭ በመጠቀም ከከፈሉ በኋላ ደረሰኝ ይላኩላቸው፤ ቀሪ ሒሳብዎ ወዲያውኑ ይገባል!'
                        : 'Follow the agent payment instructions and send the transfer screenshot. Your balance will be credited right away!'}
                    </div>
                  </div>
                </div>
              </div>

              {/* In-App Deposit Notification to Admin */}
              <div className="border border-slate-800 rounded-xl p-3.5 bg-[#0e131d]/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-300">
                    {currentLang === 'am' ? 'የማስገቢያ ጥያቄ ለአስተዳዳሪ መመዝገብያ' : 'Notify Admin In-App (Optional)'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Min: 20 ETB</span>
                </div>

                <form onSubmit={handleDepositSubmit} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      {currentLang === 'am' ? 'የማስገቢያ መጠን (ብር)' : 'Deposit Amount (ETB)'}:
                    </label>
                    <input
                      type="number"
                      min="20"
                      max="50000"
                      required
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="w-full bg-[#151c28] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex gap-1.5 mt-1.5">
                      {[50, 100, 500, 1000, 5000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDepositAmount(amt)}
                          className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold border transition cursor-pointer ${
                            depositAmount === amt
                              ? 'bg-blue-600 text-white border-blue-500'
                              : 'bg-[#151c28] text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      {currentLang === 'am' ? 'የእርስዎ የቴሌግራም ስም / ስልክ' : 'Your Telegram Handle or Phone'}:
                    </label>
                    <input
                      type="text"
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value)}
                      placeholder="@yourtelegram or 09..."
                      className="w-full bg-[#151c28] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-slate-950 font-black rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? currentLang === 'am' ? 'በመመዝገብ ላይ...' : 'Recording...'
                        : currentLang === 'am' ? 'የማስገቢያ ጥያቄ አስመዝግብ' : 'Record Deposit Notification'}
                    </span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* WITHDRAWAL SECTION */}
          {/* ========================================================= */}
          {activeMode === 'withdraw' && !successInfo && (
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  {currentLang === 'am' ? 'የባንክ ሂሳብ ባለቤት ሙሉ ስም' : 'Full Name (Account Holder Name)'}:
                </label>
                <input
                  type="text"
                  required
                  value={withdrawName}
                  onChange={(e) => setWithdrawName(e.target.value)}
                  placeholder={currentLang === 'am' ? 'ለምሳሌ፡ አበበ ከበደ' : 'e.g. Abebe Kebede'}
                  className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  {currentLang === 'am' ? 'የባንክ ወይም የቴሌብር ስም' : 'Bank / Payment Method'}:
                </label>
                <select
                  value={withdrawBank}
                  onChange={(e) => setWithdrawBank(e.target.value)}
                  className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Commercial Bank of Ethiopia (CBE)">Commercial Bank of Ethiopia (CBE)</option>
                  <option value="Telebirr">Telebirr</option>
                  <option value="Bank of Abyssinia (BoA)">Bank of Abyssinia (BoA)</option>
                  <option value="Awash Bank">Awash Bank</option>
                  <option value="Dashen Bank (Amole)">Dashen Bank (Amole)</option>
                  <option value="Safaricom M-Pesa">Safaricom M-Pesa</option>
                  <option value="Lion International Bank">Lion International Bank</option>
                  <option value="Buna International Bank">Buna International Bank</option>
                  <option value="Telegram Agent Support">Telegram Agent Support (@Chartebetpayment)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  {currentLang === 'am' ? 'የባንክ ወይም የቴሌብር ሂሳብ ቁጥር' : 'Account Number / Phone Number'}:
                </label>
                <input
                  type="text"
                  required
                  value={withdrawAccount}
                  onChange={(e) => setWithdrawAccount(e.target.value)}
                  placeholder="1000... or 09..."
                  className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    {currentLang === 'am' ? 'የማውጫ መጠን (ብር)' : 'Withdrawal Amount (ETB)'}:
                  </label>
                  <span className="text-[10px] text-amber-400 font-semibold">
                    Min: 200 ETB | Max: 25,000 ETB
                  </span>
                </div>
                <input
                  type="number"
                  min="200"
                  max="25000"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-1.5 mt-1.5">
                  {[200, 500, 1000, 5000, 10000, 25000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWithdrawAmount(amt)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold border transition cursor-pointer ${
                        withdrawAmount === amt
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-[#0e131d] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-[11px] text-red-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-red-300">
                  <Clock className="w-4 h-4 text-red-400 shrink-0" />
                  <span>24-Hour Withdrawal Limit Policy (Max 25,000 ETB)</span>
                </div>
                <p className="leading-relaxed">
                  Maximum withdrawal is 25,000 ETB in a 24-hour window. Once submitted, admin will approve and transfer funds. You can also message @Chartebetpayment on Telegram for rapid payout verification.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting
                  ? currentLang === 'am' ? 'በማስኬድ ላይ...' : 'Processing...'
                  : currentLang === 'am' ? 'ማውጣት አረጋግጥ (Confirm Withdrawal)' : 'Confirm Withdrawal & Submit for Approval'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
