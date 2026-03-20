import { useAuth } from "../context/auth_context";
import { useCart } from "../context/cart_context"
import { useRouter } from "next/navigation";

export default function CartIcon() {

    const { cart } = useCart()
    const { user } = useAuth()
    const router = useRouter()
    const toCart = () => {
        router.push('/cart')
    }
    const loggedIn = user !== null;

    if (!loggedIn) return <div></div>

    return (<div
        onClick={toCart}
        className="relative p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">

        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-slate-700 dark:text-slate-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
        </svg>

        {/* The Badge */}
        {loggedIn && cart && (cart.totalCount ?? 0) > 0 && (
            <span className="absolute top-0 right-0 flex h-5 w-5">
                {/* Optional: Ping animation for attention */}
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>

                {/* The actual number badge */}
                <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-red-600 text-white text-[10px] font-bold">
                    {cart.totalCount > 99 ? '99+' : cart.totalCount}
                </span>
            </span>
        )}
    </div>)
} 