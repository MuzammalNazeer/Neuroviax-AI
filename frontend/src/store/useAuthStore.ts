import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Membership {
  business: {
    _id: string;
    name: string;
    industry?: string;
    subscriptionPlan?: string;
  };
  role: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  isActive?: boolean;
  isSuperAdmin?: boolean;
  role?: string;
  lastLoginAt?: string;
  memberships: Membership[];
  currentPlan?: 'FREE' | 'BASIC' | 'PRO' | string;
  subscriptionStatus?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid' | string;
  subscriptionId?: string;
  subscriptionEndDate?: string;
  stripeCustomerId?: string;
}

const SUPER_ADMIN_EMAILS = [
  'nazeermuzammal174@gmail.com',
  'admin@neuroviax.ai',
  'nazirmuzammal281@gmail.com',
  'nazeermuzammal1744@gmail.com',
  'nazirmuzammal28@gmail.com',
];

export const isUserSuperAdmin = (user: User | null): boolean => {
  if (!user) return false;
  if (user.isSuperAdmin === true) return true;
  const role = (user.role || '').toLowerCase();
  if (role === 'super_admin' || role === 'superadmin' || role === 'admin') return true;
  const email = (user.email || '').toLowerCase().trim();
  return SUPER_ADMIN_EMAILS.includes(email);
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  businessId: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (payload?: { email?: string; name?: string; googleId?: string; idToken?: string }) => Promise<void>;
  sendSignupOTP: (name: string, email: string) => Promise<{ message: string; _devOTP?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    businessName: string,
    otp?: string,
    autoLogin?: boolean
  ) => Promise<any>;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setUser: (user: User) => void;
  setActiveBusiness: (businessId: string) => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      businessId: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      clearError: () => set({ error: null }),

      setTokens: (accessToken: string, refreshToken?: string) => {
        // Sync to localStorage for synchronous axios interceptors & external tabs
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        set((state) => ({
          accessToken,
          refreshToken: refreshToken ?? state.refreshToken,
          isAuthenticated: true,
        }));
      },

      setUser: (user: User) => {
        localStorage.setItem('user', JSON.stringify(user));
        if (user.email) {
          localStorage.setItem('lastEmail', user.email);
        }
        set({ user });
      },

      setActiveBusiness: (businessId: string) => {
        localStorage.setItem('businessId', businessId);
        set({ businessId });
      },

      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/login`, {
            email,
            password,
          });

          const { user, accessToken, refreshToken, business } = data;

          // Normalize active business ID
          const rawBusiness = business?._id || user?.memberships?.[0]?.business;
          const activeBizId = rawBusiness?._id
            ? rawBusiness._id.toString()
            : rawBusiness?.toString?.() ?? null;

          // Sync tokens and session storage
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
          if (user?.email) localStorage.setItem('lastEmail', user.email);
          if (activeBizId) localStorage.setItem('businessId', activeBizId);

          set({
            user,
            accessToken,
            refreshToken,
            businessId: activeBizId,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
        } catch (err: any) {
          const msg =
            err.response?.data?.message || 'Login failed. Please verify your credentials.';
          set({ error: msg, loading: false, isAuthenticated: false });
          throw err;
        }
      },

      loginWithGoogle: async (payload = {}) => {
        set({ loading: true, error: null });
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/google`, payload);
          const { user, accessToken, refreshToken, business } = data;

          const rawBusiness = business?._id || user?.memberships?.[0]?.business;
          const activeBizId = rawBusiness?._id
            ? rawBusiness._id.toString()
            : rawBusiness?.toString?.() ?? null;

          localStorage.setItem('accessToken', accessToken);
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
          if (user?.email) localStorage.setItem('lastEmail', user.email);
          if (activeBizId) localStorage.setItem('businessId', activeBizId);

          set({
            user,
            accessToken,
            refreshToken,
            businessId: activeBizId,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
        } catch (err: any) {
          const msg =
            err.response?.data?.message || 'Google SSO login failed. Please try again.';
          set({ error: msg, loading: false, isAuthenticated: false });
          throw err;
        }
      },

      sendSignupOTP: async (name: string, email: string) => {
        set({ loading: true, error: null });
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/register-send-otp`, {
            name,
            email,
          });
          set({ loading: false });
          return data;
        } catch (err: any) {
          const msg =
            err.response?.data?.message || 'Failed to dispatch verification code. Please check your email.';
          set({ error: msg, loading: false });
          throw err;
        }
      },

      register: async (
        name: string,
        email: string,
        password: string,
        businessName: string,
        otp?: string,
        autoLogin = true
      ) => {
        set({ loading: true, error: null });
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/register`, {
            name,
            email,
            password,
            businessName,
            otp,
          });

          if (autoLogin) {
            const { user, accessToken, refreshToken, business } = data;
            const bizId = business?._id?.toString() || null;

            localStorage.setItem('accessToken', accessToken);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));
            if (user?.email) localStorage.setItem('lastEmail', user.email);
            if (bizId) localStorage.setItem('businessId', bizId);

            set({
              user,
              accessToken,
              refreshToken,
              businessId: bizId,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
          } else {
            set({ loading: false });
          }
          return data;
        } catch (err: any) {
          const msg =
            err.response?.data?.message || 'Registration failed. Please check your inputs.';
          set({ error: msg, loading: false });
          throw err;
        }
      },

      logout: () => {
        // Clear all persistent security tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('businessId');

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          businessId: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });

        // Redirect safely
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      },

      checkAuth: async () => {
        const token = get().accessToken || localStorage.getItem('accessToken');
        if (!token) {
          get().logout();
          return;
        }

        try {
          const { data } = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ user: data, isAuthenticated: true });
        } catch {
          // Token expired or invalid, let interceptor handle or logout
          console.warn('[useAuthStore] checkAuth verification failed');
        }
      },
    }),
    {
      name: 'neuroviax-auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        businessId: state.businessId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
