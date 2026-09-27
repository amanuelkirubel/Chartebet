export const PRIMARY_ADMIN_ACCOUNT = {
  email: 'chartecars9@gmail.com',
  phone: '0911998877',
  password: '19891989',
};

export const AUTHORIZED_ADMIN_EMAILS = [
  'chartecars9@gmail.com',
  'admin@chartebet.com',
  'Chartekirubel77@gmail.com',
  'chartekirubel77@gmail.com',
  'superadmin@chartebet.com',
  'amanuelkirubel9@gmail.com',
];

export const AUTHORIZED_ADMIN_PHONES = [
  '0911998877',
  '0911223344',
  '0977889900',
  '0911234567',
];

export const VALID_ADMIN_PASSWORDS = [
  '19891989',
  '@Charte2000',
  'Charte2026',
];

export function generateTicketId(): string {
  const chars = '0123456789';
  let numPart = '';
  for (let i = 0; i < 7; i++) {
    numPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CC${numPart}`;
}

export function generateBookingSecurityHash(code: string): string {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    const char = code.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `SEC-CB-${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}`;
}
