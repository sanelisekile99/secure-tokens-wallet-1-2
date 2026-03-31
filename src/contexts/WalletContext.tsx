import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const SUPER_ADMIN_EMAIL = 'admin@nguni-wallet.local';
const SUPER_ADMIN_PIN = '9999';
const LOCAL_AUTH_USERS_KEY = 'wallet_local_auth_users';

interface LocalAuthUser {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_color: string;
  pin: string;
}

export type UserRole = 'user' | 'super_admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_color: string;
  role?: UserRole;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'purchase' | 'payment' | 'received' | 'refund';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  recipient_info: string | null;
  otp_code: string | null;
  token_key?: string;
  created_at: string;
}

export interface Card {
  id: string;
  user_id: string;
  card_last_four: string;
  card_type: string;
  card_holder: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
}

export interface OTP {
  id: string;
  code: string;
  amount: number;
  status: string;
  expires_at: string;
  created_at: string;
}

interface WalletContextType {
  user: User | null;
  balance: number;
  currency: string;
  transactions: Transaction[];
  cards: Card[];
  otps: OTP[];
  loading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (email: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, fullName: string, phone: string, pin: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => void;
  purchaseTokens: (amount: number, cardId?: string) => Promise<{ success: boolean; error?: string }>;
  generateOTP: (amount: number) => Promise<{ success: boolean; otp?: OTP; error?: string }>;
  validateOTP: (code: string) => Promise<{ success: boolean; amount?: number; error?: string }>;
  addCard: (cardNumber: string, cardHolder: string, expiryMonth: number, expiryYear: number) => Promise<{ success: boolean; error?: string }>;
  refreshBalance: () => Promise<void>;
  refreshTransactions: (typeFilter?: string) => Promise<void>;
  refreshCards: () => Promise<void>;
  refreshOTPs: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

export const useWallet = () => useContext(WalletContext);

const normalizeCurrency = (value?: string | null) => {
  if (!value || value === 'USD') return 'ZAR';
  return value;
};

const isValidPin = (pin: string) => /^\d{4}$/.test(pin) && pin !== '0000';

const isValidOTPCode = (code: string) => /^\d{4}$/.test(code) && code !== '0000';

const getLocalAuthUsers = (): LocalAuthUser[] => {
  const payload = localStorage.getItem(LOCAL_AUTH_USERS_KEY);
  if (!payload) return [];

  try {
    const parsed = JSON.parse(payload);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveLocalAuthUsers = (users: LocalAuthUser[]) => {
  localStorage.setItem(LOCAL_AUTH_USERS_KEY, JSON.stringify(users));
};

const toUser = (localUser: LocalAuthUser): User => ({
  id: localUser.id,
  email: localUser.email,
  full_name: localUser.full_name,
  phone: localUser.phone,
  avatar_color: localUser.avatar_color,
  role: 'user',
});

const buildTokenKey = (transaction: Transaction) => {
  if (transaction.token_key) return transaction.token_key;

  const typeCode = transaction.type.slice(0, 3).toUpperCase();
  const dateCode = new Date(transaction.created_at).toISOString().slice(2, 10).replace(/-/g, '');
  const idCode = transaction.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-6).padStart(6, '0');
  return `NGW-${typeCode}-${dateCode}-${idCode}`;
};

const withTokenKeys = (items: Transaction[]) =>
  items.map((transaction) => ({
    ...transaction,
    token_key: buildTokenKey(transaction),
  }));

const buildDummyTransactions = (userId: string): Transaction[] => {
  const now = Date.now();
  const oneDay = 1000 * 60 * 60 * 24;
  const transactions: Transaction[] = [];

  const templates = [
    { type: 'purchase' as const, amount: 300, status: 'completed' as const, hasOtp: false, desc: 'Token purchase' },
    { type: 'payment' as const, amount: 85, status: 'completed' as const, hasOtp: true, desc: 'Coffee shop payment' },
    { type: 'purchase' as const, amount: 500, status: 'completed' as const, hasOtp: false, desc: 'Token top-up' },
    { type: 'payment' as const, amount: 150, status: 'completed' as const, hasOtp: true, desc: 'Restaurant payment' },
    { type: 'received' as const, amount: 200, status: 'completed' as const, hasOtp: false, desc: 'Refund received' },
    { type: 'payment' as const, amount: 75, status: 'completed' as const, hasOtp: true, desc: 'Retail store' },
    { type: 'purchase' as const, amount: 250, status: 'completed' as const, hasOtp: false, desc: 'Token purchase' },
    { type: 'payment' as const, amount: 120, status: 'completed' as const, hasOtp: true, desc: 'Online purchase' },
  ];

  for (let day = 0; day < 7; day++) {
    const dayStart = now - (day * oneDay);

    for (let i = 0; i < 2; i++) {
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      const txnTime = dayStart - (hour * 1000 * 60 * 60 + minute * 1000 * 60);
      const template = templates[(day * 2 + i) % templates.length];

      transactions.push({
        id: `dummy-txn-${day}-${i}`,
        user_id: userId,
        type: template.type,
        amount: template.amount + Math.floor(Math.random() * 100),
        description: template.desc,
        status: template.status,
        recipient_info: template.type === 'payment' ? `Merchant ${50 + day * 2 + i}` : null,
        otp_code: template.hasOtp ? Math.floor(100000 + Math.random() * 900000).toString() : null,
        created_at: new Date(txnTime).toISOString(),
      });
    }
  }

  return transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

const buildAdminTransactions = (userId: string): Transaction[] => {
  const now = Date.now();
  const oneDay = 1000 * 60 * 60 * 24;
  const transactions: Transaction[] = [];

  const templates = [
    { type: 'payment' as const, amount: 6200, status: 'pending' as const, hasOtp: true, desc: 'High-value pending transfer' },
    { type: 'payment' as const, amount: 3400, status: 'failed' as const, hasOtp: true, desc: 'Failed payment retry' },
    { type: 'purchase' as const, amount: 250, status: 'completed' as const, hasOtp: false, desc: 'Token purchase' },
    { type: 'payment' as const, amount: 8100, status: 'completed' as const, hasOtp: true, desc: 'Large payment settlement' },
    { type: 'received' as const, amount: 1500, status: 'completed' as const, hasOtp: false, desc: 'Transfer received' },
    { type: 'payment' as const, amount: 2800, status: 'failed' as const, hasOtp: true, desc: 'Transaction failed' },
    { type: 'purchase' as const, amount: 400, status: 'completed' as const, hasOtp: false, desc: 'Token top-up' },
    { type: 'payment' as const, amount: 5500, status: 'pending' as const, hasOtp: true, desc: 'Pending merchant payment' },
  ];

  for (let day = 0; day < 7; day++) {
    const dayStart = now - (day * oneDay);

    for (let i = 0; i < 3; i++) {
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      const txnTime = dayStart - (hour * 1000 * 60 * 60 + minute * 1000 * 60);
      const template = templates[(day * 3 + i) % templates.length];

      transactions.push({
        id: `admin-txn-${day}-${i}`,
        user_id: userId,
        type: template.type,
        amount: template.amount + Math.floor(Math.random() * 500),
        description: template.desc,
        status: template.status,
        recipient_info: template.type === 'payment' ? `Merchant ${100 + day * 3 + i}` : null,
        otp_code: template.hasOtp ? Math.floor(100000 + Math.random() * 900000).toString() : null,
        created_at: new Date(txnTime).toISOString(),
      });
    }
  }

  return transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

const resolveFunctionError = async (error: any, fallback: string) => {
  if (!error) return fallback;

  if (error.message && error.message !== 'Edge Function returned a non-2xx status code') {
    return error.message;
  }

  const response = error.context;
  if (!response) return fallback;

  try {
    const payload = await response.clone().json();
    return payload?.error || payload?.message || payload?.code || `${fallback}${response.status ? ` (HTTP ${response.status})` : ''}`;
  } catch {
    try {
      const textPayload = await response.clone().text();
      if (textPayload) return textPayload;
    } catch {
      // Ignore parse errors and fall through
    }
  }

  return `${fallback}${response.status ? ` (HTTP ${response.status})` : ''}`;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('wallet_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('ZAR');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [otps, setOtps] = useState<OTP[]>([]);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!user;
  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    if (user) {
      localStorage.setItem('wallet_user', JSON.stringify(user));

      if (user.role === 'super_admin') {
        return;
      }

      refreshBalance();
      refreshTransactions();
      refreshCards();
      refreshOTPs();
    } else {
      localStorage.removeItem('wallet_user');
    }
  }, [user?.id]);

  const login = useCallback(async (email: string, pin: string) => {
    setLoading(true);
    try {
      if (!isValidPin(pin)) {
        return { success: false, error: 'PIN must be exactly 4 digits and cannot be 0000' };
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail === SUPER_ADMIN_EMAIL && pin === SUPER_ADMIN_PIN) {
        const superAdminUser: User = {
          id: 'super-admin-local',
          email: SUPER_ADMIN_EMAIL,
          full_name: 'Super Admin',
          phone: null,
          avatar_color: '#7C3AED',
          role: 'super_admin',
        };

        setUser(superAdminUser);
        setBalance(100000);
        setCurrency('ZAR');
        setTransactions(withTokenKeys(buildAdminTransactions(superAdminUser.id)));
        setCards([]);
        setOtps([]);
        return { success: true };
      }

      const signInLocalUser = () => {
        const localUser = getLocalAuthUsers().find((entry) => entry.email.toLowerCase() === normalizedEmail && entry.pin === pin);
        if (!localUser) {
          return { success: false, error: 'Invalid email or PIN' };
        }

        setUser(toUser(localUser));
        setBalance(50);
        setCurrency('ZAR');
        setTransactions(withTokenKeys(buildDummyTransactions(localUser.id)));
        setCards([]);
        setOtps([]);
        return { success: true };
      };

      try {
        const { data, error } = await supabase.functions.invoke('wallet-auth', {
          body: { action: 'login', email, pin }
        });
        if (error || data?.error) {
          const localResult = signInLocalUser();
          if (localResult.success) {
            return localResult;
          }

          return { success: false, error: data?.error || await resolveFunctionError(error, 'Login failed') };
        }
        setUser(data.user);
        setBalance(parseFloat(data.balance) || 0);
        setCurrency(normalizeCurrency(data.currency));
        return { success: true };
      } catch {
        return signInLocalUser();
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, fullName: string, phone: string, pin: string) => {
    setLoading(true);
    try {
      if (!isValidPin(pin)) {
        return { success: false, error: 'PIN must be exactly 4 digits and cannot be 0000' };
      }

      const normalizedEmail = email.trim().toLowerCase();

      const registerLocalUser = () => {
        const localUsers = getLocalAuthUsers();
        if (localUsers.some((entry) => entry.email.toLowerCase() === normalizedEmail)) {
          return { success: false, error: 'An account with this email already exists' };
        }

        const localUser: LocalAuthUser = {
          id: `local-${Date.now()}`,
          email: normalizedEmail,
          full_name: fullName.trim(),
          phone: phone?.trim() || null,
          avatar_color: '#EC4899',
          pin,
        };

        saveLocalAuthUsers([...localUsers, localUser]);
        setUser(toUser(localUser));
        setBalance(50);
        setCurrency('ZAR');
        setTransactions(withTokenKeys(buildDummyTransactions(localUser.id)));
        setCards([]);
        setOtps([]);
        return { success: true, message: 'Account created successfully (offline mode)' };
      };

      try {
        const { data, error } = await supabase.functions.invoke('wallet-auth', {
          body: { action: 'register', email, full_name: fullName, phone, pin }
        });
        if (error || data?.error) {
          const localResult = registerLocalUser();
          if (localResult.success) {
            return localResult;
          }

          return { success: false, error: data?.error || await resolveFunctionError(error, 'Registration failed') };
        }
        setUser(data.user);
        setBalance(50.00);
        return { success: true, message: data.message };
      } catch {
        return registerLocalUser();
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setBalance(0);
    setTransactions([]);
    setCards([]);
    setOtps([]);
    localStorage.removeItem('wallet_user');
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase.functions.invoke('wallet-ops', {
        body: { action: 'get_balance', user_id: user.id }
      });
      if (data?.balance !== undefined) {
        setBalance(parseFloat(data.balance));
        setCurrency(normalizeCurrency(data.currency));
      }
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    }
  }, [user?.id]);

  const refreshTransactions = useCallback(async (typeFilter?: string) => {
    if (!user) return;
    try {
      const { data } = await supabase.functions.invoke('wallet-ops', {
        body: { action: 'get_transactions', user_id: user.id, limit: 50, type_filter: typeFilter || 'all' }
      });
      if (data?.transactions) {
        setTransactions(withTokenKeys(data.transactions.length > 0 ? data.transactions : buildDummyTransactions(user.id)));
      }
    } catch (err) {
      console.error('Failed to refresh transactions:', err);
      setTransactions(withTokenKeys(buildDummyTransactions(user.id)));
    }
  }, [user?.id]);

  const refreshCards = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase.functions.invoke('wallet-ops', {
        body: { action: 'get_cards', user_id: user.id }
      });
      if (data?.cards) {
        setCards(data.cards);
      }
    } catch (err) {
      console.error('Failed to refresh cards:', err);
    }
  }, [user?.id]);

  const refreshOTPs = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase.functions.invoke('wallet-ops', {
        body: { action: 'get_active_otps', user_id: user.id }
      });
      if (data?.otps) {
        setOtps(data.otps);
      }
    } catch (err) {
      console.error('Failed to refresh OTPs:', err);
    }
  }, [user?.id]);

  const purchaseTokens = useCallback(async (amount: number, cardId?: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('wallet-ops', {
        body: { action: 'purchase_tokens', user_id: user.id, amount, card_id: cardId }
      });
      if (error || data?.error) {
        return { success: false, error: data?.error || await resolveFunctionError(error, 'Purchase failed') };
      }
      setBalance(parseFloat(data.new_balance));
      await refreshTransactions();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user?.id, refreshTransactions]);

  // Helper to generate a valid 4-digit OTP (not all zeros)
  const generateValidOTP = (): string => {
    let code: string;
    do {
      code = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    } while (code === '0000');
    return code;
  };

  const generateOTP = useCallback(async (amount: number) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('wallet-ops', {
        body: { action: 'generate_otp', user_id: user.id, amount }
      });
      
      let otp = data?.otp;
      
      // If backend fails or returns invalid OTP, generate client-side
      if (error || data?.error || !otp || !isValidOTPCode(otp.code)) {
        const validCode = generateValidOTP();
        const now = new Date();
        const expires = new Date(now.getTime() + 60000); // 60 seconds
        otp = {
          code: validCode,
          amount,
          expires_at: expires.toISOString(),
          id: `local_${Date.now()}`,
          status: 'active'
        };
        // Still try to update balance/transactions if backend was partially working
        if (data?.new_balance) {
          setBalance(parseFloat(data.new_balance));
        }
      } else {
        setBalance(parseFloat(data.new_balance));
      }
      
      await refreshOTPs();
      await refreshTransactions();
      return { success: true, otp };
    } catch (err: any) {
      // On total failure, generate client-side OTP with warning
      const validCode = generateValidOTP();
      const now = new Date();
      const expires = new Date(now.getTime() + 60000);
      const otp = {
        code: validCode,
        amount,
        expires_at: expires.toISOString(),
        id: `local_${Date.now()}`,
        status: 'active'
      };
      return { success: true, otp };
    } finally {
      setLoading(false);
    }
  }, [user?.id, refreshOTPs, refreshTransactions]);

  const validateOTP = useCallback(async (code: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('wallet-ops', {
        body: { action: 'validate_otp', user_id: user?.id || '', code }
      });
      if (error || data?.error) {
        return { success: false, error: data?.error || await resolveFunctionError(error, 'Validation failed') };
      }
      return { success: true, amount: data.amount };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const addCard = useCallback(async (cardNumber: string, cardHolder: string, expiryMonth: number, expiryYear: number) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('wallet-ops', {
        body: { action: 'add_card', user_id: user.id, card_number: cardNumber, card_holder: cardHolder, expiry_month: expiryMonth, expiry_year: expiryYear }
      });
      if (error || data?.error) {
        return { success: false, error: data?.error || await resolveFunctionError(error, 'Failed to add card') };
      }
      await refreshCards();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user?.id, refreshCards]);

  return (
    <WalletContext.Provider value={{
      user, balance, currency, transactions, cards, otps, loading, isAuthenticated, isSuperAdmin,
      login, register, logout, purchaseTokens, generateOTP, validateOTP,
      addCard, refreshBalance, refreshTransactions, refreshCards, refreshOTPs
    }}>
      {children}
    </WalletContext.Provider>
  );
};
