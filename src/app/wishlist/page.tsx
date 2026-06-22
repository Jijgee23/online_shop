"use client";

import { useEffect, useState } from "react";
import { Product } from "@/interface/product";
import ProductCard from "@/app/components/ProductCard";
import AccountShell from "@/app/components/AccountShell";
import { ShoppingBag, Loader2 } from "lucide-react";
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
      if (res.ok) setWishlist(result.data);
    } catch (error) {
      console.error("Wishlist fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWishlist(); }, []);

  return (
    <AccountShell title="Таалагдсан бүтээгдэхүүн">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Түр хүлээнэ үү...</p>
        </div>
      ) : wishlist.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {wishlist.map((item) => (
            <ProductCard key={item.id} {...item.product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800">
          <div className="w-20 h-20 bg-slate-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-5">
            <ShoppingBag className="w-9 h-9 text-slate-300 dark:text-zinc-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Таны жагсаалт хоосон байна
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm mb-6">
            Танд таалагдсан бараа байвал зүрхэн икон дээр дарж энд хадгалах боломжтой.
          </p>
          <Link
            href="/product"
            className="px-8 py-3.5 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-2xl shadow-lg shadow-teal-500/20 transition-all active:scale-95"
          >
            Бараа үзэх
          </Link>
        </div>
      )}
    </AccountShell>
  );
}
