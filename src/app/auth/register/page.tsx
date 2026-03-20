"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()

  const handleSubmit = async () => {
    setLoading(true)
    setError("")

    if (!name || !email || !phone || !password) {
      setError("Бүх талбарыг бөглөнө үү")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      })

      const data = await res.json()
      setLoading(false)

      if (!res.ok) {
        setError(data.error || "Алдаа гарлаа")
        return
      }

      router.push("/auth/login")

    } catch (err) {
      setLoading(false)
      setError("Серверийн алдаа. Дахин оролдоно уу.")
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-950 px-4 overflow-hidden font-sans">
      
      {/* Background Orbs */}
      <div className="absolute top-0 -right-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse delay-700"></div>
      <div className="absolute bottom-0 -left-20 w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>

      <div className="relative w-full max-w-lg z-10">
        <div className="bg-white/10 dark:bg-slate-900/50 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl shadow-2xl p-8 md:p-12">
          
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-3">
               <h1 className="text-3xl font-extrabold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                IShop
              </h1>
            </Link>
            <h2 className="text-2xl font-bold text-white mb-2">Шинэ бүртгэл</h2>
            <p className="text-slate-400 text-sm">Та манай дэлгүүрт бүртгүүлснээр олон давуу тал авах болно.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl mb-6 flex items-center gap-3 animate-shake">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}  className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Name Input */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Бүтэн нэр</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-teal-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <input
                  type="text"
                  placeholder="Нэрээ энд оруулна уу"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Имэйл</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-teal-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <input
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Утасны дугаар</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-teal-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <input
                  type="tel"
                  placeholder="9911...."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Нууц үг</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-teal-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="md:col-span-2 mt-4 relative w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span className={loading ? 'opacity-0' : 'opacity-100 flex items-center justify-center gap-2'}>
                Бүртгүүлэх
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
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

          {/* Login link */}
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              Бүртгэлтэй юу?{" "}
              <Link
                href="/pages/login"
                className="text-teal-400 font-bold hover:text-teal-300 hover:underline transition-colors"
              >
                Нэвтрэх
              </Link>
            </p>
          </div>

        </div>
        
        <p className="mt-8 text-center text-slate-500 text-xs tracking-widest uppercase">
          &copy; 2026 IShop Technology
        </p>
      </div>
    </div>
  )
}