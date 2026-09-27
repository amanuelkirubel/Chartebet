import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Clock, 
  Trophy, 
  Search, 
  Calendar, 
  RefreshCw, 
  Activity
} from 'lucide-react';
import { Match, BetSelection, Language } from '../types';
import { HuluSportMatchCard } from './HuluSportMatchCard';
import { translations } from '../data/translations';
import { syncFromApiFootball, DEFAULT_API_FOOTBALL_KEY } from '../utils/matchStore';

interface SoccerViewProps {
  matches: Match[];
  selectedBets: BetSelection[];
  onToggleBet: (selection: BetSelection) => void;
  currentLang: Language;
  isDarkMode: boolean;
  onRefreshLive?: () => void;
  isFetchingLive?: boolean;
  userRole?: string;
  onAdminEditMatch?: (match: Match) => void;
  onAdminRemoveMatch?: (matchId: string) => void;
}

export const SoccerView: React.FC<SoccerViewProps> = ({
  matches,
  selectedBets,
  onToggleBet,
  currentLang,
  isDarkMode,
  onRefreshLive,
  isFetchingLive = false,
  userRole,
  onAdminEditMatch,
  onAdminRemoveMatch,
}) => {
  const t = translations[currentLang];
  type DayTab = 'today' | 'tomorrow' | '2days' | '3days' | 'all';
  const [activeDay, setActiveDay] = useState<DayTab>('today');
  const [filterMode, setFilterMode] = useState<'all' | 'live' | 'popular'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [refreshCountdown, setRefreshCountdown] = useState<number>(60);

  // Real-time scoreboard countdown and refresh ticker
  useEffect(() => {
    // 1-second interval solely updates the local countdown number
    const countdownTimer = setInterval(() => {
      setRefreshCountdown((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);

    // Periodic 60-second live scores refresh
    const refreshTimer = setInterval(() => {
      onRefreshLive?.();
    }, 60000);

    return () => {
      clearInterval(countdownTimer);
      clearInterval(refreshTimer);
    };
  }, [onRefreshLive]);

  const filteredMatches = matches.filter((match) => {
    if (activeDay === 'today') {
      if (match.kickoffDate !== 'today' && !match.isLive) {
        return false;
      }
    } else if (activeDay === 'tomorrow') {
      if (match.kickoffDate !== 'tomorrow') {
        return false;
      }
    } else if (activeDay === '2days') {
      if (match.kickoffDate !== '2days') {
        return false;
      }
    } else if (activeDay === '3days') {
      if (match.kickoffDate !== '3days') {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${match.homeTeam} ${match.awayTeam} ${match.leagueName} ${match.homeTeamAm || ''} ${match.awayTeamAm || ''}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    if (selectedLeague !== 'all') {
      const matchLg = match.leagueId.toLowerCase();
      const selLg = selectedLeague.toLowerCase();
      if (matchLg !== selLg && !match.leagueName.toLowerCase().includes(selLg)) {
        return false;
      }
    }

    if (filterMode === 'live') return match.isLive || match.status === 'live';
    if (filterMode === 'popular') return match.isPopular;

    return true;
  });

  const todayCount = matches.filter((m) => m.kickoffDate === 'today' || m.isLive).length;
  const tomorrowCount = matches.filter((m) => m.kickoffDate === 'tomorrow').length;
  const twoDaysCount = matches.filter((m) => m.kickoffDate === '2days').length;
  const threeDaysCount = matches.filter((m) => m.kickoffDate === '3days').length;

  const popularLeagues = [
    { id: 'all', name: 'All Matches', flag: '⚽' },
    { id: 'premier-league', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 'la-liga', name: 'La Liga', flag: '🇪🇸' },
    { id: 'champions-league', name: 'Champions League', flag: '🏆' },
    { id: 'serie-a', name: 'Serie A', flag: '🇮🇹' },
    { id: 'bundesliga', name: 'Bundesliga', flag: '🇩🇪' },
    { id: 'ligue-1', name: 'Ligue 1', flag: '🇫🇷' },
    { id: 'ethiopian-pl', name: 'Ethiopian Premier League', flag: '🇪🇹' },
    { id: 'saudi-pro-league', name: 'Saudi Pro League', flag: '🇸🇦' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner & Fast Live Status Bar */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 rounded-2xl p-3 sm:p-4 text-white shadow-md border border-blue-700/60 flex items-center justify-between flex-wrap gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black tracking-tight">
              {currentLang === 'am' ? 'የእግር ኳስ ጨዋታዎች' : "Soccer Match Fixtures"}
            </h2>
            <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
              {matches.length} FIXTURES
            </span>
          </div>
          <p className="text-[11px] text-blue-200 mt-0.5">
            {currentLang === 'am'
              ? 'የዛሬ፣ የነገ እና የቀጣይ ቀናት ጨዋታዎች • ከፍተኛ ኦዶች'
              : 'Top Odds • Live updates • 48h postponement protection active'}
          </p>
        </div>

        {/* Live Sports API Status */}
        <div className="flex items-center gap-2">
          <div className="bg-black/35 border border-white/20 rounded-xl px-2.5 py-1 flex items-center gap-2 text-xs">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
            <div>
              <div className="font-mono text-[10px] sm:text-[11px] text-emerald-300 font-bold flex items-center gap-1">
                <span>100 Real Live Games</span>
                <span className="text-[9px] bg-emerald-500/20 px-1 py-0.2 rounded font-mono">
                  {refreshCountdown}s
                </span>
              </div>
            </div>
          </div>

          {onRefreshLive && (
            <button
              onClick={onRefreshLive}
              disabled={isFetchingLive}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-50 cursor-pointer"
              title="Refresh Live Scores"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingLive ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Schedule Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1 bg-[#121620] p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveDay('today')}
            className={`px-3 py-1.5 rounded-lg font-black transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeDay === 'today' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{currentLang === 'am' ? 'የዛሬ (Today)' : "Today's Matches"}</span>
            <span className="bg-yellow-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
              {todayCount}
            </span>
          </button>

          <button
            onClick={() => setActiveDay('tomorrow')}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeDay === 'tomorrow' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{currentLang === 'am' ? 'የነገ' : 'Tomorrow'}</span>
            <span className="bg-slate-800 text-slate-300 text-[9px] font-mono px-1.5 py-0.2 rounded-full">
              {tomorrowCount}
            </span>
          </button>

          <button
            onClick={() => setActiveDay('2days')}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
              activeDay === '2days' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{currentLang === 'am' ? 'የ2 ቀን' : '2 Days'}</span>
            <span className="bg-slate-800 text-slate-300 text-[9px] font-mono px-1 py-0.2 rounded-full">
              {twoDaysCount}
            </span>
          </button>

          <button
            onClick={() => setActiveDay('3days')}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
              activeDay === '3days' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{currentLang === 'am' ? 'የ3 ቀን' : '3 Days'}</span>
            <span className="bg-slate-800 text-slate-300 text-[9px] font-mono px-1 py-0.2 rounded-full">
              {threeDaysCount}
            </span>
          </button>

          <button
            onClick={() => setActiveDay('all')}
            className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
              activeDay === 'all' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{currentLang === 'am' ? 'ሁሉም' : 'All'}</span>
            <span className="bg-slate-800 text-slate-300 text-[9px] font-mono px-1 py-0.2 rounded-full">
              {matches.length}
            </span>
          </button>
        </div>

        {/* Quick status filter */}
        <div className="flex items-center gap-1 bg-[#121620] p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2 py-1 rounded-lg font-bold transition cursor-pointer ${
              filterMode === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterMode('live')}
            className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
              filterMode === 'live' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            <span>Live ({matches.filter((m) => m.isLive).length})</span>
          </button>
          <button
            onClick={() => setFilterMode('popular')}
            className={`px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
              filterMode === 'popular' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3 text-yellow-300" />
            <span>Top Picks</span>
          </button>
        </div>
      </div>

      {/* League Carousel and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-1">
          {popularLeagues.map((lg) => (
            <button
              key={lg.id}
              onClick={() => setSelectedLeague(lg.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 border cursor-pointer ${
                selectedLeague === lg.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-[#121620] text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{lg.flag}</span>
              <span>{lg.name}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full sm:w-56 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={currentLang === 'am' ? 'ቡድን ይፈልጉ...' : 'Search team or league...'}
            className="w-full bg-[#121620] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-[#121620] rounded-2xl border border-slate-800 space-y-2">
            <Trophy className="w-10 h-10 mx-auto stroke-1 text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">No matches found for selected criteria</p>
            <button
              onClick={() => {
                setActiveDay('all');
                setSelectedLeague('all');
                setSearchQuery('');
              }}
              className="mt-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Show All Matches
            </button>
          </div>
        ) : (
          filteredMatches.map((match) => (
            <HuluSportMatchCard
              key={match.id}
              match={match}
              selectedBets={selectedBets}
              onToggleBet={onToggleBet}
              currentLang={currentLang}
              isDarkMode={isDarkMode}
              userRole={userRole}
              onAdminEditMatch={onAdminEditMatch}
              onAdminRemoveMatch={onAdminRemoveMatch}
            />
          ))
        )}
      </div>
    </div>
  );
};
