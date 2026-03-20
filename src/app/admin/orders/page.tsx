"use client";

import { useState } from "react";

const demoOrders = [
  { id: 1, orderNumber: "ORD-2024-001", customer: "Бат-Эрдэнэ Т.", email: "bat.e@gmail.com", total: 125000, status: "Хүлээгдэж буй", date: "2024-03-10", items: 3 },
  { id: 2, orderNumber: "ORD-2024-002", customer: "Сарантуяа Б.", email: "saraa@yahoo.com", total: 45000, status: "Баталгаажсан", date: "2024-03-09", items: 2 },
  { id: 3, orderNumber: "ORD-2024-003", customer: "Тэмүүлэн Г.", email: "temuulen@gmail.com", total: 89000, status: "Хүргэгдсэн", date: "2024-03-08", items: 1 },
  { id: 4, orderNumber: "ORD-2024-004", customer: "Болдхүү П.", email: "boldo@outlook.com", total: 245000, status: "Цуцлагдсан", date: "2024-03-07", items: 5 },
  { id: 5, orderNumber: "ORD-2024-005", customer: "Анужин М.", email: "anujin@gmail.com", total: 67000, status: "Бэлтгэгдэж байна", date: "2024-03-06", items: 2 },
];

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Бүгд");

  const filteredOrders = demoOrders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "Бүгд" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Хүлээгдэж буй": return "bg-yellow-500/10 border-yellow-500/20 text-yellow-500";
      case "Баталгаажсан": return "bg-blue-500/10 border-blue-500/20 text-blue-400";
      case "Бэлтгэгдэж байна": return "bg-orange-500/10 border-orange-500/20 text-orange-500";
      case "Хүргэгдсэн": return "bg-green-500/10 border-green-500/20 text-green-500";
      case "Цуцлагдсан": return "bg-red-500/10 border-red-500/20 text-red-500";
      default: return "bg-zinc-500/10 border-zinc-500/20 text-zinc-500";
    }
  };

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
          <p className="text-3xl font-bold text-white">{demoOrders.length}</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl">
          <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Хүлээгдэж буй</p>
          <p className="text-3xl font-bold text-yellow-500">{demoOrders.filter(o => o.status === "Хүлээгдэж буй").length}</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl">
          <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Баталгаажсан</p>
          <p className="text-3xl font-bold text-blue-400">{demoOrders.filter(o => o.status === "Баталгаажсан").length}</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl">
          <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Нийт дүн</p>
          <p className="text-3xl font-bold text-teal-400">₮{demoOrders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}</p>
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
                <tr key={order.id} className="hover:bg-zinc-800/30 transition-all group">
                  <td className="px-8 py-5">
                    <p className="font-mono text-zinc-400 text-sm">{order.orderNumber}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div>
                      <p className="font-bold text-white text-sm">{order.customer}</p>
                      <p className="text-xs text-zinc-500">{order.email}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-zinc-300">
                    {new Date(order.date).toLocaleDateString('mn-MN')}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="bg-zinc-800 px-3 py-1 rounded-full text-xs font-bold text-zinc-300">
                      {order.items}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <p className="font-bold text-white">₮{order.total.toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-zinc-500 hover:text-red-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Placeholder */}
        <div className="p-6 bg-zinc-950/20 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-500">
          <span>Нийт {filteredOrders.length} захиалгаас 1-5 харуулж байна</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-zinc-800 rounded hover:bg-zinc-800 disabled:opacity-30 transition">Өмнөх</button>
            <button className="px-3 py-1 border border-zinc-800 rounded hover:bg-zinc-800 transition">Дараах</button>
          </div>
        </div>
      </div>
    </>
  );
}
