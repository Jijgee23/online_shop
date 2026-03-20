"use client";

import Link from "next/link";
import { useCart } from "../context/cart_context";
import { useAuth } from "../context/auth_context";
import CartItemTile from "./components/cartItem";
import { useOrder } from "../context/order_context";

export default function CartPage() {
    const { cart, loading } = useCart();
    const { user } = useAuth();
    const { create } = useOrder()
    const loggedIn = user !== null;

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

            {/* --- Glassmorphism AppBar --- */}
            <header className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/">
                        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent cursor-pointer">
                            Онлайн Дэлгүүр
                        </h1>
                    </Link>

                    <nav className="flex space-x-8 items-center font-medium">
                        <Link href="/product" className="hidden md:block text-slate-700 dark:text-slate-300 hover:text-teal-500 transition-colors">
                            Бүтээгдэхүүн
                        </Link>

                        {loggedIn ? (
                            <div className="text-slate-700 dark:text-slate-300 font-semibold hidden md:block border-r border-slate-200 dark:border-slate-800 pr-6">
                                {user.name}
                            </div>
                        ) : (
                            <Link href="/auth/login" className="text-slate-700 dark:text-slate-300 hover:text-teal-500">
                                Нэвтрэх
                            </Link>
                        )}

                        {/* Cart Icon inside Header */}
                        <div className="relative p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {cart && cart.totalCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-red-600 text-white text-[10px] font-bold">
                                        {cart.totalCount}
                                    </span>
                                </span>
                            )}
                        </div>
                    </nav>
                </div>
            </header>

            {/* --- Main Content Area --- */}
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