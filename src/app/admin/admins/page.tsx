"use client";

import { useCallback, useEffect, useState } from "react";
import { Customer } from "@/interface/user";
import Pagination from "@/ui/Pagination";
import { usePersistedPage } from "@/app/hooks/usePersistedPage";
import { PAGE_SIZE } from "@/app/product/constants";
import { Badge } from "@/ui/Badge";
import { UserStatus } from "@/generated/prisma";
import { getStatusName } from "@/utils/utils";
import { useAuth } from "@/app/context/auth_context";

export default function AdminAdminsPage() {
    const { user } = useAuth();
    const [admins, setAdmins] = useState<Customer[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [page, setPage] = usePersistedPage("admin:admins:page", [searchTerm]);

    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        const q = new URLSearchParams();
        q.set("page", String(page));
        q.set("pageSize", String(PAGE_SIZE));
        if (searchTerm) q.set("search", searchTerm);

        try {
            const res = await fetch(`/api/admin/admins?${q.toString()}`);
            const json = await res.json();
            if (res.ok) {
                setAdmins(Array.isArray(json.data) ? json.data : []);
                setTotal(json.total ?? 0);
            }
        } catch (err) {
            console.error("Error fetching admins", err);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm]);

    useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

    return (
        <>
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Админууд</h2>
                    <p className="text-slate-400 dark:text-zinc-500 text-sm">
                        Нийт <span className="text-slate-900 dark:text-white font-semibold">{total}</span> админ хэрэглэгч
                    </p>
                </div>

                <div className="relative group flex-1 min-w-64 w-full md:w-auto md:max-w-sm">
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
            </header>

            {/* Table */}
            {loading ? (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl">
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500" />
                    </div>
                </div>
            ) : admins.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] p-16 text-center shadow-2xl">
                    <div className="text-4xl mb-3">🛡️</div>
                    <p className="font-semibold text-slate-400 dark:text-zinc-500">Админ олдсонгүй</p>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="mt-3 text-teal-400 text-sm hover:underline"
                        >
                            Хайлт арилгах
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-100 dark:bg-zinc-950/50 text-slate-400 dark:text-zinc-500 text-[10px] uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="px-8 py-4 font-semibold">Админ</th>
                                    <th className="px-8 py-4 font-semibold">Холбоо барих</th>
                                    <th className="px-8 py-4 font-semibold">Бүртгүүлсэн</th>
                                    <th className="px-8 py-4 font-semibold">Төлөв</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                                {admins.map(admin => {
                                    const isMe = String(admin.id) === String(user?.id);
                                    return (
                                        <tr key={admin.id} className="hover:bg-slate-100 dark:hover:bg-zinc-800/50 transition-all">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                                                        {admin.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                                                            {admin.name}
                                                            {isMe && <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-500 px-2 py-0.5 rounded-full">Та</span>}
                                                        </p>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-teal-500">{admin.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm">
                                                <p className="text-slate-600 dark:text-zinc-300">{admin.email}</p>
                                                <p className="text-slate-400 dark:text-zinc-500 text-xs">{admin.phone}</p>
                                            </td>
                                            <td className="px-8 py-5 text-sm text-slate-500 dark:text-zinc-400">
                                                {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString("mn-MN") : "—"}
                                            </td>
                                            <td className="px-8 py-5">
                                                <Badge color={admin.status === UserStatus.ACTIVE ? "teal" : admin.status === UserStatus.NEW ? "blue" : "red"}>
                                                    {getStatusName(admin.status)}
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-8 py-4 bg-slate-50 dark:bg-zinc-950/20 border-t border-slate-200 dark:border-zinc-800 text-xs text-slate-400 dark:text-zinc-500">
                        Нийт {total} админ
                    </div>
                </div>
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
