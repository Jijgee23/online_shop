"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/ui/Input"
import { AuthService } from "@/services/auth.service"

export default function ResetPasswordPage() {
  const [step, setStep] = useState(1)
  const [via, setVia] = useState<"email" | "phone">("phone")
  const [identifier, setIdentifier] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const switchVia = (v: "email" | "phone") => {
    setVia(v)
    setIdentifier("")
    setError("")
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier) return setError(via === "phone" ? "Утасны дугаараа оруулна уу" : "Имэйл хаягаа оруулна уу")
    setLoading(true)
    setError("")
    try {
      await AuthService.sendResetOtp(identifier, via)
      setStep(2)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) return setError("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой")
    setLoading(true)
    setError("")
    try {
      const params = via === "phone"
        ? { phone: identifier, otpCode, newPassword }
        : { email: identifier, otpCode, newPassword }
      await AuthService.resetPassword(params)
      setSuccess(true)
      setTimeout(() => router.push("/auth/login"), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 overflow-hidden font-sans">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] opacity-10 dark:opacity-20 animate-pulse" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] opacity-10 dark:opacity-20 animate-pulse delay-700" />

      <div className="relative w-full max-w-md z-10">
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-8 md:p-12">

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {success ? "Амжилттай!" : "Нууц үг сэргээх"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {success
                ? "Таны нууц үг амжилттай солигдлоо. Түр хүлээнэ үү..."
                : step === 1
                  ? "Бүртгэлтэй имэйл эсвэл утасны дугаараа оруулна уу."
                  : via === "phone"
                    ? <><span className="font-semibold text-slate-700 dark:text-slate-300">{identifier}</span> дугаар руу илгээсэн кодыг оруулна уу.</>
                    : <><span className="font-semibold text-slate-700 dark:text-slate-300">{identifier}</span> хаяг руу илгээсэн кодыг оруулна уу.</>
              }
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl mb-6 flex items-center gap-3">
              {error}
            </div>
          )}

          {!success && (
            step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                {/* Toggle */}
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
                  <button
                    type="button"
                    onClick={() => switchVia("phone")}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${via === "phone" ? "bg-white dark:bg-slate-700 text-teal-500 shadow-sm" : "text-slate-400 dark:text-slate-500"}`}
                  >
                    Утасны дугаар
                  </button>
                  <button
                    type="button"
                    onClick={() => switchVia("email")}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${via === "email" ? "bg-white dark:bg-slate-700 text-teal-500 shadow-sm" : "text-slate-400 dark:text-slate-500"}`}
                  >
                    Имэйл
                  </button>
                </div>

                <Input
                  label={via === "phone" ? "Утасны дугаар" : "Имэйл хаяг"}
                  type={via === "phone" ? "tel" : "email"}
                  required
                  maxLength={via == "phone" ? 8 : 50}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={via === "phone" ? "99001234" : "name@example.com"}
                  icon={via === "email"
                    ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  }
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
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
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
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtpCode(""); setError("") }}
                  className="w-full text-xs text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  {via === "phone" ? "Утасны дугаар солих" : "Имэйл хаяг солих"}
                </button>
              </form>
            )
          )}

          <div className="mt-8 text-center">
            <Link href="/auth/login" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm flex items-center justify-center gap-2 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Буцах
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
