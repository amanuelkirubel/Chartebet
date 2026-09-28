import { OfflineSlip, UserBetHistoryItem, OfflineSlipSelection } from '../types';
import { buildQRPayload } from './qrUtils';
import { generateBookingSecurityHash } from './ticket';

export interface DepositAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  badge: string;
  badgeColor: string;
  category: 'telebirr_mpesa' | 'commercial_banks';
}

export const CHARTE_DEPOSIT_ACCOUNTS: DepositAccount[] = [
  {
    id: 'telebirr',
    bankName: 'Telebirr (Ethio Telecom)',
    accountNumber: '0977889900',
    accountHolder: 'Charte Sports & Gaming PLC',
    badge: 'INSTANT',
    badgeColor: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40',
    category: 'telebirr_mpesa',
  },
  {
    id: 'cbe',
    bankName: 'Commercial Bank of Ethiopia (CBE)',
    accountNumber: '1000345678901',
    accountHolder: 'Charte Betting Services PLC',
    badge: 'OFFICIAL',
    badgeColor: 'bg-purple-600/30 text-purple-300 border-purple-500/40',
    category: 'commercial_banks',
  },
  {
    id: 'boa',
    bankName: 'Bank of Abyssinia (BoA)',
    accountNumber: '89102345',
    accountHolder: 'Charte Entertainment Enterprise',
    badge: 'FAST CLEAR',
    badgeColor: 'bg-amber-600/30 text-amber-300 border-amber-500/40',
    category: 'commercial_banks',
  },
  {
    id: 'awash',
    bankName: 'Awash International Bank',
    accountNumber: '01425987654300',
    accountHolder: 'Charte Betting Entertainment',
    badge: 'POPULAR',
    badgeColor: 'bg-blue-600/30 text-blue-300 border-blue-500/40',
    category: 'commercial_banks',
  },
  {
    id: 'dashen',
    bankName: 'Dashen Bank (Amole)',
    accountNumber: '528901234567',
    accountHolder: 'Charte Sports Gaming',
    badge: 'AUTO',
    badgeColor: 'bg-cyan-600/30 text-cyan-300 border-cyan-500/40',
    category: 'commercial_banks',
  },
  {
    id: 'mpesa',
    bankName: 'Safaricom M-Pesa Ethiopia',
    accountNumber: '0711223344',
    accountHolder: 'Charte Gaming Desk',
    badge: 'INSTANT',
    badgeColor: 'bg-green-600/30 text-green-300 border-green-500/40',
    category: 'telebirr_mpesa',
  },
  {
    id: 'lion',
    bankName: 'Lion International Bank',
    accountNumber: '001188992200',
    accountHolder: 'Charte Betting Enterprise',
    badge: 'VERIFIED',
    badgeColor: 'bg-orange-600/30 text-orange-300 border-orange-500/40',
    category: 'commercial_banks',
  },
  {
    id: 'buna',
    bankName: 'Buna International Bank',
    accountNumber: '112233445566',
    accountHolder: 'Charte Betting Services PLC',
    badge: 'VERIFIED',
    badgeColor: 'bg-rose-600/30 text-rose-300 border-rose-500/40',
    category: 'commercial_banks',
  },
];

export interface DepositRequest {
  id: string;
  userId: string;
  userPhoneOrEmail: string;
  userName: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  transactionReference: string;
  receiptFileName?: string;
  receiptFileUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  rejectionReason?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userPhoneOrEmail: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  rejectionReason?: string;
}

export interface CallBackRequest {
  id: string;
  name: string;
  contactPreference: 'Phone Call' | 'Telegram' | 'WhatsApp';
  contactValue: string;
  preferredTime: string;
  notes?: string;
  routedTo: string; // Chartekirubel77@gmail.com
  createdAt: string;
  status: 'pending' | 'contacted' | 'resolved';
}

export interface UnifiedTransaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  bankName: string;
  referenceNumber: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
}

const SLIPS_STORAGE_KEY = 'chartebet_offline_slips_archive_v3';
const USER_BETS_STORAGE_KEY = 'chartebet_user_bets_archive_v3';
const DEPOSITS_STORAGE_KEY = 'chartebet_deposits_store_v3';
const WITHDRAWALS_STORAGE_KEY = 'chartebet_withdrawals_store_v3';
const CALLBACKS_STORAGE_KEY = 'chartebet_callbacks_store_v3';

// ======================== SLIPS & BETS ========================

export function getAllSlips(): OfflineSlip[] {
  try {
    const raw = localStorage.getItem(SLIPS_STORAGE_KEY);
    if (!raw) {
      const initial: OfflineSlip[] = [
        {
          id: 'SLIP-001',
          bookingCode: 'CC9768268',
          stake: 50,
          totalOdds: 4.82,
          potentialReturn: 241.0,
          status: 'won',
          isPaid: true,
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          paidAt: '14:20',
          paidByCashier: 'Bole Station 1 (Branch Counter)',
          customerName: 'Abebe Desta',
          userPhone: '0911445566',
          securityHash: generateBookingSecurityHash('CC9768268'),
          qrPayload: buildQRPayload('CC9768268'),
          selections: [
            {
              matchId: 'm1',
              matchTitle: 'Arsenal vs Chelsea',
              marketType: '1X2',
              selectionName: '1 (Arsenal Win)',
              odds: 1.85,
              status: 'won',
            },
            {
              matchId: 'm2',
              matchTitle: 'Real Madrid vs Barcelona',
              marketType: 'OverUnder',
              selectionName: 'Over 2.5 Goals',
              odds: 1.62,
              status: 'won',
            },
            {
              matchId: 'm3',
              matchTitle: 'Bayern Munich vs Dortmund',
              marketType: 'BTTS',
              selectionName: 'Yes (Both Teams to Score)',
              odds: 1.61,
              status: 'won',
            },
          ],
        },
        {
          id: 'SLIP-002',
          bookingCode: 'CC8855610',
          stake: 100,
          totalOdds: 3.45,
          potentialReturn: 345.0,
          status: 'won',
          isPaid: true,
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          paidAt: '11:15',
          paidByCashier: 'Megenagna Cashier 2',
          customerName: 'Kebede Chala',
          userPhone: '0922889900',
          securityHash: generateBookingSecurityHash('CC8855610'),
          qrPayload: buildQRPayload('CC8855610'),
          selections: [
            {
              matchId: 'm4',
              matchTitle: 'Liverpool vs Manchester City',
              marketType: '1X2',
              selectionName: '1 (Liverpool Win)',
              odds: 2.10,
              status: 'won',
            },
            {
              matchId: 'm5',
              matchTitle: 'Inter Milan vs AC Milan',
              marketType: 'DoubleChance',
              selectionName: '1X (Inter Win or Draw)',
              odds: 1.64,
              status: 'won',
            },
          ],
        },
        {
          id: 'SLIP-003',
          bookingCode: 'CC4499112',
          stake: 200,
          totalOdds: 5.2,
          potentialReturn: 1040.0,
          status: 'pending',
          isPaid: false,
          createdAt: new Date().toISOString(),
          customerName: 'Walk-in Cash Customer',
          userPhone: '0944778899',
          securityHash: generateBookingSecurityHash('CC4499112'),
          qrPayload: buildQRPayload('CC4499112'),
          selections: [
            {
              matchId: 'm6',
              matchTitle: 'Paris Saint-Germain vs Monaco',
              marketType: '1X2',
              selectionName: '1 (PSG Win)',
              odds: 1.55,
              status: 'pending',
            },
            {
              matchId: 'm7',
              matchTitle: 'Juventus vs Napoli',
              marketType: 'BTTS',
              selectionName: 'Yes (Both Teams to Score)',
              odds: 1.82,
              status: 'pending',
            },
            {
              matchId: 'm8',
              matchTitle: 'Saint George vs Fasil Kenema',
              marketType: '1X2',
              selectionName: '1 (Saint George Win)',
              odds: 1.84,
              status: 'pending',
            },
          ],
        },
      ];
      localStorage.setItem(SLIPS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveAllSlips(slips: OfflineSlip[]): void {
  try {
    localStorage.setItem(SLIPS_STORAGE_KEY, JSON.stringify(slips));
  } catch (e) {}
}

export function addSlipRecord(slipData: Omit<OfflineSlip, 'id' | 'securityHash' | 'qrPayload'> & { id?: string }): OfflineSlip {
  const slips = getAllSlips();
  const id = slipData.id || `SLIP-${Date.now()}`;
  const code = slipData.bookingCode.toUpperCase();
  const securityHash = generateBookingSecurityHash(code);
  const qrPayload = buildQRPayload(code);

  const fullSlip: OfflineSlip = {
    ...slipData,
    id,
    bookingCode: code,
    securityHash,
    qrPayload,
  };

  slips.unshift(fullSlip);
  saveAllSlips(slips);
  return fullSlip;
}

export function getOfflineSlipByCode(code: string): OfflineSlip | undefined {
  const clean = code.trim().toUpperCase();
  const slips = getAllSlips();
  return slips.find((s) => s.bookingCode === clean || s.id === clean);
}

export function markSlipPaid(slipId: string, cashierName: string, branchName: string): boolean {
  const slips = getAllSlips();
  const index = slips.findIndex((s) => s.id === slipId || s.bookingCode === slipId);
  if (index === -1) return false;

  // isPaid = the customer's STAKE was received. It must not decide win/loss.
  slips[index].isPaid = true;
  slips[index].paidAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  slips[index].paidByCashier = `${cashierName} (${branchName})`;

  saveAllSlips(slips);
  return true;
}

export function getPaidSlipsFiltered(filter: 'day' | 'week' | 'month' | 'all'): OfflineSlip[] {
  const slips = getAllSlips().filter((s) => s.payoutPaid);
  const now = Date.now();

  if (filter === 'day') {
    const oneDayAgo = now - 86400000;
    return slips.filter((s) => new Date(s.createdAt).getTime() >= oneDayAgo);
  } else if (filter === 'week') {
    const oneWeekAgo = now - 86400000 * 7;
    return slips.filter((s) => new Date(s.createdAt).getTime() >= oneWeekAgo);
  } else if (filter === 'month') {
    const oneMonthAgo = now - 86400000 * 30;
    return slips.filter((s) => new Date(s.createdAt).getTime() >= oneMonthAgo);
  }
  return slips;
}

export function markSlipPayoutPaid(slipId: string, cashierName: string, branchName: string): boolean {
  const slips = getAllSlips();
  const index = slips.findIndex((s) => s.id === slipId || s.bookingCode === slipId);
  if (index === -1) return false;
  if (slips[index].status !== 'won' || slips[index].payoutPaid) return false;

  slips[index].payoutPaid = true;
  slips[index].payoutAt = new Date().toISOString();
  slips[index].payoutBy = `${cashierName} (${branchName})`;
  saveAllSlips(slips);
  return true;
}

// ======================== USER BET HISTORY ========================

export function getAllPlacedBets(): UserBetHistoryItem[] {
  try {
    const raw = localStorage.getItem(USER_BETS_STORAGE_KEY);
    if (!raw) {
      const initial: UserBetHistoryItem[] = [
        {
          id: 'BET-001',
          userId: 'USR-881204',
          ticketId: 'CC9768268',
          gameType: 'Sportsbook Bet',
          stake: 50,
          potentialReturn: 241.0,
          status: 'won',
          totalOdds: 4.82,
          details: 'Arsenal vs Chelsea (1), Real Madrid vs Barcelona (Over 2.5), Bayern vs Dortmund (GG)',
          createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
          selections: [
            {
              matchId: 'm1',
              matchTitle: 'Arsenal vs Chelsea',
              marketType: '1X2',
              selectionName: '1 (Arsenal Win)',
              odds: 1.85,
              status: 'won',
            },
            {
              matchId: 'm2',
              matchTitle: 'Real Madrid vs Barcelona',
              marketType: 'OverUnder',
              selectionName: 'Over 2.5 Goals',
              odds: 1.62,
              status: 'won',
            },
            {
              matchId: 'm3',
              matchTitle: 'Bayern Munich vs Dortmund',
              marketType: 'BTTS',
              selectionName: 'Yes (Both Teams to Score)',
              odds: 1.61,
              status: 'won',
            },
          ],
        },
        {
          id: 'BET-002',
          userId: 'USR-881204',
          ticketId: 'CC4499112',
          gameType: 'Sportsbook Bet',
          stake: 200,
          potentialReturn: 1040.0,
          status: 'pending',
          totalOdds: 5.2,
          details: 'PSG vs Monaco (1), Juventus vs Napoli (GG), Saint George vs Fasil (1)',
          createdAt: new Date().toISOString(),
          selections: [
            {
              matchId: 'm6',
              matchTitle: 'Paris Saint-Germain vs Monaco',
              marketType: '1X2',
              selectionName: '1 (PSG Win)',
              odds: 1.55,
              status: 'pending',
            },
            {
              matchId: 'm7',
              matchTitle: 'Juventus vs Napoli',
              marketType: 'BTTS',
              selectionName: 'Yes (Both Teams to Score)',
              odds: 1.82,
              status: 'pending',
            },
            {
              matchId: 'm8',
              matchTitle: 'Saint George vs Fasil Kenema',
              marketType: '1X2',
              selectionName: '1 (Saint George Win)',
              odds: 1.84,
              status: 'pending',
            },
          ],
        },
      ];
      localStorage.setItem(USER_BETS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveAllPlacedBets(bets: UserBetHistoryItem[]): void {
  try {
    localStorage.setItem(USER_BETS_STORAGE_KEY, JSON.stringify(bets));
  } catch (e) {}
}

export function addUserBet(bet: Omit<UserBetHistoryItem, 'id' | 'createdAt'>): UserBetHistoryItem {
  const bets = getAllPlacedBets();
  const newBet: UserBetHistoryItem = {
    ...bet,
    id: `UBET-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  bets.unshift(newBet);
  saveAllPlacedBets(bets);
  return newBet;
}

export function getBetByTicketId(ticketId: string): UserBetHistoryItem | undefined {
  return getAllPlacedBets().find((b) => b.ticketId === ticketId);
}

export function getUserBetsFiltered(
  userId: string,
  filter: 'today' | 'weeks' | 'months' | 'all'
): UserBetHistoryItem[] {
  const bets = getAllPlacedBets();
  const userBets = bets.filter((b) => b.userId === userId || userId === 'GUEST' || b.userId === 'BOOKED');
  const now = Date.now();

  if (filter === 'today') {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return userBets.filter((b) => new Date(b.createdAt).getTime() >= startOfDay.getTime());
  } else if (filter === 'weeks') {
    const oneWeekAgo = now - 86400000 * 7;
    return userBets.filter((b) => new Date(b.createdAt).getTime() >= oneWeekAgo);
  } else if (filter === 'months') {
    const oneMonthAgo = now - 86400000 * 30;
    return userBets.filter((b) => new Date(b.createdAt).getTime() >= oneMonthAgo);
  }
  return userBets;
}

// ======================== DEPOSITS & WITHDRAWALS ========================

export function getPendingDeposits(): DepositRequest[] {
  try {
    const raw = localStorage.getItem(DEPOSITS_STORAGE_KEY);
    if (!raw) return [];
    const list: DepositRequest[] = JSON.parse(raw);
    return list.filter((d) => d.status === 'pending');
  } catch (e) {
    return [];
  }
}

export function addDepositRequest(req: Omit<DepositRequest, 'id' | 'status' | 'createdAt'>): DepositRequest {
  let list: DepositRequest[] = [];
  try {
    const raw = localStorage.getItem(DEPOSITS_STORAGE_KEY);
    if (raw) list = JSON.parse(raw);
  } catch (e) {}

  const newDep: DepositRequest = {
    ...req,
    id: `DEP-${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  list.unshift(newDep);
  try {
    localStorage.setItem(DEPOSITS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}

  return newDep;
}

export function approveDepositRequest(
  depositId: string,
  adminName: string
): { success: boolean; deposit?: DepositRequest } {
  let list: DepositRequest[] = [];
  try {
    const raw = localStorage.getItem(DEPOSITS_STORAGE_KEY);
    if (raw) list = JSON.parse(raw);
  } catch (e) {}

  const idx = list.findIndex((d) => d.id === depositId);
  if (idx === -1) return { success: false };

  list[idx].status = 'approved';
  list[idx].processedAt = new Date().toISOString();
  list[idx].processedBy = adminName;

  try {
    localStorage.setItem(DEPOSITS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}

  return { success: true, deposit: list[idx] };
}

export function rejectDepositRequest(depositId: string, reason: string, adminName: string): boolean {
  let list: DepositRequest[] = [];
  try {
    const raw = localStorage.getItem(DEPOSITS_STORAGE_KEY);
    if (raw) list = JSON.parse(raw);
  } catch (e) {}

  const idx = list.findIndex((d) => d.id === depositId);
  if (idx === -1) return false;

  list[idx].status = 'rejected';
  list[idx].rejectionReason = reason;
  list[idx].processedAt = new Date().toISOString();
  list[idx].processedBy = adminName;

  try {
    localStorage.setItem(DEPOSITS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}

  return true;
}

export function getPendingWithdrawals(): WithdrawalRequest[] {
  try {
    const raw = localStorage.getItem(WITHDRAWALS_STORAGE_KEY);
    if (!raw) return [];
    const list: WithdrawalRequest[] = JSON.parse(raw);
    return list.filter((w) => w.status === 'pending');
  } catch (e) {
    return [];
  }
}

export function addWithdrawalRequest(req: Omit<WithdrawalRequest, 'id' | 'status' | 'createdAt'>): {
  success: boolean;
  withdrawal?: WithdrawalRequest;
  error?: string;
} {
  let list: WithdrawalRequest[] = [];
  try {
    const raw = localStorage.getItem(WITHDRAWALS_STORAGE_KEY);
    if (raw) list = JSON.parse(raw);
  } catch (e) {}

  // 24-hour limit check (Max 25,000 ETB in 24 hours)
  const oneDayAgo = Date.now() - 86400000;
  const recentUserWithdrawals = list.filter(
    (w) => w.userId === req.userId && w.status !== 'rejected' && new Date(w.createdAt).getTime() >= oneDayAgo
  );
  const total24h = recentUserWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  if (total24h + req.amount > 25000) {
    const remaining = Math.max(0, 25000 - total24h);
    return {
      success: false,
      error: `24-Hour withdrawal limit reached. You can withdraw at most ${remaining.toLocaleString()} ETB today (Max 25,000 ETB per 24 hours).`,
    };
  }

  const newW: WithdrawalRequest = {
    ...req,
    id: `WTH-${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  list.unshift(newW);
  try {
    localStorage.setItem(WITHDRAWALS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}

  return { success: true, withdrawal: newW };
}

export function approveWithdrawalRequest(
  withdrawalId: string,
  adminName: string
): { success: boolean; withdrawal?: WithdrawalRequest } {
  let list: WithdrawalRequest[] = [];
  try {
    const raw = localStorage.getItem(WITHDRAWALS_STORAGE_KEY);
    if (raw) list = JSON.parse(raw);
  } catch (e) {}

  const idx = list.findIndex((w) => w.id === withdrawalId);
  if (idx === -1) return { success: false };

  list[idx].status = 'approved';
  list[idx].processedAt = new Date().toISOString();
  list[idx].processedBy = adminName;

  try {
    localStorage.setItem(WITHDRAWALS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}

  return { success: true, withdrawal: list[idx] };
}

export function rejectWithdrawalRequest(withdrawalId: string, reason: string, adminName: string): boolean {
  let list: WithdrawalRequest[] = [];
  try {
    const raw = localStorage.getItem(WITHDRAWALS_STORAGE_KEY);
    if (raw) list = JSON.parse(raw);
  } catch (e) {}

  const idx = list.findIndex((w) => w.id === withdrawalId);
  if (idx === -1) return false;

  list[idx].status = 'rejected';
  list[idx].rejectionReason = reason;
  list[idx].processedAt = new Date().toISOString();
  list[idx].processedBy = adminName;

  try {
    localStorage.setItem(WITHDRAWALS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}

  return true;
}

export function getUserTransactionsFiltered(
  userId: string,
  filter: 'pending' | 'confirmed_paid' | 'all'
): UnifiedTransaction[] {
  let deposits: DepositRequest[] = [];
  let withdrawals: WithdrawalRequest[] = [];

  try {
    const dRaw = localStorage.getItem(DEPOSITS_STORAGE_KEY);
    if (dRaw) deposits = JSON.parse(dRaw);
    const wRaw = localStorage.getItem(WITHDRAWALS_STORAGE_KEY);
    if (wRaw) withdrawals = JSON.parse(wRaw);
  } catch (e) {}

  const userDeposits = deposits.filter((d) => d.userId === userId || userId === 'GUEST');
  const userWithdrawals = withdrawals.filter((w) => w.userId === userId || userId === 'GUEST');

  const unified: UnifiedTransaction[] = [
    ...userDeposits.map((d) => ({
      id: d.id,
      type: 'deposit' as const,
      amount: d.amount,
      bankName: d.bankName,
      referenceNumber: d.transactionReference || 'REF-CBE-PENDING',
      date: d.createdAt,
      status: d.status,
    })),
    ...userWithdrawals.map((w) => ({
      id: w.id,
      type: 'withdrawal' as const,
      amount: w.amount,
      bankName: w.bankName,
      referenceNumber: `WTH-${w.accountNumber.slice(-4)}`,
      date: w.createdAt,
      status: w.status,
    })),
  ];

  unified.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (filter === 'pending') {
    return unified.filter((t) => t.status === 'pending');
  } else if (filter === 'confirmed_paid') {
    return unified.filter((t) => t.status === 'approved');
  }
  return unified;
}

// ======================== CALL BACK & SUPPORT ROUTING ========================

export function recordCallBackRequest(req: {
  name: string;
  contactPreference: 'Phone Call' | 'Telegram' | 'WhatsApp';
  contactValue: string;
  preferredTime: string;
  notes?: string;
}): CallBackRequest {
  let list: CallBackRequest[] = [];
  try {
    const raw = localStorage.getItem(CALLBACKS_STORAGE_KEY);
    if (raw) list = JSON.parse(raw);
  } catch (e) {}

  // Requirement 6: All requests are routed directly to Chartekirubel77@gmail.com and recorded into local storage
  const newCb: CallBackRequest = {
    ...req,
    id: `CALL-${Date.now()}`,
    routedTo: 'Chartekirubel77@gmail.com',
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  list.unshift(newCb);
  try {
    localStorage.setItem(CALLBACKS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}

  return newCb;
}

export function getAllCallBackRequests(): CallBackRequest[] {
  try {
    const raw = localStorage.getItem(CALLBACKS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}
