import React, { useState, useEffect } from 'react';
import { X, Save, Trophy, Shield } from 'lucide-react';
import { Match } from '../types';

interface AdminMatchEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
  onSave: (match: Match) => void;
}

export const AdminMatchEditModal: React.FC<AdminMatchEditModalProps> = ({
  isOpen,
  onClose,
  match,
  onSave,
}) => {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [homeTeamAm, setHomeTeamAm] = useState('');
  const [awayTeamAm, setAwayTeamAm] = useState('');
  const [leagueName, setLeagueName] = useState('Premier League');
  const [leagueId, setLeagueId] = useState('premier-league');
  const [kickoffTime, setKickoffTime] = useState('20:00');
  const [kickoffDate, setKickoffDate] = useState<'today' | 'tomorrow' | '2days' | '3days' | 'other'>('today');
  const [status, setStatus] = useState<'upcoming' | 'live' | 'finished' | 'postponed'>('upcoming');
  const [isLive, setIsLive] = useState(false);
  const [liveMinute, setLiveMinute] = useState(45);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  // Odds
  const [homeOdds, setHomeOdds] = useState(2.10);
  const [drawOdds, setDrawOdds] = useState(3.40);
  const [awayOdds, setAwayOdds] = useState(3.20);
  const [over25, setOver25] = useState(1.85);
  const [under25, setUnder25] = useState(1.95);
  const [bttsYes, setBttsYes] = useState(1.75);
  const [bttsNo, setBttsNo] = useState(2.05);

  useEffect(() => {
    if (match) {
      setHomeTeam(match.homeTeam);
      setAwayTeam(match.awayTeam);
      setHomeTeamAm(match.homeTeamAm || '');
      setAwayTeamAm(match.awayTeamAm || '');
      setLeagueName(match.leagueName);
      setLeagueId(match.leagueId);
      setKickoffTime(match.kickoffTime);
      setKickoffDate(match.kickoffDate);
      setStatus(match.status);
      setIsLive(Boolean(match.isLive));
      setLiveMinute(match.liveMinute || 0);
      setHomeScore(match.homeScore || 0);
      setAwayScore(match.awayScore || 0);
      setHomeOdds(match.odds.home);
      setDrawOdds(match.odds.draw);
      setAwayOdds(match.odds.away);
      setOver25(match.odds.over25 || 1.85);
      setUnder25(match.odds.under25 || 1.95);
      setBttsYes(match.odds.bttsYes || 1.75);
      setBttsNo(match.odds.bttsNo || 2.05);
    } else {
      setHomeTeam('Arsenal');
      setAwayTeam('Chelsea');
      setHomeTeamAm('');
      setAwayTeamAm('');
      setLeagueName('Premier League');
      setLeagueId('premier-league');
      setKickoffTime('18:00');
      setKickoffDate('today');
      setStatus('upcoming');
      setIsLive(false);
      setLiveMinute(0);
      setHomeScore(0);
      setAwayScore(0);
      setHomeOdds(2.05);
      setDrawOdds(3.30);
      setAwayOdds(3.60);
      setOver25(1.80);
      setUnder25(1.95);
      setBttsYes(1.70);
      setBttsNo(2.10);
    }
  }, [match, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedMatch: Match = {
      id: match ? match.id : `match-${Date.now()}`,
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      homeTeamAm: homeTeamAm.trim() || undefined,
      awayTeamAm: awayTeamAm.trim() || undefined,
      leagueName: leagueName.trim(),
      leagueId: leagueId.trim() || 'premier-league',
      leagueFlag: '⚽',
      kickoffTime: kickoffTime.trim(),
      kickoffDate,
      status,
      isLive,
      liveMinute: isLive ? liveMinute : undefined,
      homeScore: isLive || status === 'finished' ? homeScore : undefined,
      awayScore: isLive || status === 'finished' ? awayScore : undefined,
      odds: {
        home: Number(homeOdds),
        draw: Number(drawOdds),
        away: Number(awayOdds),
        over25: Number(over25),
        under25: Number(under25),
        bttsYes: Number(bttsYes),
        bttsNo: Number(bttsNo),
        doubleChance1X: Number((1 / (1 / homeOdds + 1 / drawOdds) * 1.15).toFixed(2)),
        doubleChance12: Number((1 / (1 / homeOdds + 1 / awayOdds) * 1.15).toFixed(2)),
        doubleChanceX2: Number((1 / (1 / drawOdds + 1 / awayOdds) * 1.15).toFixed(2)),
      },
      moreMarketsCount: match ? match.moreMarketsCount : 48,
      isPopular: true,
    };

    onSave(updatedMatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#151c28] text-white rounded-2xl max-w-xl w-full border border-blue-500/60 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/50 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {match ? 'ADJUST MATCH ODDS & DETAILS' : 'CREATE NEW MATCH FIXTURE'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Admin Station Real-Time Odds Modifier
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Teams */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Home Team (English):</label>
              <input
                type="text"
                required
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
                className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Away Team (English):</label>
              <input
                type="text"
                required
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* League and Timing */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">League Name:</label>
              <input
                type="text"
                required
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Kickoff Time:</label>
              <input
                type="text"
                required
                value={kickoffTime}
                onChange={(e) => setKickoffTime(e.target.value)}
                placeholder="20:00"
                className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Schedule Tab:</label>
              <select
                value={kickoffDate}
                onChange={(e: any) => setKickoffDate(e.target.value)}
                className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-2 py-2 text-white text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="2days">2 Days</option>
                <option value="3days">3 Days</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Live Settings */}
          <div className="bg-[#0e131d] p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                <input
                  type="checkbox"
                  checked={isLive}
                  onChange={(e) => setIsLive(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Set as Live In-Play Match</span>
              </label>

              {isLive && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Minute:</span>
                  <input
                    type="number"
                    value={liveMinute}
                    onChange={(e) => setLiveMinute(Number(e.target.value))}
                    className="w-16 bg-[#151c28] border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-center"
                  />
                </div>
              )}
            </div>

            {isLive && (
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">Home Score:</span>
                  <input
                    type="number"
                    value={homeScore}
                    onChange={(e) => setHomeScore(Number(e.target.value))}
                    className="w-14 bg-[#151c28] border border-slate-700 rounded-lg px-2 py-1 text-yellow-400 font-mono font-bold text-center"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">Away Score:</span>
                  <input
                    type="number"
                    value={awayScore}
                    onChange={(e) => setAwayScore(Number(e.target.value))}
                    className="w-14 bg-[#151c28] border border-slate-700 rounded-lg px-2 py-1 text-yellow-400 font-mono font-bold text-center"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 1X2 Odds */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
              1X2 Main Market Odds:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">1 (Home Win)</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={homeOdds}
                  onChange={(e) => setHomeOdds(Number(e.target.value))}
                  className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-3 py-2 text-yellow-400 font-mono font-bold text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">X (Draw)</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={drawOdds}
                  onChange={(e) => setDrawOdds(Number(e.target.value))}
                  className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-3 py-2 text-yellow-400 font-mono font-bold text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">2 (Away Win)</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={awayOdds}
                  onChange={(e) => setAwayOdds(Number(e.target.value))}
                  className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-3 py-2 text-yellow-400 font-mono font-bold text-xs"
                />
              </div>
            </div>
          </div>

          {/* Over/Under & BTTS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Over 2.5</span>
              <input
                type="number"
                step="0.01"
                value={over25}
                onChange={(e) => setOver25(Number(e.target.value))}
                className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-2 py-1.5 text-white font-mono text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">Under 2.5</span>
              <input
                type="number"
                step="0.01"
                value={under25}
                onChange={(e) => setUnder25(Number(e.target.value))}
                className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-2 py-1.5 text-white font-mono text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">BTTS Yes (GG)</span>
              <input
                type="number"
                step="0.01"
                value={bttsYes}
                onChange={(e) => setBttsYes(Number(e.target.value))}
                className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-2 py-1.5 text-white font-mono text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5">BTTS No (NG)</span>
              <input
                type="number"
                step="0.01"
                value={bttsNo}
                onChange={(e) => setBttsNo(Number(e.target.value))}
                className="w-full bg-[#0e131d] border border-slate-700 rounded-xl px-2 py-1.5 text-white font-mono text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 text-white font-black rounded-xl text-xs sm:text-sm transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>SAVE MATCH &amp; BROADCAST ODDS</span>
          </button>
        </form>
      </div>
    </div>
  );
};
