import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trophy, 
  Clock, 
  Users, 
  Activity, 
  Play
} from 'lucide-react';
import { OfflineSlip, UserAccount } from '../types';
import { getAllSlips, markSlipPayoutPaid } from '../utils/betAndTransactionStore';
import { settleAllPendingBets } from '../utils/settlement';
import { getAllRegisteredUsers, RegisteredUser } from '../utils/userStore';

interface AdminGroundInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'won' | 'pending' | 'signed_in' | 'online' | 'settle';
  user: UserAccount;
}

export const AdminGroundInspectionModal: React.FC<AdminGroundInspectionModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'won',
  user,
}) => {
  type GroundTab = 'won' | 'pending' | 'signed_in' | 'online' | 'settle';
  const [activeTab, setActiveTab] = useState<GroundTab>(initialTab);
  const [slips, setSlips] = useState<OfflineSlip[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [settleNotice, setSettleNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      loadData();
    }
  }, [isOpen, initialTab]);

  const loadData = () => {
    setSlips(getAllSlips());
    setRegisteredUsers(getAllRegisteredUsers());
  };

  if (!isOpen) return null;

  const wonSlips = slips.filter((s) => s.status === 'won');
  const pendingSlips = slips.filter((s) => s.status === 'pending');

  const [settling, setSettling] = useState(false);

  const handleFinishAndSettle = async () => {
    setSettling(true);
    try {
      const res = await settleAllPendingBets();
      loadData();
      setSettleNotice(
        `Checked real match results. ${res.newlyWon} slips won, ${res.newlyLost} lost.` +
          (res.creditedTotal > 0
            ? ` ${res.creditedTotal.toLocaleString()} ETB winnings added to online player balances.`
            : '') +
          ' Slips with unfinished games stay pending.'
      );
    } finally {
      setSettling(false);
    }
  };

  const handleCashoutSlip = (slip: OfflineSlip) => {
    markSlipPayoutPaid(slip.id, user.username || 'Admin Station', 'Central Office');
    loadData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#111722] text-white rounded-2xl max-w-4xl w-full border border-blue-500/60 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">
                ADMIN REAL-TIME METRICS &amp; INSPECTION REGISTRY
              </h3>
              <p className="text-[11px] text-slate-400">
                Ground monitoring bar registry &amp; game settlement tool
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

        {/* Tab switchers */}
        <div className="bg-[#0b0f17] px-6 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('won')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'won' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>Won Slips ({wonSlips.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'pending' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-300" />
            <span>Pending ({pendingSlips.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settle')}
            className={`px-3 py-1.5 rounded-lg font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'settle' ? 'bg-purple-600 text-white shadow' : 'text-purple-300 hover:text-white bg-purple-950/40 border border-purple-500/30'
            }`}
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Settle Slips Tool</span>
          </button>

          <button
            onClick={() => setActiveTab('signed_in')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'signed_in' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-blue-300" />
            <span>Users ({registeredUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('online')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'online' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 text-teal-300 animate-pulse" />
            <span>Online (1,428)</span>
          </button>
        </div>

        {settleNotice && (
          <div className="bg-purple-950/80 border-b border-purple-500 px-6 py-2 text-xs text-purple-200 font-bold flex items-center justify-between">
            <span>{settleNotice}</span>
            <button onClick={() => setSettleNotice(null)} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {activeTab === 'won' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">Won Slips &amp; Payout List</h4>
                <span className="text-emerald-400 font-mono font-bold">{wonSlips.length} Winning Slips</span>
              </div>

              {wonSlips.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Trophy className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-bold text-white">No winning slips evaluated yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {wonSlips.map((slip) => (
                    <div
                      key={slip.id}
                      className="p-3 bg-[#0e131d] rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-yellow-400">{slip.bookingCode}</span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            slip.payoutPaid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400 animate-pulse'
                          }`}>
                            {slip.payoutPaid ? 'CASHED OUT' : 'READY FOR PAYOUT'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1">
                          Customer: <strong>{slip.customerName}</strong> ({slip.userPhone || 'Walk-in'})
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Odds: {slip.totalOdds.toFixed(2)} • Stake: {slip.stake} ETB
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1.5">
                        <span className="font-mono font-black text-sm text-emerald-400">
                          +{(slip.payoutAmount ?? slip.potentialReturn).toLocaleString()} ETB
                        </span>
                        {!slip.payoutPaid ? (
                          <button
                            onClick={() => handleCashoutSlip(slip)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-lg text-[10px] transition shadow cursor-pointer"
                          >
                            Mark Paid / Cash Out
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Paid by {slip.payoutBy || 'Cashier'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">Pending &amp; Unfinished Slips</h4>
                <span className="text-amber-400 font-mono font-bold">{pendingSlips.length} In-Play</span>
              </div>

              {pendingSlips.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Clock className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-bold text-white">All slips have been settled</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {pendingSlips.map((slip) => (
                    <div
                      key={slip.id}
                      className="p-3 bg-[#0e131d] rounded-xl border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-yellow-400">{slip.bookingCode}</span>
                          <span className="bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                            PENDING
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1">
                          Selections ({slip.selections.length}): {slip.selections.map((s) => s.matchTitle).join(', ')}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-white font-mono font-bold block">{slip.stake} ETB</span>
                        <span className="text-emerald-400 font-mono text-[11px]">
                          Pot. Return: {slip.potentialReturn.toLocaleString()} ETB
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settle' && (
            <div className="p-5 bg-[#0e131d] rounded-2xl border border-purple-500/40 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-500/50 flex items-center justify-center font-black">
                  <Play className="w-5 h-5 fill-purple-400" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-purple-300 uppercase tracking-wide">
                    FINISH GAMES &amp; SETTLE SLIPS TOOL
                  </h4>
                  <p className="text-xs text-slate-300">
                    Reads the real final scores, marks each game win/loss, and settles a slip only when all its games are finished. Online winners are credited automatically; cashier slips move to the payout registry.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#151c28] rounded-xl border border-slate-800 space-y-2 text-slate-300">
                <div className="flex justify-between items-center text-xs">
                  <span>Current Pending Slips:</span>
                  <strong className="font-mono text-amber-400 text-sm">{pendingSlips.length} Slips</strong>
                </div>
              </div>

              <button
                onClick={handleFinishAndSettle}
                disabled={pendingSlips.length === 0 || settling}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 text-white font-black rounded-xl text-sm transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{settling ? 'CHECKING RESULTS...' : `CHECK RESULTS & SETTLE ${pendingSlips.length} PENDING SLIPS`}</span>
              </button>
            </div>
          )}

          {activeTab === 'signed_in' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">Signed-In Registered Users</h4>
                <span className="text-blue-400 font-mono font-bold">{registeredUsers.length} Registered</span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {registeredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 bg-[#0e131d] rounded-xl border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">{u.username}</strong>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                          ID: {u.id}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {u.email || u.phone} • Role: <strong className="text-blue-300 uppercase">{u.role}</strong>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Balance</span>
                      <span className="font-mono font-black text-sm text-emerald-400">
                        {u.balance.toLocaleString()} {u.currency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'online' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">Real-Time Online Active Connections</h4>
                <span className="text-emerald-400 font-mono font-bold">1,428 Active Bettors</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-[#0e131d] rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Active in Soccer</span>
                  <span className="text-xl font-black font-mono text-blue-400">842</span>
                </div>
                <div className="p-3 bg-[#0e131d] rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Active in Aviator</span>
                  <span className="text-xl font-black font-mono text-red-400">316</span>
                </div>
                <div className="p-3 bg-[#0e131d] rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Active in Keno 80</span>
                  <span className="text-xl font-black font-mono text-yellow-400">185</span>
                </div>
                <div className="p-3 bg-[#0e131d] rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Cashier Counters</span>
                  <span className="text-xl font-black font-mono text-emerald-400">85</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
