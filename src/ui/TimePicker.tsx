"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
    value: string;                 // 24 цагийн "HH:mm"
    onChange: (v: string) => void;
    minuteStep?: number;           // анхдагч 5
    className?: string;
    disabled?: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function TimePicker({ value, onChange, minuteStep = 5, className = "", disabled }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const hourCol = useRef<HTMLDivElement>(null);
    const minCol = useRef<HTMLDivElement>(null);

    const [h = "", m = ""] = (value || "").split(":");
    const curH = h === "" ? null : Number(h);
    const curM = m === "" ? null : Number(m);

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // Нээгдэхэд сонгосон утгууд руу гүйлгэнэ.
    useEffect(() => {
        if (!open) return;
        const scroll = (col: HTMLDivElement | null) => {
            const el = col?.querySelector<HTMLElement>("[data-active='true']");
            if (el) el.scrollIntoView({ block: "center" });
        };
        const t = setTimeout(() => { scroll(hourCol.current); scroll(minCol.current); }, 0);
        return () => clearTimeout(t);
    }, [open]);

    const pickHour = (hh: number) => onChange(`${pad(hh)}:${pad(curM ?? 0)}`);
    const pickMin = (mm: number) => onChange(`${pad(curH ?? 0)}:${pad(mm)}`);

    const colCls = "flex-1 max-h-52 overflow-y-auto py-1 scrollbar-thin";
    const itemCls = (active: boolean) =>
        `w-full text-center py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer
        ${active
            ? "bg-teal-500 text-white"
            : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"}`;

    return (
        <div ref={ref} className={`relative ${className}`}>
            {/* Trigger */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm transition-all disabled:opacity-50
                    ${open
                        ? "bg-white dark:bg-zinc-900 border-teal-500/50 ring-2 ring-teal-500/20"
                        : "bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600"
                    }`}
            >
                <svg className="w-4 h-4 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" strokeWidth="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7v5l3 2" />
                </svg>
                <span className={`tabular-nums font-bold ${value ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-zinc-500"}`}>
                    {value || "--:--"}
                </span>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute left-0 top-full mt-2 z-50 w-44 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-zinc-800">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Цаг</span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Минут</span>
                    </div>
                    <div className="flex divide-x divide-slate-100 dark:divide-zinc-800">
                        <div ref={hourCol} className={colCls}>
                            {hours.map(hh => (
                                <div key={hh} className="px-1.5">
                                    <button type="button" data-active={curH === hh} onClick={() => pickHour(hh)} className={itemCls(curH === hh)}>
                                        {pad(hh)}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div ref={minCol} className={colCls}>
                            {minutes.map(mm => (
                                <div key={mm} className="px-1.5">
                                    <button type="button" data-active={curM === mm} onClick={() => pickMin(mm)} className={itemCls(curM === mm)}>
                                        {pad(mm)}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
