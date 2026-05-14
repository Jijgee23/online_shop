"use client";

import ProductCard from "@/app/components/ProductCard";
import { Product } from "@/interface/product";
import Link from "next/link";

export function TopProducts({ products }: { products: Product[] }) {
    const shown = products.slice(0, 8);

    return (
        <section className="py-14 bg-slate-50 dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-6">

                <div className="flex items-end justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="w-1 h-5 bg-teal-500 rounded-full" />
                            <p className="text-[11px] font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-[0.15em]">
                                Онцлох
                            </p>
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            Шилдэг борлуулалттай бараанууд
                        </h2>
                    </div>

                    <Link
                        href="/product"
                        className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition-colors"
                    >
                        Бүгдийг үзэх
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>

                {shown.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 dark:text-slate-500 text-sm">
                        Бараа олдсонгүй
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                        {shown.map((p) => (
                            <ProductCard key={p.id} {...p} />
                        ))}
                    </div>
                )}

                <Link
                    href="/product"
                    className="sm:hidden mt-6 flex items-center justify-center gap-2 py-3 rounded-2xl border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 font-semibold text-sm"
                >
                    Бүгдийг үзэх
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </Link>
            </div>
        </section>
    );
}
