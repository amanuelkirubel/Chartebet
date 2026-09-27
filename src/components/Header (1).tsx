import React, { useState } from 'react';
import {
  Trophy,
  Gamepad2,
  Plane,
  Dice5,
  Moon,
  Sun,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  User,
  LogOut,
  Menu,
  X,
  Receipt,
  ShieldCheck,
  Download,
  Clock,
  Printer
} from 'lucide-react';
import { Language, UserAccount, ActiveNavTab } from '../types';
import { translations } from '../data/translations';
import { ChartebetLogo } from './ChartebetLogo';

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  user: UserAccount;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenHistory: () => void;
  onOpenCashier: () => void;
  onOpenAdmin: () => void;
  onOpenPayAndPrint?: () => void;
  onOpenDownloadApp: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  user,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenAuth,
  onLogout,
  onOpenHistory,
  onOpenCashier,
  onOpenAdmin,
  onOpenPayAndPrint,
  onOpenDownloadApp,
  isDarkMode,
  onToggleDarkMode,
  activeTab,
  onSelectTab,
}) => {
  const t = translations[currentLang];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user.isLoggedIn && user.role === 'admin';
  const isCashier = user.isLoggedIn && (user.role === 'cashier' || user.role === 'admin');

  return (
    <header className="w-full sticky top-0 z-40 shadow-lg select-none transition-colors duration-200 bg-slate-950 text-white border-b border-slate-800 overflow-x-hidden">
      {/* Top Utility Bar */}
      <div className="bg-slate-900/95 border-b border-slate-800/80 text-xs px-2.5 sm:px-6 py-1 flex items-center justify-between gap-1.5">
        {/* Left: Role Badges for Cashier & Admin or Tagline */}
        <div className="flex items-center gap-1.5 truncate">
          {isAdmin ? (
            <button
              onClick={onOpenAdmin}
              className="bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/50 text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition cursor-pointer"
            >
              <ShieldCheck className="w-3 h-3 text-blue-400 shrink-0" />
              <span>ADMIN STATION</span>
            </button>
          ) : user.role === 'cashier' ? (
            <button
              onClick={onOpenCashier}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition cursor-pointer"
            >
              <Receipt className="w-3 h-3 text-amber-400 shrink-0" />
              <span>CASHIER READY</span>
            </button>
          ) : (
            <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-300 font-medium truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">Chartebet Sports &amp; Games</span>
            </span>
          )}
        </div>

        {/* Right: Download App, Dark Mode Toggle, Language Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Download App */}
          <button
            onClick={onOpenDownloadApp}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 transition text-[10px] sm:text-[11px] font-bold border border-emerald-500/30 cursor-pointer"
            title="Download Chartebet App"
          >
            <Download className="w-3 h-3 shrink-0" />
            <span className="hidden xs:inline">{currentLang === 'am' ? 'መተግበሪያ' : 'App'}</span>
          </button>

          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={onToggleDarkMode}
            className="p-1 sm:px-2 sm:py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-xs font-semibold border border-slate-700/80 cursor-pointer flex items-center gap-1"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Moon className="w-3 h-3 text-amber-400" />
            ) : (
              <Sun className="w-3 h-3 text-yellow-400" />
            )}
            <span className="hidden md:inline text-[11px]">
              {isDarkMode ? t.nightMode : t.lightMode}
            </span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-[10px] sm:text-[11px] font-bold">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                currentLang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('am')}
              className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                currentLang === 'am' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              አማ
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Brand & Wallet / Sign In Bar */}
      <div className="px-2.5 sm:px-6 py-2 flex items-center justify-between gap-2 max-w-full">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectTab('soccer')}
          className="cursor-pointer shrink-0"
        >
          <ChartebetLogo size="md" showText={false} />
        </div>

        {/* User Account Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Cashier & Admin Fast Shortcut: Accept Code, Cash & Print */}
          {isCashier && onOpenPayAndPrint && (
            <button
              onClick={onOpenPayAndPrint}
              className="flex items-center gap-1 text-slate-950 bg-emerald-400 hover:bg-emerald-300 font-black px-2.5 py-1.5 rounded-xl text-xs transition shadow-md active:scale-95 border border-emerald-300/50 cursor-pointer"
              title="Accept Code & Cash (Print)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {currentLang === 'am' ? 'ካሽ & ፕሪንት' : 'Accept & Print'}
              </span>
              <span className="bg-slate-950 text-emerald-400 font-mono text-[9px] font-black px-1 rounded">
                ⚡
              </span>
            </button>
          )}

          {/* Protected Cashier Station Button */}
          {isCashier && (
            <button
              onClick={onOpenCashier}
              className="hidden sm:flex items-center gap-1 text-slate-950 bg-amber-400 hover:bg-amber-300 font-black px-2.5 py-1.5 rounded-xl text-xs transition shadow-md active:scale-95 cursor-pointer"
              title="Cashier Station Terminal"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>{t.cashierStation}</span>
            </button>
          )}

          {/* Protected Admin Station Button */}
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="hidden sm:flex items-center gap-1 text-white bg-blue-600 hover:bg-blue-500 font-black px-2.5 py-1.5 rounded-xl text-xs transition shadow-md active:scale-95 border border-blue-400/40 cursor-pointer"
              title="Admin Station Console"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.adminStation}</span>
            </button>
          )}

          {user.isLoggedIn ? (
            <>
              {/* Cash Wallet */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1">
                <Wallet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div className="text-right">
                  <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold hidden sm:block">
                    {t.cashBalance}
                  </div>
                  <div className="font-mono font-black text-xs text-emerald-400 whitespace-nowrap">
                    {user.balance.toLocaleString(undefined, {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 2,
                    })}{' '}
                    <span className="text-[9px] text-slate-300">{user.currency}</span>
                  </div>
                </div>
              </div>

              {/* Deposit */}
              <button
                onClick={onOpenDeposit}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-1.5 rounded-xl transition shadow-md active:scale-95 cursor-pointer"
              >
                <ArrowDownCircle className="w-3.5 h-3.5" />
                <span>{t.deposit}</span>
              </button>

              {/* Withdraw */}
              <button
                onClick={onOpenWithdraw}
                className="hidden md:flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-2.5 py-1.5 rounded-xl transition cursor-pointer"
              >
                <ArrowUpCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>{t.withdraw}</span>
              </button>

              {/* Dedicated History Option */}
              <button
                onClick={onOpenHistory}
                className="flex items-center gap-1 bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-600/50 font-bold text-xs px-2 py-1.5 rounded-xl transition cursor-pointer"
                title="Bet & Transaction History"
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.history}</span>
              </button>

              {/* User Logout */}
              <button
                onClick={onLogout}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-red-950/60 hover:text-red-400 text-slate-400 border border-slate-800 transition cursor-pointer"
                title={t.logout}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            /* Sleek, perfectly proportioned Sign In / Register button for mobile and desktop */
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition shadow-md shadow-blue-500/25 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t.loginRegister}</span>
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="px-2.5 sm:px-6 py-1.5 bg-[#0f141f] border-t border-slate-800/90 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar max-w-full">
        {/* 1. SOCCER */}
        <button
          onClick={() => onSelectTab('soccer')}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-black transition whitespace-nowrap border cursor-pointer ${
            activeTab === 'soccer'
              ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/30'
              : 'bg-blue-950/40 text-blue-300 border-blue-600/40 hover:bg-blue-900/60'
          }`}
        >
          <span>⚽</span>
          <span>{currentLang === 'am' ? 'የዛሬ እግር ኳስ' : 'Soccer Today'}</span>
          <span className="bg-yellow-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
            LIVE
          </span>
        </button>

        {/* 2. SPORTS 7 CONTINENTS */}
        <button
          onClick={() => onSelectTab('sports')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'sports'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <span>{currentLang === 'am' ? '7 አህጉራት ስፖርት' : '7 Continents'}</span>
        </button>

        {/* 3. LIVE */}
        <button
          onClick={() => onSelectTab('live')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'live'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-red-400 hover:text-red-300 hover:bg-slate-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
          <span>{t.liveInPlay}</span>
        </button>

        {/* 4. GAMES HUB */}
        <button
          onClick={() => onSelectTab('games')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition whitespace-nowrap border cursor-pointer ${
            activeTab === 'games'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-md'
              : 'bg-emerald-950/40 text-emerald-400 border-emerald-600/50 hover:bg-emerald-900/60'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.games}</span>
          <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
            19+
          </span>
        </button>

        {/* 5. AVIATOR */}
        <button
          onClick={() => onSelectTab('aviator')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'aviator'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-red-400 hover:text-red-300 hover:bg-slate-800'
          }`}
        >
          <Plane className="w-3.5 h-3.5 text-red-400" />
          <span>{t.aviatorGame}</span>
        </button>

        {/* 6. KENO 80 */}
        <button
          onClick={() => onSelectTab('keno')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap border cursor-pointer ${
            activeTab === 'keno'
              ? 'bg-amber-600 text-white border-amber-400 shadow-md'
              : 'bg-amber-950/30 text-yellow-400 border-amber-600/40 hover:bg-amber-900/40'
          }`}
        >
          <Dice5 className="w-3.5 h-3.5 text-yellow-400" />
          <span>{t.kenoGame}</span>
        </button>

        {/* 7. SKYWARD */}
        <button
          onClick={() => onSelectTab('skyward')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap border cursor-pointer ${
            activeTab === 'skyward'
              ? 'bg-blue-600 text-white border-blue-400 shadow-md'
              : 'bg-blue-950/30 text-sky-400 border-sky-600/40 hover:bg-blue-900/40'
          }`}
        >
          <span>🚀</span>
          <span>{t.skywardGame}</span>
        </button>

        {/* 8. LUCKY 7 */}
        <button
          onClick={() => onSelectTab('lucky7')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap border cursor-pointer ${
            activeTab === 'lucky7'
              ? 'bg-fuchsia-600 text-white border-fuchsia-400 shadow-md'
              : 'bg-fuchsia-950/30 text-fuchsia-400 border-fuchsia-600/40 hover:bg-fuchsia-900/40'
          }`}
        >
          <span>🎲</span>
          <span>{t.lucky7Game}</span>
        </button>

        {/* 9. VIRTUAL */}
        <button
          onClick={() => onSelectTab('virtual')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'virtual'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>🏇</span>
          <span>{t.virtualRacing}</span>
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 p-3 space-y-2 animate-in slide-in-from-top">
          {user.isLoggedIn && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenHistory();
              }}
              className="w-full py-2 px-3 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-blue-200 font-bold text-xs flex items-center justify-center gap-2 border border-blue-700/50 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>{t.history}</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            {isCashier && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCashier();
                }}
                className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer"
              >
                <Receipt className="w-4 h-4" />
                <span>{t.cashierStation}</span>
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t.adminStation}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
