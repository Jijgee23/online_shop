"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import toast from "react-hot-toast";
import { CardSection } from "../shared";

export default function StyleTab() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const themes = [
        { id: "light",  label: "Цайвар",   icon: <Sun className="w-5 h-5" /> },
        { id: "dark",   label: "Харанхуй", icon: <Moon className="w-5 h-5" /> },
        { id: "system", label: "Систем",   icon: <Monitor className="w-5 h-5" /> },
    ];

    return (
        <CardSection title="Харагдах байдал" desc="Системийн өнгөний загвар">
            <div className="grid grid-cols-3 gap-3">
                {themes.map(t => {
                    const active = theme === t.id;
                    return (
                        <button key={t.id} onClick={() => { setTheme(t.id); toast.success(`${t.label} загвар`); }}
                            className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                                active
                                    ? "border-teal-500 bg-teal-500/5 text-teal-500"
                                    : "border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-600 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                            }`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${active ? "bg-teal-500/10" : "bg-slate-100 dark:bg-zinc-800"}`}>
                                {t.icon}
                            </div>
                            <span className="text-sm font-semibold">{t.label}</span>
                            {active && <span className="w-2 h-2 rounded-full bg-teal-500" />}
                        </button>
                    );
                })}
            </div>
            {mounted && (
                <p className="text-xs text-slate-400 dark:text-zinc-600 mt-4">
                    Одоогийн загвар: <span className="font-semibold text-teal-500">{resolvedTheme === "dark" ? "Харанхуй" : "Цайвар"}</span>
                </p>
            )}
        </CardSection>
    );
}
