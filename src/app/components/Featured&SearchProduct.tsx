"use client";

import { useGoto } from "@/utils/useGoto";
import { Dispatch, SetStateAction } from "react";

export default function FeaturedSearchProduct(props: {
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
}) {
    const goto = useGoto();
    const navigate = () => {
        goto(`/product?search=${encodeURIComponent(props.searchQuery)}`);
    };

    return (
        <section className="relative pt-28 pb-20 overflow-hidden bg-white dark:bg-slate-950">
            <div className="absolute -top-40 -left-40 w-[480px] h-[480px] bg-teal-400/10 dark:bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-400/10 dark:bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-2xl mx-auto px-6 text-center z-10">
                <p className="text-[11px] font-extrabold tracking-[0.25em] uppercase text-teal-500 mb-5">
                    IShop — Онлайн дэлгүүр
                </p>

                <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-5">
                    Таны хүссэн{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-500">
                        бүтээгдэхүүн
                    </span>
                </h1>

                <p className="text-base text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">
                    Чанартай, хямд үнэтэй бараануудыг нэг дороос олоорой.
                </p>

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
