"use client";

import { Cart } from "@/interface/cart";
import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth_context";
import { UserRole } from "@/generated/prisma";
import { CartService, CartAction } from "@/services/cart.service";

export type { CartAction };

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

    const fetchCart = async () => {
        if (!user || user.role === UserRole.ADMIN) {
            setCart(null);
            setLoading(false);
            return;
        }
        const cardData = await CartService.fetchCart(false);
        setCart(cardData?.data ?? null);
        setLoading(false);
    };

    useEffect(() => {
        fetchCart();
    }, [user]);

    const add = async (data: CartAction) => {
        await CartService.addItem(data, fetchCart)
    };

    const remove = async (itemId: number) => {
        await CartService.removeItem(itemId, fetchCart)
    };

    const updateQty = async (itemId: number, newQty: number) => {
        setLoading(true);
        const cartId = cart?.id;
        await CartService.updateItem(cartId, itemId, newQty, fetchCart)
        setLoading(false);
    };

    const clear = async () => await CartService.clearCart(fetchCart)

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