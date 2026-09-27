import React, { useState } from 'react';
import { 
  Flame, 
  Search, 
  Play, 
  Users
} from 'lucide-react';
import { GameItem, Language, UserAccount, ActiveNavTab } from '../types';
import { gamesList } from '../data/gamesList';
import { PlayableGameModal } from './PlayableGameModal';

interface GamesHubProps {
  user: UserAccount;
  onUpdateBalance: (newBalance: number) => void;
  currentLang: Language;
  onOpenCommunity: () => void;
  onSelectSpecialTab?: (tab: ActiveNavTab) => void;
  onOpenAuth?: () => void;
}

export const GamesHub: React.FC<GamesHubProps> = ({
  user,
  onUpdateBalance,
  currentLang,
  onOpenCommunity,
  onSelectSpecialTab,
  onOpenAuth,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);

  const categories = [
    { id: 'all', name: 'All Games', icon: '🎮' },
    { id: 'crash', name: 'Crash & Multiplier', icon: '🚀' },
    { id: 'instant', name: 'Instant Win', icon: '⚡' },
    { id: 'lottery', name: 'Lottery & Keno', icon: '🎱' },
    { id: 'table', name: 'Card & Dice', icon: '🎲' },
    { id: 'slots', name: 'Slots & Jackpot', icon: '🎰' },
  ];

  const filteredGames = gamesList.filter((game) => {
    if (activeCategory !== 'all' && game.category !== activeCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return game.title.toLowerCase().includes(q) || game.provider.toLowerCase().includes(q);
    }
    return true;
  });

  const handleLaunchGame = (game: GameItem) => {
    if (game.id === 'aviator' && onSelectSpecialTab) {
      onSelectSpecialTab('aviator');
      return;
    }
    if (game.id === 'keno-80' && onSelectSpecialTab) {
      onSelectSpecialTab('keno');
      return;
    }
    if (game.id === 'skyward' && onSelectSpecialTab) {
      onSelectSpecialTab('skyward');
      return;
    }
    if (game.id === 'lucky-7' && onSelectSpecialTab) {
      onSelectSpecialTab('lucky7');
      return;
    }

    setSelectedGame(game);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white border border-purple-500/30 flex items-center justify-between flex-wrap gap-3 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              CHARTEBET GAMES ARENA
            </h2>
            <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase shadow">
              19+ FAST GAMES
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Play high-speed crash games, instant lottery, scratch cards, and real-time multiplier action. Instant payouts upon win.
          </p>
        </div>

        <button
          onClick={onOpenCommunity}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition shadow flex items-center gap-1.5 cursor-pointer"
        >
          <Users className="w-4 h-4" />
          <span>Chartebet Community Chat</span>
        </button>
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 border cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow'
                  : 'bg-[#121620] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games..."
            className="w-full bg-[#121620] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Games Catalog Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            onClick={() => handleLaunchGame(game)}
            className="group relative bg-[#121620] border border-slate-800 hover:border-blue-500/60 rounded-2xl p-3 transition cursor-pointer flex flex-col justify-between overflow-hidden hover:shadow-xl hover:shadow-blue-500/10"
          >
            <div className="flex items-center justify-between gap-1 mb-1.5">
              {game.isHot && (
                <span className="bg-red-600 text-white text-[9px] font-black uppercase px-1.5 py-0.2 rounded flex items-center gap-0.5">
                  <Flame className="w-2.5 h-2.5 fill-white" /> HOT
                </span>
              )}
              {game.isNew && (
                <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-1.5 py-0.2 rounded">
                  NEW
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-mono ml-auto">
                {game.rtp}
              </span>
            </div>

            <div className="aspect-square bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl flex items-center justify-center text-4xl my-2 group-hover:scale-105 transition shadow-inner">
              {game.iconEmoji}
            </div>

            <div className="space-y-0.5">
              <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-blue-400 transition">
                {game.title}
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                {game.provider}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLaunchGame(game);
              }}
              className="mt-2 w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-lg text-xs transition flex items-center justify-center gap-1 shadow cursor-pointer"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>PLAY NOW</span>
            </button>
          </div>
        ))}
      </div>

      <PlayableGameModal
        game={selectedGame}
        isOpen={Boolean(selectedGame)}
        onClose={() => setSelectedGame(null)}
        user={user}
        onUpdateBalance={onUpdateBalance}
        onOpenAuth={onOpenAuth}
      />
    </div>
  );
};
