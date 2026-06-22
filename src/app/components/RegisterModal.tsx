"use client"

import { useEffect } from "react"
import { useAuth } from "@/app/context/auth_context"
import { RegisterForm } from "@/app/auth/components/RegisterForm"

export default function RegisterModal() {
  const { registerOpen, closeRegister, openLogin } = useAuth()

  // Lock scroll + close on Escape while open.
  useEffect(() => {
    if (!registerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRegister()
    }
    document.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [registerOpen, closeRegister])

  if (!registerOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={closeRegister}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Бүртгүүлэх"
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-8 md:p-10"
      >
        {/* Header: title left, close right */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Бүртгүүлэх</h1>
          <button
            type="button"
            onClick={closeRegister}
            aria-label="Хаах"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <RegisterForm
          onNavigate={closeRegister}
          onSuccess={openLogin}
          onLoginLink={openLogin}
        />
      </div>
    </div>
  )
}
