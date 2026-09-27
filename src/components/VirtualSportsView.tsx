import React from 'react';
import { UserAccount, Language, BetSelection } from '../types';

interface VirtualSportsViewProps {
  user: UserAccount;
  onUpdateBalance: (newBalance: number) => void;
  onToggleBet: (selection: BetSelection) => void;
  currentLang: Language;
}

export const VirtualSportsView: React.FC<VirtualSportsViewProps> = ({
  onToggleBet,
}) => {
  const virtualRaces = [
    {
      id: 'race-101',
      title: 'Addis Ababa Gold Cup Derby',
      postTime: 'In 45s',
      runners: [
        { num: 1, name: 'Sheba Thunder', odds: 2.80, silk: '🔴' },
        { num: 2, name: 'Bole Express', odds: 3.50, silk: '🔵' },
        { num: 3, name: 'Highland Flyer', odds: 4.20, silk: '🟢' },
        { num: 4, name: 'Abyssinia Pride', odds: 6.00, silk: '🟡' },
        { num: 5, name: 'Rift Valley Flash', odds: 8.50, silk: '🟣' },
        { num: 6, name: 'Entoto Star', odds: 12.0, silk: '🟠' },
      ],
    },
    {
      id: 'race-102',
      title: 'Virtual Premier Championship',
      postTime: 'In 2m',
      runners: [
        { num: 1, name: 'Virtual London Red', odds: 2.10, silk: '🔴' },
        { num: 2, name: 'Virtual Manchester Blue', odds: 3.20, silk: '🔵' },
        { num: 3, name: 'Draw', odds: 3.40, silk: '⚪' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-2xl p-4 sm:p-5 text-white border border-emerald-500/30 flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <span>🏇 VIRTUAL RACING &amp; LEAGUES</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            24/7 instant virtual horse races, greyhounds, and fast virtual soccer.
          </p>
        </div>
      </div>

      {/* Race Cards */}
      <div className="space-y-3">
        {virtualRaces.map((race) => (
          <div
            key={race.id}
            className="bg-[#121620] border border-slate-800 rounded-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏁</span>
                <div>
                  <h4 className="font-bold text-sm text-white">{race.title}</h4>
                  <span className="text-[10px] text-emerald-400 font-semibold">{race.postTime}</span>
                </div>
              </div>
              <span className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                BETTING OPEN
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {race.runners.map((r) => (
                <button
                  key={r.num}
                  onClick={() =>
                    onToggleBet({
                      id: `${race.id}-runner-${r.num}`,
                      matchId: race.id,
                      matchTitle: race.title,
                      leagueName: 'Virtual Arena',
                      marketType: 'Special',
                      selectionName: `${r.silk} #${r.num} ${r.name}`,
                      odds: r.odds,
                    })
                  }
                  className="p-2.5 rounded-xl bg-[#0e131d] border border-slate-800 hover:border-blue-500 flex items-center justify-between text-xs transition group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span>{r.silk}</span>
                    <span className="font-bold text-white truncate">{r.name}</span>
                  </div>
                  <span className="font-mono font-bold text-yellow-400 group-hover:text-white">
                    {r.odds.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
