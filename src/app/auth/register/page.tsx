"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/ui/Input"
import { useAuth } from "@/app/context/auth_context"
import { AuthService } from "@/app/context/services/auth_service"

export default function RegisterPage() {
  const { loading, register } = useAuth()
  const [step, setStep] = useState(1) // 1: Email, 2: Code & Info
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [otpLoading, setOtpLoading] = useState(false)
  const [error, setError] = useState("")

  // 1. Код илгээх функц
  const handleGetOtp = async () => {
    if (!email) return setError("Имэйл хаягаа оруулна уу")
    setOtpLoading(true)
    setError("")
    try {
      await AuthService.sendSignupOtp(email)
      setStep(2)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setOtpLoading(false)
    }
  }

  // 2. Эцсийн бүртгэл хийх функц
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== passwordConfirm) return setError("Нууц үг таарахгүй байна!")
    setError("")
    await register({ name, email, phone, password, otpCode })
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 overflow-hidden font-sans">
      <div className="absolute top-0 -right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] opacity-10 dark:opacity-20 animate-pulse delay-700"></div>
      <div className="absolute bottom-0 -left-20 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] opacity-10 dark:opacity-20 animate-pulse"></div>

      <div className="relative w-full max-w-lg z-10">
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-8 md:p-12 transition-all duration-500">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-teal-500 to-blue-500 dark:from-teal-400 dark:to-blue-400 bg-clip-text text-transparent mb-2">IShop</h1>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {step === 1 ? "Имэйл баталгаажуулах" : "Мэдээллээ бөглөнө үү"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {step === 1 ? "Танд 6 оронтой баталгаажуулах код очих болно." : `${email} хаяг руу илгээсэн кодыг оруулна уу.`}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl mb-6 flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}

          <div className="space-y-5">
            {step === 1 ? (
              /* --- Step 1: Email Input Only --- */
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase ml-1">Имэйл хаяг</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all outline-none"
                  placeholder="example@mail.com"
                />
                <button
                  onClick={handleGetOtp}
                  disabled={otpLoading}
                  className="w-full mt-4 bg-teal-500 hover:bg-teal-400 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-teal-500/20"
                >
                  {otpLoading ? "Илгээж байна..." : "Код авах"}
                </button>
              </div>
            ) : (
              /* --- Step 2: Full Info & OTP Code --- */
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-teal-400 uppercase ml-1">Баталгаажуулах код</label>

                  <Input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-teal-500/10 border-2 border-teal-500/30 rounded-2xl px-6 py-2 text-center text-2xl tracking-[10px] font-bold text-white focus:border-teal-500 outline-none transition-all"
                    placeholder="000000"
                  />
                </div>


                <Input
                  label="Бүтэн нэр"
                  placeholder="Таны нэр"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-2"
                  icon={<svg className="w-5 h-5" />} // Нэрний икон
                />

                <Input
                  label="Утас"
                  type="tel"
                  placeholder="99..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <Input
                  label="Нууц үг"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="col-span-2"
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>}
                />

                <Input
                  label="Нууц үг давтах"
                  type="password"
                  placeholder="••••••••"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="col-span-2"
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="col-span-2 mt-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? "Бүртгэж байна..." : "Бүртгэл дуусгах"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="col-span-2 text-xs text-slate-400 dark:text-slate-500 hover:text-teal-500 dark:hover:text-teal-400 underline"
                >
                  Имэйл хаяг солих
                </button>
              </form>
            )}
          </div>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center px-2">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 dark:text-slate-500 font-medium">Эсвэл</span>
            </div>
          </div>

          <a
            href="/api/auth/google"
            className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google-ээр бүртгүүлэх
          </a>

          <div className="mt-6 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Бүртгэлтэй юу?{" "}
              <Link href="/auth/login" className="text-teal-500 dark:text-teal-400 font-bold hover:underline">Нэвтрэх</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}