"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Input } from "@/ui/Input"
import { useAuth } from "@/app/context/auth_context"
import { AuthService } from "@/services/auth.service"

const OTP_SECONDS = 5 * 60
const OTP_KEY = "signupOtpSession"

type OtpSession = {
  otpVia: "email" | "phone"
  identifier: string
  sentAt: number
  name?: string
  email?: string
  phone?: string
  otpCode?: string
}

const loadOtpSession = (): OtpSession | null => {
  try {
    const raw = sessionStorage.getItem(OTP_KEY)
    return raw ? (JSON.parse(raw) as OtpSession) : null
  } catch { return null }
}
const saveOtpSession = (s: OtpSession) => {
  try { sessionStorage.setItem(OTP_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}
const clearOtpSession = () => {
  try { sessionStorage.removeItem(OTP_KEY) } catch { /* ignore */ }
}

interface RegisterFormProps {
  /** Called when an internal navigation link is clicked (e.g. to close a modal). */
  onNavigate?: () => void
  /** Called after a successful registration. */
  onSuccess?: () => void
  /** If provided, the "Нэвтрэх" link becomes a button calling this (e.g. switch to login modal). */
  onLoginLink?: () => void
}

export function RegisterForm({ onNavigate, onSuccess, onLoginLink }: RegisterFormProps) {
  const { loading, register } = useAuth()
  const [step, setStep] = useState(1)
  const [otpVia, setOtpVia] = useState<"email" | "phone">("phone")
  const [identifier, setIdentifier] = useState("") // email or phone depending on otpVia
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [otpLoading, setOtpLoading] = useState(false)
  const [error, setError] = useState("")

  const [secondsLeft, setSecondsLeft] = useState(OTP_SECONDS)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = (from: number = OTP_SECONDS) => {
    if (timerRef.current) clearInterval(timerRef.current)
    setSecondsLeft(from)
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { clearInterval(timerRef.current!); return 0 }
        return s - 1
      })
    }, 1000)
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  // Dialog дахин нээгдэхэд: өмнө илгээсэн OTP хүчинтэй бол 2-р алхмыг сэргээнэ
  useEffect(() => {
    const s = loadOtpSession()
    if (!s) return
    const remaining = OTP_SECONDS - Math.floor((Date.now() - s.sentAt) / 1000)
    if (remaining <= 0) { clearOtpSession(); return }
    setOtpVia(s.otpVia)
    setIdentifier(s.identifier)
    if (s.otpVia === "phone") { setPhone(s.identifier); setEmail(s.email ?? "") }
    else { setEmail(s.identifier); setPhone(s.phone ?? "") }
    setName(s.name ?? "")
    setOtpCode(s.otpCode ?? "")
    setStep(2)
    startTimer(remaining)
  }, [])

  // 2-р алхамд байх үед бөглөсөн талбаруудыг (нууц үгээс бусад) session-д хадгална
  useEffect(() => {
    if (step !== 2) return
    const s = loadOtpSession()
    if (!s) return
    saveOtpSession({
      ...s,
      name,
      otpCode,
      email: otpVia === "phone" ? email : s.email,
      phone: otpVia === "email" ? phone : s.phone,
    })
  }, [step, name, otpCode, email, phone, otpVia])

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  const handleGetOtp = async () => {
    if (!identifier) return setError(otpVia === "phone" ? "Утасны дугаараа оруулна уу" : "Имэйл хаягаа оруулна уу")
    setOtpLoading(true)
    setError("")
    try {
      await AuthService.sendSignupOtp(identifier, otpVia)
      // pre-fill the field we collected
      if (otpVia === "phone") setPhone(identifier)
      else setEmail(identifier)
      saveOtpSession({ otpVia, identifier, sentAt: Date.now() })
      setStep(2)
      startTimer()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResend = async () => {
    setOtpLoading(true)
    setError("")
    setOtpCode("")
    try {
      await AuthService.sendSignupOtp(identifier, otpVia)
      saveOtpSession({ otpVia, identifier, sentAt: Date.now(), name })
      startTimer()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setOtpLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== passwordConfirm) return setError("Нууц үг таарахгүй байна!")
    const finalEmail = otpVia === "email" ? identifier : email
    const finalPhone = otpVia === "phone" ? identifier : phone
    setError("")
    const ok = await register({ name, email: finalEmail, phone: finalPhone, password, otpCode, otpVia })
    if (ok) { clearOtpSession(); onSuccess?.() }
  }

  const handleBack = () => {
    setStep(1)
    setOtpCode("")
    setError("")
    clearOtpSession()
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const switchVia = (v: "email" | "phone") => {
    setOtpVia(v)
    setIdentifier("")
    setError("")
    clearOtpSession()
  }

  return (
    <>
      <p className="-mt-4 mb-6 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        {step === 1 ? "Баталгаажуулалтын арга сонгох" : "Мэдээллээ бөглөнө үү"}
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs p-4 rounded-xl mb-6 flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {step === 1 ? (
        <div className="space-y-4">
          {/* Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-full p-1">
            <button
              onClick={() => switchVia("phone")}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${otpVia === "phone" ? "bg-white dark:bg-slate-700 text-cyan-500 shadow-sm" : "text-slate-400 dark:text-slate-500"}`}
            >
              Утасны дугаар
            </button>
            <button
              onClick={() => switchVia("email")}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${otpVia === "email" ? "bg-white dark:bg-slate-700 text-cyan-500 shadow-sm" : "text-slate-400 dark:text-slate-500"}`}
            >
              Имэйл
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider">
              {otpVia === "phone" ? "Утасны дугаар" : "Имэйл хаяг"}
            </label>
            <Input
              type={otpVia === "phone" ? "tel" : "email"}
              value={identifier}
              maxLength={otpVia == "phone" ? 8 : 50}
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleGetOtp() }}
              placeholder={otpVia === "phone" ? "99001234" : "example@mail.com"}
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 ml-1">
              {otpVia === "phone" ? "SMS-ээр 6 оронтой код илгээгдэнэ" : "Имэйл рүү 6 оронтой код илгээгдэнэ"}
            </p>
          </div>

          <button
            onClick={handleGetOtp}
            disabled={otpLoading}
            className="w-full mt-2 bg-cyan-400 hover:bg-cyan-300 text-slate-900 py-3.5 rounded-full font-bold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {otpLoading ? "Илгээж байна..." : "Код авах"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* OTP */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-cyan-500 dark:text-cyan-400 uppercase ml-1 tracking-wider">Баталгаажуулах код</label>
            <p className="text-xs text-slate-500 dark:text-slate-400 ml-1">
              {otpVia === "phone"
                ? <><span className="font-semibold text-slate-700 dark:text-slate-300">{identifier}</span> дугаар руу илгээсэн кодыг оруулна уу</>
                : <><span className="font-semibold text-slate-700 dark:text-slate-300">{identifier}</span> хаяг руу илгээсэн кодыг оруулна уу</>
              }
            </p>
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              className="text-center text-2xl tracking-[10px] font-bold"
              placeholder="000000"
            />
            <div className="flex items-center justify-between px-1">
              {secondsLeft > 0 ? (
                <div className="flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${secondsLeft < 60 ? "bg-red-500" : "bg-cyan-500"}`} />
                  <span className={`text-xs font-mono font-bold tabular-nums ${secondsLeft < 60 ? "text-red-500" : "text-slate-500 dark:text-slate-400"}`}>
                    {formatTime(secondsLeft)}
                  </span>
                  <span className="text-xs text-slate-400">дараа хүчингүй болно</span>
                </div>
              ) : (
                <span className="text-xs text-red-500 font-semibold">Кодын хугацаа дууслаа</span>
              )}
              <button
                type="button"
                onClick={handleResend}
                disabled={otpLoading || secondsLeft > 0}
                className="text-xs text-cyan-500 dark:text-cyan-400 font-semibold hover:underline disabled:opacity-40 disabled:no-underline transition-colors"
              >
                {otpLoading ? "Илгээж байна..." : "Дахин илгээх"}
              </button>
            </div>
          </div>

          <Input
            label="Бүтэн нэр"
            placeholder="Таны нэр"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {otpVia === "email" && (
            <Input
              label="Утасны дугаар"
              type="tel"
              placeholder="99001234"
              maxLength={8}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          )}

          {otpVia === "phone" && (
            <Input
              label="Имэйл хаяг"
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}

          <Input
            label="Нууц үг"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            label="Нууц үг давтах"
            type="password"
            placeholder="••••••••"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading || otpCode.length < 6 || secondsLeft === 0}
            className="mt-2 bg-cyan-400 hover:bg-cyan-300 text-slate-900 py-3.5 rounded-full font-bold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {loading ? "Бүртгэж байна..." : "Үргэлжлүүлэх"}
          </button>

          <button
            type="button"
            onClick={handleBack}
            className="text-xs text-slate-400 dark:text-slate-500 hover:text-cyan-500 dark:hover:text-cyan-400 underline"
          >
            {otpVia === "phone" ? "Утасны дугаар солих" : "Имэйл хаяг солих"}
          </button>
        </form>
      )}

      <Divider />

      <a
        href="/api/auth/google"
        className="flex w-full items-center justify-center gap-3 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-4 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
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
          {onLoginLink ? (
            <button type="button" onClick={onLoginLink} className="text-cyan-500 dark:text-cyan-400 font-bold hover:underline">Нэвтрэх</button>
          ) : (
            <Link href="/auth/login" onClick={onNavigate} className="text-cyan-500 dark:text-cyan-400 font-bold hover:underline">Нэвтрэх</Link>
          )}
        </p>
      </div>
    </>
  )
}

function Divider() {
  return (
    <div className="my-6 relative">
      <div className="absolute inset-0 flex items-center px-2">
        <div className="w-full border-t border-slate-200 dark:border-slate-800" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-widest">
        <span className="bg-white dark:bg-[#0d1117] px-3 text-slate-400 dark:text-slate-500 font-semibold">Эсвэл</span>
      </div>
    </div>
  )
}
