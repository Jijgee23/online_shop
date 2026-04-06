'use client';

import { UserRole } from '@/generated/prisma';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { requestForToken } from '@/lib/firebase/firebase';
import { AuthService } from '@/app/context/services/auth_service';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  googleId?: string | null;
  password?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean,
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (params: { name: string; email: string; phone: string; password: string; otpCode: string }) => Promise<void>;
  checkUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter()
  const isAdmin = user !== null && user.role === UserRole.ADMIN
  const checkUser = useCallback(async () => {
    setLoading(true);
    const data = await AuthService.checkUser().catch(() => null);
    setUser(data?.user || null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    checkUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await AuthService.login({ email, password });
      setUser(data.user);
      const fcmToken = await requestForToken();
      if (fcmToken) await AuthService.updateFcmToken(fcmToken);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const register = async (params: { name: string; email: string; phone: string; password: string; otpCode: string }) => {
    setLoading(true);
    try {
      await AuthService.register(params);
      toast.success("Бүртгэл амжилттай үүслээ, нэвтэрнэ үү");
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(err.message);
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
    checkUser
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
