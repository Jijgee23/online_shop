import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function EmptyCart() {
    return (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl text-center px-6">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-5">
                <ShoppingBag className="w-9 h-9 text-slate-300 dark:text-zinc-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Сагс хоосон байна</h2>
            <p className="text-sm text-slate-400 dark:text-zinc-500 mb-8">Таалагдсан бараагаа сагсанд нэмнэ үү</p>
            <Link href="/product">
                <button className="px-8 py-3 bg-teal-500 hover:bg-teal-400 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-lg shadow-teal-500/20">
                    Дэлгүүр хэсэх →
                </button>
            </Link>
        </div>
    );
}
