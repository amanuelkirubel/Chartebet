import React from 'react';
import { 
  ShieldCheck, 
  Trophy, 
  Clock, 
  Users, 
  Activity, 
  Play, 
  Database 
} from 'lucide-react';
import { UserAccount, Language } from '../types';

interface AdminGroundBarProps {
  user: UserAccount;
  onOpenInspectionModal: (tab: 'won' | 'pending' | 'signed_in' | 'online' | 'settle') => void;
  onOpenAdminConsole: () => void;
  wonSlipsCount: number;
  pendingSlipsCount: number;
  signedInUsersCount: number;
  onlineUsersCount: number;
  currentLang: Language;
}

export const AdminGroundBar: React.FC<AdminGroundBarProps> = ({
  user,
  onOpenInspectionModal,
  onOpenAdminConsole,
  wonSlipsCount,
  pendingSlipsCount,
  signedInUsersCount,
  onlineUsersCount,
}) => {
  // Only render if logged-in user is an administrator
  if (!user.isLoggedIn || user.role !== 'admin') {
    return null;
  }

  return (
    <aside
      aria-label="Admin ground metric option bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-slate-950 via-[#0a1120] to-slate-950 border-t-2 border-blue-500 shadow-[0_-5px_25px_rgba(37,99,235,0.4)] text-white select-none py-1.5 px-2.5 sm:px-6"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        {/* Left Badge */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-black shadow-md">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs sm:text-sm tracking-wide text-white">
                ADMIN REAL-TIME METRICS
              </span>
              <span className="bg-emerald-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full animate-pulse">
                GROUND
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Admin: <strong className="text-blue-300">{user.email || user.username}</strong>
            </p>
          </div>
        </div>

        {/* Center 4 Live Metrics Options */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs flex-wrap">
          <button
            onClick={() => onOpenInspectionModal('won')}
            className="flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/80 px-2 py-1 rounded-xl text-emerald-300 font-bold transition shadow-sm cursor-pointer"
            title="Inspect Won Slips Registry"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>Won Slips:</span>
            <span className="font-mono font-black text-white bg-emerald-600/60 px-1.5 py-0.2 rounded">
              {wonSlipsCount}
            </span>
          </button>

          <button
            onClick={() => onOpenInspectionModal('pending')}
            className="flex items-center gap-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/80 px-2 py-1 rounded-xl text-amber-300 font-bold transition shadow-sm cursor-pointer"
            title="Inspect Pending / Unfinished Slips"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pending:</span>
            <span className="font-mono font-black text-white bg-amber-600/60 px-1.5 py-0.2 rounded">
              {pendingSlipsCount}
            </span>
          </button>

          <button
            onClick={() => onOpenInspectionModal('signed_in')}
            className="flex items-center gap-1.5 bg-blue-950/80 hover:bg-blue-900 border border-blue-500/80 px-2 py-1 rounded-xl text-blue-300 font-bold transition shadow-sm cursor-pointer"
            title="Inspect Registered & Signed-In Users"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Users:</span>
            <span className="font-mono font-black text-white bg-blue-600/60 px-1.5 py-0.2 rounded">
              {signedInUsersCount}
            </span>
          </button>

          <button
            onClick={() => onOpenInspectionModal('online')}
            className="flex items-center gap-1.5 bg-teal-950/80 hover:bg-teal-900 border border-teal-500/80 px-2 py-1 rounded-xl text-teal-300 font-bold transition shadow-sm cursor-pointer"
            title="Live Online Active Bettors"
          >
            <Activity className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>Online:</span>
            <span className="font-mono font-black text-white bg-teal-600/60 px-1.5 py-0.2 rounded">
              {onlineUsersCount.toLocaleString()}
            </span>
          </button>

          <button
            onClick={() => onOpenInspectionModal('settle')}
            className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white px-2 py-1 rounded-xl text-xs font-black transition shadow cursor-pointer"
            title="Evaluate Outcomes & Move Winning Slips to Payout List"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>Settle</span>
          </button>
        </div>

        {/* Right Admin Console Opener */}
        <button
          onClick={onOpenAdminConsole}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs transition shadow-md shadow-blue-500/30 flex items-center gap-1 cursor-pointer"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Admin Station</span>
        </button>
      </div>
    </aside>
  );
};
