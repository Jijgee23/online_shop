"use client"

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth_context";
import CartIcon from "./CartIcon";
import ProfileSection from "./ProfileSection";

export default function Header() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                
                {/* Logo */}
                <div
                    onClick={() => router.push('/')}
                    className="text-2xl font-extrabold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent cursor-pointer">
                    IShop
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex space-x-8 items-center font-medium">
                    <Link href="/product" className="text-slate-700 dark:text-slate-300 hover:text-teal-500 transition-colors">Бүтээгдэхүүн</Link>
                    {!isAuthenticated ? (
                        <>
                            <Link href="/auth/login" className="text-slate-700 dark:text-slate-300 hover:text-teal-500 transition-colors">Нэвтрэх</Link>
                            <Link href="/auth/register" className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-5 py-2 rounded-full hover:shadow-lg transition-all">
                                Бүртгүүлэх
                            </Link>
                        </>
                    ) : null}
                    <CartIcon />
                    <ProfileSection />
                </nav>

                {/* Mobile Actions (Cart & Toggle) */}
                <div className="flex md:hidden items-center gap-4">
                    <CartIcon />
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-slate-600 dark:text-slate-300 outline-none"
                    >
                        {isMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xl animate-fade-in-down">
                    <Link 
                        href="/product" 
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-lg font-medium text-slate-700 dark:text-slate-200"
                    >
                        Бүтээгдэхүүн
                    </Link>
                    
                    {!isAuthenticated ? (
                        <div className="pt-4 space-y-4 border-t border-slate-100 dark:border-slate-800">
                            <Link 
                                href="/auth/login" 
                                onClick={() => setIsMenuOpen(false)}
                                className="block text-lg font-medium text-slate-700 dark:text-slate-200"
                            >
                                Нэвтрэх
                            </Link>
                            <Link 
                                href="/auth/register" 
                                onClick={() => setIsMenuOpen(false)}
                                className="block w-full text-center bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-xl font-bold"
                            >
                                Бүртгүүлэх
                            </Link>
                        </div>
                    ) : (
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <ProfileSection />
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}