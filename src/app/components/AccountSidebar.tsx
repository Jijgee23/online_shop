"use client";

import { useAuth } from "../context/auth_context";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, User, MapPin, Package, Heart, Wallet, LogOut } from "lucide-react";

const NAV = [
    { label: "Хянах самбар",            href: "/profile",      icon: LayoutDashboard },
    { label: "Профайл",                 href: "/profile/edit", icon: User },
    { label: "Хаягууд",                 href: "/address",      icon: MapPin },
    { label: "Захиалгууд",              href: "/order",        icon: Package },
    { label: "Таалагдсан бүтээгдэхүүн", href: "/wishlist",     icon: Heart },
    { label: "Миний тасалбар",          href: "/tickets",      icon: Wallet },
];

export default function AccountSidebar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    if (!user) return null;

    return (
        <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 lg:sticky lg:top-24">
                {/* User */}
                <div className="flex flex-col items-center text-center pb-5 mb-2 border-b border-slate-100 dark:border-zinc-800">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold mb-3">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-400 dark:text-zinc-500 truncate max-w-[200px]">{user.email}</p>
                </div>

                {/* Nav */}
                <nav className="space-y-1">
                    {NAV.map(({ label, href, icon: Icon }) => {
                        const active = pathname === href;
                        return (
                            <button
                                key={href}
                                onClick={() => router.push(href)}
                                className={`flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                                    active
                                        ? "bg-teal-500/10 text-teal-500"
                                        : "text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white"
                                }`}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                {label}
                            </button>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        Системээс гарах
                    </button>
                </div>
            </div>
        </aside>
    );
}
