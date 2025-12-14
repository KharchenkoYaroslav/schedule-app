import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useVerifyQuery } from '../hooks/useAuthQueries';
import { UserRole } from '../api/types/enums/user-role.enum';
import { QueryObserverResult } from '@tanstack/react-query';
import { VerifyResponse } from '../api/types/auth/verify.response';
import { AxiosError } from 'axios';

interface AuthSession {
  accessToken: string;
  refreshToken: string;
  role: UserRole;
}

interface AuthContextType {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: AuthSession) => void;
  logout: () => void;
  refetchSession: () => Promise<QueryObserverResult<VerifyResponse, Error>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const initialToken = localStorage.getItem('token');

  const [token, setToken] = useState<string | null>(() => {
    return initialToken;
  });

  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState<boolean>(!initialToken);

  const {
    data: verifiedData,
    isLoading: isVerifying,
    isError,
    error,
    refetch: refetchSession
  } = useVerifyQuery(token || '');

  useEffect(() => {
    if (!isVerifying && token) {
      setIsInitialLoadComplete(true);
    } else if (!token) {
      setIsInitialLoadComplete(true);
    }
  }, [isVerifying, token]);

  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    if (verifiedData && token) {
      setSession({
        accessToken: token,
        refreshToken: localStorage.getItem('refreshToken') || '',
        role: verifiedData.role
      });
    }
  }, [verifiedData, token]);

  useEffect(() => {
    if (isError && (error as AxiosError)?.response?.status === 401) {
      console.warn('[AuthProvider] 401 Unauthorized detected during verification. Logging out.');
      logout();
    }
  }, [isError, error]);

  const login = (data: AuthSession) => {
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setToken(data.accessToken);
    setSession(data);
  };

  const logout = () => {
    setSession(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  const isLoading = !!token && !isInitialLoadComplete;

  return (
    <AuthContext.Provider value={{ session, isAuthenticated: !!session, isLoading, login, logout, refetchSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
