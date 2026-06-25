'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Customer } from '@/lib/types';
import {
  completeProfile,
  fetchMe,
  logoutApi,
  sendOtp,
  verifyOtp,
} from '@/lib/auth-api';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';

interface AuthContextValue {
  customer: Customer | null;
  token: string | null;
  hydrated: boolean;
  isAuthenticated: boolean;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  requestOtp: (mobile: string) => Promise<{ expiresIn: number; debugCode?: string }>;
  verifyOtpCode: (mobile: string, code: string) => Promise<boolean>;
  saveProfile: (data: { name: string; email?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { value: token, setValue: setToken, hydrated } = useLocalStorage<string | null>('arad-auth-token', null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (!hydrated || !token) {
      if (!token) {
        setCustomer(null);
      }
      return;
    }

    fetchMe(token)
      .then(({ customer: me }) => setCustomer(me))
      .catch(() => {
        setToken(null);
        setCustomer(null);
      });
  }, [hydrated, token, setToken]);

  const openLogin = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

  const requestOtp = useCallback(async (mobile: string) => {
    const result = await sendOtp(mobile);
    return {
      expiresIn: result.expires_in,
      debugCode: result.debug_code,
    };
  }, []);

  const verifyOtpCode = useCallback(async (mobile: string, code: string) => {
    const result = await verifyOtp(mobile, code);
    setToken(result.token);
    setCustomer(result.customer);

    if (result.customer.profile_complete) {
      setLoginOpen(false);
    }

    return result.customer.profile_complete;
  }, [setToken]);

  const saveProfile = useCallback(async (data: { name: string; email?: string }) => {
    if (!token) {
      throw new Error('لطفاً ابتدا وارد شوید.');
    }

    const result = await completeProfile(data, token);
    setCustomer(result.customer);
    setLoginOpen(false);
  }, [token]);

  const logout = useCallback(async () => {
    if (token) {
      try {
        await logoutApi(token);
      } catch {
        // ignore network errors on logout
      }
    }

    setToken(null);
    setCustomer(null);
  }, [token, setToken]);

  const value = useMemo(
    () => ({
      customer,
      token,
      hydrated,
      isAuthenticated: Boolean(token && customer),
      loginOpen,
      openLogin,
      closeLogin,
      requestOtp,
      verifyOtpCode,
      saveProfile,
      logout,
    }),
    [
      customer,
      token,
      hydrated,
      loginOpen,
      openLogin,
      closeLogin,
      requestOtp,
      verifyOtpCode,
      saveProfile,
      logout,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
