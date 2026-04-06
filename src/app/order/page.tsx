"use client";

import { useEffect, useState } from "react";
import { useOrder } from "../context/order_context";
import { useAuth } from "../context/auth_context";
import { ShoppingBag, SlidersHorizontal, X, ChevronDown, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import Header from "../components/Header";
import OrderTile from "./components/OrderTile";
import { OrderStatus } from "@/interface/order";
import Pagination from "../../ui/Pagination";

const STATUS_OPTIONS = [
    { value: "", label: "Бүх төлөв" },
    { value: OrderStatus.PENDING, label: "Хүлээгдэж буй" },
    { value: OrderStatus.PAID, label: "Баталгаажсан" },
    { value: OrderStatus.SHIPPED, label: "Хүргэлтэнд гарсан" },
    { value: OrderStatus.DELIVERED, label: "Хүргэгдсэн" },
    { value: OrderStatus.CANCELLED, label: "Цуцлагдсан" },
];

const STATUS_DOT: Record<string, string> = {
    PENDING: "bg-amber-400",
    PAID: "bg-teal-400",
    SHIPPED: "bg-blue-400",
    DELIVERED: "bg-green-400",
    CANCELLED: "bg-red-400",
};

export default function OrderPage() {

    const { orders, fetchOrder, total, page, setPage, pageSize } = useOrder();
    const { user } = useAuth();
    const totalPages = Math.ceil(total / pageSize);

    const [statusFilter, setStatusFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
    const [open, setOpen] = useState(false);



    useEffect(() => { fetchOrder(); }, []);

    // ── filter logic ──────────────────────────────────────────────────────────
    const filtered = orders
        .filter(o => {
            if (statusFilter && o.status !== statusFilter) return false;
            if (dateFrom && new Date(o.createdAt) < new Date(dateFrom)) return false;
            if (dateTo && new Date(o.createdAt) > new Date(dateTo + "T23:59:59")) return false;
            return true;
        })
        .sort((a, b) => {
            const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            return sortOrder === "desc" ? -diff : diff;
        });

    const activeFilters = [statusFilter, dateFrom, dateTo, sortOrder !== "desc" ? "asc" : ""].filter(Boolean).length;

    const clearFilters = () => {
        setStatusFilter("");
        setDateFrom("");
        setDateTo("");
        setSortOrder("desc");
    };

    const isEmpty = total === 0 && orders.length === 0;

    const counts = {
        pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
        active: orders.filter(o => [OrderStatus.PAID, OrderStatus.SHIPPED].includes(o.status as any)).length,
        delivered: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-24">
            <Header />
            <div className="max-w-2xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                            Миний <span className="bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">захиалгууд</span>
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {user?.name} · Нийт {total} захиалга
                        </p>
                    </div>

                    {!isEmpty && (
                        <button
                            onClick={() => setOpen(v => !v)}
                            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-semibold text-sm transition-all ${open || activeFilters > 0
                                ? "bg-teal-500 border-teal-500 text-white shadow-md shadow-teal-500/30"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400"
                                }`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Шүүлт
                            {activeFilters > 0 && (
                                <span className="w-5 h-5 rounded-full bg-white/30 text-[11px] font-extrabold flex items-center justify-center">
                                    {activeFilters}
                                </span>
                            )}
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
                        </button>
                    )}
                </div>

                {/* Filter panel */}
                {open && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 mb-5 shadow-sm space-y-4">

                        {/* Status chips */}
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Төлөв</p>
                            <div className="flex flex-wrap gap-2">
                                {STATUS_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setStatusFilter(opt.value)}
                                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${statusFilter === opt.value
                                            ? "bg-teal-500 border-teal-500 text-white shadow-sm shadow-teal-500/30"
                                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400"
                                            }`}
                                    >
                                        {opt.value && (
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === opt.value ? "bg-white" : STATUS_DOT[opt.value]
                                                }`} />
                                        )}
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date range */}
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Огноо</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] text-slate-400 mb-1.5 block">Эхлэх</label>
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={e => setDateFrom(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] text-slate-400 mb-1.5 block">Дуусах</label>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        min={dateFrom}
                                        onChange={e => setDateTo(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sort */}
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Эрэмбэлэх</p>
                            <div className="flex gap-2">
                                {[
                                    { value: "desc", label: "Шинэ эхэндээ" },
                                    { value: "asc", label: "Хуучин эхэндээ" },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setSortOrder(opt.value as "desc" | "asc")}
                                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${sortOrder === opt.value
                                            ? "bg-teal-500 border-teal-500 text-white shadow-sm shadow-teal-500/30"
                                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400"
                                            }`}
                                    >
                                        <ArrowUpDown className="w-3 h-3" />
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Clear */}
                        {activeFilters > 0 && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" /> Шүүлт цэвэрлэх
                            </button>
                        )}
                    </div>
                )}

                {/* Quick stats */}
                {!isEmpty && (
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {[
                            { label: "Хүлээгдэж буй", value: counts.pending, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/10" },
                            { label: "Явагдаж байна", value: counts.active, color: "text-blue-500", bg: "bg-blue-50  dark:bg-blue-900/10" },
                            { label: "Хүргэгдсэн", value: counts.delivered, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/10" },
                        ].map(s => (
                            <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
                                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Result count when filtering */}
                {activeFilters > 0 && !isEmpty && (
                    <div className="flex items-center justify-between mb-3 px-1">
                        <p className="text-sm text-slate-500">
                            <span className="font-bold text-slate-900 dark:text-white">{filtered.length}</span> захиалга олдлоо
                        </p>
                        <button onClick={clearFilters} className="text-xs text-teal-500 font-semibold hover:underline flex items-center gap-1">
                            <X className="w-3 h-3" /> Цэвэрлэх
                        </button>
                    </div>
                )}

                {/* List */}
                {isEmpty ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-16 text-center shadow-sm">
                        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-5">
                            <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Захиалга байхгүй байна</h2>
                        <p className="text-sm text-slate-500 mb-8">Та одоогоор ямар нэгэн худалдан авалт хийгээгүй байна.</p>
                        <Link href="/product">
                            <button className="bg-gradient-to-r from-teal-500 to-teal-400 text-white px-8 py-3 rounded-full font-bold shadow-md shadow-teal-500/20 hover:shadow-lg transition-all active:scale-95">
                                Дэлгүүр хэсэх
                            </button>
                        </Link>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 p-12 text-center">
                        <div className="text-4xl mb-3">🔍</div>
                        <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Үр дүн олдсонгүй</p>
                        <p className="text-sm text-slate-400 mb-5">Шүүлтийн нөхцөлийг өөрчлөн үзнэ үү.</p>
                        <button onClick={clearFilters} className="text-sm text-teal-500 font-bold hover:underline">
                            Шүүлт арилгах
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map(order => (
                            <OrderTile key={order.id} {...order} />
                        ))}
                    </div>
                )}

                <Pagination currentPage={page} totalItems={total} pageSize={pageSize} onPageChange={setPage} />

            </div>
        </div>
    );
}

