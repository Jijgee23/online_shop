"use client";

import { useCart } from "@/app/context/cart_context";
import { CartItem } from "@/interface/cart";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function CartItemTile(item: CartItem) {
    const { updateQty, remove } = useCart();
    const router = useRouter();
    if (!item.product) return null;

    const stock = item.product.stock;
    const [localQty, setLocalQty] = useState(String(item.quantity));

    useEffect(() => { setLocalQty(String(item.quantity)); }, [item.quantity]);

    const commit = (raw: string) => {
        const v = parseInt(raw, 10);
        if (isNaN(v) || v < 1) { setLocalQty(String(item.quantity)); return; }
        const clamped = Math.min(v, stock);
        setLocalQty(String(clamped));
        if (clamped !== item.quantity) updateQty(item.id, clamped);
    };

    const total = (item.product.price * item.quantity).toLocaleString();
    const unitPrice = item.product.price?.toLocaleString();

    return (
        <div
            onClick={() => router.push(`/product/${item.product.id}`)}
            className="group relative bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl flex items-center gap-4 p-3 sm:p-4 hover:border-slate-200 dark:hover:border-zinc-700 hover:shadow-md dark:hover:shadow-zinc-900/50 transition-all duration-200 cursor-pointer"
        >
            {/* Image */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 flex-shrink-0">
                <img
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${item.product.images?.[0]?.url || "/uploads/placeholder.png"}`}
                    alt={item.product.name || "Product"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate leading-tight">
                    {item.product.name}
                </h3>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
                    ₮{unitPrice} × {item.quantity}ш
                </p>
                <p className="text-base sm:text-lg font-extrabold text-teal-500 mt-0.5">
                    ₮{total}
                </p>
            </div>

            {/* Qty stepper */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <div className="flex items-center bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-1 gap-0.5">
                    <button
                        onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 dark:text-zinc-400 hover:text-teal-500 hover:bg-white dark:hover:bg-zinc-700 transition-all font-bold text-base"
                    >
                        −
                    </button>
                    <input
                        type="number"
                        min={1}
                        max={stock}
                        value={localQty}
                        onChange={e => setLocalQty(e.target.value)}
                        onBlur={e => commit(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }}
                        className="w-9 text-center text-sm font-bold text-slate-900 dark:text-white bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                        onClick={() => updateQty(item.id, Math.min(stock, item.quantity + 1))}
                        disabled={item.quantity >= stock}
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 dark:text-zinc-400 hover:text-teal-500 hover:bg-white dark:hover:bg-zinc-700 transition-all font-bold text-base disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        +
                    </button>
                </div>

                {/* Remove — mobile */}
                <button
                    onClick={e => { e.stopPropagation(); remove(item.id); }}
                    className="sm:hidden w-7 h-7 flex items-center justify-center bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Remove — desktop hover */}
            <button
                onClick={e => { e.stopPropagation(); remove(item.id); }}
                className="hidden sm:flex opacity-0 group-hover:opacity-100 absolute top-3 right-3 w-7 h-7 items-center justify-center bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
