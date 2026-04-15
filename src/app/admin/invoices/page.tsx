"use client";

import { useCallback, useEffect, useState } from "react";
import Pagination from "@/ui/Pagination";
import { usePersistedPage } from "@/app/hooks/usePersistedPage";
import DropdownSelect from "@/ui/DropdownSelect";
import DateRangePicker from "@/ui/DateRangePicker";
import { PAGE_SIZE } from "@/app/product/constants";
import InvoiceDrawer from "./InvoiceDrawer";
import InvoiceTable from "./InvoiceTable";
import { getInvoiceStatus } from "./InvoiceStatusBadge";

const HAS_ORDER_OPTIONS = [
    { id: "",    label: "Бүх төлөв" },
    { id: "yes", label: "Захиалга үүссэн" },
    { id: "no",  label: "Захиалга үүсээгүй" },
];

export default function AdminInvoicesPage() {
    const [invoices,       setInvoices]       = useState<any[]>([]);
    const [total,          setTotal]          = useState(0);
    const [loading,        setLoading]        = useState(false);
    const [search,         setSearch]         = useState("");
    const [hasOrder,       setHasOrder]       = useState("");
    const [dateFrom,       setDateFrom]       = useState("");
    const [dateTo,         setDateTo]         = useState("");
    const [selectedInvId,  setSelectedInvId]  = useState<string | null>(null);

    const [page, setPage] = usePersistedPage("admin:invoices:page", [search, hasOrder, dateFrom, dateTo]);

    const fetch_ = useCallback(async () => {
        setLoading(true);
        const q = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
        if (search)   q.set("search",   search);
        if (hasOrder) q.set("hasOrder", hasOrder);
        if (dateFrom) q.set("dateFrom", dateFrom);
        if (dateTo)   q.set("dateTo",   dateTo);
        try {
            const res = await fetch(`/api/admin/invoice?${q}`);
            const d   = await res.json();
            if (res.ok) { setInvoices(d.data ?? []); setTotal(d.total ?? 0); }
        } finally { setLoading(false); }
    }, [page, search, hasOrder, dateFrom, dateTo]);

    useEffect(() => { fetch_(); }, [fetch_]);

    const confirmed = invoices.filter(i => getInvoiceStatus(i).label === "Баталгаажсан").length;
    const pending   = invoices.filter(i => getInvoiceStatus(i).label === "Хүлээгдэж байна").length;
    const expired   = invoices.filter(i => getInvoiceStatus(i).label === "Хугацаа дууссан").length;

    return (
        <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">QPay Invoice</h2>
                    <p className="text-slate-400 dark:text-zinc-500 text-sm">
                        Нийт <span className="text-white font-semibold">{total}</span> invoice
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto flex-wrap items-center">
                    <div className="relative group flex-1 min-w-56">
                        <input
                            type="text" placeholder="Invoice ID, sender no..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
                        />
                        <svg className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <DropdownSelect
                        value={hasOrder}
                        onChange={id => setHasOrder(String(id))}
                        options={HAS_ORDER_OPTIONS}
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
                    { label: "Баталгаажсан",    value: confirmed, cls: "text-teal-400"  },
                    { label: "Хүлээгдэж байна", value: pending,   cls: "text-amber-400" },
                    { label: "Хугацаа дууссан", value: expired,   cls: "text-red-400"   },
                ].map(s => (
                    <div key={s.label} className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl">
                        <p className="text-slate-400 dark:text-zinc-500 text-xs font-bold uppercase mb-1">{s.label}</p>
                        <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            <InvoiceTable invoices={invoices} loading={loading} onSelect={setSelectedInvId} />

            <Pagination currentPage={page} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setPage} />

            {/* Detail drawer */}
            {selectedInvId && (
                <InvoiceDrawer invoiceId={selectedInvId} onClose={() => setSelectedInvId(null)} />
            )}
        </>
    );
}
