import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore, User } from '../store/useAuthStore';

interface AuthContextType {
  user: User | null;
  businessId: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (payload?: { email?: string; name?: string; googleId?: string; idToken?: string }) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    businessName: string,
    otp?: string,
    autoLogin?: boolean
  ) => Promise<any>;
  logout: () => void;
  setActiveBusiness: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    user,
    businessId,
    loading,
    isAuthenticated,
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    setActiveBusiness,
    checkAuth,
  } = useAuthStore();

  useEffect(() => {
    // Initial silent token validation on app mount
    if (localStorage.getItem('accessToken')) {
      checkAuth();
    }
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        businessId,
        loading,
        isAuthenticated,
        error,
        login,
        loginWithGoogle,
        register,
        logout,
        setActiveBusiness,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Fallback: If used outside AuthProvider, return Zustand store directly
    const store = useAuthStore.getState();
    return {
      user: store.user,
      businessId: store.businessId,
      loading: store.loading,
      isAuthenticated: store.isAuthenticated,
      error: store.error,
      login: store.login,
      loginWithGoogle: store.loginWithGoogle,
      register: store.register,
      logout: store.logout,
      setActiveBusiness: store.setActiveBusiness,
    };
  }
  return ctx;
};

export default AuthContext;
