import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useVerifyQuery } from '../hooks/useAuthQueries';
import { UserRole } from '../api/types/enums/user-role.enum';
import { QueryObserverResult } from '@tanstack/react-query';
import { VerifyResponse } from '../api/types/auth/verify.response';

interface AuthSession {
  token: string;
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
  const [token, setToken] = useState<string | null>(() => initialToken);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState<boolean>(!initialToken);

  const {
    data: verifiedData,
    isLoading: isVerifying,
    isError,
    refetch: refetchSession
  } = useVerifyQuery(token || '');

  useEffect(() => {
    if (!isVerifying && !isInitialLoadComplete && !!token) {
      setIsInitialLoadComplete(true);
    }
  }, [isVerifying, isInitialLoadComplete, token]);

  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    if (verifiedData && token) {
      setSession({
        token: token,
        role: verifiedData.role
      });
    }
  }, [verifiedData, token]);

  useEffect(() => {
    if (isError) {
      logout();
    }
  }, [isError]);

  const login = (data: AuthSession) => {
    setSession(data);
    setToken(data.token);
    localStorage.setItem('token', data.token);
  };

  const logout = () => {
    setSession(null);
    setToken(null);
    localStorage.removeItem('token');
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
