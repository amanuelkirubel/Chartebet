import React, { useState } from 'react';
import { 
  Globe2, 
  ChevronRight, 
  Trophy, 
  ArrowLeft
} from 'lucide-react';
import { Match, BetSelection, Language } from '../types';
import { continentsList, Continent, Country, League } from '../data/sportsDirectory';
import { HuluSportMatchCard } from './HuluSportMatchCard';

interface SportsDirectoryViewProps {
  matches: Match[];
  selectedBets: BetSelection[];
  onToggleBet: (selection: BetSelection) => void;
  currentLang: Language;
  isDarkMode: boolean;
  userRole?: string;
  onAdminEditMatch?: (match: Match) => void;
  onAdminRemoveMatch?: (matchId: string) => void;
}

export const SportsDirectoryView: React.FC<SportsDirectoryViewProps> = ({
  matches,
  selectedBets,
  onToggleBet,
  currentLang,
  isDarkMode,
  userRole,
  onAdminEditMatch,
  onAdminRemoveMatch,
}) => {
  const [selectedContinent, setSelectedContinent] = useState<Continent | null>(continentsList[0]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);

  const handleSelectContinent = (cont: Continent) => {
    setSelectedContinent(cont);
    setSelectedCountry(null);
    setSelectedLeague(null);
  };

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setSelectedLeague(null);
  };

  const displayedMatches = matches.filter((m) => {
    if (selectedLeague) {
      return (
        m.leagueId === selectedLeague.id ||
        m.leagueName.toLowerCase().includes(selectedLeague.name.toLowerCase())
      );
    }
    if (selectedCountry) {
      return selectedCountry.leagues.some(
        (l: League) =>
          l.id === m.leagueId ||
          m.leagueName.toLowerCase().includes(l.name.toLowerCase())
      );
    }
    if (selectedContinent) {
      return selectedContinent.countries.some((c) =>
        c.leagues.some(
          (l) => l.id === m.leagueId || m.leagueName.toLowerCase().includes(l.name.toLowerCase())
        )
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 rounded-2xl p-4 text-white border border-emerald-500/30 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>7 CONTINENTS SPORTS DIRECTORY</span>
            </h2>
            <p className="text-xs text-slate-300">
              Select continent → choose country → select league to view live and pre-match odds
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumbs Navigation */}
      <div className="flex items-center gap-2 text-xs bg-[#121620] px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 flex-wrap">
        <span className="font-bold text-white flex items-center gap-1">
          <Globe2 className="w-3.5 h-3.5 text-blue-400" />
          <span>7 Continents</span>
        </span>

        {selectedContinent && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <button
              onClick={() => {
                setSelectedCountry(null);
                setSelectedLeague(null);
              }}
              className="text-blue-400 hover:text-blue-300 font-bold cursor-pointer"
            >
              {selectedContinent.icon} {selectedContinent.name}
            </button>
          </>
        )}

        {selectedCountry && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <button
              onClick={() => setSelectedLeague(null)}
              className="text-yellow-400 hover:text-yellow-300 font-bold cursor-pointer"
            >
              {selectedCountry.flag} {selectedCountry.name}
            </button>
          </>
        )}

        {selectedLeague && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-emerald-400 font-bold">
              🏆 {selectedLeague.name}
            </span>
          </>
        )}
      </div>

      {/* 7 CONTINENTS PILLS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {continentsList.map((cont) => {
          const isSel = selectedContinent?.id === cont.id;
          return (
            <button
              key={cont.id}
              onClick={() => handleSelectContinent(cont)}
              className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                isSel
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg ring-1 ring-blue-400/50'
                  : 'bg-[#121620] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span className="text-xl">{cont.icon}</span>
              <span className="font-bold text-xs truncate max-w-full">{cont.name}</span>
              <span className="text-[10px] text-slate-400">
                {cont.countries.length} countries
              </span>
            </button>
          );
        })}
      </div>

      {/* Countries & Leagues in Selected Continent */}
      {selectedContinent && !selectedLeague && (
        <div className="bg-[#121620] border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span>{selectedContinent.icon}</span>
              <span>Countries &amp; Leagues in {selectedContinent.name}</span>
            </h3>
            <span className="text-xs text-slate-400">
              Click any country or league to view match fixtures
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {selectedContinent.countries.map((country) => {
              const isCountryActive = selectedCountry?.id === country.id;
              return (
                <div
                  key={country.id}
                  className={`p-3 rounded-xl border transition ${
                    isCountryActive
                      ? 'bg-[#182234] border-blue-500 shadow-sm'
                      : 'bg-[#0e131d] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div
                    onClick={() => handleSelectCountry(country)}
                    className="flex items-center justify-between cursor-pointer pb-2 border-b border-slate-800/80 mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flag}</span>
                      <strong className="text-xs text-white">{country.name}</strong>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {country.leagues.length} leagues
                    </span>
                  </div>

                  <div className="space-y-1">
                    {country.leagues.map((lg) => (
                      <button
                        key={lg.id}
                        onClick={() => {
                          setSelectedCountry(country);
                          setSelectedLeague(lg);
                        }}
                        className="w-full text-left px-2 py-1 rounded-lg hover:bg-blue-600/20 text-[11px] text-slate-300 hover:text-white flex items-center justify-between group transition cursor-pointer"
                      >
                        <span className="truncate">🏆 {lg.name}</span>
                        <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Matches under selected category */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between bg-[#121620] p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            {selectedLeague && (
              <button
                onClick={() => setSelectedLeague(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Leagues
              </button>
            )}
            <h4 className="font-bold text-sm text-white">
              {selectedLeague
                ? `${selectedCountry?.flag || '🏆'} ${selectedLeague.name} Matches`
                : selectedCountry
                  ? `${selectedCountry.flag} All Matches in ${selectedCountry.name}`
                  : `${selectedContinent?.icon || '🌍'} Real Soccer Matches in ${selectedContinent?.name || 'All Continents'}`}
            </h4>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-bold">
            {displayedMatches.length} Fixtures
          </span>
        </div>

        {displayedMatches.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-[#121620] rounded-2xl border border-slate-800">
            <Trophy className="w-10 h-10 mx-auto stroke-1 mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-white">No active matches scheduled right now</p>
          </div>
        ) : (
          displayedMatches.map((m) => (
            <HuluSportMatchCard
              key={m.id}
              match={m}
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
