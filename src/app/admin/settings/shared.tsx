"use client";

import { Save } from "lucide-react";

export const inputCls =
    "w-full bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/40 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600";

export function CardSection({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden mb-5">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
                {desc && <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{desc}</p>}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{label}</label>
            {children}
        </div>
    );
}

export function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
    return (
        <button
            type="button"
            onClick={onChange}
            disabled={disabled}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 flex-shrink-0 ${checked ? "bg-teal-500" : "bg-slate-200 dark:bg-zinc-700"}`}
        >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-0"}`} />
        </button>
    );
}

export function SaveBtn({ onClick, saving }: { onClick: () => void; saving: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-teal-500/20 active:scale-95"
        >
            <Save className="w-4 h-4" />
            {saving ? "Хадгалж байна..." : "Хадгалах"}
        </button>
    );
}
