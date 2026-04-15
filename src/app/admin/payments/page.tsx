"use client";

import { useCallback, useEffect, useState } from "react";
import Pagination from "@/ui/Pagination";
import { usePersistedPage } from "@/app/hooks/usePersistedPage";
import DropdownSelect from "@/ui/DropdownSelect";
import DateRangePicker from "@/ui/DateRangePicker";
import { PAGE_SIZE } from "@/app/product/constants";

const STATUS_OPTIONS = [
    { id: "",        label: "Бүх төлөв" },
    { id: "PAID",    label: "Төлөгдсөн" },
    { id: "PENDING", label: "Хүлээгдэж байна" },
    { id: "FAILED",  label: "Амжилтгүй" },
];

function paymentStatusCls(status: string) {
    if (status === "PAID")   return "bg-teal-500/10 text-teal-400 border border-teal-500/20";
    if (status === "FAILED") return "bg-red-500/10 text-red-400 border border-red-500/20";
    return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
}

function paymentStatusLabel(status: string) {
    if (status === "PAID")   return "Төлөгдсөн";
    if (status === "FAILED") return "Амжилтгүй";
    return "Хүлээгдэж байна";
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [total,    setTotal]    = useState(0);
    const [loading,  setLoading]  = useState(false);
    const [search,   setSearch]   = useState("");
    const [status,   setStatus]   = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo,   setDateTo]   = useState("");

    const [page, setPage] = usePersistedPage("admin:payments:page", [search, status, dateFrom, dateTo]);

    const fetch_ = useCallback(async () => {
        setLoading(true);
        const q = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
        if (search)   q.set("search",   search);
        if (status)   q.set("status",   status);
        if (dateFrom) q.set("dateFrom", dateFrom);
        if (dateTo)   q.set("dateTo",   dateTo);
        try {
            const res = await fetch(`/api/admin/payment?${q}`);
            const d   = await res.json();
            if (res.ok) { setPayments(d.data ?? []); setTotal(d.total ?? 0); }
        } finally { setLoading(false); }
    }, [page, search, status, dateFrom, dateTo]);

    useEffect(() => { fetch_(); }, [fetch_]);

    const paidCount    = payments.filter(p => p.status === "PAID").length;
    const pendingCount = payments.filter(p => p.status === "PENDING").length;
    const totalAmount  = payments.filter(p => p.status === "PAID").reduce((s, p) => s + Number(p.amount), 0);

    return (
        <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Төлбөрүүд</h2>
                    <p className="text-slate-400 dark:text-zinc-500 text-sm">
                        Нийт <span className="text-white font-semibold">{total}</span> төлбөрийн бүртгэл
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto flex-wrap items-center">
                    <div className="relative group flex-1 min-w-56">
                        <input
                            type="text" placeholder="Захиалгын дугаар, хэрэглэгч..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
                        />
                        <svg className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <DropdownSelect
                        value={status}
                        onChange={id => setStatus(String(id))}
                        options={STATUS_OPTIONS}
                        searchable={false}
                        placeholder="Бүх төлөв"
                    />
                    <DateRangePicker
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                        onChange={(from, to) => { setDateFrom(from); setDateTo(to); }}
                    />
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                {[
                    { label: "Төлөгдсөн", value: paidCount, cls: "text-teal-400" },
                    { label: "Хүлээгдэж буй", value: pendingCount, cls: "text-amber-400" },
                    { label: "Нийт орлого (энэ хуудас)", value: `₮${totalAmount.toLocaleString()}`, cls: "text-white" },
                ].map(s => (
                    <div key={s.label} className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl">
                        <p className="text-slate-400 dark:text-zinc-500 text-xs font-bold uppercase mb-1">{s.label}</p>
                        <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500" />
                    </div>
                ) : payments.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="text-4xl mb-3">💳</div>
                        <p className="font-semibold text-slate-400 dark:text-zinc-500">Төлбөр олдсонгүй</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-zinc-800 text-xs uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                    <th className="text-left px-6 py-4">Захиалга</th>
                                    <th className="text-left px-6 py-4">Хэрэглэгч</th>
                                    <th className="text-left px-6 py-4">Арга</th>
                                    <th className="text-right px-6 py-4">Дүн</th>
                                    <th className="text-left px-6 py-4">Төлөв</th>
                                    <th className="text-left px-6 py-4">Огноо</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                {payments.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                                        <td className="px-6 py-4 font-mono text-teal-500 font-bold text-xs">
                                            {p.order?.orderNumber ?? `#${p.orderId}`}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-900 dark:text-white">{p.order?.user?.name ?? "—"}</p>
                                            <p className="text-xs text-slate-400">{p.order?.user?.email ?? ""}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-2 py-0.5 rounded-lg">
                                                {p.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                                            ₮{Number(p.amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${paymentStatusCls(p.status)}`}>
                                                {paymentStatusLabel(p.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400 dark:text-zinc-500">
                                            {p.updatedAt ? new Date(p.updatedAt).toLocaleString("mn-MN") : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Pagination currentPage={page} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </>
    );
}
