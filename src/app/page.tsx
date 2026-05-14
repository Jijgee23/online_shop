"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/auth_context";
import { Product } from "@/interface/product";
import { useCategory } from "./context/category_context";
import { useCart } from "./context/cart_context";
import Header from "./components/Header";
import FeaturedSearchProduct from "./components/Featured&SearchProduct";
import { StatsStrip } from "./main/components/StatsStrip";
import { Features } from "./main/components/Features";
import { MainFooter } from "./main/components/MainFooter";
import { TopCateGories } from "./main/components/TopCatogories";
import { TopProducts } from "./main/components/TopProducts";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, loading } = useAuth();
  const router = useRouter();
  const { fetchCart } = useCart();
  const { fetchCategories } = useCategory();
  const loggedIn = user !== null;
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    const res = await fetch("/api/product/featured");
    const data = (await res.json()).data;
    setProducts(data);
  };

  const filteredProds = products.filter((product) => {
    const q = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(q) ||
      product.description?.toLowerCase().includes(q) ||
      product.category?.name.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (!loading && user?.role === "ADMIN") {
      router.replace("/admin");
    }
  }, [user, loading]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    if (loggedIn) fetchCart();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-teal-200 selection:text-teal-900">
      <Header />

      <FeaturedSearchProduct
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <TopCateGories />

      <TopProducts products={filteredProds} />

      <StatsStrip />

      {user === null && <Features />}

      <MainFooter />
    </div>
  );
}
