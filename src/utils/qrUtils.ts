import { generateBookingSecurityHash } from './ticket';

export interface VerifiedQRPayload {
  valid: boolean;
  bookingCode: string;
  securityHash?: string;
  error?: string;
}

export function buildQRPayload(bookingCode: string): string {
  const hash = generateBookingSecurityHash(bookingCode);
  const payload = {
    iss: 'CHARTEBET_OFFICIAL',
    code: bookingCode,
    hash,
    ts: Date.now(),
  };
  try {
    return btoa(JSON.stringify(payload));
  } catch (e) {
    return `${bookingCode}#${hash}`;
  }
}

export function parseAndVerifyQRPayload(rawInput: string): VerifiedQRPayload {
  const text = rawInput.trim();
  if (!text) {
    return { valid: false, bookingCode: '', error: 'Empty scan payload.' };
  }

  // Case 1: Plain booking code (e.g. CC9768268)
  if (/^CC\d{7}$/i.test(text)) {
    return {
      valid: true,
      bookingCode: text.toUpperCase(),
      securityHash: generateBookingSecurityHash(text.toUpperCase()),
    };
  }

  // Case 2: Base64 JSON
  try {
    const decoded = atob(text);
    const parsed = JSON.parse(decoded);
    if (parsed.code && /^CC\d{7}$/i.test(parsed.code)) {
      return {
        valid: true,
        bookingCode: parsed.code.toUpperCase(),
        securityHash: parsed.hash || generateBookingSecurityHash(parsed.code.toUpperCase()),
      };
    }
  } catch (e) {
    // Ignore base64 parse failure
  }

  // Case 3: code#hash
  if (text.includes('#')) {
    const [c, h] = text.split('#');
    if (/^CC\d{7}$/i.test(c)) {
      return {
        valid: true,
        bookingCode: c.toUpperCase(),
        securityHash: h,
      };
    }
  }

  return {
    valid: false,
    bookingCode: '',
    error: 'Unrecognized barcode format or counterfeit QR code.',
  };
}

export function generateSVGQRCode(data: string, size = 140): string {
  // Simple clean SVG QR barcode representation
  let seed = 0;
  for (let i = 0; i < data.length; i++) {
    seed = (seed * 31 + data.charCodeAt(i)) % 1000000;
  }

  const gridSize = 21;
  const cellSize = size / gridSize;
  let rects = '';

  function pseudoRand() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Finder corners
      const isTopLeft = r < 7 && c < 7;
      const isTopRight = r < 7 && c >= gridSize - 7;
      const isBottomLeft = r >= gridSize - 7 && c < 7;

      let isBlack = false;
      if (isTopLeft) {
        isBlack = (r === 0 || r === 6 || c === 0 || c === 6) || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      } else if (isTopRight) {
        const localC = c - (gridSize - 7);
        isBlack = (r === 0 || r === 6 || localC === 0 || localC === 6) || (r >= 2 && r <= 4 && localC >= 2 && localC <= 4);
      } else if (isBottomLeft) {
        const localR = r - (gridSize - 7);
        isBlack = (localR === 0 || localR === 6 || c === 0 || c === 6) || (localR >= 2 && localR <= 4 && c >= 2 && c <= 4);
      } else {
        isBlack = pseudoRand() > 0.55;
      }

      if (isBlack) {
        rects += `<rect x="${(c * cellSize).toFixed(1)}" y="${(r * cellSize).toFixed(1)}" width="${cellSize.toFixed(1)}" height="${cellSize.toFixed(1)}" fill="#000000"/>`;
      }
    }
  }

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#ffffff"/>${rects}</svg>`;
}
