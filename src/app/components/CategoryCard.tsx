import { Category } from "@/interface/category";
import Link from "next/link";

export default function CategoryCard(category: Category) {
   
    return (
        <Link
            key={category.name}
            href={`/product?category=${category.id}`}
            className="group bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-teal-200 dark:hover:border-teal-800 hover:-translate-y-1 flex flex-col items-center text-center"
        >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                {category.name}
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                {category.name}
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full mt-1">
                {category._count?.products}
            </p>
        </Link>
    )
}