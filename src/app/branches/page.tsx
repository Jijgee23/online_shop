"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Header from "../components/Header";
import { useSettings } from "../context/settings_context";
import { MapPin, Phone, Map as MapIcon, Loader2, List, Clock, ChevronDown } from "lucide-react";
import { DAY_NAMES, normalizeHours, openStatus } from "@/lib/branchHours";

const MapPicker = dynamic(() => import("../components/MapPicker"), { ssr: false });
const BranchesMap = dynamic(() => import("../components/BranchesMap"), { ssr: false });

type ViewMode = "list" | "map";

interface Branch {
    id: number;
    name: string;
    phone: string | null;
    city: string;
    district: string | null;
    khoroo: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    hours: unknown;
}

const todayIdx = () => (new Date().getDay() + 6) % 7; // Да=0

function BranchCard({ b, onShowMap }: { b: Branch; onShowMap: (b: Branch) => void }) {
    const [expanded, setExpanded] = useState(false);
    const hours = normalizeHours(b.hours);
    const { open, today } = openStatus(hours);
    const ti = todayIdx();
    const location = [b.city, b.district, b.khoroo].filter(Boolean).join(", ");

    return (
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 flex flex-col transition-shadow hover:shadow-lg hover:shadow-slate-200/40 dark:hover:shadow-black/20">
            {/* Header */}
            <div className="flex items-start gap-3">
                <span className="w-11 h-11 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 dark:text-white">{b.name}</h3>
                        {hours && (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${open ? "bg-teal-500/10 text-teal-500" : "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500"}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${open ? "bg-teal-500" : "bg-slate-400 dark:bg-zinc-500"}`} />
                                {open ? "Нээлттэй" : "Хаалттай"}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{location}</p>
                </div>
            </div>

            {/* Today's hours — compact, always visible */}
            {hours && (
                <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mt-3">
                    <Clock className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                    <span>Өнөөдөр: {today?.open ? `${today.from}–${today.to}` : "Амарна"}</span>
                </p>
            )}

            {/* Expandable details */}
            <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                    <div className="pt-4 space-y-3">
                        {b.address && (
                            <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-zinc-300">
                                <MapPin className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                                <span>{b.address}</span>
                            </div>
                        )}
                        {b.phone && (
                            <a href={`tel:${b.phone}`} className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-300 hover:text-teal-500 transition-colors">
                                <Phone className="w-4 h-4 text-teal-500 flex-shrink-0" /> {b.phone}
                            </a>
                        )}

                        {hours && (
                            <div className="rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 p-3">
                                <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-200 mb-2">
                                    <Clock className="w-3.5 h-3.5 text-teal-500" /> Долоо хоногийн цагийн хуваарь
                                </p>
                                <div className="space-y-1">
                                    {hours.map((d, i) => (
                                        <div key={i} className={`flex items-center justify-between text-xs rounded-lg px-2 py-1 ${i === ti ? "bg-teal-500/10 font-semibold" : ""}`}>
                                            <span className={i === ti ? "text-teal-600 dark:text-teal-400" : "text-slate-500 dark:text-zinc-400"}>
                                                {DAY_NAMES[i]}{i === ti ? " · Өнөөдөр" : ""}
                                            </span>
                                            <span className={`tabular-nums ${d.open ? (i === ti ? "text-teal-600 dark:text-teal-400" : "text-slate-700 dark:text-zinc-200") : "text-slate-400 dark:text-zinc-600"}`}>
                                                {d.open ? `${d.from}–${d.to}` : "Амарна"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {b.latitude != null && b.longitude != null && (
                            <button onClick={() => onShowMap(b)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-sm hover:border-teal-400 transition-colors">
                                <MapIcon className="w-4 h-4 text-teal-500" /> Газрын зураг дээр харах
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Toggle */}
            <button
                onClick={() => setExpanded(e => !e)}
                className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-teal-500 hover:text-teal-400 transition-colors"
            >
                {expanded ? "Хураах" : "Дэлгэрэнгүй"}
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
            </button>
        </div>
    );
}

export default function BranchesPage() {
    const { settings, loading: settingsLoading } = useSettings();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [mapBranch, setMapBranch] = useState<Branch | null>(null);
    const [view, setView] = useState<ViewMode>("list");

    const hasLocated = branches.some(b => b.latitude != null && b.longitude != null);
    const disabled = !settingsLoading && !settings.showBranches;

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/branches");
                const d = await res.json();
                if (res.ok) setBranches(d.data ?? []);
            } finally { setLoading(false); }
        })();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20">
            <Header />
            <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Салбарууд</h1>
                        <p className="text-slate-400 dark:text-zinc-500 text-sm mt-1">Бидний салбар, байршлууд</p>
                    </div>

                    {!disabled && !loading && branches.length > 0 && (
                        <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 self-start sm:self-auto">
                            <button
                                onClick={() => setView("list")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                                    view === "list"
                                        ? "bg-white dark:bg-zinc-800 text-teal-500 shadow-sm"
                                        : "text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
                                }`}
                            >
                                <List className="w-4 h-4" /> Жагсаалт
                            </button>
                            <button
                                onClick={() => setView("map")}
                                disabled={!hasLocated}
                                title={!hasLocated ? "Байршил бүхий салбар алга" : undefined}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                    view === "map"
                                        ? "bg-white dark:bg-zinc-800 text-teal-500 shadow-sm"
                                        : "text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
                                }`}
                            >
                                <MapIcon className="w-4 h-4" /> Газрын зураг
                            </button>
                        </div>
                    )}
                </div>

                {disabled ? (
                    <div className="flex flex-col items-center justify-center text-center py-24 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800">
                        <MapPin className="w-10 h-10 text-slate-300 dark:text-zinc-700 mb-3" />
                        <p className="text-slate-500 dark:text-zinc-500">Салбарын мэдээлэл одоогоор боломжгүй байна.</p>
                    </div>
                ) : loading ? (
                    <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 text-teal-500 animate-spin" /></div>
                ) : branches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-24 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800">
                        <MapPin className="w-10 h-10 text-slate-300 dark:text-zinc-700 mb-3" />
                        <p className="text-slate-500 dark:text-zinc-500">Одоогоор салбар бүртгэгдээгүй байна.</p>
                    </div>
                ) : view === "map" ? (
                    <BranchesMap branches={branches} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
                        {branches.map(b => (
                            <BranchCard key={b.id} b={b} onShowMap={setMapBranch} />
                        ))}
                    </div>
                )}
            </main>

            {mapBranch && mapBranch.latitude != null && mapBranch.longitude != null && (
                <MapPicker
                    lat={mapBranch.latitude}
                    lng={mapBranch.longitude}
                    readOnly
                    title={mapBranch.name}
                    subtitle={[mapBranch.city, mapBranch.district, mapBranch.khoroo].filter(Boolean).join(", ") || "Салбарын байршил"}
                    onClose={() => setMapBranch(null)}
                />
            )}
        </div>
    );
}
