import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp, Flame, Settings, Trash2, Shield } from 'lucide-react';
import { Match, BetSelection, Language } from '../types';
import { translations } from '../data/translations';

interface HuluSportMatchCardProps {
  match: Match;
  selectedBets: BetSelection[];
  onToggleBet: (selection: BetSelection) => void;
  currentLang: Language;
  isDarkMode: boolean;
  userRole?: string;
  onAdminEditMatch?: (match: Match) => void;
  onAdminRemoveMatch?: (matchId: string) => void;
}

export const HuluSportMatchCard: React.FC<HuluSportMatchCardProps> = ({
  match,
  selectedBets,
  onToggleBet,
  currentLang,
  isDarkMode,
  userRole,
  onAdminEditMatch,
  onAdminRemoveMatch,
}) => {
  const t = translations[currentLang];
  const [expanded, setExpanded] = useState(false);
  const [isStarred, setIsStarred] = useState(match.isFavorite || false);

  const isSelected = (marketType: BetSelection['marketType'], selectionName: string) => {
    return selectedBets.some(
      (b) => b.matchId === match.id && b.marketType === marketType && b.selectionName === selectionName
    );
  };

  const handleSelect = (marketType: BetSelection['marketType'], selectionName: string, odds: number) => {
    const home = currentLang === 'am' && match.homeTeamAm ? match.homeTeamAm : match.homeTeam;
    const away = currentLang === 'am' && match.awayTeamAm ? match.awayTeamAm : match.awayTeam;
    const league = currentLang === 'am' && match.leagueNameAm ? match.leagueNameAm : match.leagueName;
    onToggleBet({
      id: `${match.id}-${marketType}-${selectionName}`,
      matchId: match.id,
      matchTitle: `${home} vs ${away}`,
      leagueName: league,
      marketType,
      selectionName,
      odds,
    });
  };

  const cardBg = isDarkMode ? 'bg-[#181f2b] border-slate-800' : 'bg-white border-slate-200';
  const oddsBtnNormal = isDarkMode
    ? 'bg-[#121620] hover:bg-blue-600/30 border-slate-700 text-slate-200'
    : 'bg-slate-50 hover:bg-blue-50 border-slate-200 text-slate-900';

  const isAdmin = userRole === 'admin';

  return (
    <div className={`rounded-xl border shadow-sm transition overflow-hidden ${cardBg}`}>
      {/* Admin Quick Control Bar */}
      {isAdmin && (
        <div className="bg-slate-900/90 border-b border-blue-500/30 px-3 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-blue-400 font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-[10px] tracking-wider uppercase">Admin Control</span>
          </div>
          <div className="flex items-center gap-2">
            {onAdminEditMatch && (
              <button
                type="button"
                onClick={() => onAdminEditMatch(match)}
                className="px-2.5 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                title="Adjust Odds & Game Details"
              >
                <Settings className="w-3 h-3" />
                <span>Adjust Odds</span>
              </button>
            )}
            {onAdminRemoveMatch && (
              <button
                type="button"
                onClick={() => onAdminRemoveMatch(match.id)}
                className="px-2.5 py-0.5 bg-red-950 hover:bg-red-900 border border-red-500/40 text-red-300 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                title="Remove Game"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Match Main Row */}
      <div className="p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Side: Time, Live badge, Match Teams */}
        <div className="flex-1 min-w-0 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white rounded-xl p-3 border border-blue-800/80 shadow-sm">
          <div className="flex items-center justify-between gap-2 text-xs mb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white bg-blue-950 px-2 py-0.5 rounded border border-blue-600/60 text-[11px]">
                {match.kickoffTime}
              </span>
              {match.isLive && (
                <span className="flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 rounded-full font-black text-[10px] animate-pulse">
                  <Flame className="w-3 h-3 fill-white" />
                  LIVE {match.liveMinute}&apos; ({match.homeScore ?? 0} - {match.awayScore ?? 0})
                </span>
              )}
            </div>
            <span className="text-blue-200 truncate text-[11px] font-semibold">
              {match.leagueFlag} {currentLang === 'am' && match.leagueNameAm ? match.leagueNameAm : match.leagueName}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="font-bold text-white text-sm sm:text-base flex items-center justify-between sm:justify-start gap-2">
              <span className="truncate">
                {currentLang === 'am' && match.homeTeamAm ? match.homeTeamAm : match.homeTeam}
              </span>
              {match.isLive && (
                <span className="text-yellow-300 font-mono font-extrabold">
                  {match.homeScore ?? 0}
                </span>
              )}
            </div>
            <div className="font-bold text-white text-sm sm:text-base flex items-center justify-between sm:justify-start gap-2">
              <span className="truncate">
                {currentLang === 'am' && match.awayTeamAm ? match.awayTeamAm : match.awayTeam}
              </span>
              {match.isLive && (
                <span className="text-yellow-300 font-mono font-extrabold">
                  {match.awayScore ?? 0}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: 1, X, 2 Odds Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Home Win (1) */}
          <button
            onClick={() => handleSelect('1X2', '1', match.odds.home)}
            className={`flex flex-col items-center justify-center min-w-[58px] sm:min-w-[70px] h-12 rounded-xl border transition cursor-pointer ${
              isSelected('1X2', '1')
                ? 'bg-blue-600 border-blue-700 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-400/50'
                : oddsBtnNormal
            }`}
          >
            <span className={`text-[10px] uppercase font-bold ${isSelected('1X2', '1') ? 'text-blue-100' : 'text-slate-400'}`}>
              1
            </span>
            <span className="font-mono font-bold text-sm sm:text-base">
              {match.odds.home.toFixed(2)}
            </span>
          </button>

          {/* Draw (X) */}
          <button
            onClick={() => handleSelect('1X2', 'X', match.odds.draw)}
            className={`flex flex-col items-center justify-center min-w-[58px] sm:min-w-[70px] h-12 rounded-xl border transition cursor-pointer ${
              isSelected('1X2', 'X')
                ? 'bg-blue-600 border-blue-700 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-400/50'
                : oddsBtnNormal
            }`}
          >
            <span className={`text-[10px] uppercase font-bold ${isSelected('1X2', 'X') ? 'text-blue-100' : 'text-slate-400'}`}>
              X
            </span>
            <span className="font-mono font-bold text-sm sm:text-base">
              {match.odds.draw.toFixed(2)}
            </span>
          </button>

          {/* Away Win (2) */}
          <button
            onClick={() => handleSelect('1X2', '2', match.odds.away)}
            className={`flex flex-col items-center justify-center min-w-[58px] sm:min-w-[70px] h-12 rounded-xl border transition cursor-pointer ${
              isSelected('1X2', '2')
                ? 'bg-blue-600 border-blue-700 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-400/50'
                : oddsBtnNormal
            }`}
          >
            <span className={`text-[10px] uppercase font-bold ${isSelected('1X2', '2') ? 'text-blue-100' : 'text-slate-400'}`}>
              2
            </span>
            <span className="font-mono font-bold text-sm sm:text-base">
              {match.odds.away.toFixed(2)}
            </span>
          </button>

          {/* More Markets Accordion Toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 bg-slate-900 hover:bg-blue-900 text-white text-xs font-semibold px-2.5 h-12 rounded-xl transition border border-slate-700 cursor-pointer"
            title={t.moreMarkets}
          >
            <span className="font-mono font-bold">+{match.moreMarketsCount}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Star favorite */}
          <button
            onClick={() => setIsStarred(!isStarred)}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isStarred ? 'text-yellow-400' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <Star className={`w-4 h-4 ${isStarred ? 'fill-yellow-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded More Markets Panel */}
      {expanded && (
        <div className={`border-t p-3 sm:p-4 space-y-3 text-xs ${isDarkMode ? 'bg-[#121620] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          {/* Over/Under 2.5 Goals */}
          <div>
            <div className="font-bold text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Over / Under 2.5 Goals</span>
              <span className="text-slate-500 font-normal">Goals</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSelect('OverUnder', 'Over 2.5', match.odds.over25 || 1.85)}
                className={`py-2 px-3 rounded-lg border flex items-center justify-between font-medium transition cursor-pointer ${
                  isSelected('OverUnder', 'Over 2.5')
                    ? 'bg-blue-600 text-white border-blue-700'
                    : oddsBtnNormal
                }`}
              >
                <span>Over 2.5</span>
                <span className="font-mono font-bold">{(match.odds.over25 || 1.85).toFixed(2)}</span>
              </button>
              <button
                onClick={() => handleSelect('OverUnder', 'Under 2.5', match.odds.under25 || 1.95)}
                className={`py-2 px-3 rounded-lg border flex items-center justify-between font-medium transition cursor-pointer ${
                  isSelected('OverUnder', 'Under 2.5')
                    ? 'bg-blue-600 text-white border-blue-700'
                    : oddsBtnNormal
                }`}
              >
                <span>Under 2.5</span>
                <span className="font-mono font-bold">{(match.odds.under25 || 1.95).toFixed(2)}</span>
              </button>
            </div>
          </div>

          {/* Both Teams To Score (BTTS) */}
          <div>
            <div className="font-bold text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Both Teams to Score (GG / NG)</span>
              <span className="text-slate-500 font-normal">BTTS</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSelect('BTTS', 'BTTS Yes', match.odds.bttsYes || 1.75)}
                className={`py-2 px-3 rounded-lg border flex items-center justify-between font-medium transition cursor-pointer ${
                  isSelected('BTTS', 'BTTS Yes')
                    ? 'bg-blue-600 text-white border-blue-700'
                    : oddsBtnNormal
                }`}
              >
                <span>Yes (GG)</span>
                <span className="font-mono font-bold">{(match.odds.bttsYes || 1.75).toFixed(2)}</span>
              </button>
              <button
                onClick={() => handleSelect('BTTS', 'BTTS No', match.odds.bttsNo || 2.05)}
                className={`py-2 px-3 rounded-lg border flex items-center justify-between font-medium transition cursor-pointer ${
                  isSelected('BTTS', 'BTTS No')
                    ? 'bg-blue-600 text-white border-blue-700'
                    : oddsBtnNormal
                }`}
              >
                <span>No (NG)</span>
                <span className="font-mono font-bold">{(match.odds.bttsNo || 2.05).toFixed(2)}</span>
              </button>
            </div>
          </div>

          {/* Double Chance */}
          <div>
            <div className="font-bold text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Double Chance</span>
              <span className="text-slate-500 font-normal">1X / 12 / X2</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSelect('DoubleChance', '1X', match.odds.doubleChance1X || 1.25)}
                className={`py-2 px-2 rounded-lg border flex flex-col items-center font-medium transition cursor-pointer ${
                  isSelected('DoubleChance', '1X')
                    ? 'bg-blue-600 text-white border-blue-700'
                    : oddsBtnNormal
                }`}
              >
                <span className="text-[10px] text-slate-400 font-bold">1X</span>
                <span className="font-mono font-bold">{(match.odds.doubleChance1X || 1.25).toFixed(2)}</span>
              </button>
              <button
                onClick={() => handleSelect('DoubleChance', '12', match.odds.doubleChance12 || 1.3)}
                className={`py-2 px-2 rounded-lg border flex flex-col items-center font-medium transition cursor-pointer ${
                  isSelected('DoubleChance', '12')
                    ? 'bg-blue-600 text-white border-blue-700'
                    : oddsBtnNormal
                }`}
              >
                <span className="text-[10px] text-slate-400 font-bold">12</span>
                <span className="font-mono font-bold">{(match.odds.doubleChance12 || 1.3).toFixed(2)}</span>
              </button>
              <button
                onClick={() => handleSelect('DoubleChance', 'X2', match.odds.doubleChanceX2 || 1.7)}
                className={`py-2 px-2 rounded-lg border flex flex-col items-center font-medium transition cursor-pointer ${
                  isSelected('DoubleChance', 'X2')
                    ? 'bg-blue-600 text-white border-blue-700'
                    : oddsBtnNormal
                }`}
              >
                <span className="text-[10px] text-slate-400 font-bold">X2</span>
                <span className="font-mono font-bold">{(match.odds.doubleChanceX2 || 1.7).toFixed(2)}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
