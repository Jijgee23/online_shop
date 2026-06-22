'use client';

import { UserRole } from '@/generated/prisma';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { requestForToken, initForegroundMessaging } from '@/lib/firebase/firebase';
import { AuthService } from '@/services/auth.service';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  googleId?: string | null;
  hasPassword?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean,
  isAuthenticated: boolean;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  registerOpen: boolean;
  openRegister: () => void;
  closeRegister: () => void;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (params: { name: string; email: string; phone: string; password: string; otpCode: string; otpVia: "email" | "phone" }) => Promise<boolean>;
  checkUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const router = useRouter()
  const isAdmin = user !== null && user.role === UserRole.ADMIN
  const openLogin = useCallback(() => { setRegisterOpen(false); setLoginOpen(true); }, []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);
  const openRegister = useCallback(() => { setLoginOpen(false); setRegisterOpen(true); }, []);
  const closeRegister = useCallback(() => setRegisterOpen(false), []);
  const checkUser = useCallback(async () => {
    setLoading(true);
    const data = await AuthService.checkUser().catch(() => null);
    setUser(data?.user || null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    checkUser();
    initForegroundMessaging(); // re-register onMessage after page refresh
  }, []);

  const askNotificationPermission = async () => {
    const fcmToken = await requestForToken();
    if (fcmToken) await AuthService.updateFcmToken(fcmToken);
  };

  const login = useCallback(async (identifier: string, password: string) => {
    setLoading(true);
    try {
      const data = await AuthService.login(identifier, password);
      setUser(data.user);

      if (typeof Notification === "undefined") return;

      if (Notification.permission === "granted") {
        // Already allowed — silently register token
        askNotificationPermission();
      } else if (Notification.permission === "default") {
        // Show custom prompt before native browser dialog
        toast(
          (t) => (
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔔</span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">Мэдэгдэл идэвхжүүлэх үү?</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Захиалгын мэдээлэл, урамшуулал хүлээн авна</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
                >
                  Болих
                </button>
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    askNotificationPermission();
                  }}
                  className="px-4 py-1.5 text-xs font-bold bg-teal-500 hover:bg-teal-400 text-white rounded-xl transition-colors"
                >
                  Зөвшөөрөх
                </button>
              </div>
            </div>
          ),
          { duration: 8000, style: { maxWidth: 340 } }
        );
      }
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

  const register = async (params: { name: string; email: string; phone: string; password: string; otpCode: string; otpVia: "email" | "phone" }): Promise<boolean> => {
    setLoading(true);
    try {
      await AuthService.register(params);
      toast.success("Бүртгэл амжилттай үүслээ, нэвтэрнэ үү");
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAdmin,
    isAuthenticated: !!user,
    loginOpen,
    openLogin,
    closeLogin,
    registerOpen,
    openRegister,
    closeRegister,
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
