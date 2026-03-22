import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_color: string;
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

  useEffect(() => {
    if (user) {
      localStorage.setItem('wallet_user', JSON.stringify(user));
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
      const { data, error } = await supabase.functions.invoke('wallet-auth', {
        body: { action: 'login', email, pin }
      });
      if (error || data?.error) {
        return { success: false, error: data?.error || await resolveFunctionError(error, 'Login failed') };
      }
      setUser(data.user);
      setBalance(parseFloat(data.balance) || 0);
      setCurrency(normalizeCurrency(data.currency));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, fullName: string, phone: string, pin: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('wallet-auth', {
        body: { action: 'register', email, full_name: fullName, phone, pin }
      });
      if (error || data?.error) {
        return { success: false, error: data?.error || await resolveFunctionError(error, 'Registration failed') };
      }
      setUser(data.user);
      setBalance(50.00);
      return { success: true, message: data.message };
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
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error('Failed to refresh transactions:', err);
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

  const generateOTP = useCallback(async (amount: number) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('wallet-ops', {
        body: { action: 'generate_otp', user_id: user.id, amount }
      });
      if (error || data?.error) {
        return { success: false, error: data?.error || await resolveFunctionError(error, 'OTP generation failed') };
      }
      setBalance(parseFloat(data.new_balance));
      await refreshOTPs();
      await refreshTransactions();
      return { success: true, otp: data.otp };
    } catch (err: any) {
      return { success: false, error: err.message };
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
      user, balance, currency, transactions, cards, otps, loading, isAuthenticated,
      login, register, logout, purchaseTokens, generateOTP, validateOTP,
      addCard, refreshBalance, refreshTransactions, refreshCards, refreshOTPs
    }}>
      {children}
    </WalletContext.Provider>
  );
};
