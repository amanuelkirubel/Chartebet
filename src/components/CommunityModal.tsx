import React, { useState } from 'react';
import { X, Send, Trophy, ExternalLink, Heart } from 'lucide-react';
import { Language } from '../types';

interface CommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
}

export const CommunityModal: React.FC<CommunityModalProps> = ({
  isOpen,
  onClose,
  currentLang,
}) => {
  const [messages, setMessages] = useState<Array<{
    id: number;
    user: string;
    game: string;
    score: string;
    text: string;
    time: string;
    likes: number;
  }>>([
    {
      id: 1,
      user: 'BoleSniper',
      game: 'Aviator Crash',
      score: '18.4x Multiplier',
      text: 'Just cashed out at 18.4x on Aviator! 500 ETB turned into 9,200 ETB! 🎉',
      time: '12m ago',
      likes: 24,
    },
    {
      id: 2,
      user: 'Kirubel_Pro',
      game: 'Premier League',
      score: '6-Leg Parlay',
      text: 'Arsenal & Man City clean sheet double landed! Waiting on Real Madrid tonight!',
      time: '34m ago',
      likes: 19,
    },
    {
      id: 3,
      user: 'LuckyAbyssinia',
      game: 'Keno 80',
      score: '8 / 8 Numbers Matched',
      text: 'Draw #80324: Matched all 8 numbers! Chartebet paid instantly!',
      time: '1h ago',
      likes: 42,
    },
  ]);

  const [inputMsg, setInputMsg] = useState('');

  if (!isOpen) return null;

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    setMessages([
      {
        id: Date.now(),
        user: 'Player_' + Math.floor(100 + Math.random() * 900),
        game: 'Community Chat',
        score: 'Live Discussion',
        text: inputMsg.trim(),
        time: 'Just now',
        likes: 1,
      },
      ...messages,
    ]);
    setInputMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#151c28] text-white rounded-2xl max-w-lg w-full border border-slate-700/80 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Chartebet Community &amp; High Scores
              </h3>
              <p className="text-[11px] text-slate-400">
                Telegram: <strong className="text-sky-300">@Chartebetting7</strong>
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

        {/* Telegram Direct Link Strip - Requirement 3: Updated to @Chartebetting7 */}
        <div className="bg-gradient-to-r from-sky-900/60 to-blue-900/60 p-3 border-b border-sky-700/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-xl">✈️</span>
            <div>
              <div className="font-bold text-white">Join 18,400+ Bettors on Telegram</div>
              <span className="text-[11px] text-sky-200">Daily coupon codes, live chat, and predictions</span>
            </div>
          </div>
          <a
            href="https://t.me/Chartebetting7"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1 transition shadow cursor-pointer"
          >
            <span>Open @Chartebetting7</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Social Links Banner */}
        <div className="px-6 py-2.5 bg-[#0e131d] border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <span>Official Socials:</span>
          <div className="flex gap-2">
            <a
              href="https://twitter.com/Chartebet"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white underline font-semibold"
            >
              Twitter: @Chartebet
            </a>
            <span>•</span>
            <a
              href="https://tiktok.com/@chartebet"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white underline font-semibold"
            >
              TikTok: @chartebet
            </a>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="p-4 sm:p-6 space-y-3 overflow-y-auto flex-1 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className="p-3 bg-[#0e131d] rounded-xl border border-slate-800 space-y-1.5 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{m.user}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    {m.game}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">{m.time}</span>
              </div>

              <p className="text-slate-200 text-xs">{m.text}</p>

              <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                <span className="text-yellow-400 font-mono font-bold flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{m.score}</span>
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Heart className="w-3 h-3 text-red-400 fill-red-400" /> {m.likes}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Post Input */}
        <form onSubmit={handlePost} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Share your high score or discussion..."
            className="flex-1 bg-[#0e131d] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Post</span>
          </button>
        </form>
      </div>
    </div>
  );
};
