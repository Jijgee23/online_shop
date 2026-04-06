import { useCart } from "@/app/context/cart_context";
import { CartItem } from "@/interface/cart";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CartItemTile(item: CartItem) {
    const { updateQty, remove } = useCart();
    const router = useRouter();
    if (!item.product) return null;

    const stock = item.product.stock;
    const [localQty, setLocalQty] = useState(String(item.quantity));

    // Keep local value in sync if cart refreshes externally
    useEffect(() => { setLocalQty(String(item.quantity)); }, [item.quantity]);

    const commit = (raw: string) => {
        const v = parseInt(raw, 10);
        if (isNaN(v) || v < 1) { setLocalQty(String(item.quantity)); return; }
        const clamped = Math.min(v, stock);
        setLocalQty(String(clamped));
        if (clamped !== item.quantity) updateQty(item.id, clamped);
    };

    const unitPrice = item.product.price?.toLocaleString();
    const total = (item.product.price * item.quantity).toLocaleString();

    return (
        <div
            onClick={() => router.push(`/product/${item.product.id}`)}
            className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 p-3 sm:p-4 hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-none hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer"
        >

            {/* Image */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                <img
                    src={item.product.images?.[0]?.url || "/uploads/placeholder.png"}
                    alt={item.product.name || "Product"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate leading-tight">
                    {item.product.name}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    ₮{unitPrice} × {item.quantity}ш
                </p>
                <p className="text-base sm:text-lg font-extrabold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent mt-0.5">
                    ₮{total}
                </p>
            </div>

            {/* Qty stepper */}
            <div onClick={e => e.stopPropagation()} className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-2xl p-1 gap-0.5 flex-shrink-0">
                <button
                    onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-teal-500 hover:bg-white dark:hover:bg-slate-700 transition-all text-base font-bold shadow-none hover:shadow-sm"
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
                    onKeyDown={e => { if (e.key === "Enter") { e.currentTarget.blur(); } }}
                    className="w-9 text-center text-sm font-bold text-slate-900 dark:text-white bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                    onClick={() => updateQty(item.id, Math.min(item.product.stock, item.quantity + 1))}
                    disabled={item.quantity >= item.product.stock}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-teal-500 hover:bg-white dark:hover:bg-slate-700 transition-all text-base font-bold hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    +
                </button>
            </div>

            {/* Remove */}
            <button
                onClick={e => { e.stopPropagation(); remove(item.id); }}
                className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm transition-all"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}
