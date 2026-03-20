'use client';

import { UserRole } from '@/generated/prisma';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter  } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole,
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean,
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  error: string | ''
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("")
  const router = useRouter()
  const isAdmin = user?.role == UserRole.ADMIN
  const checkUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || "Имэйл эсвэл нууц үг буруу байна")
        throw new Error('Login failed');
      }
      setUser(data.user)
    } catch (err) {
      console.log(err)
      alert(err)
      setError("Сервертэй холбогдоход алдаа гарлаа.")
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });

      setUser(null);
      router.push('/')
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const userData = await response.json();
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAdmin,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
