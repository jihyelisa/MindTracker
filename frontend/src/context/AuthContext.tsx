import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchDemoUser, login as apiLogin, register as apiRegister } from '../services/api';
import type { User, LoginRequest, RegisterRequest } from '../types';

interface AuthContextType {
  user: User | null;
  isDemo: boolean;
  loading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  loginDemo: () => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  isDemo: false, 
  loading: true,
  login: async () => {},
  loginDemo: async () => {},
  register: async () => {},
  logout: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('mindtracker_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (payload: LoginRequest) => {
    setLoading(true);
    try {
      const u = await apiLogin(payload);
      setUser(u);
      localStorage.setItem('mindtracker_user', JSON.stringify(u));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async () => {
    setLoading(true);
    try {
      const u = await fetchDemoUser();
      setUser(u);
      localStorage.setItem('mindtracker_user', JSON.stringify(u));
    } catch (error) {
      console.error('Demo login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterRequest) => {
    setLoading(true);
    try {
      const u = await apiRegister(payload);
      setUser(u);
      localStorage.setItem('mindtracker_user', JSON.stringify(u));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mindtracker_user');
  };

  return (
    <AuthContext.Provider value={{ user, isDemo: user?.isDemo ?? false, loading, login, loginDemo, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
