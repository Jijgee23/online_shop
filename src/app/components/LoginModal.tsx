"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/auth_context"
import { UserRole } from "@/generated/prisma"
import { LoginForm } from "@/app/auth/components/LoginForm"

export default function LoginModal() {
  const { loginOpen, closeLogin, openRegister, user } = useAuth()
  const router = useRouter()

  // Close the modal (and route admins onward) once login succeeds.
  useEffect(() => {
    if (loginOpen && user) {
      closeLogin()
      if (user.role === UserRole.ADMIN) router.push("/admin")
    }
  }, [user, loginOpen, closeLogin, router])

  // Lock scroll + close on Escape while open.
  useEffect(() => {
    if (!loginOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLogin()
    }
    document.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [loginOpen, closeLogin])

  if (!loginOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={closeLogin}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Нэвтрэх"
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-8 md:p-10"
      >
        {/* Header: title left, close right */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Нэвтрэх</h1>
          <button
            type="button"
            onClick={closeLogin}
            aria-label="Хаах"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <LoginForm onNavigate={closeLogin} onRegisterLink={openRegister} />
      </div>
    </div>
  )
}
