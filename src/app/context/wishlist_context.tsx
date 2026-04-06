"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth_context";

interface WishlistContextType {
    wishIds: number[];
    toggleWish: (productId: number) => Promise<void>;
    isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [wishIds, setWishIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Нэвтэрсэн үед зүрхэлсэн ID-нуудыг татах
    const fetchWishIds = async () => {
        if (!user) {
            setWishIds([]);
            return;
        }
        try {
            const res = await fetch("/api/wishlist");
            const result = await res.json();
            if (res.ok) {
                setWishIds(result.data.map((item: any) => item.productId));
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchWishIds();
    }, [user]);

    const toggleWish = async (productId: number) => {
        if (!user || isLoading) return;

        const isWished = wishIds.includes(productId);

        // Optimistic update
        setWishIds(prev =>
            isWished ? prev.filter(id => id !== productId) : [...prev, productId]
        );

        setIsLoading(true);
        try {
            const method = isWished ? "DELETE" : "POST";
            const url = isWished ? `/api/wishlist?productId=${productId}` : `/api/wishlist`;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: !isWished ? JSON.stringify({ productId }) : undefined,
            });

            if (!res.ok) {
                // Revert on API error
                setWishIds(prev =>
                    isWished ? [...prev, productId] : prev.filter(id => id !== productId)
                );
            }
        } catch {
            // Revert on network error
            setWishIds(prev =>
                isWished ? [...prev, productId] : prev.filter(id => id !== productId)
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <WishlistContext.Provider value={{ wishIds, toggleWish, isLoading }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error("useWishlist must be used within WishlistProvider");
    return context;
};