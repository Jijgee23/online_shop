"use client";

import { Product } from "@/interface/product";
import { useCart } from "../context/cart_context";
import { useAuth } from "../context/auth_context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { useWishlist } from "../context/wishlist_context";
import { imgUrl } from "@/utils/imgUrl";

export default function ProductCard(product: Product) {
    const { cart, loading: cartLoading, add } = useCart();
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [addedFlash, setAddedFlash] = useState(false);

    const images = product.images || [];
    const hasMultipleImages = images.length > 1;
    const realUrl = imgUrl(images[currentIndex]?.url)

    const { wishIds, toggleWish } = useWishlist();
    const isWished = wishIds.includes(product.id);

    const handleWishClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await toggleWish(product.id);
    };

    const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!hasMultipleImages) return;
        const { left, width } = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - left;
        const segment = Math.floor((x / width) * images.length);
        setCurrentIndex(Math.min(segment, images.length - 1));
    };

    const handleMouseLeave = () => setCurrentIndex(0);

    const handleAdd = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }
        await add({ cartId: cart?.id ?? null, productId: product.id, productQty: 1 });
        setAddedFlash(true);
        setTimeout(() => setAddedFlash(false), 1200);
    };

    const hasDiscount = product.discountPrice && product.discountPrice < product.price;
    const discountPct = hasDiscount
        ? Math.round((1 - product.discountPrice! / product.price) * 100)
        : 0;

    return (
        <div
            onClick={() => router.push(`/product/${product.id}`)}
            onMouseLeave={handleMouseLeave}
            className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden cursor-pointer flex flex-col border border-slate-300 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300"
        >
            {/* ── Image area ── */}
            <div
                className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800"
                onMouseMove={handleImageMouseMove}
            >
                <Image
                    src={realUrl}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />

                {/* Dark gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Discount badge */}
                {hasDiscount && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full tracking-wide shadow-md">
                        -{discountPct}%
                    </div>
                )}

                {/* Wishlist */}
                <button
                    onClick={handleWishClick}
                    className={`absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm shadow-md transition-all duration-200 active:scale-90
                        ${isWished
                            ? "bg-red-500 text-white scale-110"
                            : "bg-white/80 dark:bg-slate-900/80 text-slate-400 hover:text-red-500 hover:scale-110"}`}
                >
                    <Heart className={`w-4 h-4 transition-all ${isWished ? "fill-white" : ""}`} />
                </button>

                {/* Quick add overlay — desktop hover only */}
                <div className="hidden md:block absolute bottom-0 left-0 right-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
                    <button
                        onClick={handleAdd}
                        disabled={cartLoading}
                        className={`w-full py-2.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-60
                            ${addedFlash
                                ? "bg-teal-500 text-white"
                                : "bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-teal-500 hover:text-white"}`}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        {addedFlash ? "Нэмэгдлээ ✓" : "Сагслах"}
                    </button>
                </div>
            </div>

            {/* ── Info area ── */}
            <div className="p-3 sm:p-4 flex flex-col gap-1.5">

                {/* Image dots — below image, never overlaps button */}
                {hasMultipleImages && (
                    <div className="flex justify-center gap-1 -mt-1 mb-0.5">
                        {images.map((_, idx) => (
                            <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-4 bg-teal-500" : "w-1.5 bg-slate-200 dark:bg-slate-700"}`} />
                        ))}
                    </div>
                )}

                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight line-clamp-2">
                    {product.name}
                </h3>

                {product.description && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">
                        {product.description}
                    </p>
                )}

                {/* Add to cart — mobile only, below price */}
                <button
                    onClick={handleAdd}
                    disabled={cartLoading}
                    className={`md:hidden w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-60
                        ${addedFlash
                            ? "bg-teal-500 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"}`}
                >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {addedFlash ? "Нэмэгдлээ ✓" : "Сагслах"}
                </button>

                <div className="flex items-end justify-between mt-1">
                    <div>
                        {hasDiscount ? (
                            <>
                                <p className="text-xs text-slate-400 line-through leading-none">
                                    ₮{product.price.toLocaleString()}
                                </p>
                                <p className="text-base sm:text-lg font-extrabold text-red-500 leading-tight">
                                    ₮{product.discountPrice!.toLocaleString()}
                                </p>
                            </>
                        ) : (
                            <p className="text-base sm:text-lg font-extrabold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
                                ₮{product.price.toLocaleString()}
                            </p>
                        )}
                    </div>

                    {/* Stock indicator */}
                    {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                            {product.stock}ш үлдсэн
                        </span>
                    )}
                    {product.stock === 0 && (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            Дууссан
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
