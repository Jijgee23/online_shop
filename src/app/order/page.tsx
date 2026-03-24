"use client";

import { useEffect } from "react";
import { useOrder } from "../context/order_context";
import { useAuth } from "../context/auth_context";
import { Package } from "lucide-react";
import Link from "next/link";
import Header from "../components/Header";
import OrderTile from "./components/OrderTile";

export default function OrderPage() {
    const { orders, fetchOrder } = useOrder();
    const { user } = useAuth();

    useEffect(() => {
        fetchOrder();
    }, []);

    const isEmpty = !orders || orders.length === 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20">
            <Header />
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

                {isEmpty ? (<EmptyOrders></EmptyOrders>) : (

                    <div className="space-y-4">
                        {orders.map((order) => (
                            <OrderTile key={order.id} {...order}></OrderTile>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const EmptyOrders = () => {
    return (<div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
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
    </div>)
}