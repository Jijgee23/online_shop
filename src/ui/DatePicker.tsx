"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const MONTHS_MN = ["1-р сар", "2-р сар", "3-р сар", "4-р сар", "5-р сар", "6-р сар", "7-р сар", "8-р сар", "9-р сар", "10-р сар", "11-р сар", "12-р сар"];
const DAYS_MN = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function toISO(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}
function fromISO(s: string | undefined): Date | null {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}
function toMN(d: Date) { return `${d.getFullYear()} оны ${d.getMonth() + 1}-р сарын ${d.getDate()}`; }
function sameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstDayOffset(y: number, m: number) { return (new Date(y, m, 1).getDay() + 6) % 7; } // Да=0

interface Props {
    value: string;                 // "YYYY-MM-DD"
    onChange: (v: string) => void;
    min?: string;                  // "YYYY-MM-DD"
    max?: string;                  // "YYYY-MM-DD"
    placeholder?: string;
    className?: string;
}

export default function DatePicker({ value, onChange, min, max, placeholder = "Огноо сонгох", className = "" }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selected = useMemo(() => fromISO(value), [value]);
    const minD = useMemo(() => fromISO(min), [min]);
    const maxD = useMemo(() => fromISO(max), [max]);
    const today = useMemo(() => startOfDay(new Date()), []);

    const base = selected ?? today;
    const [viewYear, setViewYear] = useState(base.getFullYear());
    const [viewMonth, setViewMonth] = useState(base.getMonth());

    // Сонгосон огноо гаднаас өөрчлөгдвөл харагдах сарыг тааруулна.
    useEffect(() => {
        if (selected) { setViewYear(selected.getFullYear()); setViewMonth(selected.getMonth()); }
    }, [selected]);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const disabled = (d: Date) => {
        if (minD && startOfDay(d) < startOfDay(minD)) return true;
        if (maxD && startOfDay(d) > startOfDay(maxD)) return true;
        return false;
    };

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const pick = (d: Date) => { onChange(toISO(d)); setOpen(false); };

    const cells: (Date | null)[] = useMemo(() => {
        const offset = firstDayOffset(viewYear, viewMonth);
        const c: (Date | null)[] = [
            ...Array(offset).fill(null),
            ...Array.from({ length: daysInMonth(viewYear, viewMonth) }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
        ];
        while (c.length % 7 !== 0) c.push(null);
        return c;
    }, [viewYear, viewMonth]);

    return (
        <div ref={ref} className={`relative ${className}`}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all
                    ${open
                        ? "bg-white dark:bg-zinc-900 border-teal-500/50 ring-2 ring-teal-500/20"
                        : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600"
                    }`}
            >
                <svg className="w-4 h-4 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={`flex-1 text-left ${selected ? "text-slate-800 dark:text-white font-medium" : "text-slate-400 dark:text-zinc-500"}`}>
                    {selected ? toMN(selected) : placeholder}
                </span>
                {selected && (
                    <span
                        role="button"
                        onClick={e => { e.stopPropagation(); onChange(""); }}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </span>
                )}
            </button>

            {/* Dialog */}
            {open && (
                <div className="absolute left-0 top-full mt-2 z-50 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-5 select-none">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 w-[308px]">
                        <button type="button" onClick={prevMonth}
                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="text-base font-bold text-slate-900 dark:text-white">{viewYear} оны {MONTHS_MN[viewMonth]}</span>
                        <button type="button" onClick={nextMonth}
                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Day names */}
                    <div className="grid grid-cols-7 mb-1">
                        {DAYS_MN.map(d => (
                            <div key={d} className="text-center text-xs font-bold text-slate-400 dark:text-zinc-500 py-1.5 w-11">{d}</div>
                        ))}
                    </div>

                    {/* Day grid */}
                    <div className="grid grid-cols-7">
                        {cells.map((date, idx) => {
                            if (!date) return <div key={idx} className="w-11 h-11" />;
                            const off = disabled(date);
                            const sel = selected && sameDay(date, selected);
                            const isToday = sameDay(date, today);
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    disabled={off}
                                    onClick={() => pick(date)}
                                    className={`w-11 h-11 text-sm font-semibold transition-all flex items-center justify-center rounded-full
                                        ${off ? "text-slate-300 dark:text-zinc-700 cursor-not-allowed"
                                            : sel ? "bg-teal-500 text-white"
                                                : isToday ? "text-teal-500 font-extrabold hover:bg-slate-100 dark:hover:bg-zinc-800"
                                                    : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                                        }`}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    {/* Today shortcut */}
                    <div className="flex justify-center mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                        <button type="button"
                            disabled={disabled(today)}
                            onClick={() => pick(today)}
                            className="text-sm font-bold text-teal-500 hover:text-teal-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                            Өнөөдөр
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
