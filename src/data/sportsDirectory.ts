export interface League {
  id: string;
  name: string;
}

export interface Country {
  id: string;
  name: string;
  flag: string;
  leagues: League[];
}

export interface Continent {
  id: string;
  name: string;
  icon: string;
  countries: Country[];
}

export const continentsList: Continent[] = [
  {
    id: 'europe',
    name: 'Europe',
    icon: '🌍',
    countries: [
      {
        id: 'england',
        name: 'England',
        flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        leagues: [
          { id: 'premier-league', name: 'Premier League' },
          { id: 'championship', name: 'Championship' },
          { id: 'fa-cup', name: 'FA Cup' },
          { id: 'efl-cup', name: 'EFL Cup' },
        ],
      },
      {
        id: 'spain',
        name: 'Spain',
        flag: '🇪🇸',
        leagues: [
          { id: 'la-liga', name: 'La Liga' },
          { id: 'segunda-division', name: 'Segunda División' },
          { id: 'copa-del-rey', name: 'Copa del Rey' },
        ],
      },
      {
        id: 'italy',
        name: 'Italy',
        flag: '🇮🇹',
        leagues: [
          { id: 'serie-a', name: 'Serie A' },
          { id: 'serie-b', name: 'Serie B' },
          { id: 'coppa-italia', name: 'Coppa Italia' },
        ],
      },
      {
        id: 'germany',
        name: 'Germany',
        flag: '🇩🇪',
        leagues: [
          { id: 'bundesliga', name: 'Bundesliga' },
          { id: '2-bundesliga', name: '2. Bundesliga' },
          { id: 'dfb-pokal', name: 'DFB-Pokal' },
        ],
      },
      {
        id: 'france',
        name: 'France',
        flag: '🇫🇷',
        leagues: [
          { id: 'ligue-1', name: 'Ligue 1' },
          { id: 'ligue-2', name: 'Ligue 2' },
          { id: 'coupe-de-france', name: 'Coupe de France' },
        ],
      },
      {
        id: 'uefa',
        name: 'UEFA Tournaments',
        flag: '🏆',
        leagues: [
          { id: 'champions-league', name: 'UEFA Champions League' },
          { id: 'europa-league', name: 'UEFA Europa League' },
          { id: 'conference-league', name: 'UEFA Conference League' },
        ],
      },
    ],
  },
  {
    id: 'africa',
    name: 'Africa',
    icon: '🌍',
    countries: [
      {
        id: 'ethiopia',
        name: 'Ethiopia',
        flag: '🇪🇹',
        leagues: [
          { id: 'ethiopian-pl', name: 'Ethiopian Premier League' },
          { id: 'ethiopian-cup', name: 'Ethiopian Cup' },
        ],
      },
      {
        id: 'egypt',
        name: 'Egypt',
        flag: '🇪🇬',
        leagues: [
          { id: 'egypt-pl', name: 'Egyptian Premier League' },
          { id: 'egypt-cup', name: 'Egypt Cup' },
        ],
      },
      {
        id: 'south-africa',
        name: 'South Africa',
        flag: '🇿🇦',
        leagues: [
          { id: 'psl', name: 'Premier Soccer League' },
        ],
      },
      {
        id: 'caf',
        name: 'CAF Tournaments',
        flag: '🏆',
        leagues: [
          { id: 'caf-cl', name: 'CAF Champions League' },
          { id: 'caf-confed', name: 'CAF Confederation Cup' },
        ],
      },
    ],
  },
  {
    id: 'asia',
    name: 'Asia & Middle East',
    icon: '🌏',
    countries: [
      {
        id: 'saudi',
        name: 'Saudi Arabia',
        flag: '🇸🇦',
        leagues: [
          { id: 'saudi-pro-league', name: 'Saudi Pro League' },
          { id: 'kings-cup', name: "King's Cup" },
        ],
      },
      {
        id: 'japan',
        name: 'Japan',
        flag: '🇯🇵',
        leagues: [
          { id: 'j-league', name: 'J1 League' },
        ],
      },
    ],
  },
  {
    id: 'north-america',
    name: 'North America',
    icon: '🌎',
    countries: [
      {
        id: 'usa',
        name: 'USA',
        flag: '🇺🇸',
        leagues: [
          { id: 'mls', name: 'Major League Soccer (MLS)' },
          { id: 'us-open-cup', name: 'US Open Cup' },
        ],
      },
      {
        id: 'mexico',
        name: 'Mexico',
        flag: '🇲🇽',
        leagues: [
          { id: 'liga-mx', name: 'Liga MX' },
        ],
      },
    ],
  },
  {
    id: 'south-america',
    name: 'South America',
    icon: '🌎',
    countries: [
      {
        id: 'brazil',
        name: 'Brazil',
        flag: '🇧🇷',
        leagues: [
          { id: 'brasileirao', name: 'Brasileirão Série A' },
          { id: 'copa-do-brasil', name: 'Copa do Brasil' },
        ],
      },
      {
        id: 'argentina',
        name: 'Argentina',
        flag: '🇦🇷',
        leagues: [
          { id: 'primera-division', name: 'Primera División' },
        ],
      },
      {
        id: 'conmebol',
        name: 'CONMEBOL',
        flag: '🏆',
        leagues: [
          { id: 'copa-libertadores', name: 'Copa Libertadores' },
          { id: 'copa-sudamericana', name: 'Copa Sudamericana' },
        ],
      },
    ],
  },
  {
    id: 'oceania',
    name: 'Oceania',
    icon: '🌏',
    countries: [
      {
        id: 'australia',
        name: 'Australia',
        flag: '🇦🇺',
        leagues: [
          { id: 'a-league', name: 'A-League Men' },
        ],
      },
    ],
  },
  {
    id: 'antarctica',
    name: 'Global Tournaments',
    icon: '🌐',
    countries: [
      {
        id: 'fifa',
        name: 'FIFA World Stage',
        flag: '🌍',
        leagues: [
          { id: 'fifa-world-cup', name: 'FIFA World Cup' },
          { id: 'fifa-club-wc', name: 'FIFA Club World Cup' },
        ],
      },
    ],
  },
];
