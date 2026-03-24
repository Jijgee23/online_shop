"use client";

import { Cart } from "@/interface/cart";
import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth_context";
import { UserRole } from "@/generated/prisma";
import toast from "react-hot-toast";

interface CartAction {
    cartId: number | null,
    productId: number;
    productQty: number;
}

interface CartContextType {
    cart: Cart | null;
    loading: boolean;
    fetchCart: () => Promise<void>;
    add: (data: CartAction) => Promise<void>;
    remove: (productId: number) => Promise<void>;
    updateQty: (productId: number, qty: number) => Promise<void>;
    clear: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth()
    // 1. Сагсны мэдээллийг API-аас татах (Күүки ашиглан Server-side шалгана)
    const fetchCart = async () => {
        const isAdmin = user?.role == UserRole.ADMIN
        if (isAdmin) return
        try {
            const res = await fetch("/api/cart");
            console.log("get cart status", res.status) // Энэ API нь accessToken-г уншаад сагсыг буцаана
            if (res.ok) {
                const data = await res.json();
                setCart(data.data);
            }
        } catch (err) {
            console.error("Cart fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // 2. Сагсанд нэмэх
    const add = async (data: CartAction) => {
        const res = await fetch("/api/cart", {
            method: "PATCH",
            body: JSON.stringify(data),
        });
        if (res.ok) {
            toast.success("Амжилттай сагсдагдлаа")
            await fetchCart();
            return;
        }

        const body = await res.json()

        toast.error(body.error)
    };

    // 3. Сагснаас устгах
    const remove = async (itemId: number) => {
        const res = await fetch(`/api/cart?itemId=${itemId}`, {
            method: 'DELETE',
        });
        if (res.ok) {
            toast.success('Бараа сагнаас хасагдлаа')
            fetchCart();
        }
    };

    const updateQty = async (itemId: number, newQty: number) => {

        setLoading(true);
        const cartId = cart?.id;
        const res = await fetch("/api/cart/update", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cartId, itemId, newQty }),
        });

        if (res.ok) {
            toast.success('Амжилттай')
            await fetchCart();
        }

        const data = await res.json()

        if (!res.ok)
            toast.error(data.error ?? 'Амжилтгүй')
        setLoading(false);
    };



    const clear = async () => {
        const res = await fetch("/api/cart/clear", {
            method: "POST",
        });

        if (res.ok) {
            toast.success('Сагс цэвэрлэгдлээ')
            await fetchCart()
        }
    }

    return (
        <CartContext.Provider value={{ cart, loading, fetchCart, add, remove, updateQty, clear }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};