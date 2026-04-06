"use client";

import React, { useState } from "react";
import { useCart } from "../context/cart_context";
import CartItemTile from "./components/CartItem";
import { useOrder } from "../context/order_context";
import Header from "../components/Header";
import { useAddress, AddressInput } from "../context/address_context";
import toast from "react-hot-toast";
import EmptyCart from "./components/EmptyCart";
import CheckoutPanel, { EMPTY_ADDR, Step, CheckoutPanelProps } from "./components/CheckoutPanel";
import { Cart } from "@/interface/cart";

export default function CartPage() {
    const { cart, loading } = useCart();
    const { createOrder } = useOrder();
    const { myAddresses, districts, fetchAddress } = useAddress();
    const [step, setStep] = useState<Step>("summary");
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [note, setNote] = useState("");
    const [placing, setPlacing] = useState(false);
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
        setPaymentMethod("");
        setNote("");
        setPlacing(false);
        setShowAddressForm(false);
        setNewAddr(EMPTY_ADDR);
        setSheetOpen(false);
        setOrderNumber("");
    };

    const handleConfirmOrder = async (paymentConfirmed: boolean) => {
        if (!paymentMethod) return;
        setPlacing(true);
        try {
            const ok = await createOrder({ addressId: selectedAddressId, paymentMethod, note, paymentConfirmed });
            if (ok) {
                const num = `AAA${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`;
                setOrderNumber(num);
                setStep("done");
            }
        } finally {
            setPlacing(false);
        }
    };

    const openCheckout = () => {
        fetchAddress();
        setStep("summary");
        setSheetOpen(true);
    };

    if (loading && !cart) return (
        <div className="min-h-screen flex items-center justify-center dark:bg-slate-950">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500" />
        </div>
    );

    const isEmpty = !cart || !cart.items || cart.items.length === 0;

    const sharedProps: CheckoutPanelProps = {
        cart, step, setStep,
        selectedAddressId, setSelectedAddressId, myAddresses,
        paymentMethod, setPaymentMethod,
        note, setNote,
        showAddressForm, setShowAddressForm,
        savingAddress, districts, newAddr, setNewAddr, handleSaveNewAddress,
        handleConfirmOrder, placing,
        orderNumber, resetCheckout,
        onStartCheckout: () => { fetchAddress(); setStep("summary"); },
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-24 pb-32 lg:pb-16">

                <CartTitle cart={cart!} isEmpty={isEmpty}></CartTitle>

                {isEmpty ? (<EmptyCart />) : (
                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                        <div className="flex-1 space-y-3">
                            {cart.items.map((item: any) => <CartItemTile key={item.id} {...item} />)}
                        </div>

                        {/* Desktop sidebar */}
                        <div className="hidden lg:block w-96 flex-shrink-0">
                            <div className="sticky top-28 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                                <CheckoutPanel {...sharedProps} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile sticky bar */}
            {!isEmpty && (<MobileStickyBar cart={cart} openCheckout={openCheckout} />)}

            {/* Mobile sheet */}
            {sheetOpen && (
                <>
                    <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => step !== "done" && setSheetOpen(false)} />
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90dvh] flex flex-col">
                        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                            <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
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



function CartTitle(
    { cart, isEmpty }: { cart: Cart, isEmpty: boolean }
) {
    return (
        <div className="mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-1">
                Миний <span className="bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">сагс</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                {isEmpty ? "Таны сагс одоогоор хоосон байна." : `Нийт ${cart.totalCount} бараа сонгосон.`}
            </p>
        </div>
    )
}

function MobileStickyBar({ cart, openCheckout }: { cart: Cart | null, openCheckout: () => void }) {
    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-3">
            <div className="flex items-center gap-4 max-w-lg mx-auto">
                <div className="flex-1">
                    <p className="text-xs text-slate-400">Нийт дүн</p>
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white">₮{Number(cart?.totalPrice).toLocaleString()}</p>
                </div>
                <button onClick={openCheckout}
                    className="flex-shrink-0 bg-gradient-to-r from-teal-500 to-teal-400 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-teal-500/30 active:scale-95 transition-all">
                    Захиалах →
                </button>
            </div>
        </div>
    )
}
