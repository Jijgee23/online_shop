"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth_context";
import { useOrder } from "../context/order_context";
import CartIcon from "./CartIcon";
import NotificationBell from "./NotificationBell";
import ProfileSection from "./ProfileSection";
import Image from "next/image";
import { useTheme } from "next-themes";

export default function Header() {
    const { isAuthenticated, user, logout } = useAuth();
    const { toOrders } = useOrder();
    const router = useRouter();
    const { resolvedTheme, setTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close menu on route change
    const close = () => setIsMenuOpen(false);

    return (
        <>
            <header
                className={`fixed top-0 w-full z-50 transition-all duration-300
                    ${scrolled
                        ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg shadow-md shadow-slate-200/40 dark:shadow-slate-900/60 border-b border-slate-200 dark:border-slate-800"
                        : "bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 py-3.5 flex justify-between items-center">

                    {/* Logo */}
                    <div
                        onClick={() => { router.push('/'); close(); }}
                        className="text-2xl font-extrabold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent cursor-pointer select-none"
                    >
                        IShop
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6 font-medium">
                        <Link href="/product" className="text-slate-600 dark:text-slate-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors text-sm">
                            Бүтээгдэхүүн
                        </Link>

                        {!isAuthenticated ? (
                            <>
                                <Link href="/auth/login" className="text-slate-600 dark:text-slate-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors text-sm">
                                    Нэвтрэх
                                </Link>
                                <Link href="/auth/register" className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm hover:opacity-90 hover:shadow-lg transition-all">
                                    Бүртгүүлэх
                                </Link>
                            </>
                        ) : null}

                        <CartIcon />
                        <NotificationBell />
                        <ProfileSection />

                        {/* Theme toggle */}
                        {mounted && (
                            <button
                                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                                aria-label="Toggle theme"
                                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                {resolvedTheme === "dark" ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>
                        )}

                        {/* Social Links */}
                        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                            <Link
                                href="https://www.instagram.com/jijgeest/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition-transform hover:scale-110"
                                aria-label="Instagram"
                            >
                                <Image alt="Instagram" width={28} height={28} src="/icons/instagram.png" className="rounded-full object-contain" />
                            </Link>
                            <Link
                                href="https://www.facebook.com/jijgee.sg1/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition-transform hover:scale-110"
                                aria-label="Facebook"
                            >
                                <Image alt="Facebook" width={28} height={28} src="/icons/fb.png" className="rounded-full object-cover" />
                            </Link>
                        </div>
                    </nav>

                    {/* Mobile: right-side actions */}
                    <div className="flex md:hidden items-center gap-2">
                        <CartIcon />
                        <NotificationBell />
                        {mounted && (
                            <button
                                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                                aria-label="Toggle theme"
                                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                {resolvedTheme === "dark" ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>
                        )}

                        {/* Mobile user avatar (quick access) */}
                        {isAuthenticated && user && (
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow cursor-pointer"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                        )}

                        {/* Hamburger */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen
                                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                }
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu — animated slide-down */}
                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-slate-100 dark:border-slate-800
                        ${isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}
                >
                    <div className="bg-white dark:bg-slate-950 px-6 py-4 space-y-1">

                        {/* User greeting */}
                        {isAuthenticated && user && (
                            <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                </div>
                            </div>
                        )}

                        {/* Nav links */}
                        {[
                            { href: "/product", label: "Бүтээгдэхүүн", icon: "🛍" },
                            ...(isAuthenticated ? [
                                { href: "/wishlist", label: "Хүслийн жагсаалт", icon: "❤️" },
                                { href: "/notifications", label: "Мэдэгдэл", icon: "🔔" },
                                { href: "/profile", label: "Профайл", icon: "👤" },
                            ] : []),
                        ].map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={close}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors font-medium"
                            >
                                <span className="text-base w-5 text-center">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}

                        {isAuthenticated && (
                            <button
                                onClick={() => { toOrders(); close(); }}
                                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors font-medium"
                            >
                                <span className="text-base w-5 text-center">📦</span>
                                Захиалгууд
                            </button>
                        )}

                        {/* Divider */}
                        <div className="pt-2 pb-1">
                            <div className="border-t border-slate-100 dark:border-slate-800" />
                        </div>

                        {/* Auth actions */}
                        {!isAuthenticated ? (
                            <div className="space-y-2 pt-1">
                                <Link
                                    href="/auth/login"
                                    onClick={close}
                                    className="flex items-center justify-center w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold hover:border-teal-400 transition-colors"
                                >
                                    Нэвтрэх
                                </Link>
                                <Link
                                    href="/auth/register"
                                    onClick={close}
                                    className="flex items-center justify-center w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold hover:opacity-90 transition-opacity"
                                >
                                    Бүртгүүлэх
                                </Link>
                            </div>
                        ) : (
                            <button
                                onClick={() => { logout(); close(); }}
                                className="flex items-center gap-2 w-full px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-semibold text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Системээс гарах
                            </button>
                        )}

                        {/* Social links */}
                        <div className="flex items-center gap-3 px-3 pt-3 pb-1">
                            <Link href="https://www.instagram.com/jijgeest/" target="_blank" rel="noopener noreferrer" onClick={close} aria-label="Instagram">
                                <Image alt="Instagram" width={32} height={32} src="/icons/instagram.png" className="rounded-full object-contain hover:scale-110 transition-transform" />
                            </Link>
                            <Link href="https://www.facebook.com/jijgee.sg1/" target="_blank" rel="noopener noreferrer" onClick={close} aria-label="Facebook">
                                <Image alt="Facebook" width={32} height={32} src="/icons/fb.png" className="rounded-full object-cover hover:scale-110 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Overlay to close menu when tapping outside */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-40 md:hidden"
                    onClick={close}
                />
            )}
        </>
    );
}
