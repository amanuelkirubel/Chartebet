export interface RegisteredUser {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  password: string;
  balance: number;
  currency: string;
  role: 'customer' | 'cashier' | 'admin';
  createdAt: string;
  updatedAt?: string;
}

const REGISTERED_USERS_KEY = 'chartebet_registered_users_store_v3';

export function normalizeIdentifier(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }
  // Remove non-digit characters for phone numbers
  return trimmed.replace(/\s+/g, '');
}

/**
 * Deduplicates and sanitizes user array so that each normalized email and phone
 * exists in at most ONE user record. If duplicate records exist, merges them into
 * the most recently updated record.
 */
function sanitizeUsersList(users: RegisteredUser[]): RegisteredUser[] {
  const byKey = new Map<string, RegisteredUser>();

  for (const u of users) {
    const emailKey = u.email ? normalizeIdentifier(u.email) : null;
    const phoneKey = u.phone ? normalizeIdentifier(u.phone) : null;
    const key = emailKey || phoneKey || u.id;

    if (!byKey.has(key)) {
      byKey.set(key, u);
    } else {
      // Merge into the newest or highest balance record
      const existing = byKey.get(key)!;
      const newest = (u.updatedAt || u.createdAt) > (existing.updatedAt || existing.createdAt) ? u : existing;
      const combinedBalance = Math.max(u.balance, existing.balance);
      byKey.set(key, {
        ...newest,
        balance: combinedBalance,
        // Ensure email and phone are normalized
        email: emailKey ? emailKey : newest.email,
        phone: phoneKey ? phoneKey : newest.phone,
      });
    }
  }

  return Array.from(byKey.values());
}

export function getAllRegisteredUsers(): RegisteredUser[] {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) {
      const initial: RegisteredUser[] = [
        {
          id: 'USR-881204',
          username: 'Dawit Bekele',
          email: 'dawit@example.com',
          phone: '0911223344',
          password: 'password123',
          balance: 1450.0,
          currency: 'ETB',
          role: 'customer',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
          id: 'USR-992105',
          username: 'Selam Tesfaye',
          email: 'selam@example.com',
          phone: '0922334455',
          password: 'password123',
          balance: 3200.5,
          currency: 'ETB',
          role: 'customer',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
      ];
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const sanitized = sanitizeUsersList(parsed);
      if (sanitized.length !== parsed.length) {
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(sanitized));
      }
      return sanitized;
    }
  } catch (e) {
    console.error('Failed to read registered users', e);
  }
  return [];
}

export function saveAllRegisteredUsers(users: RegisteredUser[]): void {
  try {
    const sanitized = sanitizeUsersList(users);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.error('Failed to save registered users', e);
  }
}

export function getUserByIdentifier(identifier: string): RegisteredUser | undefined {
  const clean = normalizeIdentifier(identifier);
  if (!clean) return undefined;
  const users = getAllRegisteredUsers();
  return users.find((u) => {
    const userEmail = u.email ? normalizeIdentifier(u.email) : '';
    const userPhone = u.phone ? normalizeIdentifier(u.phone) : '';
    return userEmail === clean || userPhone === clean || u.id === clean;
  });
}

export function registerNewUser(data: {
  identifier: string;
  username: string;
  password: string;
  currency?: string;
}): { success: boolean; user?: RegisteredUser; error?: string } {
  const cleanId = normalizeIdentifier(data.identifier);
  const cleanPass = data.password.trim();
  const cleanName = data.username.trim() || 'Player';

  if (!cleanId) {
    return { success: false, error: 'Please enter a valid phone number or email.' };
  }
  if (!cleanPass || cleanPass.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters.' };
  }

  const users = getAllRegisteredUsers();
  const isEmail = cleanId.includes('@');

  // Prevent multiple accounts with the same email or phone number
  const existing = users.find((u) => {
    const uEmail = u.email ? normalizeIdentifier(u.email) : '';
    const uPhone = u.phone ? normalizeIdentifier(u.phone) : '';
    return isEmail ? uEmail === cleanId : uPhone === cleanId;
  });

  if (existing) {
    return {
      success: false,
      error: isEmail
        ? 'An account with this email address already exists. Please sign in or change your password.'
        : 'An account with this phone number already exists. Please sign in or change your password.',
    };
  }

  const newUser: RegisteredUser = {
    id: `USR-${Math.floor(100000 + Math.random() * 900000)}`,
    username: cleanName,
    email: isEmail ? cleanId : undefined,
    phone: !isEmail ? cleanId : undefined,
    password: cleanPass,
    balance: 50.0, // Welcome signup bonus
    currency: data.currency || 'ETB',
    role: 'customer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveAllRegisteredUsers(users);

  return { success: true, user: newUser };
}

export function authenticateRegisteredUser(
  identifier: string,
  passwordAttempt: string
): { success: boolean; user?: RegisteredUser; error?: string } {
  const cleanId = normalizeIdentifier(identifier);
  const cleanPass = passwordAttempt.trim();

  if (!cleanId || !cleanPass) {
    return { success: false, error: 'Please enter your phone/email and password.' };
  }

  // Ensure database is clean of duplicates
  const users = getAllRegisteredUsers();
  const user = users.find((u) => {
    const userEmail = u.email ? normalizeIdentifier(u.email) : '';
    const userPhone = u.phone ? normalizeIdentifier(u.phone) : '';
    return userEmail === cleanId || userPhone === cleanId || u.id === cleanId;
  });

  if (!user) {
    return {
      success: false,
      error: 'Account not found. Please check your credentials or register a new account.',
    };
  }

  // Strictly check password - old passwords will NEVER be accepted
  if (user.password !== cleanPass) {
    return {
      success: false,
      error: 'Incorrect password. If you recently changed your password, please use your new password.',
    };
  }

  return { success: true, user };
}

/**
 * Updates password and purges any duplicate user records for the same email/phone
 * so only ONE account exists with ONLY the new password.
 */
export function updateRegisteredUserPassword(
  identifier: string,
  oldPasswordAttempt: string,
  newPassword: string
): { success: boolean; user?: RegisteredUser; error?: string } {
  const cleanId = normalizeIdentifier(identifier);
  const cleanOld = oldPasswordAttempt.trim();
  const cleanNew = newPassword.trim();

  if (!cleanId) {
    return { success: false, error: 'Please enter your phone number or email.' };
  }
  if (!cleanNew || cleanNew.length < 4) {
    return { success: false, error: 'New password must be at least 4 characters long.' };
  }

  const users = getAllRegisteredUsers();
  const isEmail = cleanId.includes('@');

  // Find user matching normalized identifier
  const userIndex = users.findIndex((u) => {
    const uEmail = u.email ? normalizeIdentifier(u.email) : '';
    const uPhone = u.phone ? normalizeIdentifier(u.phone) : '';
    return isEmail ? uEmail === cleanId : uPhone === cleanId;
  });

  if (userIndex === -1) {
    return { success: false, error: 'Account not found. Please register first.' };
  }

  const targetUser = users[userIndex];

  // Verify current password if provided
  if (cleanOld && targetUser.password !== cleanOld) {
    return { success: false, error: 'Current password is incorrect.' };
  }

  // Update target user's password
  targetUser.password = cleanNew;
  targetUser.updatedAt = new Date().toISOString();

  // Purge any and all duplicate records with the same email or phone from the array!
  const cleanedUsers = users.filter((u, idx) => {
    if (idx === userIndex) return true;
    const uEmail = u.email ? normalizeIdentifier(u.email) : '';
    const uPhone = u.phone ? normalizeIdentifier(u.phone) : '';
    const matchesEmail = isEmail && uEmail === cleanId;
    const matchesPhone = !isEmail && uPhone === cleanId;
    return !matchesEmail && !matchesPhone;
  });

  saveAllRegisteredUsers(cleanedUsers);

  return { success: true, user: targetUser };
}

export function updateUserBalanceInStore(userId: string, newBalance: number): void {
  const users = getAllRegisteredUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx !== -1) {
    users[idx].balance = Math.max(0, Number(newBalance.toFixed(2)));
    users[idx].updatedAt = new Date().toISOString();
    saveAllRegisteredUsers(users);
  }
}

export function adminAdjustBalance(
  userId: string,
  amount: number,
  type: 'add' | 'subtract'
): { success: boolean; newBalance?: number; error?: string } {
  const users = getAllRegisteredUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) {
    return { success: false, error: 'User not found.' };
  }

  const cur = users[idx].balance;
  const delta = Math.abs(amount);
  const updated = type === 'add' ? cur + delta : Math.max(0, cur - delta);

  users[idx].balance = Number(updated.toFixed(2));
  users[idx].updatedAt = new Date().toISOString();
  saveAllRegisteredUsers(users);

  return { success: true, newBalance: users[idx].balance };
}
