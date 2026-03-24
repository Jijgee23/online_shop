"use client";

import Link from "next/link";
import { useCart } from "../context/cart_context";
import { useAuth } from "../context/auth_context";
import CartItemTile from "./components/cartItem";
import { useOrder } from "../context/order_context";
import Header from "../components/Header";
import { useAddress } from "../context/address_context";

export default function CartPage() {
    const { cart, loading } = useCart();
    const { create } = useOrder()
   
    if (loading && !cart) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    const isEmpty = !cart || !cart.items || cart.items.length === 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-20">

            <Header />

            <div className="max-w-7xl mx-auto px-6 pt-32">
                <CartHeader
                    isEmpty={isEmpty}
                    count={cart?.totalCount || 0}
                />

                {isEmpty ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Сагс хоосон байна</h2>
                        <Link href="/product">
                            <button className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all active:scale-95">
                                Дэлгүүр хэсэх
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Cart Items List */}
                        <div className="flex-1 space-y-4">
                            {cart.items.map((item) => (
                                <CartItemTile key={item.id} {...item} />
                            ))}
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="w-full lg:w-96">
                            <div className="sticky top-32 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Захиалгын хэсэг</h3>
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-slate-500">
                                        <span>Барааны тоо</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">{cart.totalCount || 0} ширхэг</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                        <span>Хүргэлт</span>
                                        <span className="text-teal-500 font-medium">Үнэгүй</span>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                                        <span className="text-lg font-bold dark:text-white">Нийт дүн</span>
                                        <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                            ₮{cart.totalPrice?.toLocaleString() || '0'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={create}
                                    className="w-full bg-slate-900 dark:bg-teal-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95"
                                >
                                    Худалдан авах
                                </button>
                                <p className="text-xs text-slate-400 text-center mt-4 italic">
                                    * Таны захиалга 24-48 цагийн дотор хүргэгдэнэ.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Sub-component for Header Text
interface CartHeaderProps {
    isEmpty: boolean;
    count: number;
}
const CartHeader = ({ isEmpty, count }: CartHeaderProps) => {
    return (
        <div className="mb-12">
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
                Миний <span className="bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">сагс</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
                {isEmpty ? "Таны сагс одоогоор хоосон байна." : `Нийт ${count} бараа сонгосон байна.`}
            </p>
        </div>
    );
}