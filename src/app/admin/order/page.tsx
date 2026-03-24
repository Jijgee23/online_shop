"use client";

import { useOrder } from "@/app/context/order_context";
import { OrderStatus } from "@/generated/prisma";
import { useEffect, useState } from "react";
import AdminOrderTile from "./components/AdminOrderTile";

export default function AdminOrdersPage() {
  const { orders, fetchOrder } = useOrder()
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Бүгд");

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.user!.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      order?.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "Бүгд" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });


  useEffect(() => { fetchOrder() }, [])

  return (
    <>
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Захиалгууд</h2>
          <p className="text-zinc-500 text-sm">Нийт захиалгуудын мэдээлэл болон төлөв.</p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative group flex-1 md:w-80">
            <input
              type="text"
              placeholder="Захиалгын дугаар эсвэл хэрэглэгчээр хайх..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all shadow-xl"
            />
            <svg className="w-5 h-5 absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
          >
            <option value="Бүгд">Бүгд</option>
            <option value="Хүлээгдэж буй">Хүлээгдэж буй</option>
            <option value="Баталгаажсан">Баталгаажсан</option>
            <option value="Бэлтгэгдэж байна">Бэлтгэгдэж байна</option>
            <option value="Хүргэгдсэн">Хүргэгдсэн</option>
            <option value="Цуцлагдсан">Цуцлагдсан</option>
          </select>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl">
          <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Нийт захиалга</p>
          <p className="text-3xl font-bold text-white">{filteredOrders.length}</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl">
          <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Хүлээгдэж буй</p>
          <p className="text-3xl font-bold text-yellow-500">{filteredOrders.map((e) => { return e.status === OrderStatus.PENDING }).length}</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl">
          <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Баталгаажсан</p>
          <p className="text-3xl font-bold text-blue-400">{filteredOrders.map((e) => { return e.status === OrderStatus.PAID }).length}</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl">
          <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Нийт дүн</p>
          <p className="text-3xl font-bold text-teal-400">₮{filteredOrders.reduce((sum, order) => {
            return sum + (order.totalPrice || 0);
          }, 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-950/50 text-zinc-500 text-[10px] uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">Захиалгын дугаар</th>
                <th className="px-8 py-5">Хэрэглэгч</th>
                <th className="px-8 py-5">Огноо</th>
                <th className="px-8 py-5 text-center">Барааны тоо</th>
                <th className="px-8 py-5">Төлөв</th>
                <th className="px-8 py-5 text-right">Дүн</th>
                <th className="px-8 py-5 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredOrders.map((order) => (
                <AdminOrderTile key={order.id} {...order}></AdminOrderTile>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Placeholder */}
        <div className="p-6 bg-zinc-950/20 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-500">
          <span>Нийт {orders.length} захиалгаас 1-5 харуулж байна</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-zinc-800 rounded hover:bg-zinc-800 disabled:opacity-30 transition">Өмнөх</button>
            <button className="px-3 py-1 border border-zinc-800 rounded hover:bg-zinc-800 transition">Дараах</button>
          </div>
        </div>
      </div>
    </>
  );
}