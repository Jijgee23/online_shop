"use client";

import { useEffect, useState, Suspense } from "react";
import { useCategory } from "@/app/context/category_context";
import { ProductWithRelations } from "@/interface/product";
import { useSearchParams } from "next/navigation";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";

// 1. Үндсэн логик болон UI-г тусад нь функц болгох
function ProductListContent() {
  const { categories } = useCategory();
  const searchParams = useSearchParams();
  const categoryIdFromUrl = searchParams.get("category");
  
  const [selectedCatId, setSelectedCatId] = useState<number>(
    categoryIdFromUrl ? Number(categoryIdFromUrl) : 0
  );
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ProductWithRelations[]>([]);

  const fetchProducts = async (id: number, query: string) => {
    const res = await fetch(`/api/product?category=${id}&search=${query}`);
    const body = await res.json();
    setProducts(body.data || []);
  };

  const allCategories = [
    { id: 0, name: "Бүгд" },
    ...categories
  ];

  useEffect(() => {
    fetchProducts(selectedCatId, search);
  }, [selectedCatId, search]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Header/>
      {/* Hero Section */}
      <section className="relative bg-slate-900 dark:bg-slate-950 pt-24 pb-16 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-500 via-transparent to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Манай <span className="text-teal-400">Бүтээгдэхүүнүүд</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto mb-10 text-lg">
            Танд хэрэгтэй хамгийн чанартай барааг бид хамгийн хямд үнээр санал болгож байна.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Хайх барааны нэр..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white/20 transition-all shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 dark:text-slate-500">
                  Ангилал
                </h3>
                <div className="flex flex-wrap lg:flex-col gap-2">
                  {allCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCatId(cat.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all text-left ${selectedCatId === cat.id
                        ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-teal-500"
                        }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hidden lg:block p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Нийт олдсон:</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{products.length} бараа</p>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {allCategories.find((e) => e.id == selectedCatId)?.name} <span className="text-slate-400 font-normal">({products.length})</span>
              </h2>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Үр дүн олдсонгүй</h3>
                <p className="text-slate-500">Та хайх үгээ эсвэл ангиллаа өөрчлөөд үзээрэй.</p>
                <button
                  onClick={() => { setSearch(""); setSelectedCatId(0) }}
                  className="mt-6 text-teal-600 font-bold hover:underline"
                >
                  Шүүлтүүрийг арилгах
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((item) => (
                  <div key={item.id} className="transform transition duration-300 hover:scale-[1.02]">
                    <ProductCard {...item} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Products() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    }>
      <ProductListContent />
    </Suspense>
  );
}