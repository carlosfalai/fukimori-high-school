import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from './queryClient';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: number;
  username: string;
  email: string | null;
  googleId: string | null;
  avatarUrl: string | null;
  pagesAvailable: number;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Check for existing session on mount
  useEffect(() => {
    // Skip authentication check for demo mode
    setLoading(false);
    setUser({
      id: 1,
      username: "demo",
      email: null,
      googleId: null,
      avatarUrl: null,
      pagesAvailable: 50,
      isAdmin: false
    });
  }, []);

  const checkAuth = async () => {
    // Demo mode - no authentication required
    setLoading(false);
  };

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }
      
      const data = await response.json();
      setUser(data.user);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${data.user.username}!`,
      });
    } catch (err) {
      setError(err as Error);
      toast({
        title: 'Login failed',
        description: (err as Error).message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/auth/logout');
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Logout failed');
      }
      
      setUser(null);
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
    } catch (err) {
      setError(err as Error);
      toast({
        title: 'Logout failed',
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}