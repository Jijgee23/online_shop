"use client"

import React, { useState } from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    icon?: React.ReactNode
    error?: string
}

export const Input = ({ label, icon, error, type, className, ...props }: InputProps) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === "password"

    return (
        <div className="space-y-1 w-full">
            {label && (
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider">
                    {label}
                </label>
            )}

            <div className="relative group">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-teal-500 dark:group-focus-within:text-teal-400 transition-colors">
                        {icon}
                    </div>
                )}

                <input
                    type={isPassword ? (showPassword ? "text" : "password") : type}
                    className={`
            w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl
            py-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500
            transition-all duration-200
            ${icon ? "pl-12" : "pl-5"}
            ${isPassword ? "pr-12" : "pr-5"}
            ${error ? "border-red-500/50 ring-red-500/20" : ""}
            ${className}
          `}
                    {...props}
                />

                {/* Нууц үг харах/нуух товч (Зөвхөн password төрөлд) */}
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-teal-400 transition-colors cursor-pointer"
                    >
                        {showPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                )}
            </div>

            {error && <p className="text-[10px] text-red-400 ml-2 animate-pulse">{error}</p>}
        </div>
    )
}