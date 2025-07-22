import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
  familyId?: string | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name || null,
        email: session.user.email || null,
        role: session.user.role || 'user',
        familyId: session.user.familyId || null,
      });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [session, status]);

  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      throw new Error(result.error);
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
