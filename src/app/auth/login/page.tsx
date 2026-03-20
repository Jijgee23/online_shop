"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/app/context/auth_context"
import { UserRole } from "@/generated/prisma"

export default function LoginPage() {
  const { login, error, loading, user } = useAuth();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  useEffect(() => {
    // if (user) {
    //   setEmail(user.email)
    // }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await login(email, password);
    if (!user) return
    if (user && user.role === UserRole.ADMIN) {
      router.push("/admin");
      return
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-950 px-4 overflow-hidden font-sans">

      {/* Background Animated Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse delay-700"></div>

      {/* Main Card */}
      <div className="relative w-full max-w-md z-10">
        <div className="bg-white/10 dark:bg-slate-900/50 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl shadow-2xl p-10">

          {/* Header */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-block mb-4">
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                IShop
              </h1>
            </Link>
            <h2 className="text-2xl font-bold text-white mb-2">Тавтай морилно уу</h2>
            <p className="text-slate-400 text-sm">
              Нэвтрэх мэдээллээ оруулна уу
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl mb-6 flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Form Fields */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Имэйл хаяг</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-teal-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Нууц үг</label>
                <Link href="/pages/resetPassword" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">Мартсан уу?</Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-teal-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input
                  type="password"
                  value={password} required
                  // onKeyDown={handleSubmit}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="relative w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
            >
              <span className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                Нэвтрэх
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </span>

              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </button>
          </form>

          {/* Social Login (Optional Decor) */}
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center px-2">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-500 font-medium">Эсвэл</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              Бүртгэлгүй юу?{" "}
              <Link
                href="/auth/register"
                className="text-teal-400 font-bold hover:text-teal-300 hover:underline transition-colors"
              >
                Бүртгүүлэх
              </Link>
            </p>
          </div>

        </div>

        {/* Footer info */}
        <p className="mt-8 text-center text-slate-500 text-xs tracking-widest uppercase">
          &copy; 2026 IShop Technology
        </p>
      </div>

    </div>
  )
}