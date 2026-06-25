"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useAdmin } from "@/app/context/admin_context";
import { LowStockSummary } from "@/interface/dashboard";
import DashboardHeader from "./components/DashboardHeader";
import LastWeekIncome from "./components/LastWeekIncome";
import RecentOrderTable from "./components/RecentOrderTable";
import { TopSelledProducts } from "./components/TopSelledProducts";

// ─── Count-up hook ─────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200, started: boolean) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!started || target === 0) { setCount(target); return; }
        let current = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            current += step;
            if (current >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(current));
        }, 16);
        return () => clearInterval(timer);
    }, [started, target, duration]);
    return count;
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
    label, rawValue, prefix, suffix, color, icon, started,
}: {
    label: string; rawValue: number; prefix?: string; suffix?: string;
    color: string; icon: string; started: boolean;
}) {
    const count = useCountUp(rawValue, 1200, started);
    return (
        <div className={`relative overflow-hidden bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl hover:border-slate-300 dark:hover:border-zinc-700 transition-all group`}>
            <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 ${color}`} />
            <div className="flex justify-between items-start mb-4">
                <span className="text-2xl">{icon}</span>
            </div>
            <p className="text-slate-400 dark:text-zinc-500 text-[11px] font-bold uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {prefix}{count.toLocaleString()}{suffix}
            </p>
        </div>
    );
}

// ─── Bar chart ────────────────────────────────────────────────────────────────

const PLOT_H = 240; // px — графикийн талбайн өндөр
const BAR_MIN_W = 28;  // px — баганы доод өргөн (үүнээс жижиг бол хэвтээ гүйлгэнэ)

const formatTk = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}сая`
        : n >= 1_000 ? `${Math.round(n / 1_000)}мянга`
            : `${n}`;

// Y тэнхлэгийн дээд утгыг "цэвэр" тоо руу бөөрөнхийлж, баганууд талбайгаа
// бүрэн дүүргэхгүйгээр зохистой өндөртэй харагдана.
function niceMax(value: number) {
    if (value <= 0) return 1;
    const pow = Math.pow(10, Math.floor(Math.log10(value)));
    const norm = value / pow; // 1..10
    const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
    return step * pow;
}

function RevenueBarChart({ data }: { data: { date: string; revenue: number }[] }) {
    const outerRef = useRef<HTMLDivElement>(null);
    const [started, setStarted] = useState(false);
    const [hovered, setHovered] = useState<number | null>(null);

    useEffect(() => {
        const el = outerRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } },
            { threshold: 0 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // Өгөгдөл солигдоход анимацийг дахин эхлүүлнэ
    useEffect(() => { setStarted(false); const t = setTimeout(() => setStarted(true), 60); return () => clearTimeout(t); }, [data]);

    const rawMax = Math.max(...data.map(d => Number(d.revenue)), 0);
    const max = niceMax(rawMax);
    const total = data.reduce((s, d) => s + Number(d.revenue), 0);
    const avg = data.length > 0 ? total / data.length : 0;
    const avgPct = max > 0 ? (avg / max) * 100 : 0;
    const gridLines = [1, 0.75, 0.5, 0.25, 0]; // дээрээс доош

    return (
        <div className="flex gap-3 h-full" style={{ minHeight: PLOT_H }}>
            {/* Y тэнхлэг */}
            <div className="flex flex-col w-11 shrink-0 text-[10px] font-medium text-slate-400 dark:text-zinc-600 text-right tabular-nums">
                <div className="relative flex-1 min-h-0">
                    {gridLines.map(g => (
                        <span
                            key={g}
                            className="absolute right-0 leading-none translate-y-1/2"
                            style={{ bottom: `${g * 100}%` }}
                        >
                            {g === 0 ? "0" : `₮${formatTk(Math.round(max * g))}`}
                        </span>
                    ))}
                </div>
                {/* Labels мөртэй өндрөө тааруулах зай */}
                <div className="mt-3 leading-tight invisible" aria-hidden>0</div>
            </div>

            {/* Plot + labels (гүйлгэдэг) */}
            <div ref={outerRef} className="flex-1 overflow-x-auto pb-1">
                <div className="h-full flex flex-col" style={{ minWidth: `max(100%, ${data.length * (BAR_MIN_W + 10)}px)` }}>
                    {/* Plot area */}
                    <div className="relative flex-1 min-h-0">
                        {/* Grid lines */}
                        {gridLines.map(g => (
                            <div
                                key={g}
                                className={`absolute inset-x-0 border-t ${g === 0 ? "border-slate-200 dark:border-zinc-700" : "border-dashed border-slate-100 dark:border-zinc-800/60"}`}
                                style={{ bottom: `${g * 100}%` }}
                            />
                        ))}

                        {/* Дундаж шугам */}
                        {avg > 0 && (
                            <div
                                className="absolute inset-x-0 border-t border-dashed border-teal-400/50 dark:border-teal-500/40 transition-all duration-700"
                                style={{ bottom: started ? `${avgPct}%` : 0 }}
                            >
                                <span className="absolute right-0 -top-4 px-1.5 py-0.5 rounded-md bg-teal-500/10 text-teal-500 text-[9px] font-bold leading-none">
                                    дундаж ₮{formatTk(Math.round(avg))}
                                </span>
                            </div>
                        )}

                        {/* Bars */}
                        <div className="absolute inset-0 flex items-stretch gap-2">
                            {data.map((d, i) => {
                                const rev = Number(d.revenue);
                                const pct = started ? (rev / max) * 100 : 0;
                                const active = hovered === i;
                                const dimmed = hovered !== null && !active;
                                return (
                                    <div
                                        key={i}
                                        className="relative flex-1 h-full group cursor-default"
                                        style={{ minWidth: BAR_MIN_W }}
                                        onMouseEnter={() => setHovered(i)}
                                        onMouseLeave={() => setHovered(null)}
                                    >
                                        {/* Hover track */}
                                        <div className="absolute inset-x-0 bottom-0 top-0 rounded-xl bg-slate-100/70 dark:bg-zinc-800/40 opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {/* Bar */}
                                        <div
                                            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] max-w-[40px] rounded-t-[10px] bg-gradient-to-t transition-all ease-out ${active
                                                ? "from-teal-600 via-teal-500 to-emerald-300 shadow-lg shadow-teal-500/30"
                                                : "from-teal-500 to-teal-300"
                                                } ${dimmed ? "opacity-40" : "opacity-100"}`}
                                            style={{
                                                height: started ? `max(${pct}%, ${rev > 0 ? 4 : 0}px)` : 0,
                                                transitionDuration: "700ms",
                                                transitionDelay: `${Math.min(i * 25, 350)}ms`,
                                            }}
                                        >
                                            {/* Дээд талын гялбаа */}
                                            <div className="absolute inset-x-0 top-0 h-1/3 rounded-t-[10px] bg-white/20" />
                                        </div>

                                        {/* Tooltip */}
                                        <div
                                            className={`absolute left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold whitespace-nowrap shadow-xl pointer-events-none transition-all duration-150 z-10 ${active && rev > 0 ? "opacity-100 -translate-y-1" : "opacity-0 translate-y-0"}`}
                                            style={{ bottom: `calc(${pct}% + 8px)` }}
                                        >
                                            ₮{rev.toLocaleString()}
                                            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45 bg-slate-900 dark:bg-white" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="flex gap-2 mt-3">
                        {data.map((d, i) => (
                            <span
                                key={i}
                                className={`flex-1 text-[10px] font-semibold text-center truncate leading-tight transition-colors ${hovered === i ? "text-teal-500" : "text-slate-400 dark:text-zinc-600"}`}
                                style={{ minWidth: BAR_MIN_W }}
                            >
                                {d.date}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Monthly revenue goal ring ────────────────────────────────────────────────

function MonthlyGoalCard({
    goal, current, month, daysLeft, onConfigure,
}: {
    goal: number; current: number; month: string; daysLeft: number; onConfigure: () => void;
}) {
    const [started, setStarted] = useState(false);
    useEffect(() => { const t = setTimeout(() => setStarted(true), 80); return () => clearTimeout(t); }, []);

    const SIZE = 132, STROKE = 12;
    const r = (SIZE - STROKE) / 2;
    const circ = 2 * Math.PI * r;
    const pct = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
    const offset = circ * (1 - (started ? pct : 0) / 100);
    const remaining = Math.max(0, goal - current);
    const reached = goal > 0 && current >= goal;

    return (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-6">
            <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    🎯 Сарын зорилт
                </h3>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">{month}</span>
            </div>

            {goal <= 0 ? (
                <div className="py-6 text-center">
                    <p className="text-sm text-slate-400 dark:text-zinc-500 mb-3">Орлогын зорилт тохируулаагүй байна</p>
                    <button
                        onClick={onConfigure}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-500/10 text-teal-500 hover:bg-teal-500/20 transition-colors"
                    >
                        Зорилт тохируулах →
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-5">
                    {/* Ring */}
                    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
                        <svg width={SIZE} height={SIZE} className="-rotate-90">
                            <defs>
                                <linearGradient id="goalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#14b8a6" />
                                    <stop offset="100%" stopColor="#34d399" />
                                </linearGradient>
                            </defs>
                            <circle
                                cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none" strokeWidth={STROKE}
                                className="stroke-slate-100 dark:stroke-zinc-800"
                            />
                            <circle
                                cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none" strokeWidth={STROKE}
                                stroke="url(#goalGrad)" strokeLinecap="round"
                                strokeDasharray={circ} strokeDashoffset={offset}
                                style={{ transition: "stroke-dashoffset 1100ms cubic-bezier(0.22,1,0.36,1)" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">{Math.round(pct)}%</span>
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500">₮{formatTk(current)}</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-1 min-w-0 space-y-2.5">
                        <div>
                            <p className="text-[11px] text-slate-400 dark:text-zinc-500">Зорилт</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">₮{goal.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-400 dark:text-zinc-500">Бодит</p>
                            <p className="text-sm font-bold text-teal-500 tabular-nums">₮{current.toLocaleString()}</p>
                        </div>
                        {reached ? (
                            <p className="text-xs font-bold text-emerald-500">🎉 Зорилтод хүрсэн!</p>
                        ) : (
                            <div>
                                <p className="text-[11px] text-slate-400 dark:text-zinc-500">Үлдсэн</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                                    ₮{remaining.toLocaleString()}
                                    <span className="ml-1.5 text-[11px] font-medium text-slate-400 dark:text-zinc-500">· {daysLeft} хоног</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Generic donut chart (ангилал, бараа г.м) ─────────────────────────────────

const DONUT_COLORS = ["#14b8a6", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#10b981"];

type DonutDatum = { name: string; value: number };

function Donut({
    title, subtitle, data, unit, format, empty,
}: {
    title: string;
    subtitle: string;
    data: DonutDatum[];
    unit: string;                       // hover байхгүй үед төвд харагдах нэгж ("нийт")
    format: (n: number) => string;      // утгыг форматлах (₮/ширхэг г.м)
    empty: string;                      // өгөгдөлгүй үеийн текст
}) {
    const [started, setStarted] = useState(false);
    const [hovered, setHovered] = useState<number | null>(null);
    useEffect(() => { const t = setTimeout(() => setStarted(true), 80); return () => clearTimeout(t); }, []);

    const total = data.reduce((s, d) => s + d.value, 0);
    const SIZE = 150, STROKE = 20;
    const r = (SIZE - STROKE) / 2;
    const circ = 2 * Math.PI * r;

    const focus = hovered !== null ? data[hovered] : null;

    return (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mb-5">{subtitle}</p>

            {total <= 0 ? (
                <div className="py-10 text-center text-sm text-slate-400 dark:text-zinc-600">
                    {empty}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-6">
                    {/* Donut */}
                    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
                        <svg width={SIZE} height={SIZE} className="-rotate-90">
                            {(() => {
                                let acc = 0;
                                return data.map((d, i) => {
                                    const frac = d.value / total;
                                    const dash = started ? frac * circ : 0;
                                    const slice = (
                                        <circle
                                            key={i}
                                            cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none"
                                            stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
                                            strokeWidth={hovered === i ? STROKE + 4 : STROKE}
                                            strokeDasharray={`${dash} ${circ}`}
                                            strokeDashoffset={-acc * circ}
                                            style={{
                                                transitionProperty: "stroke-dasharray, stroke-width, opacity",
                                                transitionDuration: "800ms",
                                                transitionDelay: `${Math.min(i * 80, 400)}ms`,
                                                opacity: hovered === null || hovered === i ? 1 : 0.35,
                                            }}
                                            onMouseEnter={() => setHovered(i)}
                                            onMouseLeave={() => setHovered(null)}
                                        />
                                    );
                                    acc += frac;
                                    return slice;
                                });
                            })()}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            {focus ? (
                                <>
                                    <span className="text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
                                        {Math.round((focus.value / total) * 100)}%
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 max-w-[90px] truncate text-center">{focus.name}</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">{format(total)}</span>
                                    <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500">{unit}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Legend */}
                    <ul className="w-full space-y-2 min-w-0">
                        {data.map((d, i) => {
                            const pct = Math.round((d.value / total) * 100);
                            return (
                                <li
                                    key={i}
                                    className={`flex items-center gap-2.5 rounded-lg px-1.5 py-1 cursor-default transition-colors ${hovered === i ? "bg-slate-50 dark:bg-zinc-800/50" : ""}`}
                                    onMouseEnter={() => setHovered(i)}
                                    onMouseLeave={() => setHovered(null)}
                                >
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                                    <span className="flex-1 text-xs font-medium text-slate-600 dark:text-zinc-300 truncate">{d.name}</span>
                                    <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">{pct}%</span>
                                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 tabular-nums w-16 text-right">{format(d.value)}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}

// ─── Top products horizontal bars ────────────────────────────────────────────

// ─── Order status donut (pure CSS) ────────────────────────────────────────────

function StatusRing({ value, total, color, label }: { value: number; total: number; color: string; label: string }) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
            <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 dark:text-zinc-400">{label}</span>
                    <span className="text-slate-600 dark:text-zinc-300 font-bold">{value}</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%`, transition: "width 800ms ease-out" }} />
                </div>
            </div>
        </div>
    );
}

// ─── Low stock card ────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
    simple: "Энгийн",
    variant: "Хувилбартай",
    stock: "Өнгө/хэмжээ",
};

function LowStockCard({
    data, onSeeAll, onProductClick,
}: {
    data?: LowStockSummary;
    onSeeAll: () => void;
    onProductClick: (id: number) => void;
}) {
    const items = data?.items ?? [];
    const threshold = data?.threshold ?? 5;
    const total = data?.total ?? 0;

    return (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-6">
            <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Бага үлдэгдэлтэй бараа
                </h3>
                {total > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/10 text-amber-500">{total}</span>
                )}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mb-4">
                Үлдэгдэл {threshold}-аас бага бараанууд
            </p>

            {items.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400 dark:text-zinc-600">
                    Бага үлдэгдэлтэй бараа алга 🎉
                </div>
            ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {items.map(p => (
                        <li key={p.id}>
                            <button
                                onClick={() => onProductClick(p.id)}
                                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{p.name}</p>
                                    <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                                        {TYPE_LABEL[p.type] ?? p.type}
                                        {p.variantCount > 0 && ` · ${p.variantCount} хувилбар`}
                                    </p>
                                </div>
                                <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums ${p.totalStock <= 0
                                    ? "bg-red-500/10 text-red-500"
                                    : "bg-amber-500/10 text-amber-500"
                                    }`}>
                                    {p.totalStock} ширхэг
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {total > items.length && (
                <button
                    onClick={onSeeAll}
                    className="mt-4 w-full text-center text-xs font-bold text-teal-500 hover:text-teal-400 transition-colors"
                >
                    Бүгдийг харах ({total}) →
                </button>
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
    const { dashboardData, fetchDashboardData, setActivePage, setEditingProductId } = useAdmin();
    const [statsStarted, setStatsStarted] = useState(false);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const statsRef = useRef<HTMLDivElement>(null);

    const handleDateChange = (from: string, to: string) => {
        setDateFrom(from);
        setDateTo(to);
        fetchDashboardData(from || undefined, to || undefined);
    };

    useEffect(() => {
        const el = statsRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setStatsStarted(true); obs.disconnect(); } },
            { threshold: 0.2 }
        );

        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const summary = dashboardData?.summary;
    const chart = dashboardData?.chartData ?? [];
    const top = dashboardData?.topProducts ?? [];
    const recent = dashboardData?.recentOrders ?? [];
    const lowStock = dashboardData?.lowStock;
    const revenueGoal = dashboardData?.revenueGoal;
    const categoryStats = dashboardData?.categoryStats ?? [];

    // Дугуй графикийн өгөгдөл
    const productStats = top.map(p => ({ name: p.name ?? "—", value: Number(p.totalSold) || 0 }));
    const categoryData = categoryStats.map(c => ({ name: c.name, value: c.revenue }));

    const openProduct = (id: number) => {
        setEditingProductId(id);
        setActivePage("Бүтээгдэхүүн засах");
    };

    const totalOrders = summary?.totalOrders ?? 0;

    // Order status breakdown from recent orders (approximation from summary)
    const statusRows = [
        { label: "Хүлээгдэж буй", value: summary?.pendingOrders ?? 0, color: "bg-yellow-500" },
        { label: "Хүргэгдсэн", value: Math.max(0, totalOrders - (summary?.pendingOrders ?? 0)), color: "bg-teal-500" },
    ];

    const [today, setToday] = useState("");
    useEffect(() => {
        setToday(new Date().toLocaleDateString("mn-MN", { year: "numeric", month: "long", day: "numeric" }));
    }, []);

    return (
        <>
            {/* ── Header ── */}
            <DashboardHeader
                today={today}
                setActivePage={setActivePage}
                onDateChange={handleDateChange}
                dateFrom={dateFrom}
                dateTo={dateTo}
            />

            {/* ── Stat cards ── */}
            <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Нийт орлого" rawValue={summary?.totalRevenue ?? 0} prefix="₮" color="bg-teal-500" icon="💰" started={statsStarted} />
                <StatCard label="Нийт захиалга" rawValue={summary?.totalOrders ?? 0} color="bg-blue-500" icon="📦" started={statsStarted} />
                <StatCard label="Хэрэглэгчид" rawValue={summary?.totalUsers ?? 0} color="bg-violet-500" icon="👥" started={statsStarted} />
                <StatCard label="Нийт бараа" rawValue={summary?.totalProducts ?? 0} color="bg-amber-500" icon="🏬" started={statsStarted} />
            </div>

            {/* ── Charts row: орлогын график + захиалгын төлөв ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* Revenue bar chart */}
                <div className="lg:col-span-2 flex flex-col bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-6">
                    <LastWeekIncome chart={chart} dateFrom={dateFrom} dateTo={dateTo} />

                    <div className="mt-5 flex-1 min-h-0">
                        {chart.length > 0 ? (
                            <RevenueBarChart data={chart} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 dark:text-zinc-600 text-sm" style={{ minHeight: PLOT_H }}>
                                Өгөгдөл байхгүй
                            </div>
                        )}
                    </div>
                </div>

                {/* Захиалгын төлөв (орлогын графикийн хажууд) */}
                <div className="flex flex-col gap-6">
                    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-5">Захиалгын төлөв</h3>
                        <div className="space-y-4">
                            {statusRows.map(r => (
                                <StatusRing key={r.label} {...r} total={totalOrders} />
                            ))}
                        </div>
                        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-between text-xs">
                            <span className="text-slate-400 dark:text-zinc-500">Нийт захиалга</span>
                            <span className="font-bold text-slate-900 dark:text-white">{totalOrders}</span>
                        </div>
                    </div>

                    {/* Pending alert */}
                    {(summary?.pendingOrders ?? 0) > 0 && (
                        <button
                            onClick={() => setActivePage("Захиалгууд")}
                            className="w-full flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl hover:bg-yellow-500/20 transition-colors text-left"
                        >
                            <span className="text-xl">⏳</span>
                            <div>
                                <p className="text-yellow-400 font-bold text-sm">{summary!.pendingOrders} захиалга хүлээгдэж байна</p>
                                <p className="text-yellow-600 text-xs">Харах →</p>
                            </div>
                        </button>
                    )}
                </div>
            </div>

            {/* ── Дугуй графикууд: зорилт · бараа · ангилал ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Сарын орлогын зорилт */}
                <MonthlyGoalCard
                    goal={revenueGoal?.goal ?? 0}
                    current={revenueGoal?.current ?? 0}
                    month={revenueGoal?.month ?? ""}
                    daysLeft={revenueGoal?.daysLeft ?? 0}
                    onConfigure={() => setActivePage("Тохиргоо")}
                />

                {/* Шилдэг бараа (зарагдсан тоо ширхгээр) */}
                <Donut
                    title="Шилдэг бараа"
                    subtitle="Зарагдсан тоо ширхгээр"
                    data={productStats}
                    unit="ширхэг"
                    format={n => `${Math.round(n)}ш`}
                    empty="Борлуулалт алга"
                />

                {/* Ангиллын борлуулалт */}
                <Donut
                    title="Ангиллын борлуулалт"
                    subtitle="Хүргэгдсэн захиалгуудаар"
                    data={categoryData}
                    unit="нийт"
                    format={n => `₮${formatTk(n)}`}
                    empty="Хүргэгдсэн захиалга алга"
                />
            </div>

            {/* ── Top products + recent orders ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* Top selling */}
                <TopSelledProducts top={top} setActivePage={setActivePage} />

                {/* Recent orders */}
                <RecentOrderTable recent={recent} setActivePage={setActivePage} />
            </div>

            {/* ── Бага үлдэгдэлтэй бараа (тусдаа мөр) ── */}
            <LowStockCard
                data={lowStock}
                onSeeAll={() => setActivePage("Тайлан")}
                onProductClick={openProduct}
            />
        </>
    );
}
