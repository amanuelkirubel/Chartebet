export type Language = 'en' | 'am';

export type UserRole = 'customer' | 'cashier' | 'admin';

export interface UserAccount {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  balance: number;
  currency: string;
  isLoggedIn: boolean;
  role: UserRole;
}

export type ActiveNavTab = 
  | 'soccer'
  | 'sports'
  | 'live'
  | 'games'
  | 'aviator'
  | 'keno'
  | 'skyward'
  | 'lucky7'
  | 'virtual'
  | 'casino'
  | 'esports';

export interface MatchOdds {
  home: number;
  draw: number;
  away: number;
  over25?: number;
  under25?: number;
  bttsYes?: number;
  bttsNo?: number;
  doubleChance1X?: number;
  doubleChance12?: number;
  doubleChanceX2?: number;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamAm?: string;
  awayTeamAm?: string;
  leagueId: string;
  leagueName: string;
  leagueNameAm?: string;
  leagueFlag?: string;
  kickoffTime: string;
  kickoffDate: 'today' | 'tomorrow' | '2days' | '3days' | 'other';
  status: 'upcoming' | 'live' | 'finished' | 'postponed';
  isLive?: boolean;
  liveMinute?: number;
  homeScore?: number;
  awayScore?: number;
  odds: MatchOdds;
  moreMarketsCount: number;
  isPopular?: boolean;
  isFavorite?: boolean;
}

export interface BetSelection {
  id: string;
  matchId: string;
  matchTitle: string;
  leagueName: string;
  marketType: '1X2' | 'OverUnder' | 'BTTS' | 'DoubleChance' | 'Special';
  selectionName: string;
  odds: number;
}

export interface OfflineSlipSelection {
  matchId: string;
  matchTitle: string;
  marketType: string;
  selectionName: string;
  odds: number;
  status: 'pending' | 'won' | 'lost' | 'void';
  result?: string; // final score like "2:1", or "LIVE 1:0 (67')"
}

export interface OfflineSlip {
  id: string;
  bookingCode: string;
  selections: OfflineSlipSelection[];
  stake: number;
  totalOdds: number;
  potentialReturn: number;
  status: 'pending' | 'won' | 'lost';
  isPaid: boolean;
  createdAt: string;
  customerName: string;
  userPhone?: string;
  paidAt?: string;
  paidByCashier?: string;
  securityHash?: string;
  qrPayload?: string;
  settledAt?: string;
  payoutAmount?: number; // final winnings once every game has finished
  cashedOut?: boolean; // closed early with the cash-out offer
  payoutPaid?: boolean; // winnings handed to the customer by a cashier
  payoutAt?: string;
  payoutBy?: string;
}

export interface UserBetHistoryItem {
  id: string;
  userId: string;
  ticketId: string;
  gameType: string;
  stake: number;
  potentialReturn: number;
  status: 'pending' | 'won' | 'lost';
  details: string;
  selections?: OfflineSlipSelection[];
  totalOdds?: number;
  createdAt: string;
  settledAt?: string;
  payoutAmount?: number;
  cashedOut?: boolean;
  payoutCredited?: boolean; // winnings already added to the user's balance
}

export interface GameItem {
  id: string;
  title: string;
  category: 'crash' | 'instant' | 'lottery' | 'table' | 'slots';
  provider: string;
  rtp: string;
  iconEmoji: string;
  description: string;
  isHot?: boolean;
  isNew?: boolean;
}
