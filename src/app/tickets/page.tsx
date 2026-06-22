"use client";

import { Wallet } from "lucide-react";
import AccountShell from "../components/AccountShell";

export default function TicketsPage() {
    return (
        <AccountShell title="Миний тасалбар">
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[320px]">
                <div className="w-16 h-16 rounded-3xl bg-teal-500/10 text-teal-500 flex items-center justify-center mb-5">
                    <Wallet className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Миний тасалбар</h2>
                <p className="text-sm text-slate-400 dark:text-zinc-500 mt-2 max-w-sm">
                    Тасалбарын систем тун удахгүй нэмэгдэнэ. Худалдан авсан тасалбар, купоноо энд харах боломжтой болно.
                </p>
                <span className="mt-5 inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    Тун удахгүй
                </span>
            </div>
        </AccountShell>
    );
}
