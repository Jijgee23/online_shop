"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    MapPin,
    Plus,
    ChevronLeft,
    Home,
    Building2,
    Trash2,
    Pencil
} from "lucide-react";
import Header from "../components/Header";
import { useAddress } from "../context/address_context";


export default function MyAddresses() {
    
    const router = useRouter();
    const { myAddresses, fetchAddress, create, deleteAddress } = useAddress()
    useEffect(() => { fetchAddress() }, [])

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <Header />

            <main className="max-w-4xl mx-auto px-6 pt-24">
                {/* Хөтөч хэсэг */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition group"
                    >
                        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:bg-slate-100">
                            <ChevronLeft className="w-5 h-5" />
                        </div>
                        <span className="font-bold">Буцах</span>
                    </button>

                    <button
                        onClick={create}
                        className="flex items-center gap-2 bg-teal-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-teal-600 shadow-lg shadow-teal-500/20 transition active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Шинэ хаяг нэмэх
                    </button>
                </div>

                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8">Миний хаягууд</h1>

                <div className="grid grid-cols-1 gap-4">
                    {myAddresses.length > 0 ? (
                        myAddresses.map((addr) => (
                            <div
                                key={addr.id}
                                className="group relative bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-2xl ${addr.isMain ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                                            {addr.isMain ? <Home className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                                    {addr.district?.name} дүүрэг, {addr.khoroo}-р хороо
                                                </h3>
                                                {addr.isMain && (
                                                    <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-wider rounded-md">
                                                        Үндсэн
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-slate-500 dark:text-slate-400 mb-3">
                                                {addr.city}, {addr.detail}
                                            </p>

                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                                                <MapPin className="w-4 h-4 text-teal-500" />
                                                <span>Утас: {addr.phone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Үйлдэл хийх товчлуурууд */}
                                    <div className="flex gap-2">
                                        <button className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-500 transition">
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => deleteAddress(addr.id)}
                                            className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-red-500 transition">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                            <MapPin className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                            <p className="text-slate-500">Одоогоор хадгалсан хаяг байхгүй байна.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}