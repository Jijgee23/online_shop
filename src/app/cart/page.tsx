"use client";

import React, { useState } from "react";
import { useCart } from "../context/cart_context";
import CartItemTile from "./components/CartItemTile";
import Header from "../components/Header";
import { useAddress, AddressInput } from "../context/address_context";
import toast from "react-hot-toast";
import EmptyCart from "./components/EmptyCart";

import { Cart } from "@/interface/cart";
import { CheckoutPanelProps, EMPTY_ADDR, Step } from "./components/CheckOutPanel/shared";
import CheckoutPanel from "./components/CheckOutPanel/CheckoutPanel";
import { ShoppingBag } from "lucide-react";

export default function CartPage() {
    const { cart, loading, fetchCart } = useCart();
    const { myAddresses, districts, fetchAddress } = useAddress();
    const [step, setStep] = useState<Step>("summary");
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [note, setNote] = useState("");
    const [sheetOpen, setSheetOpen] = useState(false);
    const [orderNumber, setOrderNumber] = useState("");
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [savingAddress, setSavingAddress] = useState(false);
    const [newAddr, setNewAddr] = useState<AddressInput>(EMPTY_ADDR);

    const handleSaveNewAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingAddress(true);
        try {
            const res = await fetch("/api/address", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ address: newAddr }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Хаяг хадгалагдлаа");
                await fetchAddress();
                setSelectedAddressId(data.data?.id ?? null);
                setShowAddressForm(false);
                setNewAddr(EMPTY_ADDR);
            } else {
                toast.error(data.message ?? "Хадгалахад алдаа гарлаа");
            }
        } catch {
            toast.error("Алдаа гарлаа");
        } finally {
            setSavingAddress(false);
        }
    };

    const resetCheckout = () => {
        setStep("summary");
        setSelectedAddressId(null);
        setNote("");
        setShowAddressForm(false);
        setNewAddr(EMPTY_ADDR);
        setSheetOpen(false);
        setOrderNumber("");
    };

    const handleQPayDone = (num: string) => {
        setOrderNumber(num);
        setStep("done");
        fetchCart();
    };

    const openCheckout = () => {
        fetchAddress();
        setStep("summary");
        setSheetOpen(true);
    };

    if (loading && !cart) return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500" />
        </div>
    );

    const isEmpty = !cart || !cart.items || cart.items.length === 0;

    const sharedProps: CheckoutPanelProps = {
        cart, step, setStep,
        selectedAddressId, setSelectedAddressId, myAddresses,
        note, setNote,
        showAddressForm, setShowAddressForm,
        savingAddress, districts, newAddr, setNewAddr, handleSaveNewAddress,
        onQPayDone: handleQPayDone,
        orderNumber, resetCheckout,
        onStartCheckout: () => { fetchAddress(); setStep("summary"); },
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32 lg:pb-16">

                {/* Page title */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-1">
                        <ShoppingBag className="w-7 h-7 text-teal-500" />
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Миний сагс
                        </h1>
                    </div>
                    <p className="text-sm text-slate-400 dark:text-zinc-500 ml-10">
                        {isEmpty
                            ? "Таны сагс одоогоор хоосон байна"
                            : `${cart.totalCount} бараа сонгогдсон`}
                    </p>
                </div>

                {isEmpty ? (
                    <EmptyCart />
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

                        {/* Cart items */}
                        <div className="flex-1 space-y-3">
                            {cart.items.map((item: any) => (
                                <CartItemTile key={item.id} {...item} />
                            ))}

                            {/* Mobile total summary */}
                            <div className="lg:hidden bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-400 dark:text-zinc-500 mb-0.5">Нийт дүн</p>
                                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                        ₮{Number(cart.totalPrice).toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={openCheckout}
                                    className="px-6 py-3 bg-teal-500 hover:bg-teal-400 active:scale-95 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-teal-500/25"
                                >
                                    Захиалах →
                                </button>
                            </div>
                        </div>

                        {/* Desktop checkout sidebar */}
                        <div className="hidden lg:block w-[400px] flex-shrink-0">
                            <div className="sticky top-28 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-xl dark:shadow-zinc-900 overflow-hidden">
                                <CheckoutPanel {...sharedProps} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile sticky bottom bar */}
            {!isEmpty && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-slate-100 dark:border-zinc-800 px-4 py-3 safe-area-bottom">
                    <div className="flex items-center gap-4 max-w-lg mx-auto">
                        <div className="flex-1">
                            <p className="text-xs text-slate-400 dark:text-zinc-500">Нийт дүн</p>
                            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                                ₮{Number(cart.totalPrice).toLocaleString()}
                            </p>
                        </div>
                        <button
                            onClick={openCheckout}
                            className="flex-shrink-0 px-8 py-3.5 bg-teal-500 hover:bg-teal-400 active:scale-95 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-teal-500/25"
                        >
                            Захиалах →
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile checkout sheet */}
            {sheetOpen && (
                <>
                    <div
                        className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                        onClick={() => step !== "done" && setSheetOpen(false)}
                    />
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 rounded-t-3xl shadow-2xl max-h-[92dvh] flex flex-col">
                        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                            <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-zinc-700" />
                        </div>
                        <div className="overflow-y-auto flex-1">
                            <CheckoutPanel {...sharedProps} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
