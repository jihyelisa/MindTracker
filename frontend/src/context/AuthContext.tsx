import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '../types';
import { fetchDemoUser } from '../services/api';

interface AuthContextType {
  user: User | null;
  isDemo: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, isDemo: false, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auto-login as demo user on first visit
    const stored = localStorage.getItem('mindtracker_user');
    if (stored) {
      setUser(JSON.parse(stored));
      setLoading(false);
    } else {
      fetchDemoUser()
        .then(u => {
          setUser(u);
          localStorage.setItem('mindtracker_user', JSON.stringify(u));
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isDemo: user?.isDemo ?? false, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
