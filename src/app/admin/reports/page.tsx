"use client";

import { useEffect, useRef, useState } from "react";
import { BarChart3, Package, MapPin, CreditCard, Tag, TrendingUp, ShoppingCart, Coins } from "lucide-react";

type ReportType = "products" | "districts" | "payment_method" | "category";

type ReportMeta = {
    dateFrom: string;
    dateTo: string;
    userId: number | null;
    totalRevenue: number;
    totalOrders: number;
};

type ReportResult = {
    meta: ReportMeta;
    type: ReportType;
    items: any[];
};

// ── User picker ───────────────────────────────────────────────────────────────

function UserPicker({ value, onChange }: {
    value: { id: number; name: string } | null;
    onChange: (v: { id: number; name: string } | null) => void;
}) {
    const [query,   setQuery]   = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [open,    setOpen]    = useState(false);
    const [loading, setLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const t = setTimeout(async () => {
            setLoading(true);
            try {
                const q = new URLSearchParams({ pageSize: "10" });
                if (query.trim()) q.set("search", query.trim());
                const res = await fetch(`/api/admin/customer?${q}`);
                const d   = await res.json();
                setResults(d.data ?? []);
            } finally { setLoading(false); }
        }, 250);
        return () => clearTimeout(t);
    }, [query, open]);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => { setOpen(o => !o); setQuery(""); }}
                className={`flex items-center gap-2 h-11 px-4 rounded-2xl border text-sm font-medium transition-all whitespace-nowrap ${
                    value
                        ? "bg-teal-500/10 border-teal-500/40 text-teal-400"
                        : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-600"
                }`}
            >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {value ? value.name : "Бүх хэрэглэгч"}
                {value && (
                    <span
                        onClick={e => { e.stopPropagation(); onChange(null); }}
                        className="hover:text-red-400 transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute left-0 top-full mt-1.5 z-50 w-72 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-slate-100 dark:border-zinc-800">
                        <input
                            autoFocus
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Нэр, имэйл, утас..."
                            className="w-full bg-slate-50 dark:bg-zinc-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white outline-none placeholder:text-slate-400"
                        />
                    </div>
                    <ul className="max-h-52 overflow-y-auto py-1">
                        {loading ? (
                            <li className="px-4 py-3 text-center">
                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-teal-500" />
                            </li>
                        ) : results.length === 0 ? (
                            <li className="px-4 py-3 text-sm text-slate-400 text-center">Олдсонгүй</li>
                        ) : results.map(c => (
                            <li key={c.id}>
                                <button
                                    type="button"
                                    onClick={() => { onChange({ id: c.id, name: c.name }); setOpen(false); setQuery(""); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800 ${value?.id === c.id ? "text-teal-500 font-semibold" : "text-slate-700 dark:text-zinc-300"}`}
                                >
                                    <p className="font-medium">{c.name}</p>
                                    <p className="text-xs text-slate-400 dark:text-zinc-500">{c.email}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// ── Shared bar ────────────────────────────────────────────────────────────────

function Bar({ value, max }: { value: number; max: number }) {
    const pct = max > 0 ? Math.max((value / max) * 100, 2) : 0;
    return (
        <div className="w-28 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
    );
}

// ── Report type config ────────────────────────────────────────────────────────

const REPORT_TYPES: { type: ReportType; label: string; icon: React.ReactNode }[] = [
    { type: "products",       label: "Бүтээгдэхүүнээр",  icon: <Package   className="w-3.5 h-3.5" /> },
    { type: "districts",      label: "Дүүргээр",          icon: <MapPin    className="w-3.5 h-3.5" /> },
    { type: "payment_method", label: "Төлбөрийн аргаар",  icon: <CreditCard className="w-3.5 h-3.5" /> },
    { type: "category",       label: "Ангилалаар",         icon: <Tag       className="w-3.5 h-3.5" /> },
];

// ── Result tables ─────────────────────────────────────────────────────────────

const thCls = "px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-zinc-500";
const tdCls = "px-6 py-4";

function ProductsTable({ items }: { items: any[] }) {
    const max = Math.max(...items.map(i => i.totalRevenue), 1);
    return (
        <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-100 dark:border-zinc-800">
                <tr>
                    <th className={thCls}>#</th>
                    <th className={thCls}>Бүтээгдэхүүн</th>
                    <th className={thCls + " text-right"}>Орлого</th>
                    <th className={thCls + " text-right"}>Тоо ширхэг</th>
                    <th className={thCls + " text-right"}>Захиалга</th>
                    <th className={thCls}></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {items.map(item => (
                    <tr key={item.productId} className="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className={tdCls + " text-slate-400 dark:text-zinc-500 text-sm font-mono"}>{item.rank}</td>
                        <td className={tdCls}>
                            <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.name}</p>
                            {item.sku && <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">{item.sku}</p>}
                        </td>
                        <td className={tdCls + " text-right font-bold text-teal-500"}>₮{item.totalRevenue.toLocaleString()}</td>
                        <td className={tdCls + " text-right text-sm text-slate-700 dark:text-zinc-300"}>{item.totalQuantity.toLocaleString()}</td>
                        <td className={tdCls + " text-right text-sm text-slate-700 dark:text-zinc-300"}>{item.orderCount}</td>
                        <td className={tdCls}><Bar value={item.totalRevenue} max={max} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function DistrictsTable({ items }: { items: any[] }) {
    const max = Math.max(...items.map(i => i.totalRevenue), 1);
    return (
        <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-100 dark:border-zinc-800">
                <tr>
                    <th className={thCls}>Дүүрэг</th>
                    <th className={thCls + " text-right"}>Захиалгын тоо</th>
                    <th className={thCls + " text-right"}>Нийт орлого</th>
                    <th className={thCls + " text-right"}>Дундаж дүн</th>
                    <th className={thCls}></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {items.map(item => (
                    <tr key={item.districtId ?? "unknown"} className="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className={tdCls}>
                            <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.districtName}</p>
                        </td>
                        <td className={tdCls + " text-right text-sm text-slate-700 dark:text-zinc-300"}>{item.orderCount}</td>
                        <td className={tdCls + " text-right font-bold text-teal-500"}>₮{item.totalRevenue.toLocaleString()}</td>
                        <td className={tdCls + " text-right text-sm text-slate-500 dark:text-zinc-400"}>
                            ₮{item.orderCount > 0 ? Math.round(item.totalRevenue / item.orderCount).toLocaleString() : "—"}
                        </td>
                        <td className={tdCls}><Bar value={item.totalRevenue} max={max} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function PaymentTable({ items }: { items: any[] }) {
    const max = Math.max(...items.map(i => i.totalAmount), 1);
    const TYPE_COLOR: Record<string, string> = {
        QPAY:        "bg-purple-500/10 text-purple-400 border-purple-500/20",
        CARD:        "bg-blue-500/10 text-blue-400 border-blue-500/20",
        BANK_APP:    "bg-green-500/10 text-green-400 border-green-500/20",
        ON_DELIVERY: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    };
    return (
        <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-100 dark:border-zinc-800">
                <tr>
                    <th className={thCls}>Аргачлал</th>
                    <th className={thCls + " text-right"}>Захиалгын тоо</th>
                    <th className={thCls + " text-right"}>Нийт дүн</th>
                    <th className={thCls + " text-right"}>Эзлэх хувь</th>
                    <th className={thCls}></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {items.map(item => {
                    const totalAll = items.reduce((s, i) => s + i.totalAmount, 0);
                    const pct = totalAll > 0 ? ((item.totalAmount / totalAll) * 100).toFixed(1) : "0";
                    return (
                        <tr key={item.type} className="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors">
                            <td className={tdCls}>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${TYPE_COLOR[item.type] ?? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}`}>
                                    {item.label}
                                </span>
                            </td>
                            <td className={tdCls + " text-right text-sm text-slate-700 dark:text-zinc-300"}>{item.orderCount}</td>
                            <td className={tdCls + " text-right font-bold text-teal-500"}>₮{item.totalAmount.toLocaleString()}</td>
                            <td className={tdCls + " text-right text-sm font-semibold text-slate-500 dark:text-zinc-400"}>{pct}%</td>
                            <td className={tdCls}><Bar value={item.totalAmount} max={max} /></td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

function CategoryTable({ items }: { items: any[] }) {
    const max = Math.max(...items.map(i => i.totalRevenue), 1);
    return (
        <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-100 dark:border-zinc-800">
                <tr>
                    <th className={thCls}>Ангилал</th>
                    <th className={thCls + " text-right"}>Бүтээгдэхүүн</th>
                    <th className={thCls + " text-right"}>Нийт орлого</th>
                    <th className={thCls + " text-right"}>Тоо ширхэг</th>
                    <th className={thCls}></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {items.map(item => (
                    <tr key={item.categoryId} className="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className={tdCls}>
                            <p className="font-semibold text-sm text-slate-900 dark:text-white">{item.name}</p>
                        </td>
                        <td className={tdCls + " text-right text-sm text-slate-700 dark:text-zinc-300"}>{item.productCount}</td>
                        <td className={tdCls + " text-right font-bold text-teal-500"}>₮{item.totalRevenue.toLocaleString()}</td>
                        <td className={tdCls + " text-right text-sm text-slate-700 dark:text-zinc-300"}>{item.totalQuantity.toLocaleString()}</td>
                        <td className={tdCls}><Bar value={item.totalRevenue} max={max} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminReportPage() {
    const today        = new Date().toISOString().split("T")[0];
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

    const [dateFrom,    setDateFrom]    = useState(firstOfMonth);
    const [dateTo,      setDateTo]      = useState(today);
    const [user,        setUser]        = useState<{ id: number; name: string } | null>(null);
    const [reportType,  setReportType]  = useState<ReportType>("products");
    const [result,      setResult]      = useState<ReportResult | null>(null);
    const [loading,     setLoading]     = useState(false);

    const handleGenerate = async () => {
        if (!dateFrom || !dateTo) return;
        setLoading(true);
        try {
            const q = new URLSearchParams({ type: reportType, dateFrom, dateTo });
            if (user) q.set("userId", String(user.id));
            const res  = await fetch(`/api/admin/report?${q}`);
            const data = await res.json();
            if (res.ok) setResult(data);
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "h-11 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all";

    return (
        <>
            {/* ── Header ── */}
            <header className="mb-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Тайлан</h2>
                <p className="text-slate-400 dark:text-zinc-500 text-sm">
                    Захиалга, орлого, борлуулалтын нэгтгэсэн тайлан
                </p>
            </header>

            {/* ── Form ── */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 mb-6 flex flex-col gap-6">

                {/* Dates + customer */}
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Эхлэх огноо</label>
                        <input
                            type="date"
                            value={dateFrom}
                            max={dateTo}
                            onChange={e => setDateFrom(e.target.value)}
                            className={inputCls}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Дуусах огноо</label>
                        <input
                            type="date"
                            value={dateTo}
                            min={dateFrom}
                            onChange={e => setDateTo(e.target.value)}
                            className={inputCls}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Хэрэглэгч (заавал биш)</label>
                        <UserPicker value={user} onChange={setUser} />
                    </div>
                </div>

                {/* Report type tabs */}
                <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Тайлангийн төрөл</p>
                    <div className="flex flex-wrap gap-2">
                        {REPORT_TYPES.map(rt => (
                            <button
                                key={rt.type}
                                onClick={() => setReportType(rt.type)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
                                    reportType === rt.type
                                        ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                                        : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
                                }`}
                            >
                                {rt.icon}
                                {rt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Generate */}
                <div className="flex justify-end border-t border-slate-100 dark:border-zinc-800 pt-4">
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !dateFrom || !dateTo}
                        className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-colors"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <BarChart3 className="w-4 h-4" />
                        )}
                        Тайлан гаргах
                    </button>
                </div>
            </div>

            {/* ── Empty state ── */}
            {!result && !loading && (
                <div className="flex flex-col items-center justify-center py-24 text-slate-300 dark:text-zinc-700">
                    <BarChart3 className="w-14 h-14 mb-4" />
                    <p className="font-semibold text-slate-500 dark:text-zinc-500">Тайлангийн төрлийг сонгоод «Тайлан гаргах» дарна уу</p>
                </div>
            )}

            {/* ── Results ── */}
            {result && (
                <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        {[
                            {
                                label: "Нийт орлого",
                                value: `₮${result.meta.totalRevenue.toLocaleString()}`,
                                color: "text-teal-400",
                                bg: "bg-teal-500/10",
                                icon: <TrendingUp className="w-5 h-5" />,
                            },
                            {
                                label: "Захиалгын тоо",
                                value: result.meta.totalOrders.toLocaleString(),
                                color: "text-blue-400",
                                bg: "bg-blue-500/10",
                                icon: <ShoppingCart className="w-5 h-5" />,
                            },
                            {
                                label: "Дундаж захиалга",
                                value: result.meta.totalOrders > 0
                                    ? `₮${Math.round(result.meta.totalRevenue / result.meta.totalOrders).toLocaleString()}`
                                    : "—",
                                color: "text-purple-400",
                                bg: "bg-purple-500/10",
                                icon: <Coins className="w-5 h-5" />,
                            },
                        ].map(s => (
                            <div key={s.label} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-3xl flex items-start gap-4">
                                <div className={`p-2.5 rounded-2xl ${s.bg} ${s.color}`}>{s.icon}</div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{s.label}</p>
                                    <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Table card */}
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-teal-400">{REPORT_TYPES.find(r => r.type === result.type)?.icon}</span>
                                <h3 className="font-bold text-slate-900 dark:text-white">
                                    {REPORT_TYPES.find(r => r.type === result.type)?.label}
                                </h3>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-zinc-500">
                                {result.meta.userId && <span className="px-2 py-1 rounded-lg bg-teal-500/10 text-teal-400 font-semibold">1 хэрэглэгч</span>}
                                <span>{result.meta.dateFrom} → {result.meta.dateTo}</span>
                                <span className="font-bold">{result.items.length} мөр</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {result.items.length === 0 ? (
                                <div className="px-8 py-16 text-center text-slate-400 dark:text-zinc-600">
                                    <p className="text-3xl mb-3">📊</p>
                                    <p className="font-semibold">Энэ хугацаанд мэдээлэл олдсонгүй</p>
                                </div>
                            ) : result.type === "products" ? (
                                <ProductsTable items={result.items} />
                            ) : result.type === "districts" ? (
                                <DistrictsTable items={result.items} />
                            ) : result.type === "payment_method" ? (
                                <PaymentTable items={result.items} />
                            ) : (
                                <CategoryTable items={result.items} />
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
