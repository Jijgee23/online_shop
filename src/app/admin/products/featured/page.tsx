"use client";

import { useProducts } from "@/app/context/product_context";
import { Product } from "@/interface/product";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function FeaturedProductsPage() {
    const { products, fetchProducts } = useProducts();
    const [search, setSearch] = useState("");
    const [toggling, setToggling] = useState<number | null>(null);

    useEffect(() => { fetchProducts(); }, []);

    const toggle = async (product: Product) => {
        setToggling(product.id);
        const next = !product.featured;
        try {
            const fd = new FormData();
            fd.append("featured", String(next));
            const res = await fetch(`/api/admin/product/${product.id}`, { method: "PATCH", body: fd });
            if (!res.ok) throw new Error();
            toast.success(next ? "Онцлох бүтээгдэхүүнд нэмэгдлээ" : "Онцлохоос хасагдлаа");
            await fetchProducts();
        } catch {
            toast.error("Алдаа гарлаа");
        } finally {
            setToggling(null);
        }
    };

    const active   = products.filter(p => !p.deletedAt);
    const featured = active.filter(p => p.featured);
    const filtered = active.filter(p =>
        !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            {/* Header */}
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Онцлох бүтээгдэхүүн</h2>
                <p className="text-slate-400 dark:text-zinc-500 text-sm mt-1">
                    Нүүр хуудасны carousel-д харуулах бүтээгдэхүүнүүдийг сонгоно.
                </p>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: "Нийт бүтээгдэхүүн", value: active.length,   color: "text-slate-900 dark:text-white" },
                    { label: "Онцлох",              value: featured.length, color: "text-teal-500" },
                    { label: "Онцлохгүй",           value: active.length - featured.length, color: "text-slate-400 dark:text-zinc-500" },
                ].map(s => (
                    <div key={s.label} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5">
                        <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">{s.label}</p>
                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Currently featured */}
            {featured.length > 0 && (
                <div className="mb-8">
                    <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span>⭐</span> Одоо онцлогдож буй ({featured.length})
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {featured.map(p => (
                            <div key={p.id} className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 rounded-2xl px-3 py-2">
                                <img
                                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${p.images?.[0]?.url ?? "/uploads/placeholder.png"}`}
                                    className="w-7 h-7 rounded-lg object-cover"
                                    alt={p.name}
                                />
                                <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">{p.name}</span>
                                <button
                                    onClick={() => toggle(p)}
                                    disabled={toggling === p.id}
                                    className="text-teal-400 hover:text-red-400 transition-colors disabled:opacity-40 ml-1"
                                    title="Хасах"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative mb-5">
                <svg className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Нэр эсвэл ангилалаар хайх..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
                />
            </div>

            {/* Product list */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden">
                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {filtered.length === 0 ? (
                        <div className="py-16 text-center text-slate-400 dark:text-zinc-600">
                            <p className="text-3xl mb-3">📦</p>
                            <p className="font-semibold">Бүтээгдэхүүн олдсонгүй</p>
                        </div>
                    ) : filtered.map(product => {
                        const isFeatured = product.featured;
                        const isToggling = toggling === product.id;
                        return (
                            <div
                                key={product.id}
                                className={`flex items-center justify-between gap-4 px-6 py-4 transition-colors ${
                                    isFeatured ? "bg-teal-500/5" : "hover:bg-slate-50 dark:hover:bg-zinc-800/30"
                                }`}
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 flex-shrink-0">
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${product.images?.[0]?.url ?? "/uploads/placeholder.png"}`}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{product.name}</p>
                                            {isFeatured && (
                                                <span className="text-[10px] font-bold text-teal-500 bg-teal-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                                                    ⭐ Онцлох
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                                            {product.category?.name ?? "—"} · ₮{Number(product.price).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => toggle(product)}
                                    disabled={isToggling}
                                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 disabled:opacity-50 ${
                                        isFeatured ? "bg-teal-500" : "bg-slate-200 dark:bg-zinc-700"
                                    }`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                                        isFeatured ? "translate-x-6" : "translate-x-0"
                                    }`} />
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="px-6 py-3 bg-slate-50 dark:bg-zinc-950/20 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-400 dark:text-zinc-500">
                    {filtered.length} бүтээгдэхүүн · {featured.length} онцлогдсон
                </div>
            </div>
        </>
    );
}
