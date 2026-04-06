import ProductCard from "@/app/components/ProductCard";
import { Product } from "@/interface/product";
import Link from "next/link";
import { useEffect, useRef, useState } from "react"

export function TopProducts({ products }: { products: Product[] }) {
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const total = products.length;
    const cols = 4;

    const goTo = (next: number) => {
        setFade(false);
        setTimeout(() => {
            setIndex(next);
            setFade(true);
        }, 300);
    };

    const resetTimer = (next: number) => {
        if (timerRef.current) clearInterval(timerRef.current);
        goTo(next);
        timerRef.current = setInterval(() => {
            setIndex((prev) => {
                const n = (prev + 1) % total;
                setFade(false);
                setTimeout(() => setFade(true), 300);
                return n;
            });
        }, 3000);
    };

    useEffect(() => {
        if (total === 0) return;
        timerRef.current = setInterval(() => {
            setIndex((prev) => {
                const n = (prev + 1) % total;
                setFade(false);
                setTimeout(() => setFade(true), 300);
                return n;
            });
        }, 3000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [total]);

    const visible = total > 0
        ? Array.from({ length: Math.min(cols, total) }, (_, i) => products[(index + i) % total])
        : [];

    return (
        <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-1 h-6 bg-teal-500 rounded-full inline-block"></span>
                            <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest">Онцлох</p>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Шилдэг борлуулалттай бараанууд</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => resetTimer((index - 1 + total) % total)}
                            className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400 hover:text-teal-500 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => resetTimer((index + 1) % total)}
                            className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400 hover:text-teal-500 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        <Link
                            href="/product"
                            className="hidden sm:flex items-center gap-1 ml-2 text-teal-600 dark:text-teal-400 font-semibold hover:gap-2 transition-all"
                        >
                            Бүгдийг үзэх
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>
                </div>

                <div
                    style={{ transition: "opacity 0.3s ease, transform 0.3s ease" }}
                    className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 ${fade ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
                >
                    {visible.map((product, i) => (
                        <ProductCard key={`${product.id}-${i}`} {...product} />
                    ))}
                </div>

                {total > cols && (
                    <div className="flex justify-center gap-2 mt-8">
                        {products.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => resetTimer(i)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-teal-500" : "w-1.5 bg-slate-300 dark:bg-slate-600"}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
