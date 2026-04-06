"use client";

import { OrderStatus } from "@/generated/prisma";
import { useCallback, useEffect, useState } from "react";
import AdminOrderTile from "./components/AdminOrderTile";
import { Order } from "@/interface/order";
import Pagination from "@/ui/Pagination";
import { usePersistedPage } from "@/app/hooks/usePersistedPage";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
    { value: "newest",     label: "Шинэ эхэлж" },
    { value: "oldest",     label: "Хуучин эхэлж" },
    { value: "total_desc", label: "Дүн: Их → Бага" },
    { value: "total_asc",  label: "Дүн: Бага → Их" },
];

const STATUS_OPTIONS = [
    { value: "all",                 label: "Бүгд" },
    { value: OrderStatus.PENDING,   label: "Хүлээгдэж буй" },
    { value: OrderStatus.PAID,      label: "Баталгаажсан" },
    { value: OrderStatus.SHIPPED,   label: "Хүргэлтэнд гарсан" },
    { value: OrderStatus.DELIVERED, label: "Хүргэгдсэн" },
    { value: OrderStatus.CANCELLED, label: "Цуцлагдсан" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
    const [orders,  setOrders]  = useState<Order[]>([]);
    const [total,   setTotal]   = useState(0);
    const [loading, setLoading] = useState(false);

    const [searchTerm,   setSearchTerm]   = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy,       setSortBy]       = useState("newest");
    const [priceMin,     setPriceMin]     = useState("");
    const [priceMax,     setPriceMax]     = useState("");
    const [dateFrom,     setDateFrom]     = useState("");
    const [dateTo,       setDateTo]       = useState("");
    const [showFilters,  setShowFilters]  = useState(false);

    const [page, setPage] = usePersistedPage("admin:orders:page", [searchTerm, statusFilter, sortBy, priceMin, priceMax, dateFrom, dateTo]);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        const q = new URLSearchParams();
        q.set("page",     String(page));
        q.set("pageSize", String(PAGE_SIZE));
        if (searchTerm)             q.set("search",   searchTerm);
        if (statusFilter !== "all") q.set("status",   statusFilter);
        if (sortBy)                 q.set("sort",     sortBy);
        if (priceMin)               q.set("priceMin", priceMin);
        if (priceMax)               q.set("priceMax", priceMax);
        if (dateFrom)               q.set("dateFrom", dateFrom);
        if (dateTo)                 q.set("dateTo",   dateTo);

        try {
            const res  = await fetch(`/api/admin/order?${q.toString()}`);
            const data = await res.json();
            if (res.ok) { setOrders(data.orders || []); setTotal(data.total ?? 0); }
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, statusFilter, sortBy, priceMin, priceMax, dateFrom, dateTo]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const activeFilterCount = [
        statusFilter !== "all", !!priceMin, !!priceMax, !!dateFrom, !!dateTo, sortBy !== "newest",
    ].filter(Boolean).length;

    const resetFilters = () => {
        setStatusFilter("all"); setSortBy("newest");
        setPriceMin(""); setPriceMax(""); setDateFrom(""); setDateTo("");
    };

    const inputCls = "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all";

    return (
        <>
            {/* ── Header ── */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Захиалгууд</h2>
                    <p className="text-slate-400 dark:text-zinc-500 text-sm">
                        Нийт <span className="text-white font-semibold">{total}</span> захиалга
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto flex-wrap">
                    <div className="relative group flex-1 min-w-60">
                        <input
                            type="text"
                            placeholder="Дугаар, нэр, имэйлээр хайх..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
                        />
                        <svg className="w-4 h-4 absolute left-4 top-3.5 text-slate-400 dark:text-zinc-500 group-focus-within:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <button
                        onClick={() => setShowFilters(v => !v)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-bold transition-all
                            ${showFilters || activeFilterCount > 0
                                ? "bg-teal-500/10 border-teal-500/40 text-teal-400"
                                : "border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-600"}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                        </svg>
                        Шүүлтүүр
                        {activeFilterCount > 0 && (
                            <span className="bg-teal-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* ── Filter bar ── */}
            {showFilters && (
                <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Төлөв</label>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputCls}>
                            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Эрэмбэ</label>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={inputCls}>
                            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Дүн (мин)</label>
                        <input type="number" placeholder="₮ 0" value={priceMin} onChange={e => setPriceMin(e.target.value)}
                            className={inputCls + " [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Дүн (макс)</label>
                        <input type="number" placeholder="₮ ∞" value={priceMax} onChange={e => setPriceMax(e.target.value)}
                            className={inputCls + " [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Огноо (эхлэх)</label>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={inputCls + " [color-scheme:dark]"} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Огноо (дуусах)</label>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={inputCls + " [color-scheme:dark]"} />
                    </div>
                    {activeFilterCount > 0 && (
                        <div className="col-span-2 sm:col-span-3 lg:col-span-6 flex justify-end">
                            <button onClick={resetFilters} className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors">
                                Шүүлтүүр арилгах ({activeFilterCount})
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ── Stats row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Нийт",          value: total,                                                                color: "text-slate-900 dark:text-white" },
                    { label: "Хүлээгдэж буй", value: orders.filter(o => o.status === OrderStatus.PENDING).length,   color: "text-yellow-400" },
                    { label: "Хүргэгдсэн",    value: orders.filter(o => o.status === OrderStatus.DELIVERED).length, color: "text-green-400" },
                    { label: "Цуцлагдсан",    value: orders.filter(o => o.status === OrderStatus.CANCELLED).length, color: "text-red-400" },
                ].map(s => (
                    <div key={s.label} className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 p-5 rounded-3xl">
                        <p className="text-slate-400 dark:text-zinc-500 text-xs font-bold uppercase mb-1">{s.label}</p>
                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Table ── */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-100 dark:bg-zinc-950/50 text-slate-400 dark:text-zinc-500 text-[10px] uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-8 py-5">Захиалгын дугаар</th>
                                <th className="px-8 py-5">Хэрэглэгч</th>
                                <th className="px-8 py-5">Огноо</th>
                                <th className="px-8 py-5 text-center">Барааны тоо</th>
                                <th className="px-8 py-5">Төлөв</th>
                                <th className="px-8 py-5 text-right">Дүн</th>
                                <th className="px-8 py-5 text-right">Үйлдэл</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-16 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500" />
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-16 text-center text-slate-400 dark:text-zinc-600">
                                        <div className="text-3xl mb-3">📋</div>
                                        <p className="font-semibold">Захиалга олдсонгүй</p>
                                        {activeFilterCount > 0 && (
                                            <button onClick={resetFilters} className="mt-3 text-teal-400 text-sm hover:underline">
                                                Шүүлтүүрийг арилгах
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                orders.map(order => <AdminOrderTile key={order.id} {...order} />)
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-slate-50 dark:bg-zinc-950/20 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-center text-xs text-slate-400 dark:text-zinc-500">
                    <span>
                        {total > 0
                            ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} / нийт ${total} захиалга`
                            : "Захиалга байхгүй"}
                    </span>
                    <span className="font-bold text-teal-400">
                        Нийт дүн: ₮{orders.reduce((s, o) => s + (Number(o.totalPrice) || 0), 0).toLocaleString()}
                    </span>
                </div>
            </div>

            {/* ── Pagination ── */}
            <Pagination
                currentPage={page}
                totalItems={total}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
            />
        </>
    );
}
