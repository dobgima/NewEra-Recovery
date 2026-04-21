import { useEffect, useState } from 'react';
import { clearAuth, loadAuth, saveAuth } from '@/lib/storage';
import { 
  login as apiLogin, 
  register as apiRegister,
  forgotPassword as apiForgotPassword,
  resetPassword as apiResetPassword,
  setupTwoFactor as apiSetupTwoFactor,
  verifyTwoFactorSetup as apiVerifyTwoFactorSetup,
  verifyTwoFactorLogin as apiVerifyTwoFactorLogin,
} from '@/lib/api';
import type { AuthState, AuthUser } from '@/types/auth';

export function useAuth() {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(false);

  useEffect(() => {
    const stored = loadAuth();
    if (stored) {
      setAuth(stored);
    }
  }, []);

  const buildAuth = (tokens: { accessToken: string; refreshToken: string }, user: AuthUser) => {
    const nextAuth: AuthState = {
      ...tokens,
      user
    };
    saveAuth(nextAuth);
    setAuth(nextAuth);
  };

  const login = async (payload: { email: string; password: string }) => {
    setLoadingAuth(true);
    try {
      const response = await apiLogin(payload);
      
      // Handle 2FA redirect
      if (response.requiresTwoFactor && response.twoFactorToken) {
        return {
          requiresTwoFactor: true,
          twoFactorToken: response.twoFactorToken,
        };
      }

      // Normal login
      if (response.tokens && response.user) {
        buildAuth(response.tokens, response.user);
      }
      return response;
    } finally {
      setLoadingAuth(false);
    }
  };

  const register = async (payload: { firstName: string; lastName: string; email: string; password: string }) => {
    setLoadingAuth(true);
    try {
      const response = await apiRegister(payload);
      buildAuth(response.tokens, response.user);
      return response;
    } finally {
      setLoadingAuth(false);
    }
  };

  const logout = async () => {
    try {
      const token = auth?.accessToken;
      if (token) {
        await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      clearAuth();
      setAuth(null);
    }
  };

  // Password Recovery
  const forgotPassword = async (email: string) => {
    setLoadingAuth(true);
    try {
      return await apiForgotPassword({ email });
    } finally {
      setLoadingAuth(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    setLoadingAuth(true);
    try {
      return await apiResetPassword({ token, password });
    } finally {
      setLoadingAuth(false);
    }
  };

  // 2FA
  const setupTwoFactor = async (method: 'email' | 'sms') => {
    setLoadingAuth(true);
    try {
      if (!auth?.accessToken) throw new Error('Not authenticated');
      return await apiSetupTwoFactor(auth.accessToken, { method });
    } finally {
      setLoadingAuth(false);
    }
  };

  const verifyTwoFactorSetup = async (token: string, code: string) => {
    setLoadingAuth(true);
    try {
      if (!auth?.accessToken) throw new Error('Not authenticated');
      return await apiVerifyTwoFactorSetup(auth.accessToken, { token, code });
    } finally {
      setLoadingAuth(false);
    }
  };

  const verifyTwoFactorLogin = async (twoFactorToken: string, code: string) => {
    setLoadingAuth(true);
    try {
      const response = await apiVerifyTwoFactorLogin({ twoFactorToken, code });
      buildAuth(response.tokens, response.user);
      return response;
    } finally {
      setLoadingAuth(false);
    }
  };

  return {
    auth,
    login,
    register,
    logout,
    loadingAuth,
    // Password Recovery
    forgotPassword,
    resetPassword,
    // 2FA
    setupTwoFactor,
    verifyTwoFactorSetup,
    verifyTwoFactorLogin,
  };
}
