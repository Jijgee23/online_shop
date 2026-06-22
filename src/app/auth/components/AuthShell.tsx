"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSettings } from "@/app/context/settings_context"

interface AuthShellProps {
  title: string
  /** Optional override for the X / back behaviour. Defaults to going home. */
  onClose?: () => void
  children: ReactNode
}

export function AuthShell({ title, onClose, children }: AuthShellProps) {
  const { settings } = useSettings()
  const router = useRouter()
  const storeName = settings.storeName || "Дэлгүүр"

  const handleClose = () => {
    if (onClose) return onClose()
    router.push("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 py-8 font-sans">
      <div className="relative w-full max-w-md">
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-8 md:p-10">

          {/* Header: title left, close right */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Хаах"
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {children}

          {/* Promo banner */}
          <Link
            href="/"
            className="mt-7 block overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-5 text-white transition-transform hover:scale-[1.01]"
          >
            <p className="text-lg font-extrabold leading-tight">
              Онлайн худалдааны<br />вэбсайттай боллоо
            </p>
            <p className="mt-1 text-xs text-white/80">{storeName} дэлгүүрээр зочлоорой</p>
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          Онлайн худалдааг хөгжүүлэгч{" "}
          <span className="font-bold text-slate-600 dark:text-slate-300">{storeName}</span> платформ.
        </p>
      </div>
    </div>
  )
}
