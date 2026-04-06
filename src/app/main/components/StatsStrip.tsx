"use client";

import { useEffect, useRef, useState } from "react";
import { useSettings, type StoreSettings } from "@/app/context/settings_context";

type StatItem = { icon: string; value: number; suffix: string; label: string; sub: string; visibilityKey: keyof StoreSettings };

const ALL_STATS: StatItem[] = [
    { icon: "📦", value: 0, suffix: "+", label: "Бүтээгдэхүүн",       sub: "Байнга шинэчлэгддэг",   visibilityKey: "showStatProducts"     },
    { icon: "🛒", value: 0, suffix: "+", label: "Захиалга",            sub: "Амжилттай хүргэгдсэн",  visibilityKey: "showStatOrders"       },
    { icon: "😊", value: 0, suffix: "%", label: "Сэтгэл ханамж",      sub: "Хэрэглэгчдийн үнэлгээ", visibilityKey: "showStatSatisfaction" },
    { icon: "🚚", value: 4, suffix: "ц", label: "Хүргэлтийн хугацаа", sub: "Улаанбаатар дотор",      visibilityKey: "showStatDelivery"     },
];

export function StatsStrip() {
    const { settings, loading: settingsLoading } = useSettings();
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView]     = useState(false);
    const [statsLoaded, setStatsLoaded] = useState(false);
    const [numbers, setNumbers]   = useState({ totalProducts: 0, totalOrders: 0, satisfaction: 0 });

    useEffect(() => {
        fetch("/api/stats")
            .then(r => r.json())
            .then(d => {
                setNumbers({
                    totalProducts: Number(d.totalProducts) || 0,
                    totalOrders:   Number(d.totalOrders)   || 0,
                    satisfaction:  Number(d.satisfaction)  || 0,
                });
                setStatsLoaded(true);
            })
            .catch(() => setStatsLoaded(true));
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
            { threshold: 0.3 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const started = inView && statsLoaded && !settingsLoading;

    const visible = ALL_STATS
        .map((s, i) => ({
            ...s,
            value: [numbers.totalProducts, numbers.totalOrders, numbers.satisfaction, 4][i],
        }))
        .filter(s => settings[s.visibilityKey] !== false);

    const gridCls = (
        { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-2 md:grid-cols-4" } as Record<number, string>
    )[visible.length] ?? "grid-cols-2 md:grid-cols-4";

    if (!settingsLoading && visible.length === 0) return null;

    return (
        <div ref={ref} className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <div className={`max-w-7xl mx-auto px-6 py-6 grid ${gridCls} gap-6 text-center divide-x-0 md:divide-x divide-slate-100 dark:divide-slate-800`}>
                {visible.map(s => <StatCard key={s.label} {...s} started={started} />)}
            </div>
        </div>
    );
}

function useCountUp(target: number, duration = 1400, started: boolean) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!started) return;
        setCount(0);
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [started, target, duration]);
    return count;
}

function StatCard({ icon, value, suffix, label, sub, started }: Omit<StatItem, "visibilityKey"> & { started: boolean }) {
    const count = useCountUp(value, 1400, started);
    return (
        <div className="flex flex-col items-center gap-1 py-2">
            <span className="text-2xl mb-1">{icon}</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {count.toLocaleString()}{suffix}
            </p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>
        </div>
    );
}
