"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
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
  const { user } = useAuth();
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
    const searchLower = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower) ||
      product.category?.name.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    if (loggedIn) fetchCart();
  }, []);

  return (

    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-teal-200 selection:text-teal-900">
      <Header />

      <FeaturedSearchProduct
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <StatsStrip />

      <TopCateGories />

      <TopProducts products={filteredProds} />

      {user === null && <Features />}

      <MainFooter />

    </div>
  );
}
