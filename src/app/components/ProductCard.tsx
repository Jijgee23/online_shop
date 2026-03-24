"use client";

import { Product } from "@/interface/product";
import { useCart } from "../context/cart_context";
import { useRouter } from "next/navigation";

export default function ProductCard(product: Product) {
    const imageUrl = product.images?.[0]?.url || "/uploads/placeholder.png";
    const { cart, loading, add } = useCart()
    const router = useRouter()
    const id = product.id.toString();
    const handleAdd = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await add({
            cartId: cart?.id ?? null,
            productId: product.id,
            productQty: 1
        });
    };
    const handleTap = () => {
        router.push(`/product/${id}`)
    };
    return (
        <div
            onClick={handleTap}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden flex flex-col">
            <div className="relative h-48 w-full">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* dark gradient to ensure text visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-2">
                    <h3 className="text-white font-bold text-lg leading-tight">
                        {product.name}
                    </h3>
                </div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                    {product.description}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        {product.price.toLocaleString()}₮
                    </span>
                    <button onClick={handleAdd} // Энд функцээ холбоно
                        disabled={loading}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                        Сагслах
                    </button>
                </div>
            </div>
        </div>
    );
}
