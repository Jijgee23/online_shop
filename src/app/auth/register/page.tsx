"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/app/components/ui/Input"

export default function RegisterPage() {
  const [step, setStep] = useState(1) // 1: Email, 2: Code & Info
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [otpCode, setOtpCode] = useState("") // OTP кодны state

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // 1. Код илгээх функц
  const handleGetOtp = async () => {
    if (!email) return setError("Имэйл хаягаа оруулна уу")

    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/getOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "SIGNUP" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error)

      setStep(2) // Амжилттай бол дараагийн алхам руу
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 2. Эцсийн бүртгэл хийх функц
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    if (password !== passwordConfirm) {
      setError('Нууц үг таарахгүй байна!')
      setLoading(false)
      return
    }
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, otpCode }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Алдаа гарлаа")

      router.push("/auth/login")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-950 px-4 overflow-hidden font-sans">
      <div className="absolute top-0 -right-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse delay-700"></div>
      <div className="absolute bottom-0 -left-20 w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>

      <div className="relative w-full max-w-lg z-10">
        <div className="bg-white/10 dark:bg-slate-900/50 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl shadow-2xl p-8 md:p-12 transition-all duration-500">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent mb-2">IShop</h1>
            <h2 className="text-xl font-bold text-white">
              {step === 1 ? "Имэйл баталгаажуулах" : "Мэдээллээ бөглөнө үү"}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
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
                <label className="text-xs font-semibold text-slate-400 uppercase ml-1">Имэйл хаяг</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-3.5 text-white focus:ring-2 focus:ring-teal-500 transition-all outline-none"
                  placeholder="example@mail.com"
                />
                <button
                  onClick={handleGetOtp}
                  disabled={loading}
                  className="w-full mt-4 bg-teal-500 hover:bg-teal-400 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-teal-500/20"
                >
                  {loading ? "Илгээж байна..." : "Код авах"}
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
                  className="col-span-2 mt-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all"
                >
                  {loading ? "Бүртгэж байна..." : "Бүртгэл дуусгах"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="col-span-2 text-xs text-slate-500 hover:text-teal-400 underline"
                >
                  Имэйл хаяг солих
                </button>
              </form>
            )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              Бүртгэлтэй юу?{" "}
              <Link href="/auth/login" className="text-teal-400 font-bold hover:underline">Нэвтрэх</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}