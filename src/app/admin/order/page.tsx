"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AdminOrderTile, { STATUS_LIST, getOrderStatusInfo } from "./components/AdminOrderTile";
import { Order, OrderStatus } from "@/interface/order";
import toast from "react-hot-toast";
import Pagination from "@/ui/Pagination";
import { usePersistedPage } from "@/app/hooks/usePersistedPage";
import DateRangePicker from "@/ui/DateRangePicker";
import { PAGE_SIZE, ORDER_SORT_OPTIONS as SORT_OPTIONS, ORDER_STATUS_OPTIONS as STATUS_OPTIONS } from "@/app/product/constants";

// ─── Customer picker ──────────────────────────────────────────────────────────

function CustomerPicker({ value, onChange }: {
    value: { id: number; name: string } | null;
    onChange: (v: { id: number; name: string } | null) => void;
}) {
    const [query,   setQuery]   = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [open,    setOpen]    = useState(false);
    const [loading, setLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const t = setTimeout(async () => {
            setLoading(true);
            try {
                const q = new URLSearchParams({ pageSize: "10" });
                if (query.trim()) q.set("search", query.trim());
                const res = await fetch(`/api/admin/customer?${q}`);
                const d   = await res.json();
                setResults(d.data ?? []);
            } finally { setLoading(false); }
        }, 250);
        return () => clearTimeout(t);
    }, [query, open]);

    const select = (c: any) => {
        onChange({ id: c.id, name: c.name });
        setOpen(false);
        setQuery("");
    };

    const clear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
    };

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => { setOpen(o => !o); setQuery(""); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold transition-all whitespace-nowrap ${
                    value
                        ? "bg-teal-500/10 border-teal-500/40 text-teal-400"
                        : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700"
                }`}
            >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {value ? value.name : "Хэрэглэгч"}
                {value && (
                    <span onClick={clear} className="hover:text-red-400 transition-colors">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute left-0 top-full mt-1.5 z-50 w-72 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-slate-100 dark:border-zinc-800">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                autoFocus
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Нэр, имэйл, утас..."
                                className="w-full bg-slate-50 dark:bg-zinc-800 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-800 dark:text-white outline-none placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                    <ul className="max-h-52 overflow-y-auto py-1">
                        {loading ? (
                            <li className="px-4 py-3 text-center">
                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-teal-500" />
                            </li>
                        ) : results.length === 0 ? (
                            <li className="px-4 py-3 text-sm text-slate-400 text-center">Олдсонгүй</li>
                        ) : results.map(c => (
                            <li key={c.id}>
                                <button type="button" onClick={() => select(c)}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800 ${value?.id === c.id ? "text-teal-500 font-semibold" : "text-slate-700 dark:text-zinc-300"}`}>
                                    <p className="font-medium">{c.name}</p>
                                    <p className="text-xs text-slate-400 dark:text-zinc-500">{c.email}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

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
    const [customer,     setCustomer]     = useState<{ id: number; name: string } | null>(null);
    const [showFilters,  setShowFilters]  = useState(false);

    const [selectedIds,         setSelectedIds]         = useState<number[]>([]);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);

    const [page, setPage] = usePersistedPage("admin:orders:page", [searchTerm, statusFilter, sortBy, priceMin, priceMax, dateFrom, dateTo, customer?.id]);

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
        if (customer)               q.set("userId",   String(customer.id));

        try {
            const res  = await fetch(`/api/admin/order?${q.toString()}`);
            const data = await res.json();
            if (res.ok) { setOrders(data.orders || []); setTotal(data.total ?? 0); }
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, statusFilter, sortBy, priceMin, priceMax, dateFrom, dateTo, customer]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const activeFilterCount = [
        statusFilter !== "all", !!priceMin, !!priceMax, !!(dateFrom || dateTo), sortBy !== "newest", !!customer,
    ].filter(Boolean).length;

    // Clear selection on filter/page change
    useEffect(() => { setSelectedIds([]); }, [page, searchTerm, statusFilter, sortBy, priceMin, priceMax, dateFrom, dateTo, customer]);

    const toggleSelect = useCallback((id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }, []);

    const isAllSelected = orders.length > 0 && orders.every(o => selectedIds.includes(o.id));
    const isPartial     = selectedIds.length > 0 && !isAllSelected;
    const toggleSelectAll = () => setSelectedIds(isAllSelected ? [] : orders.map(o => o.id));

    const handleBulkStatusChange = async (status: OrderStatus) => {
        setShowBulkStatusDialog(false);
        // Optimistic update
        setOrders(cur => cur.map(o => selectedIds.includes(o.id) ? { ...o, status } : o));
        try {
            const res = await fetch("/api/admin/order/bulk", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedIds, status }),
            });
            if (!res.ok) throw new Error();
            toast.success(`${selectedIds.length} захиалгын төлөв шинэчлэгдлээ`);
            setSelectedIds([]);
        } catch {
            toast.error("Төлөв шинэчлэхэд алдаа гарлаа");
            fetchOrders(); // revert
        }
    };

    const handleStatusChange = async (id: number, status: OrderStatus) => {
        const prev = orders.find(o => o.id === id)?.status;
        setOrders(cur => cur.map(o => o.id === id ? { ...o, status } : o));
        try {
            const res = await fetch(`/api/admin/order/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error();
            toast.success("Төлөв шинэчлэгдлээ");
        } catch {
            setOrders(cur => cur.map(o => o.id === id ? { ...o, status: prev! } : o));
            toast.error("Төлөв шинэчлэхэд алдаа гарлаа");
        }
    };

    const resetFilters = () => {
        setStatusFilter("all"); setSortBy("newest");
        setPriceMin(""); setPriceMax(""); setDateFrom(""); setDateTo(""); setCustomer(null);
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
                <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 mb-6 flex flex-wrap gap-4 items-end">
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
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Огноо</label>
                        <DateRangePicker
                            dateFrom={dateFrom}
                            dateTo={dateTo}
                            onChange={(from, to) => { setDateFrom(from); setDateTo(to); }}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Хэрэглэгч</label>
                        <CustomerPicker value={customer} onChange={setCustomer} />
                    </div>
                    {activeFilterCount > 0 && (
                        <button onClick={resetFilters} className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors ml-auto">
                            Шүүлтүүр арилгах ({activeFilterCount})
                        </button>
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
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow-1">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-100 dark:bg-zinc-950/50 text-slate-400 dark:text-zinc-500 text-[10px] uppercase tracking-[0.2em]">
                            <tr>
                                <th className="pl-6 pr-2 py-5">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        ref={el => { if (el) el.indeterminate = isPartial; }}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded accent-teal-500 cursor-pointer"
                                    />
                                </th>
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
                                    <td colSpan={8} className="px-8 py-16 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500" />
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-8 py-16 text-center text-slate-400 dark:text-zinc-600">
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
                                orders.map(order => (
                                    <AdminOrderTile
                                        key={order.id}
                                        {...order}
                                        onStatusChange={handleStatusChange}
                                        selected={selectedIds.includes(order.id)}
                                        onToggle={toggleSelect}
                                    />
                                ))
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

            {/* ── Bulk action bar ── */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-6 py-3.5 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl">
                    <span className="text-sm font-semibold text-white whitespace-nowrap">
                        {selectedIds.length} захиалга сонгогдсон
                    </span>
                    <div className="w-px h-5 bg-zinc-700" />
                    <button
                        onClick={() => setSelectedIds([])}
                        className="text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                        Болих
                    </button>
                    <button
                        onClick={() => setShowBulkStatusDialog(true)}
                        className="px-4 py-1.5 rounded-xl bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 text-xs font-bold transition-colors"
                    >
                        Төлөв солих
                    </button>
                </div>
            )}

            {/* ── Bulk status picker modal ── */}
            {showBulkStatusDialog && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowBulkStatusDialog(false)}
                >
                    <div
                        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-3xl shadow-2xl p-8 w-full max-w-sm mx-4 flex flex-col gap-5"
                        onClick={e => e.stopPropagation()}
                    >
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Төлөв солих</h2>
                            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                                {selectedIds.length} захиалгад дараах төлөвийг тохируулна
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            {STATUS_LIST.map(s => {
                                const info = getOrderStatusInfo(s);
                                return (
                                    <button
                                        key={s}
                                        onClick={() => handleBulkStatusChange(s)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all hover:scale-[1.01] ${info.color}`}
                                    >
                                        <span className="text-sm font-bold">{info.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setShowBulkStatusDialog(false)}
                            className="py-2.5 rounded-2xl border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Болих
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
