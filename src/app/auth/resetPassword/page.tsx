"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link" // Өмнө үүсгэсэн компонент
import { OtpType } from "@/generated/prisma"
import { Input } from "@/app/components/ui/Input"

export default function ResetPasswordPage() {
  const [step, setStep] = useState(1) // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const router = useRouter()

  // Алхам 1: OTP Код авах хүсэлт
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/getOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: 'FORGOT_PASSWORD' }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error)

      setStep(2)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Алхам 2: Код шалгаж, нууц үг солих
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) return setError("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой")

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode, newPassword }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Алдаа гарлаа")

      setSuccess(true)
      setTimeout(() => router.push("/auth/login"), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-950 px-4 overflow-hidden font-sans">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse delay-700"></div>

      <div className="relative w-full max-w-md z-10">
        <div className="bg-white/10 dark:bg-slate-900/50 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl shadow-2xl p-8 md:p-12">

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {success ? "Амжилттай!" : "Нууц үг сэргээх"}
            </h2>
            <p className="text-slate-400 text-sm">
              {success
                ? "Таны нууц үг амжилттай солигдлоо. Түр хүлээнэ үү..."
                : step === 1
                  ? "Бүртгэлтэй имэйл хаягаа оруулна уу."
                  : "Танд ирсэн код болон шинэ нууц үгээ оруулна уу."}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl mb-6 flex items-center gap-3 animate-shake">
              {error}
            </div>
          )}

          {!success && (
            step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <Input
                  label="Имэйл хаяг"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? "Илгээж байна..." : "Код авах"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <Input
                  label="Баталгаажуулах код"
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="000000"
                  className="text-center tracking-[10px] font-bold text-xl"
                />
                <Input
                  label="Шинэ нууц үг"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-500 text-white py-4 rounded-2xl font-bold hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
                >
                  {loading ? "Шинэчилж байна..." : "Нууц үг солих"}
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-xs text-slate-500 hover:text-white">
                  Имэйл хаяг солих
                </button>
              </form>
            )
          )}

          <div className="mt-8 text-center">
            <Link href="/auth/login" className="text-slate-400 hover:text-white text-sm flex items-center justify-center gap-2 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Буцах
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}