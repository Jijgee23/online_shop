"use client";

import { useEffect, useRef, useState } from "react";

const MONTHS_MN = ["1-р сар","2-р сар","3-р сар","4-р сар","5-р сар","6-р сар","7-р сар","8-р сар","9-р сар","10-р сар","11-р сар","12-р сар"];
const DAYS_MN   = ["Да","Мя","Лх","Пү","Ба","Бя","Ня"];

const PRESETS = [
    { label: "Өнөөдөр",         getDates: () => { const t = today(); return [t, t]; } },
    { label: "Сүүлийн 7 хоног", getDates: () => [daysAgo(6), today()] },
    { label: "Сүүлийн 30 хоног",getDates: () => [daysAgo(29), today()] },
    { label: "Энэ сар",         getDates: () => { const t = today(); return [new Date(t.getFullYear(), t.getMonth(), 1), t]; } },
    { label: "Сүүлийн 3 сар",   getDates: () => [daysAgo(89), today()] },
];

function today() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}
function daysAgo(n: number) {
    const d = today();
    d.setDate(d.getDate() - n);
    return d;
}
function toISO(d: Date) {
    return d.toISOString().slice(0, 10);
}
function toMN(d: Date, includeYear = false) {
    const part = `${d.getMonth() + 1}-р сарын ${d.getDate()}`;
    return includeYear ? `${d.getFullYear()} оны ${part}` : part;
}
function sameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function getDaysInMonth(y: number, m: number) {
    return new Date(y, m + 1, 0).getDate();
}
function firstDayOffset(y: number, m: number) {
    return (new Date(y, m, 1).getDay() + 6) % 7; // Mon=0
}

interface Props {
    dateFrom: string;
    dateTo:   string;
    onChange: (from: string, to: string) => void;
}

export default function DateRangePicker({ dateFrom, dateTo, onChange }: Props) {
    const [open, setOpen]         = useState(false);
    const [start, setStart]       = useState<Date | null>(null);
    const [end,   setEnd]         = useState<Date | null>(null);
    const [picking, setPicking]   = useState(false); // waiting for end
    const [hover, setHover]       = useState<Date | null>(null);
    const now = today();
    const [viewYear,  setViewYear]  = useState(now.getFullYear());
    const [viewMonth, setViewMonth] = useState(now.getMonth());
    const ref = useRef<HTMLDivElement>(null);

    // Sync local state when props change from outside (e.g. reset)
    useEffect(() => {
        setStart(dateFrom ? new Date(dateFrom) : null);
        setEnd(dateTo     ? new Date(dateTo)   : null);
        setPicking(false);
    }, [dateFrom, dateTo]);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const clickDay = (date: Date) => {
        if (!picking || !start) {
            setStart(date);
            setEnd(null);
            setPicking(true);
        } else {
            const [s, e] = date < start ? [date, start] : [start, date];
            setStart(s);
            setEnd(e);
            setPicking(false);
        }
    };

    const applyPreset = ([s, e]: Date[]) => {
        setStart(s); setEnd(e); setPicking(false);
        setViewYear(s.getFullYear()); setViewMonth(s.getMonth());
    };

    const handleApply = () => {
        if (!start) return;
        onChange(toISO(start), toISO(end ?? start));
        setOpen(false);
    };

    const handleReset = () => {
        setStart(null); setEnd(null); setPicking(false);
        onChange("", "");
        setOpen(false);
    };

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const effectiveEnd = picking ? hover : end;

    const isStart   = (d: Date) => !!start && sameDay(d, start);
    const isEnd     = (d: Date) => !!effectiveEnd && sameDay(d, effectiveEnd);
    const isInRange = (d: Date) => {
        if (!start || !effectiveEnd) return false;
        const lo = start < effectiveEnd ? start : effectiveEnd;
        const hi = start < effectiveEnd ? effectiveEnd : start;
        return d > lo && d < hi;
    };

    // Build cells for a given year/month
    const buildCells = (y: number, m: number): (Date | null)[] => {
        const offset = firstDayOffset(y, m);
        const cells: (Date | null)[] = [
            ...Array(offset).fill(null),
            ...Array.from({ length: getDaysInMonth(y, m) }, (_, i) => new Date(y, m, i + 1)),
        ];
        while (cells.length % 7 !== 0) cells.push(null);
        return cells;
    };

    // Second month
    const view2Month = viewMonth === 11 ? 0  : viewMonth + 1;
    const view2Year  = viewMonth === 11 ? viewYear + 1 : viewYear;

    const triggerLabel = (() => {
        if (dateFrom) {
            const f = new Date(dateFrom);
            const t = dateTo ? new Date(dateTo) : null;
            if (!t || dateFrom === dateTo) return toMN(f);
            return `${toMN(f)} — ${toMN(t)}`;
        }
        return "Огноо сонгох";
    })();

    return (
        <div ref={ref} className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
                    dateFrom
                        ? "bg-teal-500/10 border-teal-500/40 text-teal-400"
                        : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700"
                }`}
            >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {triggerLabel}
                {dateFrom && (
                    <span
                        role="button"
                        onClick={e => { e.stopPropagation(); handleReset(); }}
                        className="ml-0.5 hover:text-red-400 transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </span>
                )}
            </button>

            {/* Dialog */}
            {open && (
                <div className="absolute right-0 top-full mt-2 z-50 flex bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden">

                    {/* Presets */}
                    <div className="border-r border-slate-100 dark:border-zinc-800 p-5 flex flex-col gap-1 min-w-48">
                        <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Хурдан сонгох</p>
                        {PRESETS.map(p => (
                            <button
                                key={p.label}
                                type="button"
                                onClick={() => applyPreset(p.getDates())}
                                className="text-left text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:text-teal-500 dark:hover:text-teal-400 px-3 py-2.5 rounded-xl hover:bg-teal-500/10 transition-all whitespace-nowrap"
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Calendars */}
                    <div className="p-6 select-none">
                        {/* Month nav + two month headers */}
                        <div className="flex gap-8 mb-5">
                            {[{ y: viewYear, m: viewMonth }, { y: view2Year, m: view2Month }].map(({ y, m }, col) => (
                                <div key={col} className="flex items-center justify-between w-[308px]">
                                    {col === 0 ? (
                                        <button type="button" onClick={prevMonth}
                                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                    ) : <div className="w-9" />}

                                    <span className="text-base font-bold text-slate-900 dark:text-white">
                                        {y} оны {MONTHS_MN[m]}
                                    </span>

                                    {col === 1 ? (
                                        <button type="button" onClick={nextMonth}
                                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    ) : <div className="w-9" />}
                                </div>
                            ))}
                        </div>

                        {/* Two month grids side by side */}
                        <div className="flex gap-8">
                            {[{ y: viewYear, m: viewMonth }, { y: view2Year, m: view2Month }].map(({ y, m }, col) => (
                                <div key={col}>
                                    {/* Day names */}
                                    <div className="grid grid-cols-7 mb-1">
                                        {DAYS_MN.map(d => (
                                            <div key={d} className="text-center text-xs font-bold text-slate-400 dark:text-zinc-500 py-1.5 w-11">{d}</div>
                                        ))}
                                    </div>
                                    {/* Day grid */}
                                    <div className="grid grid-cols-7">
                                        {buildCells(y, m).map((date, idx) => {
                                            if (!date) return <div key={idx} className="w-11 h-11" />;
                                            const future  = date > now;
                                            const start_  = isStart(date);
                                            const end_    = isEnd(date);
                                            const range   = isInRange(date);
                                            const isToday = sameDay(date, now);
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    disabled={future}
                                                    onClick={() => clickDay(date)}
                                                    onMouseEnter={() => picking && setHover(date)}
                                                    onMouseLeave={() => picking && setHover(null)}
                                                    className={`w-11 h-11 text-sm font-semibold transition-all flex items-center justify-center
                                                        ${future ? "text-slate-300 dark:text-zinc-700 cursor-not-allowed" : "cursor-pointer"}
                                                        ${start_ || end_
                                                            ? "bg-teal-500 text-white rounded-full z-10 relative"
                                                            : range
                                                            ? "bg-teal-500/15 text-teal-700 dark:text-teal-300 rounded-none"
                                                            : isToday
                                                            ? "text-teal-500 font-extrabold hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full"
                                                            : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full"
                                                        }
                                                    `}
                                                >
                                                    {date.getDate()}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Hint */}
                        <p className="text-xs text-center text-slate-400 dark:text-zinc-600 mt-4 h-4">
                            {picking
                                ? "Дуусах огноо сонгоно уу"
                                : start && end
                                ? sameDay(start, end)
                                    ? toMN(start)
                                    : `${toMN(start)}  —  ${toMN(end)}`
                                : start
                                ? toMN(start)
                                : "Эхлэх огноо сонгоно уу"}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3 mt-4">
                            <button type="button" onClick={handleReset}
                                className="flex-1 py-2.5 text-sm font-bold text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                                Арилгах
                            </button>
                            <button type="button" onClick={handleApply} disabled={!start}
                                className="flex-1 py-2.5 text-sm font-bold bg-teal-500 hover:bg-teal-400 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                Хэрэглэх
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
