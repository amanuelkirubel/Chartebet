import { Match, OfflineSlipSelection } from '../types';
import { getStoredMatches } from './matchStore';
import { fetchRealLiveMatches } from './realMatchFeed';
import { archiveFinishedMatches, getArchivedResults } from './matchResults';
import {
  getAllSlips,
  saveAllSlips,
  getAllPlacedBets,
  saveAllPlacedBets,
} from './betAndTransactionStore';
import { adminAdjustBalance } from './userStore';

export type SelectionOutcome = 'won' | 'lost' | 'void' | null;

export interface MatchSnapshot {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'upcoming' | 'live' | 'finished' | 'postponed';
  minute?: number;
  kickoffMs?: number; // best-effort kickoff moment (feed matches only)
}

/* ----------------------------- market rules ----------------------------- */

function pick1X2(name: string, snap: MatchSnapshot): '1' | 'x' | '2' | null {
  const m = name.match(/^(1|x|2)(?![a-z0-9])/);
  if (m) return m[1] as '1' | 'x' | '2';
  if (name.startsWith('home')) return '1';
  if (name.startsWith('draw')) return 'x';
  if (name.startsWith('away')) return '2';
  if (name.includes('draw')) return 'x';
  if (name.includes(snap.homeTeam.toLowerCase())) return '1';
  if (name.includes(snap.awayTeam.toLowerCase())) return '2';
  return null;
}

/** Decides one selection from a FINISHED match. Returns null if it can't tell. */
export function evaluateSelection(
  sel: { marketType: string; selectionName: string },
  snap: MatchSnapshot
): SelectionOutcome {
  const h = snap.homeScore;
  const a = snap.awayScore;
  const total = h + a;
  const name = sel.selectionName.trim().toLowerCase();

  if (sel.marketType === '1X2') {
    const outcome = h > a ? '1' : h < a ? '2' : 'x';
    const pick = pick1X2(name, snap);
    return pick ? (pick === outcome ? 'won' : 'lost') : null;
  }

  if (sel.marketType === 'DoubleChance') {
    const outcome = h > a ? '1' : h < a ? '2' : 'x';
    let pick: string | null = null;
    const m = name.match(/^(1x|x2|12)(?![a-z0-9])/);
    if (m) pick = m[1];
    else if (name.includes('home or draw')) pick = '1x';
    else if (name.includes('draw or away')) pick = 'x2';
    else if (name.includes('home or away')) pick = '12';
    if (!pick) return null;
    const covered = pick === '1x' ? ['1', 'x'] : pick === 'x2' ? ['x', '2'] : ['1', '2'];
    return covered.includes(outcome) ? 'won' : 'lost';
  }

  if (sel.marketType === 'OverUnder') {
    const m = name.match(/(over|under)\D*([0-9]+(?:\.[0-9]+)?)?/);
    if (!m) return null;
    const line = m[2] ? parseFloat(m[2]) : 2.5;
    if (total === line) return 'void';
    const isOver = total > line;
    return (m[1] === 'over') === isOver ? 'won' : 'lost';
  }

  if (sel.marketType === 'BTTS') {
    const both = h > 0 && a > 0;
    if (name.startsWith('yes') || name.startsWith('gg')) return both ? 'won' : 'lost';
    if (name.startsWith('no') || name.startsWith('ng')) return both ? 'lost' : 'won';
    return null;
  }

  return null;
}

/* ----------------------------- match results ----------------------------- */

function kickoffToMs(m: Match): number | undefined {
  // Feed matches carry a UTC HH:MM for today. Manually created matches use local
  // free-text times, so we don't guess for those.
  if (!m.id.startsWith('real-') || m.kickoffDate !== 'today') return undefined;
  const mt = /^(\d{1,2}):(\d{2})$/.exec(m.kickoffTime || '');
  if (!mt) return undefined;
  const d = new Date();
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), Number(mt[1]), Number(mt[2]));
}

function toSnap(m: Match): MatchSnapshot {
  return {
    kickoffMs: kickoffToMs(m),
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    homeScore: m.homeScore ?? 0,
    awayScore: m.awayScore ?? 0,
    status:
      m.status === 'finished'
        ? 'finished'
        : m.status === 'postponed'
        ? 'postponed'
        : m.status === 'live' || m.isLive
        ? 'live'
        : 'upcoming',
    minute: m.liveMinute,
  };
}

let freshCache: { at: number; matches: Match[] } | null = null;

async function getFreshMatches(): Promise<Match[]> {
  if (freshCache && Date.now() - freshCache.at < 30000) return freshCache.matches;
  try {
    const matches = await fetchRealLiveMatches();
    freshCache = { at: Date.now(), matches };
    return matches;
  } catch (e) {
    return [];
  }
}

async function collectSnapshots(): Promise<Record<string, MatchSnapshot>> {
  const snaps: Record<string, MatchSnapshot> = {};
  const put = (m: Match) => {
    const prev = snaps[m.id];
    if (prev && prev.status === 'finished') return; // finished is final
    snaps[m.id] = toSnap(m);
  };

  getStoredMatches().forEach(put);

  const fresh = await getFreshMatches();
  archiveFinishedMatches(fresh);
  fresh.forEach(put);

  // The permanent archive always wins for finished games.
  const archive = getArchivedResults();
  for (const id of Object.keys(archive)) {
    const r = archive[id];
    snaps[id] = {
      homeTeam: r.homeTeam,
      awayTeam: r.awayTeam,
      homeScore: r.homeScore,
      awayScore: r.awayScore,
      status: 'finished',
    };
  }
  return snaps;
}

/* ------------------------------ settlement ------------------------------ */

function settleSelections(
  selections: OfflineSlipSelection[],
  snaps: Record<string, MatchSnapshot>
): OfflineSlipSelection[] {
  return selections.map((sel) => {
    if (sel.status === 'won' || sel.status === 'lost' || sel.status === 'void') return sel;
    const snap = snaps[sel.matchId];
    if (!snap) return sel; // no result source for this match (yet)

    if (snap.status === 'postponed') {
      return { ...sel, status: 'void', result: 'Postponed' };
    }
    if (snap.status === 'live') {
      return {
        ...sel,
        status: 'pending',
        result: `LIVE ${snap.homeScore}:${snap.awayScore}${snap.minute ? ` (${snap.minute}')` : ''}`,
      };
    }
    if (snap.status === 'finished') {
      const outcome = evaluateSelection(sel, snap);
      if (!outcome) return sel;
      return { ...sel, status: outcome, result: `${snap.homeScore}:${snap.awayScore}` };
    }
    return sel;
  });
}

function multiBonus(legs: number): number {
  return legs >= 3 ? Math.min(1.0, (legs - 2) * 0.05) : 0;
}

/** null while any game is still unfinished. */
function finalize(
  selections: OfflineSlipSelection[],
  stake: number,
  storedReturn: number
): { status: 'won' | 'lost'; payout: number } | null {
  if (selections.length === 0) return null;
  if (selections.some((s) => s.status === 'pending')) return null;
  if (selections.some((s) => s.status === 'lost')) return { status: 'lost', payout: 0 };

  const live = selections.filter((s) => s.status === 'won');
  if (live.length === selections.length) return { status: 'won', payout: storedReturn };

  // Some games void: recompute on the remaining legs (void = refunded leg).
  if (live.length === 0) return { status: 'won', payout: stake }; // everything void: stake back
  const odds = live.reduce((acc, s) => acc * s.odds, 1);
  const bonus = multiBonus(live.length);
  const payout = Number((stake * odds * (1 + bonus)).toFixed(2));
  return { status: 'won', payout };
}

export interface SettleReport {
  newlyWon: number;
  newlyLost: number;
  creditedTotal: number;
  creditedUserIds: string[];
}

export async function settleAllPendingBets(): Promise<SettleReport> {
  const report: SettleReport = { newlyWon: 0, newlyLost: 0, creditedTotal: 0, creditedUserIds: [] };
  const snaps = await collectSnapshots();
  const slips = getAllSlips();
  const bets = getAllPlacedBets();
  const now = new Date().toISOString();

  // 1) Booked / cashier slips (and the online bets that share the same code)
  for (const slip of slips) {
    if (slip.status !== 'pending') continue;
    slip.selections = settleSelections(slip.selections, snaps);
    const bet = bets.find((b) => b.ticketId === slip.bookingCode);
    if (bet) bet.selections = slip.selections;

    const fin = finalize(slip.selections, slip.stake, slip.potentialReturn);
    if (fin) {
      slip.status = fin.status;
      slip.settledAt = now;
      slip.payoutAmount = fin.payout;
      if (bet) {
        bet.status = fin.status;
        bet.settledAt = now;
        bet.payoutAmount = fin.payout;
      }
      fin.status === 'won' ? report.newlyWon++ : report.newlyLost++;
    }
  }

  // 2) Sportsbook bets that have no slip record
  const slipCodes = new Set(slips.map((s) => s.bookingCode));
  for (const bet of bets) {
    if (bet.status !== 'pending' || !bet.selections?.length || slipCodes.has(bet.ticketId)) continue;
    bet.selections = settleSelections(bet.selections, snaps);
    const fin = finalize(bet.selections, bet.stake, bet.potentialReturn);
    if (fin) {
      bet.status = fin.status;
      bet.settledAt = now;
      bet.payoutAmount = fin.payout;
      fin.status === 'won' ? report.newlyWon++ : report.newlyLost++;
    }
  }

  // 3) Credit winnings for ONLINE bets, exactly once
  for (const bet of bets) {
    if (
      bet.gameType === 'Sportsbook Bet' &&
      bet.status === 'won' &&
      bet.settledAt &&
      !bet.payoutCredited
    ) {
      const amount = bet.payoutAmount ?? bet.potentialReturn;
      const res = adminAdjustBalance(bet.userId, amount, 'add');
      if (res.success) {
        bet.payoutCredited = true;
        report.creditedTotal += amount;
        report.creditedUserIds.push(bet.userId);
      }
    }
  }

  saveAllSlips(slips);
  saveAllPlacedBets(bets);

  if (report.creditedUserIds.length > 0) {
    try {
      window.dispatchEvent(
        new CustomEvent('chartebet:balance-refresh', { detail: { userIds: report.creditedUserIds } })
      );
    } catch (e) {}
  }
  return report;
}

/* -------------------------------- cash out -------------------------------- */

export const CASHOUT_MIN_GAMES = 10; // slip must have MORE than this many games
export const CASHOUT_REMAINING_GAMES = 2; // ...and exactly this many still to play

export interface CashoutOffer {
  available: boolean;
  reason?: string;
  amount: number; // what the player gets now
  fullPotential: number; // what the full slip would pay
  remaining: { matchTitle: string; selectionName: string; odds: number }[];
  wonGames: number;
  totalGames: number;
  isOnline: boolean;
}

const NO_OFFER: CashoutOffer = {
  available: false,
  amount: 0,
  fullPotential: 0,
  remaining: [],
  wonGames: 0,
  totalGames: 0,
  isOnline: false,
};

/**
 * Cash out is offered only when a slip has MORE than 10 games, every finished game
 * is a win, exactly 2 games are left, and NEITHER of them has started.
 * The amount is the winnings with the 2 remaining odds taken out:
 *   stake x (odds of the won games) x multi-bet bonus of the won games.
 */
export async function getCashoutOffer(ticketId: string): Promise<CashoutOffer> {
  const slips = getAllSlips();
  const bets = getAllPlacedBets();
  const slip = slips.find((x) => x.bookingCode === ticketId);
  const bet = bets.find((b) => b.ticketId === ticketId);
  const source = slip ?? bet;
  if (!source || !source.selections) return { ...NO_OFFER, reason: 'Ticket not found' };

  const stake = source.stake;
  const fullPotential = source.potentialReturn;
  const isOnline = bet?.gameType === 'Sportsbook Bet';
  const base = { ...NO_OFFER, fullPotential, totalGames: source.selections.length, isOnline };

  if (source.status !== 'pending' || source.cashedOut) return { ...base, reason: 'Ticket already settled' };
  if (source.selections.length <= CASHOUT_MIN_GAMES) {
    return { ...base, reason: `Cash out needs more than ${CASHOUT_MIN_GAMES} games on the slip` };
  }
  if (!isOnline && slip && !slip.isPaid) {
    return { ...base, reason: 'Stake has not been paid at the cashier yet' };
  }

  const snaps = await collectSnapshots();
  const sels = settleSelections(source.selections, snaps);
  if (sels.some((x) => x.status === 'lost')) return { ...base, reason: 'A game already lost' };

  const pending = sels.filter((x) => x.status === 'pending');
  const won = sels.filter((x) => x.status === 'won');
  if (pending.length !== CASHOUT_REMAINING_GAMES) {
    return { ...base, wonGames: won.length, reason: `Cash out opens when exactly ${CASHOUT_REMAINING_GAMES} games are left` };
  }

  const now = Date.now();
  for (const p of pending) {
    const snap = snaps[p.matchId];
    if (!snap || snap.status !== 'upcoming') {
      return { ...base, wonGames: won.length, reason: 'One of the remaining games has started or its status is unknown' };
    }
    if (snap.kickoffMs !== undefined && now >= snap.kickoffMs) {
      return { ...base, wonGames: won.length, reason: 'One of the remaining games is about to start' };
    }
  }

  const odds = won.reduce((acc, x) => acc * x.odds, 1);
  const amount = Number((stake * odds * (1 + multiBonus(won.length))).toFixed(2));
  return {
    available: true,
    amount,
    fullPotential,
    remaining: pending.map((p) => ({ matchTitle: p.matchTitle, selectionName: p.selectionName, odds: p.odds })),
    wonGames: won.length,
    totalGames: sels.length,
    isOnline,
  };
}

/** Re-validates the offer at click time, then closes the slip and pays. */
export async function cashOutTicket(
  ticketId: string
): Promise<{ success: boolean; amount?: number; error?: string }> {
  await settleAllPendingBets(); // book any results that arrived first
  const offer = await getCashoutOffer(ticketId);
  if (!offer.available) return { success: false, error: offer.reason || 'Cash out is not available' };

  const slips = getAllSlips();
  const bets = getAllPlacedBets();
  const slip = slips.find((x) => x.bookingCode === ticketId);
  const bet = bets.find((b) => b.ticketId === ticketId);
  const now = new Date().toISOString();

  const closeSelections = (sels: OfflineSlipSelection[]): OfflineSlipSelection[] =>
    sels.map((x) => (x.status === 'pending' ? { ...x, status: 'void' as const, result: 'Cashed out' } : x));

  if (slip) {
    slip.selections = closeSelections(slip.selections);
    slip.status = 'won';
    slip.cashedOut = true;
    slip.settledAt = now;
    slip.payoutAmount = offer.amount;
  }
  if (bet) {
    bet.selections = closeSelections(bet.selections || []);
    bet.status = 'won';
    bet.cashedOut = true;
    bet.settledAt = now;
    bet.payoutAmount = offer.amount;
    if (bet.gameType === 'Sportsbook Bet' && !bet.payoutCredited) {
      const res = adminAdjustBalance(bet.userId, offer.amount, 'add');
      if (!res.success) return { success: false, error: 'Could not credit the balance. Nothing was changed.' };
      bet.payoutCredited = true;
    }
  }

  saveAllSlips(slips);
  saveAllPlacedBets(bets);
  try {
    window.dispatchEvent(new CustomEvent('chartebet:balance-refresh', { detail: { userIds: bet ? [bet.userId] : [] } }));
  } catch (e) {}
  return { success: true, amount: offer.amount };
}
