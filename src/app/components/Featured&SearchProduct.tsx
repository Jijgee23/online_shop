"use client";

import { useGoto } from "@/utils/useGoto";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSettings } from "@/app/context/settings_context";

const BANNER_DELAY = 5000;

function BannerCarousel({ banners, alt }: { banners: string[]; alt: string }) {
    const [active, setActive] = useState(0);

    useEffect(() => {
        if (banners.length < 2) return;
        const id = setInterval(() => {
            setActive(i => (i + 1) % banners.length);
        }, BANNER_DELAY);
        return () => clearInterval(id);
    }, [banners.length]);

    if (banners.length === 0) return null;

    const prev = () => setActive(i => (i - 1 + banners.length) % banners.length);
    const next = () => setActive(i => (i + 1) % banners.length);

    return (
        <div className="relative w-full h-56 sm:h-72 lg:h-[420px] rounded-3xl overflow-hidden shadow-sm bg-slate-100 dark:bg-slate-900 group">
            {banners.map((url, idx) => (
                <Image
                    key={url + idx}
                    src={url}
                    alt={alt}
                    fill
                    priority={idx === 0}
                    sizes="(max-width: 1152px) 100vw, 1152px"
                    className={`object-cover transition-opacity duration-700 ${idx === active ? "opacity-100" : "opacity-0"}`}
                />
            ))}
            {banners.length > 1 && (
                <>
                    {/* Prev / Next arrows */}
                    <button
                        type="button"
                        aria-label="Өмнөх баннер"
                        onClick={prev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        aria-label="Дараах баннер"
                        onClick={next}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                aria-label={`Баннер ${idx + 1}`}
                                onClick={() => setActive(idx)}
                                className={`h-1.5 rounded-full transition-all ${idx === active ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function FeaturedSearchProduct(props: {
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
}) {
    const goto = useGoto();
    const { settings } = useSettings();
    const navigate = () => {
        goto(`/product?search=${encodeURIComponent(props.searchQuery)}`);
    };

    return (
        <section className="relative pt-28 pb-12 overflow-hidden bg-white dark:bg-slate-950">
            <div className="absolute -top-40 -left-40 w-[480px] h-[480px] bg-teal-400/10 dark:bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-400/10 dark:bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

            {settings.banners.length > 0 && (
                <div className="relative max-w-6xl mx-auto px-6 mb-10 z-10">
                    <BannerCarousel banners={settings.banners} alt={settings.storeName || "Баннер"} />
                </div>
            )}

            <div className="relative max-w-2xl mx-auto px-6 text-center z-10">

                {/* <p className="text-[11px] font-extrabold tracking-[0.25em] uppercase text-teal-500 mb-4">
                    {settings.storeName || "Дэлгүүр"} — Онлайн дэлгүүр
                </p> */}

                {/* <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-4">
                    Таны хүссэн{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-500">
                        бүтээгдэхүүн
                    </span>
                </h1> */}

                {/* <p className="text-base text-slate-500 dark:text-slate-400 mb-7 leading-relaxed">
                    Чанартай, хямд үнэтэй бараануудыг нэг дороос олоорой.
                </p> */}

                <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-teal-400/40 focus-within:border-teal-400 dark:focus-within:border-teal-500 transition-all">
                    <svg
                        className="ml-4 w-5 h-5 text-slate-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={props.searchQuery}
                        onChange={(e) => props.setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && navigate()}
                        placeholder="Бүтээгдэхүүн хайх..."
                        className="flex-1 bg-transparent outline-none px-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 text-sm"
                    />
                    <button
                        onClick={navigate}
                        className="m-1.5 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                    >
                        Хайх
                    </button>
                </div>
            </div>
        </section>
    );
}
