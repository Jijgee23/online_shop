import { PageKey } from "@/app/context/admin_context";
import { TopProduct } from "@/interface/dashboard";
import { useEffect, useRef, useState } from "react";



export function TopSelledProducts({ top, setActivePage }: { top: TopProduct[], setActivePage: (page: PageKey) => void }) {

    return (<div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-6">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white">Шилдэг борлуулалт</h3>
            <button onClick={() => setActivePage("Бүтээгдэхүүнүүд")} className="text-xs text-teal-400 font-bold hover:underline">
                Бүгд →
            </button>
        </div>
        {top.length > 0 ? (<TopProductBars products={top} />) : (
            <p className="text-slate-400 dark:text-zinc-600 text-sm text-center py-6">Өгөгдөл байхгүй</p>
        )}
    </div>)
}

function TopProductBars({ products }: { products: { name?: string | null; price?: number | null; totalSold?: number | null }[] }) {
    const ref = useRef<HTMLDivElement>(null);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } },
            { threshold: 0.2 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const max = Math.max(...products.map(p => p.totalSold ?? 0), 1);

    const COLORS = [
        "bg-teal-500",
        "bg-blue-500",
        "bg-violet-500",
        "bg-amber-500",
        "bg-pink-500",
    ];

    return (
        <div ref={ref} className="space-y-4">
            {products.map((p, i) => {
                const pct = ((p.totalSold ?? 0) / max) * 100;
                return (
                    <div key={i}>
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[70%]">{p.name ?? "—"}</span>
                            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 tabular-nums">{p.totalSold ?? 0} ш</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ease-out ${COLORS[i % COLORS.length]}`}
                                style={{
                                    width: started ? `${pct}%` : "0%",
                                    transitionDelay: `${i * 80}ms`,
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
