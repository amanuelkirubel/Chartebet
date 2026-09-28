import { Match } from '../types';

const RESULTS_KEY = 'chartebet_match_results_v1';

export interface MatchResultRecord {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  finishedAt: string;
}

export function getArchivedResults(): Record<string, MatchResultRecord> {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Keeps a permanent record of every finished match, so a ticket can still be
 * settled after the live feed has moved on to the next day's fixtures.
 * A finished result is never overwritten once stored.
 */
export function archiveFinishedMatches(matches: Match[]): void {
  try {
    const current = getArchivedResults();
    let changed = false;
    for (const m of matches) {
      if (
        m.status === 'finished' &&
        typeof m.homeScore === 'number' &&
        typeof m.awayScore === 'number' &&
        !current[m.id]
      ) {
        current[m.id] = {
          matchId: m.id,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          finishedAt: new Date().toISOString(),
        };
        changed = true;
      }
    }
    if (changed) localStorage.setItem(RESULTS_KEY, JSON.stringify(current));
  } catch (e) {}
}
