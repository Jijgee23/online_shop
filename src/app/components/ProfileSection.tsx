import { useState } from "react";
import { useAuth } from "../context/auth_context";
import { useOrder } from "../context/order_context";

export default function ProfileSection() {
    const { logout, user, isAdmin } = useAuth()
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { toOrders } = useOrder()
    const loggedIn = user !== null
    return (
        <div className="flex items-center gap-6">
            {loggedIn && (
                <div className="relative">
                    {/* Profile Pill */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`flex items-center gap-3 p-1.5 pl-2 pr-4 rounded-full border transition-all duration-200 
                  ${isMenuOpen
                                ? "bg-slate-100 dark:bg-slate-800 border-teal-500/50 shadow-inner"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-500/30 shadow-sm"
                            }`}
                    >
                        {/* Avatar */}
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {user.name}
                            </span>
                            <svg
                                className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <>
                            {/* Дэлгэцийн хаана ч дарсан хаагддаг болгох Overlay */}
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsMenuOpen(false)}
                            ></div>

                            <div className="absolute `left-0` mt-3 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-20 animate-in fade-in zoom-in duration-200 origin-top-right">
                                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                                    <p className="text-xs text-slate-400">Нэвтэрсэн:</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.email}</p>
                                </div>

                                <button
                                 onClick={toOrders}
                                className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    Миний захиалга
                                </button>

                                <hr className="my-1 border-slate-100 dark:border-slate-800" />

                                <button
                                    onClick={() => {
                                        logout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-500 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Системээс гарах
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}