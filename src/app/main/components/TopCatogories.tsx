"use client";

import { useCategory } from "@/app/context/category_context";
import { Category } from "@/interface/category";
import Image from "next/image";
import Link from "next/link";

export function TopCateGories() {
    const { categories } = useCategory();
    if (categories.length === 0) return null;

    return (
        <section className="py-8 bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800/60">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center gap-2 mb-5">
                    <span className="w-1 h-5 bg-teal-500 rounded-full" />
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white tracking-[0.15em] uppercase">
                        Ангилал
                    </h3>
                </div>

                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
                    {categories.map((cat) => (
                        <CategoryChip key={cat.id} {...cat} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function CategoryChip(cat: Category) {
    return (
        <Link
            href={`/product?category=${cat.id}`}
            className="group flex-shrink-0 flex items-center gap-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2 hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 dark:hover:border-teal-700 transition-all duration-200"
        >
            <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                {cat.image ? (
                    <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-400 dark:text-slate-500 uppercase">
                        {cat.name.charAt(0)}
                    </span>
                )}
            </div>

            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 whitespace-nowrap transition-colors">
                {cat.name}
            </span>

            {cat._count?.products !== undefined && (
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full leading-none">
                    {cat._count.products}
                </span>
            )}
        </Link>
    );
}

export default CategoryChip;
