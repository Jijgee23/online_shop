"use client";

import { useEffect, useState } from "react";
import { ProductWithRelations } from "@/interface/product";
import { Category } from "@/interface/category";
import { ProductState } from "@/generated/prisma";
import ProductTile from "./components/product_tile";
import { useAdmin } from "@/app/context/admin_context";
import { useCategory } from "@/app/context/category_context";
import { useProducts } from "@/app/context/product_context";


export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { categories, fetchCategories } = useCategory()
  const { setActivePage } = useAdmin()
  const [selectedCatId, setSelectedCatId] = useState<number>(0);
  const allCategories = [
    { id: 0, name: "Бүгд" },
    ...categories
  ];
  const { products, fetchProducts } = useProducts()
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCatId === 0 || product.categoryId === selectedCatId;
    return matchesSearch && matchesCategory;
  });


  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);


  // const fetchProducts = async () => {
  //   try {
  //     const res = await fetch("/api/admin/product");
  //     const data = await res.json();
  //     if (data && Array.isArray(data)) {
  //       setProducts(data);
  //     } else if (data && Array.isArray(data.data)) {
  //       setProducts(data.data);
  //     } else {
  //       setProducts([]);
  //     }
  //   } catch (error) {
  //     console.error("Fetch error:", error);
  //     setProducts([]);
  //   }
  // };

  return (
    <>
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Бүтээгдэхүүнүүд</h2>
          <p className="text-zinc-500 text-sm">Бүтээгдэхүүний удирдах, нэмэх, засварлах.</p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative group flex-1 md:w-80">
            <input
              type="text"
              placeholder="Бүтээгдэхүүний нэр эсвэл ангиллаар хайх..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all shadow-xl"
            />
            <svg className="w-5 h-5 absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(Number(e.target.value))}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
          >
            {allCategories.map((cat) => (
              <option className="border rounded-1xl" key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* <Link href="/admin/products/newProduct"> */}
          <button

            onClick={() => setActivePage("Шинэ бүтээгдэхүүнүүд")}
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-2xl font-bold transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Нэмэх
          </button>
          {/* </Link> */}
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl">
          <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Нийт бүтээгдэхүүн</p>
          <p className="text-3xl font-bold text-white">{filteredProducts.length}</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl">
          <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Идэвхтэй</p>
          <p className="text-3xl font-bold text-green-500">{filteredProducts.filter(p => p.state == ProductState.ACTIVE).length}</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl">
          <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Дууссан</p>
          <p className="text-3xl font-bold text-red-500">{filteredProducts.filter(p => p.stock === 0).length}</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl">
          <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Нийт үнэ цэнэ</p>
          <p className="text-3xl font-bold text-teal-400">₮{filteredProducts.reduce((sum, product) => sum + (product.price * product.stock), 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-950/50 text-zinc-500 text-[10px] uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">Бүтээгдэхүүн</th>
                <th className="px-8 py-5">Ангилал</th>
                <th className="px-8 py-5 text-right">Үнэ</th>
                <th className="px-8 py-5 text-center">Үлдэгдэл</th>
                <th className="px-8 py-5">Төлөв</th>
                <th className="px-8 py-5 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredProducts.map((product) => (
                <ProductTile key={product.id} {...product} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Placeholder */}
        <div className="p-6 bg-zinc-950/20 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-500">
          <span>Нийт {filteredProducts.length} бүтээгдэхүүнээс 1-6 харуулж байна</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-zinc-800 rounded hover:bg-zinc-800 disabled:opacity-30 transition">Өмнөх</button>
            <button className="px-3 py-1 border border-zinc-800 rounded hover:bg-zinc-800 transition">Дараах</button>
          </div>
        </div>
      </div>
    </>
  );
}
