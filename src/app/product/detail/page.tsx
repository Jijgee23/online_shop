"use client";

import { useState } from "react";
import Link from "next/link";

export default function ProductDetail({ params }: { params: { id?: string } }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("Black");

  // Жишээ өгөгдөл (Бодит байдал дээр API-аас ирнэ)
  const product = {
    id: params?.id || 1,
    name: "Premium Wireless Headphones",
    brand: "IShop Pro",
    price: 349000,
    rating: 4.8,
    reviews: 124,
    description: "Дээд зэрэглэлийн дууны чанар, дуу чимээ тусгаарлагч технологи бүхий утасгүй чихэвч. 40 цагийн цэнэг барих чадвартай ба танд бодит мэдрэмжийг төрүүлнэ.",
    features: ["Bluetooth 5.2", "40h Battery Life", "Active Noise Cancelling", "Fast Charging"],
    colors: ["Black", "Silver", "Midnight Blue"],
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col lg:flex-row pt-16">
      
      {/* Left Side: Fullscreen Image Section */}
      <section className="relative w-full lg:w-1/2 h-[50vh] lg:h-auto bg-slate-100 dark:bg-slate-900 overflow-hidden">
        <Link href="/product" className="absolute top-6 left-6 z-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-3 rounded-full shadow-lg hover:scale-110 transition-transform">
          <svg className="w-5 h-5 text-slate-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />

        <div className="absolute bottom-6 left-6 flex gap-3">
          {/* Image Gallery Thumbnails (Optional) */}
          <div className="w-16 h-16 rounded-xl border-2 border-teal-500 overflow-hidden cursor-pointer shadow-lg">
             <img src={product.image} className="w-full h-full object-cover" />
          </div>
          <div className="w-16 h-16 rounded-xl border-2 border-transparent bg-white/20 backdrop-blur-sm overflow-hidden cursor-pointer hover:border-white/50 transition">
             <img src={product.image} className="w-full h-full object-cover opacity-50" />
          </div>
        </div>
      </section>

      {/* Right Side: Product Information */}
      <section className="w-full lg:w-1/2 overflow-y-auto px-6 py-10 lg:px-16 lg:py-20 flex flex-col justify-center">
        
        <div className="max-w-xl mx-auto w-full">
          {/* Brand and Rating */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-teal-600 dark:text-teal-400 font-bold tracking-widest text-sm uppercase">
              {product.brand}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span className="text-sm font-bold dark:text-white">{product.rating}</span>
              <span className="text-sm text-slate-400">({product.reviews} сэтгэгдэл)</span>
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
            {product.name}
          </h1>

          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
            ₮{product.price.toLocaleString()}
          </p>

          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Configuration Options */}
          <div className="space-y-8 mb-10">
            {/* Color Selection */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase mb-4 tracking-wide">Өнгө сонгох</h4>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-6 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                      selectedColor === color
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

              <button className="flex-1 w-full bg-slate-900 dark:bg-teal-600 text-white py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95">
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
            {product.features.map((feature, idx) => (
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