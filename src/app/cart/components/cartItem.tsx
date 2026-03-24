
import { useCart } from "@/app/context/cart_context";
import { CartItem } from "@/interface/cart";


export default function CartItemTile(item: CartItem) {
    const { updateQty, remove } = useCart();
    if (!item.product) return null;

    return (
        <div
            key={item.id}
            className="group bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-6"
        >

            <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                <img
                    src={item.product.images?.[0]?.url || "/uploads/placeholder.png"}
                    alt={item.product.name || "Product"}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {item.product.name}
                </h3>
                <p className="text-teal-600 dark:text-teal-400 font-bold">
                    ₮{item.product.price?.toLocaleString() || '0'} * {item.quantity} = ₮{(item.product.price * item.quantity).toLocaleString()}
                </p>
            </div>

            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-full px-2 py-1">
                <button
                    onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-teal-500"
                >
                    −
                </button>
                <span className="w-8 text-center font-bold dark:text-white">{item.quantity}</span>
                <button
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-teal-500"
                >
                    +
                </button>
            </div>

            <button
                onClick={() => remove(item.id)}
                className="p-2 text-slate-400 hover:text-red-500"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    );
}