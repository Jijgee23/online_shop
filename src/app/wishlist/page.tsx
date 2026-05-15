"use client";

import { useEffect, useState } from "react";
import { Product } from "@/interface/product";
import ProductCard from "@/app/components/ProductCard"; // Таны ProductCard-ын зам
import Header from "@/app/components/Header";
import { Heart, ShoppingBag, Loader2 } from "lucide-react";
import Link from "next/link";

interface WishlistItem {
  id: string;
  productId: number;
  product: Product;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/wishlist");
      const result = await res.json();
      if (res.ok) {
        setWishlist(result.data);
      }
    } catch (error) {
      console.error("Wishlist fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        {/* Title Section */}
        <div className="flex items-center gap-3 mb-10">
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-500">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              Миний хүсэлт
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Таны сонирхож хадгалсан {wishlist.length} бүтээгдэхүүн байна
            </p>
          </div>
        </div>

        {loading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Түр хүлээнэ үү...</p>
          </div>
        ) : wishlist.length > 0 ? (
          // Wishlist Grid
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {wishlist.map((item) => (
              <ProductCard key={item.id} {...item.product} />
            ))}
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-32 px-6 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Таны жагсаалт хоосон байна
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm mb-8">
              Танд таалагдсан бараа байвал зүрхэн икон дээр дарж энд хадгалах боломжтой.
            </p>
            <Link 
              href="/product" 
              className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-2xl shadow-lg shadow-teal-500/20 transition-all active:scale-95"
            >
              Бараа үзэх
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}