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
  UploadCloud, 
  Clock, 
  FileText
} from 'lucide-react';
import { UserAccount, Language } from '../types';
import { 
  CHARTE_DEPOSIT_ACCOUNTS, 
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

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  user,
  currentLang,
}) => {
  const [activeMode, setActiveMode] = useState<'deposit' | 'withdraw'>('deposit');

  // Deposit States
  const [depositCategory, setDepositCategory] = useState<'all' | 'telebirr_mpesa' | 'commercial_banks'>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('telebirr');
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [txnReference, setTxnReference] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

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

  const handleCopyAccount = (accNum: string, accId: string) => {
    navigator.clipboard.writeText(accNum);
    setCopiedAccount(accId);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

    if (depositAmount > 25000) {
      setErrorMsg(
        currentLang === 'am'
          ? 'ከፍተኛው የማስገቢያ መጠን 25,000 ብር ነው።'
          : 'Maximum deposit amount is 25,000 ETB.'
      );
      return;
    }

    if (!txnReference.trim() && !receiptFile) {
      setErrorMsg(
        currentLang === 'am'
          ? 'እባክዎ የግብይት ማረጋገጫ ቁጥር (Txn Number) ወይም ደረሰኝ (Photo/PDF) ያስገቡ።'
          : 'Please enter transaction reference number or attach receipt photo/PDF.'
      );
      return;
    }

    const selectedAcc =
      CHARTE_DEPOSIT_ACCOUNTS.find((a) => a.id === selectedAccountId) ||
      CHARTE_DEPOSIT_ACCOUNTS[0];

    setIsSubmitting(true);
    setTimeout(() => {
      addDepositRequest({
        userId: user.id,
        userPhoneOrEmail: user.phone || user.email || 'Customer',
        userName: user.username,
        amount: depositAmount,
        bankName: selectedAcc.bankName,
        accountNumber: selectedAcc.accountNumber,
        accountHolder: selectedAcc.accountHolder,
        transactionReference: txnReference.trim(),
        receiptFileName: receiptFile?.name,
        receiptFileUrl: receiptDataUrl || undefined,
      });

      setIsSubmitting(false);
      setSuccessInfo({
        title: currentLang === 'am' ? 'የገንዘብ ማስገቢያ ጥያቄ ተልኳል!' : 'Deposit Request Submitted!',
        message:
          currentLang === 'am'
            ? 'ጥያቄዎ ለአስተዳዳሪ ቀርቧል። እባክዎ የአስተዳዳሪውን ማረጋገጫ ይጠብቁ። ማረጋገጫ እንዳገኘ ገንዘቡ በቀጥታ ወደ አካውንትዎ ገቢ ይደረጋል።'
            : 'Your deposit request has been submitted to the admin station. Please wait for admin approval. Once approved, the funds will be immediately credited to your balance.',
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
            ? 'የማውጣት ጥያቄዎ በተሳካ ሁኔታ ቀርቧል። እባክዎ የአስተዳዳሪውን ማረጋገጫ ይጠብቁ። አስተዳዳሪው እንዳረጋገጠ ገንዘቡ ወደ ሂሳብዎ ይተላለፋል እንዲሁም ከአካውንትዎ ይቀነሳል።'
            : 'Your withdrawal request has been submitted. Please wait for admin approval. Once admin approves, the amount will be processed and deducted from your account.',
      });
    }, 600);
  };

  const filteredDepositAccounts = CHARTE_DEPOSIT_ACCOUNTS.filter((acc) => {
    if (depositCategory === 'all') return true;
    return acc.category === depositCategory;
  });

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
                  ? currentLang === 'am' ? 'ገንዘብ አስገባ (Deposit)' : 'Deposit Funds'
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
            <div className="text-right text-[10px] text-slate-400">
              {activeMode === 'deposit' ? (
                <span>Min: 20 ETB | Max: 25,000 ETB</span>
              ) : (
                <span>Min: 200 ETB | Max: 25,000 ETB (24h)</span>
              )}
            </div>
          </div>

          {/* Success Message / Info Modal */}
          {successInfo && (
            <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-xl space-y-2 text-emerald-200 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{successInfo.title}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-200">
                {successInfo.message}
              </p>
              <button
                onClick={() => {
                  setSuccessInfo(null);
                  onClose();
                }}
                className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-lg text-xs transition cursor-pointer"
              >
                {currentLang === 'am' ? 'እሺ (ተረድቻለሁ)' : 'OK, Understood'}
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-500 rounded-xl text-red-200 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* DEPOSIT FORM */}
          {activeMode === 'deposit' && !successInfo && (
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                  {currentLang === 'am' ? 'የክፍያ ሂሳብ ይምረጡ' : 'Select Official Payment Account'}:
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-[#0e131d] p-1 rounded-xl border border-slate-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setDepositCategory('all')}
                    className={`py-1.5 rounded-lg font-bold transition text-center cursor-pointer ${
                      depositCategory === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Accounts
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositCategory('telebirr_mpesa')}
                    className={`py-1.5 rounded-lg font-bold transition text-center truncate px-1 cursor-pointer ${
                      depositCategory === 'telebirr_mpesa' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Telebirr &amp; M-Pesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositCategory('commercial_banks')}
                    className={`py-1.5 rounded-lg font-bold transition text-center truncate px-1 cursor-pointer ${
                      depositCategory === 'commercial_banks' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Commercial Banks
                  </button>
                </div>
              </div>

              {/* Accounts List Cards */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {filteredDepositAccounts.map((acc) => {
                  const isSelected = selectedAccountId === acc.id;
                  const isCopied = copiedAccount === acc.id;
                  return (
                    <div
                      key={acc.id}
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer relative ${
                        isSelected
                          ? 'bg-[#182338] border-blue-500 shadow-md ring-1 ring-blue-500/50'
                          : 'bg-[#0e131d] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${acc.badgeColor}`}>
                            {acc.badge}
                          </span>
                          <span className="font-bold text-white text-xs">{acc.bankName}</span>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 bg-[#121620] px-3 py-1.5 rounded-lg border border-slate-800">
                        <span className="font-mono font-bold text-yellow-300 text-xs sm:text-sm">
                          {acc.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyAccount(acc.accountNumber, acc.id);
                          }}
                          className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                        <span>Holder: <strong className="text-slate-300">{acc.accountHolder}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Deposit Amount */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    {currentLang === 'am' ? 'የማስገቢያ መጠን (ብር)' : 'Deposit Amount (ETB)'}:
                  </label>
                  <span className="text-[10px] text-slate-400">Min: 20 | Max: 25,000 ETB</span>
                </div>
                <input
                  type="number"
                  min="20"
                  max="25000"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-1.5 mt-1.5">
                  {[50, 100, 500, 1000, 5000, 25000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold border transition cursor-pointer ${
                        depositAmount === amt
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-[#0e131d] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  {currentLang === 'am' ? 'የግብይት ማረጋገጫ ቁጥር (Transaction Reference)' : 'Payment Transaction Reference'}:
                </label>
                <input
                  type="text"
                  value={txnReference}
                  onChange={(e) => setTxnReference(e.target.value)}
                  placeholder="e.g. FT260845920... or Telebirr Txn"
                  className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Upload Receipt */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  {currentLang === 'am' ? 'ደረሰኝ ያያይዙ (Photo / PDF / Screenshot)' : 'Attach Receipt (Photo, PDF, Screenshot)'}:
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-3 text-center bg-[#0e131d] transition">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="receipt-file-upload"
                  />
                  <label htmlFor="receipt-file-upload" className="cursor-pointer flex flex-col items-center gap-1.5">
                    <UploadCloud className="w-6 h-6 text-blue-400" />
                    {receiptFile ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> {receiptFile.name} ({(receiptFile.size / 1024).toFixed(1)} KB)
                      </span>
                    ) : (
                      <>
                        <span className="text-xs font-semibold text-slate-300">
                          {currentLang === 'am' ? 'ደረሰኝ ለመጫን እዚህ ይጫኑ' : 'Click to upload receipt photo / PDF'}
                        </span>
                        <span className="text-[10px] text-slate-500">Supports JPG, PNG, PDF receipts</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  {currentLang === 'am'
                    ? 'ጥያቄዎ እንደተላከ የአስተዳዳሪ ማረጋገጫ ይጠብቁ። አስተዳዳሪው እንዳረጋገጠ ገንዘቡ ወዲያውኑ ገቢ ይደረጋል።'
                    : 'Please wait for admin approval. Once approved, the deposit amount will be credited to your balance.'}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting
                  ? currentLang === 'am' ? 'በመላክ ላይ...' : 'Submitting Deposit...'
                  : currentLang === 'am' ? 'ማስገቢያውን አረጋግጥ (Confirm Deposit)' : 'Confirm Deposit & Submit for Approval'}
              </button>
            </form>
          )}

          {/* WITHDRAWAL FORM */}
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
                  Maximum withdrawal is 25,000 ETB in a 24-hour window. If you wish to withdraw more, please request the rest the next day.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting
                  ? currentLang === 'am' ? 'በማስኬድ ላይ...' : 'Processing...'
                  : currentLang === 'am' ? 'ማውጣት አረጋግጥ (Confirm Withdrawal)' : 'Confirm Withdrawal & Wait for Admin Approval'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
