"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/interface/product";
import { useCart } from "@/app/context/cart_context";
import Header from "@/app/components/Header";
import { ArrowLeft, Loader2, Search, ShoppingBag } from "lucide-react";

export default function ProductDetail() {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const { cart, add } = useCart()
    const [quantity, setQuantity] = useState(1);
    const colors = ["Black", "Silver", "Midnight Blue"];
    const [selectedColor, setSelectedColor] = useState("Black");
    const [product, setProduct] = useState<Product>()
    const router = useRouter()
    const [fetching, setFetching] = useState(false)
    const features = ["Bluetooth 5.2", "40h Battery Life", "Active Noise Cancelling", "Fast Charging"]
    const fetchDetail = async () => {
        setFetching(true)
        const res = await fetch(`/api/product/${id}`)
        if (res.ok) {
            const data = await res.json()
            setProduct(data.product)
        }
        setFetching(false)
    }
    useEffect(() => { fetchDetail() }, [])

    const addCart = async () => {
        add({
            productId: Number(id),
            productQty: quantity,
            cartId: cart?.id ?? 0,
        })
    }

    if (fetching) {
        return (
            <div className="flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
        );
    }
    if (!product) {
        return (
            <div className="min-h-[80vh] w-full flex flex-col items-center justify-center px-6 bg-white dark:bg-zinc-950 transition-colors duration-300">
                {/* Icon Area */}
                <div className="relative mb-8">
                    <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <ShoppingBag className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-teal-500 rounded-2xl flex items-center justify-center border-4 border-white dark:border-zinc-950 shadow-lg">
                        <Search className="w-4 h-4 text-white" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="text-center max-w-sm">
                    <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight">
                        Бараа олдсонгүй
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-10">
                        Уучлаарай, таны хайсан бараа системд бүртгэлгүй эсвэл устгагдсан байна. Та манай бусад бараануудтай танилцана уу.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md justify-center">
                    <tr
                        onClick={() => router.back()}
                        className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-teal-500 hover:bg-teal-400 text-white font-extrabold shadow-lg shadow-teal-500/20 transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Нүүр хуудас руу буцах
                    </tr>

                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-bold transition-colors"
                    >
                        Дахин ачааллах
                    </button>
                </div>
            </div>
        );
    }
    const imageUrl = product.images?.[0]?.url || "/uploads/placeholder.png";
    return (

        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col lg:flex-row pt-16">
            <Header />

            <section className="relative w-full lg:w-1/2 h-[50vh] lg:h-auto bg-slate-100 dark:bg-slate-900 overflow-hidden">
                <Link href="/product" className="absolute top-6 left-6 z-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-3 rounded-full shadow-lg hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-slate-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>

                <img
                    src={imageUrl}
                    alt={product?.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />

                <div className="absolute bottom-6 left-6 flex gap-3">
                    {/* Image Gallery Thumbnails (Optional) */}
                    <div className="w-16 h-16 rounded-xl border-2 border-teal-500 overflow-hidden cursor-pointer shadow-lg">
                        <img src={imageUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="w-16 h-16 rounded-xl border-2 border-transparent bg-white/20 backdrop-blur-sm overflow-hidden cursor-pointer hover:border-white/50 transition">
                        <img src={imageUrl} className="w-full h-full object-cover opacity-50" />
                    </div>
                </div>
            </section>

            {/* Right Side: Product Information */}
            <section className="w-full lg:w-1/2 overflow-y-auto px-6 py-10 lg:px-16 lg:py-20 flex flex-col justify-center">

                <div className="max-w-xl mx-auto w-full">
                    {/* Brand and Rating */}
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-teal-600 dark:text-teal-400 font-bold tracking-widest text-sm uppercase">
                            {product?.category!.name}
                        </span>
                        <div className="flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                            <span className="text-sm font-bold dark:text-white">{"product.rating"}</span>
                            <span className="text-sm text-slate-400">({"product.reviews"} сэтгэгдэл)</span>
                        </div>
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
                        {product!.name}
                    </h1>

                    <p className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
                        ₮{product!.price.toLocaleString()}
                    </p>

                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8">
                        {product!.description}
                    </p>

                    {/* Configuration Options */}
                    <div className="space-y-8 mb-10">
                        {/* Color Selection */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase mb-4 tracking-wide">Өнгө сонгох</h4>
                            <div className="flex gap-3">
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={`px-6 py-2 rounded-full text-sm font-semibold border-2 transition-all ${selectedColor === color
                                            ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/20"
                                            : "border-slate-200 dark:border-slate-800 text-slate-500"
                                            }`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity and Actions */}
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="flex items-center border-2 border-slate-200 dark:border-slate-800 rounded-full px-4 py-2">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-8 h-8 flex items-center justify-center text-xl font-bold dark:text-white hover:text-teal-500 transition"
                                >
                                    −
                                </button>
                                <span className="w-12 text-center font-bold text-lg dark:text-white">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center text-xl font-bold dark:text-white hover:text-teal-500 transition"
                                >
                                    +
                                </button>
                            </div>

                            <button
                                onClick={addCart}
                                className="flex-1 w-full bg-slate-900 dark:bg-teal-600 text-white py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95">
                                Сагсанд нэмэх
                            </button>

                            <button className="p-4 rounded-full border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition shadow-sm">
                                <svg className="w-6 h-6 text-slate-600 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Key Features List */}
                    <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
                        {features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                                <span className="text-sm font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>

                </div>

            </section>
        </div>
    );
}