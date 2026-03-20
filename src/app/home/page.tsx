"use client";

import { useState } from "react";
import Link from "next/link";

// Featured products for home page
const featuredProducts = [
  {
    id: 1,
    name: "Спорт гутал",
    price: 59990,
    image: "https://images.unsplash.com/photo-1606813903842-0f1fa6a3c6cc?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "Чихэвч",
    price: 129990,
    image: "https://images.unsplash.com/photo-1580894934518-8e8cfc0f2211?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "Смарт цаг",
    price: 199990,
    image: "https://images.unsplash.com/photo-1539884378793-8e66b468216d?auto=format&fit=crop&w=400&q=80",
  },
];

const categories = [
  { name: "Спорт гутал", icon: "👟", count: 12 },
  { name: "Чихэвч", icon: "🎧", count: 8 },
  { name: "Цаг", icon: "⌚", count: 15 },
  { name: "Цүнх", icon: "🎒", count: 20 },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Онлайн Дэлгүүр
          </h1>
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-teal-600">Нүүр</Link>
            <Link href="/products" className="text-gray-700 dark:text-gray-300 hover:text-teal-600">Бүтээгдэхүүн</Link>
            <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-teal-600">Нэвтрэх</Link>
            <Link href="/register" className="text-gray-700 dark:text-gray-300 hover:text-teal-600">Бүртгүүлэх</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-400 to-blue-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Таны хүссэн бүтээгдэхүүн
          </h2>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Чанартай, хямд үнэтэй бүтээгдэхүүнүүдийг онлайн худалдан авна уу
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Бүтээгдэхүүн хайх..."
                className="flex-1 px-4 py-3 rounded-l-lg border-0 focus:outline-none focus:ring-2 focus:ring-white text-gray-900"
              />
              <Link href={`/products?search=${searchQuery}`}>
                <button className="bg-white text-teal-600 px-6 py-3 rounded-r-lg hover:bg-gray-100 transition">
                  Хайх
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Ангилал
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/products?category=${category.name}`}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {category.name}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {category.count} бүтээгдэхүүн
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Онцлох бүтээгдэхүүн
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {product.name}
                  </h4>
                  <p className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-4">
                    ₮{product.price.toLocaleString()}
                  </p>
                  <Link href={`/products/${product.id}`}>
                    <button className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition">
                      Дэлгэрэнгүй үзэх
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Бүртгүүлээд давуу тал авах
          </h3>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Бүртгүүлснээр шинэ бүтээгдэхүүн, хямдралын мэдээлэл хүлээн авна
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="bg-white text-teal-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Бүртгүүлэх
              </button>
            </Link>
            <Link href="/products">
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-teal-600 transition">
                Бүтээгдэхүүн үзэх
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2026 Онлайн Дэлгүүр. Бүх эрх хуулиар хамгаалагдсан.</p>
        </div>
      </footer>
    </div>
  );
}