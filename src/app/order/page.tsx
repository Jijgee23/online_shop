"use client";

import { useEffect } from "react";
import { useOrder } from "../context/order_context";
import { useAuth } from "../context/auth_context";
import { Package, Calendar, Tag, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OrderPage() {
    const { orders, fetchOrder } = useOrder();
    const { user } = useAuth();
    const router = useRouter()

    useEffect(() => {
        fetchOrder();
    }, []);

    const isEmpty = !orders || orders.length === 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20">
            <div className="max-w-5xl mx-auto px-6">

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
                        Захиалгын <span className="text-teal-500">түүх</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {user?.name} таны хийсэн нийт {orders.length} захиалга байна.
                    </p>
                </div>

                {isEmpty ? (
                    /* Empty State */
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-10 h-10 text-slate-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Танд захиалга алга</h2>
                        <p className="text-slate-500 mb-8">Та одоогоор ямар нэгэн худалдан авалт хийгээгүй байна.</p>
                        <Link href="/product">
                            <button className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-full font-bold transition-all">
                                Дэлгүүр хэсэх
                            </button>
                        </Link>
                    </div>
                ) : (
                    /* Order List */
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                onClick={() => router.push(`order/${order.id}`)}
                                key={order.id}
                                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-teal-500/50 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                {/* Order Basic Info */}
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                                        <Package className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                                            Захиалга #{order.id}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-slate-500">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1.5 font-semibold text-teal-600 dark:text-teal-400">
                                                <Tag className="w-4 h-4" />
                                                ₮{order.totalPrice?.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Action */}
                                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
                                    <div className="flex flex-col items-end">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 
                      ${order.status === 'DELIVERED'
                                                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}
                                        >
                                            <Clock className="w-3.5 h-3.5" />
                                            {order.status === 'DELIVERED' ? 'Хүргэгдсэн' : 'Боловсруулагдаж байна'}
                                        </span>
                                    </div>

                                    <Link href={`/order/${order.id}`}>
                                        <button className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-teal-500 rounded-full transition-colors">
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}