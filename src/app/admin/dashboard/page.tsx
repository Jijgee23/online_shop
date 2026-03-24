"use client";

import { DashboardResponse } from "@/interface/dashboard";
import { useState, useEffect } from "react";
import { getOrderStatusInfo } from "../order/components/AdminOrderTile";
import { useAdmin } from "@/app/context/admin_context";
import RecentOrderComp from "./components/RecentOrder";

export default function AdminDashboardPage() {
  const { loading, dashboardData, fetchDashboardData } = useAdmin()
  const { setActivePage } = useAdmin()


  useEffect(() => {
    fetchDashboardData;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-teal-500"></div>
      </div>
    );
  }

  // 2. Статистик картуудын өгөгдлийг API-тай холбох
  const stats = [
    {
      name: "Нийт борлуулалт",
      value: `₮${(dashboardData?.summary.totalRevenue || 0).toLocaleString()}`,
      change: "+12.5%",
      icon: "💰"
    },
    {
      name: "Шинэ захиалга",
      value: dashboardData?.summary.pendingOrders.toString() || "0",
      change: "+5.2%",
      icon: "📦"
    },
    {
      name: "Хэрэглэгчид",
      value: dashboardData?.summary.totalUsers.toLocaleString() || "0",
      change: "+18%",
      icon: "👥"
    },
    {
      name: "Нийт бараа",
      value: dashboardData?.summary.totalProducts.toString() || "0",
      change: "Active",
      icon: "🏬"
    },
  ];

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Сайн байна уу, Админ!</h2>
          <p className="text-zinc-500">Өнөөдрийн байдлаар таны дэлгүүрийн үзүүлэлтүүд.</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-white">A</div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${stat.change.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-zinc-500/10 text-zinc-400'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{stat.name}</h3>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-xl">
        <div className="p-8 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="font-bold text-white">Сүүлийн захиалгууд</h3>
          <button onClick={() => setActivePage('Захиалгууд')} className="text-xs text-teal-400 font-bold hover:underline">Бүгдийг харах</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-950/50 text-zinc-500 text-[10px] uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-4">Дугаар</th>
                <th className="px-8 py-4">Хэрэглэгч</th>
                <th className="px-8 py-4">Төлөв</th>
                <th className="px-8 py-4 text-right">Үнийн дүн</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {dashboardData?.recentOrders.map((order) => {
                return <RecentOrderComp key={order.id} {...order}></RecentOrderComp>
              })}
              {(!dashboardData?.recentOrders || dashboardData.recentOrders.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-zinc-500">Захиалга олдсонгүй.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}