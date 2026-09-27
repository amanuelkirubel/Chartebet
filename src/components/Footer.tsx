import React from 'react';
import { 
  PhoneCall, 
  Receipt, 
  Send, 
  ShieldCheck, 
  QrCode,
  Download,
  MessageSquare
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';

interface FooterProps {
  currentLang: Language;
  onOpenCheckBookTicket: () => void;
  onOpenRequestCall: () => void;
  onOpenQRScanner: () => void;
  onOpenSupport: () => void;
  onOpenCommunity: () => void;
  onOpenDownloadApp: () => void;
  onSelectTab: (tab: any) => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentLang,
  onOpenCheckBookTicket,
  onOpenRequestCall,
  onOpenQRScanner,
  onOpenSupport,
  onOpenCommunity,
  onOpenDownloadApp,
  onSelectTab,
}) => {
  const t = translations[currentLang];

  return (
    <footer className="mt-12 border-t border-slate-800 bg-[#0f141d] text-slate-400 text-xs select-none pb-16 sm:pb-12 overflow-x-hidden">
      {/* Ground Placement Bar */}
      <div className="bg-[#18202c] border-b border-slate-800/90 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* 1. CHECK BOOK TICKET */}
          <div
            onClick={onOpenCheckBookTicket}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-[#202938] hover:bg-[#283447] border border-blue-500/50 cursor-pointer transition group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
              <Receipt className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="font-black text-white text-sm flex items-center gap-1.5">
                <span>{t.checkSlip}</span>
                <span className="text-[10px] bg-blue-600 text-white font-mono px-1.5 py-0.2 rounded">
                  VERIFY
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {currentLang === 'am' ? 'የያዙትን የውርርድ ኮድ ሁኔታ ይፈትሹ' : 'Inspect booking code outcome & odds'}
              </p>
            </div>
          </div>

          {/* 2. REQUEST CALL BACK */}
          <div
            onClick={onOpenRequestCall}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-[#202938] hover:bg-[#283447] border border-emerald-500/50 cursor-pointer transition group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-1.5">
                <span>{t.callMeBack}</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-extrabold px-1.5 py-0.2 rounded">
                  VIP
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {currentLang === 'am'
                  ? 'ስልክ ቁጥርዎን ያስቀምጡ፣ እኛ እንደውላለን'
                  : 'Phone, Telegram or WhatsApp callback'}
              </p>
            </div>
          </div>

          {/* 3. ANTI-COUNTERFEIT QR SCANNER */}
          <div
            onClick={onOpenQRScanner}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-[#202938] hover:bg-[#283447] border border-slate-700/80 cursor-pointer transition group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
              <QrCode className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-1.5">
                <span>{t.qrScanner}</span>
                <span className="text-[10px] bg-purple-500/30 text-purple-300 font-bold px-1.5 py-0.2 rounded">
                  SECURE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {currentLang === 'am' ? 'የተጠበቀ የQR ባርኮድ መቃኛ' : 'Anti-counterfeit slip authenticity scan'}
              </p>
            </div>
          </div>

          {/* 4. CHARTEBET VIP SUPPORT DESK */}
          <div
            onClick={onOpenSupport}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-[#202938] hover:bg-[#283447] border border-slate-700/80 cursor-pointer transition group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-1.5">
                <span>{t.supportDesk}</span>
                <span className="text-[10px] bg-blue-500/30 text-blue-300 font-bold px-1.5 py-0.2 rounded">
                  24/7
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Direct Priority Response &amp; VIP Care
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Strip: Updated to @Chartebetting7 */}
      <div className="bg-[#111722] border-b border-slate-800 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-slate-400 font-semibold">
            Official Community Channels:
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <a
              href="https://t.me/Chartebetting7"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950/70 border border-sky-600/50 text-sky-300 hover:bg-sky-900 transition font-bold"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram: @Chartebetting7</span>
            </a>

            <a
              href="https://twitter.com/Chartebet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 transition font-bold"
            >
              <span>𝕏 Twitter: @Chartebet</span>
            </a>

            <a
              href="https://tiktok.com/@chartebet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 transition font-bold"
            >
              <span>🎵 TikTok: @chartebet</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <div className="font-bold text-white text-sm mb-3 uppercase tracking-wider">
            Games Catalog
          </div>
          <ul className="space-y-2">
            <li>
              <button onClick={() => onSelectTab('games')} className="hover:text-emerald-400 transition cursor-pointer">
                🎮 All 19+ Games
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('aviator')} className="hover:text-emerald-400 transition cursor-pointer">
                ✈️ Aviator Crash
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('keno')} className="hover:text-emerald-400 transition cursor-pointer">
                🎱 Keno 80 Live Lottery
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('skyward')} className="hover:text-emerald-400 transition cursor-pointer">
                🚀 Skyward Rocket
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('lucky7')} className="hover:text-emerald-400 transition cursor-pointer">
                🎲 Lucky 7 Dice
              </button>
            </li>
          </ul>
        </div>

        <div>
          <div className="font-bold text-white text-sm mb-3 uppercase tracking-wider">
            Sports &amp; Feeds
          </div>
          <ul className="space-y-2">
            <li>
              <button onClick={() => onSelectTab('soccer')} className="hover:text-blue-400 transition cursor-pointer">
                ⚽ Soccer Today&apos;s Matches
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('sports')} className="hover:text-blue-400 transition cursor-pointer">
                🏆 7 Continents Directory
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('live')} className="hover:text-red-400 transition cursor-pointer">
                🔴 Live In-Play Active
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('virtual')} className="hover:text-emerald-400 transition cursor-pointer">
                🏇 Virtual Addis Derby
              </button>
            </li>
          </ul>
        </div>

        <div>
          <div className="font-bold text-white text-sm mb-3 uppercase tracking-wider">
            Ticket &amp; Support
          </div>
          <ul className="space-y-2">
            <li>
              <button onClick={onOpenCheckBookTicket} className="hover:text-blue-400 transition cursor-pointer">
                🎟️ Check Booked Ticket
              </button>
            </li>
            <li>
              <button onClick={onOpenRequestCall} className="hover:text-emerald-400 transition cursor-pointer">
                📞 Request VIP Call Back
              </button>
            </li>
            <li>
              <button onClick={onOpenQRScanner} className="hover:text-purple-400 transition cursor-pointer">
                🛡️ Scan Ticket QR
              </button>
            </li>
            <li>
              <button onClick={onOpenDownloadApp} className="hover:text-emerald-400 transition cursor-pointer">
                📱 Download Android App
              </button>
            </li>
          </ul>
        </div>

        <div>
          <div className="font-bold text-white text-sm mb-3 uppercase tracking-wider">
            Security &amp; Policy
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Chartebet is strictly 21+ only. Play responsibly and for entertainment. All tickets protected by anti-counterfeit QR cryptographic validation.
          </p>
          <div className="mt-3 text-[10px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>256-Bit SSL Encrypted • 21+ Only</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/60 py-4 text-center text-slate-500 text-[11px]">
        © {new Date().getFullYear()} CHARTEBET. All rights reserved.
      </div>
    </footer>
  );
};
