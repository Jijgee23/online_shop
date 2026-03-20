"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const router = useRouter()

  const handleResetRequest = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    // Энд таны API дуудлага хийгдэнэ
    try {
      // Жишээ: const res = await fetch("/api/auth/reset-request", { ... })
      
      // Түр зуур simulate хийвэл:
      setTimeout(() => {
        setLoading(false)
        setSuccess(true)
      }, 1500)
      
    } catch (err) {
      setLoading(false)
      setError("Алдаа гарлаа. Та дараа дахин оролдоно уу.")
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-950 px-4 overflow-hidden font-sans">
      
      {/* Background Animated Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse delay-700"></div>

      <div className="relative w-full max-w-md z-10">
        <div className="bg-white/10 dark:bg-slate-900/50 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl shadow-2xl p-8 md:p-12">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-teal-500/30 text-teal-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Нууц үг сэргээх</h2>
            <p className="text-slate-400 text-sm">
              Бүртгэлтэй имэйл хаягаа оруулна уу. Бид танд нууц үг сэргээх линк илгээх болно.
            </p>
          </div>

          {success ? (
            /* Success State */
            <div className="text-center animate-fade-in">
              <div className="bg-teal-500/10 border border-teal-500/20 text-teal-400 p-4 rounded-2xl mb-8">
                <p className="font-medium">Амжилттай! Имэйлээ шалгана уу.</p>
              </div>
              <Link href="/pages/login">
                <button className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-700 transition-all">
                  Нэвтрэх хуудас руу буцах
                </button>
              </Link>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleResetRequest} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl flex items-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Имэйл хаяг</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-teal-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <svg className="animate-spin h-6 w-6 mx-auto text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  "Линк илгээх"
                )}
              </button>
            </form>
          )}

          <div className="mt-10 text-center">
            <Link
              href="/pages/login"
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Буцах
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}