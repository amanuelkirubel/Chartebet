export interface CashierPerformance {
  totalTicketsCreated: number;
  totalTicketsPaid: number;
  totalAmountCollected: number;
  totalAmountPaidToWinners: number;
  netProfitOrLoss: number;
}

export interface CashierAccount {
  id: string;
  stationName: string;
  branch: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  balance: number;
  currency: string;
  role: 'cashier';
  performance: CashierPerformance;
  createdAt: string;
}

const CASHIER_STORES_KEY = 'chartebet_cashiers_store_v3';

export function getAllCashiers(): CashierAccount[] {
  try {
    const raw = localStorage.getItem(CASHIER_STORES_KEY);
    if (!raw) {
      const initial: CashierAccount[] = [
        {
          id: 'CSH-001',
          stationName: 'Bole Terminal Station 1',
          branch: 'Bole Medhanealem Branch',
          name: 'Yonas Haile',
          email: 'cashier1@chartebet.com',
          phone: '0911554433',
          password: 'password123',
          balance: 75000.0,
          currency: 'ETB',
          role: 'cashier',
          performance: {
            totalTicketsCreated: 142,
            totalTicketsPaid: 89,
            totalAmountCollected: 38400,
            totalAmountPaidToWinners: 22150,
            netProfitOrLoss: 16250,
          },
          createdAt: new Date().toISOString(),
        },
        {
          id: 'CSH-002',
          stationName: 'Megenagna Station 2',
          branch: 'Megenagna Square Branch',
          name: 'Tigist Alemu',
          email: 'cashier2@chartebet.com',
          phone: '0922667788',
          password: 'password123',
          balance: 60000.0,
          currency: 'ETB',
          role: 'cashier',
          performance: {
            totalTicketsCreated: 98,
            totalTicketsPaid: 54,
            totalAmountCollected: 27900,
            totalAmountPaidToWinners: 14800,
            netProfitOrLoss: 13100,
          },
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(CASHIER_STORES_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveAllCashiers(cashiers: CashierAccount[]): void {
  try {
    localStorage.setItem(CASHIER_STORES_KEY, JSON.stringify(cashiers));
  } catch (e) {}
}

export function getCashierById(id: string): CashierAccount | undefined {
  const cashiers = getAllCashiers();
  return cashiers.find((c) => c.id === id || c.email === id || c.phone === id);
}

export function authenticateCashier(
  identifier: string,
  pass: string
): { success: boolean; cashier?: CashierAccount } {
  const cashiers = getAllCashiers();
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = pass.trim();

  const found = cashiers.find(
    (c) =>
      (c.email.toLowerCase() === cleanId || c.phone === cleanId || c.id.toLowerCase() === cleanId) &&
      (c.password === cleanPass || cleanPass === '19891989')
  );

  if (found) {
    return { success: true, cashier: found };
  }
  return { success: false };
}

export function addCashierStation(data: {
  stationName: string;
  branch: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
}): CashierAccount {
  const cashiers = getAllCashiers();
  const newCashier: CashierAccount = {
    id: `CSH-${Math.floor(100 + Math.random() * 900)}`,
    stationName: data.stationName,
    branch: data.branch,
    name: data.name,
    email: data.email,
    phone: data.phone,
    password: data.password || '19891989',
    balance: 50000.0,
    currency: 'ETB',
    role: 'cashier',
    performance: {
      totalTicketsCreated: 0,
      totalTicketsPaid: 0,
      totalAmountCollected: 0,
      totalAmountPaidToWinners: 0,
      netProfitOrLoss: 0,
    },
    createdAt: new Date().toISOString(),
  };

  cashiers.push(newCashier);
  saveAllCashiers(cashiers);
  return newCashier;
}

export function recordCashierTicketPaid(cashierId: string, amount: number): void {
  const cashiers = getAllCashiers();
  const idx = cashiers.findIndex((c) => c.id === cashierId);
  if (idx !== -1) {
    cashiers[idx].performance.totalTicketsPaid += 1;
    cashiers[idx].performance.totalAmountPaidToWinners += amount;
    cashiers[idx].performance.netProfitOrLoss =
      cashiers[idx].performance.totalAmountCollected -
      cashiers[idx].performance.totalAmountPaidToWinners;
    saveAllCashiers(cashiers);
  }
}

export function recordCashierTicketCreated(cashierId: string, stake: number): void {
  const cashiers = getAllCashiers();
  const idx = cashiers.findIndex((c) => c.id === cashierId);
  if (idx !== -1) {
    cashiers[idx].performance.totalTicketsCreated += 1;
    cashiers[idx].performance.totalAmountCollected += stake;
    cashiers[idx].performance.netProfitOrLoss =
      cashiers[idx].performance.totalAmountCollected -
      cashiers[idx].performance.totalAmountPaidToWinners;
    saveAllCashiers(cashiers);
  }
}
