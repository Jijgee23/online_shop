"use client";

import { useRouter } from "next/navigation";
import { User, Package, Heart, Wallet } from "lucide-react";
import AccountShell from "../components/AccountShell";

const CARDS = [
    { label: "Профайл",                 desc: "Овог нэр, утас болон хүргэлтийн хаяг солих",        href: "/profile/edit", icon: User },
    { label: "Захиалгууд",              desc: "Захиалгын түүх харах, захиалгаа хянах",             href: "/order",        icon: Package },
    { label: "Таалагдсан бүтээгдэхүүн", desc: "Таны таалагдсан бүтээгдэхүүнүүд энд харагдана",     href: "/wishlist",     icon: Heart },
    { label: "Миний тасалбар",          desc: "Худалдан авсан тасалбараа харах, ашиглах",          href: "/tickets",      icon: Wallet },
];

export default function UserProfile() {
    const router = useRouter();

    return (
        <AccountShell title="Хянах самбар">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {CARDS.map(({ label, desc, href, icon: Icon }) => (
                    <button
                        key={href}
                        onClick={() => router.push(href)}
                        className="text-left bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-teal-400/50 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-all"
                    >
                        <Icon className="w-5 h-5 text-slate-700 dark:text-slate-200 mb-3" />
                        <p className="font-bold text-slate-900 dark:text-white">{label}</p>
                        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 leading-relaxed">{desc}</p>
                    </button>
                ))}
            </div>
        </AccountShell>
    );
}
