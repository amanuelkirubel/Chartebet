import React, { useState, useEffect } from 'react';
import { 
  Language, 
  UserAccount, 
  BetSelection, 
  ActiveNavTab, 
  Match, 
  OfflineSlip 
} from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SoccerView } from './components/SoccerView';
import { SportsDirectoryView } from './components/SportsDirectoryView';
import { BetSlip } from './components/BetSlip';
import { GamesHub } from './components/GamesHub';
import { AviatorGame } from './components/AviatorGame';
import { KenoGame } from './components/KenoGame';
import { SkywardGame } from './components/SkywardGame';
import { Lucky7Game } from './components/Lucky7Game';
import { VirtualSportsView } from './components/VirtualSportsView';
import { AuthModal } from './components/AuthModal';
import { PaymentModal } from './components/PaymentModal';
import { UserHistoryModal } from './components/UserHistoryModal';
import { CashierTicketModal } from './components/CashierTicketModal';
import { PayAndPrintModal } from './components/PayAndPrintModal';
import { AdminStationModal } from './components/AdminStationModal';
import { AdminMatchEditModal } from './components/AdminMatchEditModal';
import { AdminGroundBar } from './components/AdminGroundBar';
import { AdminGroundInspectionModal } from './components/AdminGroundInspectionModal';
import { OfflineSlipViewModal } from './components/OfflineSlipViewModal';
import { QRScannerModal } from './components/QRScannerModal';
import { CheckBookTicketModal } from './components/CheckBookTicketModal';
import { RequestCallModal } from './components/RequestCallModal';
import { SupportModal } from './components/SupportModal';
import { CommunityModal } from './components/CommunityModal';
import { DownloadAppModal } from './components/DownloadAppModal';
import { CashierDepositModal } from './components/CashierDepositModal';

import { 
  getStoredMatches, 
  saveStoredMatches, 
  updateMatchInStore, 
  addMatchToStore, 
  deleteMatchFromStore,
  syncFromApiFootball,
  DEFAULT_API_FOOTBALL_KEY 
} from './utils/matchStore';
import { 
  getAllSlips 
} from './utils/betAndTransactionStore';
import { 
  getAllRegisteredUsers, 
  updateUserBalanceInStore 
} from './utils/userStore';
import { Receipt } from 'lucide-react';

const CURRENT_USER_STORAGE_KEY = 'chartebet_logged_in_user_v3';
const DARK_MODE_STORAGE_KEY = 'chartebet_dark_mode_pref_v3';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>('en');

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(DARK_MODE_STORAGE_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(DARK_MODE_STORAGE_KEY, JSON.stringify(isDarkMode));
    } catch (e) {}
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0b0f17';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f1f5f9';
    }
  }, [isDarkMode]);

  const [user, setUser] = useState<UserAccount>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure guest or initial account has 20 ETB bonus if 0
        if (!parsed.isLoggedIn && (parsed.balance === 0 || parsed.balance === undefined)) {
          parsed.balance = 20.0;
        }
        return parsed;
      }
    } catch (e) {}
    return {
      id: 'GUEST_001',
      username: 'Guest Player',
      balance: 20.0, // Every account starts with bonus 20 birr
      currency: 'ETB',
      isLoggedIn: false,
      role: 'customer',
    };
  });

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setUser(updatedUser);
    try {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (e) {}
  };

  const handleUpdateBalance = (newBalance: number) => {
    const clamped = Math.max(0, Number(newBalance.toFixed(2)));
    const updated = { ...user, balance: clamped };
    handleUpdateUser(updated);
    if (user.id && user.isLoggedIn) {
      updateUserBalanceInStore(user.id, clamped);
    }
  };

  // When winnings are credited by the settlement engine, reload the balance from the store
  // so the header shows it and a later stale write can't overwrite it.
  useEffect(() => {
    const onRefresh = () => {
      setUser((prev) => {
        if (!prev.isLoggedIn || !prev.id) return prev;
        const fresh = getAllRegisteredUsers().find((u) => u.id === prev.id);
        if (!fresh || fresh.balance === prev.balance) return prev;
        const updated = { ...prev, balance: fresh.balance };
        try {
          localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    };
    window.addEventListener('chartebet:balance-refresh', onRefresh);
    return () => window.removeEventListener('chartebet:balance-refresh', onRefresh);
  }, []);

  const handleLogout = () => {
    const guest: UserAccount = {
      id: `GUEST_${Math.floor(100 + Math.random() * 900)}`,
      username: 'Guest Player',
      balance: 20.0, // Every account starts with bonus 20 birr
      currency: 'ETB',
      isLoggedIn: false,
      role: 'customer',
    };
    handleUpdateUser(guest);
  };

  // Matches State
  const [matches, setMatches] = useState<Match[]>(() => getStoredMatches());
  const [isFetchingRealMatches, setIsFetchingRealMatches] = useState(false);

  const handleRefreshRealMatches = async () => {
    setIsFetchingRealMatches(true);
    try {
      const res = await syncFromApiFootball(DEFAULT_API_FOOTBALL_KEY);
      if (res.updatedMatches && res.updatedMatches.length > 0) {
        setMatches(res.updatedMatches);
        saveStoredMatches(res.updatedMatches);
      }
    } catch (e) {
    } finally {
      setIsFetchingRealMatches(false);
    }
  };

  useEffect(() => {
    handleRefreshRealMatches();
  }, []);

  const handleSaveMatch = (m: Match) => {
    const updated = updateMatchInStore(m);
    setMatches([...updated]);
  };

  const handleAddMatch = (m: Match) => {
    const updated = addMatchToStore(m);
    setMatches([...updated]);
  };

  const handleDeleteMatch = (id: string) => {
    const updated = deleteMatchFromStore(id);
    setMatches([...updated]);
  };

  const [activeTab, setActiveTab] = useState<ActiveNavTab>('soccer');
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [mobileBetslipOpen, setMobileBetslipOpen] = useState(false);

  const handleToggleBet = (selection: BetSelection) => {
    const existsIndex = selections.findIndex((s) => s.id === selection.id);
    if (existsIndex > -1) {
      setSelections(selections.filter((s) => s.id !== selection.id));
      return;
    }

    const sameMatchBets = selections.filter((s) => s.matchId === selection.matchId);
    if (sameMatchBets.length >= 2) {
      alert(
        currentLang === 'am'
          ? 'በአንድ ጨዋታ ላይ ቢበዛ 2 ምርጫዎችን ብቻ ማድረግ ይችላሉ!'
          : 'You can bet a maximum of 2 selections on the same match!'
      );
      return;
    }

    const duplicateMarket = sameMatchBets.some(
      (s) => s.marketType === selection.marketType || s.selectionName === selection.selectionName
    );
    if (duplicateMarket) {
      alert(
        currentLang === 'am'
          ? 'በአንድ ጨዋታ ላይ ተመሳሳይ አይነት ኦድ አይደገምም!'
          : 'You cannot pick the same odd or market twice for the same match!'
      );
      return;
    }

    setSelections([...selections, selection]);
  };

  const handleRemoveSelection = (id: string) => {
    setSelections(selections.filter((s) => s.id !== id));
  };

  const handleClearBetslip = () => {
    setSelections([]);
  };

  // Modals Open/Close States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [cashierModalOpen, setCashierModalOpen] = useState(false);
  const [payAndPrintModalOpen, setPayAndPrintModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [matchEditorOpen, setMatchEditorOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [offlineSlipModalOpen, setOfflineSlipModalOpen] = useState(false);
  const [viewingOfflineSlip, setViewingOfflineSlip] = useState<OfflineSlip | null>(null);
  const [qrScannerModalOpen, setQrScannerModalOpen] = useState(false);
  const [checkBookTicketModalOpen, setCheckBookTicketModalOpen] = useState(false);
  const [requestCallModalOpen, setRequestCallModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [communityModalOpen, setCommunityModalOpen] = useState(false);
  const [downloadAppModalOpen, setDownloadAppModalOpen] = useState(false);
  const [cashDepositModalOpen, setCashDepositModalOpen] = useState(false);

  // Ground Inspection Modal State
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [inspectionInitialTab, setInspectionInitialTab] = useState<'won' | 'pending' | 'signed_in' | 'online' | 'settle'>('won');

  // Keyboard shortcut listener for Cashier/Admin terminals (Alt+C, Alt+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'c') {
        if (user.isLoggedIn && (user.role === 'cashier' || user.role === 'admin')) {
          setPayAndPrintModalOpen(true);
        }
      }
      if (e.altKey && e.key.toLowerCase() === 'a') {
        if (user.isLoggedIn && user.role === 'admin') {
          setAdminModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  const allSlips = getAllSlips();
  const wonSlipsCount = allSlips.filter((s) => s.status === 'won').length;
  const pendingSlipsCount = allSlips.filter((s) => s.status === 'pending').length;
  const signedInUsersCount = getAllRegisteredUsers().length;
  const onlineUsersCount = 1428;

  const handleOpenGroundMetric = (tab: 'won' | 'pending' | 'signed_in' | 'online' | 'settle') => {
    setInspectionInitialTab(tab);
    setInspectionModalOpen(true);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 overflow-x-hidden max-w-full ${
      isDarkMode ? 'bg-[#0b0f17] text-white' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* 1. TOP HEADER & NAVIGATION (Cropped nicely for mobile phone users, signin/register fitted cleanly) */}
      <Header
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        user={user}
        onOpenDeposit={() => setPaymentModalOpen(true)}
        onOpenWithdraw={() => setPaymentModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenHistory={() => setHistoryModalOpen(true)}
        onOpenCashier={() => setCashierModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenPayAndPrint={() => setPayAndPrintModalOpen(true)}
        onOpenDownloadApp={() => setDownloadAppModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
          
          {/* Main Area */}
          <div className={`${
            activeTab === 'aviator' || activeTab === 'keno' || activeTab === 'skyward' || activeTab === 'lucky7' || activeTab === 'games'
              ? 'lg:col-span-12'
              : 'lg:col-span-8 xl:col-span-9'
          } space-y-4 min-w-0`}>
            
            {/* TAB 1: SOCCER */}
            {activeTab === 'soccer' && (
              <SoccerView
                matches={matches}
                selectedBets={selections}
                onToggleBet={handleToggleBet}
                currentLang={currentLang}
                isDarkMode={isDarkMode}
                userRole={user.role}
                onRefreshLive={handleRefreshRealMatches}
                isFetchingLive={isFetchingRealMatches}
                onAdminEditMatch={(m: Match) => {
                  setEditingMatch(m);
                  setMatchEditorOpen(true);
                }}
                onAdminRemoveMatch={handleDeleteMatch}
              />
            )}

            {/* TAB 2: SPORTS DIRECTORY */}
            {activeTab === 'sports' && (
              <SportsDirectoryView
                matches={matches}
                selectedBets={selections}
                onToggleBet={handleToggleBet}
                currentLang={currentLang}
                isDarkMode={isDarkMode}
                userRole={user.role}
                onAdminEditMatch={(m: Match) => {
                  setEditingMatch(m);
                  setMatchEditorOpen(true);
                }}
                onAdminRemoveMatch={handleDeleteMatch}
              />
            )}

            {/* TAB 3: LIVE IN-PLAY */}
            {activeTab === 'live' && (
              <SoccerView
                matches={matches.filter((m) => m.status === 'live' || m.isLive)}
                selectedBets={selections}
                onToggleBet={handleToggleBet}
                currentLang={currentLang}
                isDarkMode={isDarkMode}
                userRole={user.role}
                onRefreshLive={handleRefreshRealMatches}
                isFetchingLive={isFetchingRealMatches}
                onAdminEditMatch={(m: Match) => {
                  setEditingMatch(m);
                  setMatchEditorOpen(true);
                }}
                onAdminRemoveMatch={handleDeleteMatch}
              />
            )}

            {/* TAB 4: GAMES HUB */}
            {activeTab === 'games' && (
              <GamesHub
                user={user}
                onUpdateBalance={handleUpdateBalance}
                currentLang={currentLang}
                onOpenCommunity={() => setCommunityModalOpen(true)}
                onSelectSpecialTab={(tab) => setActiveTab(tab)}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            )}

            {/* TAB 5: AVIATOR */}
            {activeTab === 'aviator' && (
              <AviatorGame
                user={user}
                onUpdateBalance={handleUpdateBalance}
                currentLang={currentLang}
                onOpenCommunity={() => setCommunityModalOpen(true)}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            )}

            {/* TAB 6: KENO 80 */}
            {activeTab === 'keno' && (
              <KenoGame
                user={user}
                onUpdateBalance={handleUpdateBalance}
                currentLang={currentLang}
                onOpenAuth={() => setAuthModalOpen(true)}
                onBack={() => setActiveTab('soccer')}
              />
            )}

            {/* TAB 7: SKYWARD */}
            {activeTab === 'skyward' && (
              <SkywardGame
                user={user}
                onUpdateBalance={handleUpdateBalance}
                currentLang={currentLang}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            )}

            {/* TAB 8: LUCKY 7 LIVE */}
            {activeTab === 'lucky7' && (
              <Lucky7Game
                user={user}
                onUpdateBalance={handleUpdateBalance}
                currentLang={currentLang}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            )}

            {/* TAB 9: VIRTUAL SPORTS */}
            {activeTab === 'virtual' && (
              <VirtualSportsView
                user={user}
                onUpdateBalance={handleUpdateBalance}
                onToggleBet={handleToggleBet}
                currentLang={currentLang}
              />
            )}
          </div>

          {/* Desktop Right Sidebar: Official Betslip */}
          {activeTab !== 'aviator' && activeTab !== 'keno' && activeTab !== 'skyward' && activeTab !== 'lucky7' && activeTab !== 'games' && (
            <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
              <div className="sticky top-28 space-y-3">
                <BetSlip
                  selections={selections}
                  matches={matches}
                  onRemoveSelection={handleRemoveSelection}
                  onClearAll={handleClearBetslip}
                  user={user}
                  onUpdateBalance={handleUpdateBalance}
                  currentLang={currentLang}
                  onOpenCommunity={() => setCommunityModalOpen(true)}
                  onOpenAuth={() => setAuthModalOpen(true)}
                  onViewOfflineSlip={(slip) => {
                    setViewingOfflineSlip(slip);
                    setOfflineSlipModalOpen(true);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Floating Betslip Trigger Bar */}
      {selections.length > 0 && (
        <div className="lg:hidden fixed bottom-4 right-4 z-40">
          <button
            onClick={() => setMobileBetslipOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 text-slate-950 font-black px-4 py-3 rounded-2xl shadow-2xl shadow-yellow-500/50 active:scale-95 animate-bounce cursor-pointer"
          >
            <Receipt className="w-5 h-5 fill-slate-950" />
            <span>BETSLIP</span>
            <span className="w-6 h-6 rounded-full bg-slate-950 text-yellow-400 flex items-center justify-center font-mono text-xs font-bold">
              {selections.length}
            </span>
          </button>
        </div>
      )}

      {/* Mobile Betslip Modal Drawer */}
      {mobileBetslipOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end p-2 animate-in slide-in-from-bottom">
          <div className="bg-[#151c28] rounded-t-3xl max-h-[85vh] overflow-y-auto p-4 border border-slate-700">
            <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800">
              <span className="font-black text-sm text-white">YOUR MOBILE BETSLIP</span>
              <button
                onClick={() => setMobileBetslipOpen(false)}
                className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
            <BetSlip
              selections={selections}
              matches={matches}
              onRemoveSelection={handleRemoveSelection}
              onClearAll={handleClearBetslip}
              user={user}
              onUpdateBalance={handleUpdateBalance}
              currentLang={currentLang}
              onOpenCommunity={() => {
                setMobileBetslipOpen(false);
                setCommunityModalOpen(true);
              }}
              onOpenAuth={() => {
                setMobileBetslipOpen(false);
                setAuthModalOpen(true);
              }}
              onViewOfflineSlip={(slip) => {
                setViewingOfflineSlip(slip);
                setOfflineSlipModalOpen(true);
                setMobileBetslipOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Admin Ground Number Option Bar */}
      <AdminGroundBar
        user={user}
        onOpenInspectionModal={handleOpenGroundMetric}
        onOpenAdminConsole={() => setAdminModalOpen(true)}
        onOpenCashDeposit={() => setCashDepositModalOpen(true)}
        wonSlipsCount={wonSlipsCount}
        pendingSlipsCount={pendingSlipsCount}
        signedInUsersCount={signedInUsersCount}
        onlineUsersCount={onlineUsersCount}
        currentLang={currentLang}
      />

      {/* 3. FOOTER */}
      <Footer
        currentLang={currentLang}
        onOpenCheckBookTicket={() => setCheckBookTicketModalOpen(true)}
        onOpenRequestCall={() => setRequestCallModalOpen(true)}
        onOpenQRScanner={() => setQrScannerModalOpen(true)}
        onOpenSupport={() => setSupportModalOpen(true)}
        onOpenCommunity={() => setCommunityModalOpen(true)}
        onOpenDownloadApp={() => setDownloadAppModalOpen(true)}
        onSelectTab={setActiveTab}
      />

      {/* 4. MODALS & TOOLS */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleUpdateUser}
        currentLang={currentLang}
      />

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        user={user}
        onUpdateBalance={handleUpdateBalance}
        currentLang={currentLang}
      />

      {/* Requirement 2: UserHistoryModal with clickable bets to open game list */}
      <UserHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        user={user}
        currentLang={currentLang}
      />

      <CashierTicketModal
        isOpen={cashierModalOpen}
        onClose={() => setCashierModalOpen(false)}
        user={user}
        currentLang={currentLang}
      />

      <PayAndPrintModal
        isOpen={payAndPrintModalOpen}
        onClose={() => setPayAndPrintModalOpen(false)}
        user={user}
        currentLang={currentLang}
      />

      <AdminStationModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        matches={matches}
        onAddMatch={handleAddMatch}
        onUpdateMatch={handleSaveMatch}
        onDeleteMatch={handleDeleteMatch}
        onMatchesUpdated={(newMatches) => setMatches(newMatches)}
        onOpenMatchEditor={(m) => {
          setEditingMatch(m);
          setMatchEditorOpen(true);
        }}
        currentLang={currentLang}
      />

      <AdminGroundInspectionModal
        isOpen={inspectionModalOpen}
        onClose={() => setInspectionModalOpen(false)}
        initialTab={inspectionInitialTab}
        user={user}
      />

      <AdminMatchEditModal
        isOpen={matchEditorOpen}
        onClose={() => {
          setMatchEditorOpen(false);
          setEditingMatch(null);
        }}
        match={editingMatch}
        onSave={(m) => {
          if (editingMatch) {
            handleSaveMatch(m);
          } else {
            handleAddMatch(m);
          }
        }}
      />

      {/* Requirement 1: OfflineSlipViewModal with print restriction (admin/cashier only) */}
      <OfflineSlipViewModal
        slip={viewingOfflineSlip}
        isOpen={offlineSlipModalOpen}
        onClose={() => {
          setOfflineSlipModalOpen(false);
          setViewingOfflineSlip(null);
        }}
        userRole={user.role}
      />

      <QRScannerModal
        isOpen={qrScannerModalOpen}
        onClose={() => setQrScannerModalOpen(false)}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Requirement 1: CheckBookTicketModal with print restriction (admin/cashier only) */}
      <CheckBookTicketModal
        isOpen={checkBookTicketModalOpen}
        onClose={() => setCheckBookTicketModalOpen(false)}
        currentLang={currentLang}
        userRole={user.role}
      />

      {/* Requirement 6: Call Back routed to Chartekirubel77@gmail.com, completely hidden from UI */}
      <RequestCallModal
        isOpen={requestCallModalOpen}
        onClose={() => setRequestCallModalOpen(false)}
        currentLang={currentLang}
      />

      {/* Requirement 3: Support modal with @Chartebetting7 and hidden email */}
      <SupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
      />

      {/* Requirement 3: Community modal with @Chartebetting7 */}
      <CommunityModal
        isOpen={communityModalOpen}
        onClose={() => setCommunityModalOpen(false)}
        currentLang={currentLang}
      />

      <DownloadAppModal
        isOpen={downloadAppModalOpen}
        onClose={() => setDownloadAppModalOpen(false)}
        currentLang={currentLang}
      />

      <CashierDepositModal
        isOpen={cashDepositModalOpen}
        onClose={() => setCashDepositModalOpen(false)}
        currentLang={currentLang}
        cashier={user}
      />
    </div>
  );
}
