"use client";

import { useCallback, useEffect, useState } from "react";
import { Customer } from "@/interface/user";
import CustomerTable from "./components/table/CustomerTable";
import Pagination from "@/ui/Pagination";
import { usePersistedPage } from "@/app/hooks/usePersistedPage";

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
    { value: "",         label: "Бүх төлөв" },
    { value: "ACTIVE",   label: "Идэвхтэй" },
    { value: "NEW",      label: "Шинэ" },
    { value: "INACTIVE", label: "Идэвхгүй" },
];

export default function AdminCustomersPage() {
    const [customers,    setCustomers]    = useState<Customer[]>([]);
    const [total,        setTotal]        = useState(0);
    const [loading,      setLoading]      = useState(false);
    const [searchTerm,   setSearchTerm]   = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [page, setPage] = usePersistedPage("admin:customers:page", [searchTerm, statusFilter]);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        const q = new URLSearchParams();
        q.set("page",     String(page));
        q.set("pageSize", String(PAGE_SIZE));
        if (searchTerm)   q.set("search", searchTerm);
        if (statusFilter) q.set("status", statusFilter);

        try {
            const res  = await fetch(`/api/admin/customer?${q.toString()}`);
            const json = await res.json();
            if (res.ok) {
                setCustomers(Array.isArray(json.data) ? json.data : []);
                setTotal(json.total ?? 0);
            }
        } catch (err) {
            console.error("Error fetching customers", err);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, statusFilter]);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    return (
        <>
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Хэрэглэгчид</h2>
                    <p className="text-slate-400 dark:text-zinc-500 text-sm">
                        Нийт <span className="text-white font-semibold">{total}</span> бүртгэлтэй хэрэглэгч
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto flex-wrap">
                    {/* Search */}
                    <div className="relative group flex-1 min-w-64">
                        <input
                            type="text"
                            placeholder="Нэр, имэйл, утасаар хайх..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
                        />
                        <svg className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 dark:text-zinc-500 group-focus-within:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Status filter */}
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
                    >
                        {STATUS_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <div className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl">
                    <p className="text-slate-400 dark:text-zinc-500 text-xs font-bold uppercase mb-1">Нийт хэрэглэгч</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{total}</p>
                </div>
                <div className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl">
                    <p className="text-slate-400 dark:text-zinc-500 text-xs font-bold uppercase mb-1">Шинэ (Сүүлийн 7 хоног)</p>
                    <p className="text-3xl font-bold text-teal-400">
                        {customers.filter(c => c.createdAt && (Date.now() - new Date(c.createdAt).getTime()) / 86400000 <= 7).length}
                    </p>
                </div>
                <div className="bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl">
                    <p className="text-slate-400 dark:text-zinc-500 text-xs font-bold uppercase mb-1">Идэвхгүй</p>
                    <p className="text-3xl font-bold text-slate-400 dark:text-zinc-600">
                        {customers.filter(c => c.status === "INACTIVE").length}
                    </p>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl">
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500" />
                    </div>
                </div>
            ) : customers.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-16 text-center shadow-2xl">
                    <div className="text-4xl mb-3">👤</div>
                    <p className="font-semibold text-slate-400 dark:text-zinc-500">Хэрэглэгч олдсонгүй</p>
                    {(searchTerm || statusFilter) && (
                        <button
                            onClick={() => { setSearchTerm(""); setStatusFilter(""); }}
                            className="mt-3 text-teal-400 text-sm hover:underline"
                        >
                            Шүүлтүүр арилгах
                        </button>
                    )}
                </div>
            ) : (
                <CustomerTable
                    customers={customers}
                    total={total}
                    page={page}
                    pageSize={PAGE_SIZE}
                />
            )}

            {/* Pagination */}
            <Pagination
                currentPage={page}
                totalItems={total}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
            />
        </>
    );
}
