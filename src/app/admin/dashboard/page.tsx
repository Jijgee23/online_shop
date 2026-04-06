"use client";

import { useEffect, useRef, useState } from "react";
import { useAdmin } from "@/app/context/admin_context";
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

const BAR_AREA_PX = 120; // px reserved for bars (total container minus label row)

function RevenueBarChart({ data }: { data: { date: string; revenue: number }[] }) {
    const ref = useRef<HTMLDivElement>(null);
    const [started, setStarted] = useState(false);
    const [hovered, setHovered] = useState<number | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        // fire immediately if already in viewport
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } },
            { threshold: 0 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const max = Math.max(...data.map(d => Number(d.revenue)), 1);

    return (
        <div ref={ref} className="flex items-end gap-2 w-full" style={{ height: "160px" }}>
            {data.map((d, i) => {
                const rev = Number(d.revenue);
                const barPx = started
                    ? Math.max((rev / max) * BAR_AREA_PX, rev > 0 ? 4 : 0)
                    : 0;
                const active = hovered === i;
                return (
                    <div
                        key={i}
                        className="flex-1 flex flex-col items-center justify-end gap-1 cursor-default"
                        style={{ height: "160px" }}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                    >
                        {/* Tooltip */}
                        <div className={`text-[10px] font-bold text-teal-400 whitespace-nowrap transition-opacity duration-150 ${active && rev > 0 ? "opacity-100" : "opacity-0"}`}>
                            ₮{rev.toLocaleString()}
                        </div>

                        {/* Bar */}
                        <div
                            className={`w-full rounded-t-lg transition-all ease-out ${active ? "bg-teal-400" : "bg-teal-500/70"}`}
                            style={{
                                height: `${barPx}px`,
                                transitionDuration: "700ms",
                                transitionDelay: `${i * 60}ms`,
                            }}
                        />

                        {/* Label */}
                        <span className={`text-[10px] font-semibold transition-colors ${active ? "text-slate-600 dark:text-zinc-300" : "text-slate-400 dark:text-zinc-600"}`}>
                            {d.date}
                        </span>
                    </div>
                );
            })}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
    const { dashboardData, fetchDashboardData, setActivePage } = useAdmin();
    const [statsStarted, setStatsStarted] = useState(false);
    const statsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchDashboardData();
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

    const totalOrders = summary?.totalOrders ?? 0;

    // Order status breakdown from recent orders (approximation from summary)
    const statusRows = [
        { label: "Хүлээгдэж буй", value: summary?.pendingOrders ?? 0, color: "bg-yellow-500" },
        { label: "Хүргэгдсэн", value: Math.max(0, totalOrders - (summary?.pendingOrders ?? 0)), color: "bg-teal-500" },
    ];

    const today = new Date().toLocaleDateString("mn-MN", { year: "numeric", month: "long", day: "numeric" });

    return (
        <>
            {/* ── Header ── */}
            <DashboardHeader today={today} setActivePage={setActivePage} />

            {/* ── Stat cards ── */}
            <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Нийт орлого" rawValue={summary?.totalRevenue ?? 0} prefix="₮" color="bg-teal-500" icon="💰" started={statsStarted} />
                <StatCard label="Нийт захиалга" rawValue={summary?.totalOrders ?? 0} color="bg-blue-500" icon="📦" started={statsStarted} />
                <StatCard label="Хэрэглэгчид" rawValue={summary?.totalUsers ?? 0} color="bg-violet-500" icon="👥" started={statsStarted} />
                <StatCard label="Нийт бараа" rawValue={summary?.totalProducts ?? 0} color="bg-amber-500" icon="🏬" started={statsStarted} />
            </div>

            {/* ── Charts row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* Revenue bar chart */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-6">
                    <LastWeekIncome chart={chart} />

                    {/* Y-axis hint */}
                    <div className="flex justify-end mb-1">
                        <span className="text-[10px] text-slate-500 dark:text-zinc-700">
                            max ₮{Math.max(...chart.map(d => d.revenue), 0).toLocaleString()}
                        </span>
                    </div>

                    {chart.length > 0 ? (
                        <RevenueBarChart data={chart} />
                    ) : (
                        <div className="h-40 flex items-center justify-center text-slate-400 dark:text-zinc-600 text-sm">
                            Өгөгдөл байхгүй
                        </div>
                    )}
                </div>

                {/* Order status + top products */}
                <div className="space-y-6">
                    {/* Status breakdown */}
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-5">Захиалгын төлөв</h3>
                        <div className="space-y-4">
                            {statusRows.map(r => (
                                <StatusRing key={r.label} {...r} total={totalOrders} />
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-between text-xs">
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

            {/* ── Top products + recent orders ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Top selling */}
                <TopSelledProducts top={top} setActivePage={setActivePage} />

                {/* Recent orders */}
                <RecentOrderTable recent={recent} setActivePage={setActivePage} />
            </div>
        </>
    );
}
