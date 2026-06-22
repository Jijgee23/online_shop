"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/app/context/auth_context"
import toast from "react-hot-toast"
import { Input } from "@/ui/Input"

interface LoginFormProps {
  /** Called when an internal navigation link is clicked (e.g. to close a modal). */
  onNavigate?: () => void
  /** If provided, the "Бүртгүүлэх" link becomes a button calling this (e.g. switch to register modal). */
  onRegisterLink?: () => void
}

export function LoginForm({ onNavigate, onRegisterLink }: LoginFormProps) {
  const { login, loading } = useAuth()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier || !password) {
      toast.error('Нэвтрэх мэдээллээ оруулна уу!')
      return
    }
    await login(identifier, password)
  }

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Имэйл эсвэл утасны дугаар"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="name@example.com / 99001234"
          required
        />

        <div className="space-y-1">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Нууц үг
            </label>
            <Link href="/auth/resetPassword" onClick={onNavigate} className="text-[10px] text-cyan-500 dark:text-cyan-400 hover:underline transition-colors font-bold uppercase">
              Мартсан уу?
            </Link>
          </div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="relative w-full bg-cyan-400 hover:bg-cyan-300 text-slate-900 py-3.5 rounded-full font-bold text-sm shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={loading ? "opacity-0" : "opacity-100"}>Үргэлжлүүлэх</span>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="animate-spin h-6 w-6 text-slate-900" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </button>
      </form>

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
        Google-ээр нэвтрэх
      </a>

      <div className="mt-6 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Бүртгэлгүй юу?{" "}
          {onRegisterLink ? (
            <button
              type="button"
              onClick={onRegisterLink}
              className="text-cyan-500 dark:text-cyan-400 font-bold hover:underline transition-colors"
            >
              Бүртгүүлэх
            </button>
          ) : (
            <Link
              href="/auth/register"
              onClick={onNavigate}
              className="text-cyan-500 dark:text-cyan-400 font-bold hover:underline transition-colors"
            >
              Бүртгүүлэх
            </Link>
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
        <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-widest">
        <span className="bg-white dark:bg-[#0d1117] px-3 text-slate-400 dark:text-slate-500 font-semibold">Эсвэл</span>
      </div>
    </div>
  )
}
