"use client";

import { useAuth } from "../context/auth_context";
import Header from "./Header";
import AccountSidebar from "./AccountSidebar";

interface Props {
    title: string;
    children: React.ReactNode;
}

/**
 * Хэрэглэгчийн account хэсгийн дундын бүрхүүл:
 * Header + зүүн sidebar (Хянах самбар / Профайл / Захиалгууд / ...) + баруун контент.
 * Бүх account дэд хуудас (profile, order, wishlist, tickets) үүнийг ашиглаж нэгдсэн харагдацтай болно.
 */
export default function AccountShell({ title, children }: Props) {
    const { user, openLogin } = useAuth();

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
                <button
                    onClick={openLogin}
                    className="bg-teal-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-600 transition"
                >
                    Нэвтрэх
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20">
            <Header />
            <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24">
                <div className="flex flex-col lg:flex-row gap-6">
                    <AccountSidebar />
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold text-teal-500 mb-6">{title}</h1>
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
