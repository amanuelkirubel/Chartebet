import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  User, 
  ArrowRight,
  KeyRound
} from 'lucide-react';
import { UserAccount, Language } from '../types';
import { 
  PRIMARY_ADMIN_ACCOUNT,
  AUTHORIZED_ADMIN_EMAILS, 
  AUTHORIZED_ADMIN_PHONES
} from '../utils/ticket';
import { authenticateCashier } from '../utils/cashierStore';
import { 
  registerNewUser, 
  authenticateRegisteredUser, 
  updateRegisteredUserPassword, 
  normalizeIdentifier 
} from '../utils/userStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  currentLang: Language;
}

const SAVED_LOGIN_CREDENTIALS_KEY = 'chartebet_saved_quick_login_v3';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentLang,
}) => {
  type AuthMode = 'login' | 'register' | 'change_password';
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [currency, setCurrency] = useState<'ETB' | 'USD' | 'EUR'>('ETB');

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);

      try {
        const saved = localStorage.getItem(SAVED_LOGIN_CREDENTIALS_KEY);
        if (saved) {
          const creds = JSON.parse(saved);
          if (creds.identifier) setIdentifier(creds.identifier);
          if (creds.password) setPassword(creds.password);
        }
      } catch (e) {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const cleanId = normalizeIdentifier(identifier);
    const cleanPass = password.trim();

    if (!cleanId) {
      setIsLoading(false);
      setErrorMsg(
        currentLang === 'am'
          ? 'እባክዎ ስልክ ቁጥር ወይም ኢሜይል ያስገቡ።'
          : 'Please enter your phone number or email.'
      );
      return;
    }

    if (!cleanPass) {
      setIsLoading(false);
      setErrorMsg(
        currentLang === 'am'
          ? 'እባክዎ የይለፍ ቃል ያስገቡ።'
          : 'Please enter your password.'
      );
      return;
    }

    setTimeout(() => {
      // 1. Password change mode (Requirement 5: clean password change without duplicate accounts)
      if (authMode === 'change_password') {
        const cleanNew = newPassword.trim();
        if (!cleanNew) {
          setIsLoading(false);
          setErrorMsg(currentLang === 'am' ? 'እባክዎ አዲሱን የይለፍ ቃል ያስገቡ።' : 'Please enter your new password.');
          return;
        }

        const updateRes = updateRegisteredUserPassword(cleanId, cleanPass, cleanNew);
        if (!updateRes.success || !updateRes.user) {
          setIsLoading(false);
          setErrorMsg(updateRes.error || 'Failed to update password.');
          return;
        }

        const regUser = updateRes.user;
        const customerUser: UserAccount = {
          id: regUser.id,
          username: regUser.username,
          email: cleanId.includes('@') ? cleanId : undefined,
          phone: !cleanId.includes('@') ? cleanId : undefined,
          balance: regUser.balance,
          currency: regUser.currency,
          isLoggedIn: true,
          role: 'customer',
        };

        if (rememberMe) {
          try {
            localStorage.setItem(SAVED_LOGIN_CREDENTIALS_KEY, JSON.stringify({ identifier: cleanId, password: cleanNew }));
          } catch (e) {}
        }

        setSuccessMsg(
          currentLang === 'am'
            ? 'የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል! ወደ ተመሳሳይ አካውንትዎ ገብተዋል።'
            : 'Password updated successfully! Previous password deactivated; signed into your account.'
        );

        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess(customerUser);
          onClose();
        }, 600);
        return;
      }

      // 2. Admin Accounts Check
      const isPrimaryAdmin =
        (cleanId === PRIMARY_ADMIN_ACCOUNT.email.toLowerCase() || cleanId === PRIMARY_ADMIN_ACCOUNT.phone) &&
        (cleanPass === PRIMARY_ADMIN_ACCOUNT.password || cleanPass === '@Charte2000');

      const isAdditionalAdminEmail = AUTHORIZED_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === cleanId);
      const isAdditionalAdminPhone = AUTHORIZED_ADMIN_PHONES.includes(cleanId);
      const isAdditionalAdmin = (isAdditionalAdminEmail || isAdditionalAdminPhone) &&
        (cleanPass === '19891989' || cleanPass === '@Charte2000' || cleanPass === 'Charte2026');

      if (isPrimaryAdmin || isAdditionalAdmin) {
        const adminUser: UserAccount = {
          id: `ADM-${cleanId.replace(/[^a-zA-Z0-9]/g, '_')}`,
          username: isPrimaryAdmin ? 'Primary Administrator' : cleanId.split('@')[0] || 'Administrator',
          email: cleanId.includes('@') ? cleanId : PRIMARY_ADMIN_ACCOUNT.email,
          phone: !cleanId.includes('@') ? cleanId : PRIMARY_ADMIN_ACCOUNT.phone,
          balance: 250000.0,
          currency: 'ETB',
          isLoggedIn: true,
          role: 'admin',
        };

        if (rememberMe) {
          try {
            localStorage.setItem(SAVED_LOGIN_CREDENTIALS_KEY, JSON.stringify({ identifier: cleanId, password: cleanPass }));
          } catch (e) {}
        }

        setSuccessMsg(
          currentLang === 'am'
            ? 'እንደ ዋና አስተዳዳሪ (Admin) በተሳካ ሁኔታ ገብተዋል!'
            : 'Signed in successfully as Administrator!'
        );

        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess(adminUser);
          onClose();
        }, 600);
        return;
      }

      // 3. Cashier Account check
      const cashierAuth = authenticateCashier(cleanId, cleanPass);
      if (cashierAuth.success && cashierAuth.cashier) {
        const csh = cashierAuth.cashier;
        const cashierUser: UserAccount = {
          id: csh.id,
          username: csh.name,
          email: csh.email,
          phone: csh.phone,
          balance: 50000.0,
          currency: 'ETB',
          isLoggedIn: true,
          role: 'cashier',
        };

        if (rememberMe) {
          try {
            localStorage.setItem(SAVED_LOGIN_CREDENTIALS_KEY, JSON.stringify({ identifier: cleanId, password: cleanPass }));
          } catch (e) {}
        }

        setSuccessMsg(
          currentLang === 'am'
            ? `እንደ ካሼር [${csh.name}] በተሳካ ሁኔታ ገብተዋል!`
            : `Signed in successfully as Cashier [${csh.name}]!`
        );

        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess(cashierUser);
          onClose();
        }, 600);
        return;
      }

      // 4. Regular Customer: REGISTER MODE
      if (authMode === 'register') {
        const regRes = registerNewUser({
          identifier: cleanId,
          username: username.trim(),
          password: cleanPass,
          currency,
        });

        if (!regRes.success || !regRes.user) {
          setIsLoading(false);
          setErrorMsg(regRes.error || 'Registration failed.');
          return;
        }

        const newUser = regRes.user;
        const customerUser: UserAccount = {
          id: newUser.id,
          username: newUser.username,
          email: cleanId.includes('@') ? cleanId : undefined,
          phone: !cleanId.includes('@') ? cleanId : undefined,
          balance: newUser.balance,
          currency: newUser.currency,
          isLoggedIn: true,
          role: 'customer',
        };

        if (rememberMe) {
          try {
            localStorage.setItem(SAVED_LOGIN_CREDENTIALS_KEY, JSON.stringify({ identifier: cleanId, password: cleanPass }));
          } catch (e) {}
        }

        setSuccessMsg(
          currentLang === 'am'
            ? 'አካውንትዎ በተሳካ ሁኔታ ተፈጥሯል! እንኳን ደህና መጡ!'
            : 'Account registered successfully! Welcome to Chartebet.'
        );

        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess(customerUser);
          onClose();
        }, 600);
        return;
      }

      // 5. Regular Customer: SIGN IN MODE
      const authRes = authenticateRegisteredUser(cleanId, cleanPass);
      if (!authRes.success || !authRes.user) {
        setIsLoading(false);
        setErrorMsg(
          authRes.error || (currentLang === 'am' ? 'የተሳሳተ የይለፍ ቃል ወይም ስልክ/ኢሜይል!' : 'Invalid password or identifier!')
        );
        return;
      }

      const verifiedUser = authRes.user;
      const customerUser: UserAccount = {
        id: verifiedUser.id,
        username: verifiedUser.username,
        email: cleanId.includes('@') ? cleanId : undefined,
        phone: !cleanId.includes('@') ? cleanId : undefined,
        balance: verifiedUser.balance,
        currency: verifiedUser.currency,
        isLoggedIn: true,
        role: 'customer',
      };

      if (rememberMe) {
        try {
          localStorage.setItem(SAVED_LOGIN_CREDENTIALS_KEY, JSON.stringify({ identifier: cleanId, password: cleanPass }));
        } catch (e) {}
      }

      setSuccessMsg(
        currentLang === 'am'
          ? 'በተሳካ ሁኔታ ገብተዋል!'
          : 'Signed in successfully!'
      );

      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(customerUser);
        onClose();
      }, 600);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#151c28] text-white rounded-2xl max-w-md w-full border border-slate-700/80 shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-base">
              C
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {authMode === 'register'
                  ? currentLang === 'am'
                    ? 'አዲስ አካውንት ይፍጠሩ'
                    : 'Create Your Account'
                  : authMode === 'change_password'
                    ? currentLang === 'am'
                      ? 'የአካውንት ይለፍ ቃል ይቀይሩ'
                      : 'Change Account Password'
                    : currentLang === 'am'
                      ? 'ወደ አካውንትዎ ይግቡ'
                      : 'Sign In to Chartebet'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {authMode === 'change_password'
                  ? 'Update registered account credentials'
                  : 'Phone number or Email authentication'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          <div className="grid grid-cols-3 bg-[#0e131d] p-1 rounded-xl border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                authMode === 'login' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{currentLang === 'am' ? 'ግባ' : 'Sign In'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                authMode === 'register' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{currentLang === 'am' ? 'ተመዝገብ' : 'Register'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('change_password');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                authMode === 'change_password' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3 h-3" />
              <span>{currentLang === 'am' ? 'ይለፍ ቃል' : 'Change Pass'}</span>
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-500/80 rounded-xl text-red-200 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/80 rounded-xl text-emerald-200 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex-1">
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authMode === 'register' && (
              <div className="p-3 bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-emerald-500/20 border border-amber-500/40 rounded-xl flex items-center gap-2.5">
                <span className="text-xl">🎁</span>
                <div>
                  <div className="font-bold text-xs text-yellow-300">
                    {currentLang === 'am' ? 'የ20 ብር ጅማሮ ቦነስ (20 ETB Bonus)!' : '20 ETB Free Welcome Bonus!'}
                  </div>
                  <div className="text-[10px] text-slate-300">
                    {currentLang === 'am'
                      ? 'እያንዳንዱ አዲስ አካውንት በ20 ብር ነጻ ቦነስ ይጀምራል!'
                      : 'Every new account starts with a 20 ETB instant bonus upon registration.'}
                  </div>
                </div>
              </div>
            )}

            {authMode === 'register' && (
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  {currentLang === 'am' ? 'ሙሉ ስም / የተጠቃሚ ስም' : 'Full Name / Username'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={currentLang === 'am' ? 'ለምሳሌ፡ አበበ ከበደ' : 'e.g. Abebe Kebede'}
                    className="w-full bg-[#0e131d] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                {currentLang === 'am' ? 'ስልክ ቁጥር ወይም ኢሜይል' : 'Phone Number or Email'}
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="09... or email@example.com"
                  className="w-full bg-[#0e131d] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-300">
                  {authMode === 'change_password'
                    ? currentLang === 'am' ? 'የአሁን የይለፍ ቃል' : 'Current Password'
                    : currentLang === 'am' ? 'የይለፍ ቃል' : 'Password'}
                </label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('change_password');
                      setErrorMsg(null);
                    }}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                  >
                    Change Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0e131d] border border-slate-700 rounded-xl pl-9 pr-10 py-2 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authMode === 'change_password' && (
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  {currentLang === 'am' ? 'አዲስ የይለፍ ቃል' : 'New Password'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-[#0e131d] border border-emerald-500/50 rounded-xl pl-9 pr-10 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px]">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Save credentials for fast future login</span>
              </label>
            </div>

            {authMode === 'register' && (
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Currency</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ETB', 'USD', 'EUR'] as const).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setCurrency(curr)}
                      className={`py-1.5 rounded-xl font-bold border text-xs transition cursor-pointer ${
                        currency === curr
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-[#0e131d] border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
            >
              <span>
                {isLoading
                  ? 'Authenticating...'
                  : authMode === 'register'
                    ? 'Complete Registration'
                    : authMode === 'change_password'
                      ? 'Update Password & Sign In'
                      : 'Sign In'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
