"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useCategory } from "@/app/context/category_context";
import { useSearchParams } from "next/navigation";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";
import { Product } from "@/interface/product";
import { Category } from "@/interface/category";
import Pagination from "../../ui/Pagination";
import DropdownSelect from "../../ui/DropdownSelect";
import { ChevronDown, ChevronRight } from "lucide-react";
import { PAGE_SIZE, SORT_OPTIONS } from "./constants";

// ─── Category tree node ───────────────────────────────────────────────────────

function CategoryTreeNode({
    cat,
    selectedCatId,
    expandedCats,
    onSelect,
    onToggle,
}: {
    cat: Category;
    selectedCatId: number;
    expandedCats: Set<number>;
    onSelect: (id: number) => void;
    onToggle: (id: number) => void;
}) {
    const hasChildren = (cat.children?.length ?? 0) > 0;
    const isExpanded = expandedCats.has(cat.id);
    const isSelected = selectedCatId === cat.id;
    return (
        <div>
            <div className="flex items-center gap-1">
                {hasChildren ? (
                    <button
                        onClick={() => onToggle(cat.id)}
                        className="p-1 flex-shrink-0 text-slate-400 hover:text-teal-500 transition-colors"
                    >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                ) : (
                    <span className="w-6 flex-shrink-0" />
                )}
                <button
                    onClick={() => onSelect(cat.id)}
                    className={`flex-1 min-w-0 px-3 py-2 rounded-xl text-sm font-semibold text-left transition-all flex items-center justify-between gap-1
                        ${isSelected
                            ? "bg-teal-600 text-white shadow-lg shadow-teal-500/20"
                            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-teal-400"}`}
                >
                    <span className="truncate">{cat.name}</span>
                    {cat._count != null && (
                        <span className={`text-[11px] flex-shrink-0 ${isSelected ? "text-teal-100" : "text-slate-400"}`}>
                            {cat._count.products}
                        </span>
                    )}
                </button>
            </div>
            {hasChildren && isExpanded && (
                <div className="ml-5 mt-1 space-y-1 border-l border-slate-200 dark:border-slate-700 pl-2">
                    {cat.children!.map(child => (
                        <CategoryTreeNode
                            key={child.id}
                            cat={child}
                            selectedCatId={selectedCatId}
                            expandedCats={expandedCats}
                            onSelect={onSelect}
                            onToggle={onToggle}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Helper: find category name recursively ───────────────────────────────────

function findCategoryName(cats: Category[], id: number): string {
    for (const c of cats) {
        if (c.id === id) return c.name;
        const found = findCategoryName(c.children ?? [], id);
        if (found) return found;
    }
    return "";
}

// ─── Main component ───────────────────────────────────────────────────────────

function ProductListContent() {
    const { categories, fetchCategories } = useCategory();
    const searchParams = useSearchParams();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState(searchParams.get("search") ?? "");
    const [selectedCatId, setSelectedCatId] = useState<number>(
        searchParams.get("category") ? Number(searchParams.get("category")) : 0
    );
    const [sort, setSort] = useState("newest");
    const [inStock, setInStock] = useState(false);
    const [priceMinInput, setPriceMinInput] = useState("");
    const [priceMaxInput, setPriceMaxInput] = useState("");
    const [priceMin, setPriceMin] = useState<number | undefined>();
    const [priceMax, setPriceMax] = useState<number | undefined>();
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set());
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const toggleExpand = (id: number) =>
        setExpandedCats(prev => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });

    // Reset to page 1 when filters change
    useEffect(() => { setPage(1); }, [selectedCatId, search, sort, inStock, priceMin, priceMax]);

    // Debounce price inputs → committed values
    useEffect(() => {
        const t = setTimeout(() => {
            setPriceMin(priceMinInput ? Number(priceMinInput) : undefined);
            setPriceMax(priceMaxInput ? Number(priceMaxInput) : undefined);
        }, 600);
        return () => clearTimeout(t);
    }, [priceMinInput, priceMaxInput]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const q = new URLSearchParams();
        q.set("category", String(selectedCatId));
        if (search) q.set("search", search);
        if (sort) q.set("sort", sort);
        if (inStock) q.set("inStock", "1");
        if (priceMin !== undefined) q.set("priceMin", String(priceMin));
        if (priceMax !== undefined) q.set("priceMax", String(priceMax));
        q.set("page", String(page));
        q.set("pageSize", String(pageSize));

        const res = await fetch(`/api/product?${q.toString()}`);
        const body = await res.json();
        setProducts(body.data || []);
        setTotal(body.pagination?.total ?? body.total ?? 0);
        setLoading(false);
    }, [selectedCatId, search, sort, inStock, priceMin, priceMax, page]);

    useEffect(() => { fetchProducts(); fetchCategories(); }, [fetchProducts]);

    const resetFilters = () => {
        setSelectedCatId(0);
        setSearch("");
        setSort("newest");
        setInStock(false);
        setPriceMinInput("");
        setPriceMaxInput("");
        setPriceMin(undefined);
        setPriceMax(undefined);
    };

    const activeFilterCount = [
        selectedCatId !== 0,
        !!priceMinInput,
        !!priceMaxInput,
        inStock,
        sort !== "newest",
    ].filter(Boolean).length;

    const selectedCatName = findCategoryName(categories, selectedCatId) || "Бүгд";

    // ─── Sidebar content (shared desktop/mobile) ──────────────────────────────

    const SidebarContent = () => (
        <div className="space-y-7">
            {/* Category tree */}
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Ангилал</p>
                <div className="space-y-1 gap-1 flex flex-col">
                    {/* "Бүгд" */}
                    <button
                        onClick={() => { setSelectedCatId(0); setMobileFiltersOpen(false); }}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-left transition-all
                            ${selectedCatId === 0
                                ? "bg-teal-600 text-white shadow-lg shadow-teal-500/20"
                                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-teal-400"}`}
                    >
                        Бүгд
                    </button>
                    {/* Tree */}
                    {categories.map(cat => (
                        <CategoryTreeNode
                            key={cat.id}
                            cat={cat}
                            selectedCatId={selectedCatId}
                            expandedCats={expandedCats}
                            onSelect={(id) => { setSelectedCatId(id); setMobileFiltersOpen(false); }}
                            onToggle={toggleExpand}
                        />
                    ))}
                </div>
            </div>

            {/* Price range */}
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Үнийн хэмжээ</p>
                <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₮</span>
                        <input
                            type="number"
                            placeholder="Мин"
                            value={priceMinInput}
                            onChange={e => setPriceMinInput(e.target.value)}
                            className="w-full pl-6 pr-2 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                    <span className="text-slate-300 dark:text-slate-600 text-sm">—</span>
                    <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₮</span>
                        <input
                            type="number"
                            placeholder="Макс"
                            value={priceMaxInput}
                            onChange={e => setPriceMaxInput(e.target.value)}
                            className="w-full pl-6 pr-2 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                </div>
            </div>

            {/* In stock */}
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Нөөц</p>
                <button
                    onClick={() => setInStock(v => !v)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-all
                        ${inStock
                            ? "bg-teal-50 dark:bg-teal-900/20 border-teal-400 text-teal-600 dark:text-teal-400"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-teal-400"}`}
                >
                    Нөөцтэй бараа
                    <div className={`w-8 h-4 rounded-full transition-colors relative ${inStock ? "bg-teal-500" : "bg-slate-200 dark:bg-slate-700"}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${inStock ? "right-0.5" : "left-0.5"}`} />
                    </div>
                </button>
            </div>

            {/* Active filter count + reset */}
            {activeFilterCount > 0 && (
                <button
                    onClick={resetFilters}
                    className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-500 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                    Шүүлтүүр арилгах ({activeFilterCount})
                </button>
            )}

            {/* Result count */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-400 mb-1">Олдсон</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{total}</p>
                <p className="text-xs text-slate-400">бараа</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Header />

            {/* Hero */}
            <section className="relative bg-white dark:bg-slate-950 pt-24 pb-14 overflow-hidden border-b border-slate-200 dark:border-slate-800">
                <div className="absolute inset-0 opacity-10 dark:opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-500 via-transparent to-transparent" />
                <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
                        Манай <span className="text-teal-500 dark:text-teal-400">Бүтээгдэхүүнүүд</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-6 text-base">
                        Чанартай барааг хамгийн хямд үнээр авах боломжтой.
                    </p>
                    <div className="max-w-2xl mx-auto relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Хайх барааны нэр..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-slate-50 dark:focus:bg-white/20 transition-all"
                        />
                    </div>
                </div>
            </section>

            {/* Main */}
            <main className="max-w-full mx-auto px-4 sm:px-6 py-10">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* ── Desktop sidebar ── */}
                    <aside className="hidden lg:block w-60 flex-shrink-0">
                        <div className="sticky top-24">
                            <SidebarContent />
                        </div>
                    </aside>

                    {/* ── Products area ── */}
                    <div className="flex-1 min-w-0">

                        {/* Toolbar */}
                        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                    {selectedCatName}
                                    <span className="text-slate-400 font-normal ml-1.5">({total})</span>
                                </h2>
                                {/* Active filter chips */}
                                {selectedCatId !== 0 && (
                                    <FilterChip label={selectedCatName} onRemove={() => setSelectedCatId(0)} />
                                )}
                                {(priceMinInput || priceMaxInput) && (
                                    <FilterChip
                                        label={`₮${priceMinInput || "0"} — ₮${priceMaxInput || "∞"}`}
                                        onRemove={() => { setPriceMinInput(""); setPriceMaxInput(""); }}
                                    />
                                )}
                                {inStock && <FilterChip label="Нөөцтэй" onRemove={() => setInStock(false)} />}
                                {sort !== "newest" && (
                                    <FilterChip label={SORT_OPTIONS.find(s => s.value === sort)?.label ?? ""} onRemove={() => setSort("newest")} />
                                )}
                            </div>

                            <div className="flex items-center gap-2 ml-auto">
                                {/* Mobile filter button */}
                                <button
                                    onClick={() => setMobileFiltersOpen(true)}
                                    className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                                    </svg>
                                    Шүүлтүүр {activeFilterCount > 0 && <span className="bg-teal-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
                                </button>

                                {/* Sort */}
                                <DropdownSelect
                                    value={sort}
                                    onChange={v => setSort(String(v))}
                                    options={SORT_OPTIONS.map(o => ({ id: o.value, label: o.label }))}
                                    searchable={false}
                                    className="w-40"
                                />
                            </div>
                        </div>

                        {/* Grid */}
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="rounded-3xl bg-slate-200 dark:bg-slate-800 aspect-square animate-pulse" />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                <div className="text-5xl mb-4">🔍</div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Үр дүн олдсонгүй</h3>
                                <p className="text-slate-500 text-sm mb-5">Шүүлтүүрийг өөрчлөөд дахин оролдоорой.</p>
                                <button onClick={resetFilters} className="text-teal-600 dark:text-teal-400 font-bold hover:underline text-sm">
                                    Бүх шүүлтүүрийг арилгах
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
                                {products.map(item => <ProductCard key={item.id} {...item} />)}
                            </div>
                        )}

                        <Pagination currentPage={page} totalItems={total} pageSize={pageSize} onPageChange={setPage} />

                    </div>
                </div>
            </main>

            {/* ── Mobile filter sheet ── */}
            {mobileFiltersOpen && (
                <>
                    <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl p-6 max-h-[85dvh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Шүүлтүүр</h3>
                            <button onClick={() => setMobileFiltersOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <SidebarContent />
                    </div>
                </>
            )}

        </div>
    );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300 text-xs font-semibold">
            {label}
            <button onClick={onRemove} className="hover:text-red-500 transition-colors leading-none">×</button>
        </span>
    );
}

export default function Products() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500" />
            </div>
        }>
            <ProductListContent />
        </Suspense>
    );
}
