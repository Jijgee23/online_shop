"use client";

import { useEffect, useRef, useState } from "react";

export interface DropdownOption {
    id: number | string;
    label: string;
}

interface DropdownSelectProps {
    options: DropdownOption[];
    value: number | string | null | undefined;
    onChange: (id: number | string) => void;
    placeholder?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
    required?: boolean;
    className?: string;
}

export default function DropdownSelect({
    options,
    value,
    onChange,
    placeholder = "— Сонгох —",
    searchable = true,
    searchPlaceholder = "Хайх...",
    required,
    className = "",
}: DropdownSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    const selected = options.find(o => o.id === value);
    const filtered = searchable
        ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
        : options;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className={`relative ${className}`}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => { setOpen(o => !o); setSearch(""); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all
                    ${open
                        ? "bg-white dark:bg-slate-900 border-teal-500/50 ring-2 ring-teal-500/20"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
            >
                <span className={selected ? "text-slate-800 dark:text-white" : "text-slate-400 dark:text-slate-500"}>
                    {selected ? selected.label : placeholder}
                </span>
                <svg
                    className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden">
                    {/* Search */}
                    {searchable && (
                        <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    autoFocus
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder={searchPlaceholder}
                                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-800 dark:text-white outline-none placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    )}

                    {/* Options */}
                    <ul className="max-h-48 overflow-y-auto py-1">
                        {filtered.length === 0 ? (
                            <li className="px-4 py-3 text-sm text-slate-400 text-center">Олдсонгүй</li>
                        ) : filtered.map(o => (
                            <li key={o.id}>
                                <button
                                    type="button"
                                    onClick={() => { onChange(o.id); setOpen(false); setSearch(""); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between
                                        ${o.id === value
                                            ? "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold"
                                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        }`}
                                >
                                    {o.label}
                                    {o.id === value && (
                                        <svg className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Hidden input for form required validation */}
            {required && (
                <input type="text" required readOnly tabIndex={-1} value={value ?? ""} className="sr-only" />
            )}
        </div>
    );
}
