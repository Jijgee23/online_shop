"use client"

import { useState } from "react";
import { useAuth } from "../context/auth_context";
import { useOrder } from "../context/order_context";
import { goto } from "@/utils/router";

interface ProfileSectionProps {
    onAdminSettings?: () => void;
}

export default function ProfileSection({ onAdminSettings }: ProfileSectionProps = {}) {
    const { logout, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const { toOrders } = useOrder();

    if (!user) return null;

    const isAdmin = user.role === "ADMIN";
    const close = () => setIsOpen(false);

    const menuItems = isAdmin
        ? [
            {
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                ),
                label: "Тохиргоо",
                action: () => { onAdminSettings?.(); close(); },
            },
          ]
        : [
            {
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                ),
                label: "Профайл",
                action: () => { goto("/profile"); close(); },
            },
            {
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                ),
                label: "Захиалгууд",
                action: () => { toOrders(); close(); },
            },
            {
                icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                ),
                label: "Хүслийн жагсаалт",
                action: () => { goto("/wishlist"); close(); },
            },
          ];

    return (
        <div className="relative">
            {/* Trigger pill */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 py-1.5 pl-1.5 pr-3 rounded-full border transition-all duration-200
                    ${isOpen
                        ? "bg-slate-100 dark:bg-slate-800 border-teal-400/60"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-teal-400/40 shadow-sm"
                    }`}
            >
                {/* Avatar */}
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[96px] truncate">
                    {user.name}
                </span>
                <svg
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div className="fixed inset-0 z-10" onClick={close} />
            )}

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2.5 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 z-20 overflow-hidden">

                    {/* User info header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={item.action}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <span className="text-slate-400">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1 pb-1">
                        <button
                            onClick={() => { logout(); close(); }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Системээс гарах
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
