import { useCategory } from "@/app/context/category_context"
import { Category } from "@/interface/category";
import Image from "next/image";
import Link from "next/link";

export function TopCateGories() {
    const categories = useCategory().categories;
    return (
        <section className="py-10 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-1 h-5 bg-teal-500 rounded-full inline-block"></span>
                            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest">Ангилал</p>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Хамгийн их эрэлттэй төрлүүд</h3>
                    </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {categories.length !== 0 &&
                        categories.map((category) => (
                            <CategoryCard key={category.id} {...category} />
                        ))}
                </div>
            </div>
        </section>
    )
}


export default function CategoryCard(category: Category) {
    return (
        <Link
            href={`/product?category=${category.id}`}
            className="group bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-teal-200 dark:hover:border-teal-800 hover:-translate-y-1 flex flex-col"
        >
            {/* Cover */}
            <div className="relative w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 overflow-hidden">
                {category.image ? (
                    <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-black text-slate-300 dark:text-slate-600 select-none uppercase">
                            {category.name.charAt(0)}
                        </span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="px-2.5 py-2 flex items-center justify-between gap-1">
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate">{category.name}</h4>
                <span className="flex-shrink-0 text-[10px] text-slate-400 dark:text-slate-500 font-medium bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {category._count?.products ?? 0}
                </span>
            </div>
        </Link>
    );
}
