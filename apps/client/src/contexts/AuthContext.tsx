import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios.js';

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Teacher' | 'Parent';
  children?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
  }>;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  const { data, isLoading: isUserLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/auth/me');
        return data.user;
      } catch (error) {
        return null;
      }
    },
    retry: false,
  });

  useEffect(() => {
    if (!isUserLoading) {
      setUser(data || null);
      setIsLoading(false);
    }
  }, [data, isUserLoading]);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
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
