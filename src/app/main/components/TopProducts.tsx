"use client";
import ProductCard from "@/app/components/ProductCard";
import { Product } from "@/interface/product";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const COLS = 4;
const INTERVAL_MS = 3000;
const TRANSITION_MS = 500;

export function TopProducts({ products }: { products: Product[] }) {
    const total = products.length;
    // Clone first COLS items at end for seamless infinite loop
    const items = total > 0 ? [...products, ...products.slice(0, COLS)] : [];
    const ext = items.length;

    const [index, setIndex] = useState(0);
    const [sliding, setSliding] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const indexRef = useRef(0);

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)");
        setIsMobile(mq.matches);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    const moveTo = useCallback((next: number, withTransition: boolean) => {
        setSliding(withTransition);
        setIndex(next);
        indexRef.current = next;
    }, []);

    // After sliding to the cloned tail, silently reset to real index 0
    const wrapIfNeeded = useCallback((next: number, afterReset?: () => void) => {
        if (next >= total) {
            setTimeout(() => {
                moveTo(0, false);
                requestAnimationFrame(() =>
                    requestAnimationFrame(() => {
                        setSliding(true);
                        afterReset?.();
                    })
                );
            }, TRANSITION_MS);
        }
    }, [total, moveTo]);

    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            const next = indexRef.current + 1;
            moveTo(next, true);
            wrapIfNeeded(next);
        }, INTERVAL_MS);
    }, [moveTo, wrapIfNeeded]);

    useEffect(() => {
        if (total === 0 || isMobile) return;
        startTimer();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [total, isMobile, startTimer]);

    const goPrev = () => {
        const next = indexRef.current === 0 ? total - 1 : indexRef.current - 1;
        moveTo(next, true);
        startTimer();
    };

    const goNext = () => {
        const next = indexRef.current + 1;
        moveTo(next, true);
        wrapIfNeeded(next, startTimer);
        if (next < total) startTimer();
    };

    const goTo = (i: number) => {
        moveTo(i, true);
        startTimer();
    };

    const translatePct = ext > 0 ? (index / ext) * 100 : 0;
    const activeDot = index % total;

    return (
        <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-1 h-6 bg-teal-500 rounded-full inline-block" />
                            <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest">Онцлох</p>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Шилдэг борлуулалттай бараанууд</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={goPrev}
                            className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400 hover:text-teal-500 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={goNext}
                            className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400 hover:text-teal-500 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        <Link
                            href="/product"
                            className="hidden md:flex items-center gap-1 ml-2 text-teal-600 dark:text-teal-400 font-semibold hover:gap-2 transition-all duration-300"
                        >
                            Бүгдийг үзэх
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Carousel — desktop sliding / mobile static grid */}
                {isMobile ? (
                    <div className="grid grid-cols-2 gap-4">
                        {products.slice(0, COLS).map(p => (
                            <ProductCard key={p.id} {...p} />
                        ))}
                    </div>
                ) : (
                    <div className="overflow-hidden">
                        <div
                            className="flex"
                            style={{
                                width: `${(ext / COLS) * 100}%`,
                                transform: `translateX(-${translatePct}%)`,
                                transition: sliding
                                    ? `transform ${TRANSITION_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
                                    : "none",
                            }}
                        >
                            {items.map((product, i) => (
                                <div key={i} style={{ width: `${100 / ext}%` }} className="px-3">
                                    <ProductCard {...product} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Dots — desktop only */}
                {!isMobile && total > COLS && (
                    <div className="flex justify-center gap-2 mt-8">
                        {products.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${activeDot === i ? "w-6 bg-teal-500" : "w-1.5 bg-slate-300 dark:bg-slate-600"}`}
                            />
                        ))}
                    </div>
                )}

                {/* See all — mobile only */}
                <Link
                    href="/product"
                    className="md:hidden flex items-center justify-center gap-2 mt-6 py-3 rounded-2xl border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 font-semibold text-sm"
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
