"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { Boxes, Package, AlertTriangle, XCircle, Download, Search, ChevronRight, BarChart3 } from "lucide-react";
import { exportInventoryToExcel } from "@/utils/exportExcel";

type InvType = "simple" | "variant" | "stock";

interface BreakdownRow { label: string; sku: string | null; stock: number; }
interface InventoryItem {
    productId: number;
    name: string;
    sku: string | null;
    categoryName: string | null;
    type: InvType;
    totalStock: number;
    variantCount: number;
    lowStock: boolean;
    outOfStock: boolean;
    breakdown: BreakdownRow[];
}
interface InventoryData {
    threshold: number;
    summary: { totalProducts: number; totalUnits: number; lowStockCount: number; outOfStockCount: number };
    items: InventoryItem[];
}

const TYPE_LABEL: Record<InvType, string> = {
    simple:  "Энгийн",
    variant: "Хувилбартай",
    stock:   "Өнгө/хэмжээ",
};

const thCls = "px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-zinc-500";
const tdCls = "px-6 py-4";

export default function InventoryReport() {
    const [search,       setSearch]       = useState("");
    const [categoryId,   setCategoryId]   = useState<number>(0);
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [categories,   setCategories]   = useState<{ id: number; name: string }[]>([]);
    const [data,         setData]         = useState<InventoryData | null>(null);
    const [loading,      setLoading]      = useState(false);
    const [expanded,     setExpanded]     = useState<Set<number>>(new Set());

    useEffect(() => {
        fetch("/api/admin/category")
            .then(r => r.json())
            .then(d => setCategories(Array.isArray(d) ? d.map((c: any) => ({ id: c.id, name: c.name })) : []))
            .catch(() => {});
    }, []);

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        try {
            const q = new URLSearchParams();
            if (search.trim())   q.set("search", search.trim());
            if (categoryId)      q.set("categoryId", String(categoryId));
            if (lowStockOnly)    q.set("lowStockOnly", "true");
            const res = await fetch(`/api/admin/inventory?${q}`);
            const d   = await res.json();
            if (res.ok) setData(d);
        } finally {
            setLoading(false);
        }
    }, [search, categoryId, lowStockOnly]);

    const toggleRow = (id: number) =>
        setExpanded(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const summary = data?.summary;
    const items   = data?.items ?? [];
    const threshold = data?.threshold ?? 5;

    const cards = [
        { label: "Нийт бараа",      value: summary?.totalProducts ?? 0, color: "text-slate-700 dark:text-zinc-200", bg: "bg-slate-500/10",  icon: <Package className="w-5 h-5" /> },
        { label: "Нийт үлдэгдэл",   value: summary?.totalUnits ?? 0,    color: "text-teal-500",  bg: "bg-teal-500/10",  icon: <Boxes className="w-5 h-5" /> },
        { label: "Бага үлдэгдэлтэй", value: summary?.lowStockCount ?? 0, color: "text-amber-500", bg: "bg-amber-500/10", icon: <AlertTriangle className="w-5 h-5" /> },
        { label: "Дууссан",         value: summary?.outOfStockCount ?? 0, color: "text-red-500", bg: "bg-red-500/10",   icon: <XCircle className="w-5 h-5" /> },
    ];

    return (
        <>
            {/* ── Filters ── */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 mb-6 flex flex-wrap items-end gap-4">
                {/* Search */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Хайх</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Барааны нэр, SKU, баркод"
                            className="w-full h-11 pl-10 pr-4 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                        />
                    </div>
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Ангилал</label>
                    <select
                        value={categoryId}
                        onChange={e => setCategoryId(Number(e.target.value))}
                        className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                    >
                        <option value={0}>Бүгд</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                {/* Low stock toggle */}
                <button
                    onClick={() => setLowStockOnly(v => !v)}
                    className={`h-11 px-4 rounded-2xl border text-sm font-bold transition-all whitespace-nowrap ${
                        lowStockOnly
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-500"
                            : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:border-slate-300"
                    }`}
                >
                    Зөвхөн бага үлдэгдэл
                </button>

                {/* Generate */}
                <button
                    onClick={fetchInventory}
                    disabled={loading}
                    className="h-11 flex items-center gap-2 px-5 rounded-2xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <BarChart3 className="w-4 h-4" />
                    )}
                    Тайлан гаргах
                </button>

                {/* Export */}
                <button
                    onClick={() => data && exportInventoryToExcel(data)}
                    disabled={!data || items.length === 0}
                    className="h-11 flex items-center gap-2 px-5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Excel татах
                </button>
            </div>

            {/* ── Empty state (тайлан гараагүй) ── */}
            {!data && !loading && (
                <div className="flex flex-col items-center justify-center py-24 text-slate-300 dark:text-zinc-700">
                    <Boxes className="w-14 h-14 mb-4" />
                    <p className="font-semibold text-slate-500 dark:text-zinc-500">
                        Шүүлтүүрээ сонгоод «Тайлан гаргах» дарна уу
                    </p>
                </div>
            )}

            {data && (<>
            {/* ── Summary cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {cards.map(c => (
                    <div key={c.label} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-3xl flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${c.bg} ${c.color}`}>{c.icon}</div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">{c.label}</p>
                            <p className={`text-2xl font-extrabold tabular-nums ${c.color}`}>{c.value.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Table ── */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-100 dark:border-zinc-800">
                            <tr>
                                <th className={thCls}>Бараа</th>
                                <th className={thCls}>Ангилал</th>
                                <th className={thCls}>Төрөл</th>
                                <th className={thCls + " text-right"}>Нийт үлдэгдэл</th>
                                <th className={thCls + " text-right"}>Төлөв</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-16 text-center">
                                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-teal-500" />
                                </td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-16 text-center text-sm text-slate-400 dark:text-zinc-600">Бараа олдсонгүй</td></tr>
                            ) : items.map(item => {
                                const isOpen = expanded.has(item.productId);
                                const hasBreakdown = item.breakdown.length > 0;
                                return (
                                    <Fragment key={item.productId}>
                                        <tr
                                            onClick={() => hasBreakdown && toggleRow(item.productId)}
                                            className={`transition-colors ${hasBreakdown ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/30" : ""}`}
                                        >
                                            <td className={tdCls}>
                                                <div className="flex items-center gap-2">
                                                    {hasBreakdown && (
                                                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.name}</p>
                                                        {item.sku && <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{item.sku}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={tdCls + " text-sm text-slate-500 dark:text-zinc-400"}>{item.categoryName ?? "—"}</td>
                                            <td className={tdCls}>
                                                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                                                    {TYPE_LABEL[item.type]}
                                                    {item.variantCount > 0 && ` (${item.variantCount})`}
                                                </span>
                                            </td>
                                            <td className={tdCls + " text-right font-bold tabular-nums text-slate-900 dark:text-white"}>
                                                {item.totalStock.toLocaleString()}
                                            </td>
                                            <td className={tdCls + " text-right"}>
                                                {item.outOfStock ? (
                                                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/10 text-red-500">Дууссан</span>
                                                ) : item.lowStock ? (
                                                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-500">Бага</span>
                                                ) : (
                                                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-500/10 text-teal-500">Хангалттай</span>
                                                )}
                                            </td>
                                        </tr>

                                        {/* Хувилбарын задаргаа */}
                                        {isOpen && hasBreakdown && (
                                            <tr className="bg-slate-50/60 dark:bg-zinc-950/30">
                                                <td colSpan={5} className="px-6 py-3">
                                                    <div className="flex flex-col gap-1.5 pl-6">
                                                        {item.breakdown.map((b, i) => (
                                                            <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100 dark:border-zinc-800 last:border-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-slate-700 dark:text-zinc-300">{b.label}</span>
                                                                    {b.sku && <span className="text-xs text-slate-400 dark:text-zinc-600">{b.sku}</span>}
                                                                </div>
                                                                <span className={`font-bold tabular-nums px-2 py-0.5 rounded-md text-xs ${
                                                                    b.stock <= 0 ? "bg-red-500/10 text-red-500"
                                                                    : b.stock < threshold ? "bg-amber-500/10 text-amber-500"
                                                                    : "text-slate-600 dark:text-zinc-400"
                                                                }`}>
                                                                    {b.stock.toLocaleString()} ширхэг
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            </>)}
        </>
    );
}
