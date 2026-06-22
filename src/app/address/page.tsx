"use client";

import { useEffect } from "react";
import { MapPin, Plus, Home, Building2, Trash2, Pencil } from "lucide-react";
import AccountShell from "../components/AccountShell";
import { useAddress } from "../context/address_context";

export default function MyAddresses() {
    const { myAddresses, fetchAddress, create, deleteAddress, editAddress } = useAddress();
    useEffect(() => { fetchAddress(); }, []);

    return (
        <AccountShell title="Хаягууд">
            <div className="flex justify-end mb-5">
                <button
                    onClick={create}
                    className="flex items-center gap-2 bg-teal-500 text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-teal-600 shadow-lg shadow-teal-500/20 transition active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Шинэ хаяг нэмэх
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {myAddresses.length > 0 ? (
                    myAddresses.map((addr) => (
                        <div
                            key={addr.id}
                            className="group relative bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 hover:border-teal-400/50 transition-all"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-4 min-w-0">
                                    <div className={`p-3 rounded-2xl flex-shrink-0 ${addr.isMain ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600" : "bg-slate-50 dark:bg-zinc-800 text-slate-400"}`}>
                                        {addr.isMain ? <Home className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                                            <h3 className="font-bold text-slate-900 dark:text-white">
                                                {addr.district?.name} дүүрэг, {addr.khoroo}-р хороо
                                            </h3>
                                            {addr.isMain && (
                                                <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-wider rounded-md">
                                                    Үндсэн
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
                                            {addr.city}, {addr.detail}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                                            <MapPin className="w-4 h-4 text-teal-500" />
                                            <span>Утас: {addr.phone}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-1 flex-shrink-0">
                                    <button
                                        onClick={() => editAddress(addr.id)}
                                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-teal-500 transition"
                                    >
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => deleteAddress(addr.id)}
                                        className="p-2 rounded-xl text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                        <MapPin className="w-10 h-10 text-slate-200 dark:text-zinc-700 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 dark:text-zinc-500">Одоогоор хадгалсан хаяг байхгүй байна.</p>
                    </div>
                )}
            </div>
        </AccountShell>
    );
}
