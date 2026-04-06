import Link from "next/link";

export default function EmptyCart() {

    return (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Сагс хоосон байна</h2>
            <Link href="/product">
                <button className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all active:scale-95">
                    Дэлгүүр хэсэх
                </button>
            </Link>
        </div>
    );
}