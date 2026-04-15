"use client";

import { useCallback, useEffect, useState } from "react";
import { ProductState } from "@/generated/prisma";
import ProductTile from "./components/ProductTile";
import { useAdmin } from "@/app/context/admin_context";
import { useCategory } from "@/app/context/category_context";
import { useProducts } from "@/app/context/product_context";
import { Product } from "@/interface/product";
import Pagination from "@/ui/Pagination";
import { usePersistedPage } from "@/app/hooks/usePersistedPage";
import { PAGE_SIZE, ADMIN_PRODUCT_SORT_OPTIONS as SORT_OPTIONS, STOCK_OPTIONS } from "@/app/product/constants";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
    const { categories, fetchCategories } = useCategory();
    const { setActivePage } = useAdmin();
    const { refetchSignal } = useProducts();

    const [products, setProducts] = useState<Product[]>([]);
    const [total,    setTotal]    = useState(0);
    const [loading,  setLoading]  = useState(false);

    const [searchTerm,    setSearchTerm]    = useState("");
    const [selectedCatId, setSelectedCatId] = useState(0);
    const [sortBy,        setSortBy]        = useState("newest");
    const [stockFilter,   setStockFilter]   = useState("all");
    const [stateFilter,   setStateFilter]   = useState("all");
    const [priceMin,      setPriceMin]      = useState("");
    const [priceMax,      setPriceMax]      = useState("");

    const [page, setPage] = usePersistedPage("admin:products:page", [searchTerm, selectedCatId, sortBy, stockFilter, stateFilter, priceMin, priceMax]);
    const [showFilters,   setShowFilters]   = useState(false);

    const allCategories = [{ id: 0, name: "Бүгд" }, ...categories];

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const q = new URLSearchParams();
        q.set("page",     String(page));
        q.set("pageSize", String(PAGE_SIZE));
        if (searchTerm)          q.set("search",     searchTerm);
        if (sortBy)              q.set("sort",       sortBy);
        if (selectedCatId !== 0) q.set("categoryId", String(selectedCatId));
        if (stockFilter !== "all") q.set("stock",    stockFilter);
        if (stateFilter !== "all") q.set("state",    stateFilter);
        if (priceMin)            q.set("priceMin",   priceMin);
        if (priceMax)            q.set("priceMax",   priceMax);

        try {
            const res  = await fetch(`/api/admin/product?${q.toString()}`);
            const data = await res.json();
            if (res.ok) { setProducts(data.data || []); setTotal(data.total ?? 0); }
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, sortBy, selectedCatId, stockFilter, stateFilter, priceMin, priceMax]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    // Re-fetch when a tile triggers delete/restore
    useEffect(() => { if (refetchSignal > 0) fetchProducts(); }, [refetchSignal]);

    useEffect(() => { fetchCategories(); }, []);

    const activeFilterCount = [
        selectedCatId !== 0, !!priceMin, !!priceMax,
        stockFilter !== "all", stateFilter !== "all", sortBy !== "newest",
    ].filter(Boolean).length;

    const resetFilters = () => {
        setSelectedCatId(0); setSortBy("newest");
        setStockFilter("all"); setStateFilter("all");
        setPriceMin(""); setPriceMax("");
    };

    const inputCls = "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all";

    return (
        <>
            {/* ── Header ── */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Бүтээгдэхүүнүүд</h2>
                    <p className="text-slate-400 dark:text-zinc-500 text-sm">
                        Нийт <span className="text-white font-semibold">{total}</span> бүтээгдэхүүн
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto flex-wrap">
                    <div className="relative group flex-1 min-w-60">
                        <input
                            type="text"
                            placeholder="Нэр, ангилал, SKU-аар хайх..."
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

                    <button
                        onClick={() => setActivePage("Шинэ бүтээгдэхүүнүүд")}
                        className="bg-teal-500 hover:bg-teal-400 text-white px-5 py-3 rounded-2xl font-bold transition-colors flex items-center gap-2 text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        Нэмэх
                    </button>
                </div>
            </header>

            {/* ── Filter bar ── */}
            {showFilters && (
                <div className="bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Ангилал</label>
                        <select value={selectedCatId} onChange={e => setSelectedCatId(Number(e.target.value))} className={inputCls}>
                            {allCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Үнэ (мин)</label>
                        <input type="number" placeholder="₮ 0" value={priceMin} onChange={e => setPriceMin(e.target.value)}
                            className={inputCls + " [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Үнэ (макс)</label>
                        <input type="number" placeholder="₮ ∞" value={priceMax} onChange={e => setPriceMax(e.target.value)}
                            className={inputCls + " [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Нөөц</label>
                        <select value={stockFilter} onChange={e => setStockFilter(e.target.value)} className={inputCls}>
                            {STOCK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Төлөв</label>
                        <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className={inputCls}>
                            <option value="all">Бүгд</option>
                            <option value="ACTIVE">Идэвхтэй</option>
                            <option value="INACTIVE">Идэвхгүй</option>
                            <option value="DELETED">Устгагдсан</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Эрэмбэ</label>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={inputCls}>
                            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
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
                    { label: "Нийт",       value: total,                                                                        color: "text-slate-900 dark:text-white" },
                    { label: "Идэвхтэй",   value: products.filter(p => p.state === ProductState.ACTIVE && !p.deletedAt).length, color: "text-green-400" },
                    { label: "Идэвхгүй",   value: products.filter(p => p.state !== ProductState.ACTIVE && !p.deletedAt).length, color: "text-yellow-400" },
                    { label: "Устгагдсан", value: products.filter(p => !!p.deletedAt).length,                                  color: "text-red-400" },
                ].map(s => (
                    <div key={s.label} className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 p-5 rounded-3xl">
                        <p className="text-slate-400 dark:text-zinc-500 text-xs font-bold uppercase mb-1">{s.label}</p>
                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Table ── */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-100 dark:bg-zinc-950/50 text-slate-400 dark:text-zinc-500 text-[10px] uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-8 py-5">Бүтээгдэхүүн</th>
                                <th className="px-8 py-5">Ангилал</th>
                                <th className="px-8 py-5 text-right">Үнэ</th>
                                <th className="px-8 py-5 text-center">Үлдэгдэл</th>
                                <th className="px-8 py-5">Төлөв</th>
                                <th className="px-8 py-5 text-right">Үйлдэл</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-16 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500" />
                                        </div>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-16 text-center text-slate-400 dark:text-zinc-600">
                                        <div className="text-3xl mb-3">📦</div>
                                        <p className="font-semibold">Бүтээгдэхүүн олдсонгүй</p>
                                        {activeFilterCount > 0 && (
                                            <button onClick={resetFilters} className="mt-3 text-teal-400 text-sm hover:underline">
                                                Шүүлтүүрийг арилгах
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                products.map(product => <ProductTile key={product.id} {...product} />)
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-8 py-4 bg-slate-50 dark:bg-zinc-950/20 border-t border-slate-200 dark:border-zinc-800 text-xs text-slate-400 dark:text-zinc-500">
                    {total > 0
                        ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} / нийт ${total} бүтээгдэхүүн`
                        : "Бүтээгдэхүүн байхгүй"}
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
