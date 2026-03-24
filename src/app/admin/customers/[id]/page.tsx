"use client"
import { useState, useEffect } from "react";
import { UserStatus } from "@/generated/prisma";
import { Customer } from "@/interface/user";
import { getStatusName } from "@/utils/utils";
import Link from "next/link";

import { useParams } from "next/navigation";

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/customer/${id}`);

        if (!response.ok) {
          throw new Error("Алдаа гарлаа");
        }

        const data = await response.json();
        setCustomer(data);
      } catch (err) {
        console.error(err);
        // Алдааг handle хийх хэсэг
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchCustomer();
    }
  }, [id]);

  // Хэрэв дата ачаалж байвал Loading харуулна
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-teal-500"></div>
      </div>
    );
  }

  // Хэрэв хэрэглэгч олдохгүй бол
  if (!customer) return <div className="text-white text-center py-20">Хэрэглэгч олдсонгүй.</div>;
  const emptyOrders = !customer.orders || customer.orders.length === 0;
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-teal-400 transition-colors mb-8 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Хэрэглэгчид рүү буцах</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${customer.status === UserStatus.ACTIVE ? "bg-teal-500/10 border-teal-500/20 text-teal-400" :
                  customer.status === UserStatus.NEW ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                    "bg-red-500/10 border-red-500/20 text-red-500"
                  }`}>
                  {getStatusName(customer.status)}
                </span>
              </div>

              <div className="flex flex-col items-center text-center mt-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-3xl font-bold text-white border-2 border-zinc-700 mb-6 shadow-2xl">
                  {customer.name?.charAt(0) || "U"}
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">{customer.name}</h1>
                <p className="text-zinc-500 text-sm mb-6 font-mono">ID: #USR-{customer.id + 1000}</p>

                <div className="w-full space-y-4 text-left">
                  <div className="p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Имэйл хаяг</p>
                    <p className="text-sm text-zinc-200">{customer.email}</p>
                  </div>
                  <div className="p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Утасны дугаар</p>
                    <p className="text-sm text-zinc-200">{customer.phone ?? 'Утас байхгүй'}</p>
                  </div>
                </div>

                <button className="w-full mt-8 bg-zinc-800 hover:bg-zinc-700 text-white py-4 rounded-2xl font-bold text-sm transition-all border border-zinc-700">
                  Мэдээлэл засах
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-teal-500/10 to-blue-500/10 border border-teal-500/20 rounded-[2.5rem] p-8">
              <h3 className="text-white font-bold mb-4">Дансны хураангуй</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-zinc-500 text-xs">Нийт зарцуулалт</span>
                  <span className="text-xl font-bold text-white font-mono">₮{(customer.totalSpent ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-zinc-500 text-xs">Нийт захиалга</span>
                  <span className="text-xl font-bold text-white font-mono">{customer.totalOrders}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="lg:col-span-2 space-y-6">
            {emptyOrders ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-12 flex flex-col items-center text-center shadow-2xl">
                <div className="w-20 h-20 bg-zinc-800/50 rounded-3xl flex items-center justify-center mb-6 border border-zinc-700/50">
                  <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Захиалгын түүх хоосон байна</h3>
                <p className="text-zinc-500 text-sm max-w-[280px] leading-relaxed mb-8">
                  Энэ хэрэглэгч одоогоор ямар нэгэн захиалга хийгээгүй байна.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-4 mb-2">
                  <h3 className="text-lg font-bold text-white">Сүүлийн захиалгууд</h3>
                  <span className="text-xs text-zinc-500">{customer.orders.length} захиалга</span>
                </div>

                {customer.orders.map((order: any) => (
                  <div
                    key={order.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 hover:border-zinc-700 transition-all group"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-teal-500 group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 118 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white leading-none mb-1">
                            {order.orderNumber || `#ORD-${order.id}`}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Нийт дүн</p>
                          <p className="text-sm font-bold text-white font-mono">
                            ₮{order.totalPrice?.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 text-[10px] font-bold rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400">
                            {order.status || 'Шинэ'}
                          </span>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500 hover:bg-teal-500 hover:text-white transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}