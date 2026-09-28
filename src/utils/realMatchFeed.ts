import { Match, MatchOdds } from '../types';

const AMHARIC_TEAMS: Record<string, string> = {
  'Lithuania': 'ሊቱዌኒያ',
  'Azerbaijan': 'አዘርባጃን',
  'Austria': 'ኦስትሪያ',
  'Kosovo': 'ኮሶቮ',
  'Denmark': 'ዴንማርክ',
  'Wales': 'ዌልስ',
  'Gibraltar': 'ጂብራልታር',
  'Andorra': 'አንዶራ',
  'Serbia': 'ሰርቢያ',
  'Netherlands': 'ኔዘርላንድስ',
  'Germany': 'ጀርመን',
  'Greece': 'ግሪክ',
  'Israel': 'እስራኤል',
  'Republic of Ireland': 'አየርላንድ',
  'Norway': 'ኖርዌይ',
  'Portugal': 'ፖርቱጋል',
  'France': 'ፈረንሳይ',
  'Spain': 'ስፔን',
  'England': 'እንግሊዝ',
  'Italy': 'ጣሊያን',
  'Belgium': 'ቤልጂየም',
  'Croatia': 'ክሮሺያ',
  'Poland': 'ፖላንድ',
  'Sweden': 'ስዊድን',
  'Switzerland': 'ስዊዘርላንድ',
  'Scotland': 'ስኮትላንድ',
  'Turkey': 'ቱርክ',
  'Czech Republic': 'ቼክ ሪፐብሊክ',
  'Hungary': 'ሃንጋሪ',
  'Ukraine': 'ዩክሬን',
  'Slovakia': 'ስሎቫኪያ',
  'Romania': 'ሮማኒያ',
  'Bulgaria': 'ቡልጋሪያ',
  'Finland': 'ፊንላንድ',
  'Northern Ireland': 'ሰሜን አየርላንድ',
  'Slovenia': 'ስሎቬኒያ',
  'Albania': 'አልባኒያ',
  'Montenegro': 'ሞንቴኔግሮ',
  'North Macedonia': 'ሰሜን መቄዶንያ',
  'Georgia': 'ጆርጂያ',
  'Armenia': 'አርሜኒያ',
  'Cyprus': 'ቆጵሮስ',
  'Faroe Islands': 'ፋሮ ደሴቶች',
  'Estonia': 'ኢስቶኒያ',
  'Latvia': 'ላትቪያ',
  'Moldova': 'ሞልዶቫ',
  'Malta': 'ማልታ',
  'San Marino': 'ሳን ማሪኖ',
  'Liechtenstein': 'ሊክተንስታይን',
  'Kazakhstan': 'ካዛክስታን',
  'Luxembourg': 'ሉክሰምበርግ',
  'Iceland': 'አይስላንድ',
  'Bosnia and Herzegovina': 'ቦስኒያ',
};

function parseOdds(rawOdds: any): MatchOdds {
  let home = 2.10;
  let draw = 3.25;
  let away = 3.10;

  if (Array.isArray(rawOdds) && rawOdds.length > 0 && rawOdds[0]) {
    const o = rawOdds[0];
    try {
      if (o.homeTeamOdds?.moneyLine) {
        const ml = Number(o.homeTeamOdds.moneyLine);
        home = ml > 0 ? 1 + ml / 100 : 1 + 100 / Math.abs(ml);
      } else if (o.moneyline?.home?.close?.odds) {
        const ml = parseInt(o.moneyline.home.close.odds, 10);
        if (!isNaN(ml)) home = ml > 0 ? 1 + ml / 100 : 1 + 100 / Math.abs(ml);
      }

      if (o.awayTeamOdds?.moneyLine) {
        const ml = Number(o.awayTeamOdds.moneyLine);
        away = ml > 0 ? 1 + ml / 100 : 1 + 100 / Math.abs(ml);
      } else if (o.moneyline?.away?.close?.odds) {
        const ml = parseInt(o.moneyline.away.close.odds, 10);
        if (!isNaN(ml)) away = ml > 0 ? 1 + ml / 100 : 1 + 100 / Math.abs(ml);
      }

      if (o.drawOdds?.moneyLine) {
        const ml = Number(o.drawOdds.moneyLine);
        draw = ml > 0 ? 1 + ml / 100 : 1 + 100 / Math.abs(ml);
      }
    } catch (e) {}
  }

  const h = Number(Math.max(1.10, Math.min(15.0, home)).toFixed(2));
  const d = Number(Math.max(1.50, Math.min(10.0, draw)).toFixed(2));
  const a = Number(Math.max(1.10, Math.min(15.0, away)).toFixed(2));

  return {
    home: h,
    draw: d,
    away: a,
    over25: Number((1.65 + Math.random() * 0.4).toFixed(2)),
    under25: Number((1.95 + Math.random() * 0.4).toFixed(2)),
    bttsYes: Number((1.70 + Math.random() * 0.35).toFixed(2)),
    bttsNo: Number((1.90 + Math.random() * 0.35).toFixed(2)),
    doubleChance1X: Number((1.20 + Math.random() * 0.25).toFixed(2)),
    doubleChance12: Number((1.25 + Math.random() * 0.15).toFixed(2)),
    doubleChanceX2: Number((1.30 + Math.random() * 0.30).toFixed(2)),
  };
}

export async function fetchRealLiveMatches(): Promise<Match[]> {
  const url = 'https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard';
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch real live matches (HTTP ${res.status})`);
  }
  const data = await res.json();
  const events = data.events || [];

  const parsedMatches: Match[] = events.map((e: any, idx: number) => {
    const comp = e.competitions?.[0];
    const home = comp?.competitors?.find((c: any) => c.homeAway === 'home');
    const away = comp?.competitors?.find((c: any) => c.homeAway === 'away');

    const statusType: string = e.status?.type?.name || '';
    const statusState: string | undefined = e.status?.type?.state;
    // ESPN soccer ends games as STATUS_FULL_TIME (not STATUS_FINAL), so also trust completed/state.
    const isFinished =
      e.status?.type?.completed === true ||
      statusState === 'post' ||
      statusType.includes('FINAL') ||
      statusType === 'STATUS_FULL_TIME';
    const isPostponed = statusType === 'STATUS_POSTPONED' || statusType === 'STATUS_CANCELED';
    const isLive =
      !isFinished &&
      !isPostponed &&
      (statusState === 'in' || statusType === 'STATUS_IN_PROGRESS' || statusType.includes('HALF'));

    const rawDate = new Date(e.date || Date.now());
    const hours = String(rawDate.getUTCHours()).padStart(2, '0');
    const mins = String(rawDate.getUTCMinutes()).padStart(2, '0');

    const homeName = home?.team?.displayName || home?.team?.name || 'Home Team';
    const awayName = away?.team?.displayName || away?.team?.name || 'Away Team';

    const homeAm = AMHARIC_TEAMS[homeName] || homeName;
    const awayAm = AMHARIC_TEAMS[awayName] || awayName;

    let leagueName = 'UEFA & International Soccer';
    let leagueFlag = '🌍';
    if (e.uid?.includes('uefa.nations') || e.uid?.includes('2395')) {
      leagueName = 'UEFA Nations League';
      leagueFlag = '🏆';
    } else if (e.uid?.includes('fifa') || e.uid?.includes('world')) {
      leagueName = 'World Cup Qualifiers';
      leagueFlag = '🌍';
    }

    return {
      id: `real-${e.id}`,
      homeTeam: homeName,
      awayTeam: awayName,
      homeTeamAm: homeAm,
      awayTeamAm: awayAm,
      leagueId: 'live-world-soccer',
      leagueName,
      leagueNameAm: leagueName === 'UEFA Nations League' ? 'ዩኤፋ ኔሽንስ ሊግ' : 'ዓለም አቀፍ የእግር ኳስ ጨዋታዎች',
      leagueFlag,
      kickoffTime: `${hours}:${mins}`,
      kickoffDate: 'today',
      status: isPostponed ? 'postponed' : isLive ? 'live' : isFinished ? 'finished' : 'upcoming',
      isLive,
      liveMinute: isLive ? (parseInt(e.status?.displayClock, 10) || 45) : undefined,
      homeScore: home?.score !== undefined ? Number(home.score) : 0,
      awayScore: away?.score !== undefined ? Number(away.score) : 0,
      odds: parseOdds(comp?.odds),
      moreMarketsCount: 52 + (idx % 20),
      isPopular: idx < 8,
    };
  });

  return parsedMatches;
}
