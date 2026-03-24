"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "./context/auth_context";
import { Product } from "@/interface/product";
import { useCategory } from "./context/category_context";
import CategoryCard from "./components/CategoryCard";
import { useCart } from "./context/cart_context";
import { useRouter } from "next/navigation";
import Header from "./components/Header";
import FeaturedSearchProduct from "./components/Featured&SearchProduct";

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth()
  const { fetchCart } = useCart()
  const { categories, fetchCategories } = useCategory()
  const loggedIn = user !== null;
  const [products, setProducts] = useState<Product[]>([])
  const fetchProducts = async () => {
    const res = await fetch("/api/product/featured");
    const data = (await res.json()).data;
    setProducts(data);
  };

  const filteredProds = [];

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    if (loggedIn) fetchCart()
  }, [])
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-teal-200 selection:text-teal-900">
      <Header />
      <FeaturedSearchProduct
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Ангилал</h3>
              <p className="text-slate-500 dark:text-slate-400">Хамгийн их эрэлттэй байгаа төрлүүд</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.length !== 0 && categories.map((category) => (
              <CategoryCard key={category.id} {...category}></CategoryCard>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Онцлох бүтээгдэхүүн</h3>
              <p className="text-slate-500 dark:text-slate-400">Шилдэг борлуулалттай бараанууд</p>
            </div>
            <Link href="/product" className="hidden sm:block text-teal-600 dark:text-teal-400 font-semibold hover:underline">
              Бүгдийг үзэх &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-teal-900/20 flex flex-col"
              >
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={product.images.length !== 0 ? product.images[0].url : '/uploads/placeholder.png/'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {product.category && (
                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full text-slate-800 dark:text-slate-200">
                      {product.category.name}
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
                      ₮{product.price.toLocaleString() ?? '0'}
                    </p>
                  </div>

                  {/* <Link href={`/product/${product.id}`} className="block mt-auto"> */}
                  <button onClick={() => router.push(`/product/${product.id}`)} className="w-full bg-slate-900 dark:bg-slate-800 text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 group-hover:bg-teal-600 dark:group-hover:bg-teal-500 flex justify-center items-center gap-2">
                    Дэлгэрэнгүй үзэх
                    <svg className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </button>
                  {/* </Link> */}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile View All Button */}
          <div className="mt-8 text-center sm:hidden">
            <Link href="/product" className="inline-block border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-6 py-3 rounded-full font-semibold">
              Бүгдийг үзэх
            </Link>
          </div>

        </div>
      </section>

      {/* Call to Action */}

      {user === null && <Features />}

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">IShop</h2>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Онлайн Дэлгүүр. Бүх эрх хуулиар хамгаалагдсан.
          </p>
        </div>
      </footer>
    </div>
  );
}

export function Features() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-blue-600"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

      <div className="relative max-w-4xl mx-auto px-6 text-center text-white z-10">
        <h3 className="text-4xl md:text-5xl font-extrabold mb-6">
          Илүү ихийг хямдралтайгаар
        </h3>
        <p className="text-xl text-teal-100 mb-10 leading-relaxed">
          Яг одоо бүртгүүлээд шинээр ирсэн бүтээгдэхүүн болон онцгой урамшууллын мэдээллийг хамгийн түрүүнд аваарай.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/auth/register">
            <button className="w-full sm:w-auto bg-white text-teal-600 px-8 py-4 rounded-full font-bold hover:bg-slate-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              Одоо бүртгүүлэх
            </button>
          </Link>
          <Link href="/product">
            <button className="w-full sm:w-auto border border-teal-300/50 bg-teal-500/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-bold hover:bg-teal-500/40 transition-all duration-300">
              Бүтээгдэхүүн үзэх
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}