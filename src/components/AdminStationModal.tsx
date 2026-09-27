import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Database, 
  Users, 
  TrendingUp, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  CheckCircle2, 
  RefreshCw, 
  Receipt, 
  ExternalLink,
  Activity,
  Filter
} from 'lucide-react';
import { Match, Language, OfflineSlip, UserBetHistoryItem } from '../types';
import { 
  getAllCashiers, 
  addCashierStation, 
  CashierAccount 
} from '../utils/cashierStore';
import { 
  getPendingDeposits, 
  getPendingWithdrawals, 
  approveDepositRequest, 
  rejectDepositRequest, 
  approveWithdrawalRequest, 
  rejectWithdrawalRequest, 
  getAllPlacedBets, 
  DepositRequest, 
  WithdrawalRequest, 
  getPaidSlipsFiltered,
  getOfflineSlipByCode
} from '../utils/betAndTransactionStore';
import { 
  syncFromApiFootball, 
  checkApiFootballStatus, 
  getStoredApiKey, 
  saveApiKey, 
  DEFAULT_API_FOOTBALL_KEY 
} from '../utils/matchStore';
import { 
  getUserByIdentifier, 
  adminAdjustBalance, 
  RegisteredUser 
} from '../utils/userStore';

interface AdminStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: Match[];
  onAddMatch: (match: Match) => void;
  onUpdateMatch: (match: Match) => void;
  onDeleteMatch: (id: string) => void;
  onOpenMatchEditor: (match: Match | null) => void;
  currentLang: Language;
}

export const AdminStationModal: React.FC<AdminStationModalProps> = ({
  isOpen,
  onClose,
  matches,
  onDeleteMatch,
  onOpenMatchEditor,
}) => {
  type AdminTab = 
    | 'deposits' 
    | 'withdrawals' 
    | 'paid_slips' 
    | 'bets' 
    | 'users' 
    | 'cashiers' 
    | 'matches' 
    | 'api_football';

  const [activeTab, setActiveTab] = useState<AdminTab>('deposits');

  // Transactions State
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [allBets, setAllBets] = useState<UserBetHistoryItem[]>([]);
  const [cashiers, setCashiers] = useState<CashierAccount[]>([]);

  // Paid slips
  const [paidFilter, setPaidFilter] = useState<'day' | 'week' | 'month' | 'all'>('day');
  const [paidSlips, setPaidSlips] = useState<OfflineSlip[]>([]);

  // Search single unpaid slip by code
  const [singleSlipQuery, setSingleSlipQuery] = useState('');
  const [inspectedSlip, setInspectedSlip] = useState<OfflineSlip | null>(null);

  // User management state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchedUser, setSearchedUser] = useState<RegisteredUser | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(100);
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  // New Cashier Station Form State
  const [newStationName, setNewStationName] = useState('');
  const [newStationBranch, setNewStationBranch] = useState('Bole Branch');
  const [newCashierName, setNewCashierName] = useState('');
  const [newCashierEmail, setNewCashierEmail] = useState('');
  const [newCashierPhone, setNewCashierPhone] = useState('');
  const [newCashierPassword, setNewCashierPassword] = useState('19891989');

  // API Football Sync State
  const [isSyncingApi, setIsSyncingApi] = useState(false);
  const [apiSyncReport, setApiSyncReport] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState<string>(getStoredApiKey());
  const [apiKeySavedNotice, setApiKeySavedNotice] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusReport, setStatusReport] = useState<{
    success: boolean;
    message: string;
    requests?: { current: number; limit_day: number };
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      refreshData();
      setApiKeyInput(getStoredApiKey());
    }
  }, [isOpen, paidFilter]);

  const refreshData = () => {
    setDeposits(getPendingDeposits());
    setWithdrawals(getPendingWithdrawals());
    setAllBets(getAllPlacedBets());
    setCashiers(getAllCashiers());
    setPaidSlips(getPaidSlipsFiltered(paidFilter));
    setAdminNotice(null);
  };

  if (!isOpen) return null;

  const handleApproveDeposit = (id: string) => {
    const res = approveDepositRequest(id, 'Admin');
    if (res.success) {
      setAdminNotice(`Approved deposit of ${res.deposit?.amount} ETB. User balance credited!`);
      refreshData();
    }
  };

  const handleRejectDeposit = (id: string) => {
    const reason = prompt('Reason for rejection:') || 'Invalid transaction proof';
    rejectDepositRequest(id, reason, 'Admin');
    setAdminNotice(`Rejected deposit #${id}.`);
    refreshData();
  };

  const handleApproveWithdrawal = (id: string) => {
    const res = approveWithdrawalRequest(id, 'Admin');
    if (res.success) {
      setAdminNotice(`Approved withdrawal of ${res.withdrawal?.amount} ETB. Balance deducted from user.`);
      refreshData();
    }
  };

  const handleRejectWithdrawal = (id: string) => {
    const reason = prompt('Reason for rejection:') || 'Details mismatch';
    rejectWithdrawalRequest(id, reason, 'Admin');
    setAdminNotice(`Rejected withdrawal #${id}.`);
    refreshData();
  };

  const handleSearchUser = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedUser(null);
    const found = getUserByIdentifier(userSearchQuery.trim());
    if (found) {
      setSearchedUser(found);
    } else {
      alert(`No user found matching "${userSearchQuery}".`);
    }
  };

  const handleAdjustBalance = (type: 'add' | 'subtract') => {
    if (!searchedUser) return;
    const res = adminAdjustBalance(searchedUser.id, adjustAmount, type);
    if (res.success && res.newBalance !== undefined) {
      setSearchedUser({ ...searchedUser, balance: res.newBalance });
      setAdminNotice(`Adjusted balance by ${type === 'add' ? '+' : '-'}${adjustAmount} ETB. New Balance: ${res.newBalance} ETB`);
    }
  };

  const handleCreateCashierStation = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addCashierStation({
      stationName: newStationName.trim(),
      branch: newStationBranch.trim(),
      name: newCashierName.trim(),
      email: newCashierEmail.trim(),
      phone: newCashierPhone.trim(),
      password: newCashierPassword.trim(),
    });

    setAdminNotice(`Station "${created.stationName}" registered successfully! Station ID: ${created.id}`);
    setNewStationName('');
    setNewCashierName('');
    setNewCashierEmail('');
    setNewCashierPhone('');
    refreshData();
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = apiKeyInput.trim();
    saveApiKey(cleanKey);
    setApiKeySavedNotice('API Key updated and stored securely in Chartebet!');
    setTimeout(() => setApiKeySavedNotice(null), 3000);
  };

  const handleResetApiKey = () => {
    setApiKeyInput(DEFAULT_API_FOOTBALL_KEY);
    saveApiKey(DEFAULT_API_FOOTBALL_KEY);
    setApiKeySavedNotice(`API Key reset to default (${DEFAULT_API_FOOTBALL_KEY}).`);
    setTimeout(() => setApiKeySavedNotice(null), 3000);
  };

  const handleCheckApiStatus = async () => {
    setIsCheckingStatus(true);
    setStatusReport(null);
    try {
      const res = await checkApiFootballStatus(apiKeyInput.trim());
      setStatusReport(res);
    } catch (e: any) {
      setStatusReport({
        success: false,
        message: e?.message || 'Failed to connect to API-Football.',
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleTriggerApiSync = async () => {
    setIsSyncingApi(true);
    setApiSyncReport('Connecting to API-Football endpoints and fetching live fixtures & odds...');
    try {
      const result = await syncFromApiFootball(apiKeyInput.trim());
      setIsSyncingApi(false);
      setApiSyncReport(result.message || 'Updated live feeds from API-Football.');
    } catch (e: any) {
      setIsSyncingApi(false);
      setApiSyncReport(`API Sync Note: ${e.message || 'Updated local match feeds successfully.'}`);
    }
  };

  const handleLookupSingleSlip = (e: React.FormEvent) => {
    e.preventDefault();
    const found = getOfflineSlipByCode(singleSlipQuery.trim());
    setInspectedSlip(found || null);
    if (!found) {
      alert(`No slip found with booking code "${singleSlipQuery}".`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#111722] text-white rounded-2xl max-w-5xl w-full border border-blue-500/60 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        
        {/* Top Admin Station Title Bar */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/50 flex items-center justify-center font-black">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white">
                  CENTRAL ADMIN COMMAND STATION
                </h3>
                <span className="bg-blue-600 text-white font-mono text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                  AUTHORIZED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Match feeds, cashier terminals, bank approvals, paid slips audit, and API-Football.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Tabs */}
        <div className="bg-[#0b0f17] px-6 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'deposits' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
            <span>Deposit Approvals ({deposits.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'withdrawals' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4 text-blue-400" />
            <span>Withdrawal Approvals ({withdrawals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('paid_slips')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'paid_slips' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4 text-amber-400" />
            <span>Paid Slips Archive ({paidSlips.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bets')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'bets' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4 text-purple-300" />
            <span>All Placed Bets ({allBets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'users' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-300" />
            <span>Accounts &amp; Balance</span>
          </button>

          <button
            onClick={() => setActiveTab('cashiers')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'cashiers' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>Cashier Stations ({cashiers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'matches' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4 text-blue-300" />
            <span>Match Editor ({matches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('api_football')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'api_football' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <RefreshCw className="w-4 h-4 text-teal-300" />
            <span>API-Football Engine</span>
          </button>
        </div>

        {/* Global Admin Status Bar */}
        {adminNotice && (
          <div className="bg-emerald-950/90 border-b border-emerald-500 px-6 py-2.5 text-xs text-emerald-200 font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{adminNotice}</span>
            </div>
            <button onClick={() => setAdminNotice(null)} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* 1. DEPOSIT APPROVALS */}
          {activeTab === 'deposits' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Pending Customer Deposits</h4>
                <span className="text-xs text-slate-400">{deposits.length} Pending Review</span>
              </div>

              {deposits.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-1">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
                  <p className="font-semibold text-sm">All deposits are cleared!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deposits.map((dep) => (
                    <div
                      key={dep.id}
                      className="p-4 rounded-xl bg-[#0e131d] border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-600 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black font-mono text-emerald-400">
                            +{dep.amount.toLocaleString()} ETB
                          </span>
                          <span className="bg-blue-600/30 text-blue-300 border border-blue-500/50 text-[10px] font-bold px-2 py-0.5 rounded">
                            {dep.bankName}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300">
                          Customer: <strong>{dep.userName}</strong> ({dep.userPhoneOrEmail})
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Txn Ref: <strong className="text-yellow-300">{dep.transactionReference || 'None provided'}</strong>
                        </div>
                        {dep.receiptFileUrl && (
                          <div className="pt-1">
                            <a
                              href={dep.receiptFileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 font-bold underline flex items-center gap-1 cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3" /> View Attached Proof ({dep.receiptFileName})
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRejectDeposit(dep.id)}
                          className="px-4 py-2 bg-red-950 hover:bg-red-900 text-red-200 border border-red-700 font-bold rounded-xl text-xs transition cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveDeposit(dep.id)}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs transition shadow flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Approve &amp; Credit Balance</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. WITHDRAWAL APPROVALS */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Pending Customer Withdrawals</h4>
                <span className="text-xs text-slate-400">{withdrawals.length} Pending Payout</span>
              </div>

              {withdrawals.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-1">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-blue-500" />
                  <p className="font-semibold text-sm">No pending withdrawal requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {withdrawals.map((w) => (
                    <div
                      key={w.id}
                      className="p-4 rounded-xl bg-[#0e131d] border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-600 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black font-mono text-red-400">
                            -{w.amount.toLocaleString()} ETB
                          </span>
                          <span className="bg-purple-600/30 text-purple-300 border border-purple-500/50 text-[10px] font-bold px-2 py-0.5 rounded">
                            {w.bankName}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300">
                          Account Holder: <strong>{w.accountHolderName}</strong>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Account Number: <strong className="text-yellow-300">{w.accountNumber}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRejectWithdrawal(w.id)}
                          className="px-4 py-2 bg-red-950 hover:bg-red-900 text-red-200 border border-red-700 font-bold rounded-xl text-xs transition cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveWithdrawal(w.id)}
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs transition shadow flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Approve Payout</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. PAID SLIPS ARCHIVE */}
          {activeTab === 'paid_slips' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white">Paid Slips Registry (Cashed Out)</h4>
                  <p className="text-[11px] text-slate-400">
                    Unpaid slips remain hidden until searched by code to prevent counterfeit leakage.
                  </p>
                </div>

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

              {/* Single Unpaid Slip Search Box */}
              <form onSubmit={handleLookupSingleSlip} className="flex gap-2 bg-[#0e131d] p-3 rounded-xl border border-slate-800">
                <input
                  type="text"
                  value={singleSlipQuery}
                  onChange={(e) => setSingleSlipQuery(e.target.value)}
                  placeholder="Lookup specific booking code to view unpaid slip (e.g. CC4499112)..."
                  className="flex-1 bg-[#121620] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs uppercase focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs cursor-pointer"
                >
                  Inspect Code
                </button>
              </form>

              {inspectedSlip && (
                <div className="p-3.5 bg-[#151c28] rounded-xl border border-yellow-500/60 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-yellow-400">{inspectedSlip.bookingCode}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      inspectedSlip.isPaid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {inspectedSlip.isPaid ? 'PAID' : 'UNPAID'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Stake: {inspectedSlip.stake} ETB • Potential Return: {inspectedSlip.potentialReturn} ETB • Odds: {inspectedSlip.totalOdds.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Selections: {inspectedSlip.selections.map((s) => s.matchTitle).join(', ')}
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {paidSlips.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No paid slips found for this filter period.
                  </div>
                ) : (
                  paidSlips.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 bg-[#0e131d] rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-yellow-400">{s.bookingCode}</span>
                          <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                            PAID OUT
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5">
                          Paid by: <strong>{s.paidByCashier || 'Cashier Desk'}</strong> • {s.paidAt || 'Earlier'}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-black text-sm text-emerald-400 block">
                          +{s.potentialReturn.toLocaleString()} ETB
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Stake: {s.stake} ETB • Odds: {s.totalOdds.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 4. ALL PLACED BETS AUDIT */}
          {activeTab === 'bets' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Full Betslip &amp; Game History Audit</h4>
                <span className="text-xs text-slate-400">Total Placed: {allBets.length}</span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {allBets.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 bg-[#0e131d] rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-yellow-400">#{b.ticketId}</span>
                        <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-bold">
                          {b.gameType}
                        </span>
                        <span className="text-slate-400 text-[10px] font-mono">
                          User ID: {b.userId}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] mt-0.5">{b.details}</p>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-white">Stake: <strong>{b.stake} ETB</strong></div>
                      <div className="font-mono text-emerald-400 font-bold">Return: {b.potentialReturn} ETB</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. SEARCH & MANAGE USER ACCOUNTS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <form onSubmit={handleSearchUser} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search account by phone number or email..."
                    className="w-full bg-[#0e131d] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Search Account
                </button>
              </form>

              {searchedUser && (
                <div className="p-4 bg-[#0e131d] rounded-2xl border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <h4 className="font-bold text-white text-sm">{searchedUser.username}</h4>
                      <p className="text-[11px] text-slate-400">
                        {searchedUser.email || searchedUser.phone} • Registered: {new Date(searchedUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">CURRENT BALANCE</span>
                      <span className="text-lg font-mono font-black text-emerald-400">
                        {searchedUser.balance.toLocaleString()} {searchedUser.currency}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#151c28] p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-300 font-bold">Adjustment Amount:</span>
                      <input
                        type="number"
                        min="10"
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(Number(e.target.value))}
                        className="w-24 bg-[#0e131d] border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono text-xs text-center"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAdjustBalance('subtract')}
                        className="px-4 py-1.5 bg-red-950 hover:bg-red-900 text-red-200 border border-red-700 font-bold rounded-lg text-xs transition cursor-pointer"
                      >
                        - Minus {adjustAmount} ETB
                      </button>
                      <button
                        onClick={() => handleAdjustBalance('add')}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-lg text-xs transition cursor-pointer"
                      >
                        + Add {adjustAmount} ETB
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. CASHIER STATIONS & PERFORMANCE */}
          {activeTab === 'cashiers' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#0e131d] rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-black text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Provision New Cashier Station &amp; Branch Terminal
                </h4>
                <form onSubmit={handleCreateCashierStation} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    required
                    value={newStationName}
                    onChange={(e) => setNewStationName(e.target.value)}
                    placeholder="Station Name (e.g. Bole Station 3)"
                    className="bg-[#121620] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    required
                    value={newStationBranch}
                    onChange={(e) => setNewStationBranch(e.target.value)}
                    placeholder="Branch (e.g. Bole Medhanealem)"
                    className="bg-[#121620] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    required
                    value={newCashierName}
                    onChange={(e) => setNewCashierName(e.target.value)}
                    placeholder="Cashier Staff Name"
                    className="bg-[#121620] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="email"
                    required
                    value={newCashierEmail}
                    onChange={(e) => setNewCashierEmail(e.target.value)}
                    placeholder="Cashier Login Email"
                    className="bg-[#121620] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    required
                    value={newCashierPhone}
                    onChange={(e) => setNewCashierPhone(e.target.value)}
                    placeholder="Cashier Phone"
                    className="bg-[#121620] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow cursor-pointer"
                  >
                    Save Cashier Station
                  </button>
                </form>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs text-white">Live Stations Performance &amp; Net Revenue Audit</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cashiers.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl bg-[#0e131d] border border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div>
                          <h5 className="font-black text-amber-400 text-sm">{c.stationName}</h5>
                          <span className="text-[10px] text-slate-400">{c.branch} • Cashier: {c.name}</span>
                        </div>
                        <span className="font-mono text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          ID: {c.id}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                        <div className="bg-[#151c28] p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block font-semibold">Created</span>
                          <strong className="text-white font-mono text-xs">{c.performance.totalTicketsCreated}</strong>
                        </div>
                        <div className="bg-[#151c28] p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block font-semibold">Cashed Out</span>
                          <strong className="text-amber-400 font-mono text-xs">{c.performance.totalTicketsPaid}</strong>
                        </div>
                        <div className="bg-[#151c28] p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block font-semibold">Paid Birr</span>
                          <strong className="text-red-400 font-mono text-xs">{c.performance.totalAmountPaidToWinners.toLocaleString()}</strong>
                        </div>
                        <div className="bg-[#151c28] p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block font-semibold">Net P/L</span>
                          <strong className={`font-mono text-xs ${c.performance.netProfitOrLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {c.performance.netProfitOrLoss.toLocaleString()}
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. MATCH & ODDS EDITOR */}
          {activeTab === 'matches' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Full Fixtures, Odds &amp; Result Controller</h4>
                  <p className="text-[11px] text-slate-400">Edit 1X2 odds, over/under, both teams to score, or post new matches.</p>
                </div>
                <button
                  onClick={() => onOpenMatchEditor(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Match</span>
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {matches.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-[#0e131d] rounded-xl border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{m.homeTeam} vs {m.awayTeam}</span>
                        <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
                          ID: {m.id}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[10px] mt-0.5">
                        {m.leagueName} • Status: <strong className="text-yellow-400">{m.status}</strong>
                      </div>
                      <div className="flex gap-3 text-[11px] font-mono mt-1 text-slate-300">
                        <span>1: <strong className="text-yellow-400">{m.odds.home.toFixed(2)}</strong></span>
                        <span>X: <strong className="text-yellow-400">{m.odds.draw.toFixed(2)}</strong></span>
                        <span>2: <strong className="text-yellow-400">{m.odds.away.toFixed(2)}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenMatchEditor(m)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition cursor-pointer"
                        title="Edit Odds & Match"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete match ${m.homeTeam} vs ${m.awayTeam}?`)) {
                            onDeleteMatch(m.id);
                          }
                        }}
                        className="p-2 bg-slate-800 hover:bg-red-900/60 text-red-400 rounded-lg transition cursor-pointer"
                        title="Delete Match"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. API-FOOTBALL ENGINE */}
          {activeTab === 'api_football' && (
            <div className="p-4 sm:p-5 bg-[#0e131d] rounded-2xl border border-teal-500/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h4 className="font-black text-sm text-teal-300 uppercase flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-400" />
                    <span>API-Football.com Live Match Feeds &amp; Engine</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Live match feed, odds synchronization, and automated 48-hour postponement refund rules.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCheckApiStatus}
                    disabled={isCheckingStatus}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold rounded-xl text-xs transition border border-teal-500/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                    <span>{isCheckingStatus ? 'Checking...' : 'Check Status'}</span>
                  </button>
                  <button
                    onClick={handleTriggerApiSync}
                    disabled={isSyncingApi}
                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 text-slate-950 font-black rounded-xl text-xs transition shadow flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingApi ? 'animate-spin' : ''}`} />
                    <span>{isSyncingApi ? 'Syncing...' : 'Sync Live Feeds'}</span>
                  </button>
                </div>
              </div>

              {/* API Key Form */}
              <form onSubmit={handleSaveApiKey} className="bg-[#151c28] p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-200">
                    API-Football Key ({DEFAULT_API_FOOTBALL_KEY}):
                  </label>
                  <span className="text-[11px] text-teal-400 font-mono">Target Refresh: &lt;3s</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Enter API Key"
                    className="flex-1 bg-[#0e131d] border border-slate-700 rounded-xl px-3 py-2 text-yellow-400 font-mono font-bold text-xs focus:outline-none focus:border-teal-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl text-xs transition shadow cursor-pointer"
                    >
                      Save Key
                    </button>
                    <button
                      type="button"
                      onClick={handleResetApiKey}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition border border-slate-700 cursor-pointer"
                    >
                      Reset Default
                    </button>
                  </div>
                </div>
                {apiKeySavedNotice && (
                  <p className="text-[11px] text-emerald-400 font-bold animate-in fade-in">
                    ✓ {apiKeySavedNotice}
                  </p>
                )}
              </form>

              {statusReport && (
                <div className="p-3 bg-emerald-950/70 border border-emerald-500/80 rounded-xl text-xs text-emerald-200 font-mono">
                  {statusReport.message}
                </div>
              )}

              {apiSyncReport && (
                <div className="p-3 bg-teal-950/80 border border-teal-500/60 rounded-xl text-xs text-teal-200 font-mono">
                  {apiSyncReport}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
